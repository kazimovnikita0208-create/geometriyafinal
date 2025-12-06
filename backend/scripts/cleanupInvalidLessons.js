// Очистка занятий из некорректных шаблонов
const db = require('../src/config/database');

console.log('🧹 Очистка занятий из некорректных шаблонов\n');

// Находим все занятия, которые ссылаются на шаблоны с NULL day_of_week или неактивные шаблоны
const invalidLessons = db.prepare(`
  SELECT l.id, l.lesson_date, l.start_time, l.recurring_lesson_id, rl.day_of_week, rl.is_active
  FROM lessons l
  LEFT JOIN recurring_lessons rl ON l.recurring_lesson_id = rl.id
  WHERE l.recurring_lesson_id IS NOT NULL 
  AND (rl.day_of_week IS NULL OR rl.is_active = 0 OR rl.id IS NULL)
`).all();

console.log(`Найдено ${invalidLessons.length} занятий из некорректных шаблонов:\n`);

invalidLessons.forEach(lesson => {
  console.log(`  ID: ${lesson.id}, дата: ${lesson.lesson_date}, время: ${lesson.start_time}, шаблон ID: ${lesson.recurring_lesson_id}`);
});

if (invalidLessons.length > 0) {
  console.log(`\nУдаляем эти занятия...\n`);
  
  const deleteStmt = db.prepare('DELETE FROM lessons WHERE id = ?');
  const deleteBookingStmt = db.prepare('DELETE FROM bookings WHERE lesson_id = ?');
  
  let deletedCount = 0;
  
  for (const lesson of invalidLessons) {
    // Удаляем бронирования
    deleteBookingStmt.run(lesson.id);
    // Удаляем занятие
    deleteStmt.run(lesson.id);
    deletedCount++;
  }
  
  console.log(`✅ Удалено ${deletedCount} занятий и связанных бронирований\n`);
} else {
  console.log('✅ Некорректных занятий не найдено\n');
}

// Также удаляем неактивные шаблоны
const inactiveTemplates = db.prepare('SELECT id FROM recurring_lessons WHERE is_active = 0').all();

if (inactiveTemplates.length > 0) {
  console.log(`Найдено ${inactiveTemplates.length} неактивных шаблонов. Удаляем...\n`);
  const deleteTemplateStmt = db.prepare('DELETE FROM recurring_lessons WHERE id = ?');
  let deletedTemplates = 0;
  for (const template of inactiveTemplates) {
    deleteTemplateStmt.run(template.id);
    deletedTemplates++;
  }
  console.log(`✅ Удалено ${deletedTemplates} неактивных шаблонов\n`);
}

process.exit(0);




