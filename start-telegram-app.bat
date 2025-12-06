@echo off
echo ========================================
echo   Запуск приложения для Telegram
echo ========================================
echo.

echo [1/3] Запуск Backend...
start "Backend Server" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul

echo [2/3] Запуск Frontend...
start "Frontend Server" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak >nul

echo [3/3] Инструкции:
echo.
echo ✅ Backend запущен на http://localhost:3001
echo ✅ Frontend запущен на http://localhost:3002
echo.
echo 📱 Для открытия в Telegram:
echo    1. Установите ngrok: https://ngrok.com/download
echo    2. Запустите: ngrok http 3002
echo    3. Скопируйте HTTPS URL
echo    4. Настройте в @BotFather (Menu Button)
echo    5. Откройте бота и нажмите кнопку!
echo.
echo 📖 Подробная инструкция: КАК_ОТКРЫТЬ_В_TELEGRAM.md
echo.
echo Нажмите любую клавишу для выхода...
pause >nul

