<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Property extends Model
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
        'building_id',
        'title',
        'description',
        'address',
        'full_address',
        'city',
        'province',
        'postal_code',
        'country',
        'latitude',
        'longitude',
        'price',

        'property_type',
        'transaction_type', // sale, rent, lease
        'status', // active, sold, rented, inactive
        'bedrooms',
        'bathrooms',
        'area',
        'area_unit', // sqft, sqm
        'parking',
        'maintenance_fees',
        'property_taxes',
        'exposure',
        'year_built',
        'features',
        'images',
        'virtual_tour_url',
        'listing_date',
        'expiry_date',
        'mls_number',
        'is_featured',
        'view_count',
    ];

    protected $casts = [
        'features' => 'array',
        'images' => 'array',
        'price' => 'decimal:2',

        'maintenance_fees' => 'decimal:2',
        'property_taxes' => 'decimal:2',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'listing_date' => 'date',
        'expiry_date' => 'date',
        'is_featured' => 'boolean',
    ];

    protected $dates = [
        'listing_date',
        'expiry_date',
        'deleted_at',
    ];

    /**
     * Get the building that owns the property
     */
    public function building(): BelongsTo
    {
        return $this->belongsTo(Building::class);
    }

    /**
     * Scope for active properties
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for featured properties
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope for properties by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('property_type', $type);
    }

    /**
     * Scope for properties by transaction type
     */
    public function scopeByTransaction($query, $transactionType)
    {
        return $query->where('transaction_type', $transactionType);
    }

    /**
     * Scope for properties within price range
     */
    public function scopePriceBetween($query, $minPrice, $maxPrice)
    {
        return $query->whereBetween('price', [$minPrice, $maxPrice]);
    }

    /**
     * Scope for properties by city
     */
    public function scopeByCity($query, $city)
    {
        return $query->where('city', $city);
    }

    /**
     * Get formatted price
     */
    public function getFormattedPriceAttribute()
    {
        return '$' . number_format($this->price, 0);
    }

    /**
     * Get property main image
     */
    public function getMainImageAttribute()
    {
        if ($this->images && count($this->images) > 0) {
            return $this->images[0];
        }
        return '/images/property-placeholder.jpg';
    }





    /**
     * Get property data formatted for display
     */
    public function getDisplayData(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'address' => $this->address,
            'full_address' => $this->full_address,
            'city' => $this->city,
            'province' => $this->province,
            'postal_code' => $this->postal_code,
            'country' => $this->country,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'price' => $this->price,
            'formatted_price' => $this->getFormattedPriceAttribute(),
            'property_type' => $this->property_type,
            'transaction_type' => $this->transaction_type,
            'status' => $this->status,
            'bedrooms' => $this->bedrooms,
            'bathrooms' => $this->bathrooms,
            'area' => $this->area,
            'area_unit' => $this->area_unit,
            'parking' => $this->parking,
            'maintenance_fees' => $this->maintenance_fees,
            'property_taxes' => $this->property_taxes,
            'exposure' => $this->exposure,
            'year_built' => $this->year_built,
            'features' => $this->features ?? [],
            'images' => $this->images ?? [],
            'virtual_tour_url' => $this->virtual_tour_url,
            'listing_date' => $this->listing_date,
            'mls_number' => $this->mls_number,
            'is_featured' => $this->is_featured,
            'view_count' => $this->view_count,
        ];
    }



    /**
     * Increment view count
     */
    public function incrementViewCount()
    {
        $this->increment('view_count');
    }
}
