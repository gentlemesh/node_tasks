import User from '../models/user.js';

export async function checkUserActualPasswordMiddleware(req, res, next) {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Нужно указать email' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        req.user = user;

        if (user.mustChangePassword) {
            return res.redirect(308, '/change-password');
        }

        next();
    } catch (error) {
        console.error('Ошибка при проверке статуса актуальности пароля: ', error.message);
        return res.status(500).json({ error: 'Ошибка сервера при проверке данных регистрации' });
    }
}