<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Company> */
class CompanyFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->state(['role' => User::ROLE_COMPANY]),
            'name' => fake()->unique()->company(),
            'website' => fake()->url(),
            'location' => fake()->city(),
            'industry' => fake()->randomElement(['Software', 'E-commerce', 'Fintech', 'Healthcare', 'Education']),
            'size' => fake()->randomElement(['1-10', '11-50', '51-200', '201-500']),
            'description' => fake()->paragraph(),
        ];
    }
}
