/**
 * Конфигурация базы данных SQLite
 */

const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../database/geometriya.db');

let db;

/**
 * Получить подключение к базе данных
 */
function getDatabase() {
  if (!db) {
    db = new Database(dbPath, {
      verbose: process.env.NODE_ENV === 'development' ? console.log : null
    });
    
    // Включить внешние ключи
    db.pragma('foreign_keys = ON');
    
    console.log(`✅ Подключение к базе данных: ${dbPath}`);
  }
  
  return db;
}

/**
 * Закрыть подключение к базе данных
 */
function closeDatabase() {
  if (db) {
    db.close();
    console.log('🔒 База данных закрыта');
  }
}

module.exports = {
  getDatabase,
  closeDatabase
};

