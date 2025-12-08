<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Website extends Model
{
    use HasFactory;

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
     * Get brand colors with default values
     * Default brand colors for Nobu Residences theme
     */
    public function getBrandColors(): array
    {
        // Default brand colors for new websites
        $defaults = [
            'primary' => '#912018',
            'secondary' => '#293056',
            'accent' => '#F5F8FF',
            'text' => '#000000',
            'background' => '#FFFFFF',
        ];

        if (!$this->brand_colors) {
            return $defaults;
        }

        return array_merge($defaults, $this->brand_colors);
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
