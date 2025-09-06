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
 * Create a building URL with slug and ID
 * @param {string} name - Building name
 * @param {string} id - Building ID
 * @param {object} options - Optional parameters for SEO URL
 * @returns {string} Building URL
 */
export const createBuildingUrl = (name, id, options = {}) => {
  if (!id) return `/building/unknown`;
  
  // If we have building object with full data, create SEO URL
  if (options && typeof options === 'object' && options.address && options.city) {
    const citySlug = createSlug(options.city);
    const streetSlug = createSlug(options.address);
    const nameSlug = createSlug(name || 'building');
    return `/${citySlug}/${streetSlug}/${nameSlug}`;
  }
  
  // If we have city and street as separate parameters, create SEO-friendly URL
  if (options.city && options.street) {
    const citySlug = createSlug(options.city);
    const streetSlug = createSlug(options.street);
    const nameSlug = createSlug(name || 'building');
    return `/${citySlug}/${streetSlug}/${nameSlug}`;
  }
  
  // Fallback to simple building URL with name
  if (!name) return `/building/${id}`;
  const slug = createSlug(name);
  return `/building/${slug}-${id}`;
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
 * Create SEO-friendly building URL in the format /city/street/building-name/id
 * This matches the route pattern: /{city}/{street}/{buildingSlug}
 * @param {object} building - Building object with name, address, city data
 * @returns {string} SEO-friendly building URL
 */
export const createSEOBuildingUrl = (building) => {
  if (!building) return '/building/unknown';
  
  const { name, address, city, id } = building;
  
  if (city && address && id) {
    const citySlug = createSlug(city);
    const streetSlug = createSlug(address);
    
    // Include building name in URL if available, otherwise just use ID
    if (name) {
      const nameSlug = createSlug(name);
      return `/${citySlug}/${streetSlug}/${nameSlug}/${id}`;
    } else {
      return `/${citySlug}/${streetSlug}/${id}`;
    }
  }
  
  // Fallback to old format if missing data
  return createBuildingUrl(name, id);
};