const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { telegramAuthMiddleware } = require('../middleware/telegramAuth');
const { generateToken, authMiddleware } = require('../middleware/auth');
const { isAdmin } = require('../config/telegram');

/**
 * POST /api/auth/login
 * Аутентификация через Telegram Web App
 */
router.post('/login', telegramAuthMiddleware, async (req, res) => {
  try {
    const telegramUser = req.telegramUser;

    // Ищем пользователя
    let user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegramUser.id);

    if (!user) {
      // Создаем нового пользователя
      const insertUser = db.prepare(`
        INSERT INTO users (telegram_id, username, first_name, last_name, is_admin, is_active, notifications_enabled)
        VALUES (?, ?, ?, ?, ?, 1, 1)
      `);
      
      const result = insertUser.run(
        telegramUser.id,
        telegramUser.username || null,
        telegramUser.first_name || null,
        telegramUser.last_name || null,
        isAdmin(telegramUser.id) ? 1 : 0
      );

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
      console.log(`✅ Создан новый пользователь: ${user.first_name} (ID: ${user.id})`);
    } else {
      // Обновляем данные существующего пользователя
      db.prepare(`
        UPDATE users 
        SET username = ?, first_name = ?, last_name = ?, is_admin = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        telegramUser.username || user.username,
        telegramUser.first_name || user.first_name,
        telegramUser.last_name || user.last_name,
        isAdmin(telegramUser.id) ? 1 : 0,
        user.id
      );

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
      console.log(`✅ Пользователь вошел: ${user.first_name} (ID: ${user.id})`);
    }

    // Генерируем JWT токен
    const token = generateToken({
      id: user.id,
      telegramId: user.telegram_id,
      isAdmin: user.is_admin === 1
    });
    
    // Возвращаем токен и данные пользователя
    res.json({
      token,
      user: {
        id: user.id,
        telegramId: user.telegram_id.toString(),
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        isAdmin: user.is_admin === 1,
        notificationsEnabled: user.notifications_enabled === 1,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Ошибка при авторизации' 
    });
  }
});

/**
 * GET /api/auth/me
 * Получить текущего пользователя
 */
router.get('/me', authMiddleware, (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      user: {
        id: user.id,
        telegramId: user.telegram_id.toString(),
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        isAdmin: user.is_admin === 1,
        notificationsEnabled: user.notifications_enabled === 1,
        isActive: user.is_active === 1,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Ошибка при получении данных пользователя' 
    });
  }
});

/**
 * POST /api/auth/logout
 * Выход (на самом деле просто информационный endpoint, т.к. JWT stateless)
 */
router.post('/logout', authMiddleware, (req, res) => {
  console.log(`✅ Пользователь вышел: ${req.user.firstName} (ID: ${req.user.id})`);
  
  res.json({ 
    message: 'Logged out successfully',
    info: 'JWT токен остается валидным до истечения срока действия. Удалите его на клиенте.'
  });
});

module.exports = router;
