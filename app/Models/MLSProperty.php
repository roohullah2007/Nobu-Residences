<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MLSProperty extends Model
{
    use SoftDeletes;

    protected $table = 'mls_properties';

    protected $fillable = [
        'mls_id',
        'mls_number',
        'latitude',
        'longitude',
        'address',
        'city',
        'province',
        'postal_code',
        'country',
        'property_type',
        'property_sub_type',
        'status',
        'price',
        'bedrooms',
        'bathrooms',
        'parking_spaces',
        'square_footage',
        'lot_size',
        'listed_date',
        'sold_date',
        'updated_date',
        'last_synced_at',
        'geocode_attempted_at',
        'geocode_source',
        'mls_data',
        'image_urls',
        'has_images',
        'is_active',
        'sync_failed',
        'sync_error',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'price' => 'decimal:2',
        'bathrooms' => 'decimal:1',
        'square_footage' => 'decimal:2',
        'lot_size' => 'decimal:2',
        'bedrooms' => 'integer',
        'parking_spaces' => 'integer',
        'listed_date' => 'datetime',
        'sold_date' => 'datetime',
        'updated_date' => 'datetime',
        'last_synced_at' => 'datetime',
        'geocode_attempted_at' => 'datetime',
        'mls_data' => 'array',
        'image_urls' => 'array',
        'has_images' => 'boolean',
        'is_active' => 'boolean',
        'sync_failed' => 'boolean',
    ];

    /**
     * Scope to get only active listings
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
                    ->where('sync_failed', false);
    }

    /**
     * Scope for optimized search queries
     * Forces use of the optimized index that includes deleted_at + sort columns
     * This dramatically improves query performance:
     * - COUNT queries: ~2400ms → ~6ms
     * - SELECT with ORDER BY + LIMIT: ~2400ms → ~2ms
     */
    public function scopeOptimizedSearch($query)
    {
        return $query->from(\DB::raw('`mls_properties` FORCE INDEX (`idx_mls_search_sort`)'));
    }

    /**
     * Scope to filter by property type
     */
    public function scopePropertyType($query, $type)
    {
        return $query->where('property_type', $type);
    }

    /**
     * Scope to filter by status
     */
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to filter by location (city)
     */
    public function scopeCity($query, $city)
    {
        return $query->where('city', 'like', '%' . $city . '%');
    }

    /**
     * Scope to filter by price range
     */
    public function scopePriceRange($query, $minPrice = null, $maxPrice = null)
    {
        if ($minPrice) {
            $query->where('price', '>=', $minPrice);
        }
        if ($maxPrice) {
            $query->where('price', '<=', $maxPrice);
        }
        return $query;
    }

    /**
     * Scope to filter by bedrooms
     */
    public function scopeBedrooms($query, $bedrooms)
    {
        return $query->where('bedrooms', '>=', $bedrooms);
    }

    /**
     * Scope to filter by bathrooms
     */
    public function scopeBathrooms($query, $bathrooms)
    {
        return $query->where('bathrooms', '>=', $bathrooms);
    }

    /**
     * Scope to search within radius of lat/lng
     */
    public function scopeWithinRadius($query, $latitude, $longitude, $radiusInKm = 10)
    {
        // Haversine formula for distance calculation
        $query->selectRaw("
            mls_properties.*,
            (
                6371 * acos(
                    cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) +
                    sin(radians(?)) * sin(radians(latitude))
                )
            ) AS distance
        ", [$latitude, $longitude, $latitude])
        ->having('distance', '<=', $radiusInKm)
        ->orderBy('distance');

        return $query;
    }

    /**
     * Get the primary image URL
     */
    public function getPrimaryImageAttribute()
    {
        $images = $this->image_urls ?? [];
        return !empty($images) ? $images[0] : null;
    }

    /**
     * Get formatted price
     */
    public function getFormattedPriceAttribute()
    {
        if (!$this->price) {
            return 'N/A';
        }
        return '$' . number_format($this->price, 0);
    }

    /**
     * Get full address
     */
    public function getFullAddressAttribute()
    {
        $parts = array_filter([
            $this->address,
            $this->city,
            $this->province,
            $this->postal_code,
        ]);
        return implode(', ', $parts);
    }

    /**
     * Check if property needs sync (older than 24 hours)
     */
    public function needsSync()
    {
        if (!$this->last_synced_at) {
            return true;
        }
        return $this->last_synced_at->diffInHours(now()) >= 24;
    }

    /**
     * Mark as synced
     */
    public function markAsSynced()
    {
        $this->update([
            'last_synced_at' => now(),
            'sync_failed' => false,
            'sync_error' => null,
        ]);
    }

    /**
     * Mark sync as failed
     */
    public function markSyncFailed($error)
    {
        $this->update([
            'sync_failed' => true,
            'sync_error' => $error,
            'last_synced_at' => now(),
        ]);
    }

    /**
     * Scope to get properties that need geocoding
     */
    public function scopeNeedsGeocoding($query)
    {
        return $query->where('is_active', true)
                     ->where(function($q) {
                         $q->whereNull('latitude')
                           ->orWhereNull('longitude')
                           ->orWhere('latitude', 0)
                           ->orWhere('longitude', 0);
                     });
    }

    /**
     * Scope to get properties with coordinates
     */
    public function scopeHasCoordinates($query)
    {
        return $query->whereNotNull('latitude')
                     ->whereNotNull('longitude')
                     ->where('latitude', '!=', 0)
                     ->where('longitude', '!=', 0);
    }

    /**
     * Check if property needs geocoding
     */
    public function needsGeocoding(): bool
    {
        return empty($this->latitude) || empty($this->longitude)
            || $this->latitude == 0 || $this->longitude == 0;
    }

    /**
     * Check if property has valid coordinates
     */
    public function hasCoordinates(): bool
    {
        return !$this->needsGeocoding();
    }

    /**
     * Update coordinates from geocoding
     */
    public function updateCoordinates(float $latitude, float $longitude, string $source = 'unknown'): void
    {
        $this->update([
            'latitude' => $latitude,
            'longitude' => $longitude,
            'geocode_source' => $source,
            'geocode_attempted_at' => now(),
        ]);
    }

    /**
     * Mark geocoding as attempted (even if failed)
     */
    public function markGeocodeAttempted(): void
    {
        $this->update([
            'geocode_attempted_at' => now(),
        ]);
    }
}
