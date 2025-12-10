<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SubNeighbourhood extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'neighbourhood_id',
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

        static::creating(function ($subNeighbourhood) {
            if (empty($subNeighbourhood->slug)) {
                $subNeighbourhood->slug = Str::slug($subNeighbourhood->name);
            }
        });

        static::updating(function ($subNeighbourhood) {
            if ($subNeighbourhood->isDirty('name') && !$subNeighbourhood->isDirty('slug')) {
                $subNeighbourhood->slug = Str::slug($subNeighbourhood->name);
            }
        });
    }

    /**
     * Get the parent neighbourhood.
     */
    public function neighbourhood()
    {
        return $this->belongsTo(Neighbourhood::class);
    }

    /**
     * Get the buildings in this sub-neighbourhood.
     */
    public function buildings()
    {
        return $this->hasMany(Building::class);
    }

    /**
     * Scope for active sub-neighbourhoods.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for ordered sub-neighbourhoods.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc')->orderBy('name', 'asc');
    }

    /**
     * Scope to filter by neighbourhood.
     */
    public function scopeInNeighbourhood($query, $neighbourhoodId)
    {
        return $query->where('neighbourhood_id', $neighbourhoodId);
    }
}
