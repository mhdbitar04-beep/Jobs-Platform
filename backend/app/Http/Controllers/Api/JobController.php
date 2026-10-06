<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\JobResource;
use App\Models\Application;
use App\Models\Category;
use App\Models\Company;
use App\Models\JobPost;
use App\Models\User;
use App\Support\JobFlags;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/** Public, read-only job browsing. */
class JobController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        JobFlags::load($request);

        $query = JobPost::query()
            ->with(['company', 'category'])
            ->open()
            ->filter($request->only(['search', 'category', 'type', 'work_mode', 'experience_level', 'location']));

        $request->query('sort') === 'salary'
            ? $query->orderByDesc('salary_max')->orderByDesc('id')
            : $query->latest()->orderByDesc('id');

        $perPage = min(max((int) $request->query('per_page', 9), 1), 30);

        return JobResource::collection($query->paginate($perPage));
    }

    public function show(Request $request, JobPost $job): JsonResponse
    {
        JobFlags::load($request);

        // A closed job stays visible to people who already have a link to it, but it is not listed.
        $job->load(['company', 'category']);

        $related = JobPost::with(['company', 'category'])
            ->open()
            ->where('category_id', $job->category_id)
            ->whereKeyNot($job->id)
            ->latest()
            ->limit(3)
            ->get();

        return response()->json([
            'data' => new JobResource($job),
            'related' => JobResource::collection($related),
        ]);
    }

    public function categories(): AnonymousResourceCollection
    {
        return CategoryResource::collection(
            Category::withCount(['jobs' => fn ($q) => $q->open()])->orderBy('name')->get()
        );
    }

    public function stats(): JsonResponse
    {
        return response()->json(['data' => [
            'jobs' => JobPost::open()->count(),
            'companies' => Company::count(),
            'seekers' => User::where('role', User::ROLE_SEEKER)->count(),
            'applications' => Application::count(),
        ]]);
    }
}
