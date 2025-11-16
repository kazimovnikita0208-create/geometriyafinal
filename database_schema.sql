-- ============================================
-- База данных для студии танцев "Геометрия"
-- SQLite Schema
-- ============================================

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id BIGINT UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1,
    notifications_enabled BOOLEAN DEFAULT 1
);

CREATE INDEX idx_users_telegram_id ON users(telegram_id);

-- Таблица залов
CREATE TABLE IF NOT EXISTS halls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    capacity INTEGER DEFAULT 15,
    has_poles BOOLEAN DEFAULT 0,
    pole_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1
);

-- Таблица направлений (танцев)
CREATE TABLE IF NOT EXISTS directions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#5833b6',
    icon TEXT,
    is_active BOOLEAN DEFAULT 1
);

-- Таблица типов абонементов
CREATE TABLE IF NOT EXISTS subscription_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    lesson_count INTEGER NOT NULL,
    validity_days INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT 1
);

-- Таблица абонементов пользователей
CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subscription_type_id INTEGER NOT NULL,
    lessons_remaining INTEGER NOT NULL,
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_type_id) REFERENCES subscription_types(id)
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_active ON subscriptions(is_active, valid_until);

-- Таблица занятий (расписание)
CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hall_id INTEGER NOT NULL,
    direction_id INTEGER NOT NULL,
    teacher_name TEXT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    capacity INTEGER DEFAULT 15,
    is_recurring BOOLEAN DEFAULT 0,
    recurrence_rule TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hall_id) REFERENCES halls(id),
    FOREIGN KEY (direction_id) REFERENCES directions(id)
);

CREATE INDEX idx_lessons_start_time ON lessons(start_time);
CREATE INDEX idx_lessons_hall_direction ON lessons(hall_id, direction_id);

-- Таблица записей на занятия
CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    lesson_id INTEGER NOT NULL,
    subscription_id INTEGER NOT NULL,
    status TEXT DEFAULT 'confirmed',
    booked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    cancelled_at DATETIME,
    cancellation_reason TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
);

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_lesson_id ON bookings(lesson_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Таблица бронирования пилонов/зала
CREATE TABLE IF NOT EXISTS pole_bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    hall_id INTEGER NOT NULL,
    pole_number INTEGER,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status TEXT DEFAULT 'confirmed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (hall_id) REFERENCES halls(id)
);

CREATE INDEX idx_pole_bookings_hall_time ON pole_bookings(hall_id, start_time);

-- Таблица уведомлений
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_sent BOOLEAN DEFAULT 0,
    sent_at DATETIME,
    scheduled_for DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_scheduled ON notifications(is_sent, scheduled_for);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_sent);

-- Таблица настроек системы
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Начальные данные (Seed Data)
-- ============================================

-- Залы студии
INSERT INTO halls (name, address, capacity, has_poles, pole_count) VALUES
('Волгина 117А', 'ул. Волгина, 117А', 15, 1, 8),
('Охотный ряд', 'Московское шоссе, 43, ТОЦ "Охотный ряд"', 12, 1, 6);

-- Направления танцев
INSERT INTO directions (name, description, color) VALUES
('Pole Dance', 'Танец на пилоне для начинающих и продолжающих', '#5833b6'),
('Exotic Pole Dance', 'Чувственный танец на пилоне в туфлях', '#b63384'),
('Растяжка', 'Stretching для развития гибкости', '#33b683'),
('Воздушные полотна', 'Акробатика на воздушных полотнах', '#3384b6'),
('Хореография', 'Танцевальная хореография без пилона', '#b68333');

-- Типы абонементов
INSERT INTO subscription_types (name, lesson_count, validity_days, price, description) VALUES
('4 занятия', 4, 30, 3200.00, 'Абонемент на 4 занятия, действует 30 дней'),
('8 занятий', 8, 30, 5600.00, 'Абонемент на 8 занятий, действует 30 дней'),
('12 занятий', 12, 45, 7800.00, 'Абонемент на 12 занятий, действует 45 дней'),
('Безлимит', 999, 30, 9900.00, 'Безлимитный абонемент на 30 дней'),
('Пробное занятие', 1, 7, 500.00, 'Одно пробное занятие');

-- Настройки системы
INSERT INTO settings (key, value, description) VALUES
('cancel_evening_hours_before', '4', 'За сколько часов можно отменить вечернее занятие'),
('cancel_morning_deadline_hour', '21', 'До какого часа предыдущего дня можно отменить дневное занятие'),
('morning_classes_start', '10', 'Начало дневных занятий (час)'),
('morning_classes_end', '15', 'Конец дневных занятий (час)'),
('reminder_hours_before', '2', 'За сколько часов отправлять напоминание о занятии'),
('subscription_expiry_warning_days', '3', 'За сколько дней предупреждать об истечении абонемента'),
('studio_phone', '+7 (XXX) XXX-XX-XX', 'Телефон студии'),
('studio_instagram', '@geometriya_dance', 'Instagram студии');

-- ============================================
-- Триггеры для автоматического обновления
-- ============================================

-- Триггер для обновления updated_at в таблице users
CREATE TRIGGER update_users_timestamp 
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Триггер для обновления updated_at в таблице settings
CREATE TRIGGER update_settings_timestamp 
AFTER UPDATE ON settings
BEGIN
    UPDATE settings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ============================================
-- Представления (Views) для удобных запросов
-- ============================================

-- Представление для получения занятий с информацией о зале и направлении
CREATE VIEW IF NOT EXISTS lessons_full AS
SELECT 
    l.id,
    l.start_time,
    l.end_time,
    l.teacher_name,
    l.capacity,
    l.description,
    l.is_active,
    h.id as hall_id,
    h.name as hall_name,
    h.address as hall_address,
    d.id as direction_id,
    d.name as direction_name,
    d.color as direction_color,
    (SELECT COUNT(*) FROM bookings b WHERE b.lesson_id = l.id AND b.status = 'confirmed') as booked_count,
    (l.capacity - (SELECT COUNT(*) FROM bookings b WHERE b.lesson_id = l.id AND b.status = 'confirmed')) as available_spots
FROM lessons l
JOIN halls h ON l.hall_id = h.id
JOIN directions d ON l.direction_id = d.id;

-- Представление для активных абонементов пользователей
CREATE VIEW IF NOT EXISTS active_subscriptions AS
SELECT 
    s.id,
    s.user_id,
    s.lessons_remaining,
    s.valid_from,
    s.valid_until,
    s.created_at,
    st.name as subscription_name,
    st.lesson_count as original_lesson_count,
    u.telegram_id,
    u.first_name,
    u.last_name
FROM subscriptions s
JOIN subscription_types st ON s.subscription_type_id = st.id
JOIN users u ON s.user_id = u.id
WHERE s.is_active = 1 
  AND s.valid_until >= DATE('now')
  AND s.lessons_remaining > 0;

-- Представление для будущих бронирований пользователей
CREATE VIEW IF NOT EXISTS upcoming_bookings AS
SELECT 
    b.id,
    b.user_id,
    b.status,
    b.booked_at,
    u.telegram_id,
    u.first_name,
    l.start_time,
    l.end_time,
    l.teacher_name,
    h.name as hall_name,
    h.address as hall_address,
    d.name as direction_name,
    d.color as direction_color
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN lessons l ON b.lesson_id = l.id
JOIN halls h ON l.hall_id = h.id
JOIN directions d ON l.direction_id = d.id
WHERE b.status = 'confirmed'
  AND l.start_time > DATETIME('now')
ORDER BY l.start_time;

