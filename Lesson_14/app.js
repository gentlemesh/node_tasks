import connectDB from './db/connect.js';
import express from 'express';
import dotenv from 'dotenv';
import { body, validationResult } from 'express-validator';
import { ObjectId } from 'mongodb';

import Category from './models/Category.js';
import Product from './models/Product.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.get('/', (_req, res) => {
    return res.json({ message: 'Homework 14' });
});

app.get('/categories', async (_req, res) => {
    try {
        const foundCategories = await Category.find().exec();
        return res.json({ categories: foundCategories });
    } catch (error) {
        console.log('Ошибка при получении категорий: ', error.message);
        return res.status(500).json({ error: 'Ошибка сервера при получении категорий' });
    }
});

app.post('/categories', [
    body('name').trim()
        .notEmpty().withMessage('Не заполнено имя категории')
    ,
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        const { name } = req.body;

        const createdCategory = await Category.create({ name });
        return res.status(201).json(createdCategory);
    } catch (error) {
        console.log('Ошибка при создании категории: ', error.message);
        return res.status(500).json({ error: 'Ошибка сервера при создании категории' });
    }
});

app.get('/products', async (_req, res) => {
    try {
        const foundProducts = await Product.find().populate('category').exec();
        return res.json({ products: foundProducts });
    } catch (error) {
        console.log('Ошибка при получении товаров: ', error.message);
        return res.status(500).json({ error: 'Ошибка сервера при получении товаров' });
    }
});

app.post('/products', [
    body('name').trim()
        .notEmpty().withMessage('Не заполнено имя товара')
    ,
    body('price').trim()
        .notEmpty().withMessage('Не заполнена цена товара')
        .isNumeric().withMessage('Цена товара должна быть числом')
        .custom(price => price > 0).withMessage('Цена должна быть больше 0')
    ,
    body('category').trim()
        .notEmpty().withMessage('Не заполнена категория товара')
        .custom(categoryId => ObjectId.isValid(categoryId)).withMessage('Id категории некорректный')
    ,
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        const { name, price, category } = req.body;

        const createdProduct = await Product.create({ name, price, category });
        return res.status(201).json(createdProduct);
    } catch (error) {
        console.log('Ошибка при создании товара: ', error.message);
        return res.status(500).json({ error: 'Ошибка сервера при создании товара' });
    }
});

app.listen(PORT, async () => {
    try {
        await connectDB();
        console.log(`Сервер запущен на http://localhost:${PORT}`);
    } catch (error) {
        console.error('Ошибка при запуске сервера: ', error.message);
    }
});