const fs = require('fs').promises;

const filePath = './log.txt';

async function logMessage(msg) {
    try {
        await fs.appendFile(filePath, `${msg}\n`);
    } catch (err) {
        console.log('Ошибка при записи в лог: ', err);
    }
}

module.exports = {
    logMessage,
}