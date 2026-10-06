<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\JobPost;
use App\Models\User;
use App\Notifications\ApplicationReceived;
use App\Notifications\ApplicationStatusChanged;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ApplicationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
    }

    private function resume(): UploadedFile
    {
        return UploadedFile::fake()->create('cv.pdf', 120, 'application/pdf');
    }

    public function test_applying_stores_the_resume_and_notifies_the_company(): void
    {
        Notification::fake();
        $job = JobPost::factory()->create();
        $seeker = User::factory()->create();

        $response = $this->actingAs($seeker)->post("/api/jobs/{$job->id}/apply", [
            'cover_letter' => 'I would love to join.',
            'resume' => $this->resume(),
        ], ['Accept' => 'application/json']);

        $response->assertCreated()->assertJsonPath('data.status', 'pending')->assertJsonPath('data.job.has_applied', true);

        $application = Application::sole();
        Storage::disk('local')->assertExists($application->resume_path);
        Notification::assertSentTo($job->company->user, ApplicationReceived::class);
    }

    public function test_the_company_sees_the_notification_and_the_applicant(): void
    {
        $job = JobPost::factory()->create();
        $seeker = User::factory()->create(['name' => 'Sara Haddad']);

        $this->actingAs($seeker)->post("/api/jobs/{$job->id}/apply", ['resume' => $this->resume()], ['Accept' => 'application/json'])
            ->assertCreated();

        $owner = $job->company->user;

        $this->actingAs($owner)->getJson('/api/notifications')
            ->assertOk()
            ->assertJsonPath('unread_count', 1)
            ->assertJsonPath('data.0.type', 'application_received')
            ->assertJsonPath('data.0.link', "/company/jobs/{$job->id}/applicants");

        $this->actingAs($owner)->getJson("/api/company/jobs/{$job->id}/applications")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.applicant.name', 'Sara Haddad');
    }

    public function test_a_seeker_cannot_apply_twice_or_to_a_closed_job(): void
    {
        $seeker = User::factory()->create();
        $job = JobPost::factory()->create();
        Application::factory()->create(['job_post_id' => $job->id, 'user_id' => $seeker->id]);

        $this->actingAs($seeker)->post("/api/jobs/{$job->id}/apply", ['resume' => $this->resume()], ['Accept' => 'application/json'])
            ->assertUnprocessable();

        $closed = JobPost::factory()->closed()->create();

        $this->actingAs($seeker)->post("/api/jobs/{$closed->id}/apply", ['resume' => $this->resume()], ['Accept' => 'application/json'])
            ->assertUnprocessable();

        $this->assertDatabaseCount('applications', 1);
    }

    public function test_applying_needs_a_resume_but_can_reuse_the_profile_one(): void
    {
        $job = JobPost::factory()->create();
        $seeker = User::factory()->create();

        $this->actingAs($seeker)->postJson("/api/jobs/{$job->id}/apply")
            ->assertUnprocessable()->assertJsonValidationErrors('resume');

        $this->actingAs($seeker)->post('/api/profile/resume', ['resume' => $this->resume()], ['Accept' => 'application/json'])
            ->assertOk()->assertJsonPath('data.has_resume', true);

        $this->actingAs($seeker->fresh())->postJson("/api/jobs/{$job->id}/apply")->assertCreated();
    }

    public function test_companies_and_guests_cannot_apply(): void
    {
        $job = JobPost::factory()->create();

        $this->postJson("/api/jobs/{$job->id}/apply")->assertUnauthorized();
        $this->actingAs(User::factory()->company()->create())->postJson("/api/jobs/{$job->id}/apply")->assertForbidden();
    }

    public function test_a_company_cannot_see_or_review_another_companys_applicants(): void
    {
        $application = Application::factory()->create();
        $other = User::factory()->company()->create();

        $this->actingAs($other)->getJson("/api/company/jobs/{$application->job_post_id}/applications")->assertForbidden();
        $this->actingAs($other)->patchJson("/api/company/applications/{$application->id}", ['status' => 'accepted'])->assertForbidden();
        $this->actingAs($other)->get("/api/applications/{$application->id}/resume", ['Accept' => 'application/json'])->assertForbidden();
    }

    public function test_changing_the_status_notifies_the_applicant(): void
    {
        Notification::fake();
        $application = Application::factory()->create();
        $owner = $application->job->company->user;

        $this->actingAs($owner)->patchJson("/api/company/applications/{$application->id}", ['status' => 'shortlisted'])
            ->assertOk()->assertJsonPath('data.status', 'shortlisted');

        Notification::assertSentTo($application->applicant, ApplicationStatusChanged::class);
    }

    public function test_a_seeker_can_withdraw_only_while_pending(): void
    {
        $seeker = User::factory()->create();
        $pending = Application::factory()->create(['user_id' => $seeker->id]);
        $reviewed = Application::factory()->create(['user_id' => $seeker->id, 'status' => 'reviewed']);

        $this->actingAs($seeker)->deleteJson("/api/my/applications/{$pending->id}")->assertNoContent();
        $this->actingAs($seeker)->deleteJson("/api/my/applications/{$reviewed->id}")->assertForbidden();
    }

    public function test_a_seeker_can_save_and_unsave_a_job(): void
    {
        $seeker = User::factory()->create();
        $job = JobPost::factory()->create();

        $this->actingAs($seeker)->postJson("/api/jobs/{$job->id}/save")->assertJsonPath('saved', true);
        $this->actingAs($seeker)->getJson('/api/my/saved-jobs')->assertJsonCount(1, 'data')->assertJsonPath('data.0.is_saved', true);
        $this->actingAs($seeker)->postJson("/api/jobs/{$job->id}/save")->assertJsonPath('saved', false);
    }
}
