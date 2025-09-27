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
        return true; // Add proper authorization logic if needed
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // API Keys
            'ampre_api_url' => 'nullable|url|max:255',
            'ampre_vow_token' => 'nullable|string|max:500',
            'ampre_idx_token' => 'nullable|string|max:500', 
            'google_maps_api_key' => 'nullable|string|max:500',
            'walkscore_api_key' => 'nullable|string|max:255',
            
            // MLS Settings
            'mls_auto_sync' => 'nullable|boolean',
            'mls_sync_interval' => 'nullable|integer|min:5|max:1440', // 5 minutes to 24 hours
            'mls_max_properties' => 'nullable|integer|min:10|max:10000',
            'mls_default_city' => 'nullable|string|max:100',
            'default_building_address' => 'nullable|string|max:255',
            'cache_ttl' => 'nullable|integer|min:60|max:3600', // 1 minute to 1 hour
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'ampre_api_url.url' => 'The AMPRE API URL must be a valid URL.',
            'ampre_vow_token.max' => 'The AMPRE VOW token is too long.',
            'ampre_idx_token.max' => 'The AMPRE IDX token is too long.',
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
            'ampre_api_url' => 'AMPRE API URL',
            'ampre_vow_token' => 'AMPRE VOW Token', 
            'ampre_idx_token' => 'AMPRE IDX Token',
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