<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApplicationResource;
use App\Models\Application;
use App\Models\JobPost;
use App\Notifications\ApplicationReceived;
use App\Support\JobFlags;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

/** What a job seeker does with applications: apply, list, withdraw. */
class ApplicationController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        JobFlags::load($request);

        return ApplicationResource::collection(
            $request->user()->applications()->with(['job.company', 'job.category'])->latest()->get()
        );
    }

    public function store(Request $request, JobPost $job): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'cover_letter' => ['nullable', 'string', 'max:3000'],
            'resume' => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:5120'],
        ]);

        if (! $job->isOpen()) {
            throw ValidationException::withMessages(['job' => 'This job is no longer accepting applications.']);
        }

        if ($job->applications()->where('user_id', $user->id)->exists()) {
            throw ValidationException::withMessages(['job' => 'You have already applied for this job.']);
        }

        // Each application keeps its own copy of the resume, so replacing the
        // profile resume later never changes what a company already received.
        if ($request->hasFile('resume')) {
            $path = $request->file('resume')->store('resumes/applications', 'local');
            $name = $request->file('resume')->getClientOriginalName();
        } elseif ($user->resume_path && Storage::disk('local')->exists($user->resume_path)) {
            $extension = pathinfo($user->resume_path, PATHINFO_EXTENSION);
            $path = 'resumes/applications/'.uniqid('resume_', true).'.'.$extension;
            Storage::disk('local')->copy($user->resume_path, $path);
            $name = str($user->name)->slug().'-resume.'.$extension;
        } else {
            throw ValidationException::withMessages(['resume' => 'Upload a resume, or add one to your profile first.']);
        }

        $application = $job->applications()->create([
            'user_id' => $user->id,
            'cover_letter' => $data['cover_letter'] ?? null,
            'resume_path' => $path,
            'resume_name' => $name,
        ]);

        $application->load(['job.company.user', 'job.category', 'applicant']);
        $application->job->company->user->notify(new ApplicationReceived($application));

        JobFlags::load($request);

        return (new ApplicationResource($application->unsetRelation('applicant')))
            ->response()
            ->setStatusCode(201);
    }

    public function destroy(Application $application): Response
    {
        Gate::authorize('withdraw', $application);

        if ($application->resume_path) {
            Storage::disk('local')->delete($application->resume_path);
        }

        $application->delete();

        return response()->noContent();
    }

    public function resume(Application $application): StreamedResponse
    {
        Gate::authorize('view', $application);

        abort_unless(
            $application->resume_path && Storage::disk('local')->exists($application->resume_path),
            404,
            'No resume was attached to this application.'
        );

        return Storage::disk('local')->download($application->resume_path, $application->resume_name ?? 'resume.pdf');
    }
}
