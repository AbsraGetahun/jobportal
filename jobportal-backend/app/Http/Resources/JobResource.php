<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'location' => $this->location,
            'job_type' => $this->job_type,
            'experience_level' => $this->experience_level,
            'salary_min' => $this->salary_min,
            'salary_max' => $this->salary_max,
            'salary_type' => $this->salary_type,
            'category' => $this->category,
            'is_remote' => $this->is_remote,
            'is_active' => $this->is_active,
            'application_deadline' => $this->application_deadline,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'employer' => $this->whenLoaded('employer', function () {
                return [
                    'id' => $this->employer->id,
                    'name' => $this->employer->name,
                    'email' => $this->employer->email,
                    'profile_picture' => $this->employer->profile_picture,
                ];
            }),
            'company' => $this->whenLoaded('company', function () {
                return [
                    'id' => $this->company->id,
                    'name' => $this->company->name,
                    'logo' => $this->company->logo,
                    'industry' => $this->company->industry,
                ];
            }),
        ];
    }
}
