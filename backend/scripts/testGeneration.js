// Тест генерации расписания
const db = require('../src/config/database');

console.log('🧪 Тест генерации расписания\n');

// Получаем шаблон
const template = db.prepare('SELECT * FROM recurring_lessons WHERE is_active = 1 LIMIT 1').get();

if (!template) {
  console.log('❌ Нет активных шаблонов');
  process.exit(1);
}

console.log(`Шаблон ID: ${template.id}`);
console.log(`day_of_week в БД: ${template.day_of_week}`);

// Конвертируем в JS формат
const templateDayOfWeek = parseInt(template.day_of_week);
const jsDayOfWeek = templateDayOfWeek === 7 ? 0 : templateDayOfWeek;

const dayNames = { 1: 'Пн', 2: 'Вт', 3: 'Ср', 4: 'Чт', 5: 'Пт', 6: 'Сб', 7: 'Вс' };
const jsDayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

console.log(`День недели в шаблоне: ${templateDayOfWeek} (${dayNames[templateDayOfWeek]})`);
console.log(`Конвертация в JS: ${jsDayOfWeek} (${jsDayNames[jsDayOfWeek]})\n`);

// Тестируем генерацию на следующую неделю
const today = new Date();
today.setHours(0, 0, 0, 0);

const endDate = new Date(today);
endDate.setDate(endDate.getDate() + 7);

console.log('📅 Тестируем генерацию на следующую неделю:\n');
console.log(`Начало: ${today.toLocaleDateString('ru-RU')} (${jsDayNames[today.getDay()]})`);
console.log(`Конец: ${endDate.toLocaleDateString('ru-RU')} (${jsDayNames[endDate.getDay()]})\n`);

const currentDate = new Date(today);
let foundDays = [];

while (currentDate <= endDate) {
  const currentDayOfWeek = currentDate.getDay();
  
  if (currentDayOfWeek === jsDayOfWeek) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const lessonDateStr = `${year}-${month}-${day}`;
    
    foundDays.push({
      date: lessonDateStr,
      dayOfWeek: currentDayOfWeek,
      dayName: jsDayNames[currentDayOfWeek]
    });
  }
  
  currentDate.setDate(currentDate.getDate() + 1);
}

console.log(`Найдено ${foundDays.length} подходящих дней:\n`);
foundDays.forEach(day => {
  console.log(`  ✅ ${day.date} (${day.dayName}) - день недели: ${day.dayOfWeek}`);
});

console.log(`\nОжидаемый день: ${jsDayNames[jsDayOfWeek]} (${jsDayOfWeek})`);
console.log(`Все дни совпадают: ${foundDays.every(d => d.dayOfWeek === jsDayOfWeek) ? '✅' : '❌'}`);

process.exit(0);




