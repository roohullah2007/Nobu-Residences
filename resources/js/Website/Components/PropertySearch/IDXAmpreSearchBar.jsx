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
    // Add styles for range inputs
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 18px;
                height: 18px;
                background: transparent;
                cursor: pointer;
                border: none;
            }
            input[type="range"]::-moz-range-thumb {
                width: 18px;
                height: 18px;
                background: transparent;
                cursor: pointer;
                border: none;
            }
            input[type="range"]::-ms-thumb {
                width: 18px;
                height: 18px;
                background: transparent;
                cursor: pointer;
                border: none;
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

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
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'mixed'
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

        // Initialize autocomplete for all search types (including global)
        // Wait a bit for Google Maps to load if needed
        const tryInit = () => {
            if (window.google && window.google.maps && window.google.maps.places) {
                initAutocomplete();
            } else {
                setTimeout(tryInit, 500);
            }
        };
        tryInit();
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
                    new window.google.maps.LatLng(43.5810, -79.6390), // Southwest Toronto
                    new window.google.maps.LatLng(43.8554, -79.1168)  // Northeast Toronto
                ),
                strictBounds: true // Only show Toronto results
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
                case 'global':
                default:
                    // For global search, show all types of addresses
                    autocompleteConfig.types = ['address'];
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
                    } else if (searchType === 'global') {
                        // For global search, show street number and street name
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
            onSearch({ ...searchData, searchType, viewMode });
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
            if (viewMode) params.append('view_mode', viewMode);

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
            <div className="bg-gray-100 rounded-2xl px-4 py-3 overflow-x-auto overflow-y-hidden" style={{ fontFamily: 'Work Sans, sans-serif' }}>
                <div className="flex items-center gap-4 w-full flex-wrap lg:flex-nowrap min-w-fit">

                    {/* Left Group: Search, For Sale, Bed Type, Price */}
                    <div className="flex items-center gap-3 w-full flex-wrap lg:flex-nowrap">
                        {/* Search Input with Type Selector and Search Button - 400px width */}
                        <div className="flex items-center bg-white rounded-lg px-2 w-full lg:w-[400px] h-[48px] relative">
                            {/* Search Type Dropdown Button */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setShowSearchTypeDropdown(!showSearchTypeDropdown)}
                                    className="flex items-center gap-2 px-2 py-2 hover:bg-gray-50 rounded-lg transition-all"
                                >
                                    {currentSearchType.icon}
                                    <ChevronDown className="w-3.5 h-3.5 text-[#293056]" strokeWidth="2.5" />
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

                            {/* Vertical Divider */}
                            <div className="h-6 w-[1px] bg-gray-300 mx-1"></div>

                            {/* Search Input */}
                            <input
                                ref={locationInputRef}
                                type="text"
                                placeholder={currentSearchType.placeholder}
                                className="flex-1 text-sm font-bold text-[#293056] focus:outline-none border-0 bg-transparent placeholder:text-[#293056] placeholder:font-bold placeholder:opacity-60 px-2"
                                value={searchData.location}
                                onChange={(e) => {
                                    setSearchData({ ...searchData, location: e.target.value });
                                    const pacContainer = document.querySelector('.pac-container');
                                    if (pacContainer && e.target.value.length > 0) {
                                        pacContainer.style.display = 'block';
                                    }
                                }}
                                onFocus={() => {
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

                            {/* Search Button */}
                            <button
                                onClick={handleSearch}
                                className="bg-black text-white rounded-lg p-2.5 hover:bg-gray-800 transition-all flex items-center justify-center ml-2"
                            >
                                <Search className="w-4 h-4" />
                            </button>
                        </div>

                        {/* For Sale Dropdown - 40px height, 103px width */}
                        <div className="relative w-[103px]">
                            <select
                                className="appearance-none px-3 pr-8 bg-white rounded-lg transition-all cursor-pointer text-[#293056] font-bold text-sm whitespace-nowrap border-0 focus:ring-2 focus:ring-black h-[40px] w-full"
                                value={searchData.propertyType}
                                onChange={(e) => setSearchData({ ...searchData, propertyType: e.target.value })}
                                disabled={!!searchData.propertyStatus}
                            >
                                <option value="For Sale">For Sale</option>
                                <option value="For Rent">For Rent</option>
                            </select>
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <ChevronDown className="w-3.5 h-3.5 text-[#293056]" strokeWidth="2.5" />
                            </div>
                        </div>

                        {/* Bed Type Dropdown - 40px height, 135px width */}
                        <div className="relative w-[135px]">
                            <select
                                className="appearance-none px-3 pr-8 bg-white rounded-lg transition-all cursor-pointer text-[#293056] font-bold text-sm whitespace-nowrap border-0 focus:ring-2 focus:ring-black h-[40px] w-full"
                                value={searchData.bedrooms}
                                onChange={(e) => setSearchData({ ...searchData, bedrooms: e.target.value })}
                            >
                                <option value="">Bed type</option>
                                <option value="1">1 Bedroom</option>
                                <option value="2">2 Bedrooms</option>
                                <option value="3">3 Bedrooms</option>
                                <option value="4">4 Bedrooms</option>
                                <option value="5">5+ Bedrooms</option>
                            </select>
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <ChevronDown className="w-3.5 h-3.5 text-[#293056]" strokeWidth="2.5" />
                            </div>
                        </div>

                        {/* Price Inputs and Slider Container - 286px width */}
                        <div className="flex w-full lg:w-[286px] flex-col gap-2 items-center">
                            <div className="flex items-center gap-2 w-full">
                                {/* Min Price Input */}
                                <div className="bg-white rounded-lg px-3 flex items-center justify-center border border-gray-200 flex-1 lg:w-[99px] h-[40px]">
                                    <input
                                        type="text"
                                        value={searchData.minPrice > 0 ? `$${searchData.minPrice.toLocaleString()}` : '0'}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[$,]/g, '');
                                            setSearchData({ ...searchData, minPrice: parseInt(value) || 0 });
                                        }}
                                        className="w-full text-xs text-[#293056] font-medium text-center focus:outline-none border-0 bg-transparent"
                                        placeholder="0"
                                    />
                                </div>

                                {/* "to" text */}
                                <span className="text-gray-600 text-xs font-medium">to</span>

                                {/* Max Price Input */}
                                <div className="bg-white rounded-lg px-3 flex items-center justify-center border border-gray-200 flex-1 lg:w-[135px] h-[40px]">
                                    <input
                                        type="text"
                                        value={searchData.maxPrice >= 10000000 ? '$37,000,000' : `$${searchData.maxPrice.toLocaleString()}`}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[$,]/g, '');
                                            setSearchData({ ...searchData, maxPrice: parseInt(value) || 10000000 });
                                        }}
                                        className="w-full text-xs text-[#293056] font-medium text-center focus:outline-none border-0 bg-transparent"
                                        placeholder="Max"
                                    />
                                </div>
                            </div>

                            {/* Price Slider - positioned below inputs */}
                            <div className="relative flex w-full items-center h-5">
                                {/* Slider Track Background */}
                                <div className="absolute w-full h-[1.61px] bg-gray-300 rounded-full"></div>

                                {/* Active Track (between min and max) */}
                                <div
                                    className="absolute h-[1.61px] bg-[#293056] rounded-full pointer-events-none"
                                    style={{
                                        left: `${(searchData.minPrice / 10000000) * 100}%`,
                                        right: `${100 - (searchData.maxPrice / 10000000) * 100}%`
                                    }}
                                ></div>

                                {/* Min Range Input */}
                                <input
                                    type="range"
                                    min="0"
                                    max="10000000"
                                    step="50000"
                                    value={searchData.minPrice}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        // Always update, but ensure it doesn't exceed max - 50000
                                        const newMin = Math.min(value, searchData.maxPrice - 50000);
                                        setSearchData({ ...searchData, minPrice: newMin });
                                    }}
                                    className="absolute w-full h-5 appearance-none bg-transparent cursor-pointer"
                                    style={{
                                        zIndex: 4,
                                        pointerEvents: 'auto'
                                    }}
                                />

                                {/* Max Range Input */}
                                <input
                                    type="range"
                                    min="0"
                                    max="10000000"
                                    step="50000"
                                    value={searchData.maxPrice}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        // Always update, but ensure it doesn't go below min + 50000
                                        const newMax = Math.max(value, searchData.minPrice + 50000);
                                        setSearchData({ ...searchData, maxPrice: newMax });
                                    }}
                                    className="absolute w-full h-5 appearance-none bg-transparent cursor-pointer"
                                    style={{
                                        zIndex: 3,
                                        pointerEvents: 'auto'
                                    }}
                                />

                                {/* Left Handle SVG */}
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 21 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="absolute flex-shrink-0 pointer-events-none z-30 transition-all"
                                    style={{
                                        left: `calc(${(searchData.minPrice / 10000000) * 100}% - 9px)`
                                    }}
                                >
                                    <rect x="0.644043" width="20.3559" height="19.0476" rx="9.52381" fill="white"/>
                                    <rect x="1.14404" y="0.5" width="19.3559" height="18.0476" rx="9.02381" stroke="#293056"/>
                                    <path d="M14.489 4.85712C14.489 5.21076 14.348 5.54988 14.098 5.79992C13.848 6.04996 13.509 6.19046 13.155 6.19046C12.802 6.19046 12.463 6.04996 12.213 5.79992C11.963 5.54988 11.822 5.21076 11.822 4.85712C11.822 4.50348 11.963 4.16437 12.213 3.91432C12.463 3.66428 12.802 3.52379 13.155 3.52379C13.509 3.52379 13.848 3.66428 14.098 3.91432C14.348 4.16437 14.489 4.50348 14.489 4.85712ZM14.489 9.52379C14.489 9.87743 14.348 10.2165 14.098 10.4666C13.848 10.7166 13.509 10.8571 13.155 10.8571C12.802 10.8571 12.463 10.7166 12.213 10.4666C11.963 10.2165 11.822 9.87743 11.822 9.52379C11.822 9.17015 11.963 8.83104 12.213 8.58099C12.463 8.33095 12.802 8.19046 13.155 8.19046C13.509 8.19046 13.848 8.33095 14.098 8.58099C14.348 8.83104 14.489 9.17015 14.489 9.52379ZM8.489 15.5238C8.842 15.5238 9.181 15.3833 9.432 15.1333C9.682 14.8832 9.822 14.5441 9.822 14.1905C9.822 13.8368 9.682 13.4977 9.432 13.2477C9.181 12.9976 8.842 12.8571 8.489 12.8571C8.135 12.8571 7.796 12.9976 7.546 13.2477C7.296 13.4977 7.155 13.8368 7.155 14.1905C7.155 14.5441 7.296 14.8832 7.546 15.1333C7.796 15.3833 8.135 15.5238 8.489 15.5238ZM13.155 15.5238C13.509 15.5238 13.848 15.3833 14.098 15.1333C14.348 14.8832 14.489 14.5441 14.489 14.1905C14.489 13.8368 14.348 13.4977 14.098 13.2477C13.848 12.9976 13.509 12.8571 13.155 12.8571C12.802 12.8571 12.463 12.9976 12.213 13.2477C11.963 13.4977 11.822 13.8368 11.822 14.1905C11.822 14.5441 11.963 14.8832 12.213 15.1333C12.463 15.3833 12.802 15.5238 13.155 15.5238ZM8.489 10.8571C8.842 10.8571 9.181 10.7166 9.432 10.4666C9.682 10.2165 9.822 9.87743 9.822 9.52379C9.822 9.17015 9.682 8.83104 9.432 8.58099C9.181 8.33095 8.842 8.19046 8.489 8.19046C8.135 8.19046 7.796 8.33095 7.546 8.58099C7.296 8.83104 7.155 9.17015 7.155 9.52379C7.155 9.87743 7.296 10.2165 7.546 10.4666C7.796 10.7166 8.135 10.8571 8.489 10.8571ZM8.489 6.19046C8.842 6.19046 9.181 6.04996 9.432 5.79992C9.682 5.54988 9.822 5.21076 9.822 4.85712C9.822 4.50348 9.682 4.16437 9.432 3.91432C9.181 3.66428 8.842 3.52379 8.489 3.52379C8.135 3.52379 7.796 3.66428 7.546 3.91432C7.296 4.16437 7.155 4.50348 7.155 4.85712C7.155 5.21076 7.296 5.54988 7.546 5.79992C7.796 6.04996 8.135 6.19046 8.489 6.19046Z" fill="#293056"/>
                                </svg>

                                {/* Right Handle SVG */}
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 21 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="absolute flex-shrink-0 pointer-events-none z-30 transition-all"
                                    style={{
                                        left: `calc(${(searchData.maxPrice / 10000000) * 100}% - 9px)`
                                    }}
                                >
                                    <rect width="20.3559" height="19.0476" rx="9.52381" fill="white"/>
                                    <rect x="0.5" y="0.5" width="19.3559" height="18.0476" rx="9.02381" stroke="#293056"/>
                                    <path d="M13.845 4.85712C13.845 5.21076 13.704 5.54988 13.454 5.79992C13.204 6.04996 12.865 6.19046 12.511 6.19046C12.158 6.19046 11.818 6.04996 11.568 5.79992C11.318 5.54988 11.178 5.21076 11.178 4.85712C11.178 4.50348 11.318 4.16437 11.568 3.91432C11.818 3.66428 12.158 3.52379 12.511 3.52379C12.865 3.52379 13.204 3.66428 13.454 3.91432C13.704 4.16437 13.845 4.50348 13.845 4.85712ZM13.845 9.52379C13.845 9.87743 13.704 10.2165 13.454 10.4666C13.204 10.7166 12.865 10.8571 12.511 10.8571C12.158 10.8571 11.818 10.7166 11.568 10.4666C11.318 10.2165 11.178 9.87743 11.178 9.52379C11.178 9.17015 11.318 8.83104 11.568 8.58099C11.818 8.33095 12.158 8.19046 12.511 8.19046C12.865 8.19046 13.204 8.33095 13.454 8.58099C13.704 8.83104 13.845 9.17015 13.845 9.52379ZM7.845 15.5238C8.198 15.5238 8.537 15.3833 8.787 15.1333C9.037 14.8832 9.178 14.5441 9.178 14.1905C9.178 13.8368 9.037 13.4977 8.787 13.2477C8.537 12.9976 8.198 12.8571 7.845 12.8571C7.491 12.8571 7.152 12.9976 6.902 13.2477C6.652 13.4977 6.511 13.8368 6.511 14.1905C6.511 14.5441 6.652 14.8832 6.902 15.1333C7.152 15.3833 7.491 15.5238 7.845 15.5238ZM12.511 15.5238C12.865 15.5238 13.204 15.3833 13.454 15.1333C13.704 14.8832 13.845 14.5441 13.845 14.1905C13.845 13.8368 13.704 13.4977 13.454 13.2477C13.204 12.9976 12.865 12.8571 12.511 12.8571C12.158 12.8571 11.818 12.9976 11.568 13.2477C11.318 13.4977 11.178 13.8368 11.178 14.1905C11.178 14.5441 11.318 14.8832 11.568 15.1333C11.818 15.3833 12.158 15.5238 12.511 15.5238ZM7.845 10.8571C8.198 10.8571 8.537 10.7166 8.787 10.4666C9.037 10.2165 9.178 9.87743 9.178 9.52379C9.178 9.17015 9.037 8.83104 8.787 8.58099C8.537 8.33095 8.198 8.19046 7.845 8.19046C7.491 8.19046 7.152 8.33095 6.902 8.58099C6.652 8.83104 6.511 9.17015 6.511 9.52379C6.511 9.87743 6.652 10.2165 6.902 10.4666C7.152 10.7166 7.491 10.8571 7.845 10.8571ZM7.845 6.19046C8.198 6.19046 8.537 6.04996 8.787 5.79992C9.037 5.54988 9.178 5.21076 9.178 4.85712C9.178 4.50348 9.037 4.16437 8.787 3.91432C8.537 3.66428 8.198 3.52379 7.845 3.52379C7.491 3.52379 7.152 3.66428 6.902 3.91432C6.652 4.16437 6.511 4.50348 6.511 4.85712C6.511 5.21076 6.652 5.54988 6.902 5.79992C7.152 6.04996 7.491 6.19046 7.845 6.19046Z" fill="#293056"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Right Group: Grid/Mixed Toggle and Save Search */}
                    <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap lg:flex-nowrap">
                        {/* Grid/Mixed View Toggle - 145px width, 44px height */}
                        <div className="hidden lg:flex items-center bg-white rounded-lg overflow-hidden w-[145px] h-[44px]">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`transition-all flex-1 h-full flex flex-col items-center justify-center gap-0.5 ${
                                    viewMode === 'grid'
                                        ? 'bg-black text-white hover:bg-gray-800'
                                        : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <svg className="w-3.5 h-3.5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="7" height="7"></rect>
                                    <rect x="14" y="3" width="7" height="7"></rect>
                                    <rect x="3" y="14" width="7" height="7"></rect>
                                    <rect x="14" y="14" width="7" height="7"></rect>
                                </svg>
                                <span className="text-[9px] font-medium">Grid</span>
                            </button>
                            <button
                                onClick={() => setViewMode('mixed')}
                                className={`transition-all flex-1 h-full flex flex-col items-center justify-center gap-0.5 relative ${
                                    viewMode === 'mixed'
                                        ? 'bg-black text-white hover:bg-gray-800'
                                        : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <svg className="w-3.5 h-3.5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="7" height="7"></rect>
                                    <rect x="14" y="3" width="7" height="7"></rect>
                                    <rect x="3" y="14" width="7" height="7"></rect>
                                    <rect x="14" y="14" width="7" height="7"></rect>
                                </svg>
                                <span className="text-[9px] font-medium">Mixed</span>
                            </button>
                        </div>

                        {/* Save Search Button - 111px width, 48px height */}
                        <button
                            onClick={() => {
                                if (onSaveSearch) {
                                    onSaveSearch({ ...searchData, searchType });
                                } else {
                                    console.log('Save search:', { ...searchData, searchType });
                                    alert('Save search functionality not connected. Please implement onSaveSearch prop.');
                                }
                            }}
                            className="bg-white rounded-lg font-bold text-sm text-[#293056] hover:bg-gray-50 transition-all whitespace-nowrap flex items-center justify-center border border-gray-200 w-full lg:w-[111px] h-[48px]"
                        >
                            Save search
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