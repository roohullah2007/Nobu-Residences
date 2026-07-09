<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Support\Str;

class Developer extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'logo',
        'type',
        'email',
        'phone',
        'website',
        'description',
        'established_year',
        'meta_title',
        'meta_description',
        'projects_completed',
        'projects_under_construction',
        'upcoming_projects',
        'highlights',
        'awards',
    ];

    protected $casts = [
        'established_year' => 'integer',
        'projects_completed' => 'integer',
        'projects_under_construction' => 'integer',
        'upcoming_projects' => 'integer',
        'highlights' => 'array',
        'awards' => 'array',
    ];

    protected static function booted()
    {
        // Persist a unique slug so developer pages have one canonical URL.
        static::saving(function (Developer $developer) {
            if (empty($developer->slug) && !empty($developer->name)) {
                $base = Str::slug($developer->name) ?: 'developer';
                $slug = $base;
                $i = 2;
                while (static::where('slug', $slug)->where('id', '!=', $developer->id)->exists()) {
                    $slug = $base . '-' . $i++;
                }
                $developer->slug = $slug;
            }
        });
    }

    /**
     * Persisted slug with an accessor fallback for rows saved before the
     * slug column existed.
     */
    public function getSlugAttribute($value)
    {
        return $value ?: Str::slug((string) $this->name);
    }

    public function buildings()
    {
        return $this->hasMany(Building::class);
    }
}
