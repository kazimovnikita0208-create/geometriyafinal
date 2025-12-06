@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   Исправление Prisma (альтернативный метод)
echo ========================================
echo.

echo Очистка кэша Prisma...
rmdir /s /q %USERPROFILE%\.prisma 2>nul
echo ✓ Кэш очищен
echo.

echo Переустановка Prisma...
call npm uninstall prisma @prisma/client
call npm install prisma@latest @prisma/client@latest --save-exact
echo ✓ Prisma переустановлен
echo.

echo Попытка загрузки engines...
set PRISMA_ENGINES_MIRROR=https://prisma-builds.s3-eu-west-1.amazonaws.com
call npx prisma generate
echo.

echo Если загрузка снова зависла, попробуйте:
echo 1. Включить VPN
echo 2. Проверить антивирус
echo 3. Подождать - загрузка может быть медленной
echo.

pause

