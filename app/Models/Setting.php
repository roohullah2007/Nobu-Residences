<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'type',
        'description',
        'group',
        'is_public',
        'is_encrypted',
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'is_encrypted' => 'boolean',
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        // Clear cache when setting is updated
        static::saved(function ($setting) {
            Cache::forget('setting_' . $setting->key);
            Cache::forget('settings_group_' . $setting->group);
        });

        static::deleted(function ($setting) {
            Cache::forget('setting_' . $setting->key);
            Cache::forget('settings_group_' . $setting->group);
        });
    }

    /**
     * Get value accessor with type casting and decryption
     */
    public function getValueAttribute($value)
    {
        if ($this->is_encrypted && !empty($value)) {
            try {
                $value = Crypt::decryptString($value);
            } catch (\Exception $e) {
                \Log::error('Failed to decrypt setting: ' . $this->key);
                return null;
            }
        }

        return match ($this->type) {
            'json' => json_decode($value, true),
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'integer' => (int) $value,
            'float' => (float) $value,
            default => $value,
        };
    }

    /**
     * Set value mutator with encryption
     */
    public function setValueAttribute($value)
    {
        if ($this->type === 'json') {
            $value = json_encode($value);
        }

        if ($this->is_encrypted && !empty($value)) {
            $value = Crypt::encryptString($value);
        }

        $this->attributes['value'] = $value;
    }

    /**
     * Get a setting value by key
     */
    public static function get(string $key, $default = null)
    {
        // Check if database table exists to prevent errors during migrations
        try {
            if (!\Illuminate\Support\Facades\Schema::hasTable('settings')) {
                return $default;
            }
        } catch (\Exception $e) {
            return $default;
        }

        return Cache::remember('setting_' . $key, 3600, function () use ($key, $default) {
            $setting = static::where('key', $key)->first();
            return $setting ? $setting->value : $default;
        });
    }

    /**
     * Set a setting value by key
     */
    public static function set(string $key, $value, array $attributes = []): self
    {
        return static::updateOrCreate(
            ['key' => $key],
            array_merge([
                'value' => $value,
                'type' => static::guessType($value),
            ], $attributes)
        );
    }

    /**
     * Get all settings for a group
     */
    public static function getGroup(string $group): array
    {
        return Cache::remember('settings_group_' . $group, 3600, function () use ($group) {
            return static::where('group', $group)
                ->get()
                ->pluck('value', 'key')
                ->toArray();
        });
    }

    /**
     * Get public settings (safe for frontend)
     */
    public static function getPublic(string $group = null): array
    {
        $query = static::where('is_public', true);
        
        if ($group) {
            $query->where('group', $group);
        }

        return $query->get()->pluck('value', 'key')->toArray();
    }

    /**
     * Guess the type of a value
     */
    private static function guessType($value): string
    {
        if (is_bool($value)) {
            return 'boolean';
        }

        if (is_int($value)) {
            return 'integer';
        }

        if (is_float($value)) {
            return 'float';
        }

        if (is_array($value)) {
            return 'json';
        }

        return 'string';
    }

    /**
     * Scope for public settings
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope for group
     */
    public function scopeGroup($query, string $group)
    {
        return $query->where('group', $group);
    }

    /**
     * Scope for API settings
     */
    public function scopeApiSettings($query)
    {
        return $query->where('group', 'api');
    }
}