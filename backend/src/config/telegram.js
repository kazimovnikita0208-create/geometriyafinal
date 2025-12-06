const TelegramBot = require('node-telegram-bot-api');

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.warn('⚠️  BOT_TOKEN не найден в переменных окружения');
}

// Создаем бота без polling (будем использовать только для отправки сообщений)
const bot = BOT_TOKEN ? new TelegramBot(BOT_TOKEN, { polling: false }) : null;

// Получаем список ID админов
const getAdminIds = () => {
  const adminIds = process.env.ADMIN_TELEGRAM_IDS;
  if (!adminIds) return [];
  
  return adminIds
    .split(',')
    .map(id => parseInt(id.trim()))
    .filter(id => !isNaN(id));
};

// Проверка, является ли пользователь админом
const isAdmin = (telegramId) => {
  const adminIds = getAdminIds();
  return adminIds.includes(parseInt(telegramId));
};

module.exports = {
  bot,
  BOT_TOKEN,
  getAdminIds,
  isAdmin
};
