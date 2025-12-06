const path = require('path');

// Singleton для БД
let db;

function getDatabase() {
  // Если на Vercel (production), SQLite не нужен - используем Supabase
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    console.log('📦 SQLite не используется в production (используется Supabase)');
    return null;
  }

  // Пытаемся загрузить better-sqlite3 только для локальной разработки
  let Database;
  try {
    Database = require('better-sqlite3');
  } catch (error) {
    console.warn('⚠️  better-sqlite3 не установлен. Используйте Supabase для production.');
    return null;
  }

  if (!db) {
    try {
      const dbPath = path.join(__dirname, '..', '..', 'dev.db');
      db = new Database(dbPath);
      // Включаем поддержку внешних ключей
      db.pragma('foreign_keys = ON');
      console.log('✅ Подключение к базе данных SQLite успешно');
    } catch (error) {
      console.error('❌ Ошибка подключения к базе данных:', error);
      throw error;
    }
  }
  return db;
}

module.exports = getDatabase();
