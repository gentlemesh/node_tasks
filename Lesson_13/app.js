import connectDB from './db/connect.js';
import express from 'express';
import dotenv from 'dotenv';

import Publisher from './models/Publisher.js';
import Magazine from './models/Magazine.js';
import Article from './models/Article.js';
import Tag from './models/Tag.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.get('/', (_req, res) => {
    return res.json({ message: 'It Works!' });
});

// Here be routes

app.listen(PORT, async () => {
    try {
        await connectDB();
        console.log(`Сервер запущен на http://localhost:${PORT}`);
    } catch (error) {
        console.error('Ошибка при запуске сервера: ', error.message);
    }
});