<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FraudAlert extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'severity',
        'description',
        'data',
        'user_id',
        'admin_id',
        'status',
        'resolution_notes',
        'resolved_at'
    ];

    protected $casts = [
        'data' => 'array',
        'resolved_at' => 'datetime',
    ];

    /**
     * Get the user that triggered the fraud alert.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the admin who investigated the alert.
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * Scope for filtering by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for filtering by severity
     */
    public function scopeBySeverity($query, $severity)
    {
        return $query->where('severity', $severity);
    }

    /**
     * Scope for filtering by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope for open alerts
     */
    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }

    /**
     * Scope for critical alerts
     */
    public function scopeCritical($query)
    {
        return $query->where('severity', 'critical');
    }
}