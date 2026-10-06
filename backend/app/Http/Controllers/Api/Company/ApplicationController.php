<?php

namespace App\Http\Controllers\Api\Company;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationResource;
use App\Http\Resources\JobResource;
use App\Models\Application;
use App\Models\JobPost;
use App\Notifications\ApplicationStatusChanged;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

/** The applications a company received for its jobs. */
class ApplicationController extends Controller
{
    /** Every application across all of the company's jobs. */
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate(['status' => ['nullable', Rule::in(Application::STATUSES)]]);

        $applications = $request->user()->company->applications()
            ->with(['job.company', 'job.category', 'applicant'])
            ->when($request->query('status'), fn ($q, $status) => $q->where('applications.status', $status))
            ->latest('applications.created_at')
            ->get();

        return ApplicationResource::collection($applications);
    }

    /** The applicants of one job. */
    public function forJob(Request $request, JobPost $job): JsonResponse
    {
        Gate::authorize('manage', $job);

        $request->validate(['status' => ['nullable', Rule::in(Application::STATUSES)]]);

        $job->load(['company', 'category'])->loadCount('applications');

        $applications = $job->applications()
            ->with('applicant')
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->get()
            ->each(fn (Application $application) => $application->setRelation('job', $job));

        return response()->json([
            'data' => ApplicationResource::collection($applications),
            'job' => new JobResource($job),
        ]);
    }

    public function update(Request $request, Application $application): ApplicationResource
    {
        $application->load(['job.company', 'job.category', 'applicant']);

        Gate::authorize('review', $application);

        $data = $request->validate(['status' => ['required', Rule::in(Application::STATUSES)]]);

        if ($application->status !== $data['status']) {
            $application->update($data);
            $application->applicant->notify(new ApplicationStatusChanged($application));
        }

        return new ApplicationResource($application);
    }
}
