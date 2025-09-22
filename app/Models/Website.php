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
     * Get default brand colors
     */
    public function getBrandColors(): array
    {
        return $this->brand_colors ?? [
            'primary' => '#912018',
            'secondary' => '#293056',
            'accent' => '#F5F8FF',
            'text' => '#000000',
            'background' => '#FFFFFF',
        ];
    }

    /**
     * Get default contact information
     */
    public function getContactInfo(): array
    {
        return $this->contact_info ?? [
            'phone' => '+1 437 998 1795',
            'email' => 'contact@noburesidences.com',
            'address' => 'Building No.88, Toronto CA, Ontario, Toronto',
        ];
    }

    /**
     * Get default social media links
     */
    public function getSocialMedia(): array
    {
        return $this->social_media ?? [
            'facebook' => '',
            'instagram' => '',
            'twitter' => '',
            'linkedin' => '',
        ];
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
