const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Убеждаемся, что таблица subscription_freezes существует
try {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS subscription_freezes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subscription_id INTEGER NOT NULL,
      freeze_start_date DATE NOT NULL,
      freeze_end_date DATE NOT NULL,
      freeze_days INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
    )
  `).run();
  console.log('✅ Таблица subscription_freezes проверена/создана');
} catch (error) {
  console.error('⚠️ Ошибка при создании таблицы subscription_freezes:', error);
}

// Создать заявку на абонемент (для клиентов)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      subscriptionTypeId,
      bookingType = 'flexible',
      // Данные для автоматической записи (старый способ)
      autoDirections,
      autoTrainerId,
      autoHallId,
      autoStartTime,
      autoEndTime,
      autoWeekdays,
      // Данные для автоматической записи (новый способ - конкретные занятия)
      autoLessons,
      // Контактные данные
      firstName,
      lastName,
      phone,
      address
    } = req.body;

    // Валидация
    if (!subscriptionTypeId) {
      return res.status(400).json({ error: 'subscriptionTypeId is required' });
    }
    
    if (!address) {
      return res.status(400).json({ error: 'address is required' });
    }

    // Получаем тип абонемента (нужен для валидации)
    const subscriptionType = db.prepare(
      'SELECT * FROM subscription_types WHERE id = ? AND is_active = 1'
    ).get(subscriptionTypeId);

    if (!subscriptionType) {
      return res.status(404).json({ error: 'Subscription type not found' });
    }

    // Валидация для автоматической записи
    if (bookingType === 'automatic') {
      // Для всех абонементов: проверяем конкретные занятия из расписания
      if (autoLessons && Array.isArray(autoLessons) && autoLessons.length > 0) {
        // Проверяем каждое занятие
        for (let i = 0; i < autoLessons.length; i++) {
          const lesson = autoLessons[i];
          if (!lesson.day_of_week || lesson.day_of_week < 1 || lesson.day_of_week > 7) {
            return res.status(400).json({ error: `Некорректный день недели для занятия ${i + 1}` });
          }
          if (!lesson.direction_id) {
            return res.status(400).json({ error: `Выберите направление для занятия ${i + 1}` });
          }
          if (!lesson.start_time || !lesson.end_time) {
            return res.status(400).json({ error: `Укажите время для занятия ${i + 1}` });
          }
          if (!lesson.hall_id) {
            return res.status(400).json({ error: `Некорректный зал для занятия ${i + 1}` });
          }
        }
      } else if (autoDirections && Array.isArray(autoDirections) && autoDirections.length > 0) {
        // Старый способ (для обратной совместимости)
        if (!autoTrainerId) {
          return res.status(400).json({ error: 'Выберите тренера для автоматической записи' });
        }
        if (!autoHallId) {
          return res.status(400).json({ error: 'Выберите зал для автоматической записи' });
        }
        if (!autoStartTime || !autoEndTime) {
          return res.status(400).json({ error: 'Укажите время занятий для автоматической записи' });
        }
        if (!autoWeekdays || !Array.isArray(autoWeekdays) || autoWeekdays.length === 0) {
          return res.status(400).json({ error: 'Выберите дни недели для автоматической записи' });
        }
      } else {
        return res.status(400).json({ error: 'Выберите хотя бы одно занятие из расписания для автоматической записи' });
      }
    }

    // Обновляем информацию пользователя если предоставлена
    if (firstName || lastName || phone) {
      db.prepare(`
        UPDATE users 
        SET first_name = COALESCE(?, first_name),
            last_name = COALESCE(?, last_name),
            phone = COALESCE(?, phone),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(firstName, lastName, phone, userId);
    }

    // Создаем заявку на абонемент (статус: pending)
    const now = new Date();
    const validUntil = new Date(now);
    validUntil.setDate(validUntil.getDate() + subscriptionType.validity_days);

    // Определяем, какие данные сохранять для автоматической записи
    let autoLessonsData = null;
    let autoDirectionsData = null;
    let autoTrainerIdData = null;
    let autoHallIdData = null;
    let autoStartTimeData = null;
    let autoEndTimeData = null;
    let autoWeekdaysData = null;
    
    if (bookingType === 'automatic') {
      if (autoLessons && Array.isArray(autoLessons) && autoLessons.length > 0) {
        // Для всех абонементов: сохраняем конкретные занятия из расписания
        autoLessonsData = JSON.stringify(autoLessons);
      } else if (autoDirections && Array.isArray(autoDirections) && autoDirections.length > 0) {
        // Старый способ (для обратной совместимости)
        autoDirectionsData = JSON.stringify(autoDirections);
        autoTrainerIdData = autoTrainerId;
        autoHallIdData = autoHallId;
        autoStartTimeData = autoStartTime;
        autoEndTimeData = autoEndTime;
        autoWeekdaysData = JSON.stringify(autoWeekdays);
      }
    }
    
    const result = db.prepare(`
      INSERT INTO subscriptions (
        user_id, 
        subscription_type_id, 
        lessons_remaining,
        pole_lessons_remaining,
        fitness_lessons_remaining,
        valid_from,
        valid_until,
        booking_type,
        auto_directions,
        auto_trainer_id,
        auto_hall_id,
        auto_start_time,
        auto_end_time,
        auto_weekdays,
        auto_lessons,
        address,
        status,
        is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0)
    `).run(
      userId,
      subscriptionTypeId,
      subscriptionType.lesson_count,
      subscriptionType.pole_lessons || 0,
      subscriptionType.fitness_lessons || 0,
      now.toISOString(),
      validUntil.toISOString(),
      bookingType,
      autoDirectionsData,
      autoTrainerIdData,
      autoHallIdData,
      autoStartTimeData,
      autoEndTimeData,
      autoWeekdaysData,
      autoLessonsData,
      address
    );

    const subscription = db.prepare(`
      SELECT 
        s.*,
        st.name as subscription_name,
        st.category,
        st.price,
        u.first_name,
        u.last_name,
        u.phone,
        u.username
      FROM subscriptions s
      JOIN subscription_types st ON s.subscription_type_id = st.id
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `).get(result.lastInsertRowid);

    res.json({
      message: 'Заявка на абонемент создана и ожидает подтверждения администратором',
      subscription: {
        ...subscription,
        auto_weekdays: subscription.auto_weekdays ? JSON.parse(subscription.auto_weekdays) : null
      }
    });

  } catch (error) {
    console.error('Error creating subscription request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить свои абонементы (для клиентов)
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const subscriptions = db.prepare(`
      SELECT 
        s.*,
        st.name as subscription_name,
        st.category,
        st.price,
        st.lesson_count,
        st.pole_lessons,
        st.fitness_lessons,
        t.name as auto_trainer_name,
        h.name as auto_hall_name
      FROM subscriptions s
      JOIN subscription_types st ON s.subscription_type_id = st.id
      LEFT JOIN trainers t ON s.auto_trainer_id = t.id
      LEFT JOIN halls h ON s.auto_hall_id = h.id
      WHERE s.user_id = ?
      ORDER BY s.created_at DESC
    `).all(userId);

    res.json({
      subscriptions: subscriptions.map(sub => ({
        ...sub,
        auto_weekdays: sub.auto_weekdays ? JSON.parse(sub.auto_weekdays) : null,
        auto_directions: sub.auto_directions ? JSON.parse(sub.auto_directions) : null
      }))
    });

  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить все заявки на абонементы (для админа)
router.get('/requests', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status = 'pending' } = req.query;

    let query = `
      SELECT 
        s.*,
        st.name as subscription_name,
        st.category,
        st.price,
        st.lesson_count,
        st.pole_lessons,
        st.fitness_lessons,
        u.first_name,
        u.last_name,
        u.phone,
        u.username,
        u.telegram_id,
        t.name as auto_trainer_name,
        h.name as auto_hall_name
      FROM subscriptions s
      JOIN subscription_types st ON s.subscription_type_id = st.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN trainers t ON s.auto_trainer_id = t.id
      LEFT JOIN halls h ON s.auto_hall_id = h.id
    `;

    const params = [];
    if (status) {
      query += ` WHERE s.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY s.created_at DESC`;

    const requests = db.prepare(query).all(...params);

    res.json({
      requests: requests.map(req => ({
        ...req,
        auto_weekdays: req.auto_weekdays ? JSON.parse(req.auto_weekdays) : null,
        auto_directions: req.auto_directions ? JSON.parse(req.auto_directions) : null
      }))
    });

  } catch (error) {
    console.error('Error fetching subscription requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Подтвердить заявку на абонемент (для админа)
router.post('/:id/approve', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Проверяем что заявка существует и в статусе pending
    const subscription = db.prepare(
      'SELECT * FROM subscriptions WHERE id = ?'
    ).get(id);

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription request not found' });
    }

    if (subscription.status !== 'pending') {
      return res.status(400).json({ error: `Subscription is already ${subscription.status}` });
    }

    // Подтверждаем заявку - меняем статус на confirmed и активируем
    db.prepare(`
      UPDATE subscriptions 
      SET status = 'confirmed',
          is_active = 1,
          valid_from = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(id);

    // Автоматическая запись на занятия, если абонемент с автоматической записью
    if (subscription.booking_type === 'automatic' && subscription.auto_lessons) {
      try {
        console.log(`🔄 Начинаем автоматическую запись для абонемента ${id}`);
        const autoLessons = JSON.parse(subscription.auto_lessons);
        console.log(`📋 Найдено ${autoLessons.length} шаблонов для автоматической записи`);
        
        const validFrom = new Date(subscription.valid_from || subscription.created_at);
        const validUntil = new Date(subscription.valid_until);
        const validFromStr = validFrom.toISOString().split('T')[0];
        const validUntilStr = validUntil.toISOString().split('T')[0];
        
        console.log(`📅 Период действия абонемента: ${validFromStr} - ${validUntilStr}`);
        
        // Находим все занятия, которые соответствуют выбранным параметрам
        const allLessons = db.prepare(`
          SELECT * FROM lessons 
          WHERE is_active = 1 
          AND lesson_date >= date(?) 
          AND lesson_date <= date(?)
          ORDER BY lesson_date, start_time
        `).all(validFromStr, validUntilStr);
        
        console.log(`📚 Найдено ${allLessons.length} занятий в периоде действия абонемента`);
        
        let bookingsCreated = 0;
        
        for (const autoLesson of autoLessons) {
          // Конвертируем день недели из нашей системы (1-7) в JavaScript (0-6)
          const jsDayOfWeek = autoLesson.day_of_week === 7 ? 0 : autoLesson.day_of_week;
          
          for (const lesson of allLessons) {
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
            
            // Проверяем, не записан ли уже пользователь
            const existingBooking = db.prepare(`
              SELECT id FROM bookings 
              WHERE user_id = ? AND lesson_id = ? AND subscription_id = ?
            `).get(subscription.user_id, lesson.id, id);
            
            if (existingBooking) continue;
            
            // Проверяем, есть ли свободные места
            if (lesson.current_bookings >= lesson.capacity) continue;
            
            // Проверяем, есть ли еще занятия в абонементе
            const currentSub = db.prepare('SELECT lessons_remaining FROM subscriptions WHERE id = ?').get(id);
            if (!currentSub || currentSub.lessons_remaining <= 0) break;
            
            // Создаём автоматическую запись
            db.prepare(`
              INSERT INTO bookings (
                user_id, lesson_id, subscription_id, 
                booking_date, status
              ) VALUES (?, ?, ?, datetime('now'), 'confirmed')
            `).run(subscription.user_id, lesson.id, id);
            
            // Обновляем счётчики
            db.prepare(`
              UPDATE lessons 
              SET current_bookings = current_bookings + 1 
              WHERE id = ?
            `).run(lesson.id);
            
            // Уменьшаем оставшиеся занятия
            db.prepare(`
              UPDATE subscriptions 
              SET lessons_remaining = lessons_remaining - 1 
              WHERE id = ?
            `).run(id);
            
            bookingsCreated++;
            console.log(`  ✓ Создана запись на занятие ${lesson.id} (${lesson.lesson_date} ${lesson.start_time})`);
            
            // Если закончились занятия, прекращаем
            const updatedSub = db.prepare('SELECT lessons_remaining FROM subscriptions WHERE id = ?').get(id);
            if (!updatedSub || updatedSub.lessons_remaining <= 0) {
              console.log(`  ⚠️ Закончились занятия в абонементе, прекращаем создание записей`);
              break;
            }
          }
        }
        
        console.log(`✅ Автоматически создано ${bookingsCreated} записей для абонемента ${id}`);
      } catch (autoBookingError) {
        console.error('Ошибка автоматической записи при подтверждении абонемента:', autoBookingError);
        // Не прерываем процесс подтверждения, только логируем ошибку
      }
    }

    const updatedSubscription = db.prepare(`
      SELECT 
        s.*,
        st.name as subscription_name,
        st.category,
        st.price,
        u.first_name,
        u.last_name,
        u.username
      FROM subscriptions s
      JOIN subscription_types st ON s.subscription_type_id = st.id
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `).get(id);

    // TODO: Отправить уведомление пользователю через Telegram

    res.json({
      message: 'Заявка подтверждена, абонемент активирован',
      subscription: updatedSubscription
    });

  } catch (error) {
    console.error('Error approving subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Отклонить заявку на абонемент (для админа)
router.post('/:id/reject', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const subscription = db.prepare(
      'SELECT * FROM subscriptions WHERE id = ?'
    ).get(id);

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription request not found' });
    }

    if (subscription.status !== 'pending') {
      return res.status(400).json({ error: `Subscription is already ${subscription.status}` });
    }

    // Отклоняем заявку
    db.prepare(`
      UPDATE subscriptions 
      SET status = 'rejected',
          is_active = 0,
          rejection_reason = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(reason || null, id);

    // TODO: Отправить уведомление пользователю с причиной отказа

    res.json({
      message: 'Заявка отклонена',
      reason
    });

  } catch (error) {
    console.error('Error rejecting subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить активные абонементы пользователя
router.get('/active', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const subscriptions = db.prepare(`
      SELECT 
        s.*,
        st.name as subscription_name,
        st.category,
        st.price,
        st.lesson_count,
        st.pole_lessons,
        st.fitness_lessons
      FROM subscriptions s
      JOIN subscription_types st ON s.subscription_type_id = st.id
      WHERE s.user_id = ?
        AND s.is_active = 1
        AND s.status = 'confirmed'
        AND s.valid_until > CURRENT_TIMESTAMP
        AND s.lessons_remaining > 0
      ORDER BY s.valid_until ASC
    `).all(userId);

    res.json({
      subscriptions: subscriptions.map(sub => ({
        ...sub,
        auto_weekdays: sub.auto_weekdays ? JSON.parse(sub.auto_weekdays) : null
      }))
    });

  } catch (error) {
    console.error('Error fetching active subscriptions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Заморозить абонемент (только админ)
router.post('/:id/freeze', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(id);

    if (!subscription) {
      return res.status(404).json({ error: 'Абонемент не найден' });
    }

    if (subscription.status !== 'confirmed') {
      return res.status(400).json({ error: 'Можно заморозить только активный абонемент' });
    }

    db.prepare(`
      UPDATE subscriptions 
      SET status = 'frozen',
          is_active = 0,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(id);

    res.json({ message: 'Абонемент заморожен' });

  } catch (error) {
    console.error('Error freezing subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Разморозить абонемент (только админ)
router.post('/:id/unfreeze', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(id);

    if (!subscription) {
      return res.status(404).json({ error: 'Абонемент не найден' });
    }

    if (subscription.status !== 'frozen') {
      return res.status(400).json({ error: 'Можно разморозить только замороженный абонемент' });
    }

    db.prepare(`
      UPDATE subscriptions 
      SET status = 'confirmed',
          is_active = 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(id);

    res.json({ message: 'Абонемент разморожен' });

  } catch (error) {
    console.error('Error unfreezing subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Удалить абонемент (только админ)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(id);

    if (!subscription) {
      return res.status(404).json({ error: 'Абонемент не найден' });
    }

    // Удаляем все связанные записи на занятия
    db.prepare('DELETE FROM bookings WHERE subscription_id = ?').run(id);

    // Удаляем абонемент
    db.prepare('DELETE FROM subscriptions WHERE id = ?').run(id);

    res.json({ message: 'Абонемент удалён' });

  } catch (error) {
    console.error('Error deleting subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить активные абонементы пользователя
router.get('/active', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const subscriptions = db.prepare(`
      SELECT 
        s.*,
        st.name as subscription_name,
        st.category,
        st.price,
        st.lesson_count,
        st.pole_lessons,
        st.fitness_lessons
      FROM subscriptions s
      JOIN subscription_types st ON s.subscription_type_id = st.id
      WHERE s.user_id = ?
        AND s.is_active = 1
        AND s.status = 'confirmed'
        AND s.valid_until > CURRENT_TIMESTAMP
        AND s.lessons_remaining > 0
      ORDER BY s.valid_until ASC
    `).all(userId);

    res.json({
      subscriptions: subscriptions.map(sub => ({
        ...sub,
        auto_weekdays: sub.auto_weekdays ? JSON.parse(sub.auto_weekdays) : null
      }))
    });

  } catch (error) {
    console.error('Error fetching active subscriptions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Заморозить абонемент (только админ)
router.post('/:id/freeze', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(id);

    if (!subscription) {
      return res.status(404).json({ error: 'Абонемент не найден' });
    }

    if (subscription.status !== 'confirmed') {
      return res.status(400).json({ error: 'Можно заморозить только активный абонемент' });
    }

    db.prepare(`
      UPDATE subscriptions 
      SET status = 'frozen',
          is_active = 0,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(id);

    res.json({ message: 'Абонемент заморожен' });

  } catch (error) {
    console.error('Error freezing subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Разморозить абонемент (только админ)
router.post('/:id/unfreeze', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(id);

    if (!subscription) {
      return res.status(404).json({ error: 'Абонемент не найден' });
    }

    if (subscription.status !== 'frozen') {
      return res.status(400).json({ error: 'Можно разморозить только замороженный абонемент' });
    }

    // Получаем последнюю заморозку
    const lastFreeze = db.prepare(`
      SELECT * FROM subscription_freezes 
      WHERE subscription_id = ? 
      ORDER BY id DESC 
      LIMIT 1
    `).get(id);

    if (lastFreeze) {
      // Продлеваем valid_until на количество дней заморозки
      const freezeDays = lastFreeze.freeze_days;
      const validUntil = new Date(subscription.valid_until);
      const newValidUntil = new Date(validUntil);
      newValidUntil.setDate(newValidUntil.getDate() + freezeDays);

      db.prepare(`
        UPDATE subscriptions 
        SET status = 'confirmed',
            is_active = 1,
            valid_until = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(newValidUntil.toISOString().split('T')[0], id);
    } else {
      // Если нет записи о заморозке, просто меняем статус
      db.prepare(`
        UPDATE subscriptions 
        SET status = 'confirmed',
            is_active = 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(id);
    }

    res.json({ message: 'Абонемент разморожен' });

  } catch (error) {
    console.error('Error unfreezing subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Заморозить абонемент клиентом
router.post('/:id/freeze-by-client', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { freezeStartDate, freezeEndDate } = req.body;
    const userId = req.userId;

    console.log('🔵 Запрос на заморозку:', { id, userId, freezeStartDate, freezeEndDate });

    if (!freezeStartDate || !freezeEndDate) {
      return res.status(400).json({ error: 'Укажите даты начала и окончания заморозки' });
    }

    const subscriptionId = parseInt(id);
    if (isNaN(subscriptionId)) {
      return res.status(400).json({ error: 'Некорректный ID абонемента' });
    }

    const subscription = db.prepare('SELECT * FROM subscriptions WHERE id = ? AND user_id = ?').get(subscriptionId, userId);

    if (!subscription) {
      return res.status(404).json({ error: 'Абонемент не найден' });
    }

    if (subscription.status !== 'confirmed') {
      return res.status(400).json({ error: 'Можно заморозить только активный абонемент' });
    }

    // Проверяем даты
    const startDate = new Date(freezeStartDate);
    const endDate = new Date(freezeEndDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      return res.status(400).json({ error: 'Дата начала заморозки не может быть в прошлом' });
    }

    if (endDate <= startDate) {
      return res.status(400).json({ error: 'Дата окончания должна быть позже даты начала' });
    }

    // Вычисляем количество дней заморозки
    const freezeDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    if (freezeDays <= 0) {
      return res.status(400).json({ error: 'Некорректное количество дней заморозки' });
    }

    // Получаем все заморозки для этого абонемента
    let allFreezes = [];
    try {
      allFreezes = db.prepare(`
        SELECT * FROM subscription_freezes 
        WHERE subscription_id = ?
        ORDER BY created_at ASC
      `).all(parseInt(id));
    } catch (dbError) {
      // Если таблица не существует, создаем её
      if (dbError.message && dbError.message.includes('no such table')) {
        db.prepare(`
          CREATE TABLE IF NOT EXISTS subscription_freezes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subscription_id INTEGER NOT NULL,
            freeze_start_date DATE NOT NULL,
            freeze_end_date DATE NOT NULL,
            freeze_days INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
          )
        `).run();
        allFreezes = [];
      } else {
        throw dbError;
      }
    }

    // Проверяем ограничения
    const totalFreezeDays = allFreezes.reduce((sum, freeze) => sum + (freeze.freeze_days || 0), 0);
    const freezeCount = allFreezes.length;

    if (freezeCount >= 3) {
      return res.status(400).json({ error: 'Вы уже использовали все 3 заморозки' });
    }

    if (totalFreezeDays + freezeDays > 14) {
      const remainingDays = 14 - totalFreezeDays;
      return res.status(400).json({ 
        error: `Превышен лимит заморозки. Доступно еще ${remainingDays} дней из 14` 
      });
    }

    // Проверяем, что заморозка не выходит за срок действия абонемента
    const validUntil = new Date(subscription.valid_until);
    if (startDate > validUntil) {
      return res.status(400).json({ error: 'Дата начала заморозки не может быть позже срока действия абонемента' });
    }

    // Создаем запись о заморозке
    try {
      db.prepare(`
        INSERT INTO subscription_freezes (subscription_id, freeze_start_date, freeze_end_date, freeze_days)
        VALUES (?, ?, ?, ?)
      `).run(subscriptionId, freezeStartDate, freezeEndDate, freezeDays);
    } catch (dbError) {
      console.error('Ошибка при создании записи о заморозке:', dbError);
      // Если таблица не существует, создаем её
      if (dbError.message && dbError.message.includes('no such table')) {
        db.prepare(`
          CREATE TABLE IF NOT EXISTS subscription_freezes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subscription_id INTEGER NOT NULL,
            freeze_start_date DATE NOT NULL,
            freeze_end_date DATE NOT NULL,
            freeze_days INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
          )
        `).run();
        // Повторяем попытку вставки
        db.prepare(`
          INSERT INTO subscription_freezes (subscription_id, freeze_start_date, freeze_end_date, freeze_days)
          VALUES (?, ?, ?, ?)
        `).run(subscriptionId, freezeStartDate, freezeEndDate, freezeDays);
      } else {
        throw dbError;
      }
    }

    // Обновляем статус абонемента и продлеваем срок действия
    const newValidUntil = new Date(validUntil);
    newValidUntil.setDate(newValidUntil.getDate() + freezeDays);

    db.prepare(`
      UPDATE subscriptions 
      SET status = 'frozen',
          is_active = 0,
          valid_until = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newValidUntil.toISOString().split('T')[0], subscriptionId);

    res.json({ 
      message: 'Абонемент заморожен',
      freezeDays,
      remainingFreezes: 3 - (freezeCount + 1),
      remainingDays: 14 - (totalFreezeDays + freezeDays)
    });

  } catch (error) {
    console.error('Error freezing subscription by client:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'Ошибка при заморозке абонемента'
    });
  }
});

// Получить информацию о заморозках абонемента
router.get('/:id/freezes', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const subscriptionId = parseInt(id);
    if (isNaN(subscriptionId)) {
      return res.status(400).json({ error: 'Некорректный ID абонемента' });
    }

    const subscription = db.prepare('SELECT * FROM subscriptions WHERE id = ? AND user_id = ?').get(subscriptionId, userId);

    if (!subscription) {
      return res.status(404).json({ error: 'Абонемент не найден' });
    }

    let freezes = [];
    try {
      freezes = db.prepare(`
        SELECT * FROM subscription_freezes 
        WHERE subscription_id = ?
        ORDER BY created_at ASC
      `).all(subscriptionId);
    } catch (dbError) {
      // Если таблица не существует, возвращаем пустой массив
      if (dbError.message && dbError.message.includes('no such table')) {
        freezes = [];
      } else {
        throw dbError;
      }
    }

    const totalFreezeDays = freezes.reduce((sum, freeze) => sum + (freeze.freeze_days || 0), 0);
    const freezeCount = freezes.length;

    res.json({
      freezes: freezes.map(f => ({
        id: f.id,
        freezeStartDate: f.freeze_start_date,
        freezeEndDate: f.freeze_end_date,
        freezeDays: f.freeze_days,
        createdAt: f.created_at
      })),
      totalFreezeDays,
      freezeCount,
      remainingFreezes: 3 - freezeCount,
      remainingDays: 14 - totalFreezeDays
    });

  } catch (error) {
    console.error('Error getting freezes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Разморозить абонемент клиентом
router.post('/:id/unfreeze-by-client', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    console.log('🔵 Запрос на разморозку:', { id, userId });

    const subscriptionId = parseInt(id);
    if (isNaN(subscriptionId)) {
      return res.status(400).json({ error: 'Некорректный ID абонемента' });
    }

    const subscription = db.prepare('SELECT * FROM subscriptions WHERE id = ? AND user_id = ?').get(subscriptionId, userId);

    if (!subscription) {
      return res.status(404).json({ error: 'Абонемент не найден' });
    }

    if (subscription.status !== 'frozen') {
      return res.status(400).json({ error: 'Можно разморозить только замороженный абонемент' });
    }

    // Получаем последнюю заморозку
    let lastFreeze = null;
    try {
      lastFreeze = db.prepare(`
        SELECT * FROM subscription_freezes 
        WHERE subscription_id = ? 
        ORDER BY id DESC 
        LIMIT 1
      `).get(subscriptionId);
    } catch (dbError) {
      if (!dbError.message || !dbError.message.includes('no such table')) {
        throw dbError;
      }
    }

    // При разморозке нужно скорректировать valid_until:
    // Текущий valid_until уже продлен на полное количество дней заморозки
    // Нужно вычесть оставшиеся дни заморозки, чтобы получить правильный срок
    let newValidUntil = new Date(subscription.valid_until);
    let actualFreezeDays = 0;
    
    if (lastFreeze) {
      const plannedFreezeDays = lastFreeze.freeze_days;
      const freezeEndDate = new Date(lastFreeze.freeze_end_date);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      freezeEndDate.setHours(0, 0, 0, 0);
      
      // Количество оставшихся дней до конца заморозки
      const remainingDays = Math.max(0, Math.ceil((freezeEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      
      // Фактически использовано дней заморозки
      actualFreezeDays = Math.max(0, plannedFreezeDays - remainingDays);
      
      // Текущий valid_until уже продлен на plannedFreezeDays
      // Вычитаем оставшиеся дни, чтобы получить правильный срок
      newValidUntil.setDate(newValidUntil.getDate() - remainingDays);
      
      console.log(`📅 Запланировано дней заморозки: ${plannedFreezeDays}`);
      console.log(`📅 Осталось дней до конца заморозки: ${remainingDays}`);
      console.log(`📅 Фактически использовано дней: ${actualFreezeDays}`);
      console.log(`📅 Текущий valid_until: ${subscription.valid_until}`);
      console.log(`📅 Новый valid_until: ${newValidUntil.toISOString().split('T')[0]} (вычли ${remainingDays} дней)`);
    }

    db.prepare(`
      UPDATE subscriptions 
      SET status = 'confirmed',
          is_active = 1,
          valid_until = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newValidUntil.toISOString().split('T')[0], subscriptionId);

    // Если это автоматическая запись, продлеваем все существующие записи
    if (subscription.booking_type === 'automatic' && actualFreezeDays > 0) {
      console.log(`🔄 Продлеваем записи для автоматического абонемента на ${actualFreezeDays} дней`);
      
      try {
        // Получаем все активные записи для этого абонемента
        const bookings = db.prepare(`
          SELECT b.*, l.lesson_date, l.start_time, l.end_time, l.hall_id, l.direction_id, l.trainer_id, l.capacity, l.current_bookings
          FROM bookings b
          LEFT JOIN lessons l ON b.lesson_id = l.id
          WHERE b.subscription_id = ?
          AND b.status = 'confirmed'
          AND l.lesson_date >= date('now')
          ORDER BY l.lesson_date ASC
        `).all(subscriptionId);

        console.log(`📋 Найдено ${bookings.length} активных записей для продления`);

        // Продлеваем каждую запись на фактически использованное количество дней
        for (const booking of bookings) {
        if (booking.lesson_id && booking.lesson_date) {
          const oldDate = new Date(booking.lesson_date);
          const newDate = new Date(oldDate);
          newDate.setDate(newDate.getDate() + actualFreezeDays);
          const newDateStr = newDate.toISOString().split('T')[0];

          // Ищем существующее занятие на новую дату с теми же параметрами
          const existingLesson = db.prepare(`
            SELECT * FROM lessons 
            WHERE lesson_date = ?
            AND start_time = ?
            AND end_time = ?
            AND hall_id = ?
            AND direction_id = ?
            AND trainer_id = ?
            AND is_active = 1
          `).get(
            newDateStr,
            booking.start_time,
            booking.end_time,
            booking.hall_id,
            booking.direction_id,
            booking.trainer_id
          );

          if (existingLesson && existingLesson.current_bookings < existingLesson.capacity) {
            // Если такое занятие существует и есть места, переносим запись на него
            db.prepare(`
              UPDATE bookings
              SET lesson_id = ?
              WHERE id = ?
            `).run(existingLesson.id, booking.id);

            // Обновляем счетчики
            db.prepare(`
              UPDATE lessons 
              SET current_bookings = current_bookings - 1 
              WHERE id = ?
            `).run(booking.lesson_id);

            db.prepare(`
              UPDATE lessons 
              SET current_bookings = current_bookings + 1 
              WHERE id = ?
            `).run(existingLesson.id);

            console.log(`   ✅ Запись ${booking.id} перенесена на существующее занятие ${existingLesson.id} (${newDateStr})`);
          } else {
            // Если такого занятия нет, создаем новое
            const newLessonId = db.prepare(`
              INSERT INTO lessons (
                hall_id, direction_id, trainer_id, lesson_date,
                start_time, end_time, capacity, current_bookings,
                is_active, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `).run(
              booking.hall_id,
              booking.direction_id,
              booking.trainer_id,
              newDateStr,
              booking.start_time,
              booking.end_time,
              booking.capacity || 10
            ).lastInsertRowid;

            // Обновляем запись на новое занятие
            db.prepare(`
              UPDATE bookings
              SET lesson_id = ?
              WHERE id = ?
            `).run(newLessonId, booking.id);

            // Обновляем счетчик старого занятия
            db.prepare(`
              UPDATE lessons 
              SET current_bookings = current_bookings - 1 
              WHERE id = ?
            `).run(booking.lesson_id);

            console.log(`   ✅ Создано новое занятие ${newLessonId} и запись ${booking.id} перенесена на ${newDateStr}`);
          }
        }
        }
      } catch (bookingError) {
        console.error('❌ Ошибка при продлении записей:', bookingError);
        console.error('   Детали ошибки:', bookingError.message);
        // Не прерываем процесс разморозки, только логируем ошибку
      }
    }

    res.json({ 
      message: 'Абонемент разморожен',
      extensionDays: actualFreezeDays,
      newValidUntil: newValidUntil.toISOString().split('T')[0]
    });

  } catch (error) {
    console.error('Error unfreezing subscription by client:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'Ошибка при разморозке абонемента'
    });
  }
});

module.exports = router;

