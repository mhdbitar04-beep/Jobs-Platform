<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'cover_letter' => $this->cover_letter,
            'has_resume' => $this->resume_path !== null,
            'created_at' => $this->created_at,
            'job' => new JobResource($this->job),
            'applicant' => $this->whenLoaded('applicant', fn () => [
                'id' => $this->applicant->id,
                'name' => $this->applicant->name,
                'email' => $this->applicant->email,
                'phone' => $this->applicant->phone,
                'location' => $this->applicant->location,
                'headline' => $this->applicant->headline,
                'bio' => $this->applicant->bio,
                'skills' => $this->applicant->skills ?? [],
            ]),
        ];
    }
}
