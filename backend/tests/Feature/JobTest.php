<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\JobPost;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JobTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'title' => 'Laravel Developer',
            'category_id' => Category::factory()->create()->id,
            'description' => 'Build and maintain our Laravel API and the React front end.',
            'location' => 'Damascus',
            'type' => 'full_time',
            'work_mode' => 'hybrid',
            'experience_level' => 'mid',
            'salary_min' => 1000,
            'salary_max' => 1500,
            'skills' => ['PHP', 'Laravel'],
        ], $overrides);
    }

    public function test_the_public_list_shows_only_open_jobs_and_can_be_filtered(): void
    {
        JobPost::factory()->create(['title' => 'React Developer', 'work_mode' => 'remote', 'skills' => ['React']]);
        // Fixed skills: the factory picks random ones, and "React" among them would match the search below.
        JobPost::factory()->create(['title' => 'Accountant', 'work_mode' => 'onsite', 'skills' => ['Excel']]);
        JobPost::factory()->closed()->create(['title' => 'Closed role']);
        JobPost::factory()->create(['title' => 'Expired role', 'deadline' => now()->subDay()]);

        $this->getJson('/api/jobs')->assertOk()->assertJsonPath('meta.total', 2);

        $this->getJson('/api/jobs?search=react')->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.title', 'React Developer');
        $this->getJson('/api/jobs?work_mode=onsite')->assertJsonPath('data.0.title', 'Accountant');
    }

    public function test_a_company_can_post_a_job(): void
    {
        $company = User::factory()->company()->create();

        $this->actingAs($company)->postJson('/api/company/jobs', $this->payload())
            ->assertCreated()
            ->assertJsonPath('data.title', 'Laravel Developer')
            ->assertJsonPath('data.company.id', $company->company->id);

        $this->assertDatabaseHas('job_posts', ['title' => 'Laravel Developer', 'company_id' => $company->company->id]);
    }

    public function test_a_seeker_cannot_post_a_job(): void
    {
        $this->actingAs(User::factory()->create())
            ->postJson('/api/company/jobs', $this->payload())
            ->assertForbidden();
    }

    public function test_salary_max_cannot_be_below_salary_min(): void
    {
        $this->actingAs(User::factory()->company()->create())
            ->postJson('/api/company/jobs', $this->payload(['salary_min' => 2000, 'salary_max' => 1000]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('salary_max');
    }

    public function test_a_company_cannot_edit_or_delete_another_companys_job(): void
    {
        $job = JobPost::factory()->create();
        $other = User::factory()->company()->create();

        $this->actingAs($other)->putJson("/api/company/jobs/{$job->id}", $this->payload())->assertForbidden();
        $this->actingAs($other)->deleteJson("/api/company/jobs/{$job->id}")->assertForbidden();
        $this->assertDatabaseHas('job_posts', ['id' => $job->id]);
    }
}
