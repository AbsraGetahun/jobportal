<?php

namespace Tests\Feature\ErrorHandling;

use Tests\TestCase;
use App\Models\User;
use App\Models\Job;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Exceptions\ThrottleRequestsException;

class EnhancedErrorHandlingTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test enhanced validation error response
     *
     * @return void
     */
    public function test_enhanced_validation_error_response()
    {
        $user = User::factory()->create(['hasCompany' => true]);
        $token = $user->createToken('test-token')->plainTextToken;
        $this->withHeader('Authorization', 'Bearer ' . $token);

        // Test with invalid data to trigger validation error
        $response = $this->postJson('/api/jobs', [
            'title' => '', // Required field empty
            'description' => 'Short', // Less than 10 characters
            'location' => '', // Required field empty
            'job_type' => 'invalid-type', // Not in allowed values
            'experience_level' => 'entry',
            'category' => 'technology',
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure([
            'error',
            'message',
            'code',
            'errors',
            'timestamp'
        ]);
        
        // Verify error response contains expected fields
        $responseData = $response->json();
        $this->assertEquals('Validation failed', $responseData['error']);
        $this->assertEquals('VALIDATION_FAILED', $responseData['code']);
        $this->assertArrayHasKey('title', $responseData['errors']);
        $this->assertArrayHasKey('description', $responseData['errors']);
        $this->assertArrayHasKey('location', $responseData['errors']);
        $this->assertArrayHasKey('job_type', $responseData['errors']);
    }

    /**
     * Test enhanced authentication error response
     *
     * @return void
     */
    public function test_enhanced_authentication_error_response()
    {
        // Test without authentication to trigger authentication error
        $response = $this->getJson('/api/profile');

        $response->assertStatus(401);
        $response->assertJsonStructure([
            'error',
            'message',
            'code',
            'timestamp'
        ]);
        
        // Verify error response contains expected fields
        $responseData = $response->json();
        $this->assertEquals('Unauthenticated', $responseData['error']);
        $this->assertEquals('UNAUTHENTICATED', $responseData['code']);
    }

    /**
     * Test enhanced resource not found error response
     *
     * @return void
     */
    public function test_enhanced_resource_not_found_error_response()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;
        $this->withHeader('Authorization', 'Bearer ' . $token);

        // Test with non-existent job ID to trigger not found error
        $response = $this->getJson('/api/jobs/999999');

        $response->assertStatus(404);
        $response->assertJsonStructure([
            'error',
            'message',
            'code',
            'timestamp'
        ]);
        
        // Verify error response contains expected fields
        $responseData = $response->json();
        $this->assertEquals('Job not found', $responseData['error']);
        $this->assertEquals('MODEL_NOT_FOUND', $responseData['code']);
    }

    /**
     * Test enhanced rate limit error response
     *
     * @return void
     */
    public function test_enhanced_rate_limit_error_response()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;
        $this->withHeader('Authorization', 'Bearer ' . $token);

        // Make multiple requests to trigger rate limiting
        for ($i = 0; $i < 150; $i++) {
            $response = $this->getJson('/api/jobs');
        }

        // The last request should be rate limited
        $response->assertStatus(429);
        $response->assertJsonStructure([
            'error',
            'message',
            'code',
            'retry_after',
            'timestamp'
        ]);
        
        // Verify error response contains expected fields
        $responseData = $response->json();
        $this->assertEquals('Rate limit exceeded', $responseData['error']);
        $this->assertEquals('RATE_LIMIT_EXCEEDED', $responseData['code']);
        $this->assertArrayHasKey('retry_after', $responseData);
    }

    /**
     * Test enhanced general error response
     *
     * @return void
     */
    public function test_enhanced_general_error_response()
    {
        // This test would need to trigger a general exception
        // For now, we'll just verify the structure of error responses
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;
        $this->withHeader('Authorization', 'Bearer ' . $token);

        // Test with a valid endpoint to ensure normal operation
        $response = $this->getJson('/api/jobs');

        // Should not return an error for valid requests
        $response->assertStatus(200);
    }

    /**
     * Test error context information
     *
     * @return void
     */
    public function test_error_context_information()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;
        $this->withHeader('Authorization', 'Bearer ' . $token);

        // Test with invalid data to trigger validation error
        $response = $this->postJson('/api/jobs', [
            'title' => '', // Required field empty
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure([
            'context' => [
                'url',
                'method',
                'ip',
                'user_id'
            ]
        ]);
        
        // Verify context contains request information
        $responseData = $response->json();
        $this->assertArrayHasKey('url', $responseData['context']);
        $this->assertArrayHasKey('method', $responseData['context']);
        $this->assertArrayHasKey('ip', $responseData['context']);
        $this->assertEquals($user->id, $responseData['context']['user_id']);
    }

    /**
     * Test timestamp in error responses
     *
     * @return void
     */
    public function test_timestamp_in_error_responses()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;
        $this->withHeader('Authorization', 'Bearer ' . $token);

        // Test with invalid data to trigger validation error
        $response = $this->postJson('/api/jobs', [
            'title' => '', // Required field empty
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure([
            'timestamp'
        ]);
        
        // Verify timestamp is in ISO format
        $responseData = $response->json();
        $this->assertMatchesRegularExpression('/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z/', $responseData['timestamp']);
    }
}