/**
 * Test script to demonstrate the map label functionality
 * This shows how the map labels will change based on the activeTab
 */

// Mock property data
const sampleProperty = {
  ListingKey: 'C12345678',
  ListPrice: 850000,
  UnparsedAddress: '123 Main St, Toronto, ON',
  Latitude: 43.6532,
  Longitude: -79.3832
};

// Mock building data
const sampleBuilding = {
  id: 'building_123',
  building_name: 'The Metropolitan',
  name: 'The Metropolitan Condos',
  address: '456 Queen St W, Toronto, ON',
  Latitude: 43.6426,
  Longitude: -79.3871
};

// Simulate the getMarkerLabel function from SimplePropertyMap
function getMarkerLabel(property, activeTab) {
  if (activeTab === 'buildings') {
    // For buildings, show building name or address
    return property.building_name || property.name || property.UnparsedAddress || property.address || 'Building';
  } else {
    // For properties, show price
    const formatPrice = (price) => {
      if (!price || price <= 0) return '?';
      if (price >= 1000000) return Math.round(price / 1000000) + 'M';
      if (price >= 1000) return Math.round(price / 1000) + 'K';
      return Math.round(price / 1000) + 'K';
    };
    return '$' + formatPrice(property.ListPrice);
  }
}

// Test the functionality
console.log('=== Map Label Test Results ===');
console.log('');

console.log('Property on LISTINGS tab:');
console.log('Label:', getMarkerLabel(sampleProperty, 'listings'));
console.log('Expected: Price like "$850K"');
console.log('');

console.log('Building on BUILDINGS tab:');
console.log('Label:', getMarkerLabel(sampleBuilding, 'buildings'));
console.log('Expected: Building name like "The Metropolitan"');
console.log('');

console.log('Property on BUILDINGS tab (edge case):');
console.log('Label:', getMarkerLabel(sampleProperty, 'buildings'));
console.log('Expected: Address since no building_name/name field');
console.log('');

console.log('Building on LISTINGS tab (edge case):');
console.log('Label:', getMarkerLabel(sampleBuilding, 'listings'));
console.log('Expected: Price (but building may not have ListPrice, so "?")');

console.log('');
console.log('=== Implementation Summary ===');
console.log('✅ Added activeTab prop to SimplePropertyMap');
console.log('✅ Added activeTab prop to ViewportAwarePropertyMap');
console.log('✅ Updated Search.jsx to pass activeTab to map components');
console.log('✅ Created getMarkerLabel() function to handle conditional labeling');
console.log('✅ Modified marker creation to use conditional labels');
console.log('✅ Building names will show on buildings tab');
console.log('✅ Prices will continue to show on listings tab');
