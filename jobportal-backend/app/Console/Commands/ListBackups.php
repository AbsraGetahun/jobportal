<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class ListBackups extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backup:list
                            {--detailed : Show detailed information about each backup}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'List all available backups';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $backupDir = storage_path('backups');

        if (!File::exists($backupDir)) {
            $this->info("📁 No backups directory found. Create your first backup with:");
            $this->info("   php artisan backup:create");
            return 0;
        }

        $manifests = glob("{$backupDir}/manifest_*.json");

        if (empty($manifests)) {
            $this->info("📁 No backups found. Create your first backup with:");
            $this->info("   php artisan backup:create");
            return 0;
        }

        $backups = [];
        foreach ($manifests as $manifest) {
            $data = json_decode(File::get($manifest), true);
            if ($data) {
                $backups[] = $data;
            }
        }

        // Sort by timestamp (newest first)
        usort($backups, function($a, $b) {
            return strtotime($b['timestamp']) - strtotime($a['timestamp']);
        });

        $this->info("📦 Available Backups");
        $this->info(str_repeat("=", 80));

        $detailed = $this->option('detailed');

        foreach ($backups as $backup) {
            $this->info("🔄 Backup: {$backup['timestamp']}");
            $this->line("   📅 Created: {$backup['created_at']}");
            $this->line("   🗄️  Database: {$backup['database_type']}");
            $this->line("   📊 Files: " . count($backup['backup_files']));

            // Calculate total size
            $totalSize = 0;
            foreach ($backup['backup_files'] as $file) {
                $totalSize += $file['size'];
            }
            $this->line("   💾 Total Size: " . $this->formatBytes($totalSize));

            if ($detailed) {
                $this->line("   🖥️  System: {$backup['system_info']['os']} - {$backup['system_info']['server']}");
                $this->line("   🔧 Laravel: {$backup['laravel_version']} | PHP: {$backup['php_version']}");
                $this->line("   📁 Files:");
                foreach ($backup['backup_files'] as $file) {
                    $this->line("      • {$file['filename']} ({$file['size_human']})");
                }
            }

            $this->line("   🔙 Restore: php artisan backup:restore {$backup['timestamp']}");
            $this->line("");
        }

        $this->info("💡 Commands:");
        $this->line("   Create backup: php artisan backup:create");
        $this->line("   Restore backup: php artisan backup:restore <timestamp>");
        $this->line("   Detailed list: php artisan backup:list --detailed");
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
