const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Получить доступное время для аренды с учетом групповых занятий и существующих бронирований
router.get('/availability', authMiddleware, (req, res) => {
  try {
    const { hallId, date, rentalType } = req.query;

    if (!hallId || !date) {
      return res.status(400).json({ error: 'hallId и date обязательны' });
    }

    const hallIdNum = parseInt(hallId);
    if (isNaN(hallIdNum)) {
      return res.status(400).json({ error: 'Некорректный ID зала' });
    }
    
    const selectedDate = new Date(date);
    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({ error: 'Некорректная дата' });
    }
    
    const dayOfWeek = selectedDate.getDay(); // 0 = воскресенье, 6 = суббота
    console.log(`📅 Запрос доступности: зал ${hallIdNum}, дата ${date}, день недели ${dayOfWeek}`);
    
    // Получаем все групповые занятия на эту дату в этом зале
    // Проверяем как повторяющиеся (из recurring_lessons по дню недели), так и разовые (из lessons по конкретной дате)
    const dateStr = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Получаем все занятия на конкретную дату (и разовые, и созданные из шаблонов)
    const lessonsOnDate = db.prepare(`
      SELECT 
        l.*,
        d.name as direction_name
      FROM lessons l
      LEFT JOIN directions d ON l.direction_id = d.id
      WHERE l.hall_id = ? 
      AND l.is_active = 1
      AND l.lesson_date = ?
    `).all(hallIdNum, dateStr);
    
    // Получаем повторяющиеся занятия по дню недели (1=Пн, 7=Вс, конвертируем JS 0=Вс, 6=Сб в 1-7)
    // Эти занятия могут быть еще не созданы в lessons, но должны учитываться
    const jsDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek; // Конвертируем JS формат (0-6) в формат БД (1-7)
    const recurringLessons = db.prepare(`
      SELECT 
        rl.*,
        d.name as direction_name
      FROM recurring_lessons rl
      LEFT JOIN directions d ON rl.direction_id = d.id
      WHERE rl.hall_id = ? 
      AND rl.is_active = 1
      AND rl.day_of_week = ?
      AND NOT EXISTS (
        SELECT 1 FROM lessons l2 
        WHERE l2.recurring_lesson_id = rl.id 
        AND l2.lesson_date = ?
        AND l2.is_active = 1
      )
    `).all(hallIdNum, jsDayOfWeek, dateStr);
    
    // Объединяем результаты - занятия на дату и шаблоны повторяющихся занятий, которые еще не созданы
    const lessons = [...lessonsOnDate, ...recurringLessons];
    
    console.log(`📅 Проверка доступности для зала ${hallIdNum}, дата ${dateStr}, тип ${rentalType}`);
    console.log(`   Найдено занятий на дату: ${lessonsOnDate.length}`);
    console.log(`   Найдено шаблонов повторяющихся: ${recurringLessons.length}`);
    console.log(`   Всего занятий для проверки: ${lessons.length}`);

    // Получаем все подтвержденные бронирования аренды на эту дату
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const rentalBookings = db.prepare(`
      SELECT *
      FROM rental_bookings
      WHERE hall_id = ?
      AND status IN ('pending', 'confirmed')
      AND (
        (start_time >= ? AND start_time <= ?)
        OR (end_time >= ? AND end_time <= ?)
        OR (start_time <= ? AND end_time >= ?)
      )
    `).all(
      hallIdNum,
      startOfDay.toISOString(),
      endOfDay.toISOString(),
      startOfDay.toISOString(),
      endOfDay.toISOString(),
      startOfDay.toISOString(),
      endOfDay.toISOString()
    );

    // Проверяем, забронирован ли весь зал
    const hallBookings = rentalBookings.filter(rb => rb.rental_type === 'hall');
    
    // Все доступные временные слоты
    const allTimes = [
      '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
      '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
    ];

    const availableTimes = [];

    console.log(`🔍 Проверка доступности времени для ${rentalType === 'hall' ? 'зала' : 'пилонов'}`);
    console.log(`   Всего занятий для проверки: ${lessons.length}`);
    lessons.forEach((lesson, idx) => {
      console.log(`   Занятие ${idx + 1}: ${lesson.start_time}-${lesson.end_time} (${lesson.direction_name || 'без названия'})`);
    });

    for (const time of allTimes) {
      const [hours, minutes] = time.split(':').map(Number);
      const slotStart = new Date(selectedDate);
      slotStart.setHours(hours, minutes, 0, 0);
      const slotEnd = new Date(slotStart);
      slotEnd.setHours(slotStart.getHours() + 1, 0, 0, 0);

      let isAvailable = true;
      let reason = '';

      // Проверяем пересечение с групповыми занятиями
      for (const lesson of lessons) {
        if (!lesson.start_time || !lesson.end_time) {
          console.warn('⚠️ Занятие без времени:', lesson);
          continue;
        }
        
        const lessonStart = new Date(selectedDate);
        const [lessonStartHours, lessonStartMinutes] = lesson.start_time.split(':').map(Number);
        if (isNaN(lessonStartHours) || isNaN(lessonStartMinutes)) {
          console.warn('⚠️ Некорректное время начала занятия:', lesson.start_time);
          continue;
        }
        lessonStart.setHours(lessonStartHours, lessonStartMinutes, 0, 0);

        const lessonEnd = new Date(selectedDate);
        const [lessonEndHours, lessonEndMinutes] = lesson.end_time.split(':').map(Number);
        if (isNaN(lessonEndHours) || isNaN(lessonEndMinutes)) {
          console.warn('⚠️ Некорректное время окончания занятия:', lesson.end_time);
          continue;
        }
        lessonEnd.setHours(lessonEndHours, lessonEndMinutes, 0, 0);

        // Проверяем пересечение временных интервалов
        // Пересечение происходит если: slotStart < lessonEnd && slotEnd > lessonStart
        const hasOverlap = slotStart < lessonEnd && slotEnd > lessonStart;
        if (hasOverlap) {
          console.log(`   ❌ Время ${time} пересекается с занятием ${lesson.start_time}-${lesson.end_time}`);
          isAvailable = false;
          reason = 'Групповое занятие';
          break;
        }
      }

      // Если проверяем аренду пилона, проверяем, не забронирован ли весь зал
      if (isAvailable && rentalType === 'pole') {
        for (const hallBooking of hallBookings) {
          const bookingStart = new Date(hallBooking.start_time);
          const bookingEnd = new Date(hallBooking.end_time);
          if (slotStart < bookingEnd && slotEnd > bookingStart) {
            isAvailable = false;
            reason = 'Весь зал забронирован';
            break;
          }
        }
      }

      // Проверяем пересечение с другими бронированиями аренды
      if (isAvailable) {
        for (const rentalBooking of rentalBookings) {
          const bookingStart = new Date(rentalBooking.start_time);
          const bookingEnd = new Date(rentalBooking.end_time);
          
          // Если это аренда всего зала, блокируем все
          if (rentalBooking.rental_type === 'hall') {
            if (slotStart < bookingEnd && slotEnd > bookingStart) {
              isAvailable = false;
              reason = 'Весь зал забронирован';
              break;
            }
          }
          // Если это аренда пилона и мы проверяем аренду пилона, проверяем доступность пилонов
          else if (rentalType === 'pole' && rentalBooking.rental_type === 'pole') {
            // Получаем количество уже забронированных пилонов в это время
            const overlappingPoleBookings = rentalBookings.filter(rb => 
              rb.rental_type === 'pole' &&
              rb.id !== rentalBooking.id &&
              slotStart < new Date(rb.end_time) && slotEnd > new Date(rb.start_time)
            );
            
            const bookedPoles = overlappingPoleBookings.reduce((sum, rb) => sum + (rb.pole_count || 0), 0);
            const hall = db.prepare('SELECT * FROM halls WHERE id = ?').get(hallIdNum);
            const totalPoles = hall?.pole_count || 6;
            
            // Если все пилоны заняты
            if (bookedPoles >= totalPoles) {
              isAvailable = false;
              reason = 'Все пилоны заняты';
              break;
            }
          }
        }
      }

      if (isAvailable) {
        availableTimes.push(time);
      } else {
        console.log(`   ⏰ ${time}: недоступно - ${reason}`);
      }
    }

    console.log(`✅ Доступное время: ${availableTimes.join(', ') || 'нет'}`);
    console.log(`   Всего доступно слотов: ${availableTimes.length} из ${allTimes.length}`);
    res.json({ availableTimes });
  } catch (error) {
    console.error('Error getting rental availability:', error);
    res.status(500).json({ error: 'Ошибка при получении доступного времени' });
  }
});

// Создать заявку на аренду
router.post('/bookings', authMiddleware, (req, res) => {
  try {
    const { hallId, rentalType, poleCount, date, time, duration, participants, comment, name, phone } = req.body;
    const userId = req.userId;
    
    // Если переданы имя и телефон, обновляем данные пользователя
    if (name || phone) {
      const updateFields = [];
      const updateValues = [];
      
      if (name) {
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        if (firstName) {
          updateFields.push('first_name = ?');
          updateValues.push(firstName);
        }
        if (lastName) {
          updateFields.push('last_name = ?');
          updateValues.push(lastName);
        }
      }
      
      if (phone) {
        updateFields.push('phone = ?');
        updateValues.push(phone.trim());
      }
      
      if (updateFields.length > 0) {
        updateValues.push(userId);
        db.prepare(`
          UPDATE users 
          SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(...updateValues);
        console.log(`📝 Обновлены данные пользователя ${userId}: имя=${name}, телефон=${phone}`);
      }
    }

    if (!hallId || !rentalType || !date || !time || !duration) {
      return res.status(400).json({ error: 'Не все обязательные поля заполнены' });
    }

    if (rentalType === 'pole') {
      if (!poleCount || poleCount === undefined || poleCount === null) {
        return res.status(400).json({ error: 'Укажите количество пилонов' });
      }
      const poleCountNum = parseInt(poleCount);
      if (isNaN(poleCountNum) || poleCountNum < 1) {
        return res.status(400).json({ error: 'Некорректное количество пилонов' });
      }
    }

    // Парсим дату и время
    const [hours, minutes] = time.split(':').map(Number);
    const startTime = new Date(date);
    startTime.setHours(hours, minutes, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + parseInt(duration), 0, 0, 0);

    // Проверяем доступность времени
    const dayOfWeek = startTime.getDay();
    const dateStr = startTime.toISOString().split('T')[0];
    const jsDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek; // Конвертируем JS формат (0-6) в формат БД (1-7)
    
    // Получаем разовые занятия на конкретную дату
    const oneTimeLessons = db.prepare(`
      SELECT *
      FROM lessons
      WHERE hall_id = ?
      AND is_active = 1
      AND lesson_date = ?
    `).all(parseInt(hallId), dateStr);
    
    // Получаем повторяющиеся занятия по дню недели
    // Также проверяем, не созданы ли уже занятия из этих шаблонов на эту дату
    const recurringLessons = db.prepare(`
      SELECT *
      FROM recurring_lessons
      WHERE hall_id = ?
      AND is_active = 1
      AND day_of_week = ?
      AND NOT EXISTS (
        SELECT 1 FROM lessons l2 
        WHERE l2.recurring_lesson_id = recurring_lessons.id 
        AND l2.lesson_date = ?
        AND l2.is_active = 1
      )
    `).all(parseInt(hallId), jsDayOfWeek, dateStr);
    
    // Объединяем результаты
    const lessons = [...oneTimeLessons, ...recurringLessons];
    
    console.log(`📅 Создание заявки: зал ${hallId}, дата ${dateStr}, время ${time}`);
    console.log(`   Найдено занятий на дату: ${oneTimeLessons.length}`);
    console.log(`   Найдено шаблонов повторяющихся: ${recurringLessons.length}`);
    console.log(`   Всего занятий для проверки: ${lessons.length}`);

    // Проверяем пересечение с групповыми занятиями
    for (const lesson of lessons) {
      if (!lesson.start_time || !lesson.end_time) {
        console.warn('⚠️ Занятие без времени:', lesson);
        continue;
      }
      
      const lessonStart = new Date(startTime);
      const [lessonStartHours, lessonStartMinutes] = lesson.start_time.split(':').map(Number);
      if (isNaN(lessonStartHours) || isNaN(lessonStartMinutes)) {
        console.warn('⚠️ Некорректное время начала занятия:', lesson.start_time);
        continue;
      }
      lessonStart.setHours(lessonStartHours, lessonStartMinutes, 0, 0);
      lessonStart.setDate(startTime.getDate());

      const lessonEnd = new Date(startTime);
      const [lessonEndHours, lessonEndMinutes] = lesson.end_time.split(':').map(Number);
      if (isNaN(lessonEndHours) || isNaN(lessonEndMinutes)) {
        console.warn('⚠️ Некорректное время окончания занятия:', lesson.end_time);
        continue;
      }
      lessonEnd.setHours(lessonEndHours, lessonEndMinutes, 0, 0);
      lessonEnd.setDate(startTime.getDate());

      // Проверяем пересечение временных интервалов
      if (startTime < lessonEnd && endTime > lessonStart) {
        return res.status(400).json({ error: 'Выбранное время пересекается с групповым занятием' });
      }
    }

    // Проверяем существующие бронирования
    const existingRentals = db.prepare(`
      SELECT *
      FROM rental_bookings
      WHERE hall_id = ?
      AND status IN ('pending', 'confirmed')
      AND (
        (start_time <= ? AND end_time >= ?)
        OR (start_time <= ? AND end_time >= ?)
        OR (start_time >= ? AND end_time <= ?)
      )
    `).all(
      parseInt(hallId),
      startTime.toISOString(),
      startTime.toISOString(),
      endTime.toISOString(),
      endTime.toISOString(),
      startTime.toISOString(),
      endTime.toISOString()
    );

    // Если забронирован весь зал, блокируем
    const hallBookings = existingRentals.filter(rb => rb.rental_type === 'hall');
    if (hallBookings.length > 0) {
      return res.status(400).json({ error: 'Весь зал уже забронирован на это время' });
    }

    // Если аренда пилона, проверяем доступность пилонов
    if (rentalType === 'pole') {
      const poleBookings = existingRentals.filter(rb => rb.rental_type === 'pole');
      const bookedPoles = poleBookings.reduce((sum, rb) => sum + (rb.pole_count || 0), 0);
      const hall = db.prepare('SELECT * FROM halls WHERE id = ?').get(parseInt(hallId));
      const totalPoles = hall?.pole_count || 6;

      if (bookedPoles + parseInt(poleCount) > totalPoles) {
        return res.status(400).json({ error: `Доступно только ${totalPoles - bookedPoles} пилонов` });
      }
    }

    // Если аренда зала, проверяем, что нет бронирований пилонов
    if (rentalType === 'hall') {
      const poleBookings = existingRentals.filter(rb => rb.rental_type === 'pole');
      if (poleBookings.length > 0) {
        return res.status(400).json({ error: 'В зале есть забронированные пилоны на это время' });
      }
    }

    // Рассчитываем цену
    const hall = db.prepare('SELECT * FROM halls WHERE id = ?').get(parseInt(hallId));
    let totalPrice = 0;
    
    if (rentalType === 'hall') {
      totalPrice = (hall?.price_per_hour || 1500) * parseInt(duration);
    } else {
      const poleCountNum = parseInt(poleCount);
      // Получаем цену аренды пилона из settings
      const polePriceSetting = db.prepare('SELECT value FROM settings WHERE key = ?').get('pole_rental_price_per_hour');
      const polePricePerHour = polePriceSetting ? parseFloat(polePriceSetting.value) : 500;
      totalPrice = polePricePerHour * poleCountNum * parseInt(duration);
    }

    // Создаем заявку
    const poleCountValue = rentalType === 'pole' ? parseInt(poleCount) : null;
    console.log(`📝 Создание заявки на аренду: тип=${rentalType}, зал=${hallId}, дата=${date}, время=${time}, длительность=${duration}, пилонов=${poleCountValue}`);
    console.log(`   Данные запроса:`, { hallId, rentalType, poleCount, date, time, duration, participants, comment });
    
    const result = db.prepare(`
      INSERT INTO rental_bookings (
        user_id, hall_id, rental_type, pole_count, start_time, end_time,
        participants, total_price, comment, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)
    `).run(
      userId,
      parseInt(hallId),
      rentalType,
      poleCountValue,
      startTime.toISOString(),
      endTime.toISOString(),
      participants ? parseInt(participants) : null,
      totalPrice,
      comment || null
    );

    const rentalBooking = db.prepare(`
      SELECT 
        rb.*,
        h.name as hall_name,
        h.address as hall_address,
        h.pole_count as hall_pole_count,
        u.first_name,
        u.last_name,
        u.phone
      FROM rental_bookings rb
      LEFT JOIN halls h ON rb.hall_id = h.id
      LEFT JOIN users u ON rb.user_id = u.id
      WHERE rb.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(rentalBooking);
  } catch (error) {
    console.error('Error creating rental booking:', error);
    res.status(500).json({ error: 'Ошибка при создании заявки на аренду' });
  }
});

// Получить мои заявки на аренду
router.get('/bookings/my', authMiddleware, (req, res) => {
  try {
    const userId = req.userId;
    console.log(`📋 Запрос заявок на аренду для пользователя ID=${userId}`);

    // Проверяем, есть ли вообще заявки у этого пользователя
    const allUserRentals = db.prepare(`
      SELECT COUNT(*) as count
      FROM rental_bookings
      WHERE user_id = ?
    `).get(userId);
    console.log(`   Всего заявок у пользователя ${userId}: ${allUserRentals.count}`);

    const rentals = db.prepare(`
      SELECT 
        rb.*,
        h.name as hall_name,
        h.address as hall_address,
        h.pole_count as hall_pole_count
      FROM rental_bookings rb
      LEFT JOIN halls h ON rb.hall_id = h.id
      WHERE rb.user_id = ?
      ORDER BY rb.start_time DESC
    `).all(userId);

    console.log(`   Найдено заявок: ${rentals.length}`);
    rentals.forEach((rental, idx) => {
      console.log(`   Заявка ${idx + 1}: ID=${rental.id}, статус=${rental.status}, зал=${rental.hall_name || 'неизвестно'}, дата=${rental.start_time}, user_id=${rental.user_id}`);
    });

    res.json(rentals);
  } catch (error) {
    console.error('Error getting my rental bookings:', error);
    res.status(500).json({ error: 'Ошибка при получении заявок на аренду' });
  }
});

// Админ: получить все заявки на аренду
router.get('/bookings/all', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT 
        rb.*,
        h.name as hall_name,
        h.address as hall_address,
        h.pole_count as hall_pole_count,
        u.first_name,
        u.last_name,
        u.phone,
        u.telegram_id
      FROM rental_bookings rb
      LEFT JOIN halls h ON rb.hall_id = h.id
      LEFT JOIN users u ON rb.user_id = u.id
    `;
    
    const params = [];
    if (status) {
      query += ' WHERE rb.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY rb.created_at DESC';
    
    const rentals = db.prepare(query).all(...params);
    
    res.json(rentals);
  } catch (error) {
    console.error('Error getting all rental bookings:', error);
    res.status(500).json({ error: 'Ошибка при получении заявок на аренду' });
  }
});

// Админ: подтвердить/отклонить заявку на аренду
router.put('/bookings/:id/status', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Некорректный статус' });
    }

    const result = db.prepare(`
      UPDATE rental_bookings
      SET status = ?
      WHERE id = ?
    `).run(status, parseInt(id));

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Заявка не найдена' });
    }

    const rentalBooking = db.prepare(`
      SELECT 
        rb.*,
        h.name as hall_name,
        h.address as hall_address,
        h.pole_count as hall_pole_count,
        u.first_name,
        u.last_name,
        u.phone,
        u.telegram_id
      FROM rental_bookings rb
      LEFT JOIN halls h ON rb.hall_id = h.id
      LEFT JOIN users u ON rb.user_id = u.id
      WHERE rb.id = ?
    `).get(parseInt(id));

    res.json(rentalBooking);
  } catch (error) {
    console.error('Error updating rental booking status:', error);
    res.status(500).json({ error: 'Ошибка при обновлении статуса заявки' });
  }
});

module.exports = router;
