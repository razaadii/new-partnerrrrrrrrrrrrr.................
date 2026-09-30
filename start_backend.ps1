# start_backend.ps1
# SlotB Partner Backend Server Launcher
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "      SlotB Partner App - PHP + MySQL Backend Server     " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

$phpPath = "php"
$hasPhp = (Get-Command php -ErrorAction SilentlyContinue)

if (-not $hasPhp) {
    if (Test-Path "C:\xampp\php\php.exe") {
        $phpPath = "C:\xampp\php\php.exe"
    } elseif (Test-Path "C:\laragon\bin\php\*\php.exe") {
        $phpPath = (Get-ChildItem "C:\laragon\bin\php\*\php.exe" | Select-Object -First 1).FullName
    } else {
        Write-Host "[ERROR] PHP executable was not found on your system." -ForegroundColor Red
        Write-Host "Please ensure XAMPP is installed or add PHP to your environment PATH." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "[OK] Using PHP: $phpPath" -ForegroundColor Green
Write-Host "[OK] Document Root: backend" -ForegroundColor Green
Write-Host "[OK] Router: backend/router.php" -ForegroundColor Green
Write-Host ""
Write-Host "Starting SlotB API server on http://localhost:8000 ..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server at any time."
Write-Host ""
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "Demo Credentials:" -ForegroundColor White
Write-Host "  - Gym Partner:     ID: 123@gym    Password: 123" -ForegroundColor White
Write-Host "  - Service Partner: ID: 123@aadii  Password: 123" -ForegroundColor White
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

& $phpPath -S 0.0.0.0:8000 -t backend backend/router.php
