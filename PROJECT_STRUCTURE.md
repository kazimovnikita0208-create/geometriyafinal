# 📁 Структура проекта "Геометрия"

Полная структура файлов и директорий проекта.

```
geometriya-bot/
│
├── 📄 README.md                    # Общее описание проекта
├── 📄 DEVELOPMENT_PLAN.md         # Подробный план разработки
├── 📄 QUICKSTART.md               # Быстрый старт для запуска
├── 📄 PROJECT_STRUCTURE.md        # Этот файл
├── 📄 database_schema.sql         # SQL схема базы данных
├── 📄 .gitignore                  # Игнорируемые файлы для Git
│
├── 📂 backend/                    # Backend сервер и Telegram бот
│   ├── 📄 package.json
│   ├── 📄 .env.example            # Пример файла окружения
│   ├── 📄 .env                    # Настройки окружения (не в Git!)
│   │
│   ├── 📂 src/
│   │   ├── 📄 index.js           # Главный файл сервера
│   │   │
│   │   ├── 📂 config/            # Конфигурация
│   │   │   ├── database.js       # Подключение к SQLite
│   │   │   └── telegram.js       # Настройки Telegram
│   │   │
│   │   ├── 📂 models/            # Модели для работы с БД
│   │   │   ├── User.js
│   │   │   ├── Subscription.js   # TODO
│   │   │   ├── Lesson.js         # TODO
│   │   │   ├── Booking.js        # TODO
│   │   │   └── ...
│   │   │
│   │   ├── 📂 routes/            # API роуты
│   │   │   ├── auth.js           # ✅ Авторизация
│   │   │   ├── users.js          # TODO: Пользователи
│   │   │   ├── subscriptions.js  # TODO: Абонементы
│   │   │   ├── lessons.js        # TODO: Расписание
│   │   │   ├── bookings.js       # TODO: Записи
│   │   │   ├── halls.js          # TODO: Залы
│   │   │   ├── directions.js     # TODO: Направления
│   │   │   └── poleBookings.js   # TODO: Бронирование
│   │   │
│   │   ├── 📂 controllers/       # Контроллеры (опционально)
│   │   │   └── ...
│   │   │
│   │   ├── 📂 services/          # Бизнес-логика
│   │   │   ├── telegramAuth.js   # ✅ Валидация Telegram WebApp
│   │   │   ├── bookingRules.js   # ✅ Правила записи/отмены
│   │   │   └── notificationScheduler.js  # TODO: Уведомления
│   │   │
│   │   ├── 📂 middleware/        # Middleware
│   │   │   ├── auth.js           # ✅ JWT авторизация
│   │   │   ├── errorHandler.js   # TODO: Обработка ошибок
│   │   │   └── validation.js     # TODO: Валидация данных
│   │   │
│   │   └── 📂 bot/               # Telegram Bot
│   │       ├── index.js          # ✅ Основной файл бота
│   │       └── handlers.js       # TODO: Обработчики команд
│   │
│   └── 📂 database/              # База данных
│       └── geometriya.db         # SQLite база (не в Git!)
│
├── 📂 frontend/                   # Next.js Mini App
│   ├── 📄 package.json
│   ├── 📄 next.config.js         # ✅ Конфигурация Next.js
│   ├── 📄 tailwind.config.js     # ✅ Конфигурация Tailwind
│   ├── 📄 postcss.config.js      # ✅ PostCSS конфигурация
│   ├── 📄 tsconfig.json          # ✅ TypeScript конфигурация
│   ├── 📄 .env.local             # Локальные переменные (не в Git!)
│   │
│   ├── 📂 app/                   # Next.js App Router
│   │   ├── 📄 layout.tsx         # ✅ Главный Layout
│   │   ├── 📄 page.tsx           # ✅ Главная страница
│   │   ├── 📄 globals.css        # ✅ Глобальные стили
│   │   │
│   │   ├── 📂 schedule/          # TODO: Расписание
│   │   │   └── page.tsx
│   │   │
│   │   ├── 📂 profile/           # TODO: Личный кабинет
│   │   │   └── page.tsx
│   │   │
│   │   ├── 📂 directions/        # TODO: Направления
│   │   │   └── page.tsx
│   │   │
│   │   └── 📂 prices/            # TODO: Цены
│   │       └── page.tsx
│   │
│   ├── 📂 components/            # React компоненты
│   │   ├── 📂 ui/                # UI компоненты
│   │   │   ├── Button.tsx        # TODO
│   │   │   ├── Card.tsx          # TODO
│   │   │   ├── Modal.tsx         # TODO
│   │   │   ├── Spinner.tsx       # TODO
│   │   │   └── ...
│   │   │
│   │   ├── LessonCard.tsx        # TODO: Карточка занятия
│   │   ├── SubscriptionCard.tsx  # TODO: Карточка абонемента
│   │   ├── BookingItem.tsx       # TODO: Элемент записи
│   │   └── ...
│   │
│   ├── 📂 lib/                   # Утилиты и библиотеки
│   │   ├── api.ts                # ✅ API клиент
│   │   ├── telegram.ts           # ✅ Telegram WebApp SDK
│   │   ├── utils.ts              # TODO: Вспомогательные функции
│   │   └── constants.ts          # TODO: Константы
│   │
│   ├── 📂 hooks/                 # React хуки
│   │   ├── useAuth.ts            # TODO: Авторизация
│   │   ├── useLessons.ts         # TODO: Работа с занятиями
│   │   └── ...
│   │
│   ├── 📂 types/                 # TypeScript типы
│   │   ├── user.ts               # TODO
│   │   ├── lesson.ts             # TODO
│   │   ├── booking.ts            # TODO
│   │   └── ...
│   │
│   ├── 📂 styles/                # Дополнительные стили
│   │   └── ...
│   │
│   └── 📂 public/                # Статические файлы
│       ├── logo.svg              # TODO: Логотип
│       ├── favicon.ico
│       └── ...
│
└── 📂 scripts/                    # Вспомогательные скрипты
    ├── initDatabase.js           # TODO: Инициализация БД
    ├── seedDatabase.js           # TODO: Заполнение тестовыми данными
    └── backup.js                 # TODO: Бэкап БД
```

---

## 🎯 Статус реализации

### ✅ Готово

**Backend:**
- ✅ Конфигурация базы данных
- ✅ Конфигурация Telegram
- ✅ Модель User
- ✅ Сервис валидации Telegram WebApp
- ✅ Сервис правил записи/отмены
- ✅ Middleware авторизации (JWT)
- ✅ Роуты авторизации
- ✅ Telegram Bot (базовые команды)
- ✅ Главный файл сервера

**Frontend:**
- ✅ Конфигурация Next.js
- ✅ Конфигурация Tailwind CSS
- ✅ API клиент
- ✅ Telegram WebApp SDK утилиты
- ✅ Layout приложения
- ✅ Главная страница с меню
- ✅ Глобальные стили

**Документация:**
- ✅ README.md
- ✅ DEVELOPMENT_PLAN.md
- ✅ QUICKSTART.md
- ✅ database_schema.sql
- ✅ PROJECT_STRUCTURE.md

---

## 📝 TODO (по приоритету)

### Этап 1: Базовый функционал

**Backend:**
1. ⏳ Создать модели: Subscription, Lesson, Booking
2. ⏳ Реализовать роуты для справочников (halls, directions)
3. ⏳ Реализовать роуты для абонементов
4. ⏳ Реализовать роуты для расписания
5. ⏳ Реализовать роуты для записей (с проверкой правил)

**Frontend:**
6. ⏳ Создать UI компоненты (Button, Card, Modal)
7. ⏳ Реализовать страницу расписания
8. ⏳ Реализовать страницу личного кабинета
9. ⏳ Реализовать авторизацию при старте

### Этап 2: Дополнительный функционал

10. ⏳ Страница "О направлениях"
11. ⏳ Страница "Цены"
12. ⏳ Бронирование пилонов/зала
13. ⏳ Система уведомлений (cron jobs)

### Этап 3: Улучшения

14. ⏳ Обработка ошибок
15. ⏳ Валидация данных
16. ⏳ История посещений
17. ⏳ Админ-панель (опционально)

---

## 📏 Правила работы с кодом

### Именование файлов
- **Backend (JavaScript)**: `camelCase.js` (например: `bookingRules.js`)
- **Frontend (TypeScript/React)**: `PascalCase.tsx` для компонентов, `camelCase.ts` для утилит
- **Конфигурация**: `kebab-case.js` или `lowercase.js`

### Структура компонентов
```tsx
// Импорты
import ...

// Типы (если нужны)
interface Props { ... }

// Компонент
export default function Component() {
  // Hooks
  // State
  // Handlers
  // Effects
  
  // Render
  return (...)
}
```

### Commit сообщения
- `feat: добавить страницу расписания`
- `fix: исправить проверку правил отмены`
- `refactor: оптимизировать запросы к БД`
- `docs: обновить README`

---

## 🔗 Связи между модулями

### Авторизация
```
Frontend (initData) 
  → Backend /api/v1/auth/telegram 
  → telegramAuth.validateTelegramWebAppData() 
  → User.upsert() 
  → JWT Token
  → Frontend (localStorage)
```

### Запись на занятие
```
Frontend (LessonCard click)
  → Backend /api/v1/bookings (POST)
  → bookingRules.canBookLesson()
  → Subscription validation
  → Booking.create()
  → Subscription.decrementLessons()
  → Success response
```

### Отмена записи
```
Frontend (Cancel button)
  → Backend /api/v1/bookings/:id/can-cancel (GET)
  → bookingRules.canCancelBooking()
  → Frontend (show/hide button)
  → Backend /api/v1/bookings/:id (DELETE)
  → Booking.cancel()
  → Subscription.incrementLessons()
```

---

## 🎨 Дизайн-система

### Цвета
- **Primary**: `#5833b6` - основной фиолетовый
- **Primary Dark**: `#4527a0`
- **Primary Light**: `#7e57c2`

### Направления
- **Pole**: `#5833b6`
- **Exotic**: `#b63384`
- **Stretch**: `#33b683`
- **Aerial**: `#3384b6`
- **Choreo**: `#b68333`

### Компоненты
- Закруглённые углы: `12px` (rounded-xl)
- Тени: `shadow-card`, `shadow-primary`
- Отступы: `4px` (p-4, gap-4)

---

## 🔐 Безопасность

### Не включать в Git:
- ❌ `.env` файлы
- ❌ `*.db` файлы
- ❌ `node_modules/`
- ❌ Токены и секреты

### Обязательно:
- ✅ Валидация всех входных данных
- ✅ JWT токены с истечением
- ✅ HTTPS для Mini App
- ✅ Проверка Telegram initData

---

## 📊 База данных

**Таблицы:** 10
**Индексы:** 8
**Views:** 3
**Триггеры:** 2

См. подробности в `database_schema.sql`

---

**Последнее обновление:** 2025-11-16

