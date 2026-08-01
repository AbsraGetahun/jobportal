<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PremiumJobPosting extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'job_id',
        'user_id',
        'start_date',
        'end_date',
        'status',
        'amount',
        'currency',
        'payment_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the job associated with the premium job posting.
     */
    public function job()
    {
        return $this->belongsTo(Job::class);
    }

    /**
     * Get the user that owns the premium job posting.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the payment for the premium job posting.
     */
    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }
}