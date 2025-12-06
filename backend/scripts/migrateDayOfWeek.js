// Миграция: обновление day_of_week из старой системы (0-6) в новую (1-7)
// Старая система: 0=Вс, 1=Пн, 2=Вт, 3=Ср, 4=Чт, 5=Пт, 6=Сб
// Новая система: 1=Пн, 2=Вт, 3=Ср, 4=Чт, 5=Пт, 6=Сб, 7=Вс

const db = require('../src/config/database');

console.log('🔄 Начинаем миграцию day_of_week...');

try {
  // Получаем все шаблоны
  const templates = db.prepare('SELECT id, day_of_week FROM recurring_lessons').all();
  
  console.log(`Найдено ${templates.length} шаблонов`);
  
  let updated = 0;
  let skipped = 0;
  
  for (const template of templates) {
    const oldValue = template.day_of_week;
    
    // Если значение уже в новой системе (1-7), пропускаем
    if (oldValue >= 1 && oldValue <= 7) {
      console.log(`✓ Шаблон ID ${template.id}: day_of_week = ${oldValue} (уже в новой системе)`);
      skipped++;
      continue;
    }
    
    // Конвертируем из старой системы (0-6) в новую (1-7)
    let newValue;
    if (oldValue === 0) {
      newValue = 7; // Воскресенье: 0 -> 7
    } else if (oldValue >= 1 && oldValue <= 6) {
      newValue = oldValue; // Понедельник-Суббота: 1-6 -> 1-6
    } else {
      console.log(`⚠️ Шаблон ID ${template.id}: некорректное значение day_of_week = ${oldValue}, пропускаем`);
      continue;
    }
    
    // Обновляем в базе данных
    db.prepare('UPDATE recurring_lessons SET day_of_week = ? WHERE id = ?').run(newValue, template.id);
    console.log(`✓ Шаблон ID ${template.id}: day_of_week ${oldValue} -> ${newValue}`);
    updated++;
  }
  
  console.log(`\n✅ Миграция завершена:`);
  console.log(`   Обновлено: ${updated}`);
  console.log(`   Пропущено: ${skipped}`);
  
} catch (error) {
  console.error('❌ Ошибка миграции:', error);
  process.exit(1);
}

process.exit(0);




