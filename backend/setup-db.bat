@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   Инициализация базы данных Geometriya
echo ========================================
echo.

echo [1/4] Генерация Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ОШИБКА при генерации Prisma Client!
    pause
    exit /b 1
)
echo ✓ Prisma Client сгенерирован
echo.

echo [2/4] Создание базы данных...
call npx prisma db push --accept-data-loss
if %errorlevel% neq 0 (
    echo ОШИБКА при создании базы данных!
    pause
    exit /b 1
)
echo ✓ База данных создана
echo.

echo [3/4] Заполнение базы начальными данными...
call node prisma/seed.js
if %errorlevel% neq 0 (
    echo ОШИБКА при заполнении базы данных!
    pause
    exit /b 1
)
echo ✓ База данных заполнена
echo.

echo [4/4] Запуск Prisma Studio...
echo.
echo Откройте браузер: http://localhost:5555
echo Для выхода нажмите Ctrl+C
echo.
call npx prisma studio

pause

