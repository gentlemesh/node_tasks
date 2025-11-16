import connection from './db.js';

async function setup() {
    try {
        await connection.query(`
            CREATE TABLE IF NOT EXISTS products(
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                price DECIMAL(10, 2)
            )`);

        console.log('Таблица products успешно создана');
    } catch (error) {
        console.error('Ошибка при создании таблицы: ', error.message);
    } finally {
        await connection.end();
        console.log('Соединение закрыто');
    }
}

setup();