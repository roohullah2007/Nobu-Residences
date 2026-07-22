import { createSlug } from './slug';

/**
 * Canonical /mls/ listing URLs (client SEO spec). Backend mirror:
 * app/Helpers/ListingUrlBuilder.php — slug rules must stay byte-identical so
 * card links land directly on the canonical URL with no 301 hop.
 *
 * Condo (listing matched to a building):
 *   /mls/{city}/{building-slug}/{street-slug}/unit-{unit}-{MLS}
 *   e.g. /mls/toronto/the-well-condos/480-front-st-w/unit-1009-E12057013
 *
 * Not matched to a building (homes/townhomes):
 *   /mls/{city}/homes-for-{sale|rent}/{street-address-slug}-{MLS}
 *   e.g. /mls/toronto/homes-for-rent/144-elmer-avenue-E12057013
 */
export const generatePropertyUrl = (property, building = null) => {
    if (!property) return '/';

    // Auto-pick building from the listing payload if not passed explicitly
    if (!building && property.building && (property.building.name || property.building.slug)) {
        building = property.building;
    }

    const listingKey = property.ListingKey ||
                      property.listingKey ||
                      property.mls_id ||
                      property.mlsNumber || '';

    // City slug with Repliers district codes stripped ("Toronto C08" → "toronto")
    const city = property.City || property.city || 'toronto';
    const citySlug = createSlug(city.replace(/\s*[cewns]\d{2}\b/gi, '')) || 'toronto';

    // Street slug from the listing's own address fields, e.g. "480-front-st-w"
    const streetNumber = property.StreetNumber || property.streetNumber || '';
    const streetName = property.StreetName || property.streetName || '';
    const streetSuffix = property.StreetSuffix || property.streetSuffix || '';
    const streetDirection = property.StreetDirection || property.streetDirection || '';
    let streetSlug = createSlug(
        [streetNumber, streetName, streetSuffix, streetDirection].filter(Boolean).join(' ')
    );

    // Condo canonical form when we know the building
    if (building && (building.slug || building.name)) {
        const buildingSlug = building.slug || createSlug(building.name);
        // Route pattern allows only [A-Za-z0-9] inside the unit segment
        const unitNumber = String(property.UnitNumber || property.unitNumber || '').replace(/[^A-Za-z0-9]/g, '');
        const listingSlug = unitNumber ? `unit-${unitNumber}-${listingKey}` : listingKey;
        if (buildingSlug && streetSlug) {
            return `/mls/${citySlug}/${buildingSlug}/${streetSlug}/${listingSlug}`;
        }
    }

    // Homes form (also the fallback for unmatched condos). Rent detection
    // mirrors ListingUrlBuilder: Repliers "For Lease" / lease type.
    const transactionType = property.transactionType || property.TransactionType || property.type || '';
    const isRent = property.isRental === true || /rent|lease/i.test(String(transactionType));

    if (!streetSlug) {
        streetSlug = createAddressSlug(property.UnparsedAddress || property.address || '');
    }

    return `/mls/${citySlug}/homes-for-${isRent ? 'rent' : 'sale'}/${streetSlug || 'property'}-${listingKey}`;
};

/**
 * Create URL-friendly slug from a display address (fallback), e.g.
 * "1009 - 480 Front St W, Toronto" → "480-front-st-w"
 */
const createAddressSlug = (address) => {
    if (!address) return '';

    let street = address.replace(/^\s*[A-Za-z0-9]+\s*-\s*/, ''); // strip "1009 - " unit prefix

    // Remove unit/suite/apt info
    street = street.replace(/[,\s]*#\s*\d+.*/i, '');
    street = street.replace(/,?\s*(unit|suite|apt|apartment)\s*\d+.*/i, '');

    // Remove city, province, postal code after first comma
    const commaIndex = street.indexOf(',');
    if (commaIndex > 0) {
        street = street.substring(0, commaIndex);
    }

    return createSlug(street);
};

// For backwards compatibility — resolves via the server-side canonical 301.
export const getPropertyUrl = (listingKey) => {
    return `/property/${listingKey}`;
};
