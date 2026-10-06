<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CompanyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'website' => $this->website,
            'location' => $this->location,
            'industry' => $this->industry,
            'size' => $this->size,
            'description' => $this->description,
            'open_jobs_count' => $this->whenCounted('jobs'),
        ];
    }
}
