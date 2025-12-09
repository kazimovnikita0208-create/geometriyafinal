const jwt = require('jsonwebtoken');
const db = require('../config/database');
const dbAdapter = require('../config/database-adapter');
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
      let testUser = await dbAdapter.get('users', { telegram_id: '999999999' });
      
      // Если нет - создаем
      if (!testUser) {
        testUser = await dbAdapter.insert('users', {
          telegram_id: '999999999',
          username: 'test_admin',
          first_name: 'Тестовый',
          last_name: 'Администратор',
          phone: '89397187500',
          is_admin: true,
          is_active: true,
          notifications_enabled: true
        });
        console.log('✅ Создан тестовый АДМИН для DEV_MODE');
      } else if (!testUser.is_admin) {
        // Если пользователь есть, но не админ - делаем его админом
        testUser = await dbAdapter.update('users', {
          is_admin: true,
          first_name: 'Тестовый',
          last_name: 'Администратор'
        }, { telegram_id: '999999999' });
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

    // 🧪 ТЕСТОВЫЙ РЕЖИМ: Поддержка тестового токена для разработки
    if (token === 'test-token-for-development' && (process.env.NODE_ENV === 'development' || process.env.ALLOW_TEST_TOKEN === 'true')) {
      console.log('🧪 Используется тестовый токен для разработки');
      console.log('🔍 ALLOW_TEST_TOKEN:', process.env.ALLOW_TEST_TOKEN);
      console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
      
      try {
        // Ищем или создаем тестового пользователя
        let testUser = await dbAdapter.get('users', { telegram_id: '999999999' });
        console.log('🔍 Поиск тестового пользователя:', testUser ? 'найден' : 'не найден');
        
        if (!testUser) {
          console.log('📝 Создание тестового пользователя...');
          testUser = await dbAdapter.insert('users', {
            telegram_id: '999999999',
            username: 'test_user',
            first_name: 'Тестовый',
            last_name: 'Пользователь',
            is_admin: true,
            is_active: true,
            notifications_enabled: true
          });
          console.log('✅ Создан тестовый пользователь для тестового токена, ID:', testUser?.id);
        } else {
          console.log('✅ Тестовый пользователь найден, ID:', testUser.id);
        }
        
        if (!testUser || !testUser.id) {
          console.error('❌ Ошибка: тестовый пользователь не создан или не имеет ID');
          return res.status(500).json({ 
            error: 'Internal Server Error',
            message: 'Failed to create test user' 
          });
        }
        
        req.user = testUser;
        req.userId = testUser.id;
        console.log('✅ Тестовый пользователь установлен в request, userId:', req.userId);
        console.log('➡️ AuthMiddleware: Вызываю next() для тестового токена. Выполнение должно остановиться здесь.');
        return next();
        // Этот код не должен выполниться, но если выполнится - это ошибка
        console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: Код продолжил выполнение после return next() в блоке тестового токена!');
      } catch (error) {
        console.error('❌ Ошибка при работе с тестовым пользователем:', error);
        return res.status(500).json({ 
          error: 'Internal Server Error',
          message: error.message || 'Failed to process test token' 
        });
      }
    }

    // Верифицируем токен (этот код не должен выполниться для тестового токена)
    console.log('➡️ AuthMiddleware: Переход к обычной верификации токена (не должно быть для тестового токена)');
    const decoded = verifyToken(token);
    
    if (!decoded) {
    return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid or expired token' 
    });
  }
  
    // Получаем пользователя из БД
    const user = await dbAdapter.get('users', { id: decoded.id });

    if (!user || (user.is_active !== true && user.is_active !== 1)) {
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

