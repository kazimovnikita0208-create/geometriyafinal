const Database = require('better-sqlite3');
const path = require('path');

console.log('🔄 Обновление таблицы subscriptions...\n');

// Путь к файлу БД
const dbPath = path.join(__dirname, '..', 'dev.db');
const db = new Database(dbPath);

try {
  // Проверяем, есть ли колонка address
  const tableInfo = db.prepare("PRAGMA table_info(subscriptions)").all();
  const hasAddress = tableInfo.some(col => col.name === 'address');
  const hasUpdatedAt = tableInfo.some(col => col.name === 'updated_at');

  if (!hasAddress) {
    console.log('Добавляем колонку address...');
    db.prepare('ALTER TABLE subscriptions ADD COLUMN address TEXT').run();
    console.log('✓ Колонка address добавлена');
  } else {
    console.log('✓ Колонка address уже существует');
  }

  if (!hasUpdatedAt) {
    console.log('Добавляем колонку updated_at...');
    db.prepare('ALTER TABLE subscriptions ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP').run();
    console.log('✓ Колонка updated_at добавлена');
  } else {
    console.log('✓ Колонка updated_at уже существует');
  }

  db.close();
  console.log('\n🎉 Таблица успешно обновлена!\n');

} catch (error) {
  console.error('❌ Ошибка при обновлении таблицы:', error);
  process.exit(1);
}

