<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

class BackupDatabase extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backup:create
                            {--type=all : Type of backup (database, files, all)}
                            {--name= : Custom backup name}
                            {--compress : Compress the backup}
                            {--cleanup=30 : Delete backups older than X days}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a comprehensive backup of the job portal database and files';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🚀 Starting Job Portal Backup...');

        $type = $this->option('type');
        $customName = $this->option('name');
        $compress = $this->option('compress');
        $cleanupDays = $this->option('cleanup');

        $timestamp = $customName ?: date('Y-m-d_H-i-s');
        $backupDir = storage_path('backups');

        // Ensure backup directory exists
        if (!File::exists($backupDir)) {
            File::makeDirectory($backupDir, 0755, true);
        }

        $this->info("📅 Backup timestamp: {$timestamp}");
        $this->info("📁 Backup directory: {$backupDir}");

        try {
            $backupFiles = [];

            // Database backup
            if ($type === 'all' || $type === 'database') {
                $dbFile = $this->backupDatabase($backupDir, $timestamp);
                if ($dbFile) {
                    $backupFiles[] = $dbFile;
                }
            }

            // Files backup
            if ($type === 'all' || $type === 'files') {
                $filesArchive = $this->backupFiles($backupDir, $timestamp, $compress);
                if ($filesArchive) {
                    $backupFiles[] = $filesArchive;
                }
            }

            // Create manifest
            $manifestFile = $this->createManifest($backupDir, $timestamp, $backupFiles);
            $backupFiles[] = $manifestFile;

            // Cleanup old backups
            if ($cleanupDays > 0) {
                $this->cleanupOldBackups($backupDir, $cleanupDays);
            }

            $this->info("\n✅ Backup completed successfully!");
            $this->info("📦 Backup files created:");
            foreach ($backupFiles as $file) {
                $this->line("   • " . basename($file));
            }

            $this->info("\n💡 To restore this backup, use:");
            $this->info("   php artisan backup:restore {$timestamp}");

        } catch (\Exception $e) {
            $this->error("❌ Backup failed: " . $e->getMessage());
            return 1;
        }

        return 0;
    }

    /**
     * Backup the database
     */
    private function backupDatabase($backupDir, $timestamp)
    {
        $this->info("📋 Backing up database...");

        $connection = config('database.default');
        $backupPath = "{$backupDir}/database_{$timestamp}";

        switch ($connection) {
            case 'mysql':
            case 'mariadb':
                $backupFile = $backupPath . '.sql';
                $config = config('database.connections.mysql');

                $command = sprintf(
                    'mysqldump --user=%s --password=%s --host=%s %s > %s',
                    escapeshellarg($config['username']),
                    escapeshellarg($config['password']),
                    escapeshellarg($config['host']),
                    escapeshellarg($config['database']),
                    escapeshellarg($backupFile)
                );

                exec($command, $output, $returnCode);

                if ($returnCode !== 0 || !File::exists($backupFile)) {
                    throw new \Exception("MySQL backup failed");
                }

                $size = File::size($backupFile);
                $this->info("✅ Database backup created: " . basename($backupFile));
                $this->info("   Size: " . $this->formatBytes($size));

                return $backupFile;

            default:
                $this->warn("⚠️  Unsupported database type: {$connection}");
                return null;
        }
    }

    /**
     * Backup files and uploads
     */
    private function backupFiles($backupDir, $timestamp, $compress)
    {
        $this->info("📋 Backing up files...");

        $storagePath = storage_path('app');
        $publicPath = public_path();

        if (!File::exists($storagePath) && !File::exists($publicPath)) {
            $this->warn("⚠️  No files to backup");
            return null;
        }

        $backupFile = "{$backupDir}/files_{$timestamp}";

        if ($compress) {
            $backupFile .= '.tar.gz';
            $this->createTarArchive($storagePath, $publicPath, $backupFile);
        } else {
            $backupFile .= '.zip';
            $this->createZipArchive($storagePath, $publicPath, $backupFile);
        }

        if (File::exists($backupFile)) {
            $size = File::size($backupFile);
            $this->info("✅ Files backup created: " . basename($backupFile));
            $this->info("   Size: " . $this->formatBytes($size));
            return $backupFile;
        }

        return null;
    }

    /**
     * Create TAR archive
     */
    private function createTarArchive($storagePath, $publicPath, $outputFile)
    {
        $tempDir = storage_path('temp_backup_' . time());
        File::makeDirectory($tempDir);

        // Copy files to temp directory
        if (File::exists($storagePath)) {
            File::copyDirectory($storagePath, $tempDir . '/storage');
        }
        if (File::exists($publicPath)) {
            File::copyDirectory($publicPath, $tempDir . '/public');
        }

        // Create tar archive
        $command = sprintf(
            'tar -czf %s -C %s .',
            escapeshellarg($outputFile),
            escapeshellarg($tempDir)
        );

        exec($command, $output, $returnCode);

        // Cleanup
        File::deleteDirectory($tempDir);

        return $returnCode === 0;
    }

    /**
     * Create ZIP archive
     */
    private function createZipArchive($storagePath, $publicPath, $outputFile)
    {
        $zip = new \ZipArchive();

        if ($zip->open($outputFile, \ZipArchive::CREATE) === true) {
            $this->addDirectoryToZip($zip, $storagePath, 'storage');
            $this->addDirectoryToZip($zip, $publicPath, 'public');
            $zip->close();
            return true;
        }

        return false;
    }

    /**
     * Add directory to ZIP archive
     */
    private function addDirectoryToZip($zip, $directory, $prefix = '')
    {
        if (!File::exists($directory)) {
            return;
        }

        $files = File::allFiles($directory);

        foreach ($files as $file) {
            $relativePath = $prefix . '/' . $file->getRelativePathname();
            $zip->addFile($file->getRealPath(), $relativePath);
        }
    }

    /**
     * Create backup manifest
     */
    private function createManifest($backupDir, $timestamp, $backupFiles)
    {
        $manifestFile = "{$backupDir}/manifest_{$timestamp}.json";

        $manifest = [
            'timestamp' => $timestamp,
            'created_at' => now()->toDateTimeString(),
            'type' => $this->option('type'),
            'database_type' => config('database.default'),
            'laravel_version' => app()->version(),
            'php_version' => PHP_VERSION,
            'backup_files' => array_map(function($file) {
                return [
                    'filename' => basename($file),
                    'path' => $file,
                    'size' => File::size($file),
                    'size_human' => $this->formatBytes(File::size($file))
                ];
            }, $backupFiles),
            'system_info' => [
                'os' => PHP_OS,
                'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
                'hostname' => gethostname(),
            ]
        ];

        File::put($manifestFile, json_encode($manifest, JSON_PRETTY_PRINT));

        $this->info("✅ Backup manifest created");
        return $manifestFile;
    }

    /**
     * Cleanup old backups
     */
    private function cleanupOldBackups($backupDir, $days)
    {
        $this->info("🧹 Cleaning up backups older than {$days} days...");

        $files = File::files($backupDir);
        $deletedCount = 0;

        foreach ($files as $file) {
            try {
                $fileTime = $file->getCTime();
                $fileAge = now()->diffInDays(\Carbon\Carbon::createFromTimestamp($fileTime));
                if ($fileAge > $days) {
                    File::delete($file->getRealPath());
                    $deletedCount++;
                }
            } catch (\Exception $e) {
                $this->warn("⚠️  Could not check age of file: {$file->getFilename()}");
            }
        }

        if ($deletedCount > 0) {
            $this->info("🗑️  Deleted {$deletedCount} old backup files");
        } else {
            $this->info("✨ No old backups to clean up");
        }
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
}
