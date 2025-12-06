const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Получить записи пользователя (только предстоящие)
router.get('/my', authMiddleware, (req, res) => {
  try {
    const userId = req.userId;
    
    const stmt = db.prepare(`
      SELECT 
        b.*,
        l.lesson_date,
        l.start_time,
        l.end_time,
        l.description as lesson_description,
        d.name as direction_name,
        d.color as direction_color,
        h.name as hall_name,
        h.address as hall_address,
        TRIM(t.name || ' ' || COALESCE(t.last_name, '')) as trainer_name,
        s.subscription_name,
        s.lessons_remaining
      FROM bookings b
      LEFT JOIN lessons l ON b.lesson_id = l.id
      LEFT JOIN directions d ON l.direction_id = d.id
      LEFT JOIN halls h ON l.hall_id = h.id
      LEFT JOIN trainers t ON l.trainer_id = t.id
      LEFT JOIN (
        SELECT 
          sub.id,
          sub.lessons_remaining,
          st.name as subscription_name
        FROM subscriptions sub
        LEFT JOIN subscription_types st ON sub.subscription_type_id = st.id
      ) s ON b.subscription_id = s.id
      WHERE b.user_id = ? 
      AND b.status = 'confirmed'
      AND l.lesson_date >= date('now')
      ORDER BY l.lesson_date ASC, l.start_time ASC
    `);
    
    const bookings = stmt.all(userId);
    
    res.json({ bookings });
  } catch (error) {
    console.error('Ошибка получения записей:', error);
    res.status(500).json({ error: 'Ошибка получения записей' });
  }
});

// Получить все записи пользователя (включая прошедшие)
router.get('/my/all', authMiddleware, (req, res) => {
  try {
    const userId = req.userId;
    
    const stmt = db.prepare(`
      SELECT 
        b.*,
        l.lesson_date,
        l.start_time,
        l.end_time,
        l.description as lesson_description,
        d.name as direction_name,
        d.color as direction_color,
        h.name as hall_name,
        h.address as hall_address,
        TRIM(t.name || ' ' || COALESCE(t.last_name, '')) as trainer_name,
        s.subscription_name,
        s.lessons_remaining
      FROM bookings b
      LEFT JOIN lessons l ON b.lesson_id = l.id
      LEFT JOIN directions d ON l.direction_id = d.id
      LEFT JOIN halls h ON l.hall_id = h.id
      LEFT JOIN trainers t ON l.trainer_id = t.id
      LEFT JOIN (
        SELECT 
          sub.id,
          sub.lessons_remaining,
          st.name as subscription_name
        FROM subscriptions sub
        LEFT JOIN subscription_types st ON sub.subscription_type_id = st.id
      ) s ON b.subscription_id = s.id
      WHERE b.user_id = ? 
      AND b.status = 'confirmed'
      ORDER BY l.lesson_date DESC, l.start_time DESC
    `);
    
    const bookings = stmt.all(userId);
    
    res.json({ bookings });
  } catch (error) {
    console.error('Ошибка получения всех записей:', error);
    res.status(500).json({ error: 'Ошибка получения всех записей' });
  }
});

// Получить все записи (только админ)
router.get('/', adminMiddleware, (req, res) => {
  try {
    const { status, date, lesson_id } = req.query;
    
    let query = `
      SELECT 
        b.*,
        l.lesson_date,
        l.start_time,
        l.end_time,
        d.name as direction_name,
        h.name as hall_name,
        TRIM(t.name || ' ' || COALESCE(t.last_name, '')) as trainer_name,
        u.first_name,
        u.last_name,
        u.phone,
        u.telegram_id
      FROM bookings b
      LEFT JOIN lessons l ON b.lesson_id = l.id
      LEFT JOIN directions d ON l.direction_id = d.id
      LEFT JOIN halls h ON l.hall_id = h.id
      LEFT JOIN trainers t ON l.trainer_id = t.id
      LEFT JOIN users u ON b.user_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }
    
    if (date) {
      query += ' AND l.lesson_date = ?';
      params.push(date);
    }
    
    if (lesson_id) {
      query += ' AND b.lesson_id = ?';
      params.push(lesson_id);
    }
    
    query += ' ORDER BY l.lesson_date DESC, l.start_time DESC';
    
    const stmt = db.prepare(query);
    const bookings = stmt.all(...params);
    
    res.json({ bookings });
  } catch (error) {
    console.error('Ошибка получения записей:', error);
    res.status(500).json({ error: 'Ошибка получения записей' });
  }
});

// Создать запись на занятие
router.post('/', authMiddleware, (req, res) => {
  try {
    const userId = req.userId;
    const { lesson_id, subscription_id } = req.body;
    
    if (!lesson_id || !subscription_id) {
      return res.status(400).json({ error: 'Укажите занятие и абонемент' });
    }
    
    // Проверяем, что занятие существует и не заполнено
    const lesson = db.prepare(`
      SELECT l.*, d.requires_pole, d.name as direction_name
      FROM lessons l
      LEFT JOIN directions d ON l.direction_id = d.id
      WHERE l.id = ? AND l.is_active = 1 AND l.lesson_date >= date('now')
    `).get(lesson_id);
    
    if (!lesson) {
      return res.status(404).json({ error: 'Занятие не найдено или уже прошло' });
    }
    
    if (lesson.current_bookings >= lesson.capacity) {
      return res.status(400).json({ error: 'Все места заняты' });
    }
    
    // Проверяем абонемент пользователя
    const subscription = db.prepare(`
      SELECT s.*, st.category, st.pole_lessons, st.fitness_lessons
      FROM subscriptions s
      LEFT JOIN subscription_types st ON s.subscription_type_id = st.id
      WHERE s.id = ? AND s.user_id = ? AND s.status = 'confirmed' AND s.is_active = 1
    `).get(subscription_id, userId);
    
    if (!subscription) {
      return res.status(400).json({ error: 'Абонемент не найден или неактивен' });
    }
    
    // Проверяем, не является ли это абонементом с автоматической записью
    if (subscription.booking_type === 'automatic' && subscription.auto_lessons) {
      return res.status(403).json({ 
        error: 'У вас абонемент с автоматической записью. Вы уже записаны на выбранные занятия автоматически. Ручная запись недоступна.' 
      });
    }
    
    if (subscription.lessons_remaining <= 0) {
      return res.status(400).json({ error: 'У вас закончились занятия' });
    }
    
    // ПРОВЕРКА ДОСТУПА К НАПРАВЛЕНИЮ
    const requiresPole = lesson.requires_pole === 1;
    
    if (subscription.category === 'fitness' && requiresPole) {
      return res.status(403).json({ 
        error: `Ваш абонемент "Только фитнес" не распространяется на занятия с пилоном (${lesson.direction_name}). Выберите занятие без пилона: Сила&Гибкость, Choreo, Strip или Растяжка.` 
      });
    }
    
    if (subscription.category === 'combo') {
      // Для комбо-абонемента проверяем лимиты
      if (requiresPole && subscription.pole_lessons_remaining <= 0) {
        return res.status(403).json({ 
          error: `У вас закончились занятия с пилоном. Осталось только ${subscription.fitness_lessons_remaining} фитнес-занятий.` 
        });
      }
      if (!requiresPole && subscription.fitness_lessons_remaining <= 0) {
        return res.status(403).json({ 
          error: `У вас закончились фитнес-занятия. Осталось только ${subscription.pole_lessons_remaining} занятий с пилоном.` 
        });
      }
    }
    
    // Проверяем, не записан ли уже пользователь
    const existing = db.prepare(`
      SELECT * FROM bookings 
      WHERE user_id = ? AND lesson_id = ? AND status = 'confirmed'
    `).get(userId, lesson_id);
    
    if (existing) {
      return res.status(400).json({ error: 'Вы уже записаны на это занятие' });
    }
    
    // Создаём запись
    const result = db.prepare(`
      INSERT INTO bookings (
        user_id, lesson_id, subscription_id, booking_date, status
      ) VALUES (?, ?, ?, date('now'), 'confirmed')
    `).run(userId, lesson_id, subscription_id);
    
    // Обновляем счётчики
    db.prepare('UPDATE lessons SET current_bookings = current_bookings + 1 WHERE id = ?').run(lesson_id);
    db.prepare('UPDATE subscriptions SET lessons_remaining = lessons_remaining - 1 WHERE id = ?').run(subscription_id);
    
    // Для комбо-абонементов обновляем раздельные счётчики
    if (subscription.category === 'combo') {
      if (requiresPole) {
        db.prepare('UPDATE subscriptions SET pole_lessons_remaining = pole_lessons_remaining - 1 WHERE id = ?').run(subscription_id);
      } else {
        db.prepare('UPDATE subscriptions SET fitness_lessons_remaining = fitness_lessons_remaining - 1 WHERE id = ?').run(subscription_id);
      }
    }
    
    res.status(201).json({ 
      message: 'Вы успешно записаны!',
      booking_id: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Ошибка создания записи:', error);
    res.status(500).json({ error: 'Ошибка создания записи' });
  }
});

// Отменить запись
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    
    // Получаем запись с полной информацией об абонементе
    const booking = db.prepare(`
      SELECT 
        b.*, 
        l.lesson_date, 
        l.start_time, 
        l.id as lesson_id, 
        l.direction_id as lesson_direction_id,
        d.requires_pole,
        s.id as subscription_id, 
        s.booking_type,
        s.auto_lessons,
        s.valid_from,
        s.valid_until,
        s.user_id as subscription_user_id,
        s.created_at,
        st.category
      FROM bookings b
      LEFT JOIN lessons l ON b.lesson_id = l.id
      LEFT JOIN directions d ON l.direction_id = d.id
      LEFT JOIN subscriptions s ON b.subscription_id = s.id
      LEFT JOIN subscription_types st ON s.subscription_type_id = st.id
      WHERE b.id = ? AND b.user_id = ?
    `).get(id, userId);
    
    if (!booking) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }
    
    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Запись уже отменена' });
    }
    
    // Проверяем условия отмены записи
    const lessonDate = new Date(booking.lesson_date);
    const startTime = booking.start_time || '00:00';
    const [startHour, startMinute] = startTime.split(':').map(Number);
    
    // Создаем дату и время начала занятия
    const lessonDateTime = new Date(lessonDate);
    lessonDateTime.setHours(startHour, startMinute, 0, 0);
    
    const now = new Date();
    const isMorningLesson = startHour < 17; // Занятие до 17:00 считается утренним
    
    let canCancel = false;
    let errorMessage = '';
    
    if (isMorningLesson) {
      // Утреннее занятие: можно отменить до 21:00 предыдущего дня
      const previousDay = new Date(lessonDate);
      previousDay.setDate(previousDay.getDate() - 1);
      previousDay.setHours(21, 0, 0, 0); // 21:00 предыдущего дня
      
      canCancel = now < previousDay;
      if (!canCancel) {
        errorMessage = 'Отменить утреннее занятие можно только до 21:00 предыдущего дня';
      }
    } else {
      // Вечернее занятие: можно отменить не позднее чем за 4 часа до начала
      const cancelDeadline = new Date(lessonDateTime);
      cancelDeadline.setHours(cancelDeadline.getHours() - 4);
      
      canCancel = now < cancelDeadline;
      if (!canCancel) {
        errorMessage = 'Отменить вечернее занятие можно не позднее чем за 4 часа до начала';
      }
    }
    
    if (!canCancel) {
      return res.status(400).json({ error: errorMessage });
    }
    
    // Отменяем запись
    db.prepare(`
      UPDATE bookings 
      SET status = 'cancelled', cancelled_at = datetime('now')
      WHERE id = ?
    `).run(id);
    
    // Возвращаем занятие в абонемент и освобождаем место
    db.prepare('UPDATE lessons SET current_bookings = current_bookings - 1 WHERE id = ?').run(booking.lesson_id);
    
    // Получаем текущее состояние абонемента для проверки лимитов
    const currentSubscription = db.prepare(`
      SELECT 
        s.lessons_remaining,
        s.pole_lessons_remaining,
        s.fitness_lessons_remaining,
        st.lesson_count,
        st.pole_lessons,
        st.fitness_lessons
      FROM subscriptions s
      LEFT JOIN subscription_types st ON s.subscription_type_id = st.id
      WHERE s.id = ?
    `).get(booking.subscription_id);
    
    // Если это абонемент с автоматической записью, ищем новое подходящее занятие
    let newBookingCreated = false;
    if (booking.booking_type === 'automatic' && booking.auto_lessons && booking.subscription_user_id === userId) {
      try {
        console.log(`🔄 Абонемент с автоматической записью. Ищем новое занятие для замены отмененного...`);
        
        const autoLessons = JSON.parse(booking.auto_lessons);
        const validFrom = new Date(booking.valid_from || booking.created_at);
        const validUntil = new Date(booking.valid_until);
        const validFromStr = validFrom.toISOString().split('T')[0];
        const validUntilStr = validUntil.toISOString().split('T')[0];
        
        // Находим все занятия в периоде действия абонемента
        const allLessons = db.prepare(`
          SELECT l.*, d.requires_pole
          FROM lessons l
          LEFT JOIN directions d ON l.direction_id = d.id
          WHERE l.is_active = 1 
          AND l.lesson_date >= date(?) 
          AND l.lesson_date <= date(?)
          ORDER BY l.lesson_date, l.start_time
        `).all(validFromStr, validUntilStr);
        
        // Ищем подходящее занятие из auto_lessons, которое еще не записано
        for (const autoLesson of autoLessons) {
          // Конвертируем день недели из нашей системы (1-7) в JavaScript (0-6)
          const jsDayOfWeek = autoLesson.day_of_week === 7 ? 0 : autoLesson.day_of_week;
          
          for (const lesson of allLessons) {
            // Пропускаем отмененное занятие
            if (lesson.id === booking.lesson_id) continue;
            
            // Проверяем соответствие параметрам
            const lessonDate = new Date(lesson.lesson_date);
            const lessonDayOfWeek = lessonDate.getDay(); // 0-6 (0=Вс, 1=Пн, ..., 6=Сб)
            
            // Проверяем день недели
            if (lessonDayOfWeek !== jsDayOfWeek) continue;
            
            // Проверяем направление
            if (lesson.direction_id !== autoLesson.direction_id) continue;
            
            // Проверяем время
            if (lesson.start_time !== autoLesson.start_time || lesson.end_time !== autoLesson.end_time) continue;
            
            // Проверяем зал
            if (lesson.hall_id !== autoLesson.hall_id) continue;
            
            // Проверяем, не записан ли уже пользователь на это занятие
            const existingBooking = db.prepare(`
              SELECT id FROM bookings 
              WHERE user_id = ? AND lesson_id = ? AND subscription_id = ? AND status = 'confirmed'
            `).get(userId, lesson.id, booking.subscription_id);
            
            if (existingBooking) continue;
            
            // Проверяем, есть ли свободные места
            if (lesson.current_bookings >= lesson.capacity) continue;
            
            // Проверяем, есть ли еще занятия в абонементе
            const currentSub = db.prepare('SELECT lessons_remaining FROM subscriptions WHERE id = ?').get(booking.subscription_id);
            if (!currentSub || currentSub.lessons_remaining <= 0) break;
            
            // Для комбо-абонементов проверяем тип занятия и баланс
            if (booking.category === 'combo') {
              const requiresPole = lesson.requires_pole === 1;
              const subCheck = db.prepare(`
                SELECT pole_lessons_remaining, fitness_lessons_remaining 
                FROM subscriptions WHERE id = ?
              `).get(booking.subscription_id);
              
              if (requiresPole && subCheck.pole_lessons_remaining <= 0) {
                // Нет занятий с пилоном в балансе
                continue;
              }
              if (!requiresPole && subCheck.fitness_lessons_remaining <= 0) {
                // Нет фитнес-занятий в балансе
                continue;
              }
            }
            
            // Создаём новую автоматическую запись
            db.prepare(`
              INSERT INTO bookings (
                user_id, lesson_id, subscription_id, 
                booking_date, status
              ) VALUES (?, ?, ?, datetime('now'), 'confirmed')
            `).run(userId, lesson.id, booking.subscription_id);
            
            // Обновляем счётчики
            db.prepare(`
              UPDATE lessons 
              SET current_bookings = current_bookings + 1 
              WHERE id = ?
            `).run(lesson.id);
            
            // НЕ возвращаем занятие на баланс и НЕ уменьшаем lessons_remaining
            // так как мы просто переносим запись с одного занятия на другое
            
            newBookingCreated = true;
            console.log(`✅ Создана новая автоматическая запись на занятие ${lesson.id} (${lesson.lesson_date} ${lesson.start_time}) вместо отмененного`);
            break;
          }
          
          if (newBookingCreated) break;
        }
        
        if (!newBookingCreated) {
          console.log(`⚠️ Не найдено подходящее занятие для автоматической замены. Занятие возвращено на баланс.`);
          // Если не нашли подходящее занятие, возвращаем на баланс
          if (currentSubscription && currentSubscription.lessons_remaining < currentSubscription.lesson_count) {
            db.prepare('UPDATE subscriptions SET lessons_remaining = lessons_remaining + 1 WHERE id = ?').run(booking.subscription_id);
          }
          
          // Для комбо-абонементов возвращаем в соответствующий счётчик
          if (booking.category === 'combo' && currentSubscription) {
            const requiresPole = booking.requires_pole === 1;
            if (requiresPole) {
              if (currentSubscription.pole_lessons_remaining < (currentSubscription.pole_lessons || 0)) {
                db.prepare('UPDATE subscriptions SET pole_lessons_remaining = pole_lessons_remaining + 1 WHERE id = ?').run(booking.subscription_id);
              }
            } else {
              if (currentSubscription.fitness_lessons_remaining < (currentSubscription.fitness_lessons || 0)) {
                db.prepare('UPDATE subscriptions SET fitness_lessons_remaining = fitness_lessons_remaining + 1 WHERE id = ?').run(booking.subscription_id);
              }
            }
          }
        }
      } catch (autoBookingError) {
        console.error('Ошибка автоматической замены записи:', autoBookingError);
        // В случае ошибки возвращаем занятие на баланс
        if (currentSubscription && currentSubscription.lessons_remaining < currentSubscription.lesson_count) {
          db.prepare('UPDATE subscriptions SET lessons_remaining = lessons_remaining + 1 WHERE id = ?').run(booking.subscription_id);
        }
        
        // Для комбо-абонементов возвращаем в соответствующий счётчик
        if (booking.category === 'combo' && currentSubscription) {
          const requiresPole = booking.requires_pole === 1;
          if (requiresPole) {
            if (currentSubscription.pole_lessons_remaining < (currentSubscription.pole_lessons || 0)) {
              db.prepare('UPDATE subscriptions SET pole_lessons_remaining = pole_lessons_remaining + 1 WHERE id = ?').run(booking.subscription_id);
            }
          } else {
            if (currentSubscription.fitness_lessons_remaining < (currentSubscription.fitness_lessons || 0)) {
              db.prepare('UPDATE subscriptions SET fitness_lessons_remaining = fitness_lessons_remaining + 1 WHERE id = ?').run(booking.subscription_id);
            }
          }
        }
      }
    } else {
      // Для обычных абонементов возвращаем занятие на баланс
      if (currentSubscription && currentSubscription.lessons_remaining < currentSubscription.lesson_count) {
        db.prepare('UPDATE subscriptions SET lessons_remaining = lessons_remaining + 1 WHERE id = ?').run(booking.subscription_id);
        console.log(`✅ Возвращено занятие в баланс абонемента ${booking.subscription_id}`);
      }
      
      // Для комбо-абонементов возвращаем в соответствующий счётчик
      if (booking.category === 'combo' && currentSubscription) {
        const requiresPole = booking.requires_pole === 1;
        if (requiresPole) {
          if (currentSubscription.pole_lessons_remaining < (currentSubscription.pole_lessons || 0)) {
            db.prepare('UPDATE subscriptions SET pole_lessons_remaining = pole_lessons_remaining + 1 WHERE id = ?').run(booking.subscription_id);
            console.log(`✅ Возвращено занятие с пилоном в баланс комбо-абонемента ${booking.subscription_id}`);
          }
        } else {
          if (currentSubscription.fitness_lessons_remaining < (currentSubscription.fitness_lessons || 0)) {
            db.prepare('UPDATE subscriptions SET fitness_lessons_remaining = fitness_lessons_remaining + 1 WHERE id = ?').run(booking.subscription_id);
            console.log(`✅ Возвращено фитнес-занятие в баланс комбо-абонемента ${booking.subscription_id}`);
          }
        }
      }
    }
    
    const message = newBookingCreated 
      ? 'Запись отменена. Создана новая автоматическая запись на подходящее занятие.'
      : 'Запись отменена. Занятие возвращено на баланс абонемента.';
    
    res.json({ message });
  } catch (error) {
    console.error('Ошибка отмены записи:', error);
    res.status(500).json({ error: 'Ошибка отмены записи' });
  }
});

module.exports = router;
