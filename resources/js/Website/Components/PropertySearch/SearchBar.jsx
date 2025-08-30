import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';

// Icon components
const Search = ({ className }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
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


const DollarSign = ({ className }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"></line>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
);

const SearchBar = ({ initialValues = {}, onSearch }) => {
    const [searchData, setSearchData] = useState({
        location: initialValues.location || '',
        propertyType: initialValues.propertyType || 'For Sale',
        bedrooms: initialValues.bedrooms || '0',
        bathrooms: initialValues.bathrooms || '0',
        minPrice: initialValues.minPrice || 0,
        maxPrice: initialValues.maxPrice || 10000000,
    });

    const [showFilters, setShowFilters] = useState(false);
    const locationInputRef = useRef(null);
    const autocompleteRef = useRef(null);

    useEffect(() => {
        // Initialize Google Maps Autocomplete
        const initializeAutocomplete = () => {
            if (!locationInputRef.current) return;
            
            // Check if Google Maps is available
            if (!window.google || !window.google.maps || !window.google.maps.places) {
                console.log('Google Maps not yet loaded, waiting...');
                return;
            }
            
            console.log('Initializing Google Maps Autocomplete');
            
            try {
                // Create autocomplete instance
                autocompleteRef.current = new window.google.maps.places.Autocomplete(
                    locationInputRef.current,
                    {
                        types: ['geocode'],
                        componentRestrictions: { country: 'ca' }, // Canada only
                        fields: ['address_components', 'formatted_address', 'geometry', 'name'],
                    }
                );

                // Add place_changed listener
                autocompleteRef.current.addListener('place_changed', () => {
                    const place = autocompleteRef.current.getPlace();
                    console.log('Place selected:', place);
                    
                    if (place.formatted_address) {
                        setSearchData(prev => ({
                            ...prev,
                            location: place.formatted_address,
                        }));
                    } else if (place.name) {
                        setSearchData(prev => ({
                            ...prev,
                            location: place.name,
                        }));
                    }
                });
                
                console.log('Autocomplete initialized successfully');
            } catch (error) {
                console.error('Error initializing autocomplete:', error);
            }
        };

        // Function to load Google Maps script
        const loadGoogleMapsScript = () => {
            // Check if API key exists
            if (!window.googleMapsApiKey || window.googleMapsApiKey === '') {
                console.error('Google Maps API key is not configured. Please add GOOGLE_MAPS_API_KEY to your .env file');
                return;
            }
            
            // Check if script is already loaded or loading
            const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
            
            if (window.google && window.google.maps && window.google.maps.places) {
                // Already loaded, initialize immediately
                console.log('Google Maps already loaded');
                initializeAutocomplete();
                return;
            }
            
            if (existingScript) {
                // Script exists but may still be loading
                console.log('Google Maps script found, waiting for load...');
                existingScript.addEventListener('load', initializeAutocomplete);
                return;
            }
            
            // Create and load the script
            console.log('Loading Google Maps script...');
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${window.googleMapsApiKey}&libraries=places`;
            script.async = true;
            script.defer = true;
            
            script.onload = () => {
                console.log('Google Maps script loaded');
                initializeAutocomplete();
            };
            
            script.onerror = () => {
                console.error('Failed to load Google Maps script. Please check your API key and ensure it has Places API enabled.');
            };
            
            document.head.appendChild(script);
        };

        // Start the loading process
        loadGoogleMapsScript();
        
        // Also try to initialize if Google Maps loads later
        const checkInterval = setInterval(() => {
            if (window.google && window.google.maps && window.google.maps.places && !autocompleteRef.current) {
                initializeAutocomplete();
                clearInterval(checkInterval);
            }
        }, 1000);
        
        // Clean up interval after 10 seconds
        setTimeout(() => clearInterval(checkInterval), 10000);
        
        return () => {
            clearInterval(checkInterval);
        };
    }, []);

    const handleSearch = () => {
        if (onSearch) {
            // If parent provided onSearch callback, use it
            onSearch(searchData);
        } else {
            // Default behavior - navigate to search page with params
            const params = new URLSearchParams();
            
            if (searchData.location) params.append('location', searchData.location);
            if (searchData.propertyType) params.append('property_type', searchData.propertyType);
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
            return `¥${(price / 1000000).toFixed(1)}M`;
        } else if (price >= 1000) {
            return `¥${(price / 1000).toFixed(0)}K`;
        }
        return `¥${price}`;
    };

    return (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 shadow-lg rounded-2xl p-6">
            <div className="flex flex-col space-y-4">
                {/* Main Search Row */}
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Location Input with Google Places */}
                    <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            ref={locationInputRef}
                            type="text"
                            placeholder="Enter address, city, or neighborhood..."
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            value={searchData.location}
                            onChange={(e) => setSearchData({ ...searchData, location: e.target.value })}
                            onKeyPress={handleKeyPress}
                        />
                    </div>

                    {/* Property Type */}
                    <div className="relative">
                        <select
                            className="appearance-none w-full md:px-8 gap-2 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
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
                        className="hidden lg:flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg group"
                    >
                        <Search className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold">Search</span>
                    </button>
                </div>

                {/* Filters Row - Desktop Always Visible, Mobile Toggleable */}
                <div className={`${showFilters ? 'block' : 'hidden'} lg:flex lg:flex-row flex-col gap-6 pt-4 border-t border-gray-200`}>
                    {/* Bedrooms */}
                    <div className="mb-3 lg:mb-0">
                        <select
                            className="appearance-none min-w-[140px] px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
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
                            className="appearance-none min-w-[140px] px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
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

                    {/* Price Range */}
                    <div className="flex-1 flex items-center space-x-3">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                        <div className="flex items-center space-x-2 flex-1">
                            <input
                                type="number"
                                placeholder="Min Price"
                                className="w-32 px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                value={searchData.minPrice}
                                onChange={(e) => setSearchData({ ...searchData, minPrice: parseInt(e.target.value) || 0 })}
                            />
                            <span className="text-gray-500">-</span>
                            <input
                                type="number"
                                placeholder="Max Price"
                                className="w-32 px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                value={searchData.maxPrice}
                                onChange={(e) => setSearchData({ ...searchData, maxPrice: parseInt(e.target.value) || 10000000 })}
                            />
                        </div>
                    </div>

                    {/* Price Range Slider */}
                    <div className="flex-1 lg:max-w-xs">
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
                                    step="100000"
                                    value={searchData.minPrice}
                                    onChange={(e) => setSearchData({ ...searchData, minPrice: parseInt(e.target.value) })}
                                    className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer z-20"
                                    style={{
                                        background: 'transparent',
                                    }}
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max="10000000"
                                    step="100000"
                                    value={searchData.maxPrice}
                                    onChange={(e) => setSearchData({ ...searchData, maxPrice: parseInt(e.target.value) })}
                                    className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer z-20"
                                    style={{
                                        background: 'transparent',
                                    }}
                                />
                                <div className="relative h-2 bg-gray-200 rounded-full">
                                    <div
                                        className="absolute h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                                        style={{
                                            left: `${(searchData.minPrice / 10000000) * 100}%`,
                                            right: `${100 - (searchData.maxPrice / 10000000) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Save Search Button */}
                    <button className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        Save Search
                    </button>

                    {/* Mobile Search Button */}
                    <button
                        onClick={handleSearch}
                        className="lg:hidden flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
                    >
                        <Search className="h-5 w-5 mr-2" />
                        <span className="font-semibold">Search Properties</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SearchBar;