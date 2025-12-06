const crypto = require('crypto');
const { BOT_TOKEN } = require('../config/telegram');

/**
 * Валидирует данные Telegram Web App согласно официальной документации
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 * 
 * @param {string} initData - строка initData от Telegram
 * @param {string} botToken - токен бота
 * @returns {object|null} - Распарсенные данные или null если невалидны
 */
function validateTelegramWebAppData(initData, botToken) {
  if (!initData || !botToken) {
    console.error('❌ Отсутствует initData или botToken');
    return null;
  }

  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    
    if (!hash) {
      console.error('❌ Отсутствует hash в initData');
      return null;
    }

    // Удаляем hash из параметров для проверки
    params.delete('hash');

    // Создаем строку для проверки (сортированные пары ключ=значение)
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Создаем секретный ключ из токена бота
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Вычисляем hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Сравниваем хеши
    if (calculatedHash !== hash) {
      console.error('❌ Невалидный hash в initData');
      return null;
    }

    // Парсим данные пользователя
    const userJson = params.get('user');
    if (!userJson) {
      console.error('❌ Отсутствуют данные пользователя в initData');
      return null;
    }

    const user = JSON.parse(userJson);
    const authDate = parseInt(params.get('auth_date') || '0');

    // Проверка времени (не старше 1 часа)
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const timeDiff = currentTimestamp - authDate;
    
    if (timeDiff > 3600) {
      console.error(`❌ initData устарел (${Math.floor(timeDiff / 60)} минут назад, максимум 60 минут)`);
      return null;
    }

    // Возвращаем полные данные
    return {
      user,
      authDate,
      queryId: params.get('query_id'),
      chatInstance: params.get('chat_instance'),
      chatType: params.get('chat_type'),
      startParam: params.get('start_param'),
      hash: hash // Сохраняем для возможной повторной проверки
    };
  } catch (error) {
    console.error('❌ Ошибка валидации Telegram Web App Data:', error.message);
    return null;
  }
}

/**
 * Middleware для проверки аутентификации через Telegram Web App
 * Используется для endpoint /api/auth/login
 */
async function telegramAuthMiddleware(req, res, next) {
  try {
    // Получаем initData из body или заголовка
    const initData = req.body?.initData || req.headers['x-telegram-init-data'];

    if (!initData) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Telegram Web App data not provided',
        code: 'MISSING_INIT_DATA'
      });
    }

    // Валидируем данные
    const validatedData = validateTelegramWebAppData(initData, BOT_TOKEN);
    
    if (!validatedData) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid Telegram Web App data',
        code: 'INVALID_INIT_DATA'
      });
    }

    // Проверяем наличие данных пользователя
    if (!validatedData.user || !validatedData.user.id) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'User data not found in initData',
        code: 'MISSING_USER_DATA'
      });
    }

    // Добавляем данные пользователя в request
    req.telegramUser = validatedData.user;
    req.telegramInitData = initData;
    req.telegramAuthDate = validatedData.authDate;

    console.log(`✅ Telegram auth успешна для пользователя ${validatedData.user.id} (${validatedData.user.first_name || 'без имени'})`);
    
    next();
  } catch (error) {
    console.error('❌ Telegram auth error:', error);
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Authentication failed',
      code: 'AUTH_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Извлечь данные пользователя из валидированного initData
 * @param {string} initData 
 * @param {string} botToken 
 * @returns {object|null}
 */
function extractUserData(initData, botToken) {
  const validatedData = validateTelegramWebAppData(initData, botToken);
  
  if (!validatedData || !validatedData.user) {
    return null;
  }
  
  const { user } = validatedData;
  
  return {
    telegram_id: user.id,
    username: user.username || null,
    first_name: user.first_name || null,
    last_name: user.last_name || null,
    language_code: user.language_code || 'ru',
    is_premium: user.is_premium || false,
    photo_url: user.photo_url || null
  };
}

module.exports = {
  validateTelegramWebAppData,
  telegramAuthMiddleware,
  extractUserData
};


