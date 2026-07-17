<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'is_agent',
        'photo',
        'bio',
        'is_active',
        'google_id',
        'repliers_client_id',
        'avatar',
        'provider',
        'provider_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_agent' => 'boolean',
        ];
    }

    /**
     * Get the user's property favourites
     */
    public function propertyFavourites(): HasMany
    {
        return $this->hasMany(UserPropertyFavourite::class);
    }

    /**
     * Get the user's saved searches
     */
    public function savedSearches(): HasMany
    {
        return $this->hasMany(SavedSearch::class);
    }

    /**
     * Check if user has favourited a specific property
     */
    public function hasFavouritedProperty(string $listingKey): bool
    {
        return $this->propertyFavourites()
                   ->where('property_listing_key', $listingKey)
                   ->exists();
    }

    /**
     * Get user's favourite property listing keys
     */
    public function getFavouritePropertyKeys(): array
    {
        return $this->propertyFavourites()
                   ->pluck('property_listing_key')
                   ->toArray();
    }

    /**
     * Check if user is admin
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is regular user
     */
    public function isUser(): bool
    {
        return $this->role === 'user';
    }

    /**
     * Check if user has specific role
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    /**
     * Send a queued, site-branded verification email instead of the stock
     * (synchronous, unbranded) one.
     */
    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new \App\Notifications\Auth\VerifyEmailNotification());
    }

    /**
     * Site-branded, minimal password reset email instead of the stock
     * Laravel notification (verbose copy, app-name branding).
     */
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new \App\Notifications\Auth\ResetPasswordNotification($token));
    }
}
