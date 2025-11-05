const http = require('http');
const fs = require('fs');
require('dotenv').config();

const PORT = process.env.PORT;

// Создаём сервер
const server = http.createServer((_, res) => {
    res.setHeader('Content-Type', 'text/plain');

    try {
        throw new Error('Это ошибка!');
    } catch (error) {
        fs.appendFile('./errors.log', `${error.message}\n`, err => {
            if (err) {
                console.error('Ошибка при записи файла "errors.log": ', err);
            }
        });

        res.statusCode = 500;
        res.end('Internal Server Error');
    }
});

// Запускаем и прослушиваем HTTP-сервер на нужном порту
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});