const fs = require('fs');

fs.writeFile('./info.txt', 'Node.js is awesome!', err => {
    if (err) {
        return console.error('Ошибка при создании файла "info.txt": ', err);
    }
    console.log('Успешно создан файл "info.txt"');

    fs.readFile('./info.txt', 'utf-8', (err, data) => {
        if (err) {
            return console.error('Ошибка при чтении файла "info.txt": ', err);
        }
        console.log('Результат чтения файла "info.txt": ', data);
    });
});