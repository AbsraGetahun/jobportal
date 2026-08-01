<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'logo',
        'description',
        'industry',
        'website',
        'phone',
        'email',
        'address',
        'city',
        'state',
        'country',
        'postal_code',
        'location',
        'employees_count',
        'establishment_year',
        'is_verified',
        'user_id',
    ];

    protected $casts = [
        'employees_count' => 'integer',
        'establishment_year' => 'integer',
        'is_verified' => 'boolean',
        'user_id' => 'integer',
    ];

    // A company can have many jobs
    public function jobs()
    {
        return $this->hasMany(Job::class);
    }

    // A company belongs to a user (owner)
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
