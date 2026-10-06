<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\JobResource;
use App\Models\JobPost;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class JobController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $jobs = JobPost::with(['company', 'category'])
            ->withCount('applications')
            ->filter($request->only('search'))
            ->when($request->query('status'), fn ($q, string $status) => $q->where('status', $status))
            ->latest()
            ->orderByDesc('id')
            ->paginate(12);

        return JobResource::collection($jobs);
    }

    public function update(Request $request, JobPost $job): JobResource
    {
        $job->update($request->validate(['status' => ['required', Rule::in(JobPost::STATUSES)]]));

        return new JobResource($job->load(['company', 'category'])->loadCount('applications'));
    }

    public function destroy(JobPost $job): Response
    {
        $job->delete();

        return response()->noContent();
    }
}
