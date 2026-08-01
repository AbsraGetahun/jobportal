<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class RestoreDatabase extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backup:restore
                            {timestamp : Timestamp of the backup to restore}
                            {--confirm : Skip confirmation prompt}
                            {--database-only : Only restore database, skip files}
                            {--files-only : Only restore files, skip database}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Restore database and files from a backup';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $timestamp = $this->argument('timestamp');
        $confirm = $this->option('confirm');
        $databaseOnly = $this->option('database-only');
        $filesOnly = $this->option('files-only');

        $backupDir = storage_path('backups');
        $manifestFile = "{$backupDir}/manifest_{$timestamp}.json";

        // Check if backup exists
        if (!File::exists($manifestFile)) {
            $this->error("❌ Backup not found: {$timestamp}");
            $this->info("💡 Available backups:");
            $this->call('backup:list');
            return 1;
        }

        // Read manifest
        $manifest = json_decode(File::get($manifestFile), true);
        if (!$manifest) {
            $this->error("❌ Invalid backup manifest");
            return 1;
        }

        $this->info("🔄 Restoring backup: {$timestamp}");
        $this->info("📅 Created: {$manifest['created_at']}");
        $this->info("🗄️  Database: {$manifest['database_type']}");

        // Show backup contents
        $this->info("\n📦 Backup contents:");
        foreach ($manifest['backup_files'] as $file) {
            $this->line("   • {$file['filename']} ({$file['size_human']})");
        }

        // Confirmation
        if (!$confirm) {
            $this->warn("\n⚠️  WARNING: This will overwrite current data!");
            if (!$this->confirm('Are you sure you want to proceed?')) {
                $this->info('❌ Restore cancelled');
                return 0;
            }
        }

        try {
            // Create backup of current state before restore
            $this->info("🛡️  Creating safety backup of current state...");
            $this->call('backup:create', [
                '--name' => 'pre_restore_' . date('Y-m-d_H-i-s'),
                '--type' => 'database'
            ]);

            // Restore database
            if (!$filesOnly) {
                $this->restoreDatabase($manifest, $backupDir);
            }

            // Restore files
            if (!$databaseOnly) {
                $this->restoreFiles($manifest, $backupDir);
            }

            $this->info("\n✅ Restore completed successfully!");
            $this->info("🎉 Your data has been restored from backup: {$timestamp}");

            // Clear cache
            $this->call('cache:clear');
            $this->call('config:clear');

        } catch (\Exception $e) {
            $this->error("❌ Restore failed: " . $e->getMessage());
            $this->info("💡 A safety backup was created before the failed restore");
            return 1;
        }

        return 0;
    }

    /**
     * Restore database from backup
     */
    private function restoreDatabase($manifest, $backupDir)
    {
        $this->info("📋 Restoring database...");

        $connection = $manifest['database_type'];
        $timestamp = $manifest['timestamp'];

            switch ($connection) {
                case 'mysql':
                case 'mariadb':
                    $backupFile = "{$backupDir}/database_{$timestamp}.sql";

                    if (!File::exists($backupFile)) {
                        throw new \Exception("Database backup file not found: {$backupFile}");
                    }

                    $config = config('database.connections.mysql');

                    // Create backup of current database
                    $currentBackupFile = "{$backupDir}/current_database_backup.sql";
                    $dumpCommand = sprintf(
                        'mysqldump --user=%s --password=%s --host=%s %s > %s',
                        escapeshellarg($config['username']),
                        escapeshellarg($config['password']),
                        escapeshellarg($config['host']),
                        escapeshellarg($config['database']),
                        escapeshellarg($currentBackupFile)
                    );
                    exec($dumpCommand);

                    // Restore from backup
                    $restoreCommand = sprintf(
                        'mysql --user=%s --password=%s --host=%s %s < %s',
                        escapeshellarg($config['username']),
                        escapeshellarg($config['password']),
                        escapeshellarg($config['host']),
                        escapeshellarg($config['database']),
                        escapeshellarg($backupFile)
                    );

                    exec($restoreCommand, $output, $returnCode);

                    if ($returnCode !== 0) {
                        throw new \Exception("MySQL restore failed");
                    }

                    $this->info("✅ MySQL database restored");
                    break;

                default:
                    $this->warn("⚠️  Unsupported database type: {$connection}");
            }
    }

    /**
     * Restore files from backup
     */
    private function restoreFiles($manifest, $backupDir)
    {
        $this->info("📋 Restoring files...");

        $timestamp = $manifest['timestamp'];

        // Look for files backup
        $tarFile = "{$backupDir}/files_{$timestamp}.tar.gz";
        $zipFile = "{$backupDir}/files_{$timestamp}.zip";

        $backupFile = null;
        if (File::exists($tarFile)) {
            $backupFile = $tarFile;
            $this->restoreFromTar($backupFile);
        } elseif (File::exists($zipFile)) {
            $backupFile = $zipFile;
            $this->restoreFromZip($backupFile);
        } else {
            $this->warn("⚠️  No files backup found, skipping files restore");
            return;
        }

        $this->info("✅ Files restored from backup");
    }

    /**
     * Restore from TAR archive
     */
    private function restoreFromTar($tarFile)
    {
        $tempDir = storage_path('temp_restore_' . time());
        File::makeDirectory($tempDir);

        // Extract tar archive
        $command = sprintf(
            'tar -xzf %s -C %s',
            escapeshellarg($tarFile),
            escapeshellarg($tempDir)
        );

        exec($command, $output, $returnCode);

        if ($returnCode !== 0) {
            File::deleteDirectory($tempDir);
            throw new \Exception("Failed to extract TAR archive");
        }

        // Copy files to their destinations
        $this->copyRestoredFiles($tempDir);

        // Cleanup
        File::deleteDirectory($tempDir);
    }

    /**
     * Restore from ZIP archive
     */
    private function restoreFromZip($zipFile)
    {
        $tempDir = storage_path('temp_restore_' . time());
        File::makeDirectory($tempDir);

        $zip = new \ZipArchive();

        if ($zip->open($zipFile) === true) {
            $zip->extractTo($tempDir);
            $zip->close();

            // Copy files to their destinations
            $this->copyRestoredFiles($tempDir);

            // Cleanup
            File::deleteDirectory($tempDir);
        } else {
            File::deleteDirectory($tempDir);
            throw new \Exception("Failed to extract ZIP archive");
        }
    }

    /**
     * Copy restored files to their proper locations
     */
    private function copyRestoredFiles($tempDir)
    {
        $storageSource = $tempDir . '/storage';
        $publicSource = $tempDir . '/public';

        // Restore storage files
        if (File::exists($storageSource)) {
            $storageDest = storage_path('app');
            if (File::exists($storageDest)) {
                File::deleteDirectory($storageDest);
            }
            File::copyDirectory($storageSource, $storageDest);
        }

        // Restore public files
        if (File::exists($publicSource)) {
            $publicDest = public_path();
            // Be careful not to overwrite critical files
            $this->copyDirectorySelective($publicSource, $publicDest, ['index.php', 'web.config']);
        }
    }

    /**
     * Copy directory selectively, excluding certain files
     */
    private function copyDirectorySelective($source, $destination, $exclude = [])
    {
        $files = File::allFiles($source);

        foreach ($files as $file) {
            $relativePath = $file->getRelativePathname();
            $filename = basename($relativePath);

            if (!in_array($filename, $exclude)) {
                $destPath = $destination . '/' . $relativePath;
                $destDir = dirname($destPath);

                if (!File::exists($destDir)) {
                    File::makeDirectory($destDir, 0755, true);
                }

                File::copy($file->getRealPath(), $destPath);
            }
        }
    }
}
