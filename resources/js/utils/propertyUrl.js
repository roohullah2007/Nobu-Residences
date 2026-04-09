import { createSEOBuildingUrl } from './slug';

/**
 * Generate SEO-friendly URL for a property
 * Format: /{city}/{streetNumber-streetName-streetSuffix-city}/unit-{unitNumber}-{listingKey}
 * Example: /barrie/6-toronto-street-barrie/unit-604-S12960990
 *
 * If a `building` is provided as the second argument, the URL uses the
 * building's rich slug as the middle segment instead, e.g.
 *   /toronto/nobu-residences-15-mercer-st-35-mercer-st/unit-3708-C12652876
 */
export const generatePropertyUrl = (property, building = null) => {
    if (!property) return '/';

    // Auto-pick building from the listing payload if not passed explicitly
    if (!building && property.building && (property.building.name || property.building.slug)) {
        building = property.building;
    }

    // If we know which building this listing belongs to, route through the
    // building's rich slug so the URL is /{city}/{building-slug}/unit-...
    if (building) {
        const listingKey = property.ListingKey || property.listingKey || property.mls_id || property.mlsNumber || '';
        const unitNumber = property.UnitNumber || property.unitNumber || '';
        const listingSlug = unitNumber ? `unit-${unitNumber}-${listingKey}` : listingKey;
        const buildingUrl = createSEOBuildingUrl(building);
        if (buildingUrl && !buildingUrl.startsWith('/building/unknown')) {
            return `${buildingUrl}/${listingSlug}`;
        }
    }

    // Get listing key
    const listingKey = property.ListingKey ||
                      property.listingKey ||
                      property.mls_id ||
                      property.mlsNumber || '';

    // Get city
    const city = property.City || property.city || 'toronto';

    // Get address components
    const unitNumber = property.UnitNumber || property.unitNumber || '';
    const streetNumber = property.StreetNumber || property.streetNumber || '';
    const streetName = property.StreetName || property.streetName || '';
    const streetSuffix = property.StreetSuffix || property.streetSuffix || '';

    // Format city slug
    let citySlug = city.toLowerCase();
    citySlug = citySlug.replace(/\s*[cewns]\d{2}\b/gi, ''); // Remove district codes
    citySlug = citySlug.trim().replace(/\s+/g, '-');

    // Build address slug: {streetNumber}-{streetName}-{streetSuffix}-{city}
    let addressParts = [];
    if (streetNumber) addressParts.push(streetNumber);
    if (streetName) addressParts.push(streetName.toLowerCase());
    if (streetSuffix) addressParts.push(streetSuffix.toLowerCase());
    if (citySlug) addressParts.push(citySlug);

    let addressSlug = addressParts.join('-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');

    // Fallback if no address components
    if (!addressSlug) {
        const fullAddress = property.UnparsedAddress || property.address || '';
        addressSlug = createAddressSlug(fullAddress);
    }

    // Build listing key slug: unit-{unitNumber}-{listingKey}
    let listingSlug = unitNumber ? `unit-${unitNumber}-${listingKey}` : listingKey;

    return `/${citySlug}/${addressSlug}/${listingSlug}`;
};

/**
 * Create URL-friendly slug from address (fallback)
 */
const createAddressSlug = (address) => {
    if (!address) return 'property';

    let slug = address.toLowerCase();

    // Remove unit/suite/apt info
    slug = slug.replace(/[,\s]*#\s*\d+.*/i, '');
    slug = slug.replace(/,?\s*(unit|suite|apt|apartment)\s*\d+.*/i, '');

    // Remove city, province, postal code after first comma
    const commaIndex = slug.indexOf(',');
    if (commaIndex > 0) {
        slug = slug.substring(0, commaIndex);
    }

    slug = slug.trim();
    slug = slug.replace(/[^a-z0-9\s-]/g, '');
    slug = slug.replace(/\s+/g, '-');
    slug = slug.replace(/-+/g, '-');

    return slug.replace(/^-+|-+$/g, '') || 'property';
};

// For backwards compatibility
export const getPropertyUrl = (listingKey) => {
    return `/property/${listingKey}`;
};
