<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Website extends Model
{
    use HasFactory;

    /**
     * The Nobu site's SEO meta that landing sites were seeded with — on
     * non-default sites these exact values are treated as unset (same
     * self-heal pattern as the legacy contact_info seeds) so tenant pages
     * never advertise Nobu in their title/description/keywords.
     */
    private const LEGACY_SEED_META = [
        'meta_title' => 'Nobu Residences - Luxury Toronto Condos',
        'meta_description' => 'Discover luxury living at Nobu Residences in downtown Toronto. Premium condos with world-class amenities.',
        'meta_keywords' => 'Toronto condos, luxury condos, Nobu Residences, downtown Toronto',
    ];

    /**
     * Cloudflare provisioning bookkeeping columns — changes to these never
     * affect what visitors see, so they must not trigger an edge-cache purge
     * (the status sync job rewrites them every few minutes).
     */
    protected const CACHE_IRRELEVANT_FIELDS = [
        'updated_at',
        'cloudflare_hostname_id',
        'cloudflare_status',
        'cloudflare_ssl_status',
        'cloudflare_last_error',
        'cloudflare_active_at',
        'ai_content_status',
        'ai_content_error',
        'ai_content_generated_at',
    ];

    /**
     * Keep the TenantResolver's cross-request domain cache honest: whenever a
     * website is saved or deleted, drop the cached lookup for both its old
     * and new domain so Host-header resolution reflects the change at once.
     * Visitor-visible changes additionally purge the Cloudflare edge cache so
     * the live custom domain updates in real time.
     */
    protected static function booted(): void
    {
        $flushDomainCache = function (self $website): void {
            \App\Services\Tenancy\TenantResolver::forgetDomain($website->domain);
            \App\Services\Tenancy\TenantResolver::forgetDomain($website->getOriginal('domain'));
        };

        static::saved($flushDomainCache);
        static::deleted($flushDomainCache);

        static::saved(function (self $website): void {
            $visitorVisible = array_diff(array_keys($website->getChanges()), self::CACHE_IRRELEVANT_FIELDS);
            if (!empty($visitorVisible)) {
                $website->purgeEdgeCache();
            }
        });
        static::deleted(fn (self $website) => $website->purgeEdgeCache());
    }

    /**
     * Queue a Cloudflare edge-cache purge for this website's domain(s) so
     * the live site reflects the change immediately.
     */
    public function purgeEdgeCache(): void
    {
        $domains = array_unique(array_filter([$this->domain, $this->getOriginal('domain')]));
        foreach ($domains as $domain) {
            \App\Jobs\PurgeCloudflareCacheJob::dispatchAfterResponse($domain);
        }
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
        'ai_content_status',
        'ai_content_error',
        'ai_content_generated_at',
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
        'ai_content_generated_at' => 'datetime',
    ];

    protected function metaTitle(): Attribute
    {
        return Attribute::get(fn ($value) => $this->healLegacyMeta('meta_title', $value));
    }

    protected function metaDescription(): Attribute
    {
        return Attribute::get(fn ($value) => $this->healLegacyMeta('meta_description', $value));
    }

    protected function metaKeywords(): Attribute
    {
        return Attribute::get(function ($value) {
            $value = $this->healLegacyMeta('meta_keywords', $value);
            if ($value === null || $this->is_default) {
                return $value;
            }

            // Keywords are a comma list — drop any Nobu leftovers on tenant
            // sites without touching the rest.
            $kept = array_filter(
                array_map('trim', explode(',', $value)),
                fn (string $keyword) => stripos($keyword, 'nobu') === false
            );

            return $kept ? implode(', ', $kept) : null;
        });
    }

    /**
     * Exact legacy Nobu seed values read as unset on non-default sites.
     */
    private function healLegacyMeta(string $key, ?string $value): ?string
    {
        if ($value === null || $this->is_default) {
            return $value;
        }

        return strcasecmp(trim($value), self::LEGACY_SEED_META[$key]) === 0 ? null : $value;
    }

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

        $info = array_merge($defaults, $this->contact_info);

        // Legacy seed junk: landing sites were created with the Nobu site's
        // contact details copied into contact_info, so every tenant domain
        // showed Nobu's phone/email/address as its "own" data. On non-default
        // sites treat those exact values as unset — real dashboard-entered
        // values pass through untouched, and the frontends fall back to the
        // building / global landing-page contacts instead.
        if (!$this->is_default) {
            $legacySeeds = [
                'phone' => '647-490-1532',
                'email' => 'info@noburesidences.com',
                'address' => '55 Mercer Street, Toronto, ON',
            ];
            foreach ($legacySeeds as $key => $seed) {
                if (strcasecmp(trim((string) $info[$key]), $seed) === 0) {
                    $info[$key] = '';
                }
            }
        }

        return $info;
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
