const fs = require('fs');
const path = require('path');

const myFolderPath = path.join(__dirname, 'myFolder');
fs.mkdir(myFolderPath, err => {
    if (err && err.code !== 'EEXIST') {
        return console.error(`Ошибка при создании каталога "${myFolderPath}": `, err);
    }
    console.log(`Успешно создан каталог "${myFolderPath}"`);

    fs.rmdir(myFolderPath, err => {
        if (err) {
            return console.error(`Ошибка при удалении каталога "${myFolderPath}": `, err);
        }
        console.log(`Успешно удалён каталог "${myFolderPath}"`);
    });
});