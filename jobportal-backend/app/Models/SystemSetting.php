<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SystemSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'description',
        'is_public',
        'updated_by'
    ];

    protected $casts = [
        'is_public' => 'boolean',
    ];

    /**
     * Get the user who last updated the setting.
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Scope for filtering by group
     */
    public function scopeByGroup($query, $group)
    {
        return $query->where('group', $group);
    }

    /**
     * Scope for filtering by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope for public settings
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Get setting value with proper type casting
     */
    public function getTypedValueAttribute()
    {
        switch ($this->type) {
            case 'boolean':
                return filter_var($this->value, FILTER_VALIDATE_BOOLEAN);
            case 'integer':
                return (int) $this->value;
            case 'json':
                return json_decode($this->value, true);
            default:
                return $this->value;
        }
    }

    /**
     * Set setting value with proper type conversion
     */
    public function setTypedValueAttribute($value)
    {
        switch ($this->type) {
            case 'boolean':
                $this->value = $value ? 'true' : 'false';
                break;
            case 'integer':
                $this->value = (string) (int) $value;
                break;
            case 'json':
                $this->value = json_encode($value);
                break;
            default:
                $this->value = (string) $value;
        }
    }

    /**
     * Get a setting value by key
     */
    public static function getValue($key, $default = null)
    {
        $setting = static::where('key', $key)->first();
        return $setting ? $setting->typed_value : $default;
    }

    /**
     * Set a setting value by key
     */
    public static function setValue($key, $value, $updatedBy = null)
    {
        $setting = static::where('key', $key)->first();

        if ($setting) {
            $setting->typed_value = $value;
            if ($updatedBy) {
                $setting->updated_by = $updatedBy;
            }
            $setting->save();
            return $setting;
        }

        return null;
    }

    /**
     * Get all settings as key-value pairs
     */
    public static function getAllSettings()
    {
        return static::all()->mapWithKeys(function ($setting) {
            return [$setting->key => $setting->typed_value];
        });
    }

    /**
     * Get settings by group as key-value pairs
     */
    public static function getSettingsByGroup($group)
    {
        return static::byGroup($group)->get()->mapWithKeys(function ($setting) {
            return [$setting->key => $setting->typed_value];
        });
    }
}