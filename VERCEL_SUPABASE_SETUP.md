# 🚀 Настройка Supabase для работы на Vercel

## 📋 Обзор

Для работы приложения на Vercel необходимо использовать Supabase вместо SQLite, так как Vercel не поддерживает файловую систему для записи.

## ✅ Что уже сделано

1. ✅ Создан адаптер базы данных (`database-adapter.js`)
   - Автоматически переключается между SQLite (локально) и Supabase (на Vercel)
   - Поддерживает единый интерфейс для работы с БД

2. ✅ Обновлены критичные routes:
   - `auth.js` - авторизация работает с Supabase
   - `authMiddleware` - проверка токенов работает с Supabase

3. ✅ Данные мигрированы в Supabase

## 🔧 Настройка переменных окружения для Vercel

### Шаг 1: Добавьте переменные в Vercel Dashboard

1. Откройте ваш проект на Vercel: https://vercel.com/dashboard
2. Перейдите в **Settings** → **Environment Variables**
3. Добавьте следующие переменные:

#### Для Backend (если деплоите отдельно):

```env
SUPABASE_URL=https://njcsizoiirqfsrzvlzec.supabase.co
SUPABASE_SERVICE_ROLE_KEY=ваш-service-role-key-здесь
BOT_TOKEN=ваш-telegram-bot-token
JWT_SECRET=ваш-jwt-secret
ADMIN_TELEGRAM_IDS=123456789,987654321
NODE_ENV=production
```

#### Для Frontend:

```env
NEXT_PUBLIC_API_URL=https://ваш-backend-url.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://njcsizoiirqfsrzvlzec.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш-anon-key-здесь
```

### Шаг 2: Получите ключи из Supabase

1. Откройте Supabase Dashboard
2. Перейдите в **Settings** → **API**
3. Скопируйте:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (секретный) → `SUPABASE_SERVICE_ROLE_KEY`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🔄 Как работает адаптер

Адаптер автоматически определяет, какую БД использовать:

- **Локально (без переменных Supabase)**: Использует SQLite
- **На Vercel (с переменными Supabase)**: Использует Supabase

### Логика выбора:

```javascript
const USE_SUPABASE = isSupabaseEnabled() || process.env.NODE_ENV === 'production';
```

## 📝 Текущий статус миграции

### ✅ Полностью обновлено:
- `routes/auth.js` - авторизация
- `middleware/auth.js` - проверка токенов

### ⚠️ Требует обновления (пока работают только с SQLite):
- `routes/bookings.js`
- `routes/lessons.js`
- `routes/subscriptions.js`
- `routes/rental.js`
- `routes/directions.js`
- `routes/trainers.js`
- `routes/halls.js`
- `routes/prices.js`
- `routes/stats.js`
- `routes/notifications.js`
- `routes/recurringLessons.js`

## 🚀 Деплой на Vercel

### Вариант 1: Backend отдельно на Vercel

1. Создайте новый проект на Vercel для backend
2. Подключите репозиторий
3. Настройте:
   - **Root Directory**: `backend`
   - **Build Command**: (не нужен, это Node.js приложение)
   - **Output Directory**: (не нужен)
   - **Install Command**: `npm install`
   - **Start Command**: `npm start`

4. Добавьте переменные окружения (см. выше)

### Вариант 2: Использовать существующий backend

Если backend уже деплоится, просто добавьте переменные Supabase.

## ✅ Проверка работы

После деплоя проверьте:

1. **Авторизация работает:**
   ```
   POST https://ваш-backend.vercel.app/api/auth/login
   ```

2. **Данные получаются:**
   ```
   GET https://ваш-backend.vercel.app/api/directions
   ```

## 🔄 Постепенная миграция

Остальные routes можно обновлять постепенно, заменяя:
- `db.prepare('SELECT ...')` → `await dbAdapter.select(...)`
- `db.prepare('INSERT ...')` → `await dbAdapter.insert(...)`
- `db.prepare('UPDATE ...')` → `await dbAdapter.update(...)`

## 📚 Документация адаптера

См. файл `backend/src/config/database-adapter.js` для полной документации методов.

---

**Готово! Теперь приложение будет работать с Supabase на Vercel! 🎉**

