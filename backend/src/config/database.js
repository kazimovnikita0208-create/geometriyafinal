const Database = require('better-sqlite3');
const path = require('path');

// Путь к базе данных
const dbPath = path.join(__dirname, '..', '..', 'dev.db');

// Singleton для БД
let db;

function getDatabase() {
  if (!db) {
    try {
      db = new Database(dbPath);
      // Включаем поддержку внешних ключей
      db.pragma('foreign_keys = ON');
      console.log('✅ Подключение к базе данных успешно');
    } catch (error) {
      console.error('❌ Ошибка подключения к базе данных:', error);
      throw error;
    }
  }
  return db;
}

module.exports = getDatabase();
