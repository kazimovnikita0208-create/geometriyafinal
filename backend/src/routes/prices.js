const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

/**
 * GET /api/prices
 * Получить все цены (абонементы, аренда залов, аренда пилонов)
 */
router.get('/', authMiddleware, (req, res) => {
  try {
    // Получаем цены на абонементы
    const subscriptionTypes = db.prepare(`
      SELECT id, name, category, price, lesson_count
      FROM subscription_types
      WHERE is_active = 1
      ORDER BY category, price
    `).all();

    // Получаем цены на аренду залов
    const halls = db.prepare(`
      SELECT id, name, price_per_hour, pole_count
      FROM halls
      WHERE is_active = 1
      ORDER BY id
    `).all();

    // Получаем цену на аренду пилона (из settings или используем дефолтную)
    const polePriceSetting = db.prepare('SELECT value FROM settings WHERE key = ?').get('pole_rental_price_per_hour');
    const polePricePerHour = polePriceSetting ? parseFloat(polePriceSetting.value) : 500;

    res.json({
      subscriptionTypes: subscriptionTypes.map(st => ({
        id: st.id,
        name: st.name,
        category: st.category,
        price: st.price,
        lessonCount: st.lesson_count
      })),
      halls: halls.map(h => ({
        id: h.id,
        name: h.name,
        pricePerHour: h.price_per_hour,
        poleCount: h.pole_count
      })),
      polePricePerHour
    });
  } catch (error) {
    console.error('Get prices error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Ошибка при получении цен' 
    });
  }
});

/**
 * PUT /api/prices/subscription-types/:id
 * Обновить цену абонемента
 */
router.put('/subscription-types/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;

    if (!price || price < 0) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Некорректная цена' 
      });
    }

    const result = db.prepare(`
      UPDATE subscription_types
      SET price = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(price, id);

    if (result.changes === 0) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'Тип абонемента не найден' 
      });
    }

    res.json({ 
      message: 'Цена абонемента обновлена',
      price 
    });
  } catch (error) {
    console.error('Update subscription type price error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Ошибка при обновлении цены абонемента' 
    });
  }
});

/**
 * PUT /api/prices/halls/:id
 * Обновить цену аренды зала
 */
router.put('/halls/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { pricePerHour } = req.body;

    if (!pricePerHour || pricePerHour < 0) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Некорректная цена' 
      });
    }

    const result = db.prepare(`
      UPDATE halls
      SET price_per_hour = ?
      WHERE id = ?
    `).run(pricePerHour, id);

    if (result.changes === 0) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'Зал не найден' 
      });
    }

    res.json({ 
      message: 'Цена аренды зала обновлена',
      pricePerHour 
    });
  } catch (error) {
    console.error('Update hall price error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Ошибка при обновлении цены аренды зала' 
    });
  }
});

/**
 * PUT /api/prices/pole-rental
 * Обновить цену аренды пилона
 */
router.put('/pole-rental', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { pricePerHour } = req.body;

    if (!pricePerHour || pricePerHour < 0) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Некорректная цена' 
      });
    }

    // Проверяем, есть ли настройка
    const existing = db.prepare('SELECT * FROM settings WHERE key = ?').get('pole_rental_price_per_hour');
    
    if (existing) {
      db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(pricePerHour.toString(), 'pole_rental_price_per_hour');
    } else {
      db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('pole_rental_price_per_hour', pricePerHour.toString());
    }

    res.json({ 
      message: 'Цена аренды пилона обновлена',
      pricePerHour 
    });
  } catch (error) {
    console.error('Update pole rental price error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Ошибка при обновлении цены аренды пилона' 
    });
  }
});

module.exports = router;


