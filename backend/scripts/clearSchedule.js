const Database = require('better-sqlite3');
const path = require('path');

console.log('🧹 Очистка расписания...\n');

// Путь к файлу БД
const dbPath = path.join(__dirname, '..', 'dev.db');

// Проверяем существование БД
const fs = require('fs');
if (!fs.existsSync(dbPath)) {
  console.error('❌ База данных не найдена:', dbPath);
  process.exit(1);
}

// Подключаемся к БД
const db = new Database(dbPath);

try {
  // Начинаем транзакцию
  db.exec('BEGIN TRANSACTION');

  // 1. Удаляем все бронирования
  const deletedBookings = db.prepare('DELETE FROM bookings').run();
  console.log(`✓ Удалено бронирований: ${deletedBookings.changes}`);

  // 2. Удаляем все занятия
  const deletedLessons = db.prepare('DELETE FROM lessons').run();
  console.log(`✓ Удалено занятий: ${deletedLessons.changes}`);

  // 3. Удаляем все шаблоны повторяющихся занятий
  const deletedRecurring = db.prepare('DELETE FROM recurring_lessons').run();
  console.log(`✓ Удалено шаблонов повторяющихся занятий: ${deletedRecurring.changes}`);

  // 4. Сбрасываем автоинкремент для таблиц (опционально, для чистоты)
  try {
    const resetSequence = db.prepare('DELETE FROM sqlite_sequence WHERE name IN (?, ?, ?)');
    resetSequence.run('bookings', 'lessons', 'recurring_lessons');
    console.log('✓ Сброшены счетчики автоинкремента');
  } catch (err) {
    // Игнорируем ошибку, если таблица sqlite_sequence не содержит эти записи
    console.log('ℹ️  Счетчики автоинкремента не требуют сброса');
  }

  // Подтверждаем транзакцию
  db.exec('COMMIT');

  console.log('\n✅ Расписание успешно очищено!');
  console.log('   Теперь вы можете создать новое расписание через админ панель.\n');

} catch (error) {
  // Откатываем транзакцию в случае ошибки
  db.exec('ROLLBACK');
  console.error('❌ Ошибка при очистке расписания:', error.message);
  process.exit(1);
} finally {
  db.close();
}



console.log('🧹 Очистка расписания...\n');

// Путь к файлу БД
const dbPath = path.join(__dirname, '..', 'dev.db');

// Проверяем существование БД
const fs = require('fs');
if (!fs.existsSync(dbPath)) {
  console.error('❌ База данных не найдена:', dbPath);
  process.exit(1);
}

// Подключаемся к БД
const db = new Database(dbPath);

try {
  // Начинаем транзакцию
  db.exec('BEGIN TRANSACTION');

  // 1. Удаляем все бронирования
  const deletedBookings = db.prepare('DELETE FROM bookings').run();
  console.log(`✓ Удалено бронирований: ${deletedBookings.changes}`);

  // 2. Удаляем все занятия
  const deletedLessons = db.prepare('DELETE FROM lessons').run();
  console.log(`✓ Удалено занятий: ${deletedLessons.changes}`);

  // 3. Удаляем все шаблоны повторяющихся занятий
  const deletedRecurring = db.prepare('DELETE FROM recurring_lessons').run();
  console.log(`✓ Удалено шаблонов повторяющихся занятий: ${deletedRecurring.changes}`);

  // 4. Сбрасываем автоинкремент для таблиц (опционально, для чистоты)
  try {
    const resetSequence = db.prepare('DELETE FROM sqlite_sequence WHERE name IN (?, ?, ?)');
    resetSequence.run('bookings', 'lessons', 'recurring_lessons');
    console.log('✓ Сброшены счетчики автоинкремента');
  } catch (err) {
    // Игнорируем ошибку, если таблица sqlite_sequence не содержит эти записи
    console.log('ℹ️  Счетчики автоинкремента не требуют сброса');
  }

  // Подтверждаем транзакцию
  db.exec('COMMIT');

  console.log('\n✅ Расписание успешно очищено!');
  console.log('   Теперь вы можете создать новое расписание через админ панель.\n');

} catch (error) {
  // Откатываем транзакцию в случае ошибки
  db.exec('ROLLBACK');
  console.error('❌ Ошибка при очистке расписания:', error.message);
  process.exit(1);
} finally {
  db.close();
}



