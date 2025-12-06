# 🔧 Исправление ошибки сборки на Vercel

## ❌ Ошибка

```
Module not found: Can't resolve '@/components/ui/beams-background'
Module not found: Can't resolve '@/components/ui/button'
Module not found: Can't resolve '@/lib/api'
Module not found: Can't resolve '@/components/NotificationsSection'
Module not found: Can't resolve '@/components/ui/icons'
```

## ✅ Решение

### Проблема 1: Root Directory не установлен правильно

Убедитесь, что в Vercel Dashboard:
1. Settings → General → Root Directory = `frontend`

### Проблема 2: Файлы не закоммичены

Проверьте, что все файлы закоммичены в Git:

```bash
git status
```

Если есть незакоммиченные файлы, добавьте их:

```bash
git add .
git commit -m "fix: добавлены недостающие файлы"
git push
```

### Проблема 3: Проверка структуры файлов

Убедитесь, что эти файлы существуют:
- ✅ `frontend/components/ui/beams-background.tsx`
- ✅ `frontend/components/ui/button.tsx`
- ✅ `frontend/lib/api.ts`
- ✅ `frontend/components/NotificationsSection.tsx`
- ✅ `frontend/components/ui/icons.tsx`

## 🔍 Проверка

После исправления:
1. Перейдите в Vercel Dashboard → Deployments
2. Нажмите Redeploy
3. Проверьте логи сборки

---

**Если ошибка сохраняется, проверьте Root Directory в Vercel!**

