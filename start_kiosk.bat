@echo off
:: ==============================================================================
:: SCHID RFID Attendance Kiosk - Windows Auto-Start Script
:: ==============================================================================
title SCHID RFID Attendance Kiosk Launcher
color 0b

echo ====================================================================
echo   SCHID RFID ATTENDANCE KIOSK - AUTO LAUNCHER
echo ====================================================================
echo.

cd /d "%~dp0"

echo [1/3] Memeriksa status server lokal...
netstat -ano | findstr ":8000" >nul
if %errorlevel% neq 0 (
    echo [2/3] Menjalankan server PHP lokal...
    start /min "SCHID Server" php artisan serve --host=127.0.0.1 --port=8000
    timeout /t 3 /nobreak >nul
) else (
    echo [2/3] Server lokal sudah berjalan pada port 8000.
)

echo [3/3] Membuka Mode Kiosk Layar Penuh...
set KIOSK_URL=http://127.0.0.1:8000/attendance

:: Cari Google Chrome
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --kiosk --disable-pinch --overscroll-history-navigation=0 "%KIOSK_URL%"
    goto :done
)
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --kiosk --disable-pinch --overscroll-history-navigation=0 "%KIOSK_URL%"
    goto :done
)

:: Fallback ke Microsoft Edge
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --kiosk --edge-kiosk-type=fullscreen "%KIOSK_URL%"
    goto :done
)

:: Default browser
start "" "%KIOSK_URL%"

:done
echo.
echo ====================================================================
echo   KIOSK BERHASIL DIJALANKAN! Tekan ALT+F4 untuk menutup.
echo ====================================================================
