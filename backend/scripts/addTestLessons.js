const Database = require('better-sqlite3');
const path = require('path');

console.log('Creating test lessons (past and future)...\n');

const dbPath = path.join(__dirname, '..', 'dev.db');
const db = new Database(dbPath);

try {
  // Get IDs
  const directions = db.prepare('SELECT id, name FROM directions').all();
  const trainers = db.prepare('SELECT id, name FROM trainers').all();
  const halls = db.prepare('SELECT id, name FROM halls').all();
  
  if (directions.length === 0 || trainers.length === 0 || halls.length === 0) {
    console.log('ERROR: Missing data. Run seedDatabase.js first!');
    process.exit(1);
  }
  
  // Helper to get date strings
  const getDate = (daysOffset) => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
  };
  
  // Create lessons
  const lessons = [
    // PAST LESSONS (already finished)
    {
      hall_id: halls[0].id,
      direction_id: directions[0].id,
      trainer_id: trainers[0].id,
      lesson_date: getDate(-2), // 2 days ago
      start_time: '10:00',
      end_time: '11:30',
      capacity: 6,
      current_bookings: 3,
      description: 'Прошедшее занятие'
    },
    {
      hall_id: halls[0].id,
      direction_id: directions[1]?.id || directions[0].id,
      trainer_id: trainers[1]?.id || trainers[0].id,
      lesson_date: getDate(-1), // Yesterday
      start_time: '18:00',
      end_time: '19:30',
      capacity: 6,
      current_bookings: 5,
      description: 'Вчерашнее занятие'
    },
    // FUTURE LESSONS
    {
      hall_id: halls[0].id,
      direction_id: directions[0].id,
      trainer_id: trainers[0].id,
      lesson_date: getDate(0), // Today (but later time)
      start_time: '20:00',
      end_time: '21:30',
      capacity: 6,
      current_bookings: 2,
      description: 'Сегодня вечером'
    },
    {
      hall_id: halls[1]?.id || halls[0].id,
      direction_id: directions[2]?.id || directions[0].id,
      trainer_id: trainers[2]?.id || trainers[0].id,
      lesson_date: getDate(1), // Tomorrow
      start_time: '10:00',
      end_time: '11:30',
      capacity: 6,
      current_bookings: 0,
      description: 'Завтра утром'
    },
    {
      hall_id: halls[0].id,
      direction_id: directions[0].id,
      trainer_id: trainers[0].id,
      lesson_date: getDate(3), // 3 days from now
      start_time: '18:00',
      end_time: '19:30',
      capacity: 6,
      current_bookings: 1,
      description: 'Через 3 дня'
    }
  ];
  
  const insert = db.prepare(`
    INSERT INTO lessons (
      hall_id, direction_id, trainer_id, lesson_date,
      start_time, end_time, capacity, current_bookings, description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  lessons.forEach(lesson => {
    insert.run(
      lesson.hall_id,
      lesson.direction_id,
      lesson.trainer_id,
      lesson.lesson_date,
      lesson.start_time,
      lesson.end_time,
      lesson.capacity,
      lesson.current_bookings,
      lesson.description
    );
  });
  
  console.log(`✅ Created ${lessons.length} test lessons!`);
  console.log('\nBreakdown:');
  console.log(`  - ${lessons.filter(l => new Date(l.lesson_date) < new Date()).length} past lessons`);
  console.log(`  - ${lessons.filter(l => new Date(l.lesson_date) >= new Date()).length} future lessons`);
  console.log('\n✨ Now check:');
  console.log('   - /schedule page should show ONLY future lessons');
  console.log('   - /admin panel should show ALL lessons (with past marked as completed)');
  
} catch (error) {
  console.error('ERROR:', error.message);
  process.exit(1);
} finally {
  db.close();
}


console.log('Creating test lessons (past and future)...\n');

const dbPath = path.join(__dirname, '..', 'dev.db');
const db = new Database(dbPath);

try {
  // Get IDs
  const directions = db.prepare('SELECT id, name FROM directions').all();
  const trainers = db.prepare('SELECT id, name FROM trainers').all();
  const halls = db.prepare('SELECT id, name FROM halls').all();
  
  if (directions.length === 0 || trainers.length === 0 || halls.length === 0) {
    console.log('ERROR: Missing data. Run seedDatabase.js first!');
    process.exit(1);
  }
  
  // Helper to get date strings
  const getDate = (daysOffset) => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
  };
  
  // Create lessons
  const lessons = [
    // PAST LESSONS (already finished)
    {
      hall_id: halls[0].id,
      direction_id: directions[0].id,
      trainer_id: trainers[0].id,
      lesson_date: getDate(-2), // 2 days ago
      start_time: '10:00',
      end_time: '11:30',
      capacity: 6,
      current_bookings: 3,
      description: 'Прошедшее занятие'
    },
    {
      hall_id: halls[0].id,
      direction_id: directions[1]?.id || directions[0].id,
      trainer_id: trainers[1]?.id || trainers[0].id,
      lesson_date: getDate(-1), // Yesterday
      start_time: '18:00',
      end_time: '19:30',
      capacity: 6,
      current_bookings: 5,
      description: 'Вчерашнее занятие'
    },
    // FUTURE LESSONS
    {
      hall_id: halls[0].id,
      direction_id: directions[0].id,
      trainer_id: trainers[0].id,
      lesson_date: getDate(0), // Today (but later time)
      start_time: '20:00',
      end_time: '21:30',
      capacity: 6,
      current_bookings: 2,
      description: 'Сегодня вечером'
    },
    {
      hall_id: halls[1]?.id || halls[0].id,
      direction_id: directions[2]?.id || directions[0].id,
      trainer_id: trainers[2]?.id || trainers[0].id,
      lesson_date: getDate(1), // Tomorrow
      start_time: '10:00',
      end_time: '11:30',
      capacity: 6,
      current_bookings: 0,
      description: 'Завтра утром'
    },
    {
      hall_id: halls[0].id,
      direction_id: directions[0].id,
      trainer_id: trainers[0].id,
      lesson_date: getDate(3), // 3 days from now
      start_time: '18:00',
      end_time: '19:30',
      capacity: 6,
      current_bookings: 1,
      description: 'Через 3 дня'
    }
  ];
  
  const insert = db.prepare(`
    INSERT INTO lessons (
      hall_id, direction_id, trainer_id, lesson_date,
      start_time, end_time, capacity, current_bookings, description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  lessons.forEach(lesson => {
    insert.run(
      lesson.hall_id,
      lesson.direction_id,
      lesson.trainer_id,
      lesson.lesson_date,
      lesson.start_time,
      lesson.end_time,
      lesson.capacity,
      lesson.current_bookings,
      lesson.description
    );
  });
  
  console.log(`✅ Created ${lessons.length} test lessons!`);
  console.log('\nBreakdown:');
  console.log(`  - ${lessons.filter(l => new Date(l.lesson_date) < new Date()).length} past lessons`);
  console.log(`  - ${lessons.filter(l => new Date(l.lesson_date) >= new Date()).length} future lessons`);
  console.log('\n✨ Now check:');
  console.log('   - /schedule page should show ONLY future lessons');
  console.log('   - /admin panel should show ALL lessons (with past marked as completed)');
  
} catch (error) {
  console.error('ERROR:', error.message);
  process.exit(1);
} finally {
  db.close();
}


