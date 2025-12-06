@echo off
chcp 65001 >nul
cls
echo.
echo ========================================
echo   Установка зависимостей (упрощённая)
echo ========================================
echo.

echo Остановка процессов...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Устанавливаем основные зависимости по одной...
echo.

echo [1/8] express...
call npm install express@4.18.2
echo.

echo [2/8] dotenv...
call npm install dotenv@16.3.1
echo.

echo [3/8] cors...
call npm install cors@2.8.5
echo.

echo [4/8] jsonwebtoken...
call npm install jsonwebtoken@9.0.2
echo.

echo [5/8] node-telegram-bot-api...
call npm install node-telegram-bot-api@0.64.0
echo.

echo [6/8] node-cron...
call npm install node-cron@3.0.3
echo.

echo [7/8] winston...
call npm install winston@3.11.0
echo.

echo [8/8] better-sqlite3...
echo (Это может занять время - компилируется нативный модуль)
call npm install better-sqlite3@9.2.2
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  better-sqlite3 не установился. Попробуем альтернативу...
    call npm install sqlite3@5.1.6
)
echo.

echo Устанавливаем dev-зависимости...
call npm install --save-dev nodemon@3.0.2
echo.

echo ✅ Установка завершена!
echo.
echo Теперь создайте базу данных:
echo   npm run create-db
echo   npm run seed-db
echo.
echo Затем запустите сервер:
echo   npm run dev
echo.
pause

