/**
 * Telegram Bot для студии "Геометрия"
 */

const TelegramBot = require('node-telegram-bot-api');
const telegramConfig = require('../config/telegram');

// Создание экземпляра бота
const bot = new TelegramBot(telegramConfig.botToken, telegramConfig.botOptions);

console.log('🤖 Бот инициализирован');

// Команда /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'друг';
  
  const welcomeMessage = `
👋 Привет, ${firstName}!

Добро пожаловать в студию танцев и растяжки *«Геометрия»*!

🏢 Наши залы:
• ул. Волгина, 117А
• Московское шоссе, 43, ТОЦ "Охотный ряд"

💃 У нас вы можете заниматься:
• Pole Dance
• Exotic Pole Dance
• Растяжка
• Воздушные полотна
• Хореография

Для записи на занятия откройте наше приложение! 👇
  `.trim();
  
  bot.sendMessage(chatId, welcomeMessage, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '📱 Открыть приложение',
            web_app: { url: telegramConfig.miniAppUrl }
          }
        ],
        [
          { text: '📞 Контакты', callback_data: 'contacts' },
          { text: 'ℹ️ О студии', callback_data: 'about' }
        ]
      ]
    }
  });
});

// Команда /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  
  const helpMessage = `
📖 *Помощь*

Доступные команды:
/start - Главное меню
/help - Эта справка
/schedule - Быстрый просмотр расписания
/mylessons - Мои занятия

🔔 *Уведомления:*
Вы будете получать напоминания о занятиях за 2 часа до начала.

❌ *Правила отмены:*
• Вечерние занятия (после 15:00) - отмена за 4 часа
• Дневные занятия (10:00-15:00) - отмена до 21:00 предыдущего дня

📱 Для полного функционала используйте наше приложение!
  `.trim();
  
  bot.sendMessage(chatId, helpMessage, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '📱 Открыть приложение',
            web_app: { url: telegramConfig.miniAppUrl }
          }
        ]
      ]
    }
  });
});

// Обработка callback кнопок
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  
  switch (data) {
    case 'contacts':
      bot.sendMessage(chatId, `
📞 *Контакты студии "Геометрия"*

📍 Залы:
• ул. Волгина, 117А
• Московское шоссе, 43, ТОЦ "Охотный ряд"

📱 Телефон: +7 (XXX) XXX-XX-XX
📸 Instagram: @geometriya_dance

⏰ Время работы: ежедневно 10:00 - 22:00
      `.trim(), {
        parse_mode: 'Markdown'
      });
      break;
      
    case 'about':
      bot.sendMessage(chatId, `
💜 *О студии "Геометрия"*

Мы - студия танцев и растяжки с двумя залами в городе.

Наши направления:
🎭 Pole Dance - танец на пилоне
💃 Exotic Pole Dance - чувственный танец в туфлях
🤸 Растяжка - stretching для гибкости
🎪 Воздушные полотна - акробатика
💫 Хореография - танцевальные связки

У нас работают опытные преподаватели, а занятия проходят в уютной атмосфере!

Приходите на пробное занятие! ✨
      `.trim(), {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '📅 Записаться',
                web_app: { url: telegramConfig.miniAppUrl }
              }
            ]
          ]
        }
      });
      break;
  }
  
  // Ответить на callback query
  bot.answerCallbackQuery(query.id);
});

// Команда /schedule (опционально - краткое расписание)
bot.onText(/\/schedule/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId, `
📅 *Расписание занятий*

Для просмотра полного расписания с фильтрами откройте приложение! 👇

В приложении вы сможете:
• Фильтровать по залам и направлениям
• Видеть свободные места
• Сразу записаться на занятие
  `.trim(), {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '📱 Открыть расписание',
            web_app: { url: `${telegramConfig.miniAppUrl}/schedule` }
          }
        ]
      ]
    }
  });
});

// Команда /mylessons
bot.onText(/\/mylessons/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId, `
👤 *Мои занятия*

Для просмотра ваших записей и абонемента откройте личный кабинет в приложении! 👇
  `.trim(), {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '👤 Личный кабинет',
            web_app: { url: `${telegramConfig.miniAppUrl}/profile` }
          }
        ]
      ]
    }
  });
});

/**
 * Отправить уведомление пользователю
 * @param {number} telegramId - Telegram ID пользователя
 * @param {string} message - Текст сообщения
 * @param {object} options - Дополнительные опции
 */
async function sendNotification(telegramId, message, options = {}) {
  try {
    await bot.sendMessage(telegramId, message, {
      parse_mode: 'Markdown',
      ...options
    });
    return true;
  } catch (error) {
    console.error(`❌ Ошибка отправки уведомления пользователю ${telegramId}:`, error.message);
    return false;
  }
}

/**
 * Отправить напоминание о занятии
 * @param {number} telegramId 
 * @param {object} lessonData 
 */
async function sendLessonReminder(telegramId, lessonData) {
  const message = `
🔔 *Напоминание о занятии*

📅 ${lessonData.date}
⏰ ${lessonData.time}
💃 ${lessonData.direction}
👤 Преподаватель: ${lessonData.teacher}
📍 ${lessonData.hall}

До встречи на занятии! 💜
  `.trim();
  
  return sendNotification(telegramId, message);
}

/**
 * Отправить массовую рассылку
 * @param {Array} userIds - Массив Telegram ID
 * @param {string} message - Текст сообщения
 */
async function sendBroadcast(userIds, message) {
  const results = {
    success: 0,
    failed: 0
  };
  
  for (const userId of userIds) {
    const sent = await sendNotification(userId, message);
    if (sent) {
      results.success++;
    } else {
      results.failed++;
    }
    
    // Задержка между сообщениями (30 сообщений в секунду - лимит Telegram)
    await new Promise(resolve => setTimeout(resolve, 40));
  }
  
  console.log(`📢 Рассылка завершена: отправлено ${results.success}, ошибок ${results.failed}`);
  return results;
}

// Обработка ошибок
bot.on('polling_error', (error) => {
  console.error('❌ Ошибка polling:', error.message);
});

bot.on('error', (error) => {
  console.error('❌ Ошибка бота:', error.message);
});

module.exports = {
  bot,
  sendNotification,
  sendLessonReminder,
  sendBroadcast
};

