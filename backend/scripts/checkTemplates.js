// Проверка шаблонов в базе данных
const db = require('../src/config/database');

console.log('🔄 Проверка шаблонов...\n');

const templates = db.prepare('SELECT id, day_of_week, start_time, direction_id, trainer_id FROM recurring_lessons WHERE is_active = 1').all();

console.log(`Найдено ${templates.length} активных шаблонов:\n`);

templates.forEach(t => {
  const dayNames = { 1: 'Пн', 2: 'Вт', 3: 'Ср', 4: 'Чт', 5: 'Пт', 6: 'Сб', 7: 'Вс' };
  const jsDayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  
  // Конвертируем в JS формат для проверки
  const jsDay = t.day_of_week === 7 ? 0 : t.day_of_week;
  
  console.log(`ID: ${t.id}`);
  console.log(`  day_of_week в БД: ${t.day_of_week} (${dayNames[t.day_of_week] || 'неизвестно'})`);
  console.log(`  Конвертация в JS: ${jsDay} (${jsDayNames[jsDay]})`);
  console.log(`  Время: ${t.start_time}`);
  console.log(`  Direction ID: ${t.direction_id}`);
  console.log(`  Trainer ID: ${t.trainer_id}`);
  console.log('');
});

// Проверяем последние сгенерированные занятия
console.log('\n📅 Последние 5 сгенерированных занятий:\n');
const recentLessons = db.prepare(`
  SELECT l.id, l.lesson_date, l.start_time, l.direction_id, rl.day_of_week as template_day
  FROM lessons l
  LEFT JOIN recurring_lessons rl ON l.recurring_lesson_id = rl.id
  ORDER BY l.id DESC
  LIMIT 5
`).all();

recentLessons.forEach(lesson => {
  const lessonDate = new Date(lesson.lesson_date);
  const actualDay = lessonDate.getDay();
  const jsDayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  
  console.log(`Занятие ID: ${lesson.id}`);
  console.log(`  Дата: ${lesson.lesson_date} (${jsDayNames[actualDay]})`);
  console.log(`  Время: ${lesson.start_time}`);
  console.log(`  День недели из шаблона: ${lesson.template_day || 'N/A'}`);
  console.log('');
});

process.exit(0);
