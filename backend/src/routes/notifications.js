const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const notificationService = require('../services/notificationService');

// Получить все шаблоны уведомлений
router.get('/templates', adminMiddleware, (req, res) => {
  try {
    const templates = db.prepare(`
      SELECT * FROM notification_templates 
      ORDER BY created_at DESC
    `).all();

    res.json({ templates });
  } catch (error) {
    console.error('Error getting templates:', error);
    res.status(500).json({ error: 'Ошибка при получении шаблонов' });
  }
});

// Создать шаблон уведомления
router.post('/templates', adminMiddleware, (req, res) => {
  try {
    const { name, type, title, message, variables } = req.body;

    if (!name || !type || !title || !message) {
      return res.status(400).json({ error: 'Заполните все обязательные поля' });
    }

    const result = db.prepare(`
      INSERT INTO notification_templates (name, type, title, message, variables)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, type, title, message, variables ? JSON.stringify(variables) : null);

    const template = db.prepare('SELECT * FROM notification_templates WHERE id = ?').get(result.lastInsertRowid);

    res.json({ message: 'Шаблон создан', template });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Ошибка при создании шаблона' });
  }
});

// Обновить шаблон уведомления
router.put('/templates/:id', adminMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, title, message, variables, is_active } = req.body;

    db.prepare(`
      UPDATE notification_templates 
      SET name = ?, type = ?, title = ?, message = ?, variables = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name,
      type,
      title,
      message,
      variables ? JSON.stringify(variables) : null,
      is_active !== undefined ? is_active : 1,
      id
    );

    const template = db.prepare('SELECT * FROM notification_templates WHERE id = ?').get(id);

    res.json({ message: 'Шаблон обновлен', template });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Ошибка при обновлении шаблона' });
  }
});

// Удалить шаблон уведомления
router.delete('/templates/:id', adminMiddleware, (req, res) => {
  try {
    const { id } = req.params;

    db.prepare('DELETE FROM notification_templates WHERE id = ?').run(id);

    res.json({ message: 'Шаблон удален' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Ошибка при удалении шаблона' });
  }
});

// Получить все уведомления
router.get('/', adminMiddleware, (req, res) => {
  try {
    const { status, type, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        n.*,
        u.first_name || ' ' || COALESCE(u.last_name, '') as user_name,
        u.telegram_id,
        t.name as template_name,
        creator.first_name || ' ' || COALESCE(creator.last_name, '') as creator_name
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.id
      LEFT JOIN notification_templates t ON n.template_id = t.id
      LEFT JOIN users creator ON n.created_by = creator.id
      WHERE 1=1
    `;

    const params = [];

    if (status) {
      query += ' AND n.status = ?';
      params.push(status);
    }

    if (type) {
      query += ' AND n.type = ?';
      params.push(type);
    }

    query += ' ORDER BY n.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const notifications = db.prepare(query).all(...params);

    const total = db.prepare(`
      SELECT COUNT(*) as count FROM notifications
      WHERE 1=1 ${status ? 'AND status = ?' : ''} ${type ? 'AND type = ?' : ''}
    `).get(...(status || type ? [status || type, type || status].filter(Boolean) : []));

    res.json({ 
      notifications,
      total: total?.count || 0
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ error: 'Ошибка при получении уведомлений' });
  }
});

// Создать и отправить уведомление
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const { templateId, userId, title, message, type, targetAudience, targetConfig, scheduledAt } = req.body;
    const adminId = req.userId;

    if (!title || !message || !type) {
      return res.status(400).json({ error: 'Заполните все обязательные поля' });
    }

    // Если указана целевая аудитория, создаем уведомления для всех пользователей
    if (targetAudience && targetAudience !== 'single') {
      const telegramIds = notificationService.getTargetUsers(targetAudience, targetConfig || {});
      
      if (telegramIds.length === 0) {
        return res.status(400).json({ error: 'Не найдено пользователей для отправки' });
      }

      const notifications = [];
      for (const telegramId of telegramIds) {
        const user = db.prepare('SELECT id FROM users WHERE telegram_id = ?').get(telegramId);
        if (user) {
          const result = db.prepare(`
            INSERT INTO notifications (template_id, user_id, title, message, type, status, scheduled_at, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            templateId || null,
            user.id,
            title,
            message,
            type,
            scheduledAt ? 'pending' : 'pending',
            scheduledAt || null,
            adminId
          );
          notifications.push(result.lastInsertRowid);
        }
      }

      // Если не запланировано, отправляем сразу
      if (!scheduledAt) {
        let success = 0;
        let failed = 0;
        for (const notificationId of notifications) {
          const result = await notificationService.sendNotificationById(notificationId);
          if (result) success++;
          else failed++;
        }
        return res.json({ 
          message: `Уведомления созданы и отправлены`,
          notificationsCreated: notifications.length,
          sent: success,
          failed
        });
      }

      return res.json({ 
        message: `Уведомления созданы (${notifications.length} шт.)`,
        notificationsCreated: notifications.length
      });
    } else {
      // Одно уведомление конкретному пользователю
      const result = db.prepare(`
        INSERT INTO notifications (template_id, user_id, title, message, type, status, scheduled_at, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        templateId || null,
        userId || null,
        title,
        message,
        type,
        scheduledAt ? 'pending' : 'pending',
        scheduledAt || null,
        adminId
      );

      const notificationId = result.lastInsertRowid;

      // Если не запланировано, отправляем сразу
      if (!scheduledAt && userId) {
        const success = await notificationService.sendNotificationById(notificationId);
        return res.json({ 
          message: success ? 'Уведомление отправлено' : 'Ошибка отправки уведомления',
          notificationId,
          sent: success
        });
      }

      return res.json({ 
        message: 'Уведомление создано',
        notificationId
      });
    }
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Ошибка при создании уведомления' });
  }
});

// Отправить уведомление по ID
router.post('/:id/send', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const success = await notificationService.sendNotificationById(parseInt(id));

    if (success) {
      res.json({ message: 'Уведомление отправлено' });
    } else {
      res.status(400).json({ error: 'Не удалось отправить уведомление' });
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Ошибка при отправке уведомления' });
  }
});

// Получить расписания уведомлений
router.get('/schedules', adminMiddleware, (req, res) => {
  try {
    const schedules = db.prepare(`
      SELECT 
        s.*,
        t.name as template_name,
        t.title as template_title
      FROM notification_schedules s
      LEFT JOIN notification_templates t ON s.template_id = t.id
      ORDER BY s.created_at DESC
    `).all();

    res.json({ schedules });
  } catch (error) {
    console.error('Error getting schedules:', error);
    res.status(500).json({ error: 'Ошибка при получении расписаний' });
  }
});

// Создать расписание уведомлений
router.post('/schedules', adminMiddleware, (req, res) => {
  try {
    const { templateId, name, scheduleType, scheduleConfig, targetAudience, targetConfig } = req.body;

    if (!templateId || !name || !scheduleType) {
      return res.status(400).json({ error: 'Заполните все обязательные поля' });
    }

    // Вычисляем next_run_at на основе scheduleType и scheduleConfig
    let nextRunAt = null;
    if (scheduleType === 'daily') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      nextRunAt = tomorrow.toISOString();
    } else if (scheduleType === 'weekly') {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextRunAt = nextWeek.toISOString();
    }

    const result = db.prepare(`
      INSERT INTO notification_schedules 
      (template_id, name, schedule_type, schedule_config, target_audience, target_config, next_run_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      templateId,
      name,
      scheduleType,
      scheduleConfig ? JSON.stringify(scheduleConfig) : null,
      targetAudience || 'all',
      targetConfig ? JSON.stringify(targetConfig) : null,
      nextRunAt
    );

    const schedule = db.prepare('SELECT * FROM notification_schedules WHERE id = ?').get(result.lastInsertRowid);

    res.json({ message: 'Расписание создано', schedule });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ error: 'Ошибка при создании расписания' });
  }
});

// Обновить расписание уведомлений
router.put('/schedules/:id', adminMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { name, scheduleType, scheduleConfig, targetAudience, targetConfig, is_active } = req.body;

    db.prepare(`
      UPDATE notification_schedules 
      SET name = ?, schedule_type = ?, schedule_config = ?, target_audience = ?, target_config = ?, 
          is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name,
      scheduleType,
      scheduleConfig ? JSON.stringify(scheduleConfig) : null,
      targetAudience,
      targetConfig ? JSON.stringify(targetConfig) : null,
      is_active !== undefined ? is_active : 1,
      id
    );

    const schedule = db.prepare('SELECT * FROM notification_schedules WHERE id = ?').get(id);

    res.json({ message: 'Расписание обновлено', schedule });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ error: 'Ошибка при обновлении расписания' });
  }
});

// Удалить расписание уведомлений
router.delete('/schedules/:id', adminMiddleware, (req, res) => {
  try {
    const { id } = req.params;

    db.prepare('DELETE FROM notification_schedules WHERE id = ?').run(id);

    res.json({ message: 'Расписание удалено' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ error: 'Ошибка при удалении расписания' });
  }
});

// Получить список пользователей для выбора
router.get('/users', adminMiddleware, (req, res) => {
  try {
    const { search } = req.query;

    let query = `
      SELECT 
        u.id,
        u.telegram_id,
        u.first_name,
        u.last_name,
        u.phone,
        u.username,
        u.notifications_enabled,
        COUNT(DISTINCT s.id) as active_subscriptions_count
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'confirmed' AND s.is_active = 1
      WHERE u.telegram_id IS NOT NULL
    `;

    const params = [];

    if (search) {
      query += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.phone LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' GROUP BY u.id ORDER BY u.first_name, u.last_name LIMIT 100';

    const users = db.prepare(query).all(...params);

    res.json({ users });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Ошибка при получении пользователей' });
  }
});

module.exports = router;


