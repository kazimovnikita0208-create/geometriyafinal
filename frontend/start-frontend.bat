@echo off
echo.
echo === Запуск Frontend ===
echo.
cd /d "%~dp0"

echo Очистка кэша Next.js...
if exist ".next" rmdir /s /q ".next"
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache"

echo.
echo Запуск сервера разработки...
echo Frontend будет доступен на http://localhost:3002
echo.
echo Нажмите Ctrl+C для остановки
echo.

npm run dev

