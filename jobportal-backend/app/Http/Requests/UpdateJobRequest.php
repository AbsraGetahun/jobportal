<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateJobRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string|min:10|max:5000',
            'location' => 'sometimes|string|max:255',
            'job_type' => 'sometimes|string|max:50|in:full-time,part-time,contract,freelance,internship,remote',
            'experience_level' => 'sometimes|string|max:50|in:entry,intermediate,senior,expert,director',
            'salary_min' => 'nullable|numeric|min:0|max:1000000',
            'salary_max' => 'nullable|numeric|min:0|max:1000000|gte:salary_min',
            'salary_type' => 'nullable|string|max:50|in:hourly,monthly,yearly,project',
            'category' => 'sometimes|string|max:100|in:technology,healthcare,finance,education,marketing,sales,engineering,design,hr,legal,other',
            'is_remote' => 'sometimes|boolean',
            'is_active' => 'sometimes|boolean',
            'application_deadline' => 'nullable|date|after:today|after:created_at',
            'job_attachment' => 'nullable|file|mimes:pdf,doc,docx|max:2048',
        
        ];
    }
}
