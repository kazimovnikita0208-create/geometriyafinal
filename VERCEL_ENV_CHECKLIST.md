# ✅ Чеклист переменных окружения для Vercel

## 📋 Frontend проект (geometriyafinal)

### Обязательные переменные:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - Значение: `https://njcsizoiirqfsrzvlzec.supabase.co`
  - Environment: Production, Preview, Development

- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Значение: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qY3Npem9paXJxZnNyenZsemVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMDg2OTUsImV4cCI6MjA4MDU4NDY5NX0.1rJInVTDjf4f0sMNbyi6mkLJF185BDsH0u0Bld5j5xs`
  - Environment: Production, Preview, Development

- [ ] `NEXT_PUBLIC_API_URL`
  - Значение: `https://ваш-backend.vercel.app` (после деплоя backend)
  - Environment: Production, Preview, Development

## 📋 Backend проект (если отдельно)

### Обязательные переменные:

- [ ] `SUPABASE_URL`
  - Значение: `https://njcsizoiirqfsrzvlzec.supabase.co`
  - Environment: Production

- [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - Значение: ваш service_role key из Supabase
  - Environment: Production
  - ⚠️ Секретный ключ!

- [ ] `BOT_TOKEN`
  - Значение: ваш Telegram Bot Token
  - Environment: Production

- [ ] `JWT_SECRET`
  - Значение: секретный ключ (минимум 32 символа)
  - Environment: Production

- [ ] `ADMIN_TELEGRAM_IDS`
  - Значение: ваши Telegram ID через запятую
  - Environment: Production

- [ ] `NODE_ENV`
  - Значение: `production`
  - Environment: Production

## 🔍 Как проверить

1. Vercel Dashboard → Settings → Environment Variables
2. Проверьте, что все переменные добавлены
3. Проверьте, что Environment выбран правильно
4. Пересоберите проект после добавления переменных

---

**После добавления всех переменных проект должен работать с Supabase!**

