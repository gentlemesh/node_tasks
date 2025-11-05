const http = require('http');
require('dotenv').config();

const PORT = process.env.PORT;

// Создаём сервер
const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf8');

    if (req.method === 'PUT' || req.method === 'DELETE') {
        res.statusCode = 200;
        res.end(`${req.method}-запрос обработан`);

        return;
    }

    res.statusCode = 405;
    res.end('Метод не поддерживается');
});

// Запускаем и прослушиваем HTTP-сервер на нужном порту
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});