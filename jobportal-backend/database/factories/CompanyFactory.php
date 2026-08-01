<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Company;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Company>
 */
class CompanyFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Company::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->company(),
            'description' => $this->faker->paragraph(),
            'industry' => $this->faker->randomElement(['Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing', 'Retail', 'Hospitality', 'Transportation']),
            'website' => $this->faker->url(),
            'phone' => $this->faker->phoneNumber(),
            'email' => $this->faker->companyEmail(),
            'address' => $this->faker->streetAddress(),
            'city' => $this->faker->city(),
            'state' => $this->faker->state(),
            'country' => $this->faker->country(),
            'postal_code' => $this->faker->postcode(),
            'employees_count' => $this->faker->numberBetween(10, 10000),
            'establishment_year' => $this->faker->numberBetween(1950, 2025),
            'is_verified' => $this->faker->boolean(80), // 80% chance of being verified
        ];
    }
}