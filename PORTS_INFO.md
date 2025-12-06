# 🌐 Порты приложения

## Текущая конфигурация:

### Backend
- **Порт:** 3001
- **URL:** http://localhost:3001
- **Health Check:** http://localhost:3001/health

### Frontend
- **Порт:** 3002 (изменен с 3000)
- **URL:** http://localhost:3002
- **Основные страницы:**
  - Главная: http://localhost:3002
  - Направления: http://localhost:3002/directions
  - Абонементы: http://localhost:3002/prices
  - Личный кабинет: http://localhost:3002/profile
  - Админ-панель: http://localhost:3002/admin

## Почему порт 3002?

Backend настроен на прием запросов с `http://localhost:3002` в CORS:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3002',
  credentials: true
}));
```

Если frontend работает на другом порту (например, 3000), возникнут ошибки CORS:
- ❌ "Access to fetch at ... has been blocked by CORS policy"
- ❌ "Failed to fetch"

## Как запустить на правильных портах:

### Терминал 1 - Backend (порт 3001):
```bash
cd backend
node src/index.js
```

### Терминал 2 - Frontend (порт 3002):
```bash
cd frontend
npm run dev
```

Сервер автоматически запустится на порту 3002 благодаря настройке в `package.json`:
```json
"dev": "next dev -p 3002"
```

## Проверка портов:

### Windows PowerShell:
```powershell
# Проверить, что слушается на портах
netstat -ano | findstr "3001"
netstat -ano | findstr "3002"
```

### Проверка через браузер:
- Backend: http://localhost:3001/health
  - Должен вернуть: `{"status":"ok","timestamp":"..."}`
- Frontend: http://localhost:3002
  - Должна открыться главная страница приложения

## Изменение порта frontend:

Если нужно изменить порт, отредактируйте `frontend/package.json`:

```json
"scripts": {
  "dev": "next dev -p НОВЫЙ_ПОРТ",
  ...
}
```

И обновите CORS в `backend/src/index.js`:

```javascript
app.use(cors({
  origin: 'http://localhost:НОВЫЙ_ПОРТ',
  credentials: true
}));
```

Не забудьте перезапустить оба сервера!

## Переменные окружения:

### Backend (.env):
```env
PORT=3001
FRONTEND_URL=http://localhost:3002
```

### Frontend (.env.local):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Готовые скрипты запуска:

### Backend:
```bash
cd backend
node src/index.js
```

Или используйте `backend/start-backend.bat`

### Frontend:
```bash
cd frontend
npm run dev
```

Или используйте `frontend/start-frontend.bat`

