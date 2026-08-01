<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class JobView extends Model
{
        use HasFactory;
    protected $fillable = [
        'user_id',
        'job_id',
    ];
    
    /**
     * Get the user that viewed the job
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    /**
     * Get the job that was viewed
     */
    public function job()
    {
        return $this->belongsTo(Job::class);
    }
}
