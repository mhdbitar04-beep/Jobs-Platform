<?php

namespace App\Http\Controllers\Api\Company;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $company = $request->user()->company;

        $recent = $company->applications()
            ->with(['job.company', 'job.category', 'applicant'])
            ->latest('applications.created_at')
            ->limit(5)
            ->get();

        return response()->json(['data' => [
            'jobs_total' => $company->jobs()->count(),
            'jobs_open' => $company->jobs()->open()->count(),
            'applications_total' => $company->applications()->count(),
            'applications_pending' => $company->applications()->where('applications.status', 'pending')->count(),
            'recent_applications' => ApplicationResource::collection($recent),
        ]]);
    }
}
