@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   Запуск Backend сервера Geometriya
echo ========================================
echo.
echo Сервер будет доступен на: http://localhost:3001
echo.
echo Для остановки сервера нажмите Ctrl+C
echo.

call npm run dev

