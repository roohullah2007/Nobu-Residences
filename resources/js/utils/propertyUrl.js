/**
 * Generate SEO-friendly URL for a property
 */
export const generatePropertyUrl = (property) => {
    if (!property) return '/';
    
    // Get listing key (handle different field names)
    const listingKey = property.ListingKey || 
                      property.listingKey || 
                      property.mls_id || 
                      property.mlsNumber || '';
    
    // Get city
    const city = property.City || 
                 property.city || 
                 'toronto';
    
    // Get address
    const address = property.UnparsedAddress || 
                    property.address || 
                    property.StreetAddress || '';
    
    // Format city for URL - remove district codes like C08, W04, etc.
    let citySlug = city.toLowerCase();
    citySlug = citySlug.replace(/\s*[cewns]\d{2}\b/gi, ''); // Remove district codes
    citySlug = citySlug.trim().replace(/\s+/g, '-');
    
    // Format address for URL
    const addressSlug = createAddressSlug(address);
    
    // Generate the URL
    return `/${citySlug}/${addressSlug}/${listingKey}`;
};

/**
 * Create URL-friendly slug from address
 */
const createAddressSlug = (address) => {
    if (!address) return 'property';
    
    // Convert to lowercase
    let slug = address.toLowerCase();
    
    // Remove unit/suite/apt information (including #618 format)
    slug = slug.replace(/[,\s]*#\s*\d+.*/i, ''); // Remove #unit format
    slug = slug.replace(/,?\s*(unit|suite|apt|apartment)\s*\d+.*/i, ''); // Remove other unit formats
    
    // Remove city, province, postal code
    slug = slug.replace(/,?\s*(toronto|mississauga|brampton|vaughan|markham|richmond hill|oakville|burlington|hamilton|london|ottawa|kitchener).*/i, '');
    
    // Clean up the address
    slug = slug.trim();
    slug = slug.replace(/[^a-z0-9\s\-]/g, '');
    slug = slug.replace(/\s+/g, '-');
    slug = slug.replace(/-+/g, '-');
    
    return slug.replace(/^-+|-+$/g, '') || 'property';
};

// For backwards compatibility
export const getPropertyUrl = (listingKey) => {
    return `/property/${listingKey}`;
};