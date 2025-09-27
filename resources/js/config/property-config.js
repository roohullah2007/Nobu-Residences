// Enhanced Property Configuration
export const PROPERTY_CONFIG = {
  // Image loading settings
  IMAGE_TIMEOUT: 8000, // 8 seconds
  IMAGE_BATCH_SIZE: 3, // Load 3 images at a time
  IMAGE_RETRY_ATTEMPTS: 2,
  IMAGE_CACHE_DURATION: 300000, // 5 minutes
  
  // API settings
  API_TIMEOUT: 10000, // 10 seconds
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Property listings settings
  NEARBY_LISTINGS_LIMIT: 6,
  SIMILAR_LISTINGS_LIMIT: 6,
  LISTINGS_CACHE_DURATION: 300000, // 5 minutes
  
  // UI settings
  LOADING_DEBOUNCE: 300, // 300ms
  SLIDE_ANIMATION_DURATION: 500, // 500ms
  ITEMS_PER_SLIDE: 3,
  
  // Error handling
  MAX_CONSECUTIVE_ERRORS: 3,
  ERROR_DISPLAY_DURATION: 5000, // 5 seconds
  
  // Performance settings
  LAZY_LOAD_THRESHOLD: 100, // pixels
  PRELOAD_ADJACENT_IMAGES: true,
  USE_WEBP_WHEN_SUPPORTED: true,
  
  // Default images
  PLACEHOLDER_IMAGE: '/images/no-image-placeholder.jpg',
  ERROR_IMAGE: '/images/property-error-placeholder.jpg',
  
  // Browser compatibility
  DISABLE_AMPRE_SSL: true, // Convert HTTPS to HTTP for AMPRE images
  FALLBACK_TO_PLACEHOLDER: true,
  
  // Development settings
  DEBUG_IMAGE_LOADING: false,
  LOG_API_PERFORMANCE: true,
  SHOW_LOADING_INDICATORS: true
};

// Image size configurations
export const IMAGE_SIZES = {
  THUMBNAIL: { width: 300, height: 200 },
  SMALL: { width: 400, height: 300 },
  MEDIUM: { width: 600, height: 400 },
  LARGE: { width: 800, height: 600 }
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection issue. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  IMAGE_LOAD_ERROR: 'Failed to load property images.',
  NO_LISTINGS_FOUND: 'No properties found matching your criteria.',
  RATE_LIMIT_ERROR: 'Too many requests. Please wait a moment and try again.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  IMAGES_LOADED: 'Property images loaded successfully',
  LISTINGS_LOADED: 'Property listings loaded successfully',
  CACHE_HIT: 'Loaded from cache'
};

export default PROPERTY_CONFIG;