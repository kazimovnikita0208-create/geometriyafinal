// Финальная проверка всех данных
const db = require('../src/config/database');

console.log('🔍 Финальная проверка данных\n');

const dayNames = { 1: 'Пн', 2: 'Вт', 3: 'Ср', 4: 'Чт', 5: 'Пт', 6: 'Сб', 7: 'Вс' };
const jsDayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

// Проверяем все активные шаблоны
console.log('📋 АКТИВНЫЕ ШАБЛОНЫ:\n');
const activeTemplates = db.prepare(`
  SELECT * FROM recurring_lessons 
  WHERE is_active = 1
  ORDER BY id DESC
`).all();

if (activeTemplates.length === 0) {
  console.log('⚠️ Нет активных шаблонов\n');
} else {
  activeTemplates.forEach(t => {
    const jsDay = t.day_of_week === 7 ? 0 : t.day_of_week;
    console.log(`ID: ${t.id}`);
    console.log(`  День недели: ${t.day_of_week} (${dayNames[t.day_of_week] || '?'})`);
    console.log(`  Время: ${t.start_time}-${t.end_time}`);
    console.log(`  Зал ID: ${t.hall_id}, Направление ID: ${t.direction_id}, Тренер ID: ${t.trainer_id}`);
    console.log(`  Корректность: ${t.day_of_week >= 1 && t.day_of_week <= 7 && t.start_time && t.end_time ? '✅' : '❌'}`);
    console.log('');
  });
}

// Проверяем все занятия
console.log('\n📅 ВСЕ ЗАНЯТИЯ:\n');
const allLessons = db.prepare(`
  SELECT l.*, rl.day_of_week as template_day, rl.start_time as template_start, rl.end_time as template_end
  FROM lessons l
  LEFT JOIN recurring_lessons rl ON l.recurring_lesson_id = rl.id
  ORDER BY l.lesson_date DESC, l.start_time DESC
`).all();

console.log(`Всего занятий: ${allLessons.length}\n`);

if (allLessons.length > 0) {
  const lessonsFromTemplates = allLessons.filter(l => l.recurring_lesson_id);
  const manualLessons = allLessons.filter(l => !l.recurring_lesson_id);
  
  console.log(`Из шаблонов: ${lessonsFromTemplates.length}`);
  console.log(`Созданы вручную: ${manualLessons.length}\n`);
  
  // Проверяем корректность занятий из шаблонов
  let correctCount = 0;
  let incorrectCount = 0;
  
  lessonsFromTemplates.forEach(lesson => {
    const [year, month, day] = lesson.lesson_date.split('-').map(Number);
    const lessonDate = new Date(year, month - 1, day);
    const actualDay = lessonDate.getDay();
    
    const templateDay = lesson.template_day ? (lesson.template_day === 7 ? 0 : lesson.template_day) : null;
    const dayMatch = templateDay !== null && actualDay === templateDay;
    const timeMatch = lesson.template_start ? lesson.start_time === lesson.template_start : null;
    
    if (dayMatch && timeMatch) {
      correctCount++;
    } else {
      incorrectCount++;
      console.log(`❌ Занятие ID ${lesson.id}:`);
      console.log(`   Дата: ${lesson.lesson_date} (${jsDayNames[actualDay]})`);
      console.log(`   Время: ${lesson.start_time}-${lesson.end_time}`);
      console.log(`   Шаблон: день ${lesson.template_day} (${dayNames[lesson.template_day] || '?'}), время ${lesson.template_start}-${lesson.template_end}`);
      console.log(`   Совпадение дня: ${dayMatch ? '✅' : '❌'}, совпадение времени: ${timeMatch !== null ? (timeMatch ? '✅' : '❌') : 'N/A'}`);
      console.log('');
    }
  });
  
  console.log(`\n✅ Корректных: ${correctCount}`);
  console.log(`❌ Некорректных: ${incorrectCount}`);
}

process.exit(0);




