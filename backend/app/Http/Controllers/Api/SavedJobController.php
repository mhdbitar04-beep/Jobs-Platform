<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\JobResource;
use App\Models\JobPost;
use App\Support\JobFlags;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SavedJobController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        JobFlags::load($request);

        return JobResource::collection(
            $request->user()->savedJobs()->with(['company', 'category'])->orderByPivot('created_at', 'desc')->get()
        );
    }

    public function toggle(Request $request, JobPost $job): JsonResponse
    {
        $result = $request->user()->savedJobs()->toggle([$job->id => ['created_at' => now()]]);

        return response()->json(['saved' => count($result['attached']) > 0]);
    }
}
