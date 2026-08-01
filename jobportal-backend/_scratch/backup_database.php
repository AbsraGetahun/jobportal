<?php
/**
 * Job Portal Database Backup Script
 * Supports both SQLite and MySQL databases
 */

require_once 'vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DatabaseBackup
{
    private $backupDir;
    private $timestamp;

    public function __construct()
    {
        $this->backupDir = __DIR__ . '/backups';
        $this->timestamp = date('Y-m-d_H-i-s');

        // Ensure backup directory exists
        if (!is_dir($this->backupDir)) {
            mkdir($this->backupDir, 0755, true);
        }
    }

    /**
     * Create a complete database backup
     */
    public function createBackup()
    {
        echo "🚀 Starting database backup...\n";
        echo "📅 Timestamp: {$this->timestamp}\n\n";

        $connection = config('database.default');
        echo "🔌 Database Connection: {$connection}\n";

        try {
            switch ($connection) {
                case 'sqlite':
                    $this->backupSQLite();
                    break;
                case 'mysql':
                case 'mariadb':
                    $this->backupMySQL();
                    break;
                default:
                    throw new Exception("Unsupported database connection: {$connection}");
            }

            // Backup additional data
            $this->backupStorageFiles();
            $this->backupEnvironmentConfig();

            // Create backup manifest
            $this->createBackupManifest();

            echo "\n✅ Database backup completed successfully!\n";
            echo "📁 Backup location: {$this->backupDir}\n";

        } catch (Exception $e) {
            echo "\n❌ Backup failed: " . $e->getMessage() . "\n";
            exit(1);
        }
    }

    /**
     * Backup SQLite database
     */
    private function backupSQLite()
    {
        $dbPath = database_path('database.sqlite');
        $backupPath = "{$this->backupDir}/database_{$this->timestamp}.sqlite";

        if (!file_exists($dbPath)) {
            throw new Exception("SQLite database file not found: {$dbPath}");
        }

        echo "📋 Backing up SQLite database...\n";

        // Create a copy of the database file
        if (copy($dbPath, $backupPath)) {
            $originalSize = filesize($dbPath);
            $backupSize = filesize($backupPath);

            echo "✅ SQLite backup created: " . basename($backupPath) . "\n";
            echo "📊 Original size: " . $this->formatBytes($originalSize) . "\n";
            echo "📊 Backup size: " . $this->formatBytes($backupSize) . "\n";

            return $backupPath;
        } else {
            throw new Exception("Failed to copy SQLite database file");
        }
    }

    /**
     * Backup MySQL database
     */
    private function backupMySQL()
    {
        $config = config('database.connections.mysql');
        $backupPath = "{$this->backupDir}/database_{$this->timestamp}.sql";

        echo "📋 Backing up MySQL database...\n";

        // Use mysqldump command
        $command = sprintf(
            'mysqldump --user=%s --password=%s --host=%s %s > %s',
            escapeshellarg($config['username']),
            escapeshellarg($config['password']),
            escapeshellarg($config['host']),
            escapeshellarg($config['database']),
            escapeshellarg($backupPath)
        );

        exec($command, $output, $returnCode);

        if ($returnCode === 0 && file_exists($backupPath)) {
            $backupSize = filesize($backupPath);
            echo "✅ MySQL backup created: " . basename($backupPath) . "\n";
            echo "📊 Backup size: " . $this->formatBytes($backupSize) . "\n";

            return $backupPath;
        } else {
            throw new Exception("MySQL backup failed. Return code: {$returnCode}");
        }
    }

    /**
     * Backup storage files (uploads, etc.)
     */
    private function backupStorageFiles()
    {
        $storagePath = storage_path('app');
        $backupPath = "{$this->backupDir}/storage_{$this->timestamp}.tar.gz";

        if (!is_dir($storagePath)) {
            echo "⚠️  Storage directory not found, skipping storage backup\n";
            return;
        }

        echo "📋 Backing up storage files...\n";

        // Create tar.gz archive of storage directory
        $command = sprintf(
            'tar -czf %s -C %s .',
            escapeshellarg($backupPath),
            escapeshellarg($storagePath)
        );

        exec($command, $output, $returnCode);

        if ($returnCode === 0 && file_exists($backupPath)) {
            $backupSize = filesize($backupPath);
            echo "✅ Storage backup created: " . basename($backupPath) . "\n";
            echo "📊 Backup size: " . $this->formatBytes($backupSize) . "\n";
        } else {
            echo "⚠️  Storage backup failed, but continuing...\n";
        }
    }

    /**
     * Backup environment configuration
     */
    private function backupEnvironmentConfig()
    {
        $envPath = __DIR__ . '/.env';
        $backupPath = "{$this->backupDir}/.env_{$this->timestamp}";

        if (file_exists($envPath)) {
            copy($envPath, $backupPath);
            echo "✅ Environment config backed up\n";
        }
    }

    /**
     * Create backup manifest file
     */
    private function createBackupManifest()
    {
        $manifestPath = "{$this->backupDir}/backup_manifest_{$this->timestamp}.json";

        $manifest = [
            'timestamp' => $this->timestamp,
            'created_at' => date('Y-m-d H:i:s'),
            'database_type' => config('database.default'),
            'laravel_version' => app()->version(),
            'php_version' => PHP_VERSION,
            'backup_files' => $this->getBackupFiles(),
            'system_info' => [
                'os' => PHP_OS,
                'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
            ]
        ];

        file_put_contents($manifestPath, json_encode($manifest, JSON_PRETTY_PRINT));
        echo "✅ Backup manifest created\n";
    }

    /**
     * Get list of backup files created
     */
    private function getBackupFiles()
    {
        $files = [];
        $pattern = "{$this->backupDir}/*{$this->timestamp}*";

        foreach (glob($pattern) as $file) {
            $files[] = [
                'filename' => basename($file),
                'path' => $file,
                'size' => filesize($file),
                'size_human' => $this->formatBytes(filesize($file))
            ];
        }

        return $files;
    }

    /**
     * Format bytes to human readable format
     */
    private function formatBytes($bytes)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);

        return round($bytes, 2) . ' ' . $units[$pow];
    }

    /**
     * List all available backups
     */
    public function listBackups()
    {
        echo "📁 Available backups:\n";
        echo str_repeat("=", 60) . "\n";

        $backups = [];
        $manifests = glob("{$this->backupDir}/backup_manifest_*.json");

        foreach ($manifests as $manifest) {
            $data = json_decode(file_get_contents($manifest), true);
            $backups[] = $data;
        }

        // Sort by timestamp (newest first)
        usort($backups, function($a, $b) {
            return strtotime($b['timestamp']) - strtotime($a['timestamp']);
        });

        if (empty($backups)) {
            echo "No backups found.\n";
            return;
        }

        foreach ($backups as $backup) {
            echo "📦 Backup: {$backup['timestamp']}\n";
            echo "   Created: {$backup['created_at']}\n";
            echo "   Database: {$backup['database_type']}\n";
            echo "   Files: " . count($backup['backup_files']) . "\n";

            $totalSize = 0;
            foreach ($backup['backup_files'] as $file) {
                $totalSize += $file['size'];
            }
            echo "   Total Size: " . $this->formatBytes($totalSize) . "\n";
            echo "\n";
        }
    }
}

// Main execution
if ($argc < 2) {
    echo "Usage: php backup_database.php <command>\n";
    echo "Commands:\n";
    echo "  backup    - Create a new backup\n";
    echo "  list      - List all available backups\n";
    echo "  help      - Show this help message\n";
    exit(1);
}

$command = $argv[1];
$backup = new DatabaseBackup();

switch ($command) {
    case 'backup':
        $backup->createBackup();
        break;
    case 'list':
        $backup->listBackups();
        break;
    case 'help':
    default:
        echo "Job Portal Database Backup Tool\n\n";
        echo "Usage: php backup_database.php <command>\n\n";
        echo "Commands:\n";
        echo "  backup    - Create a new database backup\n";
        echo "  list      - List all available backups\n";
        echo "  help      - Show this help message\n\n";
        echo "Examples:\n";
        echo "  php backup_database.php backup\n";
        echo "  php backup_database.php list\n";
        break;
}