require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/database');

// Инициализация
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - CORS конфигурация
// На Vercel разрешаем все origins для гибкости
const corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;
  
  // Разрешаем все origins на Vercel
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  } else {
    // Для локальной разработки проверяем разрешенные origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3002',
      'http://localhost:3003',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }
  }
  
  // Устанавливаем все необходимые заголовки для всех запросов
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 часа
  
  // Для OPTIONS запросов сразу возвращаем ответ
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  
  next();
};

// Применяем CORS middleware ДО всех других middleware
app.use(corsMiddleware);

// Дополнительно используем cors для совместимости
app.use(cors({
  origin: true, // Разрешаем все origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Корневой маршрут - перенаправляем на /api
app.get('/', (req, res) => {
  res.json({
    message: 'Геометрия API v1.0',
    version: '1.0.0',
    status: 'ok',
    endpoints: {
      api: '/api',
      health: '/health',
      auth: '/api/auth',
      directions: '/api/directions',
      schedule: '/api/schedule',
      bookings: '/api/bookings',
      subscriptions: '/api/subscriptions',
      halls: '/api/halls',
      rental: '/api/rental',
      profile: '/api/profile',
      admin: '/api/admin'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.get('/api', (req, res) => {
  res.json({
    message: 'Геометрия API v1.0',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      directions: '/api/directions',
      schedule: '/api/schedule',
      bookings: '/api/bookings',
      subscriptions: '/api/subscriptions',
      halls: '/api/halls',
      rental: '/api/rental',
      profile: '/api/profile',
      admin: '/api/admin'
    }
  });
});

// Подключаем роуты
const authRoutes = require('./routes/auth');
const directionsRoutes = require('./routes/directions');
const hallsRoutes = require('./routes/halls');
const subscriptionTypesRoutes = require('./routes/subscriptionTypes');
const subscriptionsRoutes = require('./routes/subscriptions');
const lessonsRoutes = require('./routes/lessons');
const trainersRoutes = require('./routes/trainers');
const bookingsRoutes = require('./routes/bookings');
const recurringLessonsRoutes = require('./routes/recurringLessons');
const statsRoutes = require('./routes/stats');
const rentalRoutes = require('./routes/rental');
const pricesRoutes = require('./routes/prices');
const notificationsRoutes = require('./routes/notifications');
// const profileRoutes = require('./routes/profile');
// const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/directions', directionsRoutes);
app.use('/api/halls', hallsRoutes);
app.use('/api/subscription-types', subscriptionTypesRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/trainers', trainersRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/recurring-lessons', recurringLessonsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/rental', rentalRoutes);
app.use('/api/prices', pricesRoutes);
app.use('/api/notifications', notificationsRoutes);
// app.use('/api/rental', rentalRoutes);
// app.use('/api/profile', profileRoutes);
// app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: 'Запрашиваемый endpoint не найден',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Получен сигнал SIGINT. Закрываем сервер...');
  if (db) db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Получен сигнал SIGTERM. Закрываем сервер...');
  if (db) db.close();
  process.exit(0);
});

// Автоматическая очистка прошедших занятий при старте (опционально)
if (process.env.AUTO_CLEANUP_ON_START === 'true') {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const deletePastBookingsStmt = db.prepare('DELETE FROM bookings WHERE lesson_id IN (SELECT id FROM lessons WHERE lesson_date < ?)');
    const deletePastLessonsStmt = db.prepare('DELETE FROM lessons WHERE lesson_date < ?');
    
    const deletedBookings = deletePastBookingsStmt.run(todayStr);
    const deletedLessons = deletePastLessonsStmt.run(todayStr);
    
    if (deletedLessons.changes > 0) {
      console.log(`🧹 Автоматическая очистка: удалено ${deletedLessons.changes} прошедших занятий и ${deletedBookings.changes} бронирований`);
    }
  } catch (error) {
    console.error('⚠️ Ошибка при автоматической очистке:', error.message);
  }
}

// Запуск сервера (только для локальной разработки)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log('');
    console.log('🚀 Сервер запущен!');
    console.log(`📡 API: http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Database: ${process.env.DATABASE_URL}`);
    if (process.env.AUTO_CLEANUP_ON_START === 'true') {
      console.log(`🧹 Автоматическая очистка прошедших занятий: включена`);
    }
    console.log('');
  });
}

// Экспортируем app для Vercel serverless functions
// Для локальной разработки также экспортируем db
module.exports = app;

