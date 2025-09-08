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
      return address; // Return the full building address as-is
    }
    
    // Fallback to building name if no address
    return property.name || property.building_name || 'Building Address';
  }
  
  // For regular properties, use the original logic
  const unitNumber = property.UnitNumber || property.unitNumber || property.ApartmentNumber || property.LegalApartmentNumber || '';
  const streetNumber = property.StreetNumber || property.streetNumber || '';
  const streetName = property.StreetName || property.streetName || '';
  
  // Try to parse from UnparsedAddress if individual fields are empty
  if (!unitNumber || !streetNumber || !streetName) {
    const unparsedAddress = property.address || property.UnparsedAddress || property.unparsedAddress || '';
    
    if (unparsedAddress) {
      // Try to parse address like "68 Corporate Drive 3338, Toronto E09, ON M1H 3H3"
      // Pattern: Street + Unit at end, followed by comma and location
      const addressMatch = unparsedAddress.match(/^(.+?)\s+(\d+)\s*,?\s*(.*)$/);
      if (addressMatch) {
        const [, streetPart, unit, rest] = addressMatch;
        
        // Split street part into number and name
        const streetMatch = streetPart.match(/^(\d+)\s+(.+)$/);
        if (streetMatch) {
          const [, parsedStreetNumber, parsedStreetName] = streetMatch;
          
          return `${unit} - ${parsedStreetNumber} ${parsedStreetName}`;
        }
      }
    }
  }
  
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
  
  // For buildings, show different features
  if (property.source === 'building') {
    // Total Units
    const totalUnits = property.total_units || property.totalUnits || property.TotalUnits;
    if (totalUnits) {
      features.push(`${totalUnits} Units`);
    }
    
    // Floors
    const floors = property.floors || property.Floors;
    if (floors) {
      features.push(`${floors} Floors`);
    }
    
    // Year Built
    const yearBuilt = property.year_built || property.yearBuilt || property.YearBuilt;
    if (yearBuilt) {
      features.push(`Built ${yearBuilt}`);
    }
    
    // Parking spots (for buildings)
    const parkingSpots = property.parking_spots || property.parkingSpots || property.ParkingSpots;
    if (parkingSpots) {
      features.push(`${parkingSpots} Parking`);
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