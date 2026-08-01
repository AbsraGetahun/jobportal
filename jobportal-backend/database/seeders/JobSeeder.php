<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Job;
use App\Models\Company;
use App\Models\User;

class JobSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing companies and users
        $companies = Company::all();
        $users = User::all();
        
        // If there are no companies or users, create some
        if ($companies->isEmpty()) {
            $companies = Company::factory()->count(5)->create();
        }
        
        if ($users->isEmpty()) {
            $users = User::factory()->count(5)->create();
        }
        
        // Create 20 sample jobs
        $hasCompanyId = \Illuminate\Support\Facades\Schema::hasColumn('job_listings', 'company_id');

        Job::factory()
            ->count(20)
            ->sequence(
                // Assign existing companies and users to jobs
                fn ($sequence) => array_merge(
                    ['employer_id' => $users->random()->id],
                    $hasCompanyId ? ['company_id' => $companies->random()->id] : []
                )
            )
            ->create();
    }
}