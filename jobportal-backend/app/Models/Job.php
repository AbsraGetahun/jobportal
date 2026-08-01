<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Job extends Model
{
    use HasFactory;
    
    protected $table = 'job_listings';

    protected $fillable = [
        'employer_id',
        'title',
        'description',
        'location',
        'job_type',
        'experience_level',
        'salary_min',
        'salary_max',
        'salary_type',
        'category',
        'is_remote',
        'is_active',
        'application_deadline',
        'deadline',
        'job_attachment',
        'status',
        'is_featured',
        'company_id',
    ];

    protected $casts = [
        'salary_min' => 'decimal:2',
        'salary_max' => 'decimal:2',
        'is_remote' => 'boolean',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'application_deadline' => 'datetime',
        'deadline' => 'datetime',
    ];

    // A job belongs to a user (employer)
    public function employer()
    {
        return $this->belongsTo(User::class, 'employer_id');
    }

    // A job can have many applications
    public function applications()
    {
        return $this->hasMany(Application::class);
    }
    
    /**
     * Get the company that owns this job
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }
    public function views()
    {
     return $this->hasMany(JobView::class);
    }

    /**
     * Relationship: A job can be saved by many users
     */
    public function savedJobs()
    {
        return $this->hasMany(SavedJob::class, 'job_id');
    }
}
