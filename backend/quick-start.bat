@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   Быстрый старт (без БД)
echo ========================================
echo.
echo ВНИМАНИЕ: Этот режим запускает сервер без базы данных
echo Prisma Studio работать не будет, но API endpoints будут доступны
echo.

echo Запуск backend сервера...
echo Сервер будет доступен: http://localhost:3001
echo.
echo Для остановки нажмите Ctrl+C
echo.

set SKIP_DB=true
call npm run dev

