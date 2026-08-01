# Job Portal Backup System

A comprehensive backup and restore system for your Job Portal application to prevent data loss.

## 🚀 Quick Start

### Create Your First Backup
```bash
# Using Artisan command
php artisan backup:create

# Using batch file (Windows)
backup.bat
```

### List Available Backups
```bash
php artisan backup:list
```

### Restore from Backup
```bash
# List backups first
php artisan backup:list

# Restore specific backup
php artisan backup:restore 2025-09-02_14-30-15
```

## 📋 Features

- ✅ **Database Backup**: Supports SQLite and MySQL
- ✅ **File Backup**: Backs up storage and public files
- ✅ **Compression**: Optional ZIP/TAR.GZ compression
- ✅ **Automatic Cleanup**: Removes old backups
- ✅ **Safety Backups**: Creates backup before restore
- ✅ **Manifest Files**: Detailed backup information
- ✅ **Cross-Platform**: Works on Windows, Linux, macOS

## 🛠️ Commands

### Create Backup
```bash
# Full backup (database + files)
php artisan backup:create

# Database only
php artisan backup:create --type=database

# Files only
php artisan backup:create --type=files

# Compressed backup
php artisan backup:create --compress

# Custom name
php artisan backup:create --name=my_backup

# Auto cleanup (delete backups older than 30 days)
php artisan backup:create --cleanup=30
```

### List Backups
```bash
# Basic list
php artisan backup:list

# Detailed information
php artisan backup:list --detailed
```

### Restore Backup
```bash
# Interactive restore (with confirmation)
php artisan backup:restore 2025-09-02_14-30-15

# Skip confirmation
php artisan backup:restore 2025-09-02_14-30-15 --confirm

# Database only
php artisan backup:restore 2025-09-02_14-30-15 --database-only

# Files only
php artisan backup:restore 2025-09-02_14-30-15 --files-only
```

## 📁 Backup Structure

```
storage/backups/
├── manifest_2025-09-02_14-30-15.json    # Backup manifest
├── database_2025-09-02_14-30-15.sqlite  # Database backup
├── files_2025-09-02_14-30-15.zip       # Files backup (optional)
└── .env_2025-09-02_14-30-15            # Environment backup
```

## 🔧 Configuration

### Environment Variables
Add these to your `.env` file:

```env
# Backup settings (optional)
BACKUP_RETENTION_DAYS=30
BACKUP_COMPRESSION=true
```

### Storage Directory
Backups are stored in `storage/backups/`. Make sure this directory is:
- Writable by the web server
- Included in your backup strategy
- Regularly monitored for disk space

## 📊 Backup Manifest

Each backup includes a JSON manifest with:
- Timestamp and creation date
- Database type and version info
- File list with sizes
- System information
- Laravel/PHP versions

Example manifest:
```json
{
  "timestamp": "2025-09-02_14-30-15",
  "created_at": "2025-09-02 14:30:15",
  "database_type": "sqlite",
  "laravel_version": "10.x",
  "php_version": "8.2",
  "backup_files": [...],
  "system_info": {...}
}
```

## 🛡️ Safety Features

### Pre-Restore Backup
Before any restore operation, the system automatically creates a backup of the current state.

### Confirmation Prompts
Restore operations require confirmation unless `--confirm` flag is used.

### Validation
- Checks backup file integrity
- Validates manifest files
- Ensures database compatibility

## 🔄 Automation

### Cron Job (Linux/Mac)
Add to crontab for daily backups:
```bash
# Daily backup at 2 AM
0 2 * * * cd /path/to/job-portal/backend && php artisan backup:create --cleanup=30
```

### Windows Task Scheduler
Create a task to run `backup.bat` daily.

### GitHub Actions (Example)
```yaml
name: Daily Backup
on:
  schedule:
    - cron: '0 2 * * *'
jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run backup
        run: php artisan backup:create --cleanup=30
```

## 🚨 Emergency Recovery

If you lose your database:

1. **Stop the application**
   ```bash
   # Stop Laravel server
   # Stop database server if using MySQL
   ```

2. **Identify the backup to restore**
   ```bash
   php artisan backup:list
   ```

3. **Restore from backup**
   ```bash
   php artisan backup:restore [timestamp] --confirm
   ```

4. **Verify the restore**
   ```bash
   php artisan tinker
   >>> App\Models\User::count()
   ```

5. **Restart the application**
   ```bash
   php artisan serve
   ```

## 📈 Monitoring

### Check Backup Status
```bash
# List recent backups
php artisan backup:list

# Check backup directory size
du -sh storage/backups/

# Count backup files
ls storage/backups/ | wc -l
```

### Backup Health Check
```bash
# Verify latest backup integrity
php artisan tinker
>>> $manifests = glob(storage_path('backups/manifest_*.json'))
>>> $latest = end($manifests)
>>> json_decode(file_get_contents($latest), true)
```

## 🐛 Troubleshooting

### Common Issues

#### "Permission denied" when creating backups
```bash
# Fix permissions
chmod -R 755 storage/
chown -R www-data:www-data storage/
```

#### MySQL backup fails
```bash
# Check MySQL credentials in .env
# Ensure mysqldump is installed
which mysqldump

# Test MySQL connection
php artisan tinker
>>> DB::connection()->getPdo()
```

#### Large backup files
```bash
# Use compression
php artisan backup:create --compress

# Exclude large files from backup
# Modify the backup command to skip certain directories
```

#### Restore fails
```bash
# Check backup file integrity
ls -la storage/backups/

# Verify manifest
cat storage/backups/manifest_[timestamp].json | jq .

# Check database connection
php artisan migrate:status
```

## 📚 Best Practices

### Regular Backups
- **Daily**: Full backups for critical data
- **Weekly**: Complete system backups
- **Monthly**: Long-term archival backups

### Backup Storage
- Store backups in multiple locations
- Use cloud storage (AWS S3, Google Cloud, etc.)
- Keep at least 3 months of backups
- Encrypt sensitive backups

### Testing
- Regularly test backup restoration
- Document restoration procedures
- Train team members on recovery process

### Security
- Encrypt backup files containing sensitive data
- Restrict access to backup files
- Use secure transfer methods for offsite backups

## 📞 Support

If you encounter issues:

1. Check the Laravel logs: `storage/logs/laravel.log`
2. Verify file permissions on `storage/backups/`
3. Test with a small backup first
4. Check database connectivity

## 🎯 Quick Reference

```bash
# Create backup
php artisan backup:create

# List backups
php artisan backup:list

# Restore backup
php artisan backup:restore [timestamp]

# Windows batch files
backup.bat    # Create backup
restore.bat   # Restore backup
```

---

**Remember**: Regular backups are your safety net. Better to have backups you don't need than to need backups you don't have! 🛡️