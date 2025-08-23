// Enhanced Property Search Configuration
// This file should be loaded in your main layout or as a global script

window.enhancedPropertySearchConfig = {
    // Google Maps Configuration
    googleMaps: {
        apiKey: process.env.MIX_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
        libraries: ['geometry', 'marker'],
        defaultCenter: { lat: 43.6532, lng: -79.3832 }, // Toronto
        defaultZoom: 11,
        clusterOptions: {
            gridSize: 50,
            maxZoom: 15,
            minimumClusterSize: 2
        }
    },

    // Property Image Loading Configuration
    propertyImages: {
        enableLazyLoading: true,
        enableBatchLoading: true,
        enableBlurEffect: true,
        batchSize: 20,
        retryAttempts: 3,
        cacheTimeout: 3600000, // 1 hour in milliseconds
        intersectionObserver: {
            rootMargin: '50px',
            threshold: 0.1
        },
        placeholderImages: [
            'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80',
            'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop&auto=format&q=80',
            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop&auto=format&q=80',
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&auto=format&q=80'
        ]
    },

    // Search Configuration
    search: {
        debounceMs: 300,
        minQueryLength: 2,
        maxResults: 50,
        defaultPageSize: 15,
        enableAutoComplete: true,
        enableSavedSearches: true
    },

    // Mixed View Configuration
    mixedView: {
        defaultSplit: '50/50', // Properties/Map split
        enableSync: true, // Sync between map and property cards
        autoZoomToActive: true,
        highlightDuration: 2000 // ms
    },

    // Performance Configuration
    performance: {
        enableVirtualization: false, // For large result sets
        enablePreloading: true,
        preloadCount: 5, // Number of images to preload
        enableMetrics: true
    },

    // API Configuration
    api: {
        baseUrl: '/api',
        timeout: 30000, // 30 seconds
        retryAttempts: 3,
        retryDelay: 1000 // 1 second
    },

    // Animation Configuration
    animations: {
        cardHover: {
            duration: 200,
            easing: 'ease-out'
        },
        mapMarker: {
            duration: 300,
            easing: 'ease-in-out'
        },
        loading: {
            duration: 1500,
            easing: 'linear'
        }
    },

    // Accessibility Configuration
    accessibility: {
        enableFocusTrapping: true,
        enableScreenReaderSupport: true,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
};

// Make Google Maps API key available globally
window.googleMapsApiKey = window.enhancedPropertySearchConfig.googleMaps.apiKey;

// Initialize reduced motion detection
if (window.enhancedPropertySearchConfig.accessibility.reducedMotion) {
    document.documentElement.classList.add('reduced-motion');
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.enhancedPropertySearchConfig;
}
