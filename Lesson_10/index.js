import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { authenticateJWT } from './middleware/authenticateJWT.js';
import { authorizeRole } from './middleware/authorizeRole.js';

dotenv.config();

const users = [
    {
        id: 1,
        username: 'user',
        email: 'user@test.local',
        password: await bcrypt.hash('111', 10),
        role: 'user',
    },
    {
        id: 2,
        username: 'admin',
        email: 'admin@test.local',
        password: await bcrypt.hash('admin', 10),
        role: 'admin',
    },
];

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('Не установлено значение переменной окружения JWT_SECRET!');
}

const app = express();

app.use(express.json());

const getTokenForUser = (user, expiresIn = '10s') => jwt.sign(
    {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
    },
    JWT_SECRET,
    { expiresIn }
);

// Маршрут аутентификации пользователей
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Имя пользователя и пароль обязательны' });
        }

        const user = users.find(user => user.username === username);
        if (!user) {
            return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Неверное имя пользователя или пароль' })
        }

        return res.json({ token: getTokenForUser(user) });
    } catch (error) {
        console.error('Ошибка при попытке авторизации: ', error.message);
        return res.status(500).json({ error: 'Ошибка сервера при попытке авторизации' });
    }
});

// Обновление email текущего пользователя
app.post('/update-email', authenticateJWT, (req, res) => {
    try {
        const { newEmail } = req.body;
        if (!newEmail) {
            return res.status(400).json({ error: 'Не указан новый email' });
        }

        users.forEach((user, i) => {
            if (user.id === req.user.id) {
                users[i].email = newEmail;
                req.user.email = newEmail;
                return;
            }
        });

        return res.json({
            message: `Email текущего пользователя обновлён на ${newEmail}`,
            user: req.user,
        });
    } catch (error) {
        console.error('Ошибка при попытке обновления email: ', error.message);
        return res.status(500).json({ error: 'Ошибка сервера при попытке обновления email' });
    }
});

// Удаление текущего пользователя
app.delete('/delete-account', authenticateJWT, (req, res) => {
    try {
        console.log('Обновлённый массив пользователей', users.filter(user => user.id !== req.user.id));

        return res.json({ message: 'Пользователь успешно удалён' });
    } catch (error) {
        console.error('Ошибка при попытке удаления пользователя: ', error.message);
        return res.status(500).json({ error: 'Ошибка сервера при попытке удаления пользователя' });
    }
});

// Обновление роли произвольного пользователя (доступно только администраторам)
app.post('/update-role', authenticateJWT, authorizeRole('admin'), (req, res) => {
    try {
        const { userId, newRole } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'Не указан id целевого пользователя' });
        }
        if (!newRole || !['user', 'admin'].includes(newRole)) {
            return res.status(400).json({ error: 'Новая роль не указана или указана неверно' });
        }

        const user = users.find(user => user.id === userId);
        if (!user) {
            return res.status(404).json({ error: `Пользователь с id ${userId} не найден` });
        }

        user.role = newRole;
        console.log(users);
        return res.json({ message: `Роль пользователя с id ${userId} успешно обновлена` });
    } catch (error) {
        console.error('Ошибка при попытке изменения роли пользователя: ', error.message);
        return res.status(500).json({ error: 'Ошибка сервера при попытке изменения роли пользователя' });
    }
});

// Обновление токена текущего пользователя
app.get('/refresh-token', authenticateJWT, (req, res) => {
    try {
        return res.json({ token: getTokenForUser(req.user) });
    } catch (error) {
        console.error('Ошибка при попытке обновления токена авторизации пользователя: ', error.message);
        return res.status(500).json({ error: 'Ошибка сервера при попытке обновления токена авторизации пользователя' });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});