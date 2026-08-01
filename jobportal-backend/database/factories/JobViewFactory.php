<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\JobView;
use App\Models\User;
use App\Models\Job;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\JobView>
 */
class JobViewFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = JobView::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'job_id' => Job::factory(),
        ];
    }

    /**
     * Create a job view for a specific user.
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

    /**
     * Create a job view for a specific job.
     *
     * @param  \App\Models\Job  $job
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function forJob($job)
    {
        return $this->state(function (array $attributes) use ($job) {
            return [
                'job_id' => $job->id,
            ];
        });
    }
}