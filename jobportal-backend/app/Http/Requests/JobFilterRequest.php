<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class JobFilterRequest extends FormRequest
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
            'search' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'job_type' => 'nullable|string|max:50|in:full-time,part-time,contract,freelance,internship,remote',
            'experience_level' => 'nullable|string|max:50|in:entry,intermediate,senior,expert,director',
            'category' => 'nullable|string|max:100|in:technology,healthcare,finance,education,marketing,sales,engineering,design,hr,legal,other',
            'salary_min' => 'nullable|numeric|min:0|max:1000000',
            'salary_max' => 'nullable|numeric|min:0|max:1000000|gte:salary_min',
            'is_remote' => 'nullable|boolean',
            'sort_by' => 'nullable|string|in:title,created_at,salary,application_deadline',
            'sort_direction' => 'nullable|string|in:asc,desc',
            'per_page' => 'nullable|integer|min:1|max:100'
        ];
    }
}
