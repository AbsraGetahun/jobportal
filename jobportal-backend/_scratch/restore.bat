@echo off
REM Job Portal Restore Script
REM This script restores your job portal from a backup

echo 🔄 Job Portal Restore Script
echo.

cd /d "%~dp0"

REM List available backups
echo 📦 Available backups:
php artisan backup:list
echo.

REM Ask for timestamp
set /p timestamp="Enter backup timestamp to restore (or 'cancel' to exit): "

if "%timestamp%"=="cancel" (
    echo ❌ Restore cancelled
    goto :end
)

if "%timestamp%"=="" (
    echo ❌ No timestamp provided
    goto :end
)

REM Confirm restore
echo.
echo ⚠️  WARNING: This will overwrite your current data!
set /p confirm="Are you sure you want to restore from %timestamp%? (yes/no): "

if /i not "%confirm%"=="yes" (
    echo ❌ Restore cancelled
    goto :end
)

REM Perform restore
echo.
echo 🔄 Starting restore from backup: %timestamp%
php artisan backup:restore %timestamp% --confirm

echo.
echo ✅ Restore completed!
echo.

:end
pause