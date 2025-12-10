const express = require('express');
const router = express.Router();
const dbAdapter = require('../config/database-adapter');
const { optionalAuthMiddleware } = require('../middleware/auth');

/**
 * GET /api/directions
 * Получить список всех активных направлений
 */
router.get('/', optionalAuthMiddleware, async (req, res) => {
  try {
    const directions = await dbAdapter.select('directions', { is_active: true });

    // Форматируем данные (в Supabase JSON поля уже распарсены)
    const formattedDirections = directions.map(direction => ({
      id: direction.id,
      name: direction.name,
      slug: direction.slug,
      tagline: direction.tagline,
      description: direction.description,
      features: Array.isArray(direction.features) ? direction.features : (direction.features ? JSON.parse(direction.features) : []),
      levels: Array.isArray(direction.levels) ? direction.levels : (direction.levels ? JSON.parse(direction.levels) : []),
      color: direction.color,
      requires_pole: direction.requires_pole === true || direction.requires_pole === 1 // Поддержка обоих форматов
    }));

    // Сортируем по id
    formattedDirections.sort((a, b) => a.id - b.id);

    res.json({ directions: formattedDirections });
  } catch (error) {
    console.error('Get directions error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Ошибка при получении направлений' 
    });
  }
});

/**
 * GET /api/directions/:slug
 * Получить одно направление по slug
 */
router.get('/:slug', optionalAuthMiddleware, async (req, res) => {
  try {
    const { slug } = req.params;

    const direction = await dbAdapter.get('directions', { slug, is_active: true });

    if (!direction) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'Направление не найдено' 
      });
    }

    // Форматируем данные (в Supabase JSON поля уже распарсены)
    const formattedDirection = {
      id: direction.id,
      name: direction.name,
      slug: direction.slug,
      tagline: direction.tagline,
      description: direction.description,
      features: Array.isArray(direction.features) ? direction.features : (direction.features ? JSON.parse(direction.features) : []),
      levels: Array.isArray(direction.levels) ? direction.levels : (direction.levels ? JSON.parse(direction.levels) : []),
      color: direction.color,
      requires_pole: direction.requires_pole === true || direction.requires_pole === 1 // Поддержка обоих форматов
    };

    res.json({ direction: formattedDirection });
  } catch (error) {
    console.error('Get direction error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Ошибка при получении направления' 
    });
  }
});

module.exports = router;




