@echo off
echo ========================================
echo   Запуск ngrok для Telegram Mini App
echo ========================================
echo.

REM Проверяем, есть ли ngrok в текущей папке
if exist "ngrok.exe" (
    echo ✅ Найден ngrok.exe в текущей папке
    echo.
    echo Запуск ngrok для порта 3002...
    echo.
    echo ⚠️  ВАЖНО: Если появится ошибка ERR_NGROK_9040,
    echo    зарегистрируйтесь на https://dashboard.ngrok.com/signup
    echo    и получите новый токен!
    echo.
    pause
    ngrok.exe http 3002
    goto :end
)

REM Проверяем, есть ли ngrok в PATH
where ngrok >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Найден ngrok в PATH
    echo.
    echo Запуск ngrok для порта 3002...
    echo.
    pause
    ngrok http 3002
    goto :end
)

REM Если ngrok не найден
echo.
echo ❌ ОШИБКА: ngrok не найден!
echo.
echo Установите ngrok одним из способов:
echo   1. Скачайте с https://ngrok.com/download
echo   2. Распакуйте ngrok.exe в папку проекта
echo   3. Или добавьте ngrok в PATH
echo.
echo Подробная инструкция: УСТАНОВКА_NGROK.md
echo.
pause

:end

