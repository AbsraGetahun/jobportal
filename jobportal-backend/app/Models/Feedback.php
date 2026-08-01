<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Feedback extends Model
{
    protected $fillable = [
        'user_id',
        'subject',
        'message',
        'email',
        'is_resolved'
    ];

    protected $casts = [
        'is_resolved' => 'boolean',
    ];

    /**
     * Get the user that owns the feedback.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
