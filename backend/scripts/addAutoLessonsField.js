// Миграция: добавление поля auto_lessons для хранения конкретных занятий
const db = require('../src/config/database');

console.log('🔄 Добавление поля auto_lessons в таблицу subscriptions...\n');

try {
  // Проверяем, существует ли уже поле
  const tableInfo = db.prepare("PRAGMA table_info(subscriptions)").all();
  const hasAutoLessons = tableInfo.some(col => col.name === 'auto_lessons');
  
  if (hasAutoLessons) {
    console.log('✅ Поле auto_lessons уже существует\n');
  } else {
    // Добавляем поле
    db.prepare(`
      ALTER TABLE subscriptions 
      ADD COLUMN auto_lessons TEXT
    `).run();
    
    console.log('✅ Поле auto_lessons успешно добавлено\n');
    console.log('📝 Поле будет хранить JSON массив конкретных занятий:');
    console.log('   [{ day_of_week: 2, direction_id: 1, start_time: "20:00", end_time: "21:00", trainer_id?: 1, hall_id?: 2 }, ...]\n');
  }
  
  process.exit(0);
} catch (error) {
  console.error('❌ Ошибка при добавлении поля:', error.message);
  process.exit(1);
}




