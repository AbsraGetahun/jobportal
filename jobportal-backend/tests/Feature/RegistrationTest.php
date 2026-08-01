<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function registration_includes_age_gender_location_fields()
    {
        // Temporarily disable email verification for testing
        config(['app.require_email_verification' => false]);

        $userData = [
            'name' => 'John Doe',
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'age' => 25,
            'gender' => 'Male',
            'location' => 'New York, USA',
            'phone' => '+1234567890'
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(201)
                ->assertJson([
                    'success' => true,
                    'message' => 'Registration completed successfully. You can now log in to your account.'
                ]);

        // Verify user was created with the correct fields
        $user = User::where('email', 'john@example.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals(25, $user->age);
        $this->assertEquals('Male', $user->gender);
        $this->assertEquals('New York, USA', $user->location);
        $this->assertEquals('+1234567890', $user->phone);
    }
}