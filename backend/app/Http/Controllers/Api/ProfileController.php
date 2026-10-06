<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    public function update(Request $request): UserResource
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:30'],
            'location' => ['nullable', 'string', 'max:150'],
            'headline' => ['nullable', 'string', 'max:150'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'skills' => ['nullable', 'array', 'max:20'],
            'skills.*' => ['string', 'max:40'],
            'company' => ['nullable', 'array'],
            'company.name' => [$user->isCompany() ? 'required' : 'nullable', 'string', 'max:150'],
            'company.website' => ['nullable', 'url', 'max:200'],
            'company.location' => ['nullable', 'string', 'max:150'],
            'company.industry' => ['nullable', 'string', 'max:100'],
            'company.size' => ['nullable', 'string', 'max:30'],
            'company.description' => ['nullable', 'string', 'max:3000'],
        ]);

        $user->update(collect($data)->except('company')->all());

        if ($user->isCompany() && isset($data['company'])) {
            $user->company()->updateOrCreate([], $data['company']);
        }

        return new UserResource($user->load('company'));
    }

    public function resume(Request $request): UserResource
    {
        $request->validate([
            'resume' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:5120'],
        ]);

        $user = $request->user();

        if ($user->resume_path) {
            Storage::disk('local')->delete($user->resume_path);
        }

        $user->update(['resume_path' => $request->file('resume')->store('resumes/profiles', 'local')]);

        return new UserResource($user->load('company'));
    }

    public function password(Request $request): Response
    {
        $data = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $request->user()->update(['password' => $data['password']]);

        return response()->noContent();
    }
}
