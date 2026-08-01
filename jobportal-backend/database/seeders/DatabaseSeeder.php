<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // Create permanent admin user (only if it doesn't exist)
        if (!User::where('email', 'admin@jobportal.com')->exists()) {
            User::factory()->create([
                'name' => 'System Administrator',
                'username' => 'admin',
                'email' => 'admin@jobportal.com',
                'password' => bcrypt('Admin123!'),
                'is_admin' => true,
                'email_verified_at' => now(),
            ]);
        }

        // Create test user only if it doesn't exist
        if (!User::where('email', 'test@example.com')->exists()) {
            User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);
        }

        // Create Job Seeker test account
        if (!User::where('email', 'jstest@example.com')->exists()) {
            User::factory()->create([
                'name' => 'Job Seeker Test',
                'username' => 'jstest',
                'email' => 'jstest@example.com',
                'password' => bcrypt('Password1!'),
                'hasCompany' => null,
                'email_verified_at' => now(),
            ]);
        }

        // Create Employer test account
        if (!User::where('email', 'emptest@example.com')->exists()) {
            $employer = User::factory()->create([
                'name' => 'Employer Test',
                'username' => 'emptest',
                'email' => 'emptest@example.com',
                'password' => bcrypt('Password1!'),
                'hasCompany' => true,
                'companyName' => 'Test Company',
                'companyLocation' => 'Addis Ababa',
                'employeesCount' => 100,
                'establishmentYear' => 2020,
                'email_verified_at' => now(),
            ]);

            \App\Models\Company::create([
                'user_id' => $employer->id,
                'name' => 'Test Company',
                'description' => 'This is a test company for verification.',
                'industry' => 'technology',
                'website' => 'https://example.com',
                'phone' => '+251911111111',
                'email' => 'contact@testcompany.com',
                'address' => 'Addis Ababa',
                'city' => 'Addis Ababa',
                'country' => 'Ethiopia',
                'employees_count' => 100,
                'establishment_year' => 2020,
                'is_verified' => true,
            ]);
        }

        // Run the company, job, and job view seeders
        $this->call([
            CompanySeeder::class,
            JobSeeder::class,
            JobViewSeeder::class,
            SystemSettingsSeeder::class,
        ]);
    }
}
