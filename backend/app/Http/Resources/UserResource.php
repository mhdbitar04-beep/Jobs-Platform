<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'is_active' => $this->is_active,
            'phone' => $this->phone,
            'location' => $this->location,
            'headline' => $this->headline,
            'bio' => $this->bio,
            'skills' => $this->skills ?? [],
            'has_resume' => $this->resume_path !== null,
            'company' => $this->relationLoaded('company') && $this->company ? new CompanyResource($this->company) : null,
            'created_at' => $this->created_at,
        ];
    }
}
