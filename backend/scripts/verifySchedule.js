// Проверка соответствия дней недели в шаблонах и занятиях
const db = require('../src/config/database');

console.log('🔍 Проверка соответствия дней недели\n');

const templates = db.prepare('SELECT id, day_of_week, start_time FROM recurring_lessons WHERE is_active = 1').all();

const dayNames = { 1: 'Пн', 2: 'Вт', 3: 'Ср', 4: 'Чт', 5: 'Пт', 6: 'Сб', 7: 'Вс' };
const jsDayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

templates.forEach(template => {
  console.log(`\n📋 Шаблон ID: ${template.id}`);
  console.log(`   day_of_week в БД: ${template.day_of_week} (${dayNames[template.day_of_week]})`);
  
  // Конвертируем в JS формат
  const templateDayOfWeek = parseInt(template.day_of_week);
  const jsDayOfWeek = templateDayOfWeek === 7 ? 0 : templateDayOfWeek;
  console.log(`   Конвертация в JS: ${jsDayOfWeek} (${jsDayNames[jsDayOfWeek]})`);
  
  // Получаем последние 5 занятий из этого шаблона
  const lessons = db.prepare(`
    SELECT id, lesson_date, start_time 
    FROM lessons 
    WHERE recurring_lesson_id = ? 
    ORDER BY lesson_date DESC 
    LIMIT 5
  `).all(template.id);
  
  console.log(`   Сгенерированные занятия (последние 5):`);
  
  if (lessons.length === 0) {
    console.log(`   ⚠️ Нет сгенерированных занятий`);
  } else {
    lessons.forEach(lesson => {
      // Проверяем день недели занятия
      const [year, month, day] = lesson.lesson_date.split('-').map(Number);
      const lessonDate = new Date(year, month - 1, day);
      const actualDay = lessonDate.getDay();
      
      const isCorrect = actualDay === jsDayOfWeek;
      const status = isCorrect ? '✅' : '❌';
      
      console.log(`   ${status} ${lesson.lesson_date} (${jsDayNames[actualDay]}) - время: ${lesson.start_time}`);
      if (!isCorrect) {
        console.log(`      ОШИБКА: Ожидался ${jsDayNames[jsDayOfWeek]}, получен ${jsDayNames[actualDay]}`);
      }
    });
  }
});

console.log('\n✅ Проверка завершена\n');

process.exit(0);




