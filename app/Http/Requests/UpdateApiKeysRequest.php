<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateApiKeysRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            // API Keys
            'repliers_api_url' => 'nullable|url|max:255',
            'repliers_api_key' => 'nullable|string|max:500',
            'google_maps_api_key' => 'nullable|string|max:500',
            'walkscore_api_key' => 'nullable|string|max:255',

            // MLS Settings
            'mls_auto_sync' => 'nullable|boolean',
            'mls_sync_interval' => 'nullable|integer|min:5|max:1440',
            'mls_max_properties' => 'nullable|integer|min:10|max:10000',
            'mls_default_city' => 'nullable|string|max:100',
            'default_building_address' => 'nullable|string|max:255',
            'cache_ttl' => 'nullable|integer|min:60|max:3600',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'repliers_api_url.url' => 'The Repliers API URL must be a valid URL.',
            'repliers_api_key.max' => 'The Repliers API key is too long.',
            'google_maps_api_key.max' => 'The Google Maps API key is too long.',
            'walkscore_api_key.max' => 'The WalkScore API key is too long.',
            'mls_sync_interval.min' => 'Sync interval must be at least 5 minutes.',
            'mls_sync_interval.max' => 'Sync interval cannot exceed 24 hours.',
            'mls_max_properties.min' => 'Must sync at least 10 properties.',
            'mls_max_properties.max' => 'Cannot sync more than 10,000 properties.',
            'cache_ttl.min' => 'Cache TTL must be at least 60 seconds.',
            'cache_ttl.max' => 'Cache TTL cannot exceed 1 hour.',
        ];
    }

    /**
     * Get custom attribute names for validator errors.
     */
    public function attributes(): array
    {
        return [
            'repliers_api_url' => 'Repliers API URL',
            'repliers_api_key' => 'Repliers API Key',
            'google_maps_api_key' => 'Google Maps API Key',
            'walkscore_api_key' => 'WalkScore API Key',
            'mls_auto_sync' => 'Auto Sync MLS',
            'mls_sync_interval' => 'Sync Interval',
            'mls_max_properties' => 'Max Properties',
            'mls_default_city' => 'Default City',
            'default_building_address' => 'Default Building Address',
            'cache_ttl' => 'Cache TTL',
        ];
    }
}
