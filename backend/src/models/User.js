/**
 * Модель User для работы с пользователями
 */

const { getDatabase } = require('../config/database');

class User {
  /**
   * Найти пользователя по Telegram ID
   * @param {number} telegramId 
   * @returns {object|null}
   */
  static findByTelegramId(telegramId) {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM users WHERE telegram_id = ?');
    return stmt.get(telegramId);
  }
  
  /**
   * Найти пользователя по ID
   * @param {number} id 
   * @returns {object|null}
   */
  static findById(id) {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  }
  
  /**
   * Создать нового пользователя
   * @param {object} userData 
   * @returns {object}
   */
  static create(userData) {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO users (telegram_id, username, first_name, last_name, phone)
      VALUES (@telegram_id, @username, @first_name, @last_name, @phone)
    `);
    
    const result = stmt.run({
      telegram_id: userData.telegram_id,
      username: userData.username || null,
      first_name: userData.first_name || null,
      last_name: userData.last_name || null,
      phone: userData.phone || null
    });
    
    return this.findById(result.lastInsertRowid);
  }
  
  /**
   * Обновить данные пользователя
   * @param {number} id 
   * @param {object} userData 
   * @returns {object}
   */
  static update(id, userData) {
    const db = getDatabase();
    
    const fields = [];
    const values = {};
    
    if (userData.username !== undefined) {
      fields.push('username = @username');
      values.username = userData.username;
    }
    if (userData.first_name !== undefined) {
      fields.push('first_name = @first_name');
      values.first_name = userData.first_name;
    }
    if (userData.last_name !== undefined) {
      fields.push('last_name = @last_name');
      values.last_name = userData.last_name;
    }
    if (userData.phone !== undefined) {
      fields.push('phone = @phone');
      values.phone = userData.phone;
    }
    if (userData.notifications_enabled !== undefined) {
      fields.push('notifications_enabled = @notifications_enabled');
      values.notifications_enabled = userData.notifications_enabled ? 1 : 0;
    }
    
    if (fields.length === 0) {
      return this.findById(id);
    }
    
    values.id = id;
    
    const stmt = db.prepare(`
      UPDATE users 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `);
    
    stmt.run(values);
    return this.findById(id);
  }
  
  /**
   * Создать или обновить пользователя (upsert)
   * @param {object} userData 
   * @returns {object}
   */
  static upsert(userData) {
    const existing = this.findByTelegramId(userData.telegram_id);
    
    if (existing) {
      return this.update(existing.id, userData);
    } else {
      return this.create(userData);
    }
  }
  
  /**
   * Получить всех активных пользователей для рассылки
   * @returns {Array}
   */
  static getAllForBroadcast() {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT telegram_id, first_name, notifications_enabled 
      FROM users 
      WHERE is_active = 1 AND notifications_enabled = 1
    `);
    return stmt.all();
  }
  
  /**
   * Деактивировать пользователя
   * @param {number} id 
   */
  static deactivate(id) {
    const db = getDatabase();
    const stmt = db.prepare('UPDATE users SET is_active = 0 WHERE id = ?');
    stmt.run(id);
  }
  
  /**
   * Получить статистику пользователя
   * @param {number} userId 
   * @returns {object}
   */
  static getStats(userId) {
    const db = getDatabase();
    
    // Количество посещённых занятий
    const completedLessons = db.prepare(`
      SELECT COUNT(*) as count 
      FROM bookings 
      WHERE user_id = ? AND status = 'completed'
    `).get(userId);
    
    // Количество будущих занятий
    const upcomingLessons = db.prepare(`
      SELECT COUNT(*) as count 
      FROM bookings b
      JOIN lessons l ON b.lesson_id = l.id
      WHERE b.user_id = ? 
        AND b.status = 'confirmed'
        AND l.start_time > datetime('now')
    `).get(userId);
    
    // Активные абонементы
    const activeSubscriptions = db.prepare(`
      SELECT COUNT(*) as count 
      FROM subscriptions 
      WHERE user_id = ? 
        AND is_active = 1 
        AND valid_until >= date('now')
        AND lessons_remaining > 0
    `).get(userId);
    
    return {
      completed_lessons: completedLessons.count,
      upcoming_lessons: upcomingLessons.count,
      active_subscriptions: activeSubscriptions.count
    };
  }
}

module.exports = User;

