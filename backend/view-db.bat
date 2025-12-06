@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   Prisma Studio - Просмотр БД
echo ========================================
echo.
echo Запуск Prisma Studio...
echo.
echo Откройте в браузере: http://localhost:5555
echo.
echo Для выхода нажмите Ctrl+C
echo.

call npx prisma studio

