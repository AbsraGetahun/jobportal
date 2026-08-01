<?php

namespace Database\Factories;

use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SubscriptionFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Subscription::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'user_id' => User::factory(),
            'plan_type' => $this->faker->randomElement(['basic', 'premium']),
            'amount' => $this->faker->randomFloat(2, 0, 100),
            'currency' => 'USD',
            'billing_period' => $this->faker->randomElement(['monthly', 'yearly']),
            'start_date' => now(),
            'end_date' => now()->addMonth(),
            'status' => $this->faker->randomElement(['active', 'cancelled', 'expired']),
            'subscription_id' => $this->faker->uuid,
        ];
    }
}