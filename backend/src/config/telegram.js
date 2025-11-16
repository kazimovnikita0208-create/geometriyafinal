/**
 * Конфигурация Telegram Bot
 */

require('dotenv').config();

const config = {
  botToken: process.env.BOT_TOKEN,
  miniAppUrl: process.env.MINI_APP_URL || 'http://localhost:3000',
  
  // Опции для бота
  botOptions: {
    polling: true,
    // Можно добавить webhook для продакшена
    // webhook: {
    //   port: process.env.WEBHOOK_PORT || 8443,
    //   host: process.env.WEBHOOK_HOST || '0.0.0.0'
    // }
  },
  
  // Правила отмены записей
  cancellationRules: {
    // За сколько часов можно отменить вечернее занятие
    eveningHoursBefore: 4,
    // До какого часа предыдущего дня можно отменить дневное
    morningDeadlineHour: 21,
    // Начало и конец дневных занятий
    morningClassesStart: 10,
    morningClassesEnd: 15
  },
  
  // Настройки уведомлений
  notifications: {
    // За сколько часов отправлять напоминание
    reminderHoursBefore: 2,
    // За сколько дней предупреждать об истечении абонемента
    subscriptionExpiryWarningDays: 3
  }
};

// Валидация конфигурации
if (!config.botToken) {
  throw new Error('❌ BOT_TOKEN не указан в .env файле');
}

module.exports = config;

