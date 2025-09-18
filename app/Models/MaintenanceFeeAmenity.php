<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MaintenanceFeeAmenity extends Model
{
    protected $fillable = [
        'name',
        'icon',
        'category',
        'sort_order',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer'
    ];

    // Scope to get only active amenities
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Scope to order by sort_order
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc')->orderBy('name', 'asc');
    }

    // Relationship with buildings (many-to-many)
    public function buildings()
    {
        return $this->belongsToMany(Building::class, 'building_maintenance_fee_amenities');
    }
}
