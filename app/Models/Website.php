<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Website extends Model
{
    use HasFactory;

    /**
     * Keep the TenantResolver's cross-request domain cache honest: whenever a
     * website is saved or deleted, drop the cached lookup for both its old
     * and new domain so Host-header resolution reflects the change at once.
     */
    protected static function booted(): void
    {
        $flushDomainCache = function (self $website): void {
            \App\Services\Tenancy\TenantResolver::forgetDomain($website->domain);
            \App\Services\Tenancy\TenantResolver::forgetDomain($website->getOriginal('domain'));
        };

        static::saved($flushDomainCache);
        static::deleted($flushDomainCache);
    }

    protected $fillable = [
        'name',
        'slug',
        'domain',
        'is_default',
        'is_active',
        'homepage_building_id',
        'use_building_as_homepage',
        'logo',
        'logo_url',
        'logo_width',
        'logo_height',
        'brand_colors',
        'fonts',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'favicon_url',
        'contact_info',
        'social_media',
        'description',
        'business_hours',
        'timezone',
        'cloudflare_hostname_id',
        'cloudflare_status',
        'cloudflare_ssl_status',
        'cloudflare_last_error',
        'cloudflare_active_at',
        'tracking_scripts',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'is_active' => 'boolean',
        'use_building_as_homepage' => 'boolean',
        'brand_colors' => 'array',
        'fonts' => 'array',
        'contact_info' => 'array',
        'social_media' => 'array',
        'business_hours' => 'array',
        'cloudflare_active_at' => 'datetime',
    ];

    /**
     * Get the pages for this website
     */
    public function pages(): HasMany
    {
        return $this->hasMany(WebsitePage::class);
    }

    /**
     * Get the agent info for this website
     */
    public function agentInfo()
    {
        return $this->hasOne(AgentInfo::class);
    }

    /**
     * Get the homepage building for this website
     */
    public function homepageBuilding()
    {
        return $this->belongsTo(Building::class, 'homepage_building_id');
    }

    /**
     * Get the home page for this website
     */
    public function homePage()
    {
        return $this->pages()->where('page_type', 'home')->first();
    }

    /**
     * Get brand colors with default values. Falls back to the default
     * website's palette (typically Nobu) so every site looks consistent
     * out of the box. Only if there's no default website at all do we
     * use the hardcoded skeleton defaults.
     */
    public function getBrandColors(): array
    {
        $skeletonDefaults = [
            'primary' => '#912018',
            'secondary' => '#293056',
            'accent' => '#F5F8FF',
            'text' => '#000000',
            'background' => '#FFFFFF',
        ];

        // If this row already has its own colors saved, those win. Layer them
        // on top of the skeleton so any keys the admin didn't customize still
        // resolve to something sensible.
        if (!empty($this->brand_colors)) {
            return array_merge($skeletonDefaults, $this->brand_colors);
        }

        // No saved colors — inherit the default website's palette if one
        // exists. Guard against infinite recursion: don't recurse when
        // *this* row is the default.
        if (!$this->is_default) {
            $defaultSite = static::where('is_default', true)->first();
            if ($defaultSite && !empty($defaultSite->brand_colors)) {
                return array_merge($skeletonDefaults, $defaultSite->brand_colors);
            }
        }

        return $skeletonDefaults;
    }

    /**
     * Get contact information (no hardcoded fallbacks)
     * Returns what's saved in the database
     */
    public function getContactInfo(): array
    {
        // Return saved contact info or empty defaults (no hardcoded values)
        $defaults = [
            'phone' => '',
            'email' => '',
            'address' => '',
        ];

        if (!$this->contact_info) {
            return $defaults;
        }

        return array_merge($defaults, $this->contact_info);
    }

    /**
     * Get social media links (no hardcoded fallbacks)
     * Returns what's saved in the database
     */
    public function getSocialMedia(): array
    {
        // Return saved social media or empty defaults (no hardcoded values)
        $defaults = [
            'facebook' => '',
            'instagram' => '',
            'twitter' => '',
            'linkedin' => '',
        ];

        if (!$this->social_media) {
            return $defaults;
        }

        return array_merge($defaults, $this->social_media);
    }

    /**
     * Scope to get the default website
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    /**
     * Scope to get active websites
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
