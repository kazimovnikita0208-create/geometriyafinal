const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { adminMiddleware } = require('../middleware/auth');

// Функция для получения дат периода
function getPeriodDates(period) {
  const now = new Date();
  let startDate, endDate;
  
  switch (period) {
    case 'day':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    case 'week':
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Понедельник
      startDate = new Date(now.getFullYear(), now.getMonth(), diff);
      endDate = new Date(now.getFullYear(), now.getMonth(), diff + 6, 23, 59, 59);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      break;
    default:
      // Все время
      startDate = null;
      endDate = null;
  }
  
  return { startDate, endDate };
}

// Получить статистику (только админ)
router.get('/', adminMiddleware, (req, res) => {
  try {
    const { period = 'all' } = req.query;
    const { startDate, endDate } = getPeriodDates(period);
    
    // Формируем условия для фильтрации по дате
    let dateCondition = '';
    let dateParams = [];
    
    if (startDate && endDate) {
      dateCondition = `AND date(created_at) >= date(?) AND date(created_at) <= date(?)`;
      dateParams = [
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      ];
    }
    
    // Количество подтвержденных абонементов
    const confirmedSubscriptions = db.prepare(`
      SELECT COUNT(*) as count 
      FROM subscriptions 
      WHERE status = 'confirmed'
      ${dateCondition}
    `).get(...dateParams);
    
    // Сумма подтвержденных абонементов за период
    const confirmedSubscriptionsSum = db.prepare(`
      SELECT COALESCE(SUM(st.price), 0) as total
      FROM subscriptions s
      JOIN subscription_types st ON s.subscription_type_id = st.id
      WHERE s.status = 'confirmed'
      ${dateCondition}
    `).get(...dateParams);
    
    // Количество всех занятий (активных)
    const totalLessons = db.prepare(`
      SELECT COUNT(*) as count 
      FROM lessons 
      WHERE is_active = 1
    `).get();
    
    // Количество активных пользователей (у которых есть действующий абонемент)
    // Действующий абонемент = подтвержден, активен, не истек по дате (занятия могут быть использованы)
    const activeUsers = db.prepare(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM subscriptions
      WHERE status = 'confirmed'
        AND is_active = 1
        AND (valid_until IS NULL OR datetime(valid_until) >= datetime('now'))
    `).get();
    
    // Количество всех абонементов (всех статусов)
    const totalSubscriptions = db.prepare(`
      SELECT COUNT(*) as count 
      FROM subscriptions
      ${dateCondition ? 'WHERE ' + dateCondition.replace('AND ', '') : ''}
    `).get(...(dateCondition ? dateParams : []));
    
    // Количество записей на занятия
    let bookingsCondition = '';
    let bookingsParams = [];
    if (startDate && endDate) {
      bookingsCondition = `AND date(b.booking_date) >= date(?) AND date(b.booking_date) <= date(?)`;
      bookingsParams = [
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      ];
    }
    
    const totalBookings = db.prepare(`
      SELECT COUNT(*) as count 
      FROM bookings b
      WHERE b.status = 'confirmed'
      ${bookingsCondition}
    `).get(...bookingsParams);
    
    // Количество будущих занятий
    const upcomingLessons = db.prepare(`
      SELECT COUNT(*) as count 
      FROM lessons 
      WHERE is_active = 1 
        AND lesson_date >= date('now')
    `).get();
    
    res.json({
      confirmedSubscriptions: confirmedSubscriptions.count,
      confirmedSubscriptionsSum: confirmedSubscriptionsSum.total || 0,
      totalLessons: totalLessons.count,
      activeUsers: activeUsers.count,
      totalSubscriptions: totalSubscriptions.count,
      totalBookings: totalBookings.count,
      upcomingLessons: upcomingLessons.count,
      period: period
    });
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({ error: 'Ошибка получения статистики' });
  }
});

// Получить детальную статистику по подтвержденным абонементам
router.get('/subscriptions', adminMiddleware, (req, res) => {
  try {
    const { period = 'all' } = req.query;
    const { startDate, endDate } = getPeriodDates(period);
    
    let dateCondition = '';
    let dateParams = [];
    
    if (startDate && endDate) {
      dateCondition = `AND date(s.created_at) >= date(?) AND date(s.created_at) <= date(?)`;
      dateParams = [
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      ];
    }
    
    const subscriptions = db.prepare(`
      SELECT 
        s.id,
        s.created_at,
        s.status,
        s.lessons_remaining,
        s.valid_from,
        s.valid_until,
        st.name as subscription_name,
        st.price,
        st.category,
        u.first_name,
        u.last_name,
        u.phone
      FROM subscriptions s
      JOIN subscription_types st ON s.subscription_type_id = st.id
      JOIN users u ON s.user_id = u.id
      WHERE s.status = 'confirmed'
      ${dateCondition}
      ORDER BY s.created_at DESC
    `).all(...dateParams);
    
    res.json({ subscriptions });
  } catch (error) {
    console.error('Ошибка получения детальной статистики абонементов:', error);
    res.status(500).json({ error: 'Ошибка получения статистики' });
  }
});

// Получить детальную статистику по занятиям
router.get('/lessons', adminMiddleware, (req, res) => {
  try {
    const { period = 'all' } = req.query;
    const { startDate, endDate } = getPeriodDates(period);
    
    let dateCondition = '';
    let dateParams = [];
    
    if (startDate && endDate) {
      dateCondition = `AND date(l.lesson_date) >= date(?) AND date(l.lesson_date) <= date(?)`;
      dateParams = [
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      ];
    }
    
    const lessons = db.prepare(`
      SELECT 
        l.id,
        l.lesson_date,
        l.start_time,
        l.end_time,
        l.capacity,
        l.current_bookings,
        d.name as direction_name,
        h.name as hall_name,
        TRIM(t.name || ' ' || COALESCE(t.last_name, '')) as trainer_name
      FROM lessons l
      JOIN directions d ON l.direction_id = d.id
      JOIN halls h ON l.hall_id = h.id
      JOIN trainers t ON l.trainer_id = t.id
      WHERE l.is_active = 1
      ${dateCondition}
      ORDER BY l.lesson_date DESC, l.start_time DESC
    `).all(...dateParams);
    
    res.json({ lessons });
  } catch (error) {
    console.error('Ошибка получения детальной статистики занятий:', error);
    res.status(500).json({ error: 'Ошибка получения статистики' });
  }
});

// Получить детальную статистику по активным пользователям
router.get('/users', adminMiddleware, (req, res) => {
  try {
    const users = db.prepare(`
      SELECT DISTINCT
        u.id,
        u.first_name,
        u.last_name,
        u.phone,
        u.telegram_id,
        u.username,
        COUNT(DISTINCT s.id) as subscriptions_count,
        SUM(s.lessons_remaining) as total_lessons_remaining
      FROM users u
      JOIN subscriptions s ON u.id = s.user_id
      WHERE s.status = 'confirmed'
        AND s.is_active = 1
        AND (s.valid_until IS NULL OR datetime(s.valid_until) >= datetime('now'))
      GROUP BY u.id
      ORDER BY u.first_name, u.last_name
    `).all();
    
    res.json({ users });
  } catch (error) {
    console.error('Ошибка получения детальной статистики пользователей:', error);
    res.status(500).json({ error: 'Ошибка получения статистики' });
  }
});

// Получить детальную статистику по записям
router.get('/bookings', adminMiddleware, (req, res) => {
  try {
    const { period = 'all' } = req.query;
    const { startDate, endDate } = getPeriodDates(period);
    
    let dateCondition = '';
    let dateParams = [];
    
    if (startDate && endDate) {
      dateCondition = `AND date(b.booking_date) >= date(?) AND date(b.booking_date) <= date(?)`;
      dateParams = [
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      ];
    }
    
    const bookings = db.prepare(`
      SELECT 
        b.id,
        b.booking_date,
        b.status,
        l.lesson_date,
        l.start_time,
        l.end_time,
        d.name as direction_name,
        h.name as hall_name,
        TRIM(t.name || ' ' || COALESCE(t.last_name, '')) as trainer_name,
        u.first_name,
        u.last_name,
        u.phone
      FROM bookings b
      JOIN lessons l ON b.lesson_id = l.id
      JOIN directions d ON l.direction_id = d.id
      JOIN halls h ON l.hall_id = h.id
      JOIN trainers t ON l.trainer_id = t.id
      JOIN users u ON b.user_id = u.id
      WHERE b.status = 'confirmed'
      ${dateCondition}
      ORDER BY b.booking_date DESC, l.start_time DESC
    `).all(...dateParams);
    
    res.json({ bookings });
  } catch (error) {
    console.error('Ошибка получения детальной статистики записей:', error);
    res.status(500).json({ error: 'Ошибка получения статистики' });
  }
});

module.exports = router;

