<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Filled once per request by JobFlags so a list of jobs costs two queries, not two per row.
        $flags = $request->attributes->get('job_flags', ['applied' => [], 'saved' => []]);

        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'requirements' => $this->requirements,
            'location' => $this->location,
            'type' => $this->type,
            'work_mode' => $this->work_mode,
            'experience_level' => $this->experience_level,
            'salary_min' => $this->salary_min,
            'salary_max' => $this->salary_max,
            'currency' => $this->currency,
            'skills' => $this->skills ?? [],
            'status' => $this->status,
            'deadline' => $this->deadline?->format('Y-m-d'),
            'created_at' => $this->created_at,
            'category' => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ],
            'company' => new CompanyResource($this->company),
            'applications_count' => $this->whenCounted('applications'),
            'has_applied' => in_array($this->id, $flags['applied'], true),
            'is_saved' => in_array($this->id, $flags['saved'], true),
        ];
    }
}
