const express = require('express');
const router = express.Router();
const dbAdapter = require('../config/database-adapter');
const { optionalAuthMiddleware } = require('../middleware/auth');

/**
 * GET /api/halls
 * Получить список всех активных залов
 */
router.get('/', optionalAuthMiddleware, async (req, res) => {
  try {
    const halls = await dbAdapter.select('halls', { is_active: true });

    const formattedHalls = halls.map(hall => ({
      id: hall.id,
      name: hall.name,
      address: hall.address,
      capacity: hall.capacity,
      hasPoles: hall.has_poles === true || hall.has_poles === 1,
      poleCount: hall.pole_count,
      pricePerHour: hall.price_per_hour
    }));

    // Сортируем по id
    formattedHalls.sort((a, b) => a.id - b.id);

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
router.get('/:id', optionalAuthMiddleware, async (req, res) => {
  try {
    const hallId = parseInt(req.params.id);

    if (isNaN(hallId)) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Неверный ID зала' 
      });
    }

    const hall = await dbAdapter.get('halls', { id: hallId, is_active: true });

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
        hasPoles: hall.has_poles === true || hall.has_poles === 1,
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
