# 🔐 Система аутентификации через Telegram

Полная документация по использованию аутентификации через Telegram WebApp initData.

## 📋 Обзор

Система автоматически авторизует пользователей через Telegram WebApp, используя `initData` для валидации. После успешной авторизации пользователь получает JWT токен для дальнейших запросов к API.

## 🏗️ Архитектура

### Backend

1. **Middleware валидации** (`backend/src/middleware/telegramAuth.js`)
   - Валидирует `initData` от Telegram
   - Проверяет hash и время создания (не старше 1 часа)
   - Извлекает данные пользователя

2. **Endpoint авторизации** (`/api/auth/login`)
   - Принимает `initData` в body
   - Создает/обновляет пользователя в БД
   - Возвращает JWT токен и данные пользователя

### Frontend

1. **AuthProvider** (`frontend/components/AuthProvider.tsx`)
   - Автоматически инициализирует авторизацию при загрузке
   - Предоставляет контекст с данными пользователя
   - Обновляет токен при необходимости

2. **Хуки** (`frontend/hooks/useRequireAuth.ts`)
   - `useRequireAuth()` - защита страниц
   - `useRequireAdmin()` - защита админских страниц

## 🚀 Использование

### Автоматическая инициализация

Авторизация происходит автоматически при загрузке приложения через `AuthProvider` в `layout.tsx`:

```tsx
// frontend/app/layout.tsx
<AuthProvider>
  {children}
</AuthProvider>
```

### Использование в компонентах

```tsx
'use client'

import { useAuth } from '@/components/AuthProvider'

export default function MyComponent() {
  const { user, isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return <div>Загрузка...</div>
  }

  if (!isAuthenticated) {
    return <div>Необходима авторизация</div>
  }

  return <div>Привет, {user?.firstName}!</div>
}
```

### Защита страниц

```tsx
'use client'

import { useRequireAuth } from '@/hooks/useRequireAuth'

export default function ProtectedPage() {
  const { user, isLoading } = useRequireAuth()

  if (isLoading) {
    return <div>Загрузка...</div>
  }

  return <div>Защищенная страница</div>
}
```

### Защита админских страниц

```tsx
'use client'

import { useRequireAdmin } from '@/hooks/useRequireAuth'

export default function AdminPage() {
  const { user, isLoading } = useRequireAdmin()

  if (isLoading) {
    return <div>Загрузка...</div>
  }

  return <div>Админ-панель</div>
}
```

### Ручная авторизация

```tsx
import { initTelegramAuth, logout, refreshUser } from '@/lib/auth'

// Инициализация
const result = await initTelegramAuth()
if (result.success) {
  console.log('Авторизован:', result.user)
}

// Выход
await logout()

// Обновление данных пользователя
const user = await refreshUser()
```

## 🔧 API Endpoints

### POST /api/auth/login

Авторизация через Telegram initData.

**Request:**
```json
{
  "initData": "user={\"id\":123456789,\"first_name\":\"Иван\"}&auth_date=1234567890&hash=..."
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "telegramId": "123456789",
    "firstName": "Иван",
    "lastName": "Иванов",
    "username": "ivan",
    "isAdmin": false,
    "notificationsEnabled": true
  }
}
```

### GET /api/auth/me

Получить текущего пользователя (требует JWT токен).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "telegramId": "123456789",
    "firstName": "Иван",
    "lastName": "Иванов",
    "username": "ivan",
    "isAdmin": false,
    "notificationsEnabled": true
  }
}
```

### POST /api/auth/logout

Выход из системы (требует JWT токен).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

## 🔒 Безопасность

### Валидация initData

1. **Проверка hash** - данные должны быть подписаны правильным токеном бота
2. **Проверка времени** - `auth_date` не должен быть старше 1 часа
3. **Проверка структуры** - должны присутствовать обязательные поля

### JWT токены

- Токены хранятся в `localStorage`
- Автоматически добавляются в заголовок `Authorization` при API запросах
- При истечении токена происходит автоматическая повторная авторизация

### Защита от подделки

- `initData` валидируется на сервере с использованием секретного ключа бота
- Невозможно подделать данные без знания `BOT_TOKEN`

## 🐛 Отладка

### Проверка initData

```javascript
// В консоли браузера
const tg = window.Telegram?.WebApp
console.log('initData:', tg?.initData)
console.log('initDataUnsafe:', tg?.initDataUnsafe)
```

### Проверка токена

```javascript
// В консоли браузера
const token = localStorage.getItem('token')
console.log('Token:', token ? 'Есть' : 'Нет')
```

### Логи на сервере

Backend логирует все попытки авторизации:
- ✅ Успешная авторизация
- ❌ Ошибки валидации
- ⚠️ Предупреждения

## 📝 Примеры

### Полный пример компонента с авторизацией

```tsx
'use client'

import { useAuth } from '@/components/AuthProvider'
import { useEffect } from 'react'

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated, refreshAuth } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Перенаправление или показ формы входа
    }
  }, [isLoading, isAuthenticated])

  if (isLoading) {
    return <div>Загрузка...</div>
  }

  if (!isAuthenticated) {
    return <div>Необходима авторизация</div>
  }

  return (
    <div>
      <h1>Профиль</h1>
      <p>Имя: {user?.firstName} {user?.lastName}</p>
      <p>Username: {user?.username || 'Не указан'}</p>
      <p>Telegram ID: {user?.telegramId}</p>
      <p>Админ: {user?.isAdmin ? 'Да' : 'Нет'}</p>
      <button onClick={refreshAuth}>Обновить данные</button>
    </div>
  )
}
```

## ⚙️ Настройка

### Переменные окружения

**Backend** (`.env`):
```env
BOT_TOKEN=your_telegram_bot_token
JWT_SECRET=your_jwt_secret_min_32_chars
ADMIN_TELEGRAM_IDS=123456789,987654321
```

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🔄 Обновление токена

Токен автоматически обновляется при:
- Истечении срока действия (при попытке запроса)
- Вызове `refreshAuth()` в контексте
- Вызове `initTelegramAuth()` вручную

## 📚 Дополнительные ресурсы

- [Telegram WebApp Documentation](https://core.telegram.org/bots/webapps)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [JWT Documentation](https://jwt.io/)

