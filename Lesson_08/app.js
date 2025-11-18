import express from 'express';
import sequelize from './config/db.js';
import dotenv from 'dotenv';
import Book from './models/book.js';

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());

// Базовый маршрут по умолчанию
app.get('/', (_, res) => {
    res.send('Homework #8');
});

// Получение списка книг
app.get('/books', async (_req, res) => {
    try {
        const books = await Book.findAll();

        return res.json({
            message: 'Список книг',
            count: books.length,
            books,
        });
    } catch (error) {
        console.error('Ошибка при получении списка книг: ', error.message);
        return res.status(500).json({ error: 'Ошибка сервера при получении списка книг' });
    }
});

// Создание новой книги
app.post('/books', async (req, res) => {
    try {
        const { title, author, year } = req.body;

        if (!title || !author) {
            return res.status(400).json({ error: 'Поля «Название» и «Автор» обязательны' });
        }

        const newBook = await Book.create({ title, author, year });

        return res.status(201).json({
            message: 'Новая книга успешно добавлена',
            book: newBook.toJSON(),
        });
    } catch (error) {
        console.error('Ошибка при добавлении новой книги: ', error.message);
        return res.status(500).json({ error: 'Ошибка сервера при добавлении новой книги' });
    }
});

// Обновление данных книги по id
app.put('/books/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { title, author, year } = req.body;
        if (!title || !author) {
            return res.status(400).json({ error: 'Поля «Название» и «Автор» обязательны' });
        }

        const [updatedRowsCount] = await Book.update(
            { title, author, year },
            { where: { id } }
        );

        if (updatedRowsCount > 0) {
            return res.json({ message: `Данные книги c id ${id} успешно обновлены` });
        } else {
            return res.status(400).json({ error: `Книга с id ${id} не обновлена` });
        }
    } catch (error) {
        console.error('Ошибка при обновлении данных книги: ', error.message);
        return res.status(500).json({ error: 'Ошибка сервера при обновлении данных книги' });
    }
});

// Удаление книги по id
app.delete('/books/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const deletedRowsCount = await Book.destroy({ where: { id } });

        if (deletedRowsCount > 0) {
            return res.json({ message: `Книги c id ${id} успешно удалена` });
        } else {
            return res.status(400).json({ error: `Книга с id ${id} не удалена` });
        }
    } catch (error) {
        console.error('Ошибка при удалении книги: ', error.message);
        return res.status(500).json({ error: 'Ошибка сервера при удалении книги' });
    }
});

app.listen(PORT, async () => {
    try {
        await sequelize.authenticate();
        console.log('Соединение с базой данных успешно установлено');
        console.log(`Сервер запущен на http://localhost:${PORT}`);
    } catch (error) {
        console.error('Ошибка соединения с базой данных: ', error.message);
    }
});