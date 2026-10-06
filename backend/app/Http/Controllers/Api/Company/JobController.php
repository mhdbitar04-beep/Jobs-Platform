<?php

namespace App\Http\Controllers\Api\Company;

use App\Http\Controllers\Controller;
use App\Http\Resources\JobResource;
use App\Models\JobPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

/** A company's own job posts. */
class JobController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return JobResource::collection(
            $request->user()->company->jobs()
                ->with(['company', 'category'])
                ->withCount('applications')
                ->latest()
                ->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $job = $request->user()->company->jobs()->create($this->validated($request));

        return (new JobResource($job->load(['company', 'category'])->loadCount('applications')))
            ->response()
            ->setStatusCode(201);
    }

    public function show(JobPost $job): JobResource
    {
        Gate::authorize('manage', $job);

        return new JobResource($job->load(['company', 'category'])->loadCount('applications'));
    }

    public function update(Request $request, JobPost $job): JobResource
    {
        Gate::authorize('manage', $job);

        $job->update($this->validated($request, $job));

        return new JobResource($job->load(['company', 'category'])->loadCount('applications'));
    }

    public function destroy(JobPost $job): Response
    {
        Gate::authorize('manage', $job);

        $job->delete();

        return response()->noContent();
    }

    private function validated(Request $request, ?JobPost $job = null): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'description' => ['required', 'string', 'min:30', 'max:8000'],
            'requirements' => ['nullable', 'string', 'max:5000'],
            'location' => ['required', 'string', 'max:150'],
            'type' => ['required', Rule::in(JobPost::TYPES)],
            'work_mode' => ['required', Rule::in(JobPost::WORK_MODES)],
            'experience_level' => ['required', Rule::in(JobPost::LEVELS)],
            'salary_min' => ['nullable', 'integer', 'min:0', 'max:1000000'],
            'salary_max' => ['nullable', 'integer', 'min:0', 'max:1000000', 'gte:salary_min'],
            'skills' => ['nullable', 'array', 'max:12'],
            'skills.*' => ['string', 'max:40'],
            // A new job needs a future deadline; an existing one may keep the date it already has.
            'deadline' => ['nullable', 'date', $job ? 'date' : 'after_or_equal:today'],
            'status' => ['sometimes', Rule::in(JobPost::STATUSES)],
        ]);
    }
}
