<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SavedJob extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'job_id',
    ];

    /**
     * Relationship: A saved job belongs to a user
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relationship: A saved job belongs to a job
     */
    public function job()
    {
        return $this->belongsTo(Job::class, 'job_id');
    }
}
