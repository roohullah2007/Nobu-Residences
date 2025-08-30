import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';

// Icon components
const Search = ({ className }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
    </svg>
);

const ChevronDown = ({ className }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6"></path>
    </svg>
);

const MapPin = ({ className }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
    </svg>
);

const Home = ({ className }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
);

const IDXAmpreSearchBar = ({ initialValues = {}, onSearch }) => {
    const [availablePropertyTypes, setAvailablePropertyTypes] = useState([]);
    const [loadingPropertyTypes, setLoadingPropertyTypes] = useState(true);
    const [searchData, setSearchData] = useState({
        location: initialValues.location || '',
        propertyType: initialValues.propertyType || 'For Sale',
        propertySubType: initialValues.propertySubType || 'Condo Apartment', // Default to Condo Apartment
        bedrooms: initialValues.bedrooms || '0',
        bathrooms: initialValues.bathrooms || '0',
        minPrice: initialValues.minPrice || 0,
        maxPrice: initialValues.maxPrice || 10000000,
    });

    const [searchType, setSearchType] = useState('street'); // street, city, postal, global
    const [showSearchTypeDropdown, setShowSearchTypeDropdown] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [showPricePopup, setShowPricePopup] = useState(false);
    const [showPropertyTypeDropdown, setShowPropertyTypeDropdown] = useState(false);
    const locationInputRef = useRef(null);
    const autocompleteRef = useRef(null);
    const dropdownRef = useRef(null);
    const pricePopupRef = useRef(null);
    const propertyTypeRef = useRef(null);

    // Search type options
    const searchTypes = [
        { value: 'street', label: 'Street Address', placeholder: 'Enter street address...', icon: <Home className="w-4 h-4" /> },
        { value: 'city', label: 'City', placeholder: 'Enter city name...', icon: <MapPin className="w-4 h-4" /> },
        { value: 'postal', label: 'Postal Code', placeholder: 'Enter postal code...', icon: <MapPin className="w-4 h-4" /> },
        { value: 'global', label: 'All', placeholder: 'Search by address, city, or postal code...', icon: <Search className="w-4 h-4" /> },
    ];

    // Get current search type config
    const currentSearchType = searchTypes.find(t => t.value === searchType) || searchTypes[0];

    // Map property types with icons
    const getPropertyTypeWithIcon = (type) => {
        const iconMap = {
            '': <Search className="w-4 h-4" />,
            'Condo Apartment': <Home className="w-4 h-4" />,
            'Condo Townhouse': <Home className="w-4 h-4" />,
            'Detached': <Home className="w-4 h-4" />,
            'Semi-Detached': <Home className="w-4 h-4" />,
            'Attached/Townhouse': <Home className="w-4 h-4" />,
            'Link': <Home className="w-4 h-4" />,
            'Vacant Land': <MapPin className="w-4 h-4" />,
            'Commercial': <Home className="w-4 h-4" />,
        };
        return {
            ...type,
            icon: iconMap[type.value] || <Home className="w-4 h-4" />
        };
    };
    
    // Add icons to available property types
    const propertyTypes = availablePropertyTypes.map(type => getPropertyTypeWithIcon(type));
    
    // Get current property type config
    const currentPropertyType = propertyTypes.find(t => t.value === searchData.propertySubType) || 
                              propertyTypes.find(t => t.value === 'Condo Apartment') || 
                              propertyTypes[0] || 
                              { value: '', label: 'All Types', icon: <Search className="w-4 h-4" /> };

    // Fetch available property types on mount and when location/status changes
    useEffect(() => {
        const fetchPropertyTypes = async () => {
            setLoadingPropertyTypes(true);
            try {
                const response = await fetch('/api/property-types', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                    },
                    body: JSON.stringify({
                        filters: {
                            query: searchData.location,
                            status: searchData.propertyType
                        }
                    })
                });
                
                const result = await response.json();
                if (result.success && result.data?.propertyTypes) {
                    setAvailablePropertyTypes(result.data.propertyTypes);
                    
                    // Check if current selection is still available
                    const currentTypeStillAvailable = result.data.propertyTypes.some(
                        type => type.value === searchData.propertySubType
                    );
                    
                    // If current type is not available, reset to first available type
                    if (!currentTypeStillAvailable && result.data.propertyTypes.length > 0) {
                        // Default to Condo Apartment if available, otherwise first type
                        const condoType = result.data.propertyTypes.find(t => t.value === 'Condo Apartment');
                        const defaultType = condoType || result.data.propertyTypes[0];
                        setSearchData(prev => ({ ...prev, propertySubType: defaultType.value }));
                    }
                } else {
                    // Use default types on error
                    setAvailablePropertyTypes([
                        { value: '', label: 'All Types', count: 0 },
                        { value: 'Condo Apartment', label: 'Condo Apartment', count: 0 }
                    ]);
                }
            } catch (error) {
                console.error('Error fetching property types:', error);
                // Use default types on error
                setAvailablePropertyTypes([
                    { value: '', label: 'All Types', count: 0 },
                    { value: 'Condo Apartment', label: 'Condo Apartment', count: 0 }
                ]);
            } finally {
                setLoadingPropertyTypes(false);
            }
        };
        
        fetchPropertyTypes();
    }, [searchData.location, searchData.propertyType]); // Re-fetch when location or status changes
    
    // Handle clicking outside dropdowns and popups
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowSearchTypeDropdown(false);
            }
            if (pricePopupRef.current && !pricePopupRef.current.contains(event.target)) {
                setShowPricePopup(false);
            }
            if (propertyTypeRef.current && !propertyTypeRef.current.contains(event.target)) {
                setShowPropertyTypeDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Load Google Maps script if needed
    useEffect(() => {
        const loadGoogleMapsScript = () => {
            // Check if API key exists
            if (!window.googleMapsApiKey || window.googleMapsApiKey === '') {
                console.error('Google Maps API key is not configured. Please add GOOGLE_MAPS_API_KEY to your .env file');
                return;
            }

            // Check if script is already loaded or loading
            const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
            
            if (window.google && window.google.maps && window.google.maps.places) {
                // Already loaded
                console.log('Google Maps already loaded');
                return;
            }
            
            if (existingScript) {
                // Script exists but may still be loading
                console.log('Google Maps script found, waiting for load...');
                return;
            }
            
            // Create and load the script
            console.log('Loading Google Maps script for autocomplete...');
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${window.googleMapsApiKey}&libraries=places`;
            script.async = true;
            script.defer = true;
            
            script.onload = () => {
                console.log('Google Maps script loaded successfully');
            };
            
            script.onerror = () => {
                console.error('Failed to load Google Maps script. Please check your API key and ensure it has Places API enabled.');
            };
            
            document.head.appendChild(script);
        };

        loadGoogleMapsScript();
    }, []);

    // Initialize or destroy autocomplete based on search type
    useEffect(() => {
        // Clean up previous autocomplete
        if (autocompleteRef.current && window.google && window.google.maps && window.google.maps.event) {
            window.google.maps.event.clearInstanceListeners(locationInputRef.current);
            autocompleteRef.current = null;
        }

        // Initialize autocomplete for both 'street' and 'global' search types
        if (searchType === 'street' || searchType === 'global') {
            // Wait a bit for Google Maps to load if needed
            const tryInit = () => {
                if (window.google && window.google.maps && window.google.maps.places) {
                    initStreetAutocomplete();
                } else {
                    setTimeout(tryInit, 500);
                }
            };
            tryInit();
        }
    }, [searchType]);

    const initStreetAutocomplete = () => {
        if (!locationInputRef.current) return;

        // Check if Google Maps is available
        if (!window.google || !window.google.maps || !window.google.maps.places) {
            console.log('Google Maps not available for autocomplete');
            return;
        }

        console.log(`🟢 Initializing autocomplete for ${searchType} search type`);

        try {
            // Configure autocomplete based on search type
            const autocompleteOptions = {
                componentRestrictions: { country: 'ca' },
                fields: ['formatted_address', 'address_components', 'place_id'],
                // Bounds for Ontario (roughly)
                bounds: new window.google.maps.LatLngBounds(
                    new window.google.maps.LatLng(41.676, -95.156), // Southwest Ontario
                    new window.google.maps.LatLng(56.859, -74.358)  // Northeast Ontario
                ),
                strictBounds: false // Allow some flexibility but prefer Ontario
            };

            // Set types based on search type
            if (searchType === 'street') {
                autocompleteOptions.types = ['address']; // Only street addresses
            } else if (searchType === 'global') {
                // For global search, allow addresses, cities, and regions
                autocompleteOptions.types = ['geocode']; // This includes addresses, cities, neighborhoods, etc.
            }

            autocompleteRef.current = new window.google.maps.places.Autocomplete(
                locationInputRef.current,
                autocompleteOptions
            );

            // Handle place selection
            autocompleteRef.current.addListener('place_changed', () => {
                const place = autocompleteRef.current.getPlace();
                console.log('Place selected:', place);

                if (place) {
                    let displayValue = '';

                    if (searchType === 'street') {
                        // For street search, extract only street address
                        if (place.address_components) {
                            const streetNumber = place.address_components.find(comp =>
                                comp.types.includes('street_number'));
                            const streetName = place.address_components.find(comp =>
                                comp.types.includes('route'));

                            if (streetNumber && streetName) {
                                // Format as "123 Main Street"
                                displayValue = `${streetNumber.long_name} ${streetName.long_name}`;
                            } else if (streetName) {
                                // Just street name if no number
                                displayValue = streetName.long_name;
                            } else if (place.formatted_address) {
                                // Fallback: extract just the street part (before first comma)
                                const addressParts = place.formatted_address.split(',');
                                displayValue = addressParts[0].trim();
                            }
                        }
                    } else if (searchType === 'global') {
                        // For global search, use the full formatted address or name
                        if (place.formatted_address) {
                            // Remove country from the end if present
                            displayValue = place.formatted_address.replace(/, Canada$/, '');
                        } else if (place.name) {
                            displayValue = place.name;
                        }
                    }

                    // Fallback to any available value
                    if (!displayValue) {
                        displayValue = place.name || place.formatted_address || '';
                    }

                    console.log('Setting formatted value:', displayValue);
                    setSearchData(prev => ({
                        ...prev,
                        location: displayValue
                    }));
                }
            });

            console.log('✅ Street autocomplete initialized successfully');
            
            // Add custom styling to ensure autocomplete dropdown is visible
            const pacContainer = document.querySelector('.pac-container');
            if (pacContainer) {
                pacContainer.style.zIndex = '9999';
            }
        } catch (error) {
            console.error('Error initializing autocomplete:', error);
        }
    };

    const handleSearchTypeChange = (type) => {
        setSearchType(type);
        setShowSearchTypeDropdown(false);
        // Clear the search input when changing type
        setSearchData(prev => ({ ...prev, location: '' }));
    };

    const handleSearch = () => {
        if (onSearch) {
            // If parent provided onSearch callback, use it
            onSearch({ ...searchData, searchType });
        } else {
            // Default behavior - navigate to search page with params
            const params = new URLSearchParams();

            if (searchData.location) {
                params.append('location', searchData.location);
                params.append('search_type', searchType);
            }
            if (searchData.propertyType) params.append('property_type', searchData.propertyType);
            if (searchData.propertySubType) params.append('property_sub_type', searchData.propertySubType);
            if (searchData.bedrooms && searchData.bedrooms !== '0') params.append('bedrooms', searchData.bedrooms);
            if (searchData.bathrooms && searchData.bathrooms !== '0') params.append('bathrooms', searchData.bathrooms);
            if (searchData.minPrice > 0) params.append('min_price', searchData.minPrice);
            if (searchData.maxPrice < 10000000) params.append('max_price', searchData.maxPrice);

            router.get('/search?' + params.toString());
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const formatPrice = (price) => {
        if (price >= 1000000) {
            return `$${(price / 1000000).toFixed(1)}M`;
        } else if (price >= 1000) {
            return `$${(price / 1000).toFixed(0)}K`;
        }
        return `$${price}`;
    };

    return (
        <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-300">
            <div className="flex flex-col space-y-4">
                {/* Main Search Row */}
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search Type Selector and Input */}
                    <div className="flex-1 flex">
                        {/* Search Type Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setShowSearchTypeDropdown(!showSearchTypeDropdown)}
                                className="px-4 py-3 bg-white border border-r-0 border-gray-300 rounded-l-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
                            >
                                {currentSearchType.icon}
                                <span className="hidden sm:inline font-medium">{currentSearchType.label}</span>
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            {/* Dropdown Menu */}
                            {showSearchTypeDropdown && (
                                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                    {searchTypes.map(type => (
                                        <button
                                            key={type.value}
                                            onClick={() => handleSearchTypeChange(type.value)}
                                            className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 ${
                                                searchType === type.value ? 'bg-blue-50 text-blue-600' : ''
                                            } ${type.value === searchTypes[0].value ? 'rounded-t-lg' : ''} ${
                                                type.value === searchTypes[searchTypes.length - 1].value ? 'rounded-b-lg' : ''
                                            }`}
                                        >
                                            {type.icon}
                                            <span>{type.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Location Input */}
                        <input
                            ref={locationInputRef}
                            type="text"
                            placeholder={currentSearchType.placeholder}
                            className="flex-1 px-4 py-3 bg-white border border-l-0 border-gray-300 rounded-r-xl focus:ring-2 focus:ring-[#912018] focus:border-transparent transition-all"
                            value={searchData.location}
                            onChange={(e) => setSearchData({ ...searchData, location: e.target.value })}
                            onKeyPress={handleKeyPress}
                            data-search-type={searchType}
                        />
                    </div>

                    {/* Property Type */}
                    <div className="relative">
                        <select
                            className="appearance-none w-full lg:w-40 px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#912018] focus:border-transparent transition-all cursor-pointer"
                            value={searchData.propertyType}
                            onChange={(e) => setSearchData({ ...searchData, propertyType: e.target.value })}
                        >
                            <option value="For Sale">For Sale</option>
                            <option value="For Rent">For Rent</option>
                            <option value="Sold">Sold</option>
                            <option value="Leased">Leased</option>
                        </select>
                    </div>

                    {/* Toggle Filters Button (Mobile) */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="lg:hidden px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-medium hover:bg-blue-100 transition-colors"
                    >
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>

                    {/* Search Button (Desktop) */}
                    <button
                        onClick={handleSearch}
                        className="hidden lg:flex items-center justify-center px-6 py-3 bg-[#912018] text-white rounded-xl hover:bg-[#7a1815] transition-all shadow-md hover:shadow-lg group"
                    >
                        <Search className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold">Search</span>
                    </button>
                </div>

                {/* Filters Row - Always visible */}
                <div className="flex flex-col lg:flex-row gap-4 pt-4 border-t border-gray-300">
                    {/* Property Type - Custom Dropdown with Icon */}
                    <div className="relative mb-3 lg:mb-0" ref={propertyTypeRef}>
                        <button
                            type="button"
                            onClick={() => setShowPropertyTypeDropdown(!showPropertyTypeDropdown)}
                            disabled={loadingPropertyTypes}
                            className="min-w-[180px] px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all cursor-pointer flex items-center gap-2 focus:ring-2 focus:ring-[#912018] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loadingPropertyTypes ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-gray-300 border-t-[#912018] rounded-full animate-spin"></div>
                                    <span className="flex-1 text-left">Loading...</span>
                                </>
                            ) : (
                                <>
                                    {currentPropertyType.icon}
                                    <span className="flex-1 text-left">
                                        {currentPropertyType.label}
                                    </span>
                                </>
                            )}
                            <ChevronDown className="w-4 h-4" />
                        </button>
                        
                        {showPropertyTypeDropdown && (
                            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                                {propertyTypes.map((type, index) => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => {
                                            setSearchData({ ...searchData, propertySubType: type.value });
                                            setShowPropertyTypeDropdown(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 ${
                                            searchData.propertySubType === type.value ? 'bg-blue-50 text-blue-600' : ''
                                        } ${index === 0 ? 'rounded-t-lg' : ''} ${
                                            index === propertyTypes.length - 1 ? 'rounded-b-lg' : ''
                                        }`}
                                    >
                                        {type.icon}
                                        <span className="flex-1">
                                            {type.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Bedrooms */}
                    <div className="mb-3 lg:mb-0">
                        <select
                            className="appearance-none min-w-[140px] px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#912018] focus:border-transparent transition-all cursor-pointer"
                            value={searchData.bedrooms}
                            onChange={(e) => setSearchData({ ...searchData, bedrooms: e.target.value })}
                        >
                            <option value="0">Any Beds</option>
                            <option value="1">1+ Bed</option>
                            <option value="2">2+ Beds</option>
                            <option value="3">3+ Beds</option>
                            <option value="4">4+ Beds</option>
                            <option value="5">5+ Beds</option>
                        </select>
                    </div>

                    {/* Bathrooms */}
                    <div className="mb-3 lg:mb-0">
                        <select
                            className="appearance-none min-w-[140px] px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#912018] focus:border-transparent transition-all cursor-pointer"
                            value={searchData.bathrooms}
                            onChange={(e) => setSearchData({ ...searchData, bathrooms: e.target.value })}
                        >
                            <option value="0">Any Baths</option>
                            <option value="1">1+ Bath</option>
                            <option value="2">2+ Baths</option>
                            <option value="3">3+ Baths</option>
                            <option value="4">4+ Baths</option>
                        </select>
                    </div>

                    {/* Price Range Button */}
                    <div className="relative" ref={pricePopupRef}>
                        <button
                            type="button"
                            onClick={() => setShowPricePopup(!showPricePopup)}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all cursor-pointer min-w-[200px] text-left"
                        >
                            <span className="text-sm font-medium">
                                {searchData.minPrice === 0 && searchData.maxPrice === 10000000
                                    ? 'Any Price'
                                    : `${formatPrice(searchData.minPrice)} - ${formatPrice(searchData.maxPrice)}`}
                            </span>
                        </button>

                        {/* Price Popup */}
                        {showPricePopup && (
                            <div className="absolute top-full mt-2 left-0 min-w-[420px] bg-white border border-gray-300 rounded-lg shadow-xl z-50 p-5">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="number"
                                            placeholder="Min Price"
                                            className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#912018] focus:border-transparent transition-all"
                                            value={searchData.minPrice}
                                            onChange={(e) => setSearchData({ ...searchData, minPrice: parseInt(e.target.value) || 0 })}
                                        />
                                        <span className="text-gray-500">-</span>
                                        <input
                                            type="number"
                                            placeholder="Max Price"
                                            className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#912018] focus:border-transparent transition-all"
                                            value={searchData.maxPrice}
                                            onChange={(e) => setSearchData({ ...searchData, maxPrice: parseInt(e.target.value) || 10000000 })}
                                        />
                                    </div>
                                    
                                    {/* Price Range Slider */}
                                    <div className="relative pt-1">
                                        <div className="flex justify-between text-xs text-gray-600 mb-2">
                                            <span>{formatPrice(searchData.minPrice)}</span>
                                            <span>{formatPrice(searchData.maxPrice)}</span>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="range"
                                                min="0"
                                                max="10000000"
                                                step="50000"
                                                value={searchData.minPrice}
                                                onChange={(e) => {
                                                    const value = parseInt(e.target.value);
                                                    if (value < searchData.maxPrice) {
                                                        setSearchData({ ...searchData, minPrice: value });
                                                    }
                                                }}
                                                className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer z-20"
                                                style={{ background: 'transparent' }}
                                            />
                                            <input
                                                type="range"
                                                min="0"
                                                max="10000000"
                                                step="50000"
                                                value={searchData.maxPrice}
                                                onChange={(e) => {
                                                    const value = parseInt(e.target.value);
                                                    if (value > searchData.minPrice) {
                                                        setSearchData({ ...searchData, maxPrice: value });
                                                    }
                                                }}
                                                className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer z-20"
                                                style={{ background: 'transparent' }}
                                            />
                                            <div className="relative h-2 bg-gray-200 rounded-full">
                                                <div
                                                    className="absolute h-2 bg-[#912018] rounded-full"
                                                    style={{
                                                        left: `${(searchData.minPrice / 10000000) * 100}%`,
                                                        right: `${100 - (searchData.maxPrice / 10000000) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Save Search Button */}
                    <button className="flex items-center justify-center px-4 py-2 bg-[#912018] text-white rounded-lg hover:bg-[#7a1815] transition-colors">
                        Save Search
                    </button>

                    {/* Mobile Search Button */}
                    <button
                        onClick={handleSearch}
                        className="lg:hidden flex items-center justify-center px-6 py-3 bg-[#912018] text-white rounded-xl hover:bg-[#7a1815] transition-all shadow-md hover:shadow-lg"
                    >
                        <Search className="h-5 w-5 mr-2" />
                        <span className="font-semibold">Search Properties</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IDXAmpreSearchBar;