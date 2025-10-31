require('dotenv').config();
const fs = require('fs');

const filename = process.env.FILENAME;

fs.writeFile(filename, 'любой текст', err => {
    if (err) {
        return console.error(`Ошибка при создании файла "${filename}": `, err);
    }
    console.log(`Успешно создан файл "${filename}"`);

    fs.readFile(filename, 'utf-8', (err, data) => {
        if (err) {
            return console.error(`Ошибка при чтении файла "${filename}": `, err);
        }
        console.log(`Результат чтения файла "${filename}": `, data);
    });
});