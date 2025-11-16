/**
 * Сервис для авторизации через Telegram WebApp
 * Валидация initData от Telegram
 */

const crypto = require('crypto');

/**
 * Валидация данных от Telegram WebApp
 * Согласно документации: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 * 
 * @param {string} initData - Строка initData от Telegram WebApp
 * @param {string} botToken - Токен бота
 * @returns {object|null} - Распарсенные данные или null если невалидны
 */
function validateTelegramWebAppData(initData, botToken) {
  try {
    // Парсим initData
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) {
      console.error('❌ Отсутствует hash в initData');
      return null;
    }
    
    // Удаляем hash из параметров
    urlParams.delete('hash');
    
    // Создаём строку для проверки (сортированные пары ключ=значение)
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    // Создаём секретный ключ из токена бота
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
    const user = JSON.parse(urlParams.get('user') || '{}');
    const authDate = parseInt(urlParams.get('auth_date') || '0');
    
    // Проверка времени (не старше 1 часа)
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (currentTimestamp - authDate > 3600) {
      console.error('❌ initData устарел (более 1 часа)');
      return null;
    }
    
    return {
      user,
      authDate,
      queryId: urlParams.get('query_id'),
      chatInstance: urlParams.get('chat_instance'),
      chatType: urlParams.get('chat_type'),
      startParam: urlParams.get('start_param')
    };
    
  } catch (error) {
    console.error('❌ Ошибка валидации initData:', error.message);
    return null;
  }
}

/**
 * Извлечь данные пользователя из Telegram initData
 * @param {string} initData 
 * @param {string} botToken 
 * @returns {object|null}
 */
function extractUserData(initData, botToken) {
  const validatedData = validateTelegramWebAppData(initData, botToken);
  
  if (!validatedData) {
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

/**
 * Простая валидация для разработки (не использовать в продакшене!)
 * @param {string} initData 
 * @returns {object|null}
 */
function validateTelegramWebAppDataDev(initData) {
  try {
    const urlParams = new URLSearchParams(initData);
    const user = JSON.parse(urlParams.get('user') || '{}');
    
    if (!user.id) {
      return null;
    }
    
    return {
      user,
      authDate: Math.floor(Date.now() / 1000),
      queryId: urlParams.get('query_id')
    };
  } catch (error) {
    console.error('❌ Ошибка парсинга initData (dev mode):', error.message);
    return null;
  }
}

module.exports = {
  validateTelegramWebAppData,
  extractUserData,
  validateTelegramWebAppDataDev
};

