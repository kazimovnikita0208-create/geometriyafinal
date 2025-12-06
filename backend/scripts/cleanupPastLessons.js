// Очистка прошедших занятий и связанных данных
const db = require('../src/config/database');

console.log('🧹 Очистка прошедших занятий\n');

// Получаем текущую дату в локальном времени
const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

console.log(`Текущая дата: ${todayStr}\n`);

// Находим все прошедшие занятия (дата < сегодня)
const pastLessons = db.prepare(`
  SELECT id, lesson_date, start_time, end_time, current_bookings
  FROM lessons
  WHERE lesson_date < ?
  ORDER BY lesson_date DESC, start_time DESC
`).all(todayStr);

console.log(`Найдено ${pastLessons.length} прошедших занятий\n`);

if (pastLessons.length > 0) {
  let deletedBookings = 0;
  let deletedLessons = 0;
  
  const deleteBookingStmt = db.prepare('DELETE FROM bookings WHERE lesson_id = ?');
  const deleteLessonStmt = db.prepare('DELETE FROM lessons WHERE id = ?');
  
  // Удаляем каждое прошедшее занятие и связанные бронирования
  for (const lesson of pastLessons) {
    // Удаляем бронирования
    const bookingResult = deleteBookingStmt.run(lesson.id);
    deletedBookings += bookingResult.changes;
    
    // Удаляем занятие
    deleteLessonStmt.run(lesson.id);
    deletedLessons++;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`  Удалено занятие ID ${lesson.id}: ${lesson.lesson_date} ${lesson.start_time}-${lesson.end_time} (${lesson.current_bookings} бронирований)`);
    }
  }
  
  console.log(`\n✅ Удалено:`);
  console.log(`   Занятий: ${deletedLessons}`);
  console.log(`   Бронирований: ${deletedBookings}\n`);
} else {
  console.log('✅ Прошедших занятий не найдено\n');
}

// Также удаляем неактивные шаблоны и связанные с ними занятия
console.log('🧹 Очистка неактивных шаблонов\n');

const inactiveTemplates = db.prepare(`
  SELECT id FROM recurring_lessons WHERE is_active = 0
`).all();

if (inactiveTemplates.length > 0) {
  console.log(`Найдено ${inactiveTemplates.length} неактивных шаблонов\n`);
  
  let deletedTemplateLessons = 0;
  let deletedTemplateBookings = 0;
  let deletedTemplates = 0;
  
  const deleteTemplateBookingStmt = db.prepare('DELETE FROM bookings WHERE lesson_id IN (SELECT id FROM lessons WHERE recurring_lesson_id = ?)');
  const deleteTemplateLessonStmt = db.prepare('DELETE FROM lessons WHERE recurring_lesson_id = ?');
  const deleteTemplateStmt = db.prepare('DELETE FROM recurring_lessons WHERE id = ?');
  
  for (const template of inactiveTemplates) {
    // Удаляем бронирования для занятий из этого шаблона
    const bookingResult = deleteTemplateBookingStmt.run(template.id);
    deletedTemplateBookings += bookingResult.changes;
    
    // Удаляем занятия из этого шаблона
    const lessonResult = deleteTemplateLessonStmt.run(template.id);
    deletedTemplateLessons += lessonResult.changes;
    
    // Удаляем сам шаблон
    deleteTemplateStmt.run(template.id);
    deletedTemplates++;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`  Удален шаблон ID ${template.id} (${lessonResult.changes} занятий, ${bookingResult.changes} бронирований)`);
    }
  }
  
  console.log(`\n✅ Удалено:`);
  console.log(`   Шаблонов: ${deletedTemplates}`);
  console.log(`   Занятий: ${deletedTemplateLessons}`);
  console.log(`   Бронирований: ${deletedTemplateBookings}\n`);
} else {
  console.log('✅ Неактивных шаблонов не найдено\n');
}

// Удаляем занятия, которые ссылаются на несуществующие шаблоны
console.log('🧹 Очистка занятий с несуществующими шаблонами\n');

const orphanLessons = db.prepare(`
  SELECT l.id, l.lesson_date, l.start_time, l.recurring_lesson_id
  FROM lessons l
  LEFT JOIN recurring_lessons rl ON l.recurring_lesson_id = rl.id
  WHERE l.recurring_lesson_id IS NOT NULL AND rl.id IS NULL
`).all();

if (orphanLessons.length > 0) {
  console.log(`Найдено ${orphanLessons.length} занятий с несуществующими шаблонами\n`);
  
  let deletedOrphanBookings = 0;
  let deletedOrphanLessons = 0;
  
  const deleteOrphanBookingStmt = db.prepare('DELETE FROM bookings WHERE lesson_id = ?');
  const deleteOrphanLessonStmt = db.prepare('DELETE FROM lessons WHERE id = ?');
  
  for (const lesson of orphanLessons) {
    const bookingResult = deleteOrphanBookingStmt.run(lesson.id);
    deletedOrphanBookings += bookingResult.changes;
    
    deleteOrphanLessonStmt.run(lesson.id);
    deletedOrphanLessons++;
  }
  
  console.log(`\n✅ Удалено:`);
  console.log(`   Занятий: ${deletedOrphanLessons}`);
  console.log(`   Бронирований: ${deletedOrphanBookings}\n`);
} else {
  console.log('✅ Занятий с несуществующими шаблонами не найдено\n');
}

console.log('✅ Очистка завершена\n');

process.exit(0);




