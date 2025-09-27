/**
 * Frontend Geocoding Service
 * Handles real-time geocoding for visible properties only (IDX-AMPRE approach)
 */

class FrontendGeocodingService {
    constructor() {
        this.geocoder = null;
        this.cache = new Map();
        this.queue = [];
        this.isProcessing = false;
        this.rateLimitDelay = 100; // 100ms between requests
        
        // Initialize Google Maps Geocoder when available
        this.initializeGeocoder();
    }

    /**
     * Initialize Google Maps Geocoder
     */
    initializeGeocoder() {
        if (window.google && window.google.maps && window.google.maps.Geocoder) {
            this.geocoder = new window.google.maps.Geocoder();
            console.log('Frontend Geocoding: Google Maps Geocoder initialized');
        } else {
            // Wait for Google Maps to load
            const checkInterval = setInterval(() => {
                if (window.google && window.google.maps && window.google.maps.Geocoder) {
                    this.geocoder = new window.google.maps.Geocoder();
                    console.log('Frontend Geocoding: Google Maps Geocoder initialized');
                    clearInterval(checkInterval);
                    
                    // Process any queued properties
                    if (this.queue.length > 0) {
                        this.processQueue();
                    }
                }
            }, 500);
            
            // Stop checking after 10 seconds
            setTimeout(() => clearInterval(checkInterval), 10000);
        }
    }

    /**
     * Geocode visible properties only
     * @param {Array} properties - Array of property objects
     * @param {Function} onUpdate - Callback when a property is geocoded
     * @returns {Promise}
     */
    async geocodeVisibleProperties(properties, onUpdate) {
        if (!properties || properties.length === 0) {
            return properties;
        }

        console.log('Frontend Geocoding: Processing', properties.length, 'visible properties');

        // Filter properties that need geocoding
        const needsGeocoding = properties.filter(property => {
            // Check if already has coordinates
            const lat = parseFloat(property.Latitude || property.lat || 0);
            const lng = parseFloat(property.Longitude || property.lng || 0);
            
            if (lat && lng && lat !== 0 && lng !== 0) {
                return false;
            }

            // Check if already in cache
            const address = this.getPropertyAddress(property);
            if (this.cache.has(address)) {
                const cached = this.cache.get(address);
                // Apply cached coordinates
                property.Latitude = cached.lat;
                property.Longitude = cached.lng;
                property.lat = cached.lat;
                property.lng = cached.lng;
                if (onUpdate) onUpdate(property);
                return false;
            }

            return true;
        });

        if (needsGeocoding.length === 0) {
            console.log('Frontend Geocoding: No properties need geocoding');
            return properties;
        }

        console.log('Frontend Geocoding: Found', needsGeocoding.length, 'properties that need geocoding');

        // Add to queue for processing
        needsGeocoding.forEach(property => {
            this.queue.push({ property, onUpdate });
        });

        // Start processing if not already running
        if (!this.isProcessing) {
            this.processQueue();
        }

        return properties;
    }

    /**
     * Process geocoding queue with rate limiting
     */
    async processQueue() {
        if (this.isProcessing || this.queue.length === 0) {
            return;
        }

        if (!this.geocoder) {
            console.log('Frontend Geocoding: Geocoder not ready, waiting...');
            return;
        }

        this.isProcessing = true;

        while (this.queue.length > 0) {
            const { property, onUpdate } = this.queue.shift();
            
            try {
                await this.geocodeProperty(property, onUpdate);
                // Rate limiting delay
                await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
            } catch (error) {
                console.error('Frontend Geocoding: Error processing property', error);
            }
        }

        this.isProcessing = false;
    }

    /**
     * Geocode a single property
     */
    async geocodeProperty(property, onUpdate) {
        const address = this.getPropertyAddress(property);
        
        if (!address) {
            console.warn('Frontend Geocoding: No address for property', property.ListingKey || property.listingKey);
            return;
        }

        return new Promise((resolve) => {
            this.geocoder.geocode(
                { 
                    address: address,
                    region: 'CA' // Bias towards Canada
                },
                (results, status) => {
                    if (status === 'OK' && results[0]) {
                        const location = results[0].geometry.location;
                        const lat = location.lat();
                        const lng = location.lng();
                        
                        // Update property
                        property.Latitude = lat;
                        property.Longitude = lng;
                        property.lat = lat;
                        property.lng = lng;
                        property.IsGeocoded = true;
                        
                        // Cache the result
                        this.cache.set(address, { lat, lng });
                        
                        console.log('Frontend Geocoding: Successfully geocoded', 
                            property.ListingKey || property.listingKey, 
                            'Address:', address,
                            'Coords:', lat, lng);
                        
                        // Notify callback
                        if (onUpdate) {
                            onUpdate(property);
                        }
                        
                        resolve(property);
                    } else {
                        console.warn('Frontend Geocoding: Failed to geocode', 
                            property.ListingKey || property.listingKey,
                            'Address:', address,
                            'Status:', status);
                        resolve(property);
                    }
                }
            );
        });
    }

    /**
     * Get property address for geocoding
     * Uses UnparsedAddress as primary source
     */
    getPropertyAddress(property) {
        // Use UnparsedAddress as primary source (complete address)
        if (property.UnparsedAddress) {
            return property.UnparsedAddress.trim();
        }
        
        // Fallback to address field
        if (property.address) {
            return property.address.trim();
        }

        // Build from components as last resort
        const parts = [];
        
        if (property.StreetNumber && property.StreetName) {
            parts.push(property.StreetNumber + ' ' + property.StreetName);
        }
        
        if (property.City) {
            parts.push(property.City);
        }
        
        if (property.StateOrProvince) {
            parts.push(property.StateOrProvince);
        }
        
        if (property.PostalCode) {
            parts.push(property.PostalCode);
        }

        return parts.length > 0 ? parts.join(', ') : null;
    }

    /**
     * Clear geocoding cache
     */
    clearCache() {
        this.cache.clear();
    }
}

// Create singleton instance
const frontendGeocoding = new FrontendGeocodingService();

export default frontendGeocoding;