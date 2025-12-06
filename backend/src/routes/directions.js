const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { optionalAuthMiddleware } = require('../middleware/auth');

/**
 * GET /api/directions
 * Получить список всех активных направлений
 */
router.get('/', optionalAuthMiddleware, (req, res) => {
  try {
    const directions = db.prepare('SELECT * FROM directions WHERE is_active = 1 ORDER BY id ASC').all();

    // Парсим JSON поля
    const formattedDirections = directions.map(direction => ({
      id: direction.id,
      name: direction.name,
      slug: direction.slug,
      tagline: direction.tagline,
      description: direction.description,
      features: direction.features ? JSON.parse(direction.features) : [],
      levels: direction.levels ? JSON.parse(direction.levels) : [],
      color: direction.color,
      requires_pole: direction.requires_pole === 1 // Конвертируем 0/1 в boolean
    }));

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
router.get('/:slug', optionalAuthMiddleware, (req, res) => {
  try {
    const { slug } = req.params;

    const direction = db.prepare('SELECT * FROM directions WHERE slug = ? AND is_active = 1').get(slug);

    if (!direction) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'Направление не найдено' 
      });
    }

    // Парсим JSON поля
    const formattedDirection = {
      id: direction.id,
      name: direction.name,
      slug: direction.slug,
      tagline: direction.tagline,
      description: direction.description,
      features: direction.features ? JSON.parse(direction.features) : [],
      levels: direction.levels ? JSON.parse(direction.levels) : [],
      color: direction.color,
      requires_pole: direction.requires_pole === 1 // Конвертируем 0/1 в boolean
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




