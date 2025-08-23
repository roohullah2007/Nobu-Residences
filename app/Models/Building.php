<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Building extends Model
{
    use HasFactory, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = Str::uuid()->toString();
            }
        });
    }

    protected $fillable = [
        'name',
        'address',
        'city',
        'province',
        'postal_code',
        'country',
        'building_type',
        'total_units',
        'year_built',
        'description',
        'main_image',
        'images',
        'developer_id',
        'management_name',
        'corp_number',
        'date_registered',
        'status',
        'listing_type',
        'is_featured',
        'latitude',
        'longitude',
        'floors',
        'parking_spots',
        'price_range',
        'bedrooms',
        'bathrooms',
        'locker_spots',
        'maintenance_fee_range',
        'price_range',
        'website_url',
        'brochure_url',
        'floor_plans',
        'virtual_tour_url',
        'features',
        'nearby_transit',
        'neighborhood_info',
        'deposit_structure',
        'estimated_completion',
        'architect',
        'interior_designer',
        'landscape_architect'
    ];

    protected $casts = [
        'date_registered' => 'date',
        'images' => 'array',
        'floor_plans' => 'array',
        'features' => 'array',
        'nearby_transit' => 'array',
        'is_featured' => 'boolean',
        'total_units' => 'integer',
        'year_built' => 'integer',
        'floors' => 'integer',
        'parking_spots' => 'integer',
        'locker_spots' => 'integer',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    protected $dates = [
        'date_registered',
        'deleted_at',
    ];

    /**
     * Get the developer that owns this building
     */
    public function developer()
    {
        return $this->belongsTo(Developer::class);
    }

    /**
     * Get the amenities for this building
     */
    public function amenities()
    {
        return $this->belongsToMany(Amenity::class)->withTimestamps();
    }

    /**
     * Get properties in this building
     */
    public function properties(): HasMany
    {
        return $this->hasMany(Property::class);
    }

    /**
     * Get active properties in this building
     */
    public function activeProperties(): HasMany
    {
        return $this->properties()->where('status', 'active');
    }


    /**
     * Scope for buildings by city
     */
    public function scopeByCity($query, $city)
    {
        return $query->where('city', $city);
    }



    /**
     * Get available units count
     */
    public function getAvailableUnitsCountAttribute()
    {
        return $this->activeProperties()->count();
    }


    /**
     * Get building data formatted for display
     */
    public function getDisplayData(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'address' => $this->address,
            'city' => $this->city,
            'province' => $this->province,
            'developer' => $this->developer,
            'management_name' => $this->management_name,
            'corp_number' => $this->corp_number,
            'date_registered' => $this->date_registered,
            'amenities' => $this->amenities,
            'available_units_count' => $this->getAvailableUnitsCountAttribute(),
        ];
    }

}