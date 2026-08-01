<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Job;
use App\Models\Company;
use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Job>
 */
class JobFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Job::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'employer_id' => User::factory(),
            'title' => $this->faker->jobTitle(),
            'description' => $this->faker->paragraphs(3, true),
            'location' => $this->faker->city() . ', ' . $this->faker->state(),
            'job_type' => $this->faker->randomElement(['full-time', 'part-time', 'contract', 'freelance', 'internship', 'remote']),
            'experience_level' => $this->faker->randomElement(['entry', 'intermediate', 'senior', 'expert', 'director']),
            'salary_min' => $this->faker->numberBetween(30000, 350000),
            'salary_max' => $this->faker->numberBetween(35000, 500000),
            'salary_type' => $this->faker->randomElement(['hourly', 'monthly', 'yearly', 'project']),
            'category' => $this->faker->randomElement(['technology', 'healthcare', 'finance', 'education', 'marketing', 'sales', 'engineering', 'design', 'hr', 'legal', 'other']),
            'is_remote' => $this->faker->boolean(30), // 30% chance of being remote
            'is_active' => true,
            'status' => 'approved',
            'application_deadline' => $this->faker->dateTimeBetween('+1 month', '+3 months'),
        ];
    }
    
    /**
     * Create a job with a specific employer.
     *
     * @param  \App\Models\User  $employer
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function forEmployer($employer)
    {
        return $this->state(function (array $attributes) use ($employer) {
            return [
                'employer_id' => $employer->id,
            ];
        });
    }
    
    /**
     * Create a job with a specific company.
     *
     * @param  \App\Models\Company  $company
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function forCompany($company)
    {
        return $this->state(function (array $attributes) use ($company) {
            return [
                'company_id' => $company->id,
            ];
        });
    }
}