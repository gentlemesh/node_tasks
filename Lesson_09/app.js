import express from 'express';
import sequelize from './config/db.js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from './models/user.js';
import { checkUserActualPasswordMiddleware } from './middleware/checkUserActualPasswordMiddleware.js';
import { authenticateJWT } from './middleware/authenticateJWT.js';

dotenv.config();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('Не установлено значение переменной окружения JWT_SECRET!');
}

const app = express();

app.use(express.json());

// Базовый маршрут по умолчанию
app.get('/', (_, res) => {
    res.send('Homework #9');
});

// Общий метод получения токена для пользователя
const getTokenForUser = (user, expiresIn = '1h') => jwt.sign(
    {
        id: user.id,
        email: user.email,
        password: user.password,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
    },
    JWT_SECRET,
    { expiresIn }
);

// Маршрут регистрации нового пользователя
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const isExists = await User.count({ where: { email } });
        if (isExists) {
            return res.status(400).json({ error: 'Пользователь с таким email уже зарегистрирован' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = await User.create({ email, password: passwordHash });

        res.status(201).json({
            message: 'Пользователь успешно зарегистрирован',
            user: newUser.toJSON(),
        });
    } catch (error) {
        console.error('Ошибка при регистрации нового пользователя: ', error.message);
        return res.status(500).json({ error: 'Ошибка сервера при регистрации нового пользователя' });
    }
});

// Маршрут аутентификации
app.post('/login', checkUserActualPasswordMiddleware, async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ error: 'Нужно указать пароль' });
        }

        const isMatch = await bcrypt.compare(password, req.user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        res.json({
            message: 'Login success',
            token: getTokenForUser(req.user),
        });
    } catch (error) {
        console.error('Ошибка при попытке авторизации: ', error.message);
        return res.status(500).json({ error: 'Ошибка сервера при попытке авторизации' });
    }
});

app.post('/change-password', (req, res) => {
    return res.json({ message: `Нужно обновить пароль`, user: req.user });
});

// Маршрут удаления учётной записи пользователя
app.post('/delete-account', authenticateJWT, async (req, res) => {
    try {
        const password = req.body?.password;
        if (!password) {
            return res.status(400).json({ error: 'Не указан пароль' });
        }
        console.log('password', password);
        console.log('req.user.password', req.user.password);

        const isMatch = await bcrypt.compare(password, req.user.password);
        console.log('isMatch', isMatch);
        if (!isMatch) {
            return res.status(401).json({ error: 'Неверный пароль' });
        }

        const deletedRowsCount = await User.destroy({ where: { id: req.user.id } });
        if (deletedRowsCount > 0) {
            return res.json({ message: 'Ваша учётная запись успешно удалена' });
        } else {
            return res.status(400).json({ error: 'Ваша учётная запись не удалена' });
        }
    } catch (error) {
        console.error('Ошибка при попытке удаления учётной записи: ', error.message);
        return res.status(500).json({ error: 'Ошибка сервера при попытке удаления учётной записи' });
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