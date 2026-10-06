<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Company;
use App\Models\JobPost;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<JobPost> */
class JobPostFactory extends Factory
{
    public function definition(): array
    {
        $min = fake()->numberBetween(8, 40) * 100;

        return [
            'company_id' => Company::factory(),
            'category_id' => Category::factory(),
            'title' => fake()->jobTitle(),
            'description' => fake()->paragraphs(3, true),
            'requirements' => fake()->paragraph(),
            'location' => fake()->city(),
            'type' => fake()->randomElement(JobPost::TYPES),
            'work_mode' => fake()->randomElement(JobPost::WORK_MODES),
            'experience_level' => fake()->randomElement(JobPost::LEVELS),
            'salary_min' => $min,
            'salary_max' => $min + fake()->numberBetween(5, 20) * 100,
            'skills' => fake()->randomElements(['PHP', 'Laravel', 'React', 'MySQL', 'Docker', 'Figma'], 3),
            'status' => 'open',
            'deadline' => now()->addDays(30)->toDateString(),
        ];
    }

    public function closed(): static
    {
        return $this->state(['status' => 'closed']);
    }
}
