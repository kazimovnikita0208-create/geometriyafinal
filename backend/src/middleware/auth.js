const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { isAdmin: checkIsAdmin } = require('../config/telegram');

const JWT_SECRET = process.env.JWT_SECRET;
// 🚀 РЕЖИМ РАЗРАБОТКИ: Если true, авторизация не требуется
const DEV_MODE = process.env.DEV_MODE === 'true';

if (!JWT_SECRET && !DEV_MODE) {
  console.error('❌ JWT_SECRET не установлен в переменных окружения!');
  process.exit(1);
}

if (DEV_MODE) {
  console.log('🚀 РЕЖИМ РАЗРАБОТКИ АКТИВЕН - авторизация отключена');
}

/**
 * Создает JWT токен для пользователя
 * @param {Object} user - объект пользователя из БД
 * @returns {string} - JWT токен
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      telegramId: user.telegramId,
      isAdmin: user.isAdmin
    },
    JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
}

/**
 * Верифицирует JWT токен
 * @param {string} token - JWT токен
 * @returns {Object|null} - декодированные данные или null
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Middleware для проверки JWT токена
 */
async function authMiddleware(req, res, next) {
  try {
    // 🚀 РЕЖИМ РАЗРАБОТКИ: Создаем тестового пользователя
    if (DEV_MODE) {
      // Проверяем, есть ли тестовый пользователь
      let testUser = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(999999999);
      
      // Если нет - создаем
      if (!testUser) {
        db.prepare(`
          INSERT INTO users (telegram_id, username, first_name, last_name, phone, is_admin)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(999999999, 'test_admin', 'Тестовый', 'Администратор', '89397187500', 1);
        
        testUser = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(999999999);
        console.log('✅ Создан тестовый АДМИН для DEV_MODE');
      } else if (testUser.is_admin === 0) {
        // Если пользователь есть, но не админ - делаем его админом
        db.prepare('UPDATE users SET is_admin = 1, first_name = ?, last_name = ? WHERE telegram_id = ?')
          .run('Тестовый', 'Администратор', 999999999);
        testUser = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(999999999);
        console.log('✅ Тестовый пользователь обновлён до АДМИНА');
      }
      
      req.user = testUser;
      req.userId = testUser.id;
      return next();
    }

    // Получаем токен из заголовка Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Authorization token not provided' 
      });
    }

    const token = authHeader.substring(7); // Убираем "Bearer "

    // Верифицируем токен
    const decoded = verifyToken(token);
    
    if (!decoded) {
    return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid or expired token' 
    });
  }
  
    // Получаем пользователя из БД
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);

    if (!user || user.is_active !== 1) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'User not found or inactive' 
      });
    }
    
    // Добавляем пользователя в request
    req.user = user;
    req.userId = user.id;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Authentication failed' 
    });
  }
}

/**
 * Middleware для проверки прав администратора
 */
function adminMiddleware(req, res, next) {
  // 🚀 РЕЖИМ РАЗРАБОТКИ: Даем админские права всем
  if (DEV_MODE) {
    return next();
  }

  if (!req.user) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Authentication required' 
    });
  }

  if (req.user.is_admin !== 1) {
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'Admin access required' 
    });
  }

  next();
}

/**
 * Опциональная аутентификация (не требует токен, но проверяет если он есть)
 */
async function optionalAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Токена нет - продолжаем без авторизации
    return next();
  }
  
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (decoded) {
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);

      if (user && user.is_active === 1) {
        req.user = user;
        req.userId = user.id;
      }
  }
  
  next();
  } catch (error) {
    // Игнорируем ошибки и продолжаем без авторизации
    next();
  }
}

module.exports = {
  generateToken,
  verifyToken,
  authMiddleware,
  adminMiddleware,
  optionalAuthMiddleware
};

