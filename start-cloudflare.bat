@echo off
echo ========================================
echo   Запуск Cloudflare Tunnel (альтернатива ngrok)
echo ========================================
echo.

REM Проверяем, установлен ли cloudflared
where cloudflared >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Cloudflared найден
    echo.
    echo Запуск туннеля для порта 3002...
    echo.
    cloudflared tunnel --url http://localhost:3002
    goto :end
)

echo.
echo ❌ Cloudflared не установлен!
echo.
echo Установка через winget:
echo   winget install --id Cloudflare.cloudflared
echo.
echo Или скачайте с: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
echo.
pause

:end

