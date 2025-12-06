@echo off
echo Очистка кэша Next.js...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache
echo.
echo ✅ Кэш очищен!
echo.
echo Теперь перезапустите сервер:
echo   npm run dev
pause

