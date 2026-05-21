/**
 * Convert a string to URL-friendly slug
 * @param {string} text - Text to convert to slug
 * @returns {string} URL-friendly slug
 */
export const createSlug = (text) => {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-')  // Replace spaces, underscores with hyphens
    .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
};

/**
 * Create a building URL with slug
 * @param {string} nameOrSlug - Building name or slug
 * @param {string} id - Building ID (deprecated, kept for backwards compatibility)
 * @param {object} options - Optional parameters for SEO URL
 * @returns {string} Building URL
 */
export const createBuildingUrl = (nameOrSlug, id, options = {}) => {
  // If options contains a slug, use it directly
  if (options.slug) {
    return `/building/${options.slug}`;
  }
  
  // If we have building object with full data, create SEO URL
  if (options && typeof options === 'object' && options.address && options.city) {
    const citySlug = createSlug(options.city);
    const streetSlug = createSlug(options.address);
    const nameSlug = createSlug(nameOrSlug || 'building');
    return `/${citySlug}/${streetSlug}/${nameSlug}`;
  }
  
  // If we have city and street as separate parameters, create SEO-friendly URL
  if (options.city && options.street) {
    const citySlug = createSlug(options.city);
    const streetSlug = createSlug(options.street);
    const nameSlug = createSlug(nameOrSlug || 'building');
    return `/${citySlug}/${streetSlug}/${nameSlug}`;
  }
  
  // Create slug from name
  const slug = createSlug(nameOrSlug || 'building');
  return `/building/${slug}`;
};

/**
 * Extract ID from building URL slug
 * @param {string} slug - URL slug like "building-name-uuid" or building name slug
 * @returns {string} Building ID or slug
 */
export const extractBuildingId = (slug) => {
  if (!slug) return null;
  
  // Extract UUID pattern from the end of the slug
  const uuidPattern = /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i;
  const match = slug.match(uuidPattern);
  
  return match ? match[1] : slug; // Return UUID if found, otherwise return the whole slug
};

/**
 * Create SEO-friendly building URL
 * @param {object} building - Building object with name, slug, address, city data
 * @returns {string} SEO-friendly building URL
 *
 * URL shape: /{city}/{name-slug}-{address-slug} — e.g.
 * "/toronto/theatre-district-residence-8-38-widmer-st".
 *
 * The address-slug is derived from the building's primary `address`
 * field with the trailing ", City" / ", ON …" suffix stripped, so the
 * city doesn't get duplicated inside the slug when it already prefixes
 * the path. Older buildings without an `address` fall back to the
 * structured street_address_1/2 fields.
 */
export const createSEOBuildingUrl = (building) => {
  if (!building) return '/building/unknown';

  const {
    name,
    slug,
    address,
    street_address_1,
    street_address_2,
    city,
    id,
  } = building;

  // Keep every comma/ampersand-separated part that starts with a digit
  // (i.e. a real street address) and drop the rest (city, province,
  // postal code). Handles "8-38 Widmer St, Toronto" → "8-38 Widmer St"
  // AND multi-address buildings like NOBU "15 Mercer St, 35 Mercer"
  // → "15 Mercer St 35 Mercer" without losing the second tower.
  const addressOnly = (s) => {
    if (typeof s !== 'string') return '';
    return s
      .split(/\s*[,&]\s*/)
      .map((p) => p.trim())
      .filter((p) => /^\d/.test(p))
      .join(' ');
  };

  const parts = [];
  if (name) parts.push(createSlug(name));

  if (address) {
    const addressSlug = createSlug(addressOnly(address) || address);
    if (addressSlug) parts.push(addressSlug);
  } else {
    // Fallback when only the structured fields are populated.
    if (street_address_1) parts.push(createSlug(addressOnly(street_address_1) || street_address_1));
    if (street_address_2) parts.push(createSlug(addressOnly(street_address_2) || street_address_2));
  }

  if (city && parts.length > 0) {
    return `/${createSlug(city)}/${parts.filter(Boolean).join('-')}`;
  }

  // Legacy fallbacks
  if (slug) {
    return `/building/${slug}`;
  }
  return createBuildingUrl(name, id, { slug });
};