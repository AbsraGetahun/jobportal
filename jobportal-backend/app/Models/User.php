<?php

namespace App\Models;


use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\JobView;
class User extends Authenticatable implements MustVerifyEmail
{
    
use HasApiTokens, HasFactory, Notifiable;


    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'degree',
        'fieldOfStudy',
        'graduationYear',
        'experience',
        'hasCompany',
        'companyName',
        'companyLocation',
        'employeesCount',
        'establishmentYear',
        'profile_picture',
        'is_premium',
        'is_admin',
        'is_verified',
        'is_suspended',
        'last_login_at',
        'admin_permissions',
        'age',
        'gender',
        'location',
        'phone',
        'address',
        'website',
        'stripe_customer_id',
        'email_notifications',
        'sms_notifications',
        'push_notifications',
        'job_alerts',
        'application_updates',
        'company_news',
        'profile_suggestions',
        'saved_jobs_notifications',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts= [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'graduationYear' => 'integer',
        'experience' => 'integer',
        'hasCompany' => 'boolean',
        'employeesCount' => 'integer',
        'establishmentYear' => 'integer',
        'is_premium' => 'boolean',
        'is_admin' => 'boolean',
        'is_verified' => 'boolean',
        'is_suspended' => 'boolean',
        'last_login_at' => 'datetime',
        'admin_permissions' => 'array',
        'age' => 'integer',
        'phone' => 'string',
        'address' => 'string',
        'website' => 'string',
        'stripe_customer_id' => 'string',
        'email_notifications' => 'boolean',
        'sms_notifications' => 'boolean',
        'push_notifications' => 'boolean',
        'job_alerts' => 'boolean',
        'application_updates' => 'boolean',
        'company_news' => 'boolean',
        'profile_suggestions' => 'boolean',
        'saved_jobs_notifications' => 'boolean',
        ];
            
            /**
             * Check if the user is a premium user
             */
    public function isPremium(): bool
    {
        return (bool) $this->is_premium;
    }
    
    /**
     * Check if the user is an admin
     */
    public function isAdmin(): bool
    {
        return (bool) $this->is_admin;
    }
    
    /**
     * Check if the user is an employer
     * An employer is identified by having hasCompany set (either true or false, but not null)
     */
    public function isEmployer(): bool
    {
        return !is_null($this->hasCompany);
    }

    /**
     * Relationship: User has many job views
     */
    public function jobViews()
    {
        return $this->hasMany(JobView::class);
    }

    /**
     * Relationship: User has many saved searches
     */
    public function savedSearches()
    {
        return $this->hasMany(SavedSearch::class);
    }

    /**
     * Track when a user views a job
     */
    public function trackJobView($jobId)
    {
        $view = JobView::where('user_id', $this->id)
                       ->where('job_id', $jobId)
                       ->first();

        if ($view) {
            $view->touch(); // update timestamp
            //$view->update(['updated_at' => now()]);

        } else {
            JobView::create([
                'user_id' => $this->id,
                'job_id' => $jobId,
            ]);
        }
    }

    /**
     * Relationship: User has many companies (if employer)
     */
    public function companies()
    {
        return $this->hasMany(Company::class);
    }

    /**
     * Relationship: User has one primary company (if employer)
     */
    public function company()
    {
        return $this->hasOne(Company::class);
    }

    /**
     * Relationship: User has many saved jobs
     */
    public function savedJobs()
    {
        return $this->hasMany(SavedJob::class);
    }

    /**
     * Get user's most viewed jobs
     */
    public function getMostViewedJobs($limit = 10)
    {
        return JobView::select('job_id')
            ->selectRaw('COUNT(*) as views_count')
            ->where('user_id', $this->id)
            ->groupBy('job_id')
            ->orderByDesc('views_count')
            ->limit($limit)
            ->get();
    }
}
