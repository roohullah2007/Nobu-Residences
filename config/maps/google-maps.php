<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Google Maps API Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains the configuration for Google Maps integration
    | for the property search and mixed view functionality.
    |
    */

    // Google Maps API Key - Set in .env file as GOOGLE_MAPS_API_KEY
    'api_key' => env('GOOGLE_MAPS_API_KEY', ''),

    // Default map center coordinates (Toronto)
    'default_center' => [
        'lat' => 43.6532,
        'lng' => -79.3832
    ],

    // Default zoom level
    'default_zoom' => 11,

    // Map style options
    'map_styles' => [
        // Hide points of interest labels
        [
            'featureType' => 'poi',
            'elementType' => 'labels',
            'stylers' => [['visibility' => 'off']]
        ],
        // Hide transit labels
        [
            'featureType' => 'transit',
            'elementType' => 'labels',
            'stylers' => [['visibility' => 'off']]
        ]
    ],

    // Map options for different views
    'map_options' => [
        'full' => [
            'zoomControl' => true,
            'mapTypeControl' => false,
            'scaleControl' => true,
            'streetViewControl' => false,
            'rotateControl' => false,
            'fullscreenControl' => true,
            'gestureHandling' => 'cooperative'
        ],
        'mixed' => [
            'zoomControl' => true,
            'mapTypeControl' => false,
            'scaleControl' => false,
            'streetViewControl' => false,
            'rotateControl' => false,
            'fullscreenControl' => false,
            'gestureHandling' => 'cooperative'
        ]
    ],

    // Clustering options
    'clustering' => [
        'enabled' => true,
        'grid_size' => 50,
        'max_zoom' => 15
    ],

    // Info window settings
    'info_window' => [
        'max_width' => 300,
        'pixel_offset' => [0, -10]
    ],

    // Image settings for lazy loading
    'images' => [
        'lazy_loading' => [
            'threshold' => 0.1,
            'root_margin' => '50px',
            'batch_size' => 15,
            'batch_delay' => 100, // milliseconds
            'enable_blur_effect' => true
        ],
        'fallback_url' => 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80',
        'cache_duration' => 3600 // seconds
    ],

    // Mixed view settings (IDX-AMPRE style)
    'mixed_view' => [
        'split_ratio' => '50/50', // property cards / map
        'property_card_height' => 340,
        'enable_synchronized_hover' => true,
        'auto_center_on_hover' => true,
        'map_padding' => 50
    ]
];
