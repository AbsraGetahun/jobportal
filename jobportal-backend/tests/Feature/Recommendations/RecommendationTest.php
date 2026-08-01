<?php

namespace Tests\Feature\Recommendations;

use Tests\TestCase;
use App\Models\User;
use App\Models\Job;
use App\Models\JobView;
use App\Models\Application;
use App\Models\Company;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;

class RecommendationTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $user;
    protected $token;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create a user for testing
        $this->user = User::factory()->create([
            'fieldOfStudy' => 'Computer Science',
            'experience' => 5
        ]);
        $this->token = $this->user->createToken('test-token')->plainTextToken;
        $this->withHeader('Authorization', 'Bearer ' . $this->token);
    }

    /**
     * Test personalized recommendations
     *
     * @return void
     */
    public function test_get_personalized_recommendations()
    {
        // Create test jobs
        $company = Company::factory()->create(['is_verified' => true]);
        $job1 = Job::factory()->create([
            'title' => 'Senior Software Engineer',
            'category' => 'technology',
            'experience_level' => 'senior',
            'company_id' => $company->id
        ]);
        $job2 = Job::factory()->create([
            'title' => 'Marketing Manager',
            'category' => 'marketing',
            'experience_level' => 'senior',
            'company_id' => $company->id
        ]);

        // Test getting personalized recommendations
        $response = $this->getJson('/api/recommendations');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'message',
            'data'
        ]);
        
        // Should return some recommendations
        $response->assertJsonCount(2, 'data');
    }

    /**
     * Test profile-based recommendations
     *
     * @return void
     */
    public function test_get_profile_based_recommendations()
    {
        // Create test jobs that match user profile
        $company = Company::factory()->create(['is_verified' => true]);
        $job1 = Job::factory()->create([
            'title' => 'Software Engineer',
            'description' => 'Computer Science degree required',
            'category' => 'technology',
            'experience_level' => 'intermediate',
            'company_id' => $company->id
        ]);
        $job2 = Job::factory()->create([
            'title' => 'Marketing Manager',
            'description' => 'Marketing degree required',
            'category' => 'marketing',
            'experience_level' => 'intermediate',
            'company_id' => $company->id
        ]);

        // Test getting profile-based recommendations
        $response = $this->getJson('/api/recommendations/profile');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'message',
            'data'
        ]);
        
        // Should return recommendations with match scores
        $responseData = $response->json()['data'];
        $this->assertArrayHasKey('match_score', $responseData[0]);
    }

    /**
     * Test history-based recommendations
     *
     * @return void
     */
    public function test_get_history_based_recommendations()
    {
        // Create test jobs
        $company = Company::factory()->create(['is_verified' => true]);
        $job1 = Job::factory()->create([
            'title' => 'Software Engineer',
            'category' => 'technology',
            'job_type' => 'full-time',
            'experience_level' => 'intermediate',
            'company_id' => $company->id
        ]);
        $job2 = Job::factory()->create([
            'title' => 'Backend Developer',
            'category' => 'technology',
            'job_type' => 'full-time',
            'experience_level' => 'intermediate',
            'company_id' => $company->id
        ]);

        // Create job views to establish history
        JobView::factory()->forUser($this->user)->forJob($job1)->create();

        // Test getting history-based recommendations
        $response = $this->getJson('/api/recommendations/history');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'message',
            'data'
        ]);
        
        // Should return recommendations based on viewing history
        $responseData = $response->json()['data'];
        // Should include job2 as it's similar to viewed job1
        $this->assertArrayHasKey('similarity_score', $responseData[0]);
    }

    /**
     * Test trending jobs recommendations
     *
     * @return void
     */
    public function test_get_trending_jobs()
    {
        // Create test jobs
        $company = Company::factory()->create(['is_verified' => true]);
        $job1 = Job::factory()->create([
            'title' => 'Popular Job',
            'category' => 'technology',
            'company_id' => $company->id
        ]);
        $job2 = Job::factory()->create([
            'title' => 'Less Popular Job',
            'category' => 'marketing',
            'company_id' => $company->id
        ]);

        // Create job views to make job1 popular
        JobView::factory()->count(10)->forJob($job1)->create();

        // Test getting trending jobs
        $response = $this->getJson('/api/recommendations/trending');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'message',
            'data'
        ]);
        
        // Should return jobs with popularity scores
        $responseData = $response->json()['data'];
        $this->assertArrayHasKey('popularity_score', $responseData[0]);
    }

    /**
     * Test job view tracking
     *
     * @return void
     */
    public function test_track_job_view()
    {
        // Create a test job
        $company = Company::factory()->create(['is_verified' => true]);
        $job = Job::factory()->create([
            'title' => 'Test Job',
            'company_id' => $company->id
        ]);

        // Test tracking a job view
        $response = $this->postJson("/api/jobs/{$job->id}/track-view");

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Job view tracked successfully'
        ]);
        
        // Verify the job view was recorded
        $this->assertDatabaseHas('job_views', [
            'user_id' => $this->user->id,
            'job_id' => $job->id
        ]);
    }

    /**
     * Test get most viewed jobs
     *
     * @return void
     */
    public function test_get_most_viewed_jobs()
    {
        // Create test jobs
        $company = Company::factory()->create(['is_verified' => true]);
        $job1 = Job::factory()->create([
            'title' => 'Popular Job',
            'company_id' => $company->id
        ]);
        $job2 = Job::factory()->create([
            'title' => 'Less Popular Job',
            'company_id' => $company->id
        ]);

        // Create job views to make job1 popular
        JobView::factory()->count(5)->forUser($this->user)->forJob($job1)->create();

        // Test getting most viewed jobs
        $response = $this->getJson('/api/job-views/most-viewed');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'message',
            'data'
        ]);
        
        // Should return jobs sorted by view count
        $responseData = $response->json()['data'];
        $this->assertEquals('Popular Job', $responseData[0]['title']);
    }

    /**
     * Test recommendations with category filter
     *
     * @return void
     */
    public function test_recommendations_with_category_filter()
    {
        // Create test jobs
        $company = Company::factory()->create(['is_verified' => true]);
        $job1 = Job::factory()->create([
            'title' => 'Software Engineer',
            'category' => 'technology',
            'company_id' => $company->id
        ]);
        $job2 = Job::factory()->create([
            'title' => 'Marketing Manager',
            'category' => 'marketing',
            'company_id' => $company->id
        ]);

        // Test getting recommendations with category filter
        $response = $this->getJson('/api/recommendations?category=technology');

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'category' => 'technology'
        ]);
        $response->assertJsonMissing([
            'category' => 'marketing'
        ]);
    }

    /**
     * Test recommendations with job type filter
     *
     * @return void
     */
    public function test_recommendations_with_job_type_filter()
    {
        // Create test jobs
        $company = Company::factory()->create(['is_verified' => true]);
        $job1 = Job::factory()->create([
            'title' => 'Full Time Developer',
            'job_type' => 'full-time',
            'company_id' => $company->id
        ]);
        $job2 = Job::factory()->create([
            'title' => 'Part Time Designer',
            'job_type' => 'part-time',
            'company_id' => $company->id
        ]);

        // Test getting recommendations with job type filter
        $response = $this->getJson('/api/recommendations?job_type=full-time');

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'job_type' => 'full-time'
        ]);
        $response->assertJsonMissing([
            'job_type' => 'part-time'
        ]);
    }

    /**
     * Test recommendations with experience level filter
     *
     * @return void
     */
    public function test_recommendations_with_experience_level_filter()
    {
        // Create test jobs
        $company = Company::factory()->create(['is_verified' => true]);
        $job1 = Job::factory()->create([
            'title' => 'Senior Developer',
            'experience_level' => 'senior',
            'company_id' => $company->id
        ]);
        $job2 = Job::factory()->create([
            'title' => 'Entry Level Developer',
            'experience_level' => 'entry',
            'company_id' => $company->id
        ]);

        // Test getting recommendations with experience level filter
        $response = $this->getJson('/api/recommendations?experience_level=senior');

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'experience_level' => 'senior'
        ]);
        $response->assertJsonMissing([
            'experience_level' => 'entry'
        ]);
    }

    /**
     * Test that expired jobs are not included in recommendations
     *
     * @return void
     */
    public function test_expired_jobs_not_in_recommendations()
    {
        // Create test jobs - one active with future deadline, one expired
        $company = Company::factory()->create(['is_verified' => true]);
        $activeJob = Job::factory()->create([
            'title' => 'Active Job',
            'application_deadline' => now()->addDays(7), // Future deadline
            'company_id' => $company->id
        ]);
        $expiredJob = Job::factory()->create([
            'title' => 'Expired Job',
            'application_deadline' => now()->subDays(1), // Past deadline
            'company_id' => $company->id
        ]);

        // Test getting recommendations
        $response = $this->getJson('/api/recommendations');

        $response->assertStatus(200);

        // Should include active job
        $response->assertJsonFragment([
            'title' => 'Active Job'
        ]);

        // Should NOT include expired job
        $response->assertJsonMissing([
            'title' => 'Expired Job'
        ]);
    }

    /**
     * Test that expired jobs are not included in profile-based recommendations
     *
     * @return void
     */
    public function test_expired_jobs_not_in_profile_recommendations()
    {
        // Create test jobs - one active with future deadline, one expired
        $company = Company::factory()->create(['is_verified' => true]);
        $activeJob = Job::factory()->create([
            'title' => 'Active Profile Job',
            'description' => 'Computer Science degree required',
            'application_deadline' => now()->addDays(7), // Future deadline
            'company_id' => $company->id
        ]);
        $expiredJob = Job::factory()->create([
            'title' => 'Expired Profile Job',
            'description' => 'Computer Science degree required',
            'application_deadline' => now()->subDays(1), // Past deadline
            'company_id' => $company->id
        ]);

        // Test getting profile-based recommendations
        $response = $this->getJson('/api/recommendations/profile');

        $response->assertStatus(200);

        // Should include active job
        $response->assertJsonFragment([
            'title' => 'Active Profile Job'
        ]);

        // Should NOT include expired job
        $response->assertJsonMissing([
            'title' => 'Expired Profile Job'
        ]);
    }

    /**
     * Test that expired jobs are not included in history-based recommendations
     *
     * @return void
     */
    public function test_expired_jobs_not_in_history_recommendations()
    {
        // Create test jobs
        $company = Company::factory()->create(['is_verified' => true]);
        $viewedJob = Job::factory()->create([
            'title' => 'Viewed Job',
            'category' => 'technology',
            'job_type' => 'full-time',
            'application_deadline' => now()->addDays(7),
            'company_id' => $company->id
        ]);
        $activeSimilarJob = Job::factory()->create([
            'title' => 'Active Similar Job',
            'category' => 'technology',
            'job_type' => 'full-time',
            'application_deadline' => now()->addDays(7),
            'company_id' => $company->id
        ]);
        $expiredSimilarJob = Job::factory()->create([
            'title' => 'Expired Similar Job',
            'category' => 'technology',
            'job_type' => 'full-time',
            'application_deadline' => now()->subDays(1),
            'company_id' => $company->id
        ]);

        // Create job view to establish history
        JobView::factory()->forUser($this->user)->forJob($viewedJob)->create();

        // Test getting history-based recommendations
        $response = $this->getJson('/api/recommendations/history');

        $response->assertStatus(200);

        // Should include active similar job
        $response->assertJsonFragment([
            'title' => 'Active Similar Job'
        ]);

        // Should NOT include expired similar job
        $response->assertJsonMissing([
            'title' => 'Expired Similar Job'
        ]);
    }
}