@echo off
chcp 65001 >nul
cls
echo.
echo ========================================
echo   Очистка и переустановка зависимостей
echo ========================================
echo.

echo Остановка всех процессов Node.js...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM nodemon.exe 2>nul
timeout /t 2 /nobreak >nul
echo ✅ Процессы остановлены
echo.

echo Удаление node_modules...
if exist node_modules (
    rmdir /s /q node_modules
    echo ✅ node_modules удален
) else (
    echo ⚠️  node_modules не найден
)
echo.

echo Удаление package-lock.json...
if exist package-lock.json (
    del /f package-lock.json
    echo ✅ package-lock.json удален
) else (
    echo ⚠️  package-lock.json не найден
)
echo.

echo Очистка npm кэша...
call npm cache clean --force
echo ✅ Кэш очищен
echo.

echo Установка зависимостей...
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ❌ ОШИБКА при установке зависимостей!
    echo.
    echo Попробуйте:
    echo 1. Закрыть все окна VS Code и терминалы
    echo 2. Перезагрузить компьютер
    echo 3. Запустить этот скрипт снова
    echo.
    pause
    exit /b 1
)
echo ✅ Зависимости установлены
echo.

echo.
echo 🎉 Готово! Теперь запустите init-backend.bat
echo.
pause

