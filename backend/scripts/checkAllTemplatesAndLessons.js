// Проверка всех шаблонов и занятий
const db = require('../src/config/database');

console.log('🔍 Полная проверка шаблонов и занятий\n');

const dayNames = { 1: 'Пн', 2: 'Вт', 3: 'Ср', 4: 'Чт', 5: 'Пт', 6: 'Сб', 7: 'Вс' };
const jsDayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

// Все шаблоны
console.log('📋 ВСЕ ШАБЛОНЫ (включая неактивные):\n');
const allTemplates = db.prepare('SELECT * FROM recurring_lessons ORDER BY id DESC').all();

allTemplates.forEach(t => {
  const jsDay = t.day_of_week === 7 ? 0 : t.day_of_week;
  console.log(`ID: ${t.id}, day_of_week: ${t.day_of_week} (${dayNames[t.day_of_week] || '?'}), время: ${t.start_time}-${t.end_time}, активен: ${t.is_active ? 'да' : 'нет'}`);
});

// Последние 20 занятий
console.log('\n\n📅 ПОСЛЕДНИЕ 20 ЗАНЯТИЙ:\n');
const recentLessons = db.prepare(`
  SELECT l.*, rl.day_of_week as template_day, rl.start_time as template_start, rl.end_time as template_end
  FROM lessons l
  LEFT JOIN recurring_lessons rl ON l.recurring_lesson_id = rl.id
  ORDER BY l.lesson_date DESC, l.start_time DESC
  LIMIT 20
`).all();

recentLessons.forEach(lesson => {
  const [year, month, day] = lesson.lesson_date.split('-').map(Number);
  const lessonDate = new Date(year, month - 1, day);
  const actualDay = lessonDate.getDay();
  
  const templateDay = lesson.template_day ? (lesson.template_day === 7 ? 0 : lesson.template_day) : null;
  const match = templateDay !== null && actualDay === templateDay;
  const timeMatch = lesson.template_start ? lesson.start_time === lesson.template_start : null;
  
  console.log(`ID: ${lesson.id}, дата: ${lesson.lesson_date} (${jsDayNames[actualDay]}), время: ${lesson.start_time}-${lesson.end_time}`);
  if (lesson.recurring_lesson_id) {
    console.log(`  → Шаблон ID: ${lesson.recurring_lesson_id}, день: ${lesson.template_day} (${dayNames[lesson.template_day] || '?'}), время шаблона: ${lesson.template_start}-${lesson.template_end}`);
    console.log(`  → Совпадение дня: ${match ? '✅' : '❌'}, совпадение времени: ${timeMatch !== null ? (timeMatch ? '✅' : '❌') : 'N/A'}`);
  } else {
    console.log(`  → Создано вручную (не из шаблона)`);
  }
  console.log('');
});

process.exit(0);




