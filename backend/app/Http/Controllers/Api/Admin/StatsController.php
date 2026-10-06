<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\JobResource;
use App\Http\Resources\UserResource;
use App\Models\Application;
use App\Models\Category;
use App\Models\JobPost;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class StatsController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $byStatus = Application::query()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return response()->json(['data' => [
            'users' => User::count(),
            'seekers' => User::where('role', User::ROLE_SEEKER)->count(),
            'companies' => User::where('role', User::ROLE_COMPANY)->count(),
            'jobs' => JobPost::count(),
            'open_jobs' => JobPost::open()->count(),
            'applications' => Application::count(),
            'jobs_by_category' => Category::withCount('jobs')->orderByDesc('jobs_count')->get()
                ->map(fn (Category $c) => ['name' => $c->name, 'count' => $c->jobs_count]),
            'applications_by_status' => collect(Application::STATUSES)
                ->mapWithKeys(fn (string $status) => [$status => (int) ($byStatus[$status] ?? 0)]),
            'recent_users' => UserResource::collection(User::with('company')->latest()->limit(5)->get()),
            'recent_jobs' => JobResource::collection(
                JobPost::with(['company', 'category'])->withCount('applications')->latest()->limit(5)->get()
            ),
        ]]);
    }
}
