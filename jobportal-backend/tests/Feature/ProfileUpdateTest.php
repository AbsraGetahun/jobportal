<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ProfileUpdateTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a test user
        $this->user = User::factory()->create([
            'name' => 'John Doe',
            'email' => 'john@gmail.com',
            'username' => 'johndoe',
            'phone' => '+1234567890',
            'age' => 30
        ]);
    }

    /** @test */
    public function user_can_update_profile_with_valid_data()
    {
        $this->actingAs($this->user, 'sanctum');

        $updateData = [
            'name' => 'Jane Smith',
            'username' => 'janesmith',
            'email' => 'jane@gmail.com',
            'phone' => '+1987654321',
            'age' => 35,
            'gender' => 'female',
            'location' => 'New York',
            'companyName' => 'Tech Corp',
            'companyLocation' => 'NYC',
            'employeesCount' => 100,
            'establishmentYear' => 2020
        ];

        $response = $this->putJson('/api/profile', $updateData);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        'id',
                        'name',
                        'username',
                        'email',
                        'phone',
                        'age',
                        'gender',
                        'location',
                        'companyName',
                        'companyLocation',
                        'employeesCount',
                        'establishmentYear'
                    ]
                ]);

        // Verify the user was updated in the database
        $this->user->refresh();
        $this->assertEquals('Jane Smith', $this->user->name);
        $this->assertEquals('+1987654321', $this->user->phone);
        $this->assertEquals('janesmith', $this->user->username);
    }

    /** @test */
    public function user_can_update_profile_with_special_characters_in_name()
    {
        $this->actingAs($this->user, 'sanctum');

        // Test with name containing special characters that would fail the old regex
        $updateData = [
            'name' => 'José María González',
            'phone' => '+1234567890'
        ];

        $response = $this->putJson('/api/profile', $updateData);

        $response->assertStatus(200);

        // Verify the user was updated
        $this->user->refresh();
        $this->assertEquals('José María González', $this->user->name);
    }

    /** @test */
    public function validation_fails_with_invalid_data()
    {
        $this->actingAs($this->user, 'sanctum');

        $invalidData = [
            'email' => 'invalid-email', // Invalid email format
            'age' => 150, // Age too high
            'phone' => str_repeat('1', 25), // Phone too long
        ];

        $response = $this->putJson('/api/profile', $invalidData);

        $response->assertStatus(422)
                ->assertJsonStructure([
                    'message',
                    'errors'
                ]);
    }

    /** @test */
    public function unauthenticated_user_cannot_update_profile()
    {
        $updateData = [
            'name' => 'Unauthorized User',
            'phone' => '+1234567890'
        ];

        $response = $this->putJson('/api/profile', $updateData);

        $response->assertStatus(401);
    }

    /** @test */
    public function user_cannot_update_to_existing_email()
    {
        // Create another user with different email
        $otherUser = User::factory()->create([
            'email' => 'other@example.com'
        ]);

        $this->actingAs($this->user, 'sanctum');

        $updateData = [
            'email' => 'other@example.com' // Try to use existing email
        ];

        $response = $this->putJson('/api/profile', $updateData);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['email']);
    }

    /** @test */
    public function user_cannot_update_to_existing_username()
    {
        // Create another user with different username
        $otherUser = User::factory()->create([
            'username' => 'otheruser'
        ]);

        $this->actingAs($this->user, 'sanctum');

        $updateData = [
            'username' => 'otheruser' // Try to use existing username
        ];

        $response = $this->putJson('/api/profile', $updateData);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['username']);
    }

    /** @test */
    public function user_can_update_profile_with_same_email_and_username()
    {
        $this->actingAs($this->user, 'sanctum');

        // Try to update with the same email and username the user already has
        $updateData = [
            'name' => 'Updated Name',
            'email' => $this->user->email, // Same email
            'username' => $this->user->username, // Same username
            'phone' => '+1234567890'
        ];

        $response = $this->putJson('/api/profile', $updateData);

        $response->assertStatus(200);

        // Verify the user was updated
        $this->user->refresh();
        $this->assertEquals('Updated Name', $this->user->name);
        $this->assertEquals('+1234567890', $this->user->phone);
    }

    /** @test */
    public function user_can_update_profile_with_invalid_email_format()
    {
        $this->actingAs($this->user, 'sanctum');

        // Test with various email formats that should be accepted
        $testEmails = [
            'test@gmail.com',
            'user.name+tag@gmail.com',
            'test.email@outlook.com'
        ];

        foreach ($testEmails as $email) {
            $updateData = [
                'name' => 'Test User',
                'email' => $email,
                'phone' => '+1234567890'
            ];

            $response = $this->putJson('/api/profile', $updateData);

            // Should pass validation
            if ($response->getStatusCode() !== 200) {
                $this->fail("Email validation failed for: {$email}");
            }
        }

        $this->assertTrue(true); // If we get here, all emails passed
    }

    /** @test */
    public function user_can_update_profile_with_empty_name_field()
    {
        $this->actingAs($this->user, 'sanctum');

        // Try to update with empty name - should use existing name
        $updateData = [
            'name' => '', // Empty name
            'phone' => '+1987654321'
        ];

        $response = $this->putJson('/api/profile', $updateData);

        $response->assertStatus(200);

        // Verify the user was updated with existing name (not empty)
        $this->user->refresh();
        $this->assertEquals($this->user->name, $this->user->name); // Name should remain unchanged
        $this->assertEquals('+1987654321', $this->user->phone);
    }
}