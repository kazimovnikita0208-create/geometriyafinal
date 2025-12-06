# ⚙️ Настройка переменных окружения для Supabase

## 📝 Создайте файл `.env.local`

В папке `frontend/` создайте файл `.env.local` со следующим содержимым:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://njcsizoiirqfsrzvlzec.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qY3Npem9paXJxZnNyenZsemVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMDg2OTUsImV4cCI6MjA4MDU4NDY5NX0.1rJInVTDjf4f0sMNbyi6mkLJF185BDsH0u0Bld5j5xs
```

## ✅ После создания файла

1. **Перезапустите dev сервер:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Проверьте, что переменные загружены:**
   - Откройте консоль браузера
   - При авторизации должно появиться сообщение о синхронизации с Supabase

## 🚀 Для Vercel (Production)

Добавьте те же переменные в Vercel Dashboard:
1. Откройте проект на Vercel
2. Перейдите в **Settings** → **Environment Variables**
3. Добавьте:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://njcsizoiirqfsrzvlzec.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qY3Npem9paXJxZnNyenZsemVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMDg2OTUsImV4cCI6MjA4MDU4NDY5NX0.1rJInVTDjf4f0sMNbyi6mkLJF185BDsH0u0Bld5j5xs`

---

**Важно:** Файл `.env.local` не должен коммититься в Git (уже добавлен в `.gitignore`)

