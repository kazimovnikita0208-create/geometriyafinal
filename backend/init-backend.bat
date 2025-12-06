@echo off
chcp 65001 >nul
cls
echo.
echo ========================================
echo   Инициализация Backend Geometriya
echo ========================================
echo.

echo [1/3] Установка зависимостей...
call npm install
if %errorlevel% neq 0 (
    echo ❌ ОШИБКА при установке зависимостей!
    pause
    exit /b 1
)
echo ✅ Зависимости установлены
echo.

echo [2/3] Создание и заполнение базы данных...
call npm run init-db
if %errorlevel% neq 0 (
    echo ❌ ОШИБКА при создании базы данных!
    pause
    exit /b 1
)
echo.

echo [3/3] Запуск сервера...
echo.
echo 🌐 Backend будет доступен на: http://localhost:3001
echo 📡 API endpoints: http://localhost:3001/api
echo.
echo Для остановки сервера нажмите Ctrl+C
echo.
call npm run dev

