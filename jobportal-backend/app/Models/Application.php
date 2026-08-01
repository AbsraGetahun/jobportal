<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'job_id',
        'cover_letter',
        'resume',
        'status',
        'additional_skills',
        'applied_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // An application belongs to a user (job seeker)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // An application belongs to a job
    public function job()
    {
        return $this->belongsTo(Job::class);
    }
}
