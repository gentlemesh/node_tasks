import express from 'express';
import dotenv from 'dotenv';
import { connectDB, getDB } from './db/index.js';
import { ObjectId } from 'mongodb';

dotenv.config();

const PORT = process.env.PORT || 3000;
const ITEMS_COLLECTION = 'products';

const app = express();

app.use(express.json());

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Сервер запущен на http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Не получилось запустить сервер и подключиться к MongoDB', err.message);
    });

app.get('/', (_req, res) => {
    res.send('Homework 12');
});

// Создание нового товара
app.post('/products', async (req, res) => {
    try {
        const db = getDB();

        const name = req.body.name;
        if (!name) {
            return res.status(422).json({ error: 'Не заполнено название товара' });
        }

        const description = req.body.description;
        if (!description) {
            return res.status(422).json({ error: 'Не заполнено описание товара' });
        }

        const price = +req.body.price;
        if (Number.isNaN(price)) {
            return res.status(422).json({ error: 'Цена товара должна быть числом' });
        }
        if (price < 0) {
            return res.status(422).json({ error: 'Цена товара не может быть ниже нуля' });
        }

        const result = await db.collection(ITEMS_COLLECTION).insertOne({ name, price, description });
        if (result.acknowledged) {
            return res.status(201).json({ id: result.insertedId, name, price, description });
        } else {
            return res.status(400).json({ error: 'Ошибка сервера при создании нового товара' });
        }
    } catch (error) {
        console.error('Ошибка при попытке создания нового товара: ', error.message);
        return res.status(500).json({ error: 'Ошибка сервера при попытке создания нового товара' });
    }
});

// Получение списка всех товаров
app.get('/products', async (_req, res) => {
    try {
        const db = getDB();

        const products = await db.collection(ITEMS_COLLECTION).find().toArray();

        return res.json({ products });
    } catch (error) {
        console.error('Ошибка при попытке получения списка товаров: ', error.message);
        return res.status(500).json({ error: 'Ошибка сервера при попытке получения списка товаров' });
    }
});

// Получение конкретного товара по ID
app.get('/products/:id', async (req, res) => {
    try {
        const db = getDB();

        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Некорректный id товара' });
        }

        const product = await db.collection(ITEMS_COLLECTION).findOne({ _id: new ObjectId(id) });
        if (!product) {
            return res.status(404).json({ error: 'Товар не найден' });
        }

        return res.json({ product });
    } catch (error) {
        console.error(`Ошибка при попытке получения товара c id "${id}": `, error.message);
        return res.status(500).json({ error: `Ошибка сервера при попытке получения товара c id "${id}"` });
    }
});

// Обновление товара по ID
app.put('/products/:id', async (req, res) => {
    try {
        const db = getDB();

        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Некорректный id товара' });
        }

        const name = req.body.name;
        if (!name) {
            return res.status(422).json({ error: 'Не заполнено название товара' });
        }

        const description = req.body.description;
        if (!description) {
            return res.status(422).json({ error: 'Не заполнено описание товара' });
        }

        const price = +req.body.price;
        if (Number.isNaN(price)) {
            return res.status(422).json({ error: 'Цена товара должна быть числом' });
        }
        if (price < 0) {
            return res.status(422).json({ error: 'Цена товара не может быть ниже нуля' });
        }

        const result = await db.collection(ITEMS_COLLECTION).updateOne(
            { _id: new ObjectId(id) },
            { $set: { name, price, description } }
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Товар не найден' });
        }

        return res.json({ message: 'Товар успешно обновлён' });
    } catch (error) {
        console.error(`Ошибка при попытке обновления товара c id "${id}": `, error.message);
        return res.status(500).json({ error: `Ошибка сервера при попытке обновления товара c id "${id}"` });
    }
});

// Удаление товара по ID
app.delete('/products/:id', async (req, res) => {
    try {
        const db = getDB();

        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Некорректный id товара' });
        }

        const result = await db.collection(ITEMS_COLLECTION).deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Товар не найден' });
        }

        return res.json({ message: 'Товар успешно удалён' });
    } catch (error) {
        console.error(`Ошибка при попытке удаления товара c id "${id}": `, error.message);
        return res.status(500).json({ error: `Ошибка сервера при попытке удаления товара c id "${id}"` });
    }
});