const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Получить все занятия (с фильтрами)
router.get('/', authMiddleware, (req, res) => {
  try {
    const { date, direction_id, hall_id, from_date, to_date, include_past } = req.query;
    
    // Получаем текущую дату и время
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM
    
    let query = `
      SELECT 
        l.*,
        h.name as hall_name,
        h.address as hall_address,
        d.name as direction_name,
        d.color as direction_color,
        d.requires_pole as direction_requires_pole,
        TRIM(t.name || ' ' || COALESCE(t.last_name, '')) as trainer_name,
        (l.capacity - l.current_bookings) as available_spots
      FROM lessons l
      LEFT JOIN halls h ON l.hall_id = h.id
      LEFT JOIN directions d ON l.direction_id = d.id
      LEFT JOIN trainers t ON l.trainer_id = t.id
      WHERE l.is_active = 1
    `;
    
    const params = [];
    
    // Фильтр по датам (если указаны)
    if (date) {
      query += ' AND l.lesson_date = ?';
      params.push(date);
    } else if (from_date && to_date) {
      query += ' AND l.lesson_date BETWEEN ? AND ?';
      params.push(from_date, to_date);
    }
    
    // Фильтр по прошедшим занятиям (по умолчанию показываем только будущие)
    // Это должно быть ПОСЛЕ фильтра по датам, чтобы правильно работать
    if (include_past !== 'true') {
      query += ` AND (l.lesson_date > ? OR (l.lesson_date = ? AND l.end_time > ?))`;
      params.push(currentDate, currentDate, currentTime);
    }
    
    if (direction_id) {
      query += ' AND l.direction_id = ?';
      params.push(direction_id);
    }
    
    if (hall_id) {
      query += ' AND l.hall_id = ?';
      params.push(hall_id);
    }
    
    query += ' ORDER BY l.lesson_date ASC, l.start_time ASC';
    
    const stmt = db.prepare(query);
    const lessons = stmt.all(...params);
    
    res.json({ lessons });
  } catch (error) {
    console.error('Ошибка получения занятий:', error);
    res.status(500).json({ error: 'Ошибка получения занятий' });
  }
});

// Получить занятие по ID
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    
    const stmt = db.prepare(`
      SELECT 
        l.*,
        h.name as hall_name,
        h.address as hall_address,
        d.name as direction_name,
        d.color as direction_color,
        TRIM(t.name || ' ' || COALESCE(t.last_name, '')) as trainer_name,
        (l.capacity - l.current_bookings) as available_spots
      FROM lessons l
      LEFT JOIN halls h ON l.hall_id = h.id
      LEFT JOIN directions d ON l.direction_id = d.id
      LEFT JOIN trainers t ON l.trainer_id = t.id
      WHERE l.id = ?
    `);
    
    const lesson = stmt.get(id);
    
    if (!lesson) {
      return res.status(404).json({ error: 'Занятие не найдено' });
    }
    
    res.json(lesson);
  } catch (error) {
    console.error('Ошибка получения занятия:', error);
    res.status(500).json({ error: 'Ошибка получения занятия' });
  }
});

// Создать новое занятие (только админ)
router.post('/', adminMiddleware, (req, res) => {
  try {
    const {
      hall_id,
      direction_id,
      trainer_id,
      lesson_date,
      start_time,
      end_time,
      capacity,
      description,
      is_recurring,
      recurrence_pattern
    } = req.body;
    
    // Валидация
    if (!hall_id || !direction_id || !trainer_id || !lesson_date || !start_time || !end_time) {
      return res.status(400).json({ error: 'Заполните все обязательные поля' });
    }
    
    // Проверка на конфликт расписания
    const conflictCheck = db.prepare(`
      SELECT id FROM lessons 
      WHERE hall_id = ? 
      AND lesson_date = ? 
      AND is_active = 1
      AND (
        (start_time <= ? AND end_time > ?) OR
        (start_time < ? AND end_time >= ?) OR
        (start_time >= ? AND end_time <= ?)
      )
    `);
    
    const conflict = conflictCheck.get(
      hall_id, 
      lesson_date, 
      start_time, start_time,
      end_time, end_time,
      start_time, end_time
    );
    
    if (conflict) {
      return res.status(400).json({ error: 'В это время в зале уже есть занятие' });
    }
    
    const stmt = db.prepare(`
      INSERT INTO lessons (
        hall_id, direction_id, trainer_id, lesson_date, 
        start_time, end_time, capacity, description,
        is_recurring, recurrence_pattern, current_bookings
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `);
    
    const result = stmt.run(
      hall_id,
      direction_id,
      trainer_id,
      lesson_date,
      start_time,
      end_time,
      capacity || 6,
      description || null,
      is_recurring ? 1 : 0,
      recurrence_pattern || null
    );
    
    // Если это повторяющееся занятие, создаем копии
    if (is_recurring && recurrence_pattern) {
      createRecurringLessons(result.lastInsertRowid, {
        hall_id,
        direction_id,
        trainer_id,
        lesson_date,
        start_time,
        end_time,
        capacity: capacity || 6,
        description,
        recurrence_pattern
      });
    }
    
    res.status(201).json({ 
      message: 'Занятие создано',
      id: result.lastInsertRowid 
    });
  } catch (error) {
    console.error('Ошибка создания занятия:', error);
    res.status(500).json({ error: 'Ошибка создания занятия' });
  }
});

// Обновить занятие (только админ)
router.put('/:id', adminMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const {
      hall_id,
      direction_id,
      trainer_id,
      lesson_date,
      start_time,
      end_time,
      capacity,
      description
    } = req.body;
    
    // Проверка существования
    const existing = db.prepare('SELECT id FROM lessons WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Занятие не найдено' });
    }
    
    const stmt = db.prepare(`
      UPDATE lessons 
      SET hall_id = ?, direction_id = ?, trainer_id = ?,
          lesson_date = ?, start_time = ?, end_time = ?,
          capacity = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(
      hall_id,
      direction_id,
      trainer_id,
      lesson_date,
      start_time,
      end_time,
      capacity,
      description,
      id
    );
    
    res.json({ message: 'Занятие обновлено' });
  } catch (error) {
    console.error('Ошибка обновления занятия:', error);
    res.status(500).json({ error: 'Ошибка обновления занятия' });
  }
});

// Очистить прошедшие занятия (ВАЖНО: должен быть ПЕРЕД /:id, иначе /:id перехватит запрос)
router.delete('/cleanup-past', authMiddleware, adminMiddleware, async (req, res) => {
  console.log('🔵 ========== ЗАПРОС НА ОЧИСТКУ ПРОШЕДШИХ ЗАНЯТИЙ ==========');
  console.log('🔵 Метод:', req.method);
  console.log('🔵 Путь:', req.path);
  console.log('🔵 User ID:', req.userId);
  console.log('🔵 User:', req.user);
  
  try {
    // Получаем текущую дату и время в локальном времени
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // Получаем текущее время в формате HH:MM:SS
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const currentTimeShort = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    console.log(`🧹 Очистка прошедших занятий`);
    console.log(`   Сегодня: ${todayStr}`);
    console.log(`   Текущее время: ${currentTimeShort}`);
    
    // Сначала получаем все занятия для анализа
    const allLessons = db.prepare(`
      SELECT id, lesson_date, end_time, start_time FROM lessons 
      ORDER BY lesson_date, start_time
    `).all();
    
    console.log(`📋 Всего занятий в базе: ${allLessons.length}`);
    
    if (allLessons.length === 0) {
      console.log('ℹ️  В базе нет занятий');
      return res.json({ 
        message: 'В базе нет занятий',
        deletedLessons: 0,
        deletedBookings: 0
      });
    }
    
    // Фильтруем: оставляем только те, которые действительно прошли
    const pastLessonIds = [];
    for (const lesson of allLessons) {
      try {
        // Нормализуем дату занятия (убираем время, если есть)
        if (!lesson.lesson_date) {
          console.log(`  ⚠️ Занятие ${lesson.id}: нет даты, пропускаем`);
          continue;
        }
        
        let lessonDateStr = String(lesson.lesson_date);
        if (lessonDateStr.includes(' ')) {
          lessonDateStr = lessonDateStr.split(' ')[0]; // Берем только дату, без времени
        }
        if (lessonDateStr.includes('T')) {
          lessonDateStr = lessonDateStr.split('T')[0]; // Берем только дату, без времени ISO
        }
        
        // Сравниваем даты как строки в формате YYYY-MM-DD
        const dateComparison = lessonDateStr.localeCompare(todayStr);
        
        // Если дата меньше сегодняшней - точно прошедшее
        if (dateComparison < 0) {
          pastLessonIds.push(lesson.id);
          console.log(`  ✓ Занятие ${lesson.id}: ${lessonDateStr} ${lesson.start_time}-${lesson.end_time} - дата в прошлом`);
        } 
        // Если дата равна сегодняшней - проверяем время окончания
        else if (dateComparison === 0 && lesson.end_time) {
          // Парсим время окончания (может быть в формате HH:MM или HH:MM:SS)
          const endTimeParts = String(lesson.end_time).split(':');
          const endHour = parseInt(endTimeParts[0], 10);
          const endMin = parseInt(endTimeParts[1] || '0', 10);
          
          if (isNaN(endHour) || isNaN(endMin)) {
            console.log(`  ⚠️ Занятие ${lesson.id}: некорректное время окончания ${lesson.end_time}`);
            continue;
          }
          
          const endTimeMinutes = endHour * 60 + endMin;
          const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
          
          if (endTimeMinutes < currentTimeMinutes) {
            pastLessonIds.push(lesson.id);
            console.log(`  ✓ Занятие ${lesson.id}: ${lessonDateStr} ${lesson.start_time}-${lesson.end_time} - время прошло`);
          } else {
            console.log(`  ✗ Занятие ${lesson.id}: ${lessonDateStr} ${lesson.start_time}-${lesson.end_time} - еще не прошло`);
          }
        } else {
          console.log(`  ✗ Занятие ${lesson.id}: ${lessonDateStr} ${lesson.start_time}-${lesson.end_time} - в будущем`);
        }
      } catch (lessonError) {
        console.error(`  ❌ Ошибка при обработке занятия ${lesson.id}:`, lessonError);
      }
    }
    
    console.log(`📋 Отфильтровано ${pastLessonIds.length} прошедших занятий для удаления`);
    
    if (pastLessonIds.length === 0) {
      console.log('ℹ️  Прошедших занятий не найдено');
      return res.json({ 
        message: 'Прошедших занятий не найдено',
        deletedLessons: 0,
        deletedBookings: 0
      });
    }
    
    // Удаляем бронирования для прошедших занятий
    let deletedBookingsCount = 0;
    if (pastLessonIds.length > 0) {
      console.log(`🗑️ Начинаем удаление ${pastLessonIds.length} занятий...`);
      
      // Удаляем по одному, чтобы избежать проблем с большим количеством параметров
      const deleteBookingStmt = db.prepare('DELETE FROM bookings WHERE lesson_id = ?');
      for (const lessonId of pastLessonIds) {
        try {
          const result = deleteBookingStmt.run(lessonId);
          deletedBookingsCount += result.changes;
          if (result.changes > 0) {
            console.log(`  ✓ Удалено ${result.changes} бронирований для занятия ${lessonId}`);
          }
        } catch (err) {
          console.error(`  ❌ Ошибка удаления бронирований для занятия ${lessonId}:`, err);
        }
      }
    }
    
    // Удаляем прошедшие занятия
    let deletedLessonsCount = 0;
    if (pastLessonIds.length > 0) {
      const deleteLessonStmt = db.prepare('DELETE FROM lessons WHERE id = ?');
      for (const lessonId of pastLessonIds) {
        try {
          const result = deleteLessonStmt.run(lessonId);
          if (result.changes > 0) {
            deletedLessonsCount++;
            console.log(`  ✓ Удалено занятие ${lessonId}`);
          } else {
            console.log(`  ⚠️ Занятие ${lessonId} не найдено при удалении`);
          }
        } catch (err) {
          console.error(`  ❌ Ошибка удаления занятия ${lessonId}:`, err);
        }
      }
    }
    
    console.log(`✅ Удалено ${deletedLessonsCount} прошедших занятий и ${deletedBookingsCount} связанных бронирований`);
    
    // Проверяем результат
    const remainingLessons = db.prepare('SELECT COUNT(*) as count FROM lessons').get();
    console.log(`📊 Осталось занятий в базе: ${remainingLessons.count}`);
    console.log('🔵 ========== ОЧИСТКА ЗАВЕРШЕНА ==========');
    
    res.json({ 
      message: `Удалено ${deletedLessonsCount} прошедших занятий и ${deletedBookingsCount} связанных бронирований`,
      deletedLessons: deletedLessonsCount,
      deletedBookings: deletedBookingsCount
    });
  } catch (error) {
    console.error('❌ ========== ОШИБКА ОЧИСТКИ ПРОШЕДШИХ ЗАНЯТИЙ ==========');
    console.error('❌ Ошибка:', error);
    console.error('❌ Сообщение:', error.message);
    console.error('❌ Stack:', error.stack);
    res.status(500).json({ error: 'Ошибка очистки прошедших занятий', details: error.message });
  }
});

// Удалить занятие (только админ)
router.delete('/:id', adminMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    
    // Всегда удаляем связанные бронирования перед удалением занятия
    const deleteBookingsStmt = db.prepare('DELETE FROM bookings WHERE lesson_id = ?');
    const deletedBookings = deleteBookingsStmt.run(id);
    
    // Полное удаление занятия
    const deleteLessonStmt = db.prepare('DELETE FROM lessons WHERE id = ?');
    deleteLessonStmt.run(id);
    
    res.json({ 
      message: 'Занятие удалено',
      deletedBookings: deletedBookings.changes
    });
  } catch (error) {
    console.error('Ошибка удаления занятия:', error);
    res.status(500).json({ error: 'Ошибка удаления занятия' });
  }
});

// Очистить все занятия и бронирования
router.delete('/clear', authMiddleware, adminMiddleware, (req, res) => {
  try {
    // Проверяем количество записей до удаления
    const lessonsBefore = db.prepare('SELECT COUNT(*) as count FROM lessons').get();
    const bookingsBefore = db.prepare('SELECT COUNT(*) as count FROM bookings').get();
    
    console.log(`🧹 Очистка расписания: ${lessonsBefore.count} занятий, ${bookingsBefore.count} бронирований`);
    
    db.exec('BEGIN TRANSACTION');
    
    // Удаляем все бронирования (без условий)
    const deletedBookings = db.prepare('DELETE FROM bookings').run();
    console.log(`✓ Удалено бронирований: ${deletedBookings.changes}`);
    
    // Удаляем все занятия (без условий, включая неактивные)
    const deletedLessons = db.prepare('DELETE FROM lessons').run();
    console.log(`✓ Удалено занятий: ${deletedLessons.changes}`);
    
    // Сбрасываем счетчики автоинкремента
    try {
      db.prepare('DELETE FROM sqlite_sequence WHERE name IN (?, ?)').run('bookings', 'lessons');
      console.log('✓ Сброшены счетчики автоинкремента');
    } catch (err) {
      // Игнорируем ошибку, если таблица sqlite_sequence не содержит эти записи
      console.log('ℹ️  Счетчики автоинкремента не требуют сброса');
    }
    
    // Коммитим транзакцию
    db.exec('COMMIT');
    
    // Проверяем количество записей после удаления (после коммита)
    const lessonsAfter = db.prepare('SELECT COUNT(*) as count FROM lessons').get();
    const bookingsAfter = db.prepare('SELECT COUNT(*) as count FROM bookings').get();
    console.log(`✓ После очистки (проверка): ${lessonsAfter.count} занятий, ${bookingsAfter.count} бронирований`);
    
    if (lessonsAfter.count > 0 || bookingsAfter.count > 0) {
      console.error(`⚠️ ВНИМАНИЕ: После очистки остались записи! Занятий: ${lessonsAfter.count}, Бронирований: ${bookingsAfter.count}`);
    }
    
    res.json({ 
      message: 'Расписание очищено',
      deleted_lessons: deletedLessons.changes,
      deleted_bookings: deletedBookings.changes,
      remaining_lessons: lessonsAfter.count,
      remaining_bookings: bookingsAfter.count
    });
  } catch (error) {
    db.exec('ROLLBACK');
    console.error('❌ Ошибка очистки расписания:', error);
    res.status(500).json({ error: 'Ошибка очистки расписания', message: error.message });
  }
});

// Вспомогательная функция для создания повторяющихся занятий
function createRecurringLessons(originalId, lessonData) {
  try {
    const { recurrence_pattern, lesson_date } = lessonData;
    const pattern = JSON.parse(recurrence_pattern);
    
    // Например: { type: 'weekly', count: 8, days: [1, 3, 5] }
    // Создаем занятия на следующие N недель
    
    if (pattern.type === 'weekly' && pattern.count && pattern.days) {
      const startDate = new Date(lesson_date);
      const stmt = db.prepare(`
        INSERT INTO lessons (
          hall_id, direction_id, trainer_id, lesson_date, 
          start_time, end_time, capacity, description,
          is_recurring, recurrence_pattern, current_bookings
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 0)
      `);
      
      for (let week = 1; week < pattern.count; week++) {
        const nextDate = new Date(startDate);
        nextDate.setDate(nextDate.getDate() + (week * 7));
        
        const dateStr = nextDate.toISOString().split('T')[0];
        
        stmt.run(
          lessonData.hall_id,
          lessonData.direction_id,
          lessonData.trainer_id,
          dateStr,
          lessonData.start_time,
          lessonData.end_time,
          lessonData.capacity,
          lessonData.description,
          recurrence_pattern
        );
      }
    }
  } catch (error) {
    console.error('Ошибка создания повторяющихся занятий:', error);
  }
}

module.exports = router;

