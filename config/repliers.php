<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Repliers API Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration settings for the Repliers real estate MLS API integration.
    | API Documentation: https://repliers.io/docs
    |
    */

    'api_url' => env('REPLIERS_API_URL', 'https://api.repliers.io'),

    'api_key' => env('REPLIERS_API_KEY', ''),

    'cdn_url' => env('REPLIERS_CDN_URL', 'https://cdn.repliers.io'),

    /*
    |--------------------------------------------------------------------------
    | Cache Configuration
    |--------------------------------------------------------------------------
    */

    'cache_ttl' => env('REPLIERS_CACHE_TTL', 300), // 5 minutes

    'cache_prefix' => 'repliers_api_',

    /*
    |--------------------------------------------------------------------------
    | Request Configuration
    |--------------------------------------------------------------------------
    */

    'timeout' => 30,

    'max_retries' => 3,

    'retry_delay' => 1, // seconds

    /*
    |--------------------------------------------------------------------------
    | Default Query Parameters
    |--------------------------------------------------------------------------
    */

    'defaults' => [
        'results_per_page' => 20,
        'sort_by' => 'updatedOnDesc',
        'class' => 'condoProperty',
        'status' => 'A',
        'type' => 'sale',
    ],

    /*
    |--------------------------------------------------------------------------
    | GTA Cities for filtering
    |--------------------------------------------------------------------------
    */

    'gta_cities' => [
        'Toronto', 'Mississauga', 'Brampton', 'Caledon',
        'Markham', 'Vaughan', 'Richmond Hill', 'Aurora',
        'Newmarket', 'King', 'Whitchurch-Stouffville', 'Georgina',
        'Oshawa', 'Whitby', 'Ajax', 'Pickering', 'Clarington',
        'Uxbridge', 'Scugog', 'Brock',
        'Oakville', 'Burlington', 'Milton', 'Halton Hills',
    ],

    /*
    |--------------------------------------------------------------------------
    | Google Maps Integration
    |--------------------------------------------------------------------------
    */

    'google_maps_api_key' => env('GOOGLE_MAPS_API_KEY', ''),

    /*
    |--------------------------------------------------------------------------
    | WalkScore Integration
    |--------------------------------------------------------------------------
    */

    'walkscore_api_key' => env('WALKSCORE_API_KEY', ''),
];
