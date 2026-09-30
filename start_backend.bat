@echo off
title SlotB Partner Backend Server
echo =========================================================
echo       SlotB Partner App - PHP + MySQL Backend Server
echo =========================================================
echo.

set PHP_EXE=php
where php >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\xampp\php\php.exe" (
        set PHP_EXE=C:\xampp\php\php.exe
    ) else if exist "C:\laragon\bin\php\php.exe" (
        set PHP_EXE=C:\laragon\bin\php\php.exe
    ) else (
        echo [ERROR] PHP executable was not found on your system.
        echo Please ensure XAMPP or PHP is installed.
        echo (Checked: PATH, C:\xampp\php\php.exe)
        pause
        exit /b 1
    )
)

echo [OK] Using PHP: %PHP_EXE%
echo [OK] Document root: backend
echo [OK] Router: backend/router.php
echo.
echo Starting SlotB API server on http://localhost:8000 ...
echo Press Ctrl+C to stop the server at any time.
echo.
echo =========================================================
echo Demo Credentials:
echo   - Gym Partner:     ID: 123@gym    Password: 123
echo   - Service Partner: ID: 123@aadii  Password: 123
echo =========================================================
echo.

%PHP_EXE% -S 0.0.0.0:8000 -t backend backend/router.php
pause
