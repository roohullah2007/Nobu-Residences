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
 */
export const createSEOBuildingUrl = (building) => {
  if (!building) return '/building/unknown';
  
  const { name, slug, address, city, id } = building;
  
  // If building has a slug, use it
  if (slug) {
    return `/building/${slug}`;
  }
  
  // If we have city and address data, create SEO URL
  if (city && address) {
    const citySlug = createSlug(city);
    const streetSlug = createSlug(address);
    const nameSlug = createSlug(name || 'building');
    return `/${citySlug}/${streetSlug}/${nameSlug}`;
  }
  
  // Fallback to simple format with name slug
  return createBuildingUrl(name, id, { slug });
};