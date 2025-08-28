import React, { useState, useEffect, useRef, useCallback } from 'react';

// Icon components
const ChevronDownIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

const MagnifyingGlassIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const MapPinIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
  </svg>
);

const EnhancedSearchBar = ({ 
  searchFilters, 
  onFilterChange, 
  onSearch,
  isLoading = false,
  activeTab = 'listings'
}) => {
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [showBedsDropdown, setShowBedsDropdown] = useState(false);
  const [showBathsDropdown, setShowBathsDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showPropertyTypeDropdown, setShowPropertyTypeDropdown] = useState(false);
  
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRefs = useRef({});
  
  // Property type options
  const propertyTypes = [
    'Condo Apt',
    'Detached',
    'Semi-Detached',
    'Townhouse',
    'Condo Townhouse',
    'Link',
    'Co-Op Apt',
    'Duplex',
    'Triplex',
    'Fourplex',
    'Multiplex',
    'Vacant Land',
    'Commercial',
    'Office',
    'Retail',
    'Industrial'
  ];
  
  // Price range options
  const priceRanges = [
    { label: 'Any Price', min: 0, max: null },
    { label: '$0 - $500K', min: 0, max: 500000 },
    { label: '$500K - $750K', min: 500000, max: 750000 },
    { label: '$750K - $1M', min: 750000, max: 1000000 },
    { label: '$1M - $1.5M', min: 1000000, max: 1500000 },
    { label: '$1.5M - $2M', min: 1500000, max: 2000000 },
    { label: '$2M - $3M', min: 2000000, max: 3000000 },
    { label: '$3M - $5M', min: 3000000, max: 5000000 },
    { label: '$5M+', min: 5000000, max: null },
  ];
  
  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      // Load Google Places library if not loaded
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${window.googleMapsApiKey}&libraries=places&callback=initAutocomplete`;
      script.async = true;
      script.defer = true;
      
      window.initAutocomplete = () => {
        initializeAutocomplete();
      };
      
      document.head.appendChild(script);
      
      return () => {
        delete window.initAutocomplete;
      };
    } else {
      initializeAutocomplete();
    }
  }, []);
  
  const initializeAutocomplete = () => {
    if (!inputRef.current || !window.google || !window.google.maps || !window.google.maps.places) return;
    
    // Configure autocomplete for Canadian addresses with focus on Toronto
    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'ca' },
      fields: ['address_components', 'formatted_address', 'geometry'],
      types: ['geocode', 'establishment'],
      bounds: new window.google.maps.LatLngBounds(
        new window.google.maps.LatLng(43.5810, -79.6392), // SW Toronto bounds
        new window.google.maps.LatLng(43.8554, -79.1168)  // NE Toronto bounds
      ),
      strictBounds: false
    });
    
    // Handle place selection
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();
      
      if (place.formatted_address) {
        // Extract and format the address similar to "319 Jarvis Street 1802, Toronto C08, ON M5B 0C8"
        let formattedAddress = place.formatted_address;
        
        // Parse address components for better formatting
        const components = place.address_components || [];
        let streetNumber = '';
        let streetName = '';
        let city = '';
        let province = '';
        let postalCode = '';
        
        components.forEach(component => {
          const types = component.types;
          if (types.includes('street_number')) {
            streetNumber = component.long_name;
          } else if (types.includes('route')) {
            streetName = component.long_name;
          } else if (types.includes('locality')) {
            city = component.long_name;
          } else if (types.includes('administrative_area_level_1')) {
            province = component.short_name;
          } else if (types.includes('postal_code')) {
            postalCode = component.long_name;
          }
        });
        
        // Construct address in the desired format
        if (streetNumber && streetName) {
          formattedAddress = `${streetNumber} ${streetName}`;
          if (city) formattedAddress += `, ${city}`;
          if (province) formattedAddress += `, ${province}`;
          if (postalCode) formattedAddress += ` ${postalCode}`;
        }
        
        // Update the search query and trigger search
        onFilterChange('query', formattedAddress);
        
        // Auto-submit the search
        setTimeout(() => onSearch(), 100);
      }
    });
  };
  
  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.entries(dropdownRefs.current).forEach(([key, ref]) => {
        if (ref && !ref.contains(event.target)) {
          switch(key) {
            case 'price': setShowPriceDropdown(false); break;
            case 'beds': setShowBedsDropdown(false); break;
            case 'baths': setShowBathsDropdown(false); break;
            case 'type': setShowTypeDropdown(false); break;
            case 'propertyType': setShowPropertyTypeDropdown(false); break;
          }
        }
      });
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Format price display
  const formatPrice = (value) => {
    if (!value || value === 0) return 'Any';
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${Math.round(value / 1000)}K`;
    return `$${value.toLocaleString()}`;
  };
  
  // Get current property types label
  const getCurrentPropertyTypesLabel = () => {
    const types = searchFilters.property_type || [];
    if (types.length === 0) return 'All Types';
    if (types.length === 1) return types[0];
    return `${types.length} Types`;
  };
  
  // Get current price range label
  const getCurrentPriceLabel = () => {
    const min = searchFilters.price_min || 0;
    const max = searchFilters.price_max;
    
    if (min === 0 && (!max || max >= 10000000)) return 'Any Price';
    if (min > 0 && (!max || max >= 10000000)) return `${formatPrice(min)}+`;
    if (min === 0 && max) return `Up to ${formatPrice(max)}`;
    return `${formatPrice(min)} - ${formatPrice(max)}`;
  };
  
  // Handle filter changes with auto-submit
  const handleFilterChangeWithSubmit = useCallback((field, value) => {
    onFilterChange(field, value);
    // Auto-submit after a short delay
    setTimeout(() => onSearch(), 300);
  }, [onFilterChange, onSearch]);
  
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
      <div className="flex flex-wrap items-center gap-2">
        {/* Address Search with Google Autocomplete */}
        <div className="flex-1 min-w-[250px]">
          <div className="relative">
            <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Enter address, neighborhood, or city..."
              value={searchFilters.query}
              onChange={(e) => onFilterChange('query', e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSearch()}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
            />
          </div>
        </div>
        
        {/* Transaction Type Dropdown */}
        <div ref={el => dropdownRefs.current.type = el} className="relative flex-shrink-0">
          <button
            onClick={() => setShowTypeDropdown(!showTypeDropdown)}
            className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors min-w-[120px] bg-white"
          >
            <span className="text-sm font-medium text-gray-700">
              {searchFilters.status || 'For Sale'}
            </span>
            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
          </button>
          
          {showTypeDropdown && (
            <div className="absolute top-full mt-2 w-full min-w-[150px] bg-white rounded-xl shadow-lg border border-gray-100 z-50">
              {['For Sale', 'For Rent', 'Sold', 'Leased'].map(type => (
                <button
                  key={type}
                  onClick={() => {
                    handleFilterChangeWithSubmit('status', type);
                    setShowTypeDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                    searchFilters.status === type ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                  } ${type === 'For Sale' ? 'rounded-t-xl' : ''} ${type === 'Leased' ? 'rounded-b-xl' : ''}`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Property Type Dropdown */}
        <div ref={el => dropdownRefs.current.propertyType = el} className="relative flex-shrink-0">
          <button
            onClick={() => setShowPropertyTypeDropdown(!showPropertyTypeDropdown)}
            className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors min-w-[140px] bg-white"
          >
            <span className="text-sm font-medium text-gray-700">
              {getCurrentPropertyTypesLabel()}
            </span>
            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
          </button>
          
          {showPropertyTypeDropdown && (
            <div className="absolute top-full mt-2 w-[250px] bg-white rounded-xl shadow-lg border border-gray-100 z-50 p-4 max-h-[400px] overflow-y-auto">
              <div className="space-y-2">
                {/* Select All / Clear */}
                <div className="flex gap-2 mb-3 pb-3 border-b">
                  <button
                    onClick={() => {
                      onFilterChange('property_type', []);
                      setTimeout(() => onSearch(), 100);
                    }}
                    className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    All Types
                  </button>
                  <button
                    onClick={() => {
                      onFilterChange('property_type', ['Condo Apt']);
                      setTimeout(() => onSearch(), 100);
                    }}
                    className="text-xs px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                  >
                    Condos Only
                  </button>
                </div>
                
                {/* Property Type Checkboxes */}
                {propertyTypes.map(type => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                    <input
                      type="checkbox"
                      checked={(searchFilters.property_type || []).includes(type)}
                      onChange={(e) => {
                        const currentTypes = searchFilters.property_type || [];
                        let newTypes;
                        if (e.target.checked) {
                          newTypes = [...currentTypes, type];
                        } else {
                          newTypes = currentTypes.filter(t => t !== type);
                        }
                        onFilterChange('property_type', newTypes);
                        setTimeout(() => onSearch(), 300);
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Beds Dropdown */}
        <div ref={el => dropdownRefs.current.beds = el} className="relative flex-shrink-0">
          <button
            onClick={() => setShowBedsDropdown(!showBedsDropdown)}
            className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors min-w-[100px] bg-white"
          >
            <span className="text-sm font-medium text-gray-700">
              {searchFilters.bedrooms > 0 ? `${searchFilters.bedrooms}+ Beds` : 'Beds'}
            </span>
            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
          </button>
          
          {showBedsDropdown && (
            <div className="absolute top-full mt-2 w-full min-w-[120px] bg-white rounded-xl shadow-lg border border-gray-100 z-50">
              {[0, 1, 2, 3, 4, 5].map(beds => (
                <button
                  key={beds}
                  onClick={() => {
                    handleFilterChangeWithSubmit('bedrooms', beds);
                    setShowBedsDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                    searchFilters.bedrooms === beds ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                  } ${beds === 0 ? 'rounded-t-xl' : ''} ${beds === 5 ? 'rounded-b-xl' : ''}`}
                >
                  {beds === 0 ? 'Any' : `${beds}+`}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Baths Dropdown */}
        <div ref={el => dropdownRefs.current.baths = el} className="relative flex-shrink-0">
          <button
            onClick={() => setShowBathsDropdown(!showBathsDropdown)}
            className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors min-w-[100px] bg-white"
          >
            <span className="text-sm font-medium text-gray-700">
              {searchFilters.bathrooms > 0 ? `${searchFilters.bathrooms}+ Baths` : 'Baths'}
            </span>
            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
          </button>
          
          {showBathsDropdown && (
            <div className="absolute top-full mt-2 w-full min-w-[120px] bg-white rounded-xl shadow-lg border border-gray-100 z-50">
              {[0, 1, 2, 3, 4].map(baths => (
                <button
                  key={baths}
                  onClick={() => {
                    handleFilterChangeWithSubmit('bathrooms', baths);
                    setShowBathsDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                    searchFilters.bathrooms === baths ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                  } ${baths === 0 ? 'rounded-t-xl' : ''} ${baths === 4 ? 'rounded-b-xl' : ''}`}
                >
                  {baths === 0 ? 'Any' : `${baths}+`}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Price Range Dropdown */}
        <div ref={el => dropdownRefs.current.price = el} className="relative flex-shrink-0">
          <button
            onClick={() => setShowPriceDropdown(!showPriceDropdown)}
            className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors min-w-[140px] bg-white"
          >
            <span className="text-sm font-medium text-gray-700">
              {getCurrentPriceLabel()}
            </span>
            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
          </button>
          
          {showPriceDropdown && (
            <div className="absolute top-full mt-2 w-[280px] bg-white rounded-xl shadow-lg border border-gray-100 z-50 p-4">
              <div className="space-y-3">
                {/* Quick select buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {priceRanges.map((range, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        handleFilterChangeWithSubmit('price_min', range.min);
                        handleFilterChangeWithSubmit('price_max', range.max || 10000000);
                        setShowPriceDropdown(false);
                      }}
                      className="px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
                
                {/* Custom range inputs */}
                <div className="border-t pt-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={searchFilters.price_min || ''}
                      onChange={(e) => onFilterChange('price_min', parseInt(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={searchFilters.price_max || ''}
                      onChange={(e) => onFilterChange('price_max', parseInt(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => {
                      onSearch();
                      setShowPriceDropdown(false);
                    }}
                    className="w-full mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Search Button */}
        <button
          onClick={onSearch}
          disabled={isLoading}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium flex-shrink-0"
        >
          <MagnifyingGlassIcon className="w-5 h-5" />
          <span>Search</span>
        </button>
      </div>
    </div>
  );
};

export default EnhancedSearchBar;