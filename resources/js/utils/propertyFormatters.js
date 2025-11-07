/**
 * Utility functions for formatting property data
 */

/**
 * Format address for display on cards
 * Shows: UnitNumber - StreetNumber - StreetName
 * ENHANCED: Handles multiple building addresses for buildings
 * @param {Object} property - Property object
 * @returns {string} Formatted address
 */
export const formatCardAddress = (property) => {
  // Handle building addresses that may have multiple addresses (e.g., "55 Mercer and 15 Mercer")
  if (property.source === 'building') {
    // Check if address contains multiple addresses
    const address = property.address || property.Address || '';
    if (address) {
      // Remove city, province, postal code from building addresses
      // Split by comma and take only the first part (street address)
      const cleanAddress = address.split(',')[0].trim();
      return cleanAddress; // Return only the street part
    }

    // Fallback to building name if no address
    return property.name || property.building_name || 'Building Address';
  }
  
  // For regular properties, use the original logic
  const unitNumber = property.UnitNumber || property.unitNumber || property.ApartmentNumber || property.LegalApartmentNumber || '';
  const streetNumber = property.StreetNumber || property.streetNumber || '';
  const streetName = property.StreetName || property.streetName || '';
  
  // Try to parse from UnparsedAddress if individual fields are empty
  if (!unitNumber && !streetNumber && !streetName) {
    const unparsedAddress = property.address || property.UnparsedAddress || property.unparsedAddress || '';

    if (unparsedAddress) {
      // First, extract just the street part (before first comma)
      const streetPart = unparsedAddress.split(',')[0].trim();

      // Try to parse patterns like "1801 - 62 Wellesley Street W" or "68 Corporate Drive 3338"
      // Pattern 1: Unit - StreetNumber StreetName
      const pattern1 = streetPart.match(/^(\d+)\s*-\s*(\d+)\s+(.+)$/);
      if (pattern1) {
        const [, unit, streetNum, streetName] = pattern1;
        return `${unit} - ${streetNum} ${streetName}`;
      }

      // Pattern 2: StreetNumber StreetName Unit (at end)
      const pattern2 = streetPart.match(/^(\d+)\s+(.+?)\s+(\d+)$/);
      if (pattern2) {
        const [, streetNum, streetName, unit] = pattern2;
        return `${unit} - ${streetNum} ${streetName}`;
      }

      // Pattern 3: Just return the street part as-is if no pattern matches
      return streetPart;
    }
  }
  
  // Build the address parts - Unit - StreetNumber StreetName StreetSuffix
  let parts = [];

  if (unitNumber) {
    parts.push(unitNumber);
  }

  // Combine street number, name, and suffix together
  const streetSuffix = property.StreetSuffix || property.streetSuffix || '';
  let streetPart = '';
  if (streetNumber && streetName) {
    streetPart = `${streetNumber} ${streetName}`;
    // Add street suffix if available, otherwise default to "St"
    if (streetSuffix) {
      streetPart += ` ${streetSuffix}`;
    } else {
      // Default to "St" if no suffix provided
      streetPart += ` St`;
    }
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
  
  // Fallback - try to extract just street address from full address
  const fullAddress = property.address || property.UnparsedAddress || property.unparsedAddress || '';
  if (fullAddress) {
    // Remove city, province, postal code by taking only the part before the first comma
    const streetOnly = fullAddress.split(',')[0].trim();
    return streetOnly;
  }

  return 'Address not available';
};

/**
 * Get full address for map geocoding
 * ENHANCED: Better handling for building addresses
 * @param {Object} property - Property object
 * @returns {string} Full address for geocoding
 */
export const getFullAddress = (property) => {
  // For buildings, use the complete address including multiple addresses
  if (property.source === 'building') {
    const buildingAddress = property.address || property.Address || '';
    if (buildingAddress) {
      // Add city and province if available for better geocoding
      const city = property.city || property.City || '';
      const province = property.province || property.Province || '';
      
      let fullAddress = buildingAddress;
      if (city) {
        fullAddress += `, ${city}`;
      }
      if (province) {
        fullAddress += `, ${province}`;
      }
      
      return fullAddress;
    }
  }
  
  // For regular properties
  return property.address || property.UnparsedAddress || 
         property.unparsedAddress || 'Address not available';
};

/**
 * Format area with sqft
 * @param {Object} property - Property object
 * @returns {string} Formatted area
 */
export const formatArea = (property) => {
  // Check for area fields - prioritize LivingAreaRange (ranges like "900-999")
  const area = property.LivingAreaRange || property.livingAreaRange ||
               property.AboveGradeFinishedArea || property.sqft || 0;
  
  // Check if area exists and is not 0
  if (area && area !== 0 && area !== '0') {
    // If it's a range like "900-999", return as-is with sqft
    if (typeof area === 'string' && area.includes('-')) {
      return `${area} sqft`;
    }
    // If it's a number, format it
    if (!isNaN(area)) {
      return `${parseInt(area).toLocaleString()} sqft`;
    }
    // If it already contains 'sqft', don't add it again
    if (area.toString().toLowerCase().includes('sqft')) {
      return area;
    }
    return `${area} sqft`;
  }
  
  // Return "Area N/A" when no area data is available
  return 'Area N/A';
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
 * ENHANCED: Better handling for building features
 * @param {Object} property - Property object
 * @returns {string} Features string
 */
export const buildCardFeatures = (property) => {
  const features = [];
  
  // For buildings, show different features (excluding units and floors)
  if (property.source === 'building') {
    // Units Available for Sale
    const unitsForSale = property.units_for_sale || property.unitsForSale || property.UnitsForSale;
    if (unitsForSale && unitsForSale > 0) {
      features.push(`${unitsForSale} for sale`);
    }
    
    // Units Available for Rent
    const unitsForRent = property.units_for_rent || property.unitsForRent || property.UnitsForRent;
    if (unitsForRent && unitsForRent > 0) {
      features.push(`${unitsForRent} for rent`);
    }
    
    // Year Built
    const yearBuilt = property.year_built || property.yearBuilt || property.YearBuilt;
    if (yearBuilt) {
      features.push(`Built ${yearBuilt}`);
    }
    
    return features.join(' | ');
  }
  
  // For regular properties, use original logic
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
  
  // Area - Always show area (will display "Area N/A" if not available)
  const area = formatArea(property);
  features.push(area);
  
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