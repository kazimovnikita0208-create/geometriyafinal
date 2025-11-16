/**
 * Роуты для авторизации через Telegram WebApp
 */

const express = require('express');
const router = express.Router();

const User = require('../models/User');
const { extractUserData } = require('../services/telegramAuth');
const { generateToken } = require('../middleware/auth');
const telegramConfig = require('../config/telegram');

/**
 * POST /api/v1/auth/telegram
 * Авторизация через Telegram WebApp initData
 * 
 * Body: { initData: string }
 * Response: { token: string, user: object }
 */
router.post('/telegram', async (req, res) => {
  try {
    const { initData } = req.body;
    
    if (!initData) {
      return res.status(400).json({ 
        error: 'Отсутствует initData',
        code: 'NO_INIT_DATA'
      });
    }
    
    // Валидация и извлечение данных пользователя
    const userData = extractUserData(initData, telegramConfig.botToken);
    
    if (!userData) {
      return res.status(401).json({ 
        error: 'Невалидные данные от Telegram',
        code: 'INVALID_INIT_DATA'
      });
    }
    
    // Создание или обновление пользователя в БД
    const user = User.upsert(userData);
    
    // Генерация JWT токена
    const token = generateToken({
      userId: user.id,
      telegramId: user.telegram_id
    });
    
    // Получение статистики пользователя
    const stats = User.getStats(user.id);
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        telegram_id: user.telegram_id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        notifications_enabled: user.notifications_enabled,
        created_at: user.created_at,
        stats
      }
    });
    
  } catch (error) {
    console.error('❌ Ошибка авторизации:', error);
    res.status(500).json({ 
      error: 'Ошибка сервера при авторизации',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * GET /api/v1/auth/verify
 * Проверка валидности токена
 */
router.get('/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      valid: false,
      error: 'Токен не предоставлен'
    });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = User.findById(decoded.userId);
    
    if (!user || !user.is_active) {
      return res.status(401).json({ 
        valid: false,
        error: 'Пользователь не найден или неактивен'
      });
    }
    
    res.json({
      valid: true,
      user: {
        id: user.id,
        telegram_id: user.telegram_id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
    
  } catch (error) {
    res.status(401).json({ 
      valid: false,
      error: 'Невалидный токен'
    });
  }
});

module.exports = router;

