# ✅ Проверка переменных окружения в Vercel

## 📋 Что уже добавлено (видно на скриншоте):

✅ `NEXT_PUBLIC_API_URL` - для frontend
✅ `NEXT_PUBLIC_SUPABASE_URL` - для frontend
✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - для frontend

## ⚠️ Что еще нужно добавить для полной работы:

### Для Backend (если деплоите backend отдельно на Vercel):

1. **SUPABASE_URL** 
   - Значение: `https://njcsizoiirqfsrzvlzec.supabase.co`
   - Для: Backend

2. **SUPABASE_SERVICE_ROLE_KEY**
   - Значение: ваш service_role key из Supabase
   - Для: Backend (секретный ключ)
   - ⚠️ Важно: Это секретный ключ, не anon key!

3. **BOT_TOKEN**
   - Значение: ваш Telegram Bot Token
   - Для: Backend

4. **JWT_SECRET**
   - Значение: секретный ключ для JWT токенов
   - Для: Backend

5. **ADMIN_TELEGRAM_IDS**
   - Значение: список Telegram ID админов через запятую (например: `123456789,987654321`)
   - Для: Backend

6. **NODE_ENV**
   - Значение: `production`
   - Для: Backend

## 📝 Итого:

### Frontend (уже добавлено ✅):
- ✅ NEXT_PUBLIC_API_URL
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY

### Backend (нужно добавить ⚠️):
- ⚠️ SUPABASE_URL
- ⚠️ SUPABASE_SERVICE_ROLE_KEY
- ⚠️ BOT_TOKEN
- ⚠️ JWT_SECRET
- ⚠️ ADMIN_TELEGRAM_IDS
- ⚠️ NODE_ENV

## 🎯 Где взять значения:

### SUPABASE_SERVICE_ROLE_KEY:
1. Откройте Supabase Dashboard
2. Settings → API
3. Найдите **service_role key** (секретный ключ, не anon key!)
4. Скопируйте его

### BOT_TOKEN:
- Получите у [@BotFather](https://t.me/BotFather) в Telegram
- Или используйте существующий токен

### JWT_SECRET:
- Сгенерируйте случайную строку (минимум 32 символа)
- Или используйте существующий из `backend/.env`

### ADMIN_TELEGRAM_IDS:
- Список ваших Telegram ID через запятую
- Можно узнать через бота [@userinfobot](https://t.me/userinfobot)

---

**Добавьте недостающие переменные для backend, и всё будет работать! 🚀**

