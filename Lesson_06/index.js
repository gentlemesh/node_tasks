import express from 'express';
import connection from './db.js';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res, next) => {
    try {
        res.send('Hello, World!');
    } catch (error) {
        next(error);
    }
});

app.post('/', (req, res, next) => {
    try {
        if (Object.keys(req.body).length === 0) {
            throw new Error('Данные не отправлены');
        }
        res.send(req.body);
    } catch (error) {
        next(error);
    }
});

app.get('/products', async (_, res) => {
    try {
        const [rows] = await connection.query('SELECT * FROM products');
        res.json(rows);
    } catch (error) {
        next(error);
    }
});

app.post('/products', async (req, res) => {
    try {
        const { name, price } = req.body;

        if (!name || !price) {
            return res.status(400).json({ error: 'Не указано название товара или его цена' });
        }

        await connection.query('INSERT INTO products (name, price) VALUES (?, ?)', [name, price]);

        res.status(201).json({ message: 'Товар добавлен' });
    } catch (error) {
        next(error);
    }
});

app.use((err, req, res, next) => {
    console.error('Ошибка: ', err.message);
    res.
        status(err.status || 500)
        .json({ error: err.message || 'Внутренняя ошибка сервера' })
        ;
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});