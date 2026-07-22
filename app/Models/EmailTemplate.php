<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmailTemplate extends Model
{
    protected $fillable = [
        'type',
        // NULL = global template; set = override for one landing site
        'website_id',
        'subject',
        'headline',
        'intro',
    ];

    /**
     * Editable email types: built-in default copy + the %merge_tags% each
     * supports (shown in the admin editor and replaced at send time).
     */
    public const TYPES = [
        'saved_search_alert' => [
            'label' => 'Saved Search Alert',
            'defaults' => [
                // Subject + intro lead with the recipient's name (per client:
                // "subject and body content will be customized for the
                // receiver — it'll contain their name").
                'subject' => '%first_name%, New Listings Match "%search_name%" - %listing_count% Properties Found',
                'headline' => 'Handpicked listings just for you.',
                'intro' => "Hi %first_name%, thank you for registering for the %frequency% Listings Alert at %site_link%. I've put together the list below to help you find new listings based on your specific Real Estate needs. Feel free to contact me should you have any questions.",
            ],
            'tags' => [
                '%first_name%', '%last_name%', '%full_name%', '%site_name%', '%site_domain%', '%site_link%',
                '%search_name%', '%search_criteria%', '%listing_count%', '%frequency%', '%building_name%',
                '%agent_name%', '%agent_phone%', '%agent_email%',
            ],
        ],
        'favourite_update' => [
            'label' => 'Favourite Listing Update',
            'defaults' => [
                'subject' => 'Updates on your favourite listings — %site_name%',
                'headline' => 'Updates on your favourite listings.',
                'intro' => "Hi %first_name%, here's what changed on %listing_count% listings you favourited at %site_link%. Each card shows the update below its details. Feel free to contact me should you have any questions.",
            ],
            'tags' => [
                '%first_name%', '%last_name%', '%full_name%', '%site_name%', '%site_domain%', '%site_link%',
                '%listing_count%', '%agent_name%', '%agent_phone%', '%agent_email%',
            ],
        ],
    ];

    public function website(): BelongsTo
    {
        return $this->belongsTo(Website::class);
    }

    /**
     * Effective subject/headline/intro for an email type on a site. Each
     * field falls through independently: site override -> global template ->
     * built-in default. Never throws — alerts must send even if the table
     * is missing (pre-migration).
     *
     * @return array{subject: string, headline: string, intro: string}
     */
    public static function resolve(string $type, ?int $websiteId = null): array
    {
        $defaults = self::TYPES[$type]['defaults'] ?? [];
        $site = null;
        $global = null;

        try {
            $rows = self::where('type', $type)
                ->where(fn ($query) => $query->whereNull('website_id')->orWhere('website_id', $websiteId))
                ->get();
            $global = $rows->firstWhere('website_id', null);
            $site = $websiteId ? $rows->firstWhere('website_id', $websiteId) : null;
        } catch (\Throwable $e) {
            // Table missing / DB hiccup — fall back to built-in copy.
        }

        $fields = [];
        foreach (['subject', 'headline', 'intro'] as $field) {
            $fields[$field] = trim((string) ($site?->{$field} ?? ''))
                ?: (trim((string) ($global?->{$field} ?? '')) ?: ($defaults[$field] ?? ''));
        }

        return $fields;
    }
}
