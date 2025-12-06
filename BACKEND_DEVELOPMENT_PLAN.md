# 📋 План разработки Backend для Геометрия

## 🎯 Цель проекта
Разработка полноценного backend для Telegram Mini App студии танцев "Геометрия" с базой данных SQLite, Prisma ORM, аутентификацией через Telegram и полным API для frontend.

---

## 📚 Технологический стек

### Backend
- **Node.js** + **Express.js** - основной сервер
- **SQLite** - база данных (легковесная, файловая)
- **Prisma** - ORM для работы с БД
- **JWT** - токены для авторизации
- **node-telegram-bot-api** - для Telegram Bot API
- **node-cron** - планировщик задач для уведомлений

### Telegram Integration
- **Telegram Web App API** - для Mini App
- **Telegram Bot API** - для отправки уведомлений
- **Telegram Login Widget** - аутентификация

---

## 🗄️ Архитектура базы данных

### Основные таблицы

#### 1. **Users** (Пользователи)
```prisma
model User {
  id                    Int       @id @default(autoincrement())
  telegramId            BigInt    @unique @map("telegram_id")
  username              String?
  firstName             String?   @map("first_name")
  lastName              String?   @map("last_name")
  phone                 String?
  isActive              Boolean   @default(true) @map("is_active")
  notificationsEnabled  Boolean   @default(true) @map("notifications_enabled")
  isAdmin               Boolean   @default(false) @map("is_admin")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")
  
  subscriptions         Subscription[]
  bookings              Booking[]
  rentalBookings        RentalBooking[]
  notifications         Notification[]
  
  @@map("users")
}
```

#### 2. **Halls** (Залы)
```prisma
model Hall {
  id            Int      @id @default(autoincrement())
  name          String
  address       String
  capacity      Int      @default(6)
  hasPoles      Boolean  @default(true) @map("has_poles")
  poleCount     Int      @default(6) @map("pole_count")
  pricePerHour  Float    @map("price_per_hour")
  isActive      Boolean  @default(true) @map("is_active")
  
  lessons       Lesson[]
  rentalBookings RentalBooking[]
  
  @@map("halls")
}
```

#### 3. **Directions** (Направления)
```prisma
model Direction {
  id            Int      @id @default(autoincrement())
  name          String
  slug          String   @unique
  description   String?
  tagline       String?
  features      String?  // JSON array
  levels        String?  // JSON array
  color         String   @default("#5833b6")
  isActive      Boolean  @default(true) @map("is_active")
  
  lessons       Lesson[]
  
  @@map("directions")
}
```

#### 4. **Trainers** (Тренеры)
```prisma
model Trainer {
  id            Int      @id @default(autoincrement())
  name          String
  email         String?
  phone         String?
  directions    String?  // JSON array of direction IDs
  bio           String?
  isActive      Boolean  @default(true) @map("is_active")
  
  lessons       Lesson[]
  
  @@map("trainers")
}
```

#### 5. **SubscriptionTypes** (Типы абонементов)
```prisma
model SubscriptionType {
  id            Int      @id @default(autoincrement())
  category      String   // "КЛАССИЧЕСКИЙ", "ТОЛЬКО ФИТНЕС", "КОМБО-АБОНЕМЕНТ"
  name          String   // "8 занятий", "4 занятия", etc.
  lessonCount   Int      @map("lesson_count")
  validityDays  Int      @default(30) @map("validity_days")
  price         Float
  description   String?
  isActive      Boolean  @default(true) @map("is_active")
  
  subscriptions Subscription[]
  
  @@map("subscription_types")
}
```

#### 6. **Subscriptions** (Абонементы пользователей)
```prisma
model Subscription {
  id                    Int       @id @default(autoincrement())
  userId                Int       @map("user_id")
  subscriptionTypeId    Int       @map("subscription_type_id")
  lessonsRemaining      Int       @map("lessons_remaining")
  validFrom             DateTime  @map("valid_from")
  validUntil            DateTime  @map("valid_until")
  bookingType           String    @default("flexible") @map("booking_type") // "flexible" | "automatic"
  autoDirection         String?   @map("auto_direction") // для automatic booking
  autoWeekdays          String?   @map("auto_weekdays") // JSON array
  status                String    @default("pending") // "pending", "confirmed", "expired"
  isActive              Boolean   @default(true) @map("is_active")
  createdAt             DateTime  @default(now()) @map("created_at")
  
  user                  User      @relation(fields: [userId], references: [id])
  subscriptionType      SubscriptionType @relation(fields: [subscriptionTypeId], references: [id])
  bookings              Booking[]
  
  @@map("subscriptions")
}
```

#### 7. **Lessons** (Занятия/Расписание)
```prisma
model Lesson {
  id            Int       @id @default(autoincrement())
  hallId        Int       @map("hall_id")
  directionId   Int       @map("direction_id")
  trainerId     Int       @map("trainer_id")
  dayOfWeek     Int       @map("day_of_week") // 0-6 (Воскресенье-Суббота)
  startTime     String    @map("start_time") // "18:00"
  endTime       String    @map("end_time") // "19:30"
  capacity      Int       @default(6)
  isRecurring   Boolean   @default(true) @map("is_recurring")
  specificDate  DateTime? @map("specific_date") // Для разовых занятий
  description   String?
  isActive      Boolean   @default(true) @map("is_active")
  createdAt     DateTime  @default(now()) @map("created_at")
  
  hall          Hall      @relation(fields: [hallId], references: [id])
  direction     Direction @relation(fields: [directionId], references: [id])
  trainer       Trainer   @relation(fields: [trainerId], references: [id])
  bookings      Booking[]
  
  @@map("lessons")
}
```

#### 8. **Bookings** (Записи на занятия)
```prisma
model Booking {
  id                Int       @id @default(autoincrement())
  userId            Int       @map("user_id")
  lessonId          Int       @map("lesson_id")
  subscriptionId    Int       @map("subscription_id")
  bookingDate       DateTime  @map("booking_date") // Конкретная дата занятия
  status            String    @default("confirmed") // "confirmed", "cancelled", "completed"
  bookedAt          DateTime  @default(now()) @map("booked_at")
  cancelledAt       DateTime? @map("cancelled_at")
  cancellationReason String? @map("cancellation_reason")
  
  user              User         @relation(fields: [userId], references: [id])
  lesson            Lesson       @relation(fields: [lessonId], references: [id])
  subscription      Subscription @relation(fields: [subscriptionId], references: [id])
  
  @@map("bookings")
}
```

#### 9. **RentalBookings** (Аренда залов/пилонов)
```prisma
model RentalBooking {
  id            Int       @id @default(autoincrement())
  userId        Int       @map("user_id")
  hallId        Int       @map("hall_id")
  rentalType    String    @map("rental_type") // "hall" | "pole"
  poleCount     Int?      @map("pole_count")
  startTime     DateTime  @map("start_time")
  endTime       DateTime  @map("end_time")
  participants  Int?
  totalPrice    Float     @map("total_price")
  comment       String?
  status        String    @default("pending") // "pending", "confirmed", "cancelled"
  createdAt     DateTime  @default(now()) @map("created_at")
  
  user          User      @relation(fields: [userId], references: [id])
  hall          Hall      @relation(fields: [hallId], references: [id])
  
  @@map("rental_bookings")
}
```

#### 10. **Notifications** (Уведомления)
```prisma
model Notification {
  id            Int       @id @default(autoincrement())
  userId        Int?      @map("user_id") // null для массовых рассылок
  type          String    // "booking_reminder", "subscription_expiry", "booking_confirmed", etc.
  title         String
  message       String
  isSent        Boolean   @default(false) @map("is_sent")
  sentAt        DateTime? @map("sent_at")
  scheduledFor  DateTime? @map("scheduled_for")
  createdAt     DateTime  @default(now()) @map("created_at")
  
  user          User?     @relation(fields: [userId], references: [id])
  
  @@map("notifications")
}
```

#### 11. **Settings** (Настройки системы)
```prisma
model Setting {
  id            Int      @id @default(autoincrement())
  key           String   @unique
  value         String
  description   String?
  updatedAt     DateTime @updatedAt @map("updated_at")
  
  @@map("settings")
}
```

---

## 🔐 Система аутентификации через Telegram

### Принцип работы

1. **Frontend**: Пользователь открывает Mini App в Telegram
2. **Telegram** автоматически предоставляет `initData` с информацией о пользователе
3. **Frontend** отправляет `initData` на backend
4. **Backend** проверяет подпись данных (валидация через Telegram Bot Token)
5. **Backend** создает или находит пользователя в БД
6. **Backend** возвращает JWT токен для дальнейших запросов

### Реализация

```javascript
// middleware/telegramAuth.js
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

function validateTelegramWebAppData(initData, botToken) {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  params.delete('hash');
  
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();
  
  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
  
  return calculatedHash === hash;
}

async function telegramAuthMiddleware(req, res, next) {
  const initData = req.headers['x-telegram-init-data'];
  
  if (!initData) {
    return res.status(401).json({ error: 'No Telegram data provided' });
  }
  
  if (!validateTelegramWebAppData(initData, process.env.BOT_TOKEN)) {
    return res.status(401).json({ error: 'Invalid Telegram data' });
  }
  
  const params = new URLSearchParams(initData);
  const userJson = params.get('user');
  const user = JSON.parse(userJson);
  
  req.telegramUser = user;
  next();
}
```

### API Endpoints для аутентификации

#### POST `/api/auth/login`
```javascript
// Аутентификация пользователя через Telegram
{
  "initData": "query_id=...&user=..."
}

// Response
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "telegramId": 123456789,
    "firstName": "Иван",
    "lastName": "Петров"
  }
}
```

#### GET `/api/auth/me`
```javascript
// Получение информации о текущем пользователе
// Headers: Authorization: Bearer <token>

// Response
{
  "user": {
    "id": 1,
    "telegramId": 123456789,
    "firstName": "Иван",
    "lastName": "Петров",
    "phone": "+79001234567",
    "notificationsEnabled": true
  }
}
```

---

## 📡 API Endpoints

### 1. Направления (Directions)

#### GET `/api/directions`
Получение списка всех направлений
```javascript
// Response
{
  "directions": [
    {
      "id": 1,
      "name": "Pole Fit",
      "slug": "pole-fit",
      "tagline": "Красивый фитнес на пилоне",
      "description": "...",
      "features": ["Трюки и акробатика", "..."],
      "levels": ["Вводный", "Начинающий", "..."]
    }
  ]
}
```

#### GET `/api/directions/:slug`
Получение одного направления по slug

---

### 2. Расписание (Schedule)

#### GET `/api/schedule`
Получение расписания занятий
```javascript
// Query params:
// - hallId (optional)
// - directionId (optional)
// - trainerId (optional)
// - date (optional) - конкретная дата или текущая неделя

// Response
{
  "schedule": {
    "monday": [
      {
        "id": 1,
        "direction": "Pole Fit",
        "trainer": "Анна Иванова",
        "hall": "Волгина, 117А",
        "time": "10:00 - 11:30",
        "capacity": 6,
        "bookedCount": 5,
        "availableSpots": 1
      }
    ],
    "tuesday": [...],
    ...
  }
}
```

#### POST `/api/bookings`
Запись на занятие
```javascript
// Request
{
  "lessonId": 1,
  "bookingDate": "2024-11-22", // Конкретная дата
  "subscriptionId": 1
}

// Response
{
  "booking": {
    "id": 1,
    "lessonId": 1,
    "bookingDate": "2024-11-22",
    "status": "confirmed"
  }
}
```

#### GET `/api/bookings/my`
Получение моих записей
```javascript
// Response
{
  "bookings": [
    {
      "id": 1,
      "lesson": {
        "direction": "Pole Fit",
        "trainer": "Анна Иванова",
        "hall": "Волгина, 117А"
      },
      "date": "2024-11-22",
      "time": "10:00 - 11:30",
      "status": "confirmed"
    }
  ]
}
```

#### DELETE `/api/bookings/:id`
Отмена записи

---

### 3. Абонементы (Subscriptions)

#### GET `/api/subscription-types`
Получение всех типов абонементов
```javascript
// Response
{
  "subscriptionTypes": {
    "КЛАССИЧЕСКИЙ": [
      {
        "id": 1,
        "name": "8 занятий",
        "lessonCount": 8,
        "price": 3800,
        "validityDays": 30
      }
    ],
    "ТОЛЬКО ФИТНЕС": [...],
    "КОМБО-АБОНЕМЕНТ": [...]
  }
}
```

#### POST `/api/subscriptions`
Покупка абонемента (создание заявки)
```javascript
// Request
{
  "subscriptionTypeId": 1,
  "firstName": "Иван",
  "lastName": "Петров",
  "phone": "+79001234567",
  "hallId": 1,
  "bookingType": "flexible", // "flexible" | "automatic"
  "autoDirection": "pole-fit", // если bookingType = "automatic"
  "autoWeekdays": ["monday", "wednesday"] // если bookingType = "automatic"
}

// Response
{
  "subscription": {
    "id": 1,
    "status": "pending",
    "message": "Заявка принята. Ожидайте подтверждения администратором."
  }
}
```

#### GET `/api/subscriptions/my`
Получение моих абонементов
```javascript
// Response
{
  "activeSubscription": {
    "id": 1,
    "type": "8 занятий",
    "lessonsRemaining": 5,
    "validFrom": "2024-11-01",
    "validUntil": "2024-12-01",
    "daysRemaining": 9
  },
  "history": [...]
}
```

---

### 4. Аренда (Rental)

#### GET `/api/halls`
Получение списка залов
```javascript
// Response
{
  "halls": [
    {
      "id": 1,
      "name": "Волгина, 117А",
      "address": "ул. Волгина, 117А",
      "capacity": 6,
      "poleCount": 6,
      "pricePerHour": 1500
    }
  ]
}
```

#### POST `/api/rental/bookings`
Создание заявки на аренду
```javascript
// Request
{
  "hallId": 1,
  "rentalType": "hall", // "hall" | "pole"
  "poleCount": 2, // если rentalType = "pole"
  "date": "2024-11-22",
  "startTime": "10:00",
  "duration": 2, // часов
  "participants": 5,
  "comment": "..."
}

// Response
{
  "rentalBooking": {
    "id": 1,
    "status": "pending",
    "totalPrice": 3000
  }
}
```

---

### 5. Профиль (Profile)

#### GET `/api/profile`
Получение полной информации профиля
```javascript
// Response
{
  "user": {...},
  "activeSubscription": {...},
  "upcomingBookings": [...],
  "stats": {
    "completedLessons": 12,
    "upcomingLessons": 2,
    "lessonsRemaining": 8
  }
}
```

#### PUT `/api/profile`
Обновление профиля
```javascript
// Request
{
  "phone": "+79001234567",
  "notificationsEnabled": true
}
```

---

### 6. Админ-панель (Admin)

#### Middleware для проверки админа
```javascript
function isAdmin(req, res, next) {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
}
```

#### GET `/api/admin/bookings`
Список всех записей (для управления)
```javascript
// Query params: status, date

// Response
{
  "bookings": [
    {
      "id": 1,
      "client": "Анна Иванова",
      "phone": "+79001234567",
      "direction": "Pole Fit",
      "date": "2024-11-22",
      "time": "18:00",
      "status": "pending"
    }
  ]
}
```

#### POST `/api/admin/bookings`
Создание записи администратором

#### PUT `/api/admin/bookings/:id`
Изменение записи

#### DELETE `/api/admin/bookings/:id`
Удаление записи

#### GET `/api/admin/subscriptions`
Список всех абонементов

#### PUT `/api/admin/subscriptions/:id/confirm`
Подтверждение абонемента
```javascript
// Request
{
  "status": "confirmed" // или "rejected"
}
```

#### GET `/api/admin/lessons`
Управление расписанием

#### POST `/api/admin/lessons`
Добавление занятия в расписание
```javascript
// Request
{
  "hallId": 1,
  "directionId": 1,
  "trainerId": 1,
  "dayOfWeek": 1, // 0-6
  "startTime": "10:00",
  "endTime": "11:30",
  "capacity": 6
}
```

#### PUT `/api/admin/lessons/:id`
Редактирование занятия

#### DELETE `/api/admin/lessons/:id`
Удаление занятия

#### GET `/api/admin/trainers`
Список тренеров

#### POST `/api/admin/trainers`
Добавление тренера

#### PUT `/api/admin/trainers/:id`
Редактирование тренера

#### DELETE `/api/admin/trainers/:id`
Удаление тренера

#### GET `/api/admin/stats`
Статистика
```javascript
// Response
{
  "totalRevenue": 125000,
  "totalClients": 45,
  "totalLessons": 156,
  "activeSubscriptions": 32,
  "popularDirections": [
    { "name": "Pole Fit", "percent": 45 },
    { "name": "Растяжка", "percent": 30 }
  ]
}
```

---

## 📨 Система уведомлений через Telegram Bot

### Типы уведомлений

1. **Подтверждение записи** - отправляется сразу после подтверждения администратором
2. **Напоминание о занятии** - за 4 часа до занятия
3. **Отмена занятия** - при отмене администратором
4. **Окончание абонемента** - за 3 дня до окончания
5. **Новости и акции** - массовая рассылка (опционально)

### Реализация

```javascript
// services/notificationService.js
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');

class NotificationService {
  constructor(botToken) {
    this.bot = new TelegramBot(botToken, { polling: false });
  }
  
  async sendBookingConfirmation(userId, bookingDetails) {
    const message = `
✅ Ваша запись подтверждена!

📍 Направление: ${bookingDetails.direction}
👤 Тренер: ${bookingDetails.trainer}
🏢 Зал: ${bookingDetails.hall}
📅 Дата: ${bookingDetails.date}
🕐 Время: ${bookingDetails.time}

До встречи на тренировке! 💪
    `;
    
    await this.bot.sendMessage(userId, message);
  }
  
  async sendLessonReminder(userId, bookingDetails) {
    const message = `
⏰ Напоминание о занятии через 2 часа!

📍 Направление: ${bookingDetails.direction}
👤 Тренер: ${bookingDetails.trainer}
🏢 Зал: ${bookingDetails.hall}
🕐 Время: ${bookingDetails.time}

Не забудьте взять с собой удобную одежду и воду! 💧
    `;
    
    await this.bot.sendMessage(userId, message);
  }
  
  async sendSubscriptionExpiry(userId, subscriptionDetails) {
    const message = `
⚠️ Ваш абонемент заканчивается через ${subscriptionDetails.daysRemaining} дня!

🎫 Абонемент: ${subscriptionDetails.type}
📊 Осталось занятий: ${subscriptionDetails.lessonsRemaining}
📅 Действует до: ${subscriptionDetails.validUntil}

Продлите абонемент, чтобы не прерывать тренировки! 💜
    `;
    
    await this.bot.sendMessage(userId, message);
  }
}

// Планировщик для отправки напоминаний
cron.schedule('*/15 * * * *', async () => {
  // Каждые 15 минут проверяем уведомления, которые нужно отправить
  const notifications = await prisma.notification.findMany({
    where: {
      isSent: false,
      scheduledFor: {
        lte: new Date()
      }
    }
  });
  
  for (const notification of notifications) {
    try {
      await notificationService.bot.sendMessage(
        notification.userId,
        notification.message
      );
      
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          isSent: true,
          sentAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }
});
```

---

## 🏗️ Структура проекта

```
backend/
├── prisma/
│   ├── schema.prisma          # Prisma схема
│   └── migrations/            # Миграции БД
├── src/
│   ├── config/
│   │   ├── database.js        # Конфигурация БД
│   │   └── telegram.js        # Конфигурация Telegram Bot
│   ├── middleware/
│   │   ├── auth.js            # JWT middleware
│   │   └── telegramAuth.js    # Telegram auth middleware
│   ├── routes/
│   │   ├── auth.js            # Аутентификация
│   │   ├── directions.js      # Направления
│   │   ├── schedule.js        # Расписание
│   │   ├── bookings.js        # Записи
│   │   ├── subscriptions.js   # Абонементы
│   │   ├── rental.js          # Аренда
│   │   ├── profile.js         # Профиль
│   │   └── admin/
│   │       ├── bookings.js    # Админ: записи
│   │       ├── subscriptions.js # Админ: абонементы
│   │       ├── lessons.js     # Админ: расписание
│   │       ├── trainers.js    # Админ: тренеры
│   │       └── stats.js       # Админ: статистика
│   ├── services/
│   │   ├── notificationService.js  # Уведомления
│   │   ├── bookingService.js       # Логика записей
│   │   ├── subscriptionService.js  # Логика абонементов
│   │   └── telegramBot.js          # Telegram Bot
│   ├── utils/
│   │   ├── validation.js      # Валидация данных
│   │   └── helpers.js         # Вспомогательные функции
│   └── index.js               # Главный файл
├── .env                       # Переменные окружения
├── package.json
└── README.md
```

---

## 🔧 Настройка проекта

### 1. Установка зависимостей

```bash
cd backend
npm install express prisma @prisma/client cors jsonwebtoken node-telegram-bot-api node-cron dotenv
npm install -D nodemon
```

### 2. Настройка Prisma

```bash
npx prisma init --datasource-provider sqlite
```

Создать схему в `prisma/schema.prisma` на основе моделей выше.

```bash
# Создать миграцию
npx prisma migrate dev --name init

# Сгенерировать Prisma Client
npx prisma generate
```

### 3. Переменные окружения (.env)

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# Telegram
BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_BOT_USERNAME=your_bot_username

# Admin
ADMIN_TELEGRAM_IDS=123456789,987654321
```

### 4. Создание Telegram Bot

1. Открыть [@BotFather](https://t.me/botfather) в Telegram
2. Создать нового бота: `/newbot`
3. Получить токен
4. Настроить Web App: `/newapp`
5. Указать URL Mini App

---

## 📝 Seed данные

Создать файл `prisma/seed.js`:

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Залы
  await prisma.hall.createMany({
    data: [
      {
        name: 'Волгина, 117А',
        address: 'ул. Волгина, 117А',
        capacity: 6,
        poleCount: 6,
        pricePerHour: 1500
      },
      {
        name: 'ТОЦ "Охотный ряд"',
        address: 'Московское шоссе, 43',
        capacity: 6,
        poleCount: 6,
        pricePerHour: 1200
      }
    ]
  });
  
  // Направления
  const directions = [
    {
      name: 'Pole Fit',
      slug: 'pole-fit',
      tagline: 'Красивый фитнес на пилоне',
      description: 'На занятии учим элементы и комбинации из них...',
      features: JSON.stringify(['Трюки и акробатика на пилоне', 'Подходит для новичков']),
      levels: JSON.stringify(['Вводный', 'Начинающий', 'Продолжающий'])
    },
    // ... остальные направления
  ];
  
  for (const direction of directions) {
    await prisma.direction.create({ data: direction });
  }
  
  // Тренеры
  await prisma.trainer.createMany({
    data: [
      {
        name: 'Анна Иванова',
        email: 'anna@geometria.ru',
        phone: '+79001234567',
        directions: JSON.stringify([1, 2])
      },
      // ... остальные тренеры
    ]
  });
  
  // Типы абонементов
  const subscriptionTypes = [
    // КЛАССИЧЕСКИЙ
    { category: 'КЛАССИЧЕСКИЙ', name: '1 занятие', lessonCount: 1, price: 700, validityDays: 7 },
    { category: 'КЛАССИЧЕСКИЙ', name: '4 занятия', lessonCount: 4, price: 2500, validityDays: 30 },
    { category: 'КЛАССИЧЕСКИЙ', name: '8 занятий', lessonCount: 8, price: 3800, validityDays: 30 },
    // ... остальные
  ];
  
  for (const type of subscriptionTypes) {
    await prisma.subscriptionType.create({ data: type });
  }
  
  // Настройки
  await prisma.setting.createMany({
    data: [
      { key: 'cancel_evening_hours_before', value: '4', description: 'За сколько часов можно отменить вечернее занятие' },
      { key: 'reminder_hours_before', value: '2', description: 'За сколько часов отправлять напоминание' },
      // ... остальные настройки
    ]
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Запуск seed:
```bash
npx prisma db seed
```

---

## 🚀 Запуск проекта

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

---

## 📋 Чек-лист разработки

### Этап 1: Подготовка (1-2 дня)
- [ ] Установить Prisma и настроить подключение к SQLite
- [ ] Создать Prisma схему на основе плана
- [ ] Выполнить миграции
- [ ] Создать seed данные
- [ ] Настроить Telegram Bot через BotFather
- [ ] Настроить переменные окружения

### Этап 2: Аутентификация (2-3 дня)
- [ ] Реализовать валидацию Telegram Web App Data
- [ ] Создать middleware для проверки JWT
- [ ] Реализовать endpoints авторизации
  - [ ] POST /api/auth/login
  - [ ] GET /api/auth/me
- [ ] Протестировать аутентификацию с frontend

### Этап 3: API для клиентов (5-7 дней)
- [ ] Направления
  - [ ] GET /api/directions
  - [ ] GET /api/directions/:slug
- [ ] Расписание и записи
  - [ ] GET /api/schedule
  - [ ] POST /api/bookings
  - [ ] GET /api/bookings/my
  - [ ] DELETE /api/bookings/:id
  - [ ] Проверка доступности мест
  - [ ] Проверка остатка занятий на абонементе
- [ ] Абонементы
  - [ ] GET /api/subscription-types
  - [ ] POST /api/subscriptions (создание заявки)
  - [ ] GET /api/subscriptions/my
- [ ] Аренда
  - [ ] GET /api/halls
  - [ ] POST /api/rental/bookings
- [ ] Профиль
  - [ ] GET /api/profile
  - [ ] PUT /api/profile

### Этап 4: API для админ-панели (5-7 дней)
- [ ] Middleware для проверки админа
- [ ] Управление записями
  - [ ] GET /api/admin/bookings
  - [ ] POST /api/admin/bookings
  - [ ] PUT /api/admin/bookings/:id
  - [ ] DELETE /api/admin/bookings/:id
- [ ] Управление абонементами
  - [ ] GET /api/admin/subscriptions
  - [ ] PUT /api/admin/subscriptions/:id/confirm
  - [ ] POST /api/admin/subscriptions (создание администратором)
- [ ] Управление расписанием
  - [ ] GET /api/admin/lessons
  - [ ] POST /api/admin/lessons
  - [ ] PUT /api/admin/lessons/:id
  - [ ] DELETE /api/admin/lessons/:id
- [ ] Управление тренерами
  - [ ] GET /api/admin/trainers
  - [ ] POST /api/admin/trainers
  - [ ] PUT /api/admin/trainers/:id
  - [ ] DELETE /api/admin/trainers/:id
- [ ] Статистика
  - [ ] GET /api/admin/stats

### Этап 5: Telegram Bot и уведомления (3-4 дня)
- [ ] Настроить Telegram Bot для отправки сообщений
- [ ] Реализовать NotificationService
  - [ ] Подтверждение записи
  - [ ] Напоминание о занятии
  - [ ] Отмена занятия
  - [ ] Окончание абонемента
- [ ] Настроить cron для автоматической отправки
- [ ] Создать шаблоны сообщений

### Этап 6: Дополнительные функции (2-3 дня)
- [ ] Правила отмены занятий (вечерние/дневные)
- [ ] Автоматическая запись для абонементов типа "automatic"
- [ ] Заморозка абонементов
- [ ] История посещений
- [ ] Логирование действий

### Этап 7: Тестирование и оптимизация (2-3 дня)
- [ ] Тестирование всех endpoints
- [ ] Проверка валидации данных
- [ ] Проверка безопасности
- [ ] Оптимизация запросов к БД
- [ ] Добавить обработку ошибок
- [ ] Логирование

### Этап 8: Деплой (1-2 дня)
- [ ] Подготовить production конфигурацию
- [ ] Настроить сервер
- [ ] Настроить домен и SSL
- [ ] Настроить backup БД
- [ ] Мониторинг и логи

---

## 🔒 Безопасность

### Рекомендации:
1. **Валидация входных данных** - всегда проверять все данные от клиента
2. **Rate limiting** - ограничение количества запросов
3. **CORS** - настроить разрешенные домены
4. **Helmet.js** - защита заголовков HTTP
5. **SQL Injection** - Prisma защищает автоматически
6. **Хранение токенов** - JWT с коротким временем жизни
7. **HTTPS** - обязательно для production
8. **Секреты** - хранить в .env, не коммитить в Git

---

## 📊 Мониторинг и логирование

### Winston для логирования
```bash
npm install winston
```

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

---

## 🎯 Ключевые особенности реализации

### 1. Автоматическая запись (automatic booking)
Для абонементов с типом "automatic" система должна:
- Автоматически записывать пользователя на занятия по выбранному направлению и дням недели
- Проверять доступность мест
- Уменьшать количество оставшихся занятий на абонементе

### 2. Правила отмены
- **Вечерние занятия (после 17:00)**: отмена за 4 часа
- **Дневные занятия (до 17:00)**: отмена до 21:00 предыдущего дня
- При нарушении правил - занятие списывается

### 3. Заморозка абонемента
- Максимум 2 недели
- Продлевает срок действия абонемента

### 4. Уведомления
- За 2 часа до занятия
- При подтверждении/отмене
- За 3 дня до окончания абонемента

---

## 📞 Контакты и поддержка

При возникновении вопросов:
- Документация Prisma: https://www.prisma.io/docs
- Telegram Bot API: https://core.telegram.org/bots/api
- Telegram Web Apps: https://core.telegram.org/bots/webapps

---

## ✅ Итоговые сроки

**Общая оценка:** 20-30 дней разработки

- Подготовка: 1-2 дня
- Аутентификация: 2-3 дня
- API для клиентов: 5-7 дней
- Админ-панель: 5-7 дней
- Уведомления: 3-4 дня
- Дополнительные функции: 2-3 дня
- Тестирование: 2-3 дня
- Деплой: 1-2 дня

**Резерв времени:** +5-7 дней на непредвиденные сложности

---

## 🎉 Заключение

Данный план разработки покрывает все необходимые аспекты для создания полноценного backend для Telegram Mini App студии "Геометрия". 

Основные преимущества решения:
✅ SQLite - простая и надежная БД, не требует отдельного сервера
✅ Prisma - современный ORM с типизацией
✅ Telegram Auth - безопасная аутентификация без паролей
✅ Автоматические уведомления через Telegram Bot
✅ Полноценная админ-панель
✅ Масштабируемая архитектура

**Удачи в разработке! 🚀💜**


