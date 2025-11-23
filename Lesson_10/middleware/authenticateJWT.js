import jwt from 'jsonwebtoken';

export function authenticateJWT(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Токен отсутствует' });
        }

        const token = authHeader.substring(7);
        if (!token) {
            return res.status(401).json({ error: 'Токен некорректный' });
        }

        // Декодирование токена
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        next();
    } catch (error) {
        console.error('Ошибка JWT: ', error.message);
        return res.status(401).json({ error: 'Токен некорректный или просрочен' });
    }
}