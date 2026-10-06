<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\JobPost;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_admins_reach_the_admin_area(): void
    {
        $this->actingAs(User::factory()->create())->getJson('/api/admin/stats')->assertForbidden();
        $this->actingAs(User::factory()->company()->create())->getJson('/api/admin/users')->assertForbidden();
        $this->actingAs(User::factory()->admin()->create())->getJson('/api/admin/stats')->assertOk();
    }

    public function test_suspending_a_user_signs_them_out(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create();
        $user->createToken('web');

        $this->actingAs($admin)->patchJson("/api/admin/users/{$user->id}", ['is_active' => false])
            ->assertOk()->assertJsonPath('data.is_active', false);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_admin_accounts_cannot_be_suspended_or_deleted(): void
    {
        $admin = User::factory()->admin()->create();
        $other = User::factory()->admin()->create();

        $this->actingAs($admin)->patchJson("/api/admin/users/{$other->id}", ['is_active' => false])->assertForbidden();
        $this->actingAs($admin)->deleteJson("/api/admin/users/{$admin->id}")->assertForbidden();
    }

    public function test_an_admin_can_close_and_delete_any_job(): void
    {
        $admin = User::factory()->admin()->create();
        $job = JobPost::factory()->create();

        $this->actingAs($admin)->patchJson("/api/admin/jobs/{$job->id}", ['status' => 'closed'])->assertJsonPath('data.status', 'closed');
        $this->actingAs($admin)->deleteJson("/api/admin/jobs/{$job->id}")->assertNoContent();
        $this->assertDatabaseMissing('job_posts', ['id' => $job->id]);
    }

    public function test_a_category_with_jobs_cannot_be_deleted(): void
    {
        $admin = User::factory()->admin()->create();
        $used = JobPost::factory()->create()->category;
        $empty = Category::factory()->create();

        $this->actingAs($admin)->deleteJson("/api/admin/categories/{$used->id}")->assertUnprocessable();
        $this->actingAs($admin)->deleteJson("/api/admin/categories/{$empty->id}")->assertNoContent();
    }
}
