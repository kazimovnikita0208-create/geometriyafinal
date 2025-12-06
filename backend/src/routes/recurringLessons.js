const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Получить все шаблоны повторяющихся занятий
router.get('/', authMiddleware, (req, res) => {
  try {
    const templates = db.prepare(`
      SELECT 
        rl.*,
        d.name as direction_name,
        d.color as direction_color,
        h.name as hall_name,
        h.address as hall_address,
        t.name as trainer_name
      FROM recurring_lessons rl
      LEFT JOIN directions d ON rl.direction_id = d.id
      LEFT JOIN halls h ON rl.hall_id = h.id
      LEFT JOIN trainers t ON rl.trainer_id = t.id
      WHERE rl.is_active = 1
      ORDER BY rl.day_of_week, rl.start_time
    `).all();
    
    res.json({ templates });
  } catch (error) {
    console.error('Ошибка получения шаблонов:', error);
    res.status(500).json({ error: 'Ошибка получения шаблонов' });
  }
});

// Создать шаблон повторяющегося занятия
router.post('/', authMiddleware, adminMiddleware, (req, res) => {
  try {
    console.log('Получен запрос на создание шаблона:', JSON.stringify(req.body, null, 2));
    
    const {
      hall_id,
      direction_id,
      trainer_id,
      days_of_week, // массив дней недели [1, 4] для Пн и Чт
      start_time,
      end_time,
      capacity,
      description
    } = req.body;
    
    if (!hall_id || !direction_id || !trainer_id || !days_of_week || !start_time || !end_time) {
      return res.status(400).json({ error: 'Заполните все обязательные поля' });
    }
    
    // Убеждаемся, что days_of_week - это массив
    let daysArray = days_of_week;
    if (typeof days_of_week === 'string') {
      try {
        daysArray = JSON.parse(days_of_week);
      } catch (e) {
        return res.status(400).json({ error: 'Некорректный формат дней недели' });
      }
    }
    
    if (!Array.isArray(daysArray) || daysArray.length === 0) {
      return res.status(400).json({ error: 'Выберите хотя бы один день недели' });
    }
    
    // Преобразуем все дни в числа
    daysArray = daysArray.map(d => parseInt(d));
    
    // Проверяем существование зала
    const hall = db.prepare('SELECT id FROM halls WHERE id = ?').get(hall_id);
    if (!hall) {
      return res.status(400).json({ error: `Зал с ID ${hall_id} не найден. Пожалуйста, обновите страницу и выберите зал заново.` });
    }
    
    // Проверяем существование направления
    const direction = db.prepare('SELECT id FROM directions WHERE id = ?').get(direction_id);
    if (!direction) {
      return res.status(400).json({ error: `Направление с ID ${direction_id} не найдено. Пожалуйста, обновите страницу и выберите направление заново.` });
    }
    
    // Проверяем существование тренера
    const trainer = db.prepare('SELECT id FROM trainers WHERE id = ?').get(trainer_id);
    if (!trainer) {
      return res.status(400).json({ error: `Тренер с ID ${trainer_id} не найден. Пожалуйста, обновите страницу и выберите тренера заново.` });
    }
    
    // Проверяем конфликты для каждого дня недели
    for (const day of daysArray) {
      const conflicts = db.prepare(`
        SELECT * FROM recurring_lessons 
        WHERE hall_id = ? 
        AND day_of_week = ?
        AND is_active = 1
        AND (
          (start_time <= ? AND end_time > ?) OR
          (start_time < ? AND end_time >= ?) OR
          (start_time >= ? AND end_time <= ?)
        )
      `).all(hall_id, day, start_time, start_time, end_time, end_time, start_time, end_time);
      
      if (conflicts.length > 0) {
        const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        return res.status(400).json({ 
          error: `Конфликт расписания в ${dayNames[day]} ${start_time}-${end_time}. Зал уже занят.` 
        });
      }
    }
    
    // Создаём шаблоны для каждого дня недели
    const createdTemplates = [];
    
    for (const day of daysArray) {
      const result = db.prepare(`
        INSERT INTO recurring_lessons (
          hall_id, direction_id, trainer_id, day_of_week, 
          start_time, end_time, capacity, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        hall_id, direction_id, trainer_id, day,
        start_time, end_time, capacity || 6, description || null
      );
      
      const template = db.prepare(`
        SELECT 
          rl.*,
          d.name as direction_name,
          h.name as hall_name,
          t.name as trainer_name
        FROM recurring_lessons rl
        LEFT JOIN directions d ON rl.direction_id = d.id
        LEFT JOIN halls h ON rl.hall_id = h.id
        LEFT JOIN trainers t ON rl.trainer_id = t.id
        WHERE rl.id = ?
      `).get(result.lastInsertRowid);
      
      createdTemplates.push(template);
    }
    
    res.status(201).json({ 
      message: 'Шаблоны повторяющихся занятий созданы',
      templates: createdTemplates
    });
  } catch (error) {
    console.error('Ошибка создания шаблона:', error);
    console.error('Детали ошибки:', error.message);
    console.error('Стек ошибки:', error.stack);
    res.status(500).json({ 
      error: 'Ошибка создания шаблона',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Создать несколько шаблонов для одного тренера (batch)
router.post('/batch', authMiddleware, adminMiddleware, (req, res) => {
  try {
    console.log('Получен batch запрос на создание шаблонов:', JSON.stringify(req.body, null, 2));
    
    const { trainer_id, schedule_items } = req.body;
    
    if (!trainer_id || !schedule_items || !Array.isArray(schedule_items) || schedule_items.length === 0) {
      return res.status(400).json({ error: 'Укажите тренера и хотя бы одно занятие в расписании' });
    }
    
    // Проверяем существование тренера
    const trainer = db.prepare('SELECT id FROM trainers WHERE id = ?').get(trainer_id);
    if (!trainer) {
      return res.status(400).json({ error: `Тренер с ID ${trainer_id} не найден` });
    }
    
    const createdTemplates = [];
    const errors = [];
    
    // Создаём шаблоны для каждого элемента расписания
    for (let i = 0; i < schedule_items.length; i++) {
      const item = schedule_items[i];
      
      try {
        // Проверяем обязательные поля
        if (!item.day_of_week || !item.direction_id || !item.hall_id || !item.start_time || !item.end_time) {
          errors.push(`Занятие ${i + 1}: не заполнены все обязательные поля`);
          continue;
        }
        
        // Проверяем существование зала и направления
        const hall = db.prepare('SELECT id FROM halls WHERE id = ?').get(item.hall_id);
        if (!hall) {
          errors.push(`Занятие ${i + 1}: зал с ID ${item.hall_id} не найден`);
          continue;
        }
        
        const direction = db.prepare('SELECT id FROM directions WHERE id = ?').get(item.direction_id);
        if (!direction) {
          errors.push(`Занятие ${i + 1}: направление с ID ${item.direction_id} не найдено`);
          continue;
        }
        
        // Убеждаемся, что day_of_week - это число (1=Пн, 2=Вт, 3=Ср, 4=Чт, 5=Пт, 6=Сб, 7=Вс)
        const dayOfWeek = parseInt(item.day_of_week);
        if (isNaN(dayOfWeek) || dayOfWeek < 1 || dayOfWeek > 7) {
          errors.push(`Занятие ${i + 1}: некорректный день недели: ${item.day_of_week} (должно быть 1-7)`);
          continue;
        }
        
        // Проверяем конфликты
        const conflicts = db.prepare(`
          SELECT * FROM recurring_lessons 
          WHERE hall_id = ? 
          AND day_of_week = ?
          AND is_active = 1
          AND (
            (start_time <= ? AND end_time > ?) OR
            (start_time < ? AND end_time >= ?) OR
            (start_time >= ? AND end_time <= ?)
          )
        `).all(
          item.hall_id, 
          dayOfWeek, // Используем преобразованное число
          item.start_time, item.start_time, 
          item.end_time, item.end_time, 
          item.start_time, item.end_time
        );
        
        if (conflicts.length > 0) {
          const dayNames = { 1: 'Пн', 2: 'Вт', 3: 'Ср', 4: 'Чт', 5: 'Пт', 6: 'Сб', 7: 'Вс' };
          errors.push(`Занятие ${i + 1}: конфликт в ${dayNames[dayOfWeek]} ${item.start_time}-${item.end_time}. Зал уже занят.`);
          continue;
        }
        
        // Логируем для отладки
        const dayNames = { 1: 'Пн', 2: 'Вт', 3: 'Ср', 4: 'Чт', 5: 'Пт', 6: 'Сб', 7: 'Вс' };
        console.log(`📝 Создание шаблона: ${dayNames[dayOfWeek]} ${item.start_time}-${item.end_time}`);
        
        // Создаём шаблон
        const result = db.prepare(`
          INSERT INTO recurring_lessons (
            hall_id, direction_id, trainer_id, day_of_week, 
            start_time, end_time, capacity, description
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          item.hall_id,
          item.direction_id,
          trainer_id,
          dayOfWeek, // Используем преобразованное число
          item.start_time,
          item.end_time,
          item.capacity || 6,
          item.description || null
        );
        
        // Получаем созданный шаблон
        const template = db.prepare(`
          SELECT 
            rl.*,
            d.name as direction_name,
            h.name as hall_name,
            t.name as trainer_name
          FROM recurring_lessons rl
          LEFT JOIN directions d ON rl.direction_id = d.id
          LEFT JOIN halls h ON rl.hall_id = h.id
          LEFT JOIN trainers t ON rl.trainer_id = t.id
          WHERE rl.id = ?
        `).get(result.lastInsertRowid);
        
        createdTemplates.push(template);
      } catch (itemError) {
        console.error(`Ошибка создания занятия ${i + 1}:`, itemError);
        errors.push(`Занятие ${i + 1}: ${itemError.message}`);
      }
    }
    
    if (createdTemplates.length === 0) {
      return res.status(400).json({ 
        error: 'Не удалось создать ни одного шаблона',
        details: errors
      });
    }
    
    if (errors.length > 0) {
      return res.status(207).json({ // 207 Multi-Status
        message: `Создано ${createdTemplates.length} из ${schedule_items.length} шаблонов`,
        templates: createdTemplates,
        warnings: errors
      });
    }
    
    res.status(201).json({ 
      message: `Создано ${createdTemplates.length} шаблонов расписания`,
      templates: createdTemplates
    });
  } catch (error) {
    console.error('Ошибка создания batch шаблонов:', error);
    console.error('Детали ошибки:', error.message);
    res.status(500).json({ 
      error: 'Ошибка создания шаблонов',
      message: error.message
    });
  }
});

// Удалить шаблон
router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    
    db.prepare('DELETE FROM recurring_lessons WHERE id = ?').run(id);
    
    res.json({ message: 'Шаблон удалён' });
  } catch (error) {
    console.error('Ошибка удаления шаблона:', error);
    res.status(500).json({ error: 'Ошибка удаления шаблона' });
  }
});

// Генерировать занятия на период
router.post('/generate', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { weeks } = req.body; // Если не указано, генерируем до конца года
    
    // Получаем только активные шаблоны с корректными данными
    const templates = db.prepare(`
      SELECT * FROM recurring_lessons 
      WHERE is_active = 1 
      AND day_of_week IS NOT NULL 
      AND day_of_week >= 1 
      AND day_of_week <= 7
      AND start_time IS NOT NULL 
      AND end_time IS NOT NULL
      AND hall_id IS NOT NULL
      AND direction_id IS NOT NULL
      AND trainer_id IS NOT NULL
    `).all();
    
    if (templates.length === 0) {
      return res.status(400).json({ error: 'Нет активных шаблонов расписания с корректными данными' });
    }
    
    console.log(`📋 Найдено ${templates.length} корректных шаблонов для генерации`);
    
    // Используем локальное время (UTC+4 для Самары/Ижевска)
    // Создаем дату в локальном времени, чтобы избежать проблем с часовыми поясами
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    today.setHours(0, 0, 0, 0);
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // Автоматически очищаем прошедшие занятия перед генерацией
    console.log('🧹 Очистка прошедших занятий...');
    const deletePastBookingsStmt = db.prepare('DELETE FROM bookings WHERE lesson_id IN (SELECT id FROM lessons WHERE lesson_date < ?)');
    const deletePastLessonsStmt = db.prepare('DELETE FROM lessons WHERE lesson_date < ?');
    
    const deletedBookings = deletePastBookingsStmt.run(todayStr);
    const deletedLessons = deletePastLessonsStmt.run(todayStr);
    
    if (deletedLessons.changes > 0) {
      console.log(`✅ Удалено ${deletedLessons.changes} прошедших занятий и ${deletedBookings.changes} связанных бронирований`);
    }
    
    let endDate;
    if (weeks) {
      // Генерируем на указанное количество недель
      endDate = new Date(today);
      endDate.setDate(endDate.getDate() + (weeks * 7));
    } else {
      // Генерируем до конца текущего года
      endDate = new Date(today.getFullYear(), 11, 31); // 31 декабря текущего года
      endDate.setHours(23, 59, 59, 999);
    }
    
    let generatedCount = 0;
    
    // Для каждого шаблона
    for (const template of templates) {
      // Убеждаемся, что day_of_week - это число (1=Пн, 2=Вт, 3=Ср, 4=Чт, 5=Пт, 6=Сб, 7=Вс)
      const templateDayOfWeek = parseInt(template.day_of_week);
      
      // Пропускаем шаблоны с некорректным day_of_week (должно быть 1-7)
      if (isNaN(templateDayOfWeek) || templateDayOfWeek < 1 || templateDayOfWeek > 7) {
        console.warn(`⚠️ Шаблон ID ${template.id} имеет некорректный day_of_week: ${template.day_of_week}, пропускаем`);
        continue;
      }
      
      // Конвертируем нашу систему (1-7) в JavaScript getDay() формат (0-6)
      // 1=Пн->1, 2=Вт->2, 3=Ср->3, 4=Чт->4, 5=Пт->5, 6=Сб->6, 7=Вс->0
      const jsDayOfWeek = templateDayOfWeek === 7 ? 0 : templateDayOfWeek;
      
      // Генерируем занятия на каждый день в периоде
      const currentDate = new Date(today);
      
      while (currentDate <= endDate) {
        // Проверяем, совпадает ли день недели (getDay() возвращает 0=Вс, 1=Пн, ..., 6=Сб)
        const currentDayOfWeek = currentDate.getDay();
        
        if (currentDayOfWeek === jsDayOfWeek) {
          // Используем локальное время вместо UTC, чтобы избежать смещения дня недели
          const year = currentDate.getFullYear();
          const month = String(currentDate.getMonth() + 1).padStart(2, '0');
          const day = String(currentDate.getDate()).padStart(2, '0');
          const lessonDateStr = `${year}-${month}-${day}`;
          
          // Логируем для отладки (только в development)
          if (process.env.NODE_ENV === 'development') {
            const dayNames = { 1: 'Пн', 2: 'Вт', 3: 'Ср', 4: 'Чт', 5: 'Пт', 6: 'Сб', 7: 'Вс' };
            const jsDayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
            console.log(`📅 Генерация занятия:`);
            console.log(`   Дата: ${lessonDateStr} (${jsDayNames[currentDayOfWeek]})`);
            console.log(`   Шаблон ID: ${template.id}`);
            console.log(`   День недели в шаблоне: ${templateDayOfWeek} (${dayNames[templateDayOfWeek]})`);
            console.log(`   Конвертация в JS: ${jsDayOfWeek} (${jsDayNames[jsDayOfWeek]})`);
            console.log(`   Текущий день недели: ${currentDayOfWeek} (${jsDayNames[currentDayOfWeek]})`);
            console.log(`   Совпадение: ${currentDayOfWeek === jsDayOfWeek ? '✅' : '❌'}`);
          }
          
          // Проверяем, не существует ли уже занятие
          const existing = db.prepare(`
            SELECT * FROM lessons 
            WHERE lesson_date = ? 
            AND hall_id = ? 
            AND start_time = ?
          `).get(lessonDateStr, template.hall_id, template.start_time);
          
          if (!existing) {
            // Создаём занятие
            const insertResult = db.prepare(`
              INSERT INTO lessons (
                hall_id, direction_id, trainer_id, lesson_date,
                start_time, end_time, capacity, description,
                recurring_lesson_id, is_active
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            `).run(
              template.hall_id,
              template.direction_id,
              template.trainer_id,
              lessonDateStr,
              template.start_time,
              template.end_time,
              template.capacity,
              template.description,
              template.id
            );
            
            const newLessonId = insertResult.lastInsertRowid;
            generatedCount++;
            
            // АВТОМАТИЧЕСКАЯ ЗАПИСЬ: Находим пользователей с подходящими абонементами
            try {
              const dayOfWeek = currentDate.getDay();
              // Конвертируем JS day (0-6) в нашу систему (1-7)
              const templateDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
              
              // Получаем все активные абонементы с автоматической записью
              // Сначала проверяем абонементы с конкретными занятиями (auto_lessons)
              const autoSubscriptionsWithLessons = db.prepare(`
                SELECT 
                  s.*,
                  u.telegram_id
                FROM subscriptions s
                JOIN users u ON s.user_id = u.id
                WHERE s.booking_type = 'automatic'
                  AND s.status = 'confirmed'
                  AND s.is_active = 1
                  AND s.lessons_remaining > 0
                  AND s.auto_lessons IS NOT NULL
              `).all();
              
              // Проверяем абонементы с конкретными занятиями
              for (const sub of autoSubscriptionsWithLessons) {
                try {
                  const autoLessons = sub.auto_lessons ? JSON.parse(sub.auto_lessons) : [];
                  
                  // Проверяем, есть ли в списке занятие, которое соответствует текущему
                  const matchingLesson = autoLessons.find((lesson) => {
                    const lessonDay = lesson.day_of_week;
                    const matchesDay = lessonDay === templateDayOfWeek;
                    const matchesDirection = lesson.direction_id === template.direction_id;
                    const matchesTime = lesson.start_time === template.start_time && lesson.end_time === template.end_time;
                    const matchesTrainer = !lesson.trainer_id || lesson.trainer_id === template.trainer_id;
                    const matchesHall = !lesson.hall_id || lesson.hall_id === template.hall_id;
                    
                    return matchesDay && matchesDirection && matchesTime && matchesTrainer && matchesHall;
                  });
                  
                  if (!matchingLesson) {
                    continue;
                  }
                  
                  // Проверяем, не записан ли уже пользователь
                  const existingBooking = db.prepare(`
                    SELECT id FROM bookings 
                    WHERE user_id = ? AND lesson_id = ?
                  `).get(sub.user_id, newLessonId);
                  
                  if (existingBooking) {
                    continue;
                  }
                  
                  // Проверяем, есть ли свободные места
                  const lesson = db.prepare(`
                    SELECT current_bookings, capacity FROM lessons WHERE id = ?
                  `).get(newLessonId);
                  
                  if (lesson.current_bookings >= lesson.capacity) {
                    continue;
                  }
                  
                  // Создаём автоматическую запись
                  db.prepare(`
                    INSERT INTO bookings (
                      user_id, lesson_id, subscription_id, 
                      booking_date, status
                    ) VALUES (?, ?, ?, datetime('now'), 'confirmed')
                  `).run(sub.user_id, newLessonId, sub.id);
                  
                  // Обновляем счётчики
                  db.prepare(`
                    UPDATE lessons 
                    SET current_bookings = current_bookings + 1 
                    WHERE id = ?
                  `).run(newLessonId);
                  
                  // Уменьшаем оставшиеся занятия
                  db.prepare(`
                    UPDATE subscriptions 
                    SET lessons_remaining = lessons_remaining - 1 
                    WHERE id = ?
                  `).run(sub.id);
                  
                  console.log(`✅ Автозапись (конкретное занятие): пользователь ${sub.user_id} записан на занятие ${newLessonId}`);
                  
                } catch (bookingErr) {
                  console.error(`Ошибка автозаписи для подписки ${sub.id}:`, bookingErr.message);
                }
              }
              
              // Также проверяем абонементы со старым способом (для обратной совместимости)
              const autoSubscriptions = db.prepare(`
                SELECT 
                  s.*,
                  u.telegram_id
                FROM subscriptions s
                JOIN users u ON s.user_id = u.id
                WHERE s.booking_type = 'automatic'
                  AND s.status = 'confirmed'
                  AND s.is_active = 1
                  AND s.lessons_remaining > 0
                  AND s.auto_lessons IS NULL
                  AND s.auto_hall_id = ?
                  AND s.auto_trainer_id = ?
                  AND s.auto_start_time = ?
                  AND s.auto_end_time = ?
              `).all(
                template.hall_id,
                template.trainer_id,
                template.start_time,
                template.end_time
              );
              
              // Фильтруем по направлениям и дням недели (старый способ)
              for (const sub of autoSubscriptions) {
                try {
                  const autoDirections = sub.auto_directions ? JSON.parse(sub.auto_directions) : [];
                  const autoWeekdays = sub.auto_weekdays ? JSON.parse(sub.auto_weekdays) : [];
                  
                  // Проверяем, подходит ли это занятие
                  const matchesDirection = autoDirections.includes(template.direction_id);
                  const matchesWeekday = autoWeekdays.includes(dayOfWeek);
                  
                  if (!matchesDirection || !matchesWeekday) {
                    continue;
                  }
                  
                  // Проверяем, не записан ли уже пользователь
                  const existingBooking = db.prepare(`
                    SELECT id FROM bookings 
                    WHERE user_id = ? AND lesson_id = ?
                  `).get(sub.user_id, newLessonId);
                  
                  if (existingBooking) {
                    continue;
                  }
                  
                  // Проверяем, есть ли свободные места
                  const lesson = db.prepare(`
                    SELECT current_bookings, capacity FROM lessons WHERE id = ?
                  `).get(newLessonId);
                  
                  if (lesson.current_bookings >= lesson.capacity) {
                    continue;
                  }
                  
                  // Создаём автоматическую запись
                  db.prepare(`
                    INSERT INTO bookings (
                      user_id, lesson_id, subscription_id, 
                      booking_date, status
                    ) VALUES (?, ?, ?, datetime('now'), 'confirmed')
                  `).run(sub.user_id, newLessonId, sub.id);
                  
                  // Обновляем счётчики
                  db.prepare(`
                    UPDATE lessons 
                    SET current_bookings = current_bookings + 1 
                    WHERE id = ?
                  `).run(newLessonId);
                  
                  // Уменьшаем оставшиеся занятия
                  db.prepare(`
                    UPDATE subscriptions 
                    SET lessons_remaining = lessons_remaining - 1 
                    WHERE id = ?
                  `).run(sub.id);
                  
                  console.log(`✅ Автозапись: пользователь ${sub.user_id} записан на занятие ${newLessonId}`);
                  
                } catch (bookingErr) {
                  console.error(`Ошибка автозаписи для подписки ${sub.id}:`, bookingErr.message);
                }
              }
            } catch (autoBookingErr) {
              console.error(`Ошибка автоматической записи для занятия ${newLessonId}:`, autoBookingErr.message);
            }
          }
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    
    const periodDescription = weeks 
      ? `${weeks} недель вперёд` 
      : `до конца ${today.getFullYear()} года`;
    
    res.json({ 
      message: `Создано ${generatedCount} занятий ${periodDescription}`,
      generated: generatedCount
    });
  } catch (error) {
    console.error('Ошибка генерации занятий:', error);
    res.status(500).json({ error: 'Ошибка генерации занятий' });
  }
});

module.exports = router;
