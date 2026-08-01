<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\SavedSearch;
use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SavedSearch>
 */
class SavedSearchFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = SavedSearch::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => $this->faker->words(3, true),
            'criteria' => [
                'keywords' => $this->faker->words(2, true),
                'location' => $this->faker->city(),
                'job_type' => $this->faker->randomElement(['full-time', 'part-time', 'contract']),
                'experience_level' => $this->faker->randomElement(['entry', 'intermediate', 'senior']),
                'category' => $this->faker->randomElement(['technology', 'healthcare', 'finance', 'marketing']),
                'salary_min' => $this->faker->numberBetween(30000, 80000),
                'salary_max' => $this->faker->numberBetween(80000, 150000),
            ],
        ];
    }

    /**
     * Create a saved search for a specific user.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function forUser($user)
    {
        return $this->state(function (array $attributes) use ($user) {
            return [
                'user_id' => $user->id,
            ];
        });
    }
}