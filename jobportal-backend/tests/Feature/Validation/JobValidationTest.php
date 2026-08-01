<?php

namespace Tests\Feature\Validation;

use Tests\TestCase;
use App\Models\User;
use App\Models\Job;
use Illuminate\Foundation\Testing\RefreshDatabase;

class JobValidationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that job creation validates description length
     *
     * @return void
     */
    public function test_job_creation_validates_description_length()
    {
        $user = User::factory()->create(['hasCompany' => true]);
        $token = $user->createToken('test-token')->plainTextToken;
        $this->withHeader('Authorization', 'Bearer ' . $token);

        // Test description too short
        $response = $this->postJson('/api/jobs', [
            'title' => 'Test Job',
            'description' => 'Short', // Less than 10 characters
            'location' => 'Test Location',
            'job_type' => 'full-time',
            'experience_level' => 'entry',
            'category' => 'technology',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['description']);

        // Test description too long
        $longDescription = str_repeat('a', 5001); // More than 5000 characters
        $response = $this->postJson('/api/jobs', [
            'title' => 'Test Job',
            'description' => $longDescription,
            'location' => 'Test Location',
            'job_type' => 'full-time',
            'experience_level' => 'entry',
            'category' => 'technology',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['description']);
    }

    /**
     * Test that job creation validates salary ranges
     *
     * @return void
     */
    public function test_job_creation_validates_salary_ranges()
    {
        $user = User::factory()->create(['hasCompany' => true]);
        $token = $user->createToken('test-token')->plainTextToken;
        $this->withHeader('Authorization', 'Bearer ' . $token);

        // Test salary_min too high
        $response = $this->postJson('/api/jobs', [
            'title' => 'Test Job',
            'description' => 'Test Description',
            'location' => 'Test Location',
            'job_type' => 'full-time',
            'experience_level' => 'entry',
            'category' => 'technology',
            'salary_min' => 1000001, // More than max allowed
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['salary_min']);

        // Test salary_max too high
        $response = $this->postJson('/api/jobs', [
            'title' => 'Test Job',
            'description' => 'Test Description',
            'location' => 'Test Location',
            'job_type' => 'full-time',
            'experience_level' => 'entry',
            'category' => 'technology',
            'salary_max' => 1000001, // More than max allowed
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['salary_max']);

        // Test salary_max less than salary_min
        $response = $this->postJson('/api/jobs', [
            'title' => 'Test Job',
            'description' => 'Test Description',
            'location' => 'Test Location',
            'job_type' => 'full-time',
            'experience_level' => 'entry',
            'category' => 'technology',
            'salary_min' => 50000,
            'salary_max' => 40000, // Less than salary_min
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['salary_max']);
    }

    /**
     * Test that job update validates description length
     *
     * @return void
     */
    public function test_job_update_validates_description_length()
    {
        $user = User::factory()->create(['hasCompany' => true]);
        $job = Job::factory()->create(['employer_id' => $user->id]);
        $token = $user->createToken('test-token')->plainTextToken;
        $this->withHeader('Authorization', 'Bearer ' . $token);

        // Test description too short
        $response = $this->putJson("/api/jobs/{$job->id}", [
            'description' => 'Short', // Less than 10 characters
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['description']);

        // Test description too long
        $longDescription = str_repeat('a', 5001); // More than 5000 characters
        $response = $this->putJson("/api/jobs/{$job->id}", [
            'description' => $longDescription,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['description']);
    }

    /**
     * Test that job filtering validates category values
     *
     * @return void
     */
    public function test_job_filtering_validates_category_values()
    {
        $user = User::factory()->create();
        
        // Authenticate the user
        $token = $user->createToken('test-token')->plainTextToken;
        $this->withHeader('Authorization', 'Bearer ' . $token);
        
        // Test valid category
        $response = $this->getJson('/api/jobs?category=technology');
        $response->assertStatus(200);

        // Test invalid category
        $response = $this->getJson('/api/jobs?category=invalid-category');
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['category']);
    }

    /**
     * Test that job filtering validates salary ranges
     *
     * @return void
     */
    public function test_job_filtering_validates_salary_ranges()
    {
        $user = User::factory()->create();
        
        // Authenticate the user
        $token = $user->createToken('test-token')->plainTextToken;
        $this->withHeader('Authorization', 'Bearer ' . $token);
        
        // Test salary_min too high
        $response = $this->getJson('/api/jobs?salary_min=1000001');
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['salary_min']);

        // Test salary_max too high
        $response = $this->getJson('/api/jobs?salary_max=1000001');
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['salary_max']);

        // Test salary_max less than salary_min
        $response = $this->getJson('/api/jobs?salary_min=50000&salary_max=40000');
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['salary_max']);
    }
}