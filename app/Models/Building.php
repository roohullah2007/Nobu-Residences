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
            // Generate slug from name
            if (empty($model->slug) && !empty($model->name)) {
                $model->slug = Str::slug($model->name);
            }
        });
        
        static::updating(function ($model) {
            // Update slug if name changes and slug is not manually set
            if ($model->isDirty('name') && !$model->isDirty('slug')) {
                $model->slug = Str::slug($model->name);
            }
        });
    }

    protected $fillable = [
        'name',
        'slug',
        'address',
        'street_address_1',
        'street_address_2',
        'city',
        'neighbourhood',
        'neighbourhood_id',
        'sub_neighbourhood',
        'sub_neighbourhood_id',
        'province',
        'postal_code',
        'country',
        'building_type',
        'total_units',
        'units_for_sale',
        'units_for_rent',
        'year_built',
        'description',
        'main_image',
        'images',
        'developer_id',
        'developer',
        'developer_name',
        'management',
        'management_name',
        'management_company',
        'corp',
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
        'landscape_architect',
        'agent_name',
        'agent_title',
        'agent_brokerage',
        'agent_phone',
        'agent_email',
        'agent_image'
        // Removed 'amenities' - now using relationship table
        // Removed 'maintenance_fee_amenities' - now using relationship table
    ];

    protected $casts = [
        'date_registered' => 'date',
        'images' => 'array',
        'floor_plans' => 'array',
        'features' => 'array',
        'nearby_transit' => 'array',
        // Removed 'amenities' => 'array' - now using relationship table
        // Removed 'maintenance_fee_amenities' => 'array' - now using relationship table
        'is_featured' => 'boolean',
        'total_units' => 'integer',
        'units_for_sale' => 'integer',
        'units_for_rent' => 'integer',
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
        return $this->belongsToMany(Amenity::class, 'amenity_building', 'building_id', 'amenity_id')->withTimestamps();
    }

    /**
     * Get the maintenance fee amenities for this building
     */
    public function maintenanceFeeAmenities()
    {
        return $this->belongsToMany(MaintenanceFeeAmenity::class, 'building_maintenance_fee_amenities', 'building_id', 'maintenance_fee_amenity_id')->withTimestamps();
    }

    /**
     * Get the neighbourhood taxonomy for this building
     */
    public function neighbourhoodTaxonomy()
    {
        return $this->belongsTo(Neighbourhood::class, 'neighbourhood_id');
    }

    /**
     * Get the sub-neighbourhood taxonomy for this building
     */
    public function subNeighbourhoodTaxonomy()
    {
        return $this->belongsTo(SubNeighbourhood::class, 'sub_neighbourhood_id');
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
     * Get the route key for the model
     */
    public function getRouteKeyName()
    {
        return 'slug';
    }
    
    /**
     * Get building data formatted for display
     */
    public function getDisplayData(): array
    {
        // Ensure amenities relationship is loaded
        if (!$this->relationLoaded('amenities')) {
            $this->load('amenities');
        }

        // Ensure maintenanceFeeAmenities relationship is loaded
        if (!$this->relationLoaded('maintenanceFeeAmenities')) {
            $this->load('maintenanceFeeAmenities');
        }

        // Ensure developer relationship is loaded
        if (!$this->relationLoaded('developer')) {
            $this->load('developer');
        }

        // Get amenities from relationship only (no JSON fallback)
        $amenities = $this->amenities->map(function($amenity) {
            return [
                'id' => $amenity->id,
                'name' => $amenity->name,
                'icon' => $amenity->icon
            ];
        })->toArray();

        // Get maintenance fee amenities
        $maintenanceFeeAmenities = $this->maintenanceFeeAmenities->map(function($amenity) {
            return [
                'id' => $amenity->id,
                'name' => $amenity->name,
                'icon' => $amenity->icon
            ];
        })->toArray();

        // Get developer data from relationship
        $developerRelation = $this->getRelation('developer');
        $developerData = null;
        if ($developerRelation) {
            $developerData = [
                'id' => $developerRelation->id,
                'name' => $developerRelation->name,
                'type' => $developerRelation->type,
                'logo' => $developerRelation->logo,
            ];
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'address' => $this->address,
            'street_address_1' => $this->street_address_1,
            'street_address_2' => $this->street_address_2,
            'city' => $this->city,
            'neighbourhood' => $this->neighbourhood,
            'sub_neighbourhood' => $this->sub_neighbourhood,
            'province' => $this->province,
            'developer_id' => $this->developer_id,
            'developer' => $developerData,
            'developer_name' => $this->developer_name ?: ($developerData['name'] ?? null),
            'management_name' => $this->management_name,
            'corp_number' => $this->corp_number,
            'date_registered' => $this->date_registered,
            // Always use relationship amenities
            'amenities' => $amenities,
            'maintenance_fee_amenities' => $maintenanceFeeAmenities,
            'available_units_count' => $this->getAvailableUnitsCountAttribute(),
            'agent_name' => $this->agent_name,
            'agent_title' => $this->agent_title,
            'agent_brokerage' => $this->agent_brokerage,
            'agent_phone' => $this->agent_phone,
            'agent_email' => $this->agent_email,
            'agent_image' => $this->agent_image,
            'main_image' => $this->main_image,
            'images' => $this->images,
            'year_built' => $this->year_built,
            'floors' => $this->floors,
            'total_units' => $this->total_units,
            'units_for_sale' => $this->units_for_sale,
            'units_for_rent' => $this->units_for_rent,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
        ];
    }

}