import React, { useState, useEffect, useRef, useCallback } from 'react';

// Icon components
const SearchIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const HomeIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

const BedIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.5V20.25c0 .414-.336.75-.75.75h-1.5a.75.75 0 01-.75-.75v-1.5H6v1.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75V8.5m0 0V6.75c0-1.036.84-1.875 1.875-1.875h14.25c1.035 0 1.875.839 1.875 1.875V8.5M3 8.5h18m-13.5 0v8.25M15 8.5v8.25" />
  </svg>
);

const BathIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5V19.5A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5V10.5M3 10.5h18M3 10.5V7.5a4.5 4.5 0 014.5-4.5h9A4.5 4.5 0 0121 7.5v3M7.5 15h.01M12 15h.01M16.5 15h.01" />
  </svg>
);

const DollarIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const FilterIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
  </svg>
);

const CloseIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ModernSearchBar = ({ 
  searchFilters, 
  onFilterChange, 
  onSearch,
  isLoading = false,
  activeTab = 'listings'
}) => {
  console.log('ModernSearchBar component loaded!', { searchFilters });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    location: searchFilters.query || 'Toronto',
    status: searchFilters.status || 'For Sale',
    propertyTypes: searchFilters.property_type || ['Condo Apt'],
    minPrice: searchFilters.price_min || '',
    maxPrice: searchFilters.price_max || '',
    bedrooms: searchFilters.bedrooms || '',
    bathrooms: searchFilters.bathrooms || '',
  });

  const autocompleteRef = useRef(null);
  const locationInputRef = useRef(null);

  // Property type options
  const propertyTypeOptions = [
    { value: 'Condo Apt', label: 'Condo', icon: '🏢' },
    { value: 'Detached', label: 'House', icon: '🏠' },
    { value: 'Semi-Detached', label: 'Semi', icon: '🏘️' },
    { value: 'Townhouse', label: 'Towns', icon: '🏘️' },
    { value: 'Condo Townhouse', label: 'Condo Town', icon: '🏘️' },
    { value: 'Link', label: 'Link', icon: '🔗' },
    { value: 'Vacant Land', label: 'Land', icon: '🏞️' },
    { value: 'Commercial', label: 'Commercial', icon: '🏪' },
  ];

  // Quick price ranges
  const quickPriceRanges = [
    { label: 'Under $500K', min: 0, max: 500000 },
    { label: '$500K-$750K', min: 500000, max: 750000 },
    { label: '$750K-$1M', min: 750000, max: 1000000 },
    { label: '$1M-$2M', min: 1000000, max: 2000000 },
    { label: '$2M+', min: 2000000, max: null },
  ];

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      const loadGoogleMapsScript = () => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${window.googleMapsApiKey}&libraries=places&callback=initAutocomplete`;
        script.async = true;
        script.defer = true;
        
        window.initAutocomplete = () => {
          initializeAutocomplete();
        };
        
        document.head.appendChild(script);
      };
      
      loadGoogleMapsScript();
      
      return () => {
        delete window.initAutocomplete;
      };
    } else {
      initializeAutocomplete();
    }
  }, []);

  const initializeAutocomplete = () => {
    if (!locationInputRef.current || !window.google || !window.google.maps || !window.google.maps.places) return;
    
    autocompleteRef.current = new window.google.maps.places.Autocomplete(locationInputRef.current, {
      componentRestrictions: { country: 'ca' },
      fields: ['address_components', 'formatted_address', 'geometry'],
      types: ['geocode', 'establishment'],
      bounds: new window.google.maps.LatLngBounds(
        new window.google.maps.LatLng(43.5810, -79.6392),
        new window.google.maps.LatLng(43.8554, -79.1168)
      ),
      strictBounds: false
    });
    
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();
      if (place.formatted_address) {
        handleLocalFilterChange('location', place.formatted_address);
      }
    });
  };

  // Handle local filter changes
  const handleLocalFilterChange = (field, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Apply all filters and search
  const handleApplyFilters = () => {
    // Update parent filters
    onFilterChange('query', localFilters.location);
    onFilterChange('status', localFilters.status);
    onFilterChange('property_type', localFilters.propertyTypes);
    onFilterChange('price_min', localFilters.minPrice ? parseInt(localFilters.minPrice) : 0);
    onFilterChange('price_max', localFilters.maxPrice ? parseInt(localFilters.maxPrice) : 0);
    onFilterChange('bedrooms', localFilters.bedrooms ? parseInt(localFilters.bedrooms) : 0);
    onFilterChange('bathrooms', localFilters.bathrooms ? parseInt(localFilters.bathrooms) : 0);
    
    // Trigger search
    setTimeout(() => {
      onSearch();
      setShowAdvancedFilters(false);
    }, 100);
  };

  // Quick search for common filters
  const handleQuickSearch = () => {
    handleApplyFilters();
  };

  // Clear all filters
  const handleClearFilters = () => {
    setLocalFilters({
      location: 'Toronto',
      status: 'For Sale',
      propertyTypes: [],
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: '',
    });
  };

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.propertyTypes.length > 0) count++;
    if (localFilters.minPrice || localFilters.maxPrice) count++;
    if (localFilters.bedrooms) count++;
    if (localFilters.bathrooms) count++;
    if (localFilters.status !== 'For Sale') count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <>
      {/* Main Search Bar */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Location Input */}
            <div className="flex-1">
              <div className="relative">
                <HomeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={locationInputRef}
                  type="text"
                  value={localFilters.location}
                  onChange={(e) => handleLocalFilterChange('location', e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleQuickSearch()}
                  placeholder="City, neighborhood, or address..."
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-700 font-medium"
                />
              </div>
            </div>

            {/* Transaction Type */}
            <div className="flex gap-2 bg-gray-50 p-1 rounded-xl">
              {['For Sale', 'For Rent', 'Sold'].map(type => (
                <button
                  key={type}
                  onClick={() => handleLocalFilterChange('status', type)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    localFilters.status === type
                      ? 'bg-white shadow-sm text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Search and Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleQuickSearch}
                disabled={isLoading}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
              >
                <SearchIcon className="w-5 h-5" />
                {isLoading ? 'Searching...' : 'Search'}
              </button>
              
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`px-4 py-4 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  showAdvancedFilters 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <FilterIcon className="w-5 h-5" />
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Quick Property Type Selection */}
          <div className="mt-4 flex flex-wrap gap-2">
            {propertyTypeOptions.map(type => (
              <button
                key={type.value}
                onClick={() => {
                  const newTypes = localFilters.propertyTypes.includes(type.value)
                    ? localFilters.propertyTypes.filter(t => t !== type.value)
                    : [...localFilters.propertyTypes, type.value];
                  handleLocalFilterChange('propertyTypes', newTypes);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                  localFilters.propertyTypes.includes(type.value)
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                }`}
              >
                <span>{type.icon}</span>
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="border-t border-gray-200 bg-gray-50 p-4 lg:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <DollarIcon className="inline w-4 h-4 mr-1" />
                  Price Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={localFilters.minPrice}
                    onChange={(e) => handleLocalFilterChange('minPrice', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <span className="self-center text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={localFilters.maxPrice}
                    onChange={(e) => handleLocalFilterChange('maxPrice', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                {/* Quick price ranges */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {quickPriceRanges.map(range => (
                    <button
                      key={range.label}
                      onClick={() => {
                        handleLocalFilterChange('minPrice', range.min);
                        handleLocalFilterChange('maxPrice', range.max || '');
                      }}
                      className="text-xs px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <BedIcon className="inline w-4 h-4 mr-1" />
                  Bedrooms
                </label>
                <div className="flex gap-2">
                  {['Any', '1+', '2+', '3+', '4+', '5+'].map(beds => (
                    <button
                      key={beds}
                      onClick={() => handleLocalFilterChange('bedrooms', beds === 'Any' ? '' : beds.replace('+', ''))}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        (beds === 'Any' && !localFilters.bedrooms) || 
                        (beds.replace('+', '') === localFilters.bedrooms)
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {beds}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bathrooms */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <BathIcon className="inline w-4 h-4 mr-1" />
                  Bathrooms
                </label>
                <div className="flex gap-2">
                  {['Any', '1+', '2+', '3+', '4+'].map(baths => (
                    <button
                      key={baths}
                      onClick={() => handleLocalFilterChange('bathrooms', baths === 'Any' ? '' : baths.replace('+', ''))}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        (baths === 'Any' && !localFilters.bathrooms) || 
                        (baths.replace('+', '') === localFilters.bathrooms)
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {baths}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col justify-end gap-2">
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all font-medium text-sm"
                >
                  Clear All
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold text-sm"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && !showAdvancedFilters && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600 font-medium">Active filters:</span>
          
          {localFilters.propertyTypes.length > 0 && (
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              <span>{localFilters.propertyTypes.join(', ')}</span>
              <button 
                onClick={() => handleLocalFilterChange('propertyTypes', [])}
                className="ml-1 hover:text-blue-900"
              >
                <CloseIcon className="w-3 h-3" />
              </button>
            </div>
          )}
          
          {(localFilters.minPrice || localFilters.maxPrice) && (
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              <span>
                ${localFilters.minPrice || '0'} - ${localFilters.maxPrice || 'Any'}
              </span>
              <button 
                onClick={() => {
                  handleLocalFilterChange('minPrice', '');
                  handleLocalFilterChange('maxPrice', '');
                }}
                className="ml-1 hover:text-blue-900"
              >
                <CloseIcon className="w-3 h-3" />
              </button>
            </div>
          )}
          
          {localFilters.bedrooms && (
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              <span>{localFilters.bedrooms}+ Beds</span>
              <button 
                onClick={() => handleLocalFilterChange('bedrooms', '')}
                className="ml-1 hover:text-blue-900"
              >
                <CloseIcon className="w-3 h-3" />
              </button>
            </div>
          )}
          
          {localFilters.bathrooms && (
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              <span>{localFilters.bathrooms}+ Baths</span>
              <button 
                onClick={() => handleLocalFilterChange('bathrooms', '')}
                className="ml-1 hover:text-blue-900"
              >
                <CloseIcon className="w-3 h-3" />
              </button>
            </div>
          )}
          
          <button
            onClick={handleClearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear all
          </button>
        </div>
      )}
    </>
  );
};

export default ModernSearchBar;