/**
 * Utility functions for formatting property data
 */

/**
 * Format address for display on cards
 * Shows: UnitNumber - StreetNumber - StreetName
 * @param {Object} property - Property object
 * @returns {string} Formatted address
 */
export const formatCardAddress = (property) => {
  const unitNumber = property.UnitNumber || property.unitNumber || '';
  const streetNumber = property.StreetNumber || property.streetNumber || '';
  const streetName = property.StreetName || property.streetName || '';
  
  // Build the address parts - Unit - StreetNumber StreetName (no suffix)
  let parts = [];
  
  if (unitNumber) {
    parts.push(unitNumber);
  }
  
  // Combine street number and name together (not separated by dash)
  let streetPart = '';
  if (streetNumber && streetName) {
    streetPart = `${streetNumber} ${streetName}`;
  } else if (streetNumber) {
    streetPart = streetNumber;
  } else if (streetName) {
    streetPart = streetName;
  }
  
  if (streetPart) {
    parts.push(streetPart);
  }
  
  // If we have parts, join with ' - ', otherwise return the full address as fallback
  if (parts.length > 0) {
    return parts.join(' - ');
  }
  
  // Fallback to full address if specific fields not available
  return property.address || property.UnparsedAddress || 'Address not available';
};

/**
 * Get full address for map geocoding
 * @param {Object} property - Property object
 * @returns {string} Full address for geocoding
 */
export const getFullAddress = (property) => {
  return property.address || property.UnparsedAddress || 
         property.unparsedAddress || 'Address not available';
};

/**
 * Format area with sqft
 * @param {Object} property - Property object
 * @returns {string} Formatted area
 */
export const formatArea = (property) => {
  const area = property.LivingAreaRange || property.livingAreaRange || 
               property.BuildingAreaTotal || property.buildingAreaTotal ||
               property.LivingArea || property.livingArea ||
               property.AboveGradeFinishedArea || property.sqft || '';
  
  if (area) {
    // If it's a range like "1000-1500", just take it as is
    // If it's a number, format it
    if (!isNaN(area)) {
      return `${parseInt(area).toLocaleString()} sqft`;
    }
    return `${area} sqft`;
  }
  
  return null;
};

/**
 * Get parking count
 * @param {Object} property - Property object
 * @returns {string|null} Parking count or null
 */
export const getParkingCount = (property) => {
  const parking = property.ParkingSpaces || property.parkingSpaces ||
                  property.ParkingTotal || property.parkingTotal || 0;
  
  // Always show parking count, even if it's 0
  return parking + ' Parking';
};

/**
 * Get brokerage name
 * @param {Object} property - Property object
 * @returns {string} Brokerage name
 */
export const getBrokerageName = (property) => {
  return property.ListOfficeName || property.listOfficeName || 
         property.ListOffice1_Name || property.listOffice1_Name || '';
};

/**
 * Build features string for property cards
 * @param {Object} property - Property object
 * @returns {string} Features string
 */
export const buildCardFeatures = (property) => {
  const features = [];
  
  // Bedrooms
  const bedrooms = property.bedrooms || property.BedroomsTotal || property.bedroomsTotal || 0;
  if (bedrooms > 0) {
    features.push(bedrooms + 'BD');
  }
  
  // Bathrooms
  const bathrooms = property.bathrooms || property.BathroomsTotalInteger || 
                    property.bathroomsTotalInteger || property.BathroomsFull || 0;
  if (bathrooms > 0) {
    features.push(bathrooms + 'BA');
  }
  
  // Area
  const area = formatArea(property);
  if (area) {
    features.push(area);
  }
  
  // Parking
  const parking = getParkingCount(property);
  if (parking) {
    features.push(parking);
  }
  
  return features.join(' | ');
};

export default {
  formatCardAddress,
  getFullAddress,
  formatArea,
  getParkingCount,
  getBrokerageName,
  buildCardFeatures
};