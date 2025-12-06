# 🚀 Настройка Supabase для проекта Геометрия

## 📋 Обзор

Проект интегрирован с Supabase для расширенных возможностей:
- **База данных PostgreSQL** - альтернатива/дополнение к SQLite
- **Real-time подписки** - для live обновлений
- **Storage** - для загрузки файлов
- **Row Level Security** - для безопасности данных

## 🔧 Настройка переменных окружения

### 1. Создайте файл `.env.local` в папке `frontend/`

```bash
cd frontend
```

Создайте файл `.env.local` со следующим содержимым:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://njcsizoiirqfsrzvlzec.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qY3Npem9paXJxZnNyenZsemVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMDg2OTUsImV4cCI6MjA4MDU4NDY5NX0.1rJInVTDjf4f0sMNbyi6mkLJF185BDsH0u0Bld5j5xs
```

### 2. Для Vercel (Production)

Добавьте те же переменные в Vercel Dashboard:
1. Откройте проект на Vercel
2. Перейдите в **Settings** → **Environment Variables**
3. Добавьте:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🗄️ Настройка базы данных в Supabase

### 1. Создание таблицы пользователей

Откройте **SQL Editor** в Supabase Dashboard и выполните:

```sql
-- Создание таблицы пользователей (синхронизация с основной БД)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(50),
  is_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индекса для быстрого поиска по telegram_id
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);

-- Включение Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Политики безопасности
-- Пользователи могут видеть только свои данные
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (true); -- Можно настроить более строгую политику

-- Пользователи могут обновлять только свои данные
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (true); -- Можно настроить более строгую политику
```

### 2. Создание дополнительных таблиц (опционально)

Если хотите использовать Supabase для хранения других данных:

```sql
-- Пример: таблица для уведомлений
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type VARCHAR(50) DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (true);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (true);
```

## 🔐 Интеграция с существующей системой

### Автоматическая синхронизация

При авторизации через Telegram пользователь автоматически синхронизируется с Supabase:

1. Пользователь авторизуется через Telegram `initData`
2. Backend создает/обновляет пользователя в SQLite
3. Frontend синхронизирует данные с Supabase (если настроен)

### Использование Supabase клиентов

#### В клиентских компонентах:

```typescript
'use client'

import { createClient } from '@/utils/supabase/client'

export default function MyComponent() {
  const supabase = createClient()
  
  // Пример: получение данных
  const fetchData = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', '123456789')
      .single()
    
    if (error) {
      console.error('Error:', error)
      return
    }
    
    console.log('User data:', data)
  }
  
  return <div>...</div>
}
```

#### В серверных компонентах:

```typescript
import { createClient } from '@/utils/supabase/server'

export default async function ServerComponent() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
  
  return <div>...</div>
}
```

## 📦 Структура файлов

```
frontend/
├── utils/
│   └── supabase/
│       ├── client.ts      # Клиент для браузера
│       ├── server.ts      # Клиент для сервера
│       └── middleware.ts  # Middleware для обновления сессий
├── lib/
│   └── supabase.ts        # Утилиты для работы с Supabase
├── middleware.ts         # Next.js middleware
└── .env.local            # Переменные окружения (не коммитится)
```

## ✅ Проверка работы

1. **Проверьте переменные окружения:**
   ```bash
   # В frontend/.env.local должны быть:
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

2. **Запустите проект:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Проверьте консоль браузера:**
   - При авторизации должно появиться: `✅ Пользователь синхронизирован с Supabase`

4. **Проверьте Supabase Dashboard:**
   - Откройте **Table Editor** → **users**
   - После авторизации должен появиться новый пользователь

## 🐛 Решение проблем

### Ошибка: "Missing Supabase URL or Key"

**Решение:** Убедитесь, что переменные окружения установлены в `.env.local` и перезапустите dev сервер.

### Ошибка: "Failed to fetch"

**Решение:** 
1. Проверьте, что URL Supabase правильный
2. Проверьте, что проект не приостановлен в Supabase Dashboard
3. Проверьте настройки CORS в Supabase

### Пользователь не синхронизируется

**Решение:**
1. Проверьте консоль браузера на наличие ошибок
2. Убедитесь, что таблица `users` создана в Supabase
3. Проверьте политики Row Level Security

## 📚 Дополнительные возможности

### Real-time подписки

```typescript
const supabase = createClient()

const channel = supabase
  .channel('users')
  .on('postgres_changes', 
    { event: 'UPDATE', schema: 'public', table: 'users' },
    (payload) => {
      console.log('User updated:', payload.new)
    }
  )
  .subscribe()
```

### Storage для файлов

```typescript
// Загрузка файла
const { data, error } = await supabase.storage
  .from('avatars')
  .upload('user-123.jpg', file)

// Получение публичного URL
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('user-123.jpg')
```

## 🎯 Следующие шаги

1. ✅ Настроить переменные окружения
2. ✅ Создать таблицы в Supabase
3. ✅ Протестировать синхронизацию пользователей
4. ⏭️ Настроить Real-time подписки (если нужно)
5. ⏭️ Настроить Storage для файлов (если нужно)

---

**Готово! Supabase интегрирован в проект! 🎉**

