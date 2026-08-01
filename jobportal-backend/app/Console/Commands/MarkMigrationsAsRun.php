<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class MarkMigrationsAsRun extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'migrations:mark-as-run';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Mark pending migrations as run';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        try {
            // Check if migrations table exists (connection-agnostic)
            $tables = DB::select("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'migrations'");
            if (count($tables) == 0) {
                $this->error("Migrations table does not exist");
                return 1;
            }

            $this->info("Migrations table exists");

            // Migrations to mark as run
            $migrations = [
                '2025_08_10_165341_create_jobs_table',
                '2025_08_10_165655_create_applications_table',
                '2025_08_10_170128_create_companies_table'
            ];

            foreach ($migrations as $migration) {
                // Check if migration is already marked as run
                $exists = DB::select("SELECT * FROM migrations WHERE migration = ?", [$migration]);
                if (count($exists) == 0) {
                    // Get the next batch number
                    $maxBatchResult = DB::select("SELECT MAX(batch) as max_batch FROM migrations");
                    $maxBatch = $maxBatchResult[0]->max_batch ?? 0;
                    $nextBatch = $maxBatch + 1;

                    // Insert the migration record
                    DB::insert("INSERT INTO migrations (migration, batch) VALUES (?, ?)", [$migration, $nextBatch]);
                    $this->info("Marked migration $migration as run in batch $nextBatch");
                } else {
                    $this->info("Migration $migration is already marked as run");
                }
            }

            $this->info("Done");
            return 0;
        } catch (\Exception $e) {
            $this->error("Error: " . $e->getMessage());
            return 1;
        }
    }
}
