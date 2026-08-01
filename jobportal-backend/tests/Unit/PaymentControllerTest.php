<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Stripe\Checkout\Session as StripeSession;
use Mockery;
use PHPUnit\Framework\Attributes\Test;

class PaymentControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    #[Test]
    public function it_requires_amount_field_for_checkout()
    {
        $this->actingAs($this->user, 'sanctum');

        $data = [
            'currency' => 'USD',
            'description' => 'Premium Plan',
            'success_url' => 'http://localhost:3001/payment-success',
            'cancel_url' => 'http://localhost:3001/payment-cancelled',
            'payment_type' => 'subscription'
        ];

        $response = $this->postJson('/api/payments/checkout', $data);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['amount']);
    }

    #[Test]
    public function it_can_get_payment_history()
    {
        $this->actingAs($this->user, 'sanctum');

        // Create some payments
        Payment::factory()->count(3)->create(['user_id' => $this->user->id]);

        $response = $this->getJson('/api/payments/history');

        $response->assertStatus(200);
        $response->assertJsonCount(3, 'data');
    }

    #[Test]
    public function it_can_get_subscription_status()
    {
        $this->actingAs($this->user, 'sanctum');

        $response = $this->getJson('/api/subscription/status');

        $response->assertStatus(200);
    }
}