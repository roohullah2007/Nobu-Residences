// Utility functions for handling property data and URL parameters
export const PropertyUtils = {
    /**
     * Safely convert value to string for URL parameters
     */
    safeToString(value) {
        if (value === null || value === undefined) {
            return '';
        }
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        return String(value);
    },

    /**
     * Build query string from filters object
     */
    buildQueryString(filters) {
        const params = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                if (Array.isArray(value)) {
                    value.forEach(item => {
                        params.append(`${key}[]`, this.safeToString(item));
                    });
                } else {
                    params.append(key, this.safeToString(value));
                }
            }
        });
        
        return params.toString();
    },

    /**
     * Navigate to property page with proper error handling
     */
    navigateToProperty(propertyId, router, options = {}) {
        try {
            const url = `/agent/properties/${this.safeToString(propertyId)}`;
            
            if (options.preserveScroll !== false) {
                options.preserveScroll = true;
            }
            
            router.visit(url, options);
        } catch (error) {
            console.error('Navigation error:', error);
            // Fallback to window.location
            window.location.href = `/agent/properties/${this.safeToString(propertyId)}`;
        }
    },

    /**
     * Handle pagination with error handling
     */
    handlePagination(page, router, currentUrl, filters = {}) {
        try {
            const params = new URLSearchParams();
            
            // Add page parameter
            if (page && page !== 1) {
                params.append('page', this.safeToString(page));
            }
            
            // Add filters
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    params.append(key, this.safeToString(value));
                }
            });
            
            const queryString = params.toString();
            const url = currentUrl.split('?')[0] + (queryString ? `?${queryString}` : '');
            
            router.visit(url, {
                preserveScroll: true,
                preserveState: true
            });
        } catch (error) {
            console.error('Pagination error:', error);
            // Fallback
            window.location.href = `?page=${page}`;
        }
    },

    /**
     * Mask address for display
     */
    maskAddress(address, hasAccess = false) {
        if (hasAccess || !address) {
            return address;
        }
        
        const parts = address.split(',');
        if (parts.length >= 2) {
            const cityPart = parts[parts.length - 1].trim();
            return `XXX XXXXXXXXX XXXXXX, ${cityPart}`;
        }
        
        return 'XXX XXXXXXXXX XXXXXX';
    },

    /**
     * Format price for display
     */
    formatPrice(price, currency = '€') {
        if (!price) return 'N/A';
        
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: currency === '€' ? 'EUR' : 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    },

    /**
     * Get property type translation
     */
    getPropertyTypeTranslation(type, propertyTypes = {}) {
        if (propertyTypes[type]) {
            return propertyTypes[type];
        }
        
        // Fallback translations
        const fallbackTypes = {
            'MAISON': 'House',
            'APPARTEMENT': 'Apartment',
            'TERRAIN': 'Land',
            'COMMERCIAL': 'Commercial',
            'AUTRES': 'Others'
        };
        
        return fallbackTypes[type] || type;
    },

    /**
     * Debounce function for search inputs
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Validate property data
     */
    validatePropertyData(property) {
        const required = ['id', 'type', 'price'];
        const missing = required.filter(field => !property[field]);
        
        if (missing.length > 0) {
            console.warn('Missing required property fields:', missing);
            return false;
        }
        
        return true;
    }
};

export default PropertyUtils;
