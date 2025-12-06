/**
 * Скрипт для миграции данных из SQLite в Supabase
 * 
 * Использование:
 * node scripts/migrateToSupabase.js
 */

const Database = require('better-sqlite3');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Конфигурация Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Ошибка: Не указаны переменные окружения для Supabase');
  console.error('Необходимо указать: SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Подключение к SQLite
const dbPath = path.join(__dirname, '..', 'dev.db');
const db = new Database(dbPath);

console.log('🚀 Начинаем миграцию данных из SQLite в Supabase...\n');

/**
 * Конвертация SQLite данных в формат PostgreSQL
 */
function convertValue(value, type) {
  if (value === null || value === undefined) return null;
  
  switch (type) {
    case 'boolean':
      return value === 1 || value === '1' || value === true;
    case 'json':
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      return value;
    case 'timestamp':
      if (typeof value === 'string') {
        return new Date(value).toISOString();
      }
      return value;
    default:
      return value;
  }
}

/**
 * Миграция пользователей
 */
async function migrateUsers() {
  console.log('📦 Миграция пользователей...');
  const users = db.prepare('SELECT * FROM users').all();
  
  for (const user of users) {
    const { error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        telegram_id: user.telegram_id.toString(),
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        is_active: convertValue(user.is_active, 'boolean'),
        notifications_enabled: convertValue(user.notifications_enabled, 'boolean'),
        is_admin: convertValue(user.is_admin, 'boolean'),
        created_at: convertValue(user.created_at, 'timestamp'),
        updated_at: convertValue(user.updated_at, 'timestamp'),
      }, { onConflict: 'telegram_id' });
    
    if (error) {
      console.error(`  ❌ Ошибка при миграции пользователя ${user.id}:`, error.message);
    }
  }
  
  console.log(`  ✅ Мигрировано пользователей: ${users.length}`);
}

/**
 * Миграция залов
 */
async function migrateHalls() {
  console.log('📦 Миграция залов...');
  const halls = db.prepare('SELECT * FROM halls').all();
  
  for (const hall of halls) {
    const { error } = await supabase
      .from('halls')
      .upsert({
        id: hall.id,
        name: hall.name,
        address: hall.address,
        capacity: hall.capacity,
        has_poles: convertValue(hall.has_poles, 'boolean'),
        pole_count: hall.pole_count,
        price_per_hour: hall.price_per_hour,
        is_active: convertValue(hall.is_active, 'boolean'),
      }, { onConflict: 'id' });
    
    if (error) {
      console.error(`  ❌ Ошибка при миграции зала ${hall.id}:`, error.message);
    }
  }
  
  console.log(`  ✅ Мигрировано залов: ${halls.length}`);
}

/**
 * Миграция направлений
 */
async function migrateDirections() {
  console.log('📦 Миграция направлений...');
  const directions = db.prepare('SELECT * FROM directions').all();
  
  for (const direction of directions) {
    const { error } = await supabase
      .from('directions')
      .upsert({
        id: direction.id,
        name: direction.name,
        slug: direction.slug,
        description: direction.description,
        tagline: direction.tagline,
        features: convertValue(direction.features, 'json'),
        levels: convertValue(direction.levels, 'json'),
        color: direction.color || '#5833b6',
        is_active: convertValue(direction.is_active, 'boolean'),
      }, { onConflict: 'id' });
    
    if (error) {
      console.error(`  ❌ Ошибка при миграции направления ${direction.id}:`, error.message);
    }
  }
  
  console.log(`  ✅ Мигрировано направлений: ${directions.length}`);
}

/**
 * Миграция тренеров
 */
async function migrateTrainers() {
  console.log('📦 Миграция тренеров...');
  const trainers = db.prepare('SELECT * FROM trainers').all();
  
  for (const trainer of trainers) {
    const { error } = await supabase
      .from('trainers')
      .upsert({
        id: trainer.id,
        name: trainer.name,
        email: trainer.email,
        phone: trainer.phone,
        directions: convertValue(trainer.directions, 'json'),
        bio: trainer.bio,
        is_active: convertValue(trainer.is_active, 'boolean'),
      }, { onConflict: 'id' });
    
    if (error) {
      console.error(`  ❌ Ошибка при миграции тренера ${trainer.id}:`, error.message);
    }
  }
  
  console.log(`  ✅ Мигрировано тренеров: ${trainers.length}`);
}

/**
 * Миграция типов абонементов
 */
async function migrateSubscriptionTypes() {
  console.log('📦 Миграция типов абонементов...');
  const types = db.prepare('SELECT * FROM subscription_types').all();
  
  for (const type of types) {
    const { error } = await supabase
      .from('subscription_types')
      .upsert({
        id: type.id,
        category: type.category,
        name: type.name,
        lesson_count: type.lesson_count,
        validity_days: type.validity_days,
        price: type.price,
        description: type.description,
        is_active: convertValue(type.is_active, 'boolean'),
      }, { onConflict: 'id' });
    
    if (error) {
      console.error(`  ❌ Ошибка при миграции типа абонемента ${type.id}:`, error.message);
    }
  }
  
  console.log(`  ✅ Мигрировано типов абонементов: ${types.length}`);
}

/**
 * Миграция абонементов
 */
async function migrateSubscriptions() {
  console.log('📦 Миграция абонементов...');
  const subscriptions = db.prepare('SELECT * FROM subscriptions').all();
  
  for (const sub of subscriptions) {
    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        id: sub.id,
        user_id: sub.user_id,
        subscription_type_id: sub.subscription_type_id,
        lessons_remaining: sub.lessons_remaining,
        valid_from: convertValue(sub.valid_from, 'timestamp'),
        valid_until: convertValue(sub.valid_until, 'timestamp'),
        booking_type: sub.booking_type || 'flexible',
        auto_direction: sub.auto_direction,
        auto_weekdays: convertValue(sub.auto_weekdays, 'json'),
        status: sub.status || 'pending',
        is_active: convertValue(sub.is_active, 'boolean'),
        created_at: convertValue(sub.created_at, 'timestamp'),
      }, { onConflict: 'id' });
    
    if (error) {
      console.error(`  ❌ Ошибка при миграции абонемента ${sub.id}:`, error.message);
    }
  }
  
  console.log(`  ✅ Мигрировано абонементов: ${subscriptions.length}`);
}

/**
 * Миграция занятий
 */
async function migrateLessons() {
  console.log('📦 Миграция занятий...');
  const lessons = db.prepare('SELECT * FROM lessons').all();
  
  for (const lesson of lessons) {
    const { error } = await supabase
      .from('lessons')
      .upsert({
        id: lesson.id,
        hall_id: lesson.hall_id,
        direction_id: lesson.direction_id,
        trainer_id: lesson.trainer_id,
        day_of_week: lesson.day_of_week,
        start_time: lesson.start_time,
        end_time: lesson.end_time,
        capacity: lesson.capacity,
        is_recurring: convertValue(lesson.is_recurring, 'boolean'),
        specific_date: convertValue(lesson.specific_date, 'timestamp'),
        description: lesson.description,
        is_active: convertValue(lesson.is_active, 'boolean'),
        created_at: convertValue(lesson.created_at, 'timestamp'),
      }, { onConflict: 'id' });
    
    if (error) {
      console.error(`  ❌ Ошибка при миграции занятия ${lesson.id}:`, error.message);
    }
  }
  
  console.log(`  ✅ Мигрировано занятий: ${lessons.length}`);
}

/**
 * Миграция записей на занятия
 */
async function migrateBookings() {
  console.log('📦 Миграция записей на занятия...');
  const bookings = db.prepare('SELECT * FROM bookings').all();
  
  for (const booking of bookings) {
    const { error } = await supabase
      .from('bookings')
      .upsert({
        id: booking.id,
        user_id: booking.user_id,
        lesson_id: booking.lesson_id,
        subscription_id: booking.subscription_id,
        booking_date: convertValue(booking.booking_date, 'timestamp'),
        status: booking.status || 'confirmed',
        booked_at: convertValue(booking.booked_at, 'timestamp'),
        cancelled_at: convertValue(booking.cancelled_at, 'timestamp'),
        cancellation_reason: booking.cancellation_reason,
      }, { onConflict: 'id' });
    
    if (error) {
      console.error(`  ❌ Ошибка при миграции записи ${booking.id}:`, error.message);
    }
  }
  
  console.log(`  ✅ Мигрировано записей: ${bookings.length}`);
}

/**
 * Миграция аренды
 */
async function migrateRentalBookings() {
  console.log('📦 Миграция аренды залов/пилонов...');
  const rentals = db.prepare('SELECT * FROM rental_bookings').all();
  
  for (const rental of rentals) {
    const { error } = await supabase
      .from('rental_bookings')
      .upsert({
        id: rental.id,
        user_id: rental.user_id,
        hall_id: rental.hall_id,
        rental_type: rental.rental_type,
        pole_count: rental.pole_count,
        start_time: convertValue(rental.start_time, 'timestamp'),
        end_time: convertValue(rental.end_time, 'timestamp'),
        participants: rental.participants,
        total_price: rental.total_price,
        comment: rental.comment,
        status: rental.status || 'pending',
        created_at: convertValue(rental.created_at, 'timestamp'),
      }, { onConflict: 'id' });
    
    if (error) {
      console.error(`  ❌ Ошибка при миграции аренды ${rental.id}:`, error.message);
    }
  }
  
  console.log(`  ✅ Мигрировано аренд: ${rentals.length}`);
}

/**
 * Миграция уведомлений
 */
async function migrateNotifications() {
  console.log('📦 Миграция уведомлений...');
  const notifications = db.prepare('SELECT * FROM notifications').all();
  
  for (const notification of notifications) {
    const { error } = await supabase
      .from('notifications')
      .upsert({
        id: notification.id,
        user_id: notification.user_id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        is_sent: convertValue(notification.is_sent, 'boolean'),
        sent_at: convertValue(notification.sent_at, 'timestamp'),
        scheduled_for: convertValue(notification.scheduled_for, 'timestamp'),
        created_at: convertValue(notification.created_at, 'timestamp'),
      }, { onConflict: 'id' });
    
    if (error) {
      console.error(`  ❌ Ошибка при миграции уведомления ${notification.id}:`, error.message);
    }
  }
  
  console.log(`  ✅ Мигрировано уведомлений: ${notifications.length}`);
}

/**
 * Миграция настроек
 */
async function migrateSettings() {
  console.log('📦 Миграция настроек...');
  const settings = db.prepare('SELECT * FROM settings').all();
  
  for (const setting of settings) {
    const { error } = await supabase
      .from('settings')
      .upsert({
        id: setting.id,
        key: setting.key,
        value: setting.value,
        description: setting.description,
        updated_at: convertValue(setting.updated_at, 'timestamp'),
      }, { onConflict: 'key' });
    
    if (error) {
      console.error(`  ❌ Ошибка при миграции настройки ${setting.key}:`, error.message);
    }
  }
  
  console.log(`  ✅ Мигрировано настроек: ${settings.length}`);
}

/**
 * Главная функция миграции
 */
async function migrate() {
  try {
    await migrateUsers();
    await migrateHalls();
    await migrateDirections();
    await migrateTrainers();
    await migrateSubscriptionTypes();
    await migrateSubscriptions();
    await migrateLessons();
    await migrateBookings();
    await migrateRentalBookings();
    await migrateNotifications();
    await migrateSettings();
    
    console.log('\n✅ Миграция завершена успешно!');
  } catch (error) {
    console.error('\n❌ Ошибка при миграции:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Запуск миграции
migrate();

