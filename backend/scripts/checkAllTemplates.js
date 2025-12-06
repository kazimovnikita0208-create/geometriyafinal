// Проверка ВСЕХ шаблонов (включая неактивные)
const db = require('../src/config/database');

console.log('🔄 Проверка ВСЕХ шаблонов в базе данных...\n');

const allTemplates = db.prepare('SELECT id, day_of_week, start_time, end_time, is_active FROM recurring_lessons ORDER BY id').all();

console.log(`Найдено ${allTemplates.length} шаблонов (включая неактивные):\n`);

const dayNames = { 1: 'Понедельник', 2: 'Вторник', 3: 'Среда', 4: 'Четверг', 5: 'Пятница', 6: 'Суббота', 7: 'Воскресенье' };

allTemplates.forEach(t => {
  console.log(`Шаблон ID ${t.id} (${t.is_active ? 'АКТИВЕН' : 'неактивен'}):`);
  console.log(`  День недели: ${t.day_of_week} (${dayNames[t.day_of_week] || 'НЕИЗВЕСТНО'})`);
  console.log(`  Время: ${t.start_time} - ${t.end_time}`);
  console.log('');
});

// Проверяем, какие шаблоны использовались для генерации занятий
const lessons = db.prepare(`
  SELECT l.id, l.lesson_date, l.start_time, l.recurring_lesson_id, rl.day_of_week
  FROM lessons l
  LEFT JOIN recurring_lessons rl ON l.recurring_lesson_id = rl.id
  WHERE l.lesson_date >= '2025-11-30' AND l.lesson_date <= '2025-12-07'
  ORDER BY l.lesson_date, l.start_time
`).all();

console.log(`\nЗанятия на неделю с 30 ноября по 7 декабря:\n`);

lessons.forEach(lesson => {
  const lessonDate = new Date(lesson.lesson_date);
  const jsDayOfWeek = lessonDate.getDay();
  const jsDayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  
  console.log(`Занятие ID ${lesson.id}:`);
  console.log(`  Дата: ${lesson.lesson_date} (${jsDayNames[jsDayOfWeek]}, JS getDay() = ${jsDayOfWeek})`);
  console.log(`  Время: ${lesson.start_time}`);
  console.log(`  Шаблон ID: ${lesson.recurring_lesson_id || 'НЕТ'}`);
  if (lesson.recurring_lesson_id) {
    console.log(`  День недели шаблона: ${lesson.day_of_week} (${dayNames[lesson.day_of_week] || 'НЕИЗВЕСТНО'})`);
  }
  console.log('');
});

process.exit(0);

