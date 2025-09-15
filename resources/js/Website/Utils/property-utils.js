/**
 * Format price for display
 * @param {number} price - The price value
 * @param {boolean} isRental - Whether this is a rental property
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, isRental = false) => {
  if (!price || price === 0) return 'Price TBD';

  // Convert to number if it's a string
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (isRental) {
    // Format rental price
    return `$${numPrice.toLocaleString()}/mo`;
  } else {
    // Format sale price
    if (numPrice >= 1000000) {
      // Show as millions
      const millions = (numPrice / 1000000).toFixed(1);
      return `$${millions.replace(/\.0$/, '')}M`;
    } else if (numPrice >= 1000) {
      // Show as thousands
      const thousands = (numPrice / 1000).toFixed(0);
      return `$${thousands}K`;
    } else {
      return `$${numPrice.toLocaleString()}`;
    }
  }
};

/**
 * Format address for display
 * @param {object} property - The property object
 * @returns {string} Formatted address
 */
export const formatAddress = (property) => {
  const unitNumber = property.UnitNumber || property.unitNumber || '';
  const streetNumber = property.StreetNumber || property.streetNumber || '';
  const streetName = property.StreetName || property.streetName || '';
  const streetSuffix = property.StreetSuffix || property.streetSuffix || '';
  const city = property.City || property.city || '';
  const province = property.StateOrProvince || property.province || '';
  const postalCode = property.PostalCode || property.postalCode || '';

  // Build the address
  let address = '';

  if (unitNumber) {
    address += `Unit ${unitNumber}, `;
  }

  if (streetNumber && streetName) {
    address += `${streetNumber} ${streetName}`;
    if (streetSuffix) {
      address += ` ${streetSuffix}`;
    }
  }

  if (city) {
    address += `, ${city}`;
  }

  if (province) {
    address += `, ${province}`;
  }

  if (postalCode) {
    address += ` ${postalCode}`;
  }

  return address || property.UnparsedAddress || property.address || 'Address not available';
};

/**
 * Get property features formatted for display
 * @param {object} property - The property object
 * @returns {string} Formatted features string
 */
export const getPropertyFeatures = (property) => {
  const features = [];

  // Bedrooms
  const bedrooms = property.BedroomsTotal || property.bedroomsTotal || property.bedrooms || 0;
  if (bedrooms) {
    features.push(`${bedrooms} Bed${bedrooms !== 1 ? 's' : ''}`);
  }

  // Bathrooms
  const bathrooms = property.BathroomsTotalInteger || property.bathroomsTotalInteger || property.bathrooms || 0;
  if (bathrooms) {
    features.push(`${bathrooms} Bath${bathrooms !== 1 ? 's' : ''}`);
  }

  // Square footage
  const sqft = property.LivingAreaRange || property.livingAreaRange || property.AboveGradeFinishedArea || property.sqft || '';
  if (sqft) {
    features.push(typeof sqft === 'string' ? sqft : `${sqft} sqft`);
  }

  // Parking
  const parking = property.ParkingTotal || property.parkingTotal || property.parking || 0;
  if (parking) {
    features.push(`${parking} Parking`);
  }

  return features.join(' | ');
};

/**
 * Get property type label
 * @param {object} property - The property object
 * @returns {string} Property type label
 */
export const getPropertyTypeLabel = (property) => {
  const propertyType = property.PropertySubType || property.propertyType || property.PropertyType || '';

  // Clean up common property types
  const typeMap = {
    'Condo Apartment': 'Condo',
    'Condo Townhouse': 'Townhouse',
    'Detached House': 'House',
    'Semi-Detached': 'Semi-Detached',
    'Townhouse': 'Townhouse',
    'Apartment': 'Apartment'
  };

  return typeMap[propertyType] || propertyType || 'Property';
};

/**
 * Get transaction type label
 * @param {object} property - The property object
 * @returns {string} Transaction type label
 */
export const getTransactionTypeLabel = (property) => {
  const transactionType = property.TransactionType || property.transactionType || '';

  if (transactionType === 'For Lease' || transactionType === 'For Rent') {
    return 'For Rent';
  } else if (transactionType === 'For Sale') {
    return 'For Sale';
  }

  return transactionType || 'Available';
};