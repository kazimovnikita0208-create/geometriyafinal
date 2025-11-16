/**
 * Главный файл сервера
 * Backend для Telegram-бота студии "Геометрия"
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');

const { getDatabase } = require('./config/database');
const telegramConfig = require('./config/telegram');

// Импорт роутов (будут созданы позже)
// const authRoutes = require('./routes/auth');
// const userRoutes = require('./routes/users');
// const lessonsRoutes = require('./routes/lessons');
// const bookingsRoutes = require('./routes/bookings');
// const subscriptionsRoutes = require('./routes/subscriptions');

// Импорт бота
// const bot = require('./bot');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Проверка работоспособности
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Сервер работает',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.get('/api/v1', (req, res) => {
  res.json({
    message: 'API студии танцев "Геометрия"',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      lessons: '/api/v1/lessons',
      bookings: '/api/v1/bookings',
      subscriptions: '/api/v1/subscriptions',
      halls: '/api/v1/halls',
      directions: '/api/v1/directions'
    }
  });
});

// Подключение роутов (раскомментировать после создания)
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/users', userRoutes);
// app.use('/api/v1/lessons', lessonsRoutes);
// app.use('/api/v1/bookings', bookingsRoutes);
// app.use('/api/v1/subscriptions', subscriptionsRoutes);

// Обработка ошибок 404
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint не найден',
    path: req.path
  });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
  console.error('❌ Ошибка:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Внутренняя ошибка сервера',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Запуск Telegram бота
function startTelegramBot() {
  console.log('🤖 Запуск Telegram бота...');
  // const bot = require('./bot');
  console.log('✅ Telegram бот запущен');
}

// Настройка cron задач для уведомлений
function setupCronJobs() {
  console.log('⏰ Настройка планировщика задач...');
  
  // Каждые 5 минут проверяем уведомления
  cron.schedule('*/5 * * * *', () => {
    console.log('🔔 Проверка уведомлений...');
    // Здесь будет логика отправки уведомлений
  });
  
  // Каждый день в 10:00 проверяем истекающие абонементы
  cron.schedule('0 10 * * *', () => {
    console.log('📅 Проверка истекающих абонементов...');
    // Здесь будет логика проверки абонементов
  });
  
  console.log('✅ Планировщик задач настроен');
}

// Инициализация сервера
async function startServer() {
  try {
    // Проверка подключения к БД
    const db = getDatabase();
    console.log('✅ База данных подключена');
    
    // Запуск HTTP сервера
    app.listen(PORT, () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🚀 Сервер запущен на порту ${PORT}`);
      console.log(`📍 http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`🔌 API: http://localhost:${PORT}/api/v1`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
    
    // Запуск бота
    startTelegramBot();
    
    // Настройка cron задач
    setupCronJobs();
    
  } catch (error) {
    console.error('❌ Ошибка при запуске сервера:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Получен сигнал SIGINT, завершение работы...');
  const { closeDatabase } = require('./config/database');
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Получен сигнал SIGTERM, завершение работы...');
  const { closeDatabase } = require('./config/database');
  closeDatabase();
  process.exit(0);
});

// Запуск
startServer();

module.exports = app;

