/**
 * Скрипт для проверки результатов миграции
 * Сравнивает количество записей в SQLite и Supabase
 */

const Database = require('better-sqlite3');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Конфигурация Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Ошибка: Не указаны переменные окружения для Supabase');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Подключение к SQLite
const dbPath = path.join(__dirname, '..', 'dev.db');
const db = new Database(dbPath);

console.log('🔍 Проверка результатов миграции...\n');

const tables = [
  'users',
  'halls',
  'directions',
  'trainers',
  'subscription_types',
  'subscriptions',
  'lessons',
  'bookings',
  'rental_bookings',
  'notifications',
  'settings'
];

async function checkTable(tableName) {
  try {
    // Подсчет в SQLite
    const sqliteCount = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get().count;
    
    // Подсчет в Supabase
    const { count: supabaseCount, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error(`  ❌ Ошибка при проверке ${tableName}:`, error.message);
      return { table: tableName, sqlite: sqliteCount, supabase: 'ERROR', match: false };
    }
    
    const match = sqliteCount === supabaseCount;
    const status = match ? '✅' : '⚠️';
    
    console.log(`${status} ${tableName.padEnd(25)} SQLite: ${sqliteCount.toString().padStart(4)} | Supabase: ${supabaseCount.toString().padStart(4)} ${match ? '' : '❌ НЕ СОВПАДАЕТ!'}`);
    
    return { table: tableName, sqlite: sqliteCount, supabase: supabaseCount, match };
  } catch (error) {
    console.error(`  ❌ Ошибка при проверке ${tableName}:`, error.message);
    return { table: tableName, sqlite: 0, supabase: 0, match: false };
  }
}

async function checkMigration() {
  const results = [];
  
  for (const table of tables) {
    const result = await checkTable(table);
    results.push(result);
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 Итоговая статистика:');
  console.log('='.repeat(70));
  
  const matched = results.filter(r => r.match).length;
  const total = results.length;
  
  console.log(`\n✅ Совпадает: ${matched}/${total} таблиц`);
  
  const mismatched = results.filter(r => !r.match);
  if (mismatched.length > 0) {
    console.log(`\n⚠️  Не совпадает: ${mismatched.length} таблиц:`);
    mismatched.forEach(r => {
      console.log(`   - ${r.table}: SQLite=${r.sqlite}, Supabase=${r.supabase}`);
    });
  }
  
  // Дополнительная проверка для lessons с NULL day_of_week
  console.log('\n📋 Дополнительная проверка занятий:');
  try {
    const lessonsWithNull = db.prepare(`
      SELECT COUNT(*) as count 
      FROM lessons 
      WHERE day_of_week IS NULL AND specific_date IS NULL
    `).get().count;
    
    if (lessonsWithNull > 0) {
      console.log(`   ⚠️  Найдено ${lessonsWithNull} занятий без day_of_week и specific_date в SQLite`);
    } else {
      console.log(`   ✅ Все занятия имеют day_of_week или specific_date`);
    }
  } catch (error) {
    console.log(`   ⚠️  Не удалось проверить: ${error.message}`);
  }
  
  // Проверка bookings с несуществующими lessons
  console.log('\n📋 Проверка целостности данных:');
  try {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('lesson_id');
    
    if (!error && bookings) {
      const lessonIds = [...new Set(bookings.map(b => b.lesson_id))];
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('id')
        .in('id', lessonIds);
      
      if (!lessonsError && lessons) {
        const existingLessonIds = new Set(lessons.map(l => l.id));
        const missingLessons = lessonIds.filter(id => !existingLessonIds.has(id));
        
        if (missingLessons.length > 0) {
          console.log(`   ⚠️  Найдено ${missingLessons.length} bookings с несуществующими lessons: ${missingLessons.join(', ')}`);
        } else {
          console.log(`   ✅ Все bookings ссылаются на существующие lessons`);
        }
      }
    }
  } catch (error) {
    console.log(`   ⚠️  Не удалось проверить: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(70));
  
  if (matched === total) {
    console.log('✅ Миграция прошла успешно! Все данные совпадают.');
  } else {
    console.log('⚠️  Миграция завершена, но есть расхождения. Проверьте детали выше.');
  }
  
  db.close();
}

checkMigration().catch(error => {
  console.error('❌ Ошибка при проверке:', error);
  process.exit(1);
});

