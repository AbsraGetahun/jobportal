<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Models\Subscription;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;

class SubscriptionControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    #[Test]
    public function it_can_get_subscription_plans()
    {
        $this->actingAs($this->user, 'sanctum');

        $response = $this->getJson('/api/subscription/plans');

        $response->assertStatus(200);
        $response->assertJsonCount(3, 'data');
    }

    #[Test]
    public function it_can_get_user_subscription()
    {
        $this->actingAs($this->user, 'sanctum');

        // Create a subscription for the user
        $subscription = Subscription::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'active',
            'end_date' => now()->addMonth()
        ]);

        $response = $this->getJson('/api/subscription');

        $response->assertStatus(200);
        $response->assertJson([
            'data' => [
                'id' => $subscription->id,
                'user_id' => $this->user->id,
                'plan_type' => $subscription->plan_type
            ]
        ]);
    }

    #[Test]
    public function it_returns_null_when_user_has_no_active_subscription()
    {
        $this->actingAs($this->user, 'sanctum');

        $response = $this->getJson('/api/subscription');

        $response->assertStatus(200);
        $response->assertJson(['data' => null]);
    }

    #[Test]
    public function it_requires_authentication_to_get_subscription()
    {
        $response = $this->getJson('/api/subscription');

        $response->assertStatus(401);
    }
}