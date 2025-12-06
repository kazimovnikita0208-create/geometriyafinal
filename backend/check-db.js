// Проверка данных в БД
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
const db = new Database(dbPath);

console.log('📊 Проверка данных в базе...\n');

// Проверяем subscription_types
console.log('=== Типы абонементов ===');
const subscriptionTypes = db.prepare('SELECT id, name, category, price FROM subscription_types LIMIT 5').all();
console.table(subscriptionTypes);

// Проверяем subscriptions
console.log('\n=== Абонементы (последние 5) ===');
const subscriptions = db.prepare('SELECT id, user_id, subscription_type_id, status, address, created_at FROM subscriptions ORDER BY id DESC LIMIT 5').all();
if (subscriptions.length > 0) {
  console.table(subscriptions);
} else {
  console.log('Нет абонементов');
}

// Проверяем users
console.log('\n=== Пользователи (последние 5) ===');
const users = db.prepare('SELECT id, telegram_id, first_name, last_name, is_admin FROM users ORDER BY id DESC LIMIT 5').all();
if (users.length > 0) {
  console.table(users);
} else {
  console.log('Нет пользователей');
}

db.close();

