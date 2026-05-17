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
        'additional_addresses',
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
        'additional_addresses' => 'array',
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

    // Old records stored absolute dev URLs like
    // "http://127.0.0.1:8000/images/buildings/foo.jpeg". Those break the
    // moment the app runs on a different host/port (production, a colleague's
    // machine, `php artisan serve` on another port, or even `localhost` vs
    // `127.0.0.1`). Strip the host so the browser resolves the path against
    // the current origin.
    protected function stripLocalHost(?string $url): ?string
    {
        if (! $url) {
            return $url;
        }
        return preg_replace(
            '#^https?://(?:127\.0\.0\.1|localhost|0\.0\.0\.0)(?::\d+)?#i',
            '',
            $url
        );
    }

    public function getMainImageAttribute($value)
    {
        return $this->stripLocalHost($value);
    }

    public function getImagesAttribute($value)
    {
        $images = is_string($value) ? json_decode($value, true) : $value;
        if (! is_array($images)) {
            return $images;
        }
        return array_map(fn ($u) => is_string($u) ? $this->stripLocalHost($u) : $u, $images);
    }

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

    /**
     * Parse a Canadian street address into Repliers-style {number, name}.
     * Handles multi-word street names ("Lake Shore") by stripping the trailing
     * suffix ("Blvd", "Street", ...) and direction ("W", "East", ...).
     */
    public static function parseStreetAddress(?string $address): ?array
    {
        if (!$address) return null;
        if (!preg_match('/^(\d+)\s+(.+)$/u', trim($address), $m)) return null;
        $rest = preg_replace('/\s+(?:W|E|N|S|West|East|North|South|NE|NW|SE|SW)\.?$/i', '', $m[2]);
        $rest = preg_replace(
            '/\s+(?:St|Street|Ave|Avenue|Blvd|Boulevard|Dr|Drive|Rd|Road|Ln|Lane|Way|Crescent|Cres|Court|Ct|Place|Pl|Park|Parkway|Pkwy|Square|Sq|Terrace|Ter|Circle|Cir|Trail|Tr|Gate|Hill|Heights|Hts|Mews|Walk|Common|Commons)\.?$/i',
            '',
            $rest
        );
        $name = trim($rest);
        return $name === '' ? null : ['number' => $m[1], 'name' => $name];
    }

    /**
     * Live for-sale / for-rent counts from the Repliers API for the building's
     * street address(es). Cached per building for 10 minutes.
     */
    public function getLiveListingCounts(): array
    {
        return \Illuminate\Support\Facades\Cache::remember(
            'building_listing_counts:' . $this->id,
            600,
            function () {
                $addresses = [];
                foreach ([$this->street_address_1 ?? null, $this->street_address_2 ?? null] as $a) {
                    if ($parsed = self::parseStreetAddress($a)) {
                        $addresses[] = $parsed;
                    }
                }
                if (empty($addresses) && !empty($this->address)) {
                    $parts = preg_split('/\s*[,&]\s*/', $this->address);
                    foreach (array_filter(array_map('trim', $parts)) as $part) {
                        if ($parsed = self::parseStreetAddress($part)) {
                            $addresses[] = $parsed;
                        }
                    }
                }

                $sale = 0;
                $rent = 0;
                if (empty($addresses)) {
                    return ['sale' => 0, 'rent' => 0];
                }

                try {
                    $api = app(\App\Services\RepliersApiService::class);
                    foreach ($addresses as $addr) {
                        foreach (['sale', 'lease'] as $t) {
                            $params = [
                                'class' => 'condoProperty',
                                'status' => 'A',
                                'type' => $t,
                                'streetNumber' => $addr['number'],
                                'streetName' => $addr['name'],
                                'pageNum' => 1,
                                'resultsPerPage' => 1,
                            ];
                            if (!empty($this->city)) {
                                $params['city'] = $this->city;
                            }
                            $count = (int) ($api->searchListings($params)['count'] ?? 0);
                            if ($t === 'sale') $sale += $count; else $rent += $count;
                        }
                    }
                } catch (\Throwable $e) {
                    \Log::warning('Building listing count fetch failed', [
                        'building_id' => $this->id,
                        'error' => $e->getMessage(),
                    ]);
                }

                return ['sale' => $sale, 'rent' => $rent];
            }
        );
    }

}