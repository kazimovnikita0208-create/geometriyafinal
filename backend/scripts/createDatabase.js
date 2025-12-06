const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

console.log('🗄️  Создание базы данных SQLite...\n');

// Путь к файлу БД
const dbPath = path.join(__dirname, '..', 'dev.db');

// Удаляем старую БД если есть
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('✓ Старая база данных удалена');
}

// Создаем новую БД
const db = new Database(dbPath);
console.log('✓ Файл базы данных создан');

// SQL для создания таблиц
const createTablesSQL = `
-- Пользователи
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id INTEGER UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    is_active INTEGER DEFAULT 1,
    notifications_enabled INTEGER DEFAULT 1,
    is_admin INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Залы
CREATE TABLE halls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    capacity INTEGER DEFAULT 6,
    has_poles INTEGER DEFAULT 1,
    pole_count INTEGER DEFAULT 6,
    price_per_hour REAL NOT NULL,
    is_active INTEGER DEFAULT 1
);

-- Направления
CREATE TABLE directions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    tagline TEXT,
    features TEXT,
    levels TEXT,
    color TEXT DEFAULT '#5833b6',
    requires_pole INTEGER DEFAULT 0, -- 1 = требует пилон (Pole Fit, Pole Exotic), 0 = фитнес (остальные)
    is_active INTEGER DEFAULT 1
);

-- Тренеры
CREATE TABLE trainers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    directions TEXT,
    bio TEXT,
    is_active INTEGER DEFAULT 1
);

-- Типы абонементов
CREATE TABLE subscription_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL, -- 'classic', 'fitness', 'combo'
    name TEXT NOT NULL,
    lesson_count INTEGER NOT NULL,
    validity_days INTEGER DEFAULT 30,
    price REAL NOT NULL,
    description TEXT,
    is_active INTEGER DEFAULT 1,
    -- Для комбо-абонементов
    pole_lessons INTEGER DEFAULT 0, -- количество занятий с пилоном (Pole Fit, Pole Exotic)
    fitness_lessons INTEGER DEFAULT 0 -- количество занятий без пилона (Сила&Гибкость, Choreo, Strip, Растяжка)
);

-- Абонементы пользователей
CREATE TABLE subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subscription_type_id INTEGER NOT NULL,
    lessons_remaining INTEGER NOT NULL,
    valid_from DATETIME NOT NULL,
    valid_until DATETIME NOT NULL,
    booking_type TEXT DEFAULT 'flexible',
    auto_direction TEXT,
    auto_weekdays TEXT,
    address TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    is_active INTEGER DEFAULT 0,
    rejection_reason TEXT,
    -- Для комбо-абонементов
    pole_lessons_remaining INTEGER DEFAULT 0, -- осталось занятий с пилоном
    fitness_lessons_remaining INTEGER DEFAULT 0, -- осталось занятий без пилона
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (subscription_type_id) REFERENCES subscription_types(id)
);

-- Занятия (расписание)
CREATE TABLE lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hall_id INTEGER NOT NULL,
    direction_id INTEGER NOT NULL,
    trainer_id INTEGER NOT NULL,
    lesson_date DATE NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    capacity INTEGER DEFAULT 6,
    current_bookings INTEGER DEFAULT 0,
    is_recurring INTEGER DEFAULT 0,
    recurrence_pattern TEXT,
    description TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hall_id) REFERENCES halls(id),
    FOREIGN KEY (direction_id) REFERENCES directions(id),
    FOREIGN KEY (trainer_id) REFERENCES trainers(id)
);

-- Записи на занятия
CREATE TABLE bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    lesson_id INTEGER NOT NULL,
    subscription_id INTEGER NOT NULL,
    booking_date DATETIME NOT NULL,
    status TEXT DEFAULT 'confirmed',
    booked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    cancelled_at DATETIME,
    cancellation_reason TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (lesson_id) REFERENCES lessons(id),
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
);

-- Аренда залов/пилонов
CREATE TABLE rental_bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    hall_id INTEGER NOT NULL,
    rental_type TEXT NOT NULL,
    pole_count INTEGER,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    participants INTEGER,
    total_price REAL NOT NULL,
    comment TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (hall_id) REFERENCES halls(id)
);

-- Уведомления
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_sent INTEGER DEFAULT 0,
    sent_at DATETIME,
    scheduled_for DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Настройки системы
CREATE TABLE settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Заморозки абонементов
CREATE TABLE subscription_freezes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subscription_id INTEGER NOT NULL,
    freeze_start_date DATE NOT NULL,
    freeze_end_date DATE NOT NULL,
    freeze_days INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
);

-- Шаблоны уведомлений
CREATE TABLE notification_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'reminder', 'promotion', 'personal', 'system'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    variables TEXT, -- JSON с переменными для персонализации
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Уведомления
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_id INTEGER,
    user_id INTEGER,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    scheduled_at DATETIME,
    sent_at DATETIME,
    error_message TEXT,
    created_by INTEGER, -- ID админа, создавшего уведомление
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES notification_templates(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Расписание автоматических уведомлений
CREATE TABLE notification_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    schedule_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'custom', 'lesson_reminder'
    schedule_config TEXT, -- JSON с настройками расписания
    target_audience TEXT, -- 'all', 'active_subscriptions', 'specific_users', 'by_subscription_type'
    target_config TEXT, -- JSON с настройками целевой аудитории
    is_active INTEGER DEFAULT 1,
    last_run_at DATETIME,
    next_run_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES notification_templates(id)
);

-- Индексы
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_lesson_id ON bookings(lesson_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_lessons_hall_id ON lessons(hall_id);
CREATE INDEX idx_lessons_direction_id ON lessons(direction_id);
CREATE INDEX idx_lessons_date ON lessons(lesson_date);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_scheduled_at ON notifications(scheduled_at);
CREATE INDEX idx_notification_schedules_next_run_at ON notification_schedules(next_run_at);
`;

try {
  // Создаем таблицы
  db.exec(createTablesSQL);
  console.log('✓ Таблицы созданы');
  
  // Закрываем соединение
  db.close();
  
  console.log('\n🎉 База данных успешно создана!');
  console.log(`📁 Путь: ${dbPath}\n`);
  
} catch (error) {
  console.error('❌ Ошибка при создании базы данных:', error);
  process.exit(1);
}

  
} catch (error) {
  console.error('❌ Ошибка при создании базы данных:', error);
  process.exit(1);
}


