<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/** @extends Factory<User> */
class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'role' => User::ROLE_SEEKER,
            'is_active' => true,
            'location' => fake()->city(),
        ];
    }

    /** A company account together with its company profile. */
    public function company(): static
    {
        return $this->state(['role' => User::ROLE_COMPANY])
            ->has(Company::factory(), 'company');
    }

    public function admin(): static
    {
        return $this->state(['role' => User::ROLE_ADMIN]);
    }
}
