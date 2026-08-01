<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'application_id',
        'type',
        'title',
        'message',
        'data',
        'is_read',
        'job_id',
    ];

    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // A notification belongs to a user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // A notification can belong to an application
    public function application()
    {
        return $this->belongsTo(Application::class);
    }
}
