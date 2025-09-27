// Fixed code for Search.jsx - lines 180-225
// Replace the existing code with this:

  // Get property type from URL params if available
  const urlParams = new URLSearchParams(window.location.search);
  const propertySubType = urlParams.get('property_sub_type');
  const propertyTypeParam = urlParams.get('property_type'); // Get property_type from URL (saved searches)
  const buildingId = urlParams.get('building_id');
  const transactionType = filters.transaction_type || urlParams.get('transaction_type');

  // Map transaction_type to status
  let statusFromTransaction = '';
  if (transactionType === 'rent') {
    statusFromTransaction = 'For Lease';
  } else if (transactionType === 'sale') {
    statusFromTransaction = 'For Sale';
  }

  // Convert property_sub_type or property_type to property_type array
  let propertyTypeArray = filters.property_type || [];
  if (propertySubType !== null) {
    // If property_sub_type is explicitly set in URL (even as empty), use it
    propertyTypeArray = propertySubType ? [propertySubType] : [];
  } else if (propertyTypeParam) {
    // Parse comma-separated property types from saved search
    propertyTypeArray = propertyTypeParam.split(',').map(type => type.trim());
  }

  // Default to Condo Apartment if building_id is provided (from building count buttons)
  if (buildingId && propertyTypeArray.length === 0) {
    propertyTypeArray = ['Condo Apartment'];
  }

  // Get street address from filters (passed from controller) or URL parameters
  const streetNumber = filters.street_number || urlParams.get('street_number');
  const streetName = filters.street_name || urlParams.get('street_name');
  const queryParam = urlParams.get('query'); // Get query from saved search
  const locationQuery = queryParam || ((streetNumber && streetName) ? `${streetNumber} ${streetName}` : (filters.search || urlParams.get('location') || ''));

  const [searchFilters, setSearchFilters] = useState({
    query: locationQuery,
    status: mapStatusToDisplay(filters.status || filters.forSale || statusFromTransaction || urlParams.get('status') || 'For Sale'),
    property_type: propertyTypeArray.length > 0 ? propertyTypeArray : ['Condo Apartment'], // Default to Condo Apartment if no type specified
    building_id: buildingId || filters.building_id || '',
    street_number: streetNumber || filters.street_number || '',
    street_name: streetName || filters.street_name || '',
    price_min: filters.minPrice || parseInt(urlParams.get('min_price')) || 0,
    price_max: filters.maxPrice || parseInt(urlParams.get('max_price')) || 10000000, // Default max price 10M
    bedrooms: filters.bedType || parseInt(urlParams.get('bedrooms')) || 0,
    bathrooms: filters.bathrooms || parseInt(urlParams.get('bathrooms')) || 0,
    min_sqft: parseInt(urlParams.get('min_sqft')) || 0,
    max_sqft: parseInt(urlParams.get('max_sqft')) || 0,
    parking: parseInt(urlParams.get('parking')) || 0,
    sort: filters.sort || urlParams.get('sort') || 'newest',
    tab: filters.tab || searchTab || 'listings',
    page: filters.page || 1,
  });