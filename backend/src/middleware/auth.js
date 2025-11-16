/**
 * Middleware для проверки JWT токенов
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware для проверки JWT токена
 * Добавляет данные пользователя в req.user
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Токен не предоставлен',
      code: 'NO_TOKEN'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Токен истёк',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(403).json({ 
      error: 'Невалидный токен',
      code: 'INVALID_TOKEN'
    });
  }
}

/**
 * Генерация JWT токена
 * @param {object} payload - Данные для токена
 * @param {string} expiresIn - Срок действия (по умолчанию 30 дней)
 * @returns {string}
 */
function generateToken(payload, expiresIn = '30d') {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

/**
 * Middleware для опциональной авторизации
 * Не требует токен, но если он есть - проверяет его
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    req.user = null;
    return next();
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (error) {
    req.user = null;
  }
  
  next();
}

module.exports = {
  authenticateToken,
  generateToken,
  optionalAuth
};

