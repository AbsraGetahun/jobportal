@echo off
REM Job Portal Backup Script
REM This script creates a complete backup of your job portal

echo 🚀 Starting Job Portal Backup...
echo.

cd /d "%~dp0"

REM Create full backup
php artisan backup:create --type=all --cleanup=30

echo.
echo ✅ Backup completed!
echo.
echo 💡 To see all backups: php artisan backup:list
echo 💡 To restore backup: php artisan backup:restore [timestamp]
echo.
pause