import express from 'express';
import sequelize from './config/db.js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from './models/user.js';
import { checkUserActualPasswordMiddleware } from './middleware/checkUserActualPasswordMiddleware.js';

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
        username: user.username,
        email: user.email,
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

app.post('/change-password-form', (_, res) => {
    res.send(`
        <html>
            <body>
                <form id="password_change_form" method="post" action="/change-password">
                    <label>Старый пароль: <input type="password" name="oldPassword" /></label>
                    <label>Новый пароль: <input type="password" name="newPassword" /></label>
                    <button type="submit">Сменить пароль</button>
                </form>
            </body>
        </html>
    `);
});

app.post('/change-password', async (req, res) => {
    console.log('/change-password');
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ error: 'Нужно указать новый и старый пароли' });
        }

        const oldPasswordHash = await bcrypt.hash(oldPassword, 10);
        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        const [updatedRowsCount] = await User.update(
            { password: newPasswordHash, mustChangePassword: false },
            { where: { password: oldPasswordHash } }
        );

        if (updatedRowsCount > 0) {
            console.log('Успешно!', { oldPassword, newPassword });
            return res.json({ message: `Пароль успешно обновлён` });
        } else {
            console.log('НЕ Успешно!', { oldPassword, newPassword });
            return res.status(400).json({ error: `Пароль не обновлён` });
        }
    } catch (error) {
        console.error('Ошибка при обновлении пароля: ', error.message);
        return res.status(500).json({ error: 'Ошибка сервера при обновлении пароля' });
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