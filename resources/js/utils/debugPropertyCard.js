/**
 * Debug utility to test property card formatting
 * Run this in the browser console to test the formatters
 */

import { 
  formatCardAddress, 
  buildCardFeatures, 
  formatArea,
  getParkingCount,
  getBrokerageName 
} from './propertyFormatters';

// Test function you can run in console
window.testPropertyFormatters = (property) => {
  console.group('%c🧪 PROPERTY FORMATTER TEST', 'background: #222; color: #bada55; font-size: 16px; padding: 5px');
  
  // Test with sample data if no property provided
  if (!property) {
    property = {
      // Test case 1: Full data
      UnitNumber: '304',
      StreetNumber: '835',
      StreetName: 'St. Clair Avenue',
      StreetSuffix: 'W',
      UnparsedAddress: '835 St. Clair Avenue W 304, Toronto C02, ON M6C 0A8',
      BedroomsTotal: 2,
      BathroomsTotalInteger: 2,
      LivingAreaRange: '1000-1200',
      ParkingTotal: 1,
      ListOfficeName: 'CHESTNUT PARK REAL ESTATE LIMITED',
      price: 740000,
      listingKey: 'C12373183'
    };
    console.log('%c📦 Using test property data', 'color: orange');
  }
  
  console.log('%c📥 Input Property:', 'color: #2196F3; font-weight: bold', property);
  
  // Test each formatter
  console.group('%c🔧 Testing Formatters', 'color: #4CAF50');
  
  const address = formatCardAddress(property);
  console.log('✅ formatCardAddress result:', address);
  
  const features = buildCardFeatures(property);
  console.log('✅ buildCardFeatures result:', features);
  
  const area = formatArea(property);
  console.log('✅ formatArea result:', area);
  
  const parking = getParkingCount(property);
  console.log('✅ getParkingCount result:', parking);
  
  const brokerage = getBrokerageName(property);
  console.log('✅ getBrokerageName result:', brokerage);
  
  console.groupEnd();
  
  // Expected vs Actual
  console.group('%c📊 Expected vs Actual', 'color: #FF9800');
  console.table({
    'Address': {
      Expected: '304 - 835 St. Clair Avenue',
      Actual: address,
      '✅ Match': address === '304 - 835 St. Clair Avenue'
    },
    'Features': {
      Expected: '2 Beds | 2 Baths | 1000-1200 sqft | 1 Parking',
      Actual: features,
      '✅ Contains sqft': features.includes('sqft'),
      '✅ Contains Parking': features.includes('Parking')
    }
  });
  console.groupEnd();
  
  console.groupEnd();
  
  return {
    address,
    features,
    area,
    parking,
    brokerage
  };
};

// Auto-run test when loaded
console.log('%c💡 Property formatter debug loaded!', 'background: #4CAF50; color: white; padding: 5px');
console.log('Run window.testPropertyFormatters() to test with sample data');
console.log('Or window.testPropertyFormatters(propertyObject) to test with your data');

// Export for use
export default window.testPropertyFormatters;