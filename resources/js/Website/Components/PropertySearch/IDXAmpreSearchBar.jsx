import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import LoginModal from '@/Website/Global/Components/LoginModal';

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

const IDXAmpreSearchBar = ({ initialValues = {}, onSearch, onSaveSearch, isAuthenticated = false }) => {
    const [searchData, setSearchData] = useState({
        location: initialValues.location || '',
        propertyType: initialValues.propertyType || 'For Sale',
        propertyStatus: initialValues.propertyStatus || '',
        propertySubType: initialValues.propertySubType || 'Condo Apartment',
        bedrooms: initialValues.bedrooms || '0',
        bathrooms: initialValues.bathrooms || '0',
        minPrice: initialValues.minPrice || 0,
        maxPrice: initialValues.maxPrice || 10000000,
    });

    // Determine initial search type based on initialValues
    const getInitialSearchType = () => {
        // If search_type is provided in initialValues, use it
        if (initialValues.searchType) {
            return initialValues.searchType;
        }
        // Otherwise, default to global for better flexibility
        return 'global';
    };

    const [searchType, setSearchType] = useState(getInitialSearchType()); // street, city, postal, global
    const [showSearchTypeDropdown, setShowSearchTypeDropdown] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [showPriceSlider, setShowPriceSlider] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false); // State for login modal
    const locationInputRef = useRef(null);
    const autocompleteRef = useRef(null);
    const dropdownRef = useRef(null);
    const priceSliderRef = useRef(null);

    // Update searchData when initialValues.location changes
    useEffect(() => {
        if (initialValues.location !== undefined) {
            setSearchData(prev => ({
                ...prev,
                location: initialValues.location || ''
            }));
        }
    }, [initialValues.location]);

    // Search type options
    const searchTypes = [
        { value: 'street', label: 'Street Address', placeholder: 'Enter street address...', icon: <Home className="w-4 h-4" /> },
        { value: 'city', label: 'City', placeholder: 'Enter city name...', icon: <MapPin className="w-4 h-4" /> },
        { value: 'postal', label: 'Postal Code', placeholder: 'Enter postal code...', icon: <MapPin className="w-4 h-4" /> },
        { value: 'global', label: 'All', placeholder: 'Search by address, city, or postal code...', icon: <Search className="w-4 h-4" /> },
    ];

    // Get current search type config
    const currentSearchType = searchTypes.find(t => t.value === searchType) || searchTypes[0];

    // Handle clicking outside dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowSearchTypeDropdown(false);
            }
            if (priceSliderRef.current && !priceSliderRef.current.contains(event.target)) {
                setShowPriceSlider(false);
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

        // Initialize autocomplete for all search types except global
        if (searchType !== 'global') {
            // Wait a bit for Google Maps to load if needed
            const tryInit = () => {
                if (window.google && window.google.maps && window.google.maps.places) {
                    initAutocomplete();
                } else {
                    setTimeout(tryInit, 500);
                }
            };
            tryInit();
        }
    }, [searchType]);

    const initAutocomplete = () => {
        if (!locationInputRef.current) return;

        // Check if Google Maps is available
        if (!window.google || !window.google.maps || !window.google.maps.places) {
            console.log('Google Maps not available for autocomplete');
            return;
        }

        console.log(`🟢 Initializing ${searchType} autocomplete (IDX AMPRE style)`);

        try {
            let autocompleteConfig = {
                componentRestrictions: { country: 'ca' },
                fields: ['formatted_address', 'address_components', 'place_id', 'name'],
                bounds: new window.google.maps.LatLngBounds(
                    new window.google.maps.LatLng(41.676, -95.156), // Southwest Ontario
                    new window.google.maps.LatLng(56.859, -74.358)  // Northeast Ontario
                ),
                strictBounds: false
            };

            // Configure autocomplete based on search type
            switch (searchType) {
                case 'street':
                    autocompleteConfig.types = ['address'];
                    break;
                case 'city':
                    autocompleteConfig.types = ['(cities)'];
                    break;
                case 'postal':
                    autocompleteConfig.types = ['postal_code'];
                    break;
                default:
                    autocompleteConfig.types = ['geocode'];
            }

            // Create autocomplete instance
            autocompleteRef.current = new window.google.maps.places.Autocomplete(
                locationInputRef.current,
                autocompleteConfig
            );

            // Handle place selection
            autocompleteRef.current.addListener('place_changed', () => {
                const place = autocompleteRef.current.getPlace();
                console.log('Place selected:', place);

                if (place && place.address_components) {
                    let displayValue = '';

                    if (searchType === 'street') {
                        // Extract street number and street name only
                        const streetNumber = place.address_components.find(comp =>
                            comp.types.includes('street_number'));
                        const streetName = place.address_components.find(comp =>
                            comp.types.includes('route'));

                        if (streetNumber && streetName) {
                            displayValue = `${streetNumber.long_name} ${streetName.long_name}`;
                        } else if (streetName) {
                            displayValue = streetName.long_name;
                        } else if (place.formatted_address) {
                            const addressParts = place.formatted_address.split(',');
                            displayValue = addressParts[0].trim();
                        } else {
                            displayValue = place.name || '';
                        }
                    } else if (searchType === 'city') {
                        // Extract city name
                        const city = place.address_components.find(comp =>
                            comp.types.includes('locality') || comp.types.includes('administrative_area_level_1'));
                        displayValue = city ? city.long_name : (place.name || place.formatted_address);
                    } else if (searchType === 'postal') {
                        // Extract postal code
                        const postal = place.address_components.find(comp =>
                            comp.types.includes('postal_code'));
                        displayValue = postal ? postal.long_name : (place.name || place.formatted_address);
                    } else {
                        displayValue = place.formatted_address || place.name || '';
                    }

                    console.log('Setting formatted value:', displayValue);
                    setSearchData(prev => ({
                        ...prev,
                        location: displayValue
                    }));

                    // Hide autocomplete dropdown after selection
                    const pacContainer = document.querySelector('.pac-container');
                    if (pacContainer) {
                        pacContainer.style.display = 'none';
                    }
                    
                    // Remove focus from input to ensure dropdown stays hidden
                    setTimeout(() => {
                        if (locationInputRef.current) {
                            locationInputRef.current.blur();
                        }
                    }, 100);
                }
            });

            console.log('✅ Autocomplete initialized successfully');
            
            // Add custom styling to ensure autocomplete dropdown is visible
            const pacContainer = document.querySelector('.pac-container');
            if (pacContainer) {
                pacContainer.style.zIndex = '9999';
                pacContainer.style.borderRadius = '8px';
                pacContainer.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
                pacContainer.style.border = '1px solid #e5e7eb';
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
            
            // When Sold or Leased is selected, it takes precedence
            if (searchData.propertyStatus) {
                params.append('property_status', searchData.propertyStatus);
                // Don't include property_type when searching for Sold/Leased
            } else if (searchData.propertyType) {
                // Only include property_type when no status is selected
                params.append('property_type', searchData.propertyType);
            }
            
            if (searchData.propertySubType && searchData.propertySubType !== 'All') params.append('property_sub_type', searchData.propertySubType);
            if (searchData.bedrooms && searchData.bedrooms !== '0') params.append('bedrooms', searchData.bedrooms);
            if (searchData.bathrooms && searchData.bathrooms !== '0') params.append('bathrooms', searchData.bathrooms);
            if (searchData.minPrice > 0) params.append('min_price', searchData.minPrice);
            if (searchData.maxPrice < 10000000) params.append('max_price', searchData.maxPrice);

            router.get('/search?' + params.toString());
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            // Hide autocomplete dropdown
            const pacContainer = document.querySelector('.pac-container');
            if (pacContainer) {
                pacContainer.style.display = 'none';
            }
            
            // Prevent form submission if inside a form
            e.preventDefault();
            
            // Execute search
            handleSearch();
        } else if (e.key === 'Escape') {
            // Hide autocomplete dropdown on Escape key
            const pacContainer = document.querySelector('.pac-container');
            if (pacContainer) {
                pacContainer.style.display = 'none';
            }
            
            // Also blur the input
            if (locationInputRef.current) {
                locationInputRef.current.blur();
            }
        }
    };

    const formatPrice = (price) => {
        if (price >= 1000000) {
            return `${(price / 1000000).toFixed(1)}M`;
        } else if (price >= 1000) {
            return `${(price / 1000).toFixed(0)}K`;
        }
        return `${price}`;
    };

    return (
        <>
            <div className="bg-gradient-to-r from-white to-gray-50 shadow-xl rounded-2xl p-6 border-2 border-gray-300">
            <div className="flex flex-col space-y-6">
                {/* Main Search Row */}
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search Type Selector and Input */}
                    <div className="flex-1 flex shadow-sm">
                        {/* Search Type Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setShowSearchTypeDropdown(!showSearchTypeDropdown)}
                                className="px-4 py-3.5 bg-white border-2 border-r-0 border-gray-300 rounded-l-xl hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 shadow-sm focus:border-[#912018] focus:ring-2 focus:ring-[#912018] focus:ring-opacity-20"
                            >
                                {currentSearchType.icon}
                                <span className="hidden sm:inline font-medium text-gray-700">{currentSearchType.label}</span>
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                            </button>

                            {/* Dropdown Menu */}
                            {showSearchTypeDropdown && (
                                <div className="absolute top-full left-0 mt-2 w-56 bg-gray-100 border-2 border-gray-300 rounded-xl shadow-2xl z-50 overflow-hidden">
                                    {searchTypes.map((type, index) => (
                                        <button
                                            key={type.value}
                                            onClick={() => handleSearchTypeChange(type.value)}
                                            className={`w-full px-4 py-1 text-left hover:bg-gray-50 flex items-center gap-3 transition-all duration-150 ${
                                                searchType === type.value ? 'text-white font-medium' : 'text-gray-700'
                                            } ${index === 0 ? 'rounded-t-xl' : ''} ${
                                                index === searchTypes.length - 1 ? 'rounded-b-xl' : ''
                                            }`}
                                            style={{
                                                backgroundColor: searchType === type.value ? '#912018' : 'transparent'
                                            }}
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
                            className="flex-1 px-4 py-3.5 bg-white border-2 border-l-0 border-gray-300 rounded-r-xl focus:ring-2 focus:ring-[#912018] focus:ring-opacity-20 focus:border-[#912018] transition-all duration-200 text-gray-900 placeholder-gray-500"
                            value={searchData.location}
                            onChange={(e) => {
                                setSearchData({ ...searchData, location: e.target.value });
                                // Show autocomplete dropdown on typing
                                const pacContainer = document.querySelector('.pac-container');
                                if (pacContainer && e.target.value.length > 0) {
                                    pacContainer.style.display = 'block';
                                }
                            }}
                            onFocus={() => {
                                // Show autocomplete dropdown on focus if there's text
                                if (searchData.location) {
                                    const pacContainer = document.querySelector('.pac-container');
                                    if (pacContainer) {
                                        pacContainer.style.display = 'block';
                                    }
                                }
                            }}
                            onKeyPress={handleKeyPress}
                            data-search-type={searchType}
                        />
                    </div>

                    {/* Transaction Type */}
                    <div className="relative">
                        <select
                            className={`idx-ampre-search-bar appearance-none w-full lg:w-48 pl-4 pr-10 py-3.5 bg-gradient-to-b ${searchData.propertyStatus ? 'from-gray-100 to-gray-200 cursor-not-allowed opacity-60' : 'from-white to-gray-50'} border-2 border-gray-300 rounded-xl ${searchData.propertyStatus ? '' : 'hover:border-gray-400'} transition-all cursor-pointer text-gray-900 shadow-sm font-medium text-sm`}
                            value={searchData.propertyType}
                            onChange={(e) => setSearchData({ ...searchData, propertyType: e.target.value })}
                            disabled={!!searchData.propertyStatus}
                            title={searchData.propertyStatus ? 'Transaction type is disabled when status filter is active' : ''}
                        >
                            <option value="For Sale">For Sale</option>
                            <option value="For Rent">For Rent</option>
                        </select>
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <ChevronDown className={`w-5 h-5 ${searchData.propertyStatus ? 'text-gray-400' : 'text-[#912018]'}`} />
                        </div>
                    </div>

                    {/* Property Status (Sold/Leased) - Available for all users */}
                    <div className="relative">
                        <select
                            className={`idx-ampre-search-bar appearance-none w-full lg:w-48 pl-4 pr-10 py-3.5 bg-gradient-to-b ${searchData.propertyStatus ? 'from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-200' : 'from-white to-gray-50'} border-2 border-gray-300 rounded-xl hover:border-gray-400 transition-all cursor-pointer text-gray-900 shadow-sm font-medium text-sm`}
                            value={searchData.propertyStatus}
                            onChange={(e) => {
                                const newStatus = e.target.value;

                                // Check if non-authenticated user is trying to access Sold/Leased
                                if (!isAuthenticated && (newStatus === 'Sold' || newStatus === 'Leased')) {
                                    // Show login modal
                                    setShowLoginModal(true);
                                    // Reset the select value to empty
                                    e.target.value = '';
                                    return;
                                }

                                // Allow authenticated users or Active Listings selection
                                setSearchData({
                                    ...searchData,
                                    propertyStatus: newStatus,
                                    // Reset property type to default when selecting a status
                                    propertyType: newStatus ? 'For Sale' : searchData.propertyType
                                });
                            }}
                        >
                            <option value="">Active Listings</option>
                            <option value="Sold">Sold</option>
                            <option value="Leased">Leased</option>
                        </select>
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <ChevronDown className="w-5 h-5 text-[#912018]" />
                        </div>
                    </div>

                    {/* Toggle Filters Button (Mobile) */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="lg:hidden px-6 py-3.5 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                        style={{ backgroundColor: '#912018' }}
                    >
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>

                    {/* Search Button (Desktop) */}
                    <button
                        onClick={handleSearch}
                        className="hidden lg:flex items-center justify-center px-8 py-3.5 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 group"
                        style={{ backgroundColor: '#912018' }}
                    >
                        <Search className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                        <span>Search Properties</span>
                    </button>
                </div>

                {/* Filters Row - Desktop Always Visible, Mobile Toggleable */}
                <div className={`${showFilters ? 'block' : 'hidden'} lg:flex lg:flex-row lg:justify-between lg:items-end flex-col gap-6 pt-6 border-t border-gray-200`}>
                    <div className="flex flex-wrap gap-6">
                    {/* Property Sub-Type */}
                    <div className="mb-4 lg:mb-0">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                        <div className="relative">
                            <select
                                className={`idx-ampre-search-bar appearance-none min-w-[180px] pl-4 pr-10 py-3.5 bg-gradient-to-b ${searchData.propertySubType !== 'Condo Apartment' ? 'from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-200' : 'from-white to-gray-50'} border-2 border-gray-300 rounded-xl hover:border-gray-400 transition-all cursor-pointer text-gray-900 shadow-sm font-medium text-sm`}
                                value={searchData.propertySubType}
                                onChange={(e) => setSearchData({ ...searchData, propertySubType: e.target.value })}
                            >
                                <option value="All">All Types</option>
                                <option value="Condo Apartment">Condo Apartment</option>
                                <option value="Condo Townhouse">Condo Townhouse</option>
                                <option value="Townhouse">Townhouse</option>
                                <option value="Detached">Detached</option>
                                <option value="Semi-Detached">Semi-Detached</option>
                                <option value="Vacant Land">Vacant Land</option>
                            </select>
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none bg-white rounded-md px-1">
                                <ChevronDown className="w-5 h-5 text-[#912018]" />
                            </div>
                        </div>
                    </div>

                    {/* Bedrooms */}
                    <div className="mb-4 lg:mb-0">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                        <div className="relative">
                            <select
                                className={`idx-ampre-search-bar appearance-none min-w-[160px] pl-4 pr-10 py-3.5 bg-gradient-to-b ${searchData.bedrooms !== '0' ? 'from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-200' : 'from-white to-gray-50'} border-2 border-gray-300 rounded-xl hover:border-gray-400 transition-all cursor-pointer text-gray-900 shadow-sm font-medium text-sm`}
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
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none bg-white rounded-md px-1">
                                <ChevronDown className="w-5 h-5 text-[#912018]" />
                            </div>
                        </div>
                    </div>

                    {/* Bathrooms */}
                    <div className="mb-4 lg:mb-0">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                        <div className="relative">
                            <select
                                className={`idx-ampre-search-bar appearance-none min-w-[160px] pl-4 pr-10 py-3.5 bg-gradient-to-b ${searchData.bathrooms !== '0' ? 'from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-200' : 'from-white to-gray-50'} border-2 border-gray-300 rounded-xl hover:border-gray-400 transition-all cursor-pointer text-gray-900 shadow-sm font-medium text-sm`}
                                value={searchData.bathrooms}
                                onChange={(e) => setSearchData({ ...searchData, bathrooms: e.target.value })}
                            >
                                <option value="0">Any Baths</option>
                                <option value="1">1+ Bath</option>
                                <option value="2">2+ Baths</option>
                                <option value="3">3+ Baths</option>
                                <option value="4">4+ Baths</option>
                            </select>
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none bg-white rounded-md px-1">
                                <ChevronDown className="w-5 h-5 text-[#912018]" />
                            </div>
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="mb-4 lg:mb-0 relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowPriceSlider(!showPriceSlider);
                            }}
                            className={`min-w-[220px] pl-4 pr-10 py-3.5 bg-gradient-to-b ${(searchData.minPrice > 0 || searchData.maxPrice < 10000000) ? 'from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-200' : 'from-white to-gray-50'} border-2 border-gray-300 rounded-xl hover:border-gray-400 focus:border-[#912018] focus:ring-2 focus:ring-[#912018] focus:ring-opacity-20 transition-all text-left text-gray-900 shadow-sm font-medium text-sm relative`}
                        >
                            {searchData.minPrice > 0 || searchData.maxPrice < 10000000 
                                ? `${formatPrice(searchData.minPrice)} - ${formatPrice(searchData.maxPrice)}`
                                : 'Select price range...'
                            }
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <ChevronDown className={`w-5 h-5 text-[#912018] transition-transform ${showPriceSlider ? 'rotate-180' : ''}`} />
                            </div>
                        </button>

                        {/* Price Range Slider */}
                        {showPriceSlider && (
                            <div className="absolute top-full left-0 mt-2 p-4 bg-gray-100 border-2 border-gray-300 rounded-lg shadow-xl z-40" style={{ width: '450px' }} ref={priceSliderRef}>
                                <div className="space-y-4">
                                    {/* Manual Price Inputs */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Min Price</label>
                                            <input
                                                type="number"
                                                placeholder="Min Price"
                                                className="w-full px-3 py-2 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all text-sm"
                                                style={{ 
                                                    focusRingColor: '#912018',
                                                    borderColor: '#912018'
                                                }}
                                                value={searchData.minPrice || ''}
                                                onChange={(e) => setSearchData({ ...searchData, minPrice: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Max Price</label>
                                            <input
                                                type="number"
                                                placeholder="Max Price"
                                                className="w-full px-3 py-2 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all text-sm"
                                                style={{ 
                                                    focusRingColor: '#912018',
                                                    borderColor: '#912018'
                                                }}
                                                value={searchData.maxPrice === 10000000 ? '' : searchData.maxPrice}
                                                onChange={(e) => setSearchData({ ...searchData, maxPrice: parseInt(e.target.value) || 10000000 })}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>{formatPrice(searchData.minPrice)}</span>
                                        <span>{formatPrice(searchData.maxPrice)}</span>
                                    </div>
                                    
                                    {/* Dual Range Slider */}
                                    <div className="relative h-2 bg-gray-200 rounded-full">
                                        <div 
                                            className="absolute h-2 rounded-full"
                                            style={{ 
                                                backgroundColor: '#912018',
                                                left: `${(searchData.minPrice / 10000000) * 100}%`,
                                                right: `${100 - (searchData.maxPrice / 10000000) * 100}%`
                                            }}
                                        />
                                        <input
                                            type="range"
                                            min="0"
                                            max="10000000"
                                            step="50000"
                                            value={searchData.minPrice}
                                            onChange={(e) => setSearchData({ ...searchData, minPrice: Math.min(parseInt(e.target.value), searchData.maxPrice - 50000) })}
                                            className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
                                        />
                                        <input
                                            type="range"
                                            min="0"
                                            max="10000000"
                                            step="50000"
                                            value={searchData.maxPrice}
                                            onChange={(e) => setSearchData({ ...searchData, maxPrice: Math.max(parseInt(e.target.value), searchData.minPrice + 50000) })}
                                            className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
                                        />
                                    </div>

                                    {/* Quick Price Options */}
                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                        <button
                                            onClick={() => setSearchData({ ...searchData, minPrice: 0, maxPrice: 500000 })}
                                            className="px-3 py-2 bg-white hover:bg-gray-50 rounded-md transition-colors border-2 border-gray-300"
                                        >
                                            Under $500K
                                        </button>
                                        <button
                                            onClick={() => setSearchData({ ...searchData, minPrice: 500000, maxPrice: 1000000 })}
                                            className="px-3 py-2 bg-white hover:bg-gray-50 rounded-md transition-colors border-2 border-gray-300"
                                        >
                                            $500K - $1M
                                        </button>
                                        <button
                                            onClick={() => setSearchData({ ...searchData, minPrice: 1000000, maxPrice: 10000000 })}
                                            className="px-3 py-2 bg-white hover:bg-gray-50 rounded-md transition-colors border-2 border-gray-300"
                                        >
                                            Over $1M
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    </div>

                    {/* Save Search Button - Aligned to the right */}
                    <div className="flex items-end">
                        <button 
                            onClick={() => {
                                if (onSaveSearch) {
                                    onSaveSearch({ ...searchData, searchType });
                                } else {
                                    // Default save search handler
                                    console.log('Save search:', { ...searchData, searchType });
                                    alert('Save search functionality not connected. Please implement onSaveSearch prop.');
                                }
                            }}
                            className="flex items-center justify-center px-6 py-3 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 font-medium shadow-sm h-fit"
                            style={{ backgroundColor: '#912018' }}
                        >
                            Save Search
                        </button>
                    </div>
                </div>

                {/* Mobile Search Button */}
                <div className={`${showFilters ? 'flex' : 'hidden'} lg:hidden justify-center pt-4`}>
                    <button
                        onClick={handleSearch}
                        className="flex items-center justify-center px-8 py-3.5 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                        style={{ backgroundColor: '#912018' }}
                    >
                        <Search className="h-5 w-5 mr-2" />
                        <span>Search Properties</span>
                    </button>
                </div>
            </div>
            </div>
            
            {/* Login Modal */}
            <LoginModal 
                isOpen={showLoginModal} 
                onClose={() => setShowLoginModal(false)} 
            />
        </>
    );
};

export default IDXAmpreSearchBar;