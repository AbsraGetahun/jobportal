<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\JobView;
use App\Models\Job;
use App\Models\User;

class JobViewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing jobs and users
        $jobs = Job::all();
        $users = User::all();
        
        // If there are no jobs or users, return
        if ($jobs->isEmpty() || $users->isEmpty()) {
            return;
        }
        
        // Create job views for each user
        foreach ($users as $user) {
            // Each user will view a random number of jobs (between 1 and 5)
            $jobsToView = $jobs->random(rand(1, min(5, $jobs->count())));
            
            foreach ($jobsToView as $job) {
                // Create a job view with a 70% chance (not all users view all jobs)
                if (rand(1, 100) <= 70) {
                    JobView::factory()->create([
                        'user_id' => $user->id,
                        'job_id' => $job->id,
                    ]);
                }
            }
        }
    }
}