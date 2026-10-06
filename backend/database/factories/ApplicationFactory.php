<?php

namespace Database\Factories;

use App\Models\Application;
use App\Models\JobPost;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Application> */
class ApplicationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'job_post_id' => JobPost::factory(),
            'user_id' => User::factory(),
            'cover_letter' => fake()->paragraph(),
            'status' => 'pending',
        ];
    }
}
