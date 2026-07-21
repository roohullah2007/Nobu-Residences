<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Neighbourhood extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'city',
        'description',
        'is_active',
        'sort_order'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer'
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($neighbourhood) {
            if (empty($neighbourhood->slug)) {
                $neighbourhood->slug = static::uniqueSlugFor($neighbourhood->name);
            }
        });

        static::updating(function ($neighbourhood) {
            if ($neighbourhood->isDirty('name') && !$neighbourhood->isDirty('slug')) {
                $neighbourhood->slug = static::uniqueSlugFor($neighbourhood->name, $neighbourhood->id);
            }
        });
    }

    /**
     * The slug column is globally unique while names can repeat across
     * cities ("Downtown" in Toronto and Hamilton) — suffix a counter instead
     * of letting the insert die on the unique index.
     */
    protected static function uniqueSlugFor(?string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug((string) $name) ?: 'neighbourhood';
        $slug = $base;
        $i = 2;
        while (static::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = $base . '-' . $i++;
        }
        return $slug;
    }

    /**
     * Get the sub-neighbourhoods for this neighbourhood.
     */
    public function subNeighbourhoods()
    {
        return $this->hasMany(SubNeighbourhood::class);
    }

    /**
     * Get the buildings in this neighbourhood.
     */
    public function buildings()
    {
        return $this->hasMany(Building::class);
    }

    /**
     * Scope for active neighbourhoods.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for ordered neighbourhoods.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc')->orderBy('name', 'asc');
    }

    /**
     * Scope to filter by city.
     */
    public function scopeInCity($query, $city)
    {
        return $query->where('city', $city);
    }
}
