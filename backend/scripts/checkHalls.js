/**
 * Проверка данных в таблице halls
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'dev.db');
const db = new Database(dbPath);

console.log('🔍 Проверка залов в SQLite:\n');

const halls = db.prepare('SELECT * FROM halls ORDER BY id').all();

console.log(`Всего залов в SQLite: ${halls.length}\n`);

halls.forEach((hall, index) => {
  console.log(`${index + 1}. ID: ${hall.id}`);
  console.log(`   Название: ${hall.name}`);
  console.log(`   Адрес: ${hall.address}`);
  console.log(`   Вместимость: ${hall.capacity}`);
  console.log(`   Пилоны: ${hall.has_poles ? 'Да' : 'Нет'} (${hall.pole_count} шт.)`);
  console.log(`   Цена за час: ${hall.price_per_hour}`);
  console.log(`   Активен: ${hall.is_active ? 'Да' : 'Нет'}`);
  console.log('');
});

db.close();

