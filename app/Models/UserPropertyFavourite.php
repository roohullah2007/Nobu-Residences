<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPropertyFavourite extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'property_listing_key',
        'property_data',
        'property_address',
        'property_price',
        'property_type',
        'property_city',
    ];

    protected $casts = [
        'property_data' => 'array',
        'property_price' => 'decimal:2',
    ];

    /**
     * Get the user that owns the favourite
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for user favourites
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope for property favourites
     */
    public function scopeForProperty($query, $listingKey)
    {
        return $query->where('property_listing_key', $listingKey);
    }

    /**
     * Check if a user has favourited a specific property
     */
    public static function isPropertyFavourited($userId, $listingKey)
    {
        return static::where('user_id', $userId)
                    ->where('property_listing_key', $listingKey)
                    ->exists();
    }

    /**
     * Get user's favourite property listing keys
     */
    public static function getUserFavouriteKeys($userId)
    {
        return static::where('user_id', $userId)
                    ->pluck('property_listing_key')
                    ->toArray();
    }
}
