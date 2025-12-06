const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { optionalAuthMiddleware } = require('../middleware/auth');

/**
 * GET /api/subscription-types
 * Получить все типы абонементов, сгруппированные по категориям
 */
router.get('/', optionalAuthMiddleware, (req, res) => {
  try {
    const subscriptionTypes = db.prepare(`
      SELECT * FROM subscription_types 
      WHERE is_active = 1 
      ORDER BY category ASC, price ASC
    `).all();

    // Группируем по категориям
    const groupedTypes = {};
    
    subscriptionTypes.forEach(type => {
      if (!groupedTypes[type.category]) {
        groupedTypes[type.category] = [];
      }
      
      groupedTypes[type.category].push({
        id: type.id,
        category: type.category, // ✅ Добавлено поле category
        name: type.name,
        lessonCount: type.lesson_count,
        price: type.price,
        validityDays: type.validity_days,
        description: type.description,
        poleLesson: type.pole_lessons, // ✅ Для комбо-абонементов
        fitnessLessons: type.fitness_lessons // ✅ Для комбо-абонементов
      });
    });

    res.json({ subscriptionTypes: groupedTypes });
  } catch (error) {
    console.error('Get subscription types error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Ошибка при получении типов абонементов' 
    });
  }
});

/**
 * GET /api/subscription-types/:id
 * Получить один тип абонемента по ID
 */
router.get('/:id', optionalAuthMiddleware, (req, res) => {
  try {
    const typeId = parseInt(req.params.id);

    if (isNaN(typeId)) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Неверный ID типа абонемента' 
      });
    }

    const subscriptionType = db.prepare(`
      SELECT * FROM subscription_types 
      WHERE id = ? AND is_active = 1
    `).get(typeId);

    if (!subscriptionType) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'Тип абонемента не найден' 
      });
    }

    res.json({
      subscriptionType: {
        id: subscriptionType.id,
        category: subscriptionType.category,
        name: subscriptionType.name,
        lessonCount: subscriptionType.lesson_count,
        price: subscriptionType.price,
        validityDays: subscriptionType.validity_days,
        description: subscriptionType.description
      }
    });
  } catch (error) {
    console.error('Get subscription type error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Ошибка при получении типа абонемента' 
    });
  }
});

module.exports = router;

module.exports = router;

