<?php

namespace Tests\Feature\Search;

use Tests\TestCase;
use App\Models\User;
use App\Models\Job;
use App\Models\Company;
use App\Models\SavedSearch;
use App\Models\SearchAnalytics;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;

class AdvancedSearchTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $user;
    protected $token;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create a user for testing
        $this->user = User::factory()->create();
        $this->token = $this->user->createToken('test-token')->plainTextToken;
        $this->withHeader('Authorization', 'Bearer ' . $this->token);
    }

    /**
     * Test advanced search with keywords
     *
     * @return void
     */
    public function test_advanced_search_with_keywords()
    {
        // Create test jobs
        $company = Company::factory()->create(['is_verified' => true]);
        $job1 = Job::factory()->create([
            'title' => 'Software Engineer',
            'description' => 'Looking for a skilled software engineer with PHP experience',
            'category' => 'technology',
            'company_id' => $company->id
        ]);
        $job2 = Job::factory()->create([
            'title' => 'Marketing Manager',
            'description' => 'Experienced marketing professional needed',
            'category' => 'marketing',
            'company_id' => $company->id
        ]);

        // Test search with keywords
        $response = $this->postJson('/api/jobs/advanced-search', [
            'keywords' => 'software'
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'message',
            'data',
            'pagination',
            'meta'
        ]);
        
        // Should return only the software engineer job
        $response->assertJsonFragment([
            'title' => 'Software Engineer'
        ]);
        
        // Should not return the marketing manager job
        $response->assertJsonMissing([
            'title' => 'Marketing Manager'
        ]);
    }

    /**
     * Test advanced search with location filter
     *
     * @return void
     */
    public function test_advanced_search_with_location_filter()
    {
        // Create test jobs
        $company1 = Company::factory()->create(['is_verified' => true, 'location' => 'New York']);
        $company2 = Company::factory()->create(['is_verified' => true, 'location' => 'Los Angeles']);
        $job1 = Job::factory()->create([
            'title' => 'Software Engineer',
            'location' => 'New York',
            'company_id' => $company1->id
        ]);
        $job2 = Job::factory()->create([
            'title' => 'Designer',
            'location' => 'Los Angeles',
            'company_id' => $company2->id
        ]);

        // Test search with location filter
        $response = $this->postJson('/api/jobs/advanced-search', [
            'location' => 'New York'
        ]);

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'title' => 'Software Engineer'
        ]);
        $response->assertJsonMissing([
            'title' => 'Designer'
        ]);
    }

    /**
     * Test advanced search with job types filter
     *
     * @return void
     */
    public function test_advanced_search_with_job_types_filter()
    {
        // Create test jobs
        $company = Company::factory()->create(['is_verified' => true]);
        $job1 = Job::factory()->create([
            'title' => 'Full Stack Developer',
            'job_type' => 'full-time',
            'company_id' => $company->id
        ]);
        $job2 = Job::factory()->create([
            'title' => 'Part Time Designer',
            'job_type' => 'part-time',
            'company_id' => $company->id
        ]);

        // Test search with job types filter
        $response = $this->postJson('/api/jobs/advanced-search', [
            'job_types' => ['full-time']
        ]);

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'title' => 'Full Stack Developer'
        ]);
        $response->assertJsonMissing([
            'title' => 'Part Time Designer'
        ]);
    }

    /**
     * Test advanced search with experience levels filter
     *
     * @return void
     */
    public function test_advanced_search_with_experience_levels_filter()
    {
        // Create test jobs
        $company = Company::factory()->create(['is_verified' => true]);
        $job1 = Job::factory()->create([
            'title' => 'Junior Developer',
            'experience_level' => 'entry',
            'company_id' => $company->id
        ]);
        $job2 = Job::factory()->create([
            'title' => 'Senior Developer',
            'experience_level' => 'senior',
            'company_id' => $company->id
        ]);

        // Test search with experience levels filter
        $response = $this->postJson('/api/jobs/advanced-search', [
            'experience_levels' => ['senior']
        ]);

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'title' => 'Senior Developer'
        ]);
        $response->assertJsonMissing([
            'title' => 'Junior Developer'
        ]);
    }

    /**
     * Test advanced search with categories filter
     *
     * @return void
     */
    public function test_advanced_search_with_categories_filter()
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

        // Test search with categories filter
        $response = $this->postJson('/api/jobs/advanced-search', [
            'categories' => ['technology']
        ]);

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'title' => 'Software Engineer'
        ]);
        $response->assertJsonMissing([
            'title' => 'Marketing Manager'
        ]);
    }

    /**
     * Test advanced search with salary range filter
     *
     * @return void
     */
    public function test_advanced_search_with_salary_range_filter()
    {
        // Create test jobs
        $company = Company::factory()->create(['is_verified' => true]);
        $job1 = Job::factory()->create([
            'title' => 'High Pay Developer',
            'salary_min' => 80000,
            'salary_max' => 120000,
            'company_id' => $company->id
        ]);
        $job2 = Job::factory()->create([
            'title' => 'Entry Level Developer',
            'salary_min' => 40000,
            'salary_max' => 60000,
            'company_id' => $company->id
        ]);

        // Test search with salary range filter
        $response = $this->postJson('/api/jobs/advanced-search', [
            'salary_range' => [
                'min' => 70000,
                'max' => 130000
            ]
        ]);

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'title' => 'High Pay Developer'
        ]);
        $response->assertJsonMissing([
            'title' => 'Entry Level Developer'
        ]);
    }

    /**
     * Test advanced search with remote jobs filter
     *
     * @return void
     */
    public function test_advanced_search_with_remote_jobs_filter()
    {
        // Create test jobs
        $company = Company::factory()->create(['is_verified' => true]);
        $job1 = Job::factory()->create([
            'title' => 'Remote Developer',
            'is_remote' => true,
            'company_id' => $company->id
        ]);
        $job2 = Job::factory()->create([
            'title' => 'Office Developer',
            'is_remote' => false,
            'company_id' => $company->id
        ]);

        // Test search with remote jobs filter
        $response = $this->postJson('/api/jobs/advanced-search', [
            'is_remote' => true
        ]);

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'title' => 'Remote Developer'
        ]);
        $response->assertJsonMissing([
            'title' => 'Office Developer'
        ]);
    }

    /**
     * Test advanced search with company IDs filter
     *
     * @return void
     */
    public function test_advanced_search_with_company_ids_filter()
    {
        // Create test companies and jobs
        $company1 = Company::factory()->create(['is_verified' => true]);
        $company2 = Company::factory()->create(['is_verified' => true]);
        $job1 = Job::factory()->create([
            'title' => 'Company 1 Developer',
            'company_id' => $company1->id
        ]);
        $job2 = Job::factory()->create([
            'title' => 'Company 2 Developer',
            'company_id' => $company2->id
        ]);

        // Test search with company IDs filter
        $response = $this->postJson('/api/jobs/advanced-search', [
            'company_ids' => [$company1->id]
        ]);

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'title' => 'Company 1 Developer'
        ]);
        $response->assertJsonMissing([
            'title' => 'Company 2 Developer'
        ]);
    }

    /**
     * Test search suggestions functionality
     *
     * @return void
     */
    public function test_search_suggestions()
    {
        // Create test jobs
        $company = Company::factory()->create(['is_verified' => true]);
        $job1 = Job::factory()->create([
            'title' => 'Software Engineer',
            'category' => 'technology',
            'company_id' => $company->id
        ]);
        $job2 = Job::factory()->create([
            'title' => 'Software Developer',
            'category' => 'technology',
            'company_id' => $company->id
        ]);

        // Test search suggestions
        $response = $this->getJson('/api/search/suggestions?query=software&type=jobs');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'message',
            'data',
            'meta'
        ]);
        
        // Should return both jobs as suggestions
        $response->assertJsonFragment([
            'title' => 'Software Engineer'
        ]);
        $response->assertJsonFragment([
            'title' => 'Software Developer'
        ]);
    }

    /**
     * Test save search functionality
     *
     * @return void
     */
    public function test_save_search()
    {
        $searchCriteria = [
            'keywords' => 'software',
            'location' => 'New York',
            'job_types' => ['full-time']
        ];

        // Test saving a search
        $response = $this->postJson('/api/search/saved', [
            'name' => 'My Software Jobs Search',
            'criteria' => $searchCriteria
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'message',
            'data' => [
                'id',
                'name',
                'criteria'
            ]
        ]);
        
        // Verify the search was saved in the database
        $this->assertDatabaseHas('saved_searches', [
            'user_id' => $this->user->id,
            'name' => 'My Software Jobs Search'
        ]);
    }

    /**
     * Test get saved searches functionality
     *
     * @return void
     */
    public function test_get_saved_searches()
    {
        // Create a saved search
        $savedSearch = SavedSearch::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Test Saved Search',
            'criteria' => ['keywords' => 'software']
        ]);

        // Test getting saved searches
        $response = $this->getJson('/api/search/saved');

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'name' => 'Test Saved Search'
        ]);
    }

    /**
     * Test delete saved search functionality
     *
     * @return void
     */
    public function test_delete_saved_search()
    {
        // Create a saved search
        $savedSearch = SavedSearch::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Test Saved Search',
            'criteria' => ['keywords' => 'software']
        ]);

        // Test deleting a saved search
        $response = $this->deleteJson("/api/search/saved/{$savedSearch->id}");

        $response->assertStatus(200);
        
        // Verify the search was deleted from the database
        $this->assertDatabaseMissing('saved_searches', [
            'id' => $savedSearch->id
        ]);
    }

    /**
     * Test search analytics tracking
     *
     * @return void
     */
    public function test_search_analytics_tracking()
    {
        // Create test jobs
        $company = Company::factory()->create(['is_verified' => true]);
        Job::factory()->create([
            'title' => 'Software Engineer',
            'company_id' => $company->id
        ]);

        // Perform a search to trigger analytics tracking
        $response = $this->postJson('/api/jobs/advanced-search', [
            'keywords' => 'software'
        ]);

        $response->assertStatus(200);
        
        // Verify search analytics were recorded
        $this->assertDatabaseHas('search_analytics', [
            'user_id' => $this->user->id,
            'query' => 'software'
        ]);
    }
}