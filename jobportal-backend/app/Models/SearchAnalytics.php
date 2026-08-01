<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SearchAnalytics extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'user_id',
        'query',
        'search_type',
        'filters',
        'results_count',
        'ip_address',
        'user_agent'
    ];
    
    protected $casts = [
        'filters' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];
    
    /**
     * Get the user that owns the search analytics record
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    /**
     * Scope a query to only include searches by a specific user
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
    
    /**
     * Scope a query to only include searches of a specific type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('search_type', $type);
    }
    
    /**
     * Scope a query to only include searches within a date range
     */
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }
}