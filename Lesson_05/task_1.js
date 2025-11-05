const http = require('http');
require('dotenv').config();

const PORT = process.env.PORT;

// Создаём сервер
const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'text/plain');

    const auth = req.headers.authorization?.trim();

    if (!auth) {
        res.statusCode = 401;
        res.end('Unauthorized');

        return;
    }

    res.statusCode = 200;
    res.end('Authorization header received');
});

// Запускаем и прослушиваем HTTP-сервер на нужном порту
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});