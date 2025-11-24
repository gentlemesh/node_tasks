import express from 'express';
import sequelize from './config/db.js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from './models/user.js';
import { checkUserActualPasswordMiddleware } from './middleware/checkUserActualPasswordMiddleware.js';
import { authenticateJWT } from './middleware/authenticateJWT.js';
import { authorizeRole } from './middleware/authorizeRole.js';

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
        const { email, password, role } = req.body;
        const isExists = await User.count({ where: { email } });
        if (isExists) {
            return res.status(400).json({ error: 'Пользователь с таким email уже зарегистрирован' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = await User.create({ email, password: passwordHash, role });

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

        const isMatch = await bcrypt.compare(password, req.user.password);
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

// Раздел, доступный только админам
app.get('/admin', authenticateJWT, authorizeRole('admin'), (_req, res) => {
    res.json({ message: 'Добро пожаловать в раздел для администраторов!' });
});

// Маршрут для изменения email
app.post('/change-email', async (req, res) => {
    try {
        const { email, newEmail, password } = req.body;
        if (!newEmail) {
            return res.status(400).json({ error: 'Не указан новый email' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Неверный пароль' });
        }

        const isNewEmailExists = await User.count({ where: { email: newEmail } });
        if (isNewEmailExists) {
            return res.status(400).json({ error: `Пользователь с email "${newEmail}" уже существует` });
        }

        const [updatedRowsCount] = await User.update(
            { email: newEmail },
            { where: { id: user.id } }
        );
        if (updatedRowsCount > 0) {
            return res.json({ message: `Email успешно изменён на ${newEmail}` });
        } else {
            return res.status(400).json({ error: 'Не удалось обновить email' });
        }

    } catch (error) {
        console.error('Ошибка при попытке обновления email: ', error.message);
        return res.status(500).json({ error: 'Ошибка сервера при попытке обновления email' });
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