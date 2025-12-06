const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { optionalAuthMiddleware } = require('../middleware/auth');

/**
 * GET /api/halls
 * Получить список всех активных залов
 */
router.get('/', optionalAuthMiddleware, (req, res) => {
  try {
    const halls = db.prepare('SELECT * FROM halls WHERE is_active = 1 ORDER BY id ASC').all();

    const formattedHalls = halls.map(hall => ({
      id: hall.id,
      name: hall.name,
      address: hall.address,
      capacity: hall.capacity,
      hasPoles: hall.has_poles === 1,
      poleCount: hall.pole_count,
      pricePerHour: hall.price_per_hour
    }));

    res.json({ halls: formattedHalls });
  } catch (error) {
    console.error('Get halls error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Ошибка при получении залов' 
    });
  }
});

/**
 * GET /api/halls/:id
 * Получить один зал по ID
 */
router.get('/:id', optionalAuthMiddleware, (req, res) => {
  try {
    const hallId = parseInt(req.params.id);

    if (isNaN(hallId)) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Неверный ID зала' 
      });
    }

    const hall = db.prepare('SELECT * FROM halls WHERE id = ? AND is_active = 1').get(hallId);

    if (!hall) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'Зал не найден' 
      });
    }

    res.json({
      hall: {
        id: hall.id,
        name: hall.name,
        address: hall.address,
        capacity: hall.capacity,
        hasPoles: hall.has_poles === 1,
        poleCount: hall.pole_count,
        pricePerHour: hall.price_per_hour
      }
    });
  } catch (error) {
    console.error('Get hall error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Ошибка при получении зала' 
    });
  }
});

module.exports = router;
