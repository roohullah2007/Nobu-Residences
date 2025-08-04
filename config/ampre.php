<?php

return [
    /*
    |--------------------------------------------------------------------------
    | AMPRE API Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration settings for the AMPRE real estate API integration.
    | These values are used to connect to the AMPRE OData API service.
    |
    */

    'api_url' => env('AMPRE_API_URL', 'https://query.ampre.ca/odata/'),
    
    'vow_token' => env('AMPRE_VOW_TOKEN', ''),
    
    'idx_token' => env('AMPRE_IDX_TOKEN', ''),
    
    /*
    |--------------------------------------------------------------------------
    | Cache Configuration
    |--------------------------------------------------------------------------
    |
    | Cache settings for API responses to improve performance.
    |
    */
    
    'cache_ttl' => env('AMPRE_CACHE_TTL', 300), // 5 minutes
    
    'cache_prefix' => 'ampre_api_',
    
    /*
    |--------------------------------------------------------------------------
    | Request Configuration
    |--------------------------------------------------------------------------
    |
    | HTTP request settings for API calls.
    |
    */
    
    'timeout' => 30,
    
    'max_retries' => 3,
    
    'retry_delay' => 1, // seconds
    
    /*
    |--------------------------------------------------------------------------
    | Default Query Parameters
    |--------------------------------------------------------------------------
    |
    | Default settings for OData queries.
    |
    */
    
    'defaults' => [
        'top' => 10,
        'select' => [
            'ListingKey',
            'BedroomsTotal',
            'BathroomsTotalInteger',
            'UnparsedAddress',
            'ListPrice',
            'TransactionType',
            'City',
            'StateOrProvince',
            'PostalCode',
            'PropertySubType',
            'ListOfficeName',
            'StandardStatus'
        ],
        'image_size' => 'Largest',
        'image_limit' => 250,
        'rooms_limit' => 1000,
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Google Maps Integration
    |--------------------------------------------------------------------------
    |
    | Configuration for Google Maps integration if needed.
    |
    */
    
    'google_maps_api_key' => env('GOOGLE_MAPS_API_KEY', ''),
    
    /*
    |--------------------------------------------------------------------------
    | WalkScore Integration
    |--------------------------------------------------------------------------
    |
    | Configuration for WalkScore API integration if needed.
    |
    */
    
    'walkscore_api_key' => env('WALKSCORE_API_KEY', ''),
];