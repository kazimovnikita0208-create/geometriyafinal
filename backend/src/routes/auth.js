const express = require('express');
const router = express.Router();
const db = require('../config/database');
const dbAdapter = require('../config/database-adapter');
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
    let user = await dbAdapter.get('users', { telegram_id: telegramUser.id.toString() });

    if (!user) {
      // Создаем нового пользователя
      const userData = {
        telegram_id: telegramUser.id.toString(),
        username: telegramUser.username || null,
        first_name: telegramUser.first_name || null,
        last_name: telegramUser.last_name || null,
        is_admin: isAdmin(telegramUser.id),
        is_active: true,
        notifications_enabled: true
      };

      user = await dbAdapter.insert('users', userData);
      console.log(`✅ Создан новый пользователь: ${user.first_name} (ID: ${user.id})`);
    } else {
      // Обновляем данные существующего пользователя
      const updateData = {
        username: telegramUser.username || user.username,
        first_name: telegramUser.first_name || user.first_name,
        last_name: telegramUser.last_name || user.last_name,
        is_admin: isAdmin(telegramUser.id),
        updated_at: new Date().toISOString()
      };

      user = await dbAdapter.update('users', updateData, { id: user.id });
      console.log(`✅ Пользователь вошел: ${user.first_name} (ID: ${user.id})`);
    }

    // Генерируем JWT токен
    const token = generateToken({
      id: user.id,
      telegramId: user.telegram_id,
      isAdmin: user.is_admin === true || user.is_admin === 1
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
        isAdmin: user.is_admin === true || user.is_admin === 1,
        notificationsEnabled: user.notifications_enabled === true || user.notifications_enabled === 1,
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
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    
    // Получаем актуальные данные пользователя из БД
    const currentUser = await dbAdapter.get('users', { id: user.id });
    
    if (!currentUser) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'Пользователь не найден' 
      });
    }
    
    res.json({
      user: {
        id: currentUser.id,
        telegramId: currentUser.telegram_id.toString(),
        username: currentUser.username,
        firstName: currentUser.first_name,
        lastName: currentUser.last_name,
        phone: currentUser.phone,
        isAdmin: currentUser.is_admin === true || currentUser.is_admin === 1,
        notificationsEnabled: currentUser.notifications_enabled === true || currentUser.notifications_enabled === 1,
        isActive: currentUser.is_active === true || currentUser.is_active === 1,
        createdAt: currentUser.created_at,
        updatedAt: currentUser.updated_at
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
