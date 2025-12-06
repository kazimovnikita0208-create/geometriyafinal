/**
 * Сервис для отправки уведомлений через Telegram
 */

const TelegramBot = require('node-telegram-bot-api');
const db = require('../config/database');

const BOT_TOKEN = process.env.BOT_TOKEN;

// Создаем бота для отправки сообщений
const bot = BOT_TOKEN ? new TelegramBot(BOT_TOKEN, { polling: false }) : null;

/**
 * Отправить уведомление пользователю
 * @param {number} telegramId - Telegram ID пользователя
 * @param {string} title - Заголовок уведомления
 * @param {string} message - Текст сообщения
 * @param {object} options - Дополнительные опции (parse_mode, reply_markup и т.д.)
 * @returns {Promise<boolean>} - Успешно ли отправлено
 */
async function sendNotification(telegramId, title, message, options = {}) {
  if (!bot) {
    console.error('❌ Telegram бот не инициализирован (BOT_TOKEN отсутствует)');
    return false;
  }

  if (!telegramId) {
    console.error('❌ Telegram ID не указан');
    return false;
  }

  try {
    // Форматируем сообщение с заголовком
    const fullMessage = title ? `*${title}*\n\n${message}` : message;

    const messageOptions = {
      parse_mode: 'Markdown',
      ...options
    };

    await bot.sendMessage(telegramId, fullMessage, messageOptions);
    console.log(`✅ Уведомление отправлено пользователю ${telegramId}`);
    return true;
  } catch (error) {
    console.error(`❌ Ошибка отправки уведомления пользователю ${telegramId}:`, error.message);
    return false;
  }
}

/**
 * Отправить уведомление нескольким пользователям
 * @param {Array<number>} telegramIds - Массив Telegram ID
 * @param {string} title - Заголовок уведомления
 * @param {string} message - Текст сообщения
 * @param {object} options - Дополнительные опции
 * @returns {Promise<{success: number, failed: number}>} - Статистика отправки
 */
async function sendBulkNotification(telegramIds, title, message, options = {}) {
  let success = 0;
  let failed = 0;

  for (const telegramId of telegramIds) {
    const result = await sendNotification(telegramId, title, message, options);
    if (result) {
      success++;
    } else {
      failed++;
    }
    // Небольшая задержка между отправками, чтобы не превысить лимиты API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return { success, failed };
}

/**
 * Отправить уведомление по ID из базы данных
 * @param {number} notificationId - ID уведомления в БД
 * @returns {Promise<boolean>} - Успешно ли отправлено
 */
async function sendNotificationById(notificationId) {
  const notification = db.prepare(`
    SELECT n.*, u.telegram_id, u.notifications_enabled
    FROM notifications n
    LEFT JOIN users u ON n.user_id = u.id
    WHERE n.id = ?
  `).get(notificationId);

  if (!notification) {
    console.error(`❌ Уведомление ${notificationId} не найдено`);
    return false;
  }

  if (!notification.telegram_id) {
    console.error(`❌ У пользователя ${notification.user_id} не указан Telegram ID`);
    db.prepare('UPDATE notifications SET status = ?, error_message = ? WHERE id = ?')
      .run('failed', 'Telegram ID не указан', notificationId);
    return false;
  }

  if (!notification.notifications_enabled) {
    console.log(`⚠️ Пользователь ${notification.user_id} отключил уведомления`);
    db.prepare('UPDATE notifications SET status = ?, error_message = ? WHERE id = ?')
      .run('failed', 'Уведомления отключены пользователем', notificationId);
    return false;
  }

  const success = await sendNotification(
    notification.telegram_id,
    notification.title,
    notification.message
  );

  if (success) {
    db.prepare(`
      UPDATE notifications 
      SET status = 'sent', sent_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(notificationId);
  } else {
    db.prepare(`
      UPDATE notifications 
      SET status = 'failed', error_message = ? 
      WHERE id = ?
    `).run('Ошибка отправки через Telegram API', notificationId);
  }

  return success;
}

/**
 * Получить список пользователей для массовой рассылки
 * @param {string} targetAudience - Тип целевой аудитории
 * @param {object} targetConfig - Конфигурация целевой аудитории
 * @returns {Array<number>} - Массив Telegram ID
 */
function getTargetUsers(targetAudience, targetConfig = {}) {
  let query = `
    SELECT DISTINCT u.telegram_id
    FROM users u
    WHERE u.telegram_id IS NOT NULL 
    AND u.notifications_enabled = 1
    AND u.is_active = 1
  `;

  if (targetAudience === 'active_subscriptions') {
    query += `
      AND EXISTS (
        SELECT 1 FROM subscriptions s
        WHERE s.user_id = u.id
        AND s.status = 'confirmed'
        AND s.is_active = 1
        AND date(s.valid_until) >= date('now')
      )
    `;
  } else if (targetAudience === 'specific_users' && targetConfig.userIds) {
    const userIds = Array.isArray(targetConfig.userIds) 
      ? targetConfig.userIds.join(',') 
      : targetConfig.userIds;
    query += ` AND u.id IN (${userIds})`;
  } else if (targetAudience === 'by_subscription_type' && targetConfig.subscriptionTypeId) {
    query += `
      AND EXISTS (
        SELECT 1 FROM subscriptions s
        WHERE s.user_id = u.id
        AND s.subscription_type_id = ?
        AND s.status = 'confirmed'
        AND s.is_active = 1
      )
    `;
  }

  const users = db.prepare(query).all(
    targetAudience === 'by_subscription_type' ? targetConfig.subscriptionTypeId : undefined
  );

  return users
    .map(u => u.telegram_id)
    .filter(id => id !== null && id !== undefined);
}

/**
 * Отправить напоминание о занятии
 * @param {number} bookingId - ID записи на занятие
 * @param {number} hoursBefore - За сколько часов до начала отправлять
 * @returns {Promise<boolean>}
 */
async function sendLessonReminder(bookingId, hoursBefore = 4) {
  const booking = db.prepare(`
    SELECT 
      b.*,
      l.lesson_date,
      l.start_time,
      l.end_time,
      d.name as direction_name,
      h.name as hall_name,
      h.address as hall_address,
      TRIM(t.name || ' ' || COALESCE(t.last_name, '')) as trainer_name,
      u.telegram_id,
      u.notifications_enabled
    FROM bookings b
    LEFT JOIN lessons l ON b.lesson_id = l.id
    LEFT JOIN directions d ON l.direction_id = d.id
    LEFT JOIN halls h ON l.hall_id = h.id
    LEFT JOIN trainers t ON l.trainer_id = t.id
    LEFT JOIN users u ON b.user_id = u.id
    WHERE b.id = ?
    AND b.status = 'confirmed'
  `).get(bookingId);

  if (!booking || !booking.telegram_id || !booking.notifications_enabled) {
    return false;
  }

  const lessonDateTime = new Date(`${booking.lesson_date}T${booking.start_time}`);
  const reminderTime = new Date(lessonDateTime.getTime() - hoursBefore * 60 * 60 * 1000);
  const now = new Date();

  // Проверяем, нужно ли отправлять напоминание сейчас
  if (now < reminderTime) {
    return false;
  }

  const title = '📅 Напоминание о занятии';
  const message = `
Здравствуйте! Напоминаем, что у вас запланировано занятие:

*${booking.direction_name}*
📅 ${new Date(booking.lesson_date).toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
⏰ ${booking.start_time} - ${booking.end_time}
🏢 ${booking.hall_name}
📍 ${booking.hall_address}
👤 Тренер: ${booking.trainer_name}

До встречи! 💪
  `.trim();

  return await sendNotification(booking.telegram_id, title, message);
}

module.exports = {
  sendNotification,
  sendBulkNotification,
  sendNotificationById,
  getTargetUsers,
  sendLessonReminder
};


