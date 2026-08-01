<?php

namespace Database\Factories;

use App\Models\Payment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Payment::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'user_id' => User::factory(),
            'amount' => $this->faker->randomFloat(2, 1, 1000),
            'currency' => 'USD',
            'status' => $this->faker->randomElement(['pending', 'completed', 'failed', 'cancelled']),
            'description' => $this->faker->sentence,
            'transaction_id' => $this->faker->uuid,
        ];
    }
}