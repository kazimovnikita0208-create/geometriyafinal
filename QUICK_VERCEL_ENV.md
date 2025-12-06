# ⚡ Быстрая настройка переменных для Vercel

## ✅ Уже добавлено (Frontend):
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## ⚠️ Нужно добавить (Backend):

Добавьте эти 6 переменных в Vercel Dashboard → Settings → Environment Variables:

### 1. SUPABASE_URL
```
https://njcsizoiirqfsrzvlzec.supabase.co
```

### 2. SUPABASE_SERVICE_ROLE_KEY
```
ваш-service-role-key-из-supabase
```
**Где взять:** Supabase Dashboard → Settings → API → service_role key

### 3. BOT_TOKEN
```
ваш-telegram-bot-token
```

### 4. JWT_SECRET
```
ваш-jwt-secret-минимум-32-символа
```

### 5. ADMIN_TELEGRAM_IDS
```
123456789,987654321
```
(замените на ваши реальные Telegram ID)

### 6. NODE_ENV
```
production
```

## 🚀 После добавления:

1. Перейдите в **Deployments**
2. Нажмите **Redeploy** на последнем деплое
3. Готово! Backend будет работать с Supabase

---

**Все переменные добавлены? Пересоберите проект! 🎉**

