<?php

namespace Tests\Feature\RateLimiting;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;

class RateLimitingTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that the jobs endpoint is rate limited
     *
     * @return void
     */
    public function test_jobs_endpoint_is_rate_limited()
    {
        $user = User::factory()->create();

        // Authenticate the user
        $token = $user->createToken('test-token')->plainTextToken;
        $this->withHeader('Authorization', 'Bearer ' . $token);

        // Clear any existing rate limiter state
        RateLimiter::clear('jobs:'.$user->id);

        // Make requests until we hit the rate limit
        $requestCount = 0;
        do {
            $response = $this->get('/api/jobs');
            $requestCount++;
        } while ($response->getStatusCode() === 200 && $requestCount < 110);

        // Should eventually get rate limited
        $this->assertEquals(429, $response->getStatusCode());
        $this->assertGreaterThanOrEqual(100, $requestCount);
    }

    /**
     * Test that authenticated users get higher rate limits
     *
     * @return void
     */
    public function test_premium_users_get_higher_rate_limits()
    {
        $user = User::factory()->premium()->create();
        $this->actingAs($user, 'sanctum');

        // Clear rate limiter for this user
        RateLimiter::clear('jobs:'.$user->id);

        // Make multiple requests and check that we can make more than regular users
        $requestCount = 0;
        $lastStatus = 200;

        while ($lastStatus === 200 && $requestCount < 250) {
            $response = $this->get('/api/jobs');
            $lastStatus = $response->getStatusCode();
            if ($lastStatus === 200) {
                $requestCount++;
            }
        }

        // Premium users should be able to make more requests than regular users (more than 100)
        $this->assertGreaterThan(100, $requestCount);
        // Should eventually get rate limited
        $this->assertEquals(429, $lastStatus);
    }

    /**
     * Test that employers get higher rate limits for job endpoints
     *
     * @return void
     */
    public function test_employers_get_higher_rate_limits()
    {
        $user = User::factory()->employer()->create();
        $this->actingAs($user, 'sanctum');

        // Clear rate limiter for this user
        RateLimiter::clear('jobs:'.$user->id);

        // Make multiple requests and check that we can make more than regular users
        $requestCount = 0;
        $lastStatus = 200;

        while ($lastStatus === 200 && $requestCount < 250) {
            $response = $this->get('/api/jobs');
            $lastStatus = $response->getStatusCode();
            if ($lastStatus === 200) {
                $requestCount++;
            }
        }

        // Employers should be able to make more requests than regular users (more than 100)
        $this->assertGreaterThan(100, $requestCount);
        // Should eventually get rate limited
        $this->assertEquals(429, $lastStatus);
    }

    /**
     * Test that search endpoints have appropriate rate limits
     *
     * @return void
     */
    public function test_search_endpoint_is_rate_limited()
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');

        // Clear rate limiter for this user
        RateLimiter::clear('search:'.$user->id);

        // Make multiple requests until rate limited
        $requestCount = 0;
        $lastStatus = 200;

        while ($lastStatus === 200 && $requestCount < 50) {
            $response = $this->get('/api/jobs/search');
            $lastStatus = $response->getStatusCode();
            if ($lastStatus === 200) {
                $requestCount++;
            }
        }

        // Should be able to make at least some requests before rate limiting
        $this->assertGreaterThan(10, $requestCount);
        // Should eventually get rate limited
        $this->assertEquals(429, $lastStatus);
    }

    /**
     * Test that premium users get higher rate limits for search
     *
     * @return void
     */
    public function test_premium_users_get_higher_search_rate_limits()
    {
        $user = User::factory()->premium()->create();
        $this->actingAs($user, 'sanctum');

        // Clear rate limiter for this user
        RateLimiter::clear('search:'.$user->id);

        // Make 60 requests (should be allowed for premium users)
        for ($i = 0; $i < 60; $i++) {
            $response = $this->get('/api/jobs/search');
            $response->assertStatus(200);
        }

        // The 61st request should be rate limited
        $response = $this->get('/api/jobs/search');
        $response->assertStatus(429);
    }
}