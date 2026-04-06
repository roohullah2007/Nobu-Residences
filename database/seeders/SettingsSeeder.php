<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $apiSettings = [
            [
                'key' => 'repliers_api_url',
                'value' => 'https://api.repliers.io',
                'type' => 'string',
                'description' => 'Repliers API base URL for MLS data integration',
                'group' => 'api',
                'is_public' => false,
                'is_encrypted' => false,
            ],
            [
                'key' => 'repliers_api_key',
                'value' => '',
                'type' => 'string',
                'description' => 'Repliers API key for accessing MLS property data',
                'group' => 'api',
                'is_public' => false,
                'is_encrypted' => true,
            ],
            [
                'key' => 'google_maps_api_key',
                'value' => '',
                'type' => 'string',
                'description' => 'Google Maps API key for location services and mapping',
                'group' => 'api',
                'is_public' => false,
                'is_encrypted' => true,
            ],
            [
                'key' => 'walkscore_api_key',
                'value' => '',
                'type' => 'string',
                'description' => 'WalkScore API key for walkability ratings',
                'group' => 'api',
                'is_public' => false,
                'is_encrypted' => true,
            ],
            [
                'key' => 'mls_auto_sync',
                'value' => true,
                'type' => 'boolean',
                'description' => 'Automatically sync properties from MLS API',
                'group' => 'mls',
                'is_public' => false,
                'is_encrypted' => false,
            ],
            [
                'key' => 'mls_sync_interval',
                'value' => 60,
                'type' => 'integer',
                'description' => 'MLS synchronization interval in minutes',
                'group' => 'mls',
                'is_public' => false,
                'is_encrypted' => false,
            ],
            [
                'key' => 'mls_max_properties',
                'value' => 1000,
                'type' => 'integer',
                'description' => 'Maximum number of properties to sync from MLS',
                'group' => 'mls',
                'is_public' => false,
                'is_encrypted' => false,
            ],
            [
                'key' => 'mls_default_city',
                'value' => 'Toronto',
                'type' => 'string',
                'description' => 'Default city for MLS property searches',
                'group' => 'mls',
                'is_public' => false,
                'is_encrypted' => false,
            ],
            [
                'key' => 'cache_ttl',
                'value' => 300,
                'type' => 'integer',
                'description' => 'Cache time-to-live in seconds for API responses',
                'group' => 'api',
                'is_public' => false,
                'is_encrypted' => false,
            ],
        ];

        foreach ($apiSettings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }

        // Website settings
        $websiteSettings = [
            [
                'key' => 'site_name',
                'value' => 'Nobu Residences',
                'type' => 'string',
                'description' => 'Website name',
                'group' => 'general',
                'is_public' => true,
                'is_encrypted' => false,
            ],
            [
                'key' => 'contact_email',
                'value' => 'info@noburesidences.com',
                'type' => 'string',
                'description' => 'Contact email address',
                'group' => 'general',
                'is_public' => true,
                'is_encrypted' => false,
            ],
            [
                'key' => 'contact_phone',
                'value' => '+1 (416) 123-4567',
                'type' => 'string',
                'description' => 'Contact phone number',
                'group' => 'general',
                'is_public' => true,
                'is_encrypted' => false,
            ],
            [
                'key' => 'show_properties_count',
                'value' => true,
                'type' => 'boolean',
                'description' => 'Show property count on search results',
                'group' => 'frontend',
                'is_public' => true,
                'is_encrypted' => false,
            ],
        ];

        foreach ($websiteSettings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}