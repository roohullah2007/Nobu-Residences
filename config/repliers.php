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

    'agent_id' => env('REPLIERS_AGENT_ID', 107015),

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
    | GTA bounding polygon — used to restrict the map view to GTA listings.
    | Coordinates are [longitude, latitude] (GeoJSON order). The polygon must
    | be closed (first point repeated as last). This is a coarse hull around
    | the Greater Toronto Area municipalities listed above.
    |--------------------------------------------------------------------------
    */

    'gta_polygon' => [
        [-79.95, 44.05], // NW (Caledon)
        [-79.50, 44.30], // N  (King / Newmarket)
        [-79.10, 44.40], // NE (Georgina / Lake Simcoe shore)
        [-78.85, 44.05], // E  (Brock / Uxbridge)
        [-78.75, 43.85], // ESE (Oshawa)
        [-78.85, 43.55], // SE (Pickering)
        [-79.40, 43.40], // S  (Lake Ontario, south of Toronto Islands)
        [-79.95, 43.30], // SW (Burlington shore)
        [-79.95, 44.05], // close
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
