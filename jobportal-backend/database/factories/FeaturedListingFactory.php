<?php

namespace Database\Factories;

use App\Models\FeaturedListing;
use App\Models\User;
use App\Models\Job;
use Illuminate\Database\Eloquent\Factories\Factory;

class FeaturedListingFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = FeaturedListing::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'job_id' => Job::factory(),
            'user_id' => User::factory(),
            'start_date' => now(),
            'end_date' => now()->addDays(7),
            'amount' => 9.99,
            'currency' => 'USD',
            'payment_id' => null,
        ];
    }
}