const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Получить всех тренеров
router.get('/', authMiddleware, (req, res) => {
  try {
    // Админ видит всех тренеров, обычные пользователи - только активных
    const isAdmin = req.user?.is_admin === 1;
    const whereClause = isAdmin ? '' : 'WHERE is_active = 1';
    
    const stmt = db.prepare(`
      SELECT id, name, last_name, phone, email, directions, bio, is_active
      FROM trainers
      ${whereClause}
      ORDER BY name ASC
    `);
    
    const trainers = stmt.all();
    
    // Парсим JSON поля
    const formattedTrainers = trainers.map(trainer => ({
      ...trainer,
      directions: trainer.directions ? JSON.parse(trainer.directions) : []
    }));
    
    res.json({ trainers: formattedTrainers });
  } catch (error) {
    console.error('Ошибка получения тренеров:', error);
    res.status(500).json({ error: 'Ошибка получения тренеров' });
  }
});

// Получить тренера по ID
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    
    const stmt = db.prepare(`
      SELECT id, name, last_name, phone, email, directions, bio, is_active
      FROM trainers
      WHERE id = ?
    `);
    
    const trainer = stmt.get(id);
    
    if (!trainer) {
      return res.status(404).json({ error: 'Тренер не найден' });
    }
    
    // Парсим JSON поля
    trainer.directions = trainer.directions ? JSON.parse(trainer.directions) : [];
    
    res.json(trainer);
  } catch (error) {
    console.error('Ошибка получения тренера:', error);
    res.status(500).json({ error: 'Ошибка получения тренера' });
  }
});

// Создать нового тренера (только для админа)
router.post('/', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { name, last_name, directions, bio } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Имя обязательно' });
    }
    
    const stmt = db.prepare(`
      INSERT INTO trainers (name, last_name, directions, bio, is_active)
      VALUES (?, ?, ?, ?, 1)
    `);
    
    const directionsJson = Array.isArray(directions) ? JSON.stringify(directions) : (directions || '[]');
    
    const result = stmt.run(
      name,
      last_name || null,
      directionsJson,
      bio || null
    );
    
    // Получаем созданного тренера
    const newTrainer = db.prepare('SELECT * FROM trainers WHERE id = ?').get(result.lastInsertRowid);
    newTrainer.directions = newTrainer.directions ? JSON.parse(newTrainer.directions) : [];
    
    res.status(201).json({ trainer: newTrainer });
  } catch (error) {
    console.error('Ошибка создания тренера:', error);
    res.status(500).json({ error: 'Ошибка создания тренера' });
  }
});

// Обновить тренера (только для админа)
router.put('/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { name, last_name, directions, bio, is_active } = req.body;
    
    // Проверяем существование тренера
    const existing = db.prepare('SELECT id FROM trainers WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Тренер не найден' });
    }
    
    if (!name) {
      return res.status(400).json({ error: 'Имя обязательно' });
    }
    
    const stmt = db.prepare(`
      UPDATE trainers
      SET name = ?, last_name = ?, directions = ?, bio = ?, is_active = ?
      WHERE id = ?
    `);
    
    const directionsJson = Array.isArray(directions) ? JSON.stringify(directions) : (directions || '[]');
    const isActive = is_active !== undefined ? (is_active ? 1 : 0) : 1;
    
    stmt.run(
      name,
      last_name || null,
      directionsJson,
      bio || null,
      isActive,
      id
    );
    
    // Получаем обновленного тренера
    const updatedTrainer = db.prepare('SELECT * FROM trainers WHERE id = ?').get(id);
    updatedTrainer.directions = updatedTrainer.directions ? JSON.parse(updatedTrainer.directions) : [];
    
    res.json({ trainer: updatedTrainer });
  } catch (error) {
    console.error('Ошибка обновления тренера:', error);
    res.status(500).json({ error: 'Ошибка обновления тренера' });
  }
});

// Удалить тренера (мягкое удаление - только для админа)
router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    
    // Проверяем существование тренера
    const existing = db.prepare('SELECT id FROM trainers WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Тренер не найден' });
    }
    
    // Проверяем, нет ли активных занятий с этим тренером
    const activeLessons = db.prepare(`
      SELECT COUNT(*) as count FROM lessons 
      WHERE trainer_id = ? AND lesson_date >= date('now')
    `).get(id);
    
    if (activeLessons.count > 0) {
      return res.status(400).json({ 
        error: 'Нельзя удалить тренера с активными занятиями. Сначала удалите или переназначьте занятия.' 
      });
    }
    
    // Проверяем, нет ли шаблонов повторяющихся занятий с этим тренером
    const recurringLessons = db.prepare(`
      SELECT COUNT(*) as count FROM recurring_lessons 
      WHERE trainer_id = ? AND is_active = 1
    `).get(id);
    
    if (recurringLessons.count > 0) {
      return res.status(400).json({ 
        error: 'Нельзя удалить тренера с активными шаблонами повторяющихся занятий. Сначала удалите или измените шаблоны.' 
      });
    }
    
    // Полное удаление из базы данных
    const stmt = db.prepare('DELETE FROM trainers WHERE id = ?');
    stmt.run(id);
    
    res.json({ message: 'Тренер успешно удален' });
  } catch (error) {
    console.error('Ошибка удаления тренера:', error);
    res.status(500).json({ error: 'Ошибка удаления тренера' });
  }
});

module.exports = router;



// Создать нового тренера (только для админа)
router.post('/', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { name, last_name, directions, bio } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Имя обязательно' });
    }
    
    const stmt = db.prepare(`
      INSERT INTO trainers (name, last_name, directions, bio, is_active)
      VALUES (?, ?, ?, ?, 1)
    `);
    
    const directionsJson = Array.isArray(directions) ? JSON.stringify(directions) : (directions || '[]');
    
    const result = stmt.run(
      name,
      last_name || null,
      directionsJson,
      bio || null
    );
    
    // Получаем созданного тренера
    const newTrainer = db.prepare('SELECT * FROM trainers WHERE id = ?').get(result.lastInsertRowid);
    newTrainer.directions = newTrainer.directions ? JSON.parse(newTrainer.directions) : [];
    
    res.status(201).json({ trainer: newTrainer });
  } catch (error) {
    console.error('Ошибка создания тренера:', error);
    res.status(500).json({ error: 'Ошибка создания тренера' });
  }
});

// Обновить тренера (только для админа)
router.put('/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { name, last_name, directions, bio, is_active } = req.body;
    
    // Проверяем существование тренера
    const existing = db.prepare('SELECT id FROM trainers WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Тренер не найден' });
    }
    
    if (!name) {
      return res.status(400).json({ error: 'Имя обязательно' });
    }
    
    const stmt = db.prepare(`
      UPDATE trainers
      SET name = ?, last_name = ?, directions = ?, bio = ?, is_active = ?
      WHERE id = ?
    `);
    
    const directionsJson = Array.isArray(directions) ? JSON.stringify(directions) : (directions || '[]');
    const isActive = is_active !== undefined ? (is_active ? 1 : 0) : 1;
    
    stmt.run(
      name,
      last_name || null,
      directionsJson,
      bio || null,
      isActive,
      id
    );
    
    // Получаем обновленного тренера
    const updatedTrainer = db.prepare('SELECT * FROM trainers WHERE id = ?').get(id);
    updatedTrainer.directions = updatedTrainer.directions ? JSON.parse(updatedTrainer.directions) : [];
    
    res.json({ trainer: updatedTrainer });
  } catch (error) {
    console.error('Ошибка обновления тренера:', error);
    res.status(500).json({ error: 'Ошибка обновления тренера' });
  }
});

// Удалить тренера (мягкое удаление - только для админа)
router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    
    // Проверяем существование тренера
    const existing = db.prepare('SELECT id FROM trainers WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Тренер не найден' });
    }
    
    // Проверяем, нет ли активных занятий с этим тренером
    const activeLessons = db.prepare(`
      SELECT COUNT(*) as count FROM lessons 
      WHERE trainer_id = ? AND lesson_date >= date('now')
    `).get(id);
    
    if (activeLessons.count > 0) {
      return res.status(400).json({ 
        error: 'Нельзя удалить тренера с активными занятиями. Сначала удалите или переназначьте занятия.' 
      });
    }
    
    // Проверяем, нет ли шаблонов повторяющихся занятий с этим тренером
    const recurringLessons = db.prepare(`
      SELECT COUNT(*) as count FROM recurring_lessons 
      WHERE trainer_id = ? AND is_active = 1
    `).get(id);
    
    if (recurringLessons.count > 0) {
      return res.status(400).json({ 
        error: 'Нельзя удалить тренера с активными шаблонами повторяющихся занятий. Сначала удалите или измените шаблоны.' 
      });
    }
    
    // Полное удаление из базы данных
    const stmt = db.prepare('DELETE FROM trainers WHERE id = ?');
    stmt.run(id);
    
    res.json({ message: 'Тренер успешно удален' });
  } catch (error) {
    console.error('Ошибка удаления тренера:', error);
    res.status(500).json({ error: 'Ошибка удаления тренера' });
  }
});

module.exports = router;

