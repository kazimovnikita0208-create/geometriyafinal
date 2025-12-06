@echo off
echo.
echo === Очистка кэша Next.js и перезапуск ===
echo.

REM Останавливаем процессы Node.js (только фронтенд)
echo Попытка остановить процессы Next.js...
taskkill /IM node.exe /F /FI "WINDOWTITLE eq Next.js" > nul 2>&1
echo.

REM Удаляем папки кэша Next.js
echo Удаление папки .next...
if exist ".next" (
    rmdir /s /q ".next"
    echo .next удалена.
) else (
    echo .next не найдена.
)

echo Удаление кэша webpack...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo node_modules\.cache удалена.
) else (
    echo node_modules\.cache не найдена.
)
echo.

echo Кэш очищен. Теперь перезапустите сервер разработки: npm run dev
echo.
pause
