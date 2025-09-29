import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/Website/Global/MainLayout';
import Navbar from '@/Website/Global/Navbar';
import PropertyCardV5 from '@/Website/Global/Components/PropertyCards/PropertyCardV5';
import LazyPropertyCard from '@/Website/Global/Components/PropertyCards/LazyPropertyCard';
import PluginStyleImageLoader from '@/Website/Components/PluginStyleImageLoader';
import SimplePropertyMap from '@/Website/Components/SimplePropertyMap';
import ViewportAwarePropertyMap from '@/Website/Components/ViewportAwarePropertyMap';
import usePropertyImageLazyLoad from '@/hooks/usePropertyImageLazyLoad';
import { createBuildingUrl, createSEOBuildingUrl } from '@/utils/slug';
import { generatePropertyUrl } from '@/utils/propertyUrl';
import IDXAmpreSearchBar from '@/Website/Components/PropertySearch/IDXAmpreSearchBar';
import LoginModal from '@/Website/Global/Components/LoginModal';


// Icon components
const SearchIcon = ({ className }) => (
  <svg className={className} width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.6 18.5L10.3 12.2C9.8 12.6 9.225 12.9167 8.575 13.15C7.925 13.3833 7.23333 13.5 6.5 13.5C4.68333 13.5 3.14583 12.8708 1.8875 11.6125C0.629167 10.3542 0 8.81667 0 7C0 5.18333 0.629167 3.64583 1.8875 2.3875C3.14583 1.12917 4.68333 0.5 6.5 0.5C8.31667 0.5 9.85417 1.12917 11.1125 2.3875C12.3708 3.64583 13 5.18333 13 7C13 7.73333 12.8833 8.425 12.65 9.075C12.4167 9.725 12.1 10.3 11.7 10.8L18 17.1L16.6 18.5ZM6.5 11.5C7.75 11.5 8.8125 11.0625 9.6875 10.1875C10.5625 9.3125 11 8.25 11 7C11 5.75 10.5625 4.6875 9.6875 3.8125C8.8125 2.9375 7.75 2.5 6.5 2.5C5.25 2.5 4.1875 2.9375 3.3125 3.8125C2.4375 4.6875 2 5.75 2 7C2 8.25 2.4375 9.3125 3.3125 10.1875C4.1875 11.0625 5.25 11.5 6.5 11.5Z" fill="white"/>
  </svg>
);

const ChevronDownIcon = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const GridIcon = ({ className }) => (
  <svg className={className} width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 1H13C12.7239 1 12.5 1.22386 12.5 1.5V3.5C12.5 3.77614 12.7239 4 13 4H16C16.2761 4 16.5 3.77614 16.5 3.5V1.5C16.5 1.22386 16.2761 1 16 1Z" fill="currentColor"/>
    <path d="M16 6H13C12.7239 6 12.5 6.22386 12.5 6.5V8.5C12.5 8.77614 12.7239 9 13 9H16C16.2761 9 16.5 8.77614 16.5 8.5V6.5C16.5 6.22386 16.2761 6 16 6Z" fill="currentColor"/>
    <path d="M16 11H13C12.7239 11 12.5 11.2239 12.5 11.5V13.5C12.5 13.7761 12.7239 14 13 14H16C16.2761 14 16.5 13.7761 16.5 13.5V11.5C16.5 11.2239 16.2761 11 16 11Z" fill="currentColor"/>
    <path d="M10 1H7C6.72386 1 6.5 1.22386 6.5 1.5V3.5C6.5 3.77614 6.72386 4 7 4H10C10.2761 4 10.5 3.77614 10.5 3.5V1.5C10.5 1.22386 10.2761 1 10 1Z" fill="currentColor"/>
    <path d="M4 1H1C0.723858 1 0.5 1.22386 0.5 1.5V3.5C0.5 3.77614 0.723858 4 1 4H4C4.27614 4 4.5 3.77614 4.5 3.5V1.5C4.5 1.22386 4.27614 1 4 1Z" fill="currentColor"/>
    <path d="M10 6H7C6.72386 6 6.5 6.22386 6.5 6.5V8.5C6.5 8.77614 6.72386 9 7 9H10C10.2761 9 10.5 8.77614 10.5 8.5V6.5C6.5 6.22386 10.2761 6 10 6Z" fill="currentColor"/>
    <path d="M4 6H1C0.723858 6 0.5 6.22386 0.5 6.5V8.5C0.5 8.77614 0.723858 9 1 9H4C4.27614 9 4.5 8.77614 4.5 8.5V6.5C4.5 6.22386 4.27614 6 4 6Z" fill="currentColor"/>
    <path d="M10 11H7C6.72386 11 6.5 11.2239 6.5 11.5V13.5C6.5 13.7761 6.72386 14 7 14H10C10.2761 14 10.5 13.7761 10.5 13.5V11.5C10.5 11.2239 10.2761 11 10 11Z" fill="currentColor"/>
    <path d="M4 11H1C0.723858 11 0.5 11.2239 0.5 11.5V13.5C0.5 13.7761 0.723858 14 1 14H4C4.27614 14 4.5 13.7761 4.5 13.5V11.5C4.5 11.2239 4.27614 11 4 11Z" fill="currentColor"/>
  </svg>
);

const MapIcon = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2 1,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="8" y1="2" x2="8" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="16" y1="6" x2="16" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MixedIcon = ({ className }) => (
  <svg className={className} width="27" height="15" viewBox="0 0 27 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M25.7 1.5H12.7V13.5H25.7V1.5Z" stroke="currentColor"/>
    <path d="M9.69995 1H6.69995C6.42381 1 6.19995 1.22386 6.19995 1.5V3.5C6.19995 3.77614 6.42381 4 6.69995 4H9.69995C9.97609 4 10.2 3.77614 10.2 3.5V1.5C10.2 1.22386 9.97609 1 9.69995 1Z" fill="currentColor"/>
    <path d="M9.69995 6H6.69995C6.42381 6 6.19995 6.22386 6.19995 6.5V8.5C6.19995 8.77614 6.42381 9 6.69995 9H9.69995C9.97609 9 10.2 8.77614 10.2 8.5V6.5C10.2 6.22386 9.97609 6 9.69995 6Z" fill="currentColor"/>
    <path d="M9.69995 11H6.69995C6.42381 11 6.19995 11.2239 6.19995 11.5V13.5C6.19995 13.7761 6.42381 14 6.69995 14H9.69995C9.97609 14 10.2 13.7761 10.2 13.5V11.5C10.2 11.2239 9.97609 11 9.69995 11Z" fill="currentColor"/>
    <path d="M3.69995 1H0.699951C0.423809 1 0.199951 1.22386 0.199951 1.5V3.5C0.199951 3.77614 0.423809 4 0.699951 4H3.69995C3.97609 4 4.19995 3.77614 4.19995 3.5V1.5C4.19995 1.22386 3.97609 1 3.69995 1Z" fill="currentColor"/>
    <path d="M3.69995 6H0.699951C0.423809 6 0.199951 6.22386 0.199951 6.5V8.5C0.199951 8.77614 0.423809 9 0.699951 9H3.69995C3.97609 9 4.19995 8.77614 4.19995 8.5V6.5C4.19995 6.22386 3.97609 6 3.69995 6Z" fill="currentColor"/>
    <path d="M3.69995 11H0.699951C0.423809 11 0.199951 11.2239 0.199951 11.5V13.5C0.199951 13.7761 0.423809 14 0.699951 14H3.69995C3.97609 14 4.19995 13.7761 4.19995 13.5V11.5C4.19995 11.2239 3.97609 11 3.69995 11Z" fill="currentColor"/>
  </svg>
);

const SaveIcon = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Save Search Modal Component
const SaveSearchModal = ({ isOpen, onClose, onSave, currentFilters }) => {
  const [searchName, setSearchName] = useState('');
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!searchName.trim()) {
      alert('Please enter a name for your search');
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        name: searchName,
        search_params: currentFilters,
        email_alerts: emailAlerts
      });
      setSearchName('');
      setEmailAlerts(false);
      onClose();
    } catch (error) {
      alert('Failed to save search. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-bold mb-4">Save Search</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Name
          </label>
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="e.g., Downtown Toronto Condos"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#293056]"
          />
        </div>
        
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="rounded border-gray-300 text-[#293056] focus:ring-[#293056]"
            />
            <span className="ml-2 text-sm text-gray-700">
              Send me email alerts for new properties
            </span>
          </label>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-[#293056] text-white rounded-md hover:bg-[#1e2142] disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Search'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function EnhancedPropertySearch({
  auth,
  website,
  siteName,
  siteUrl,
  year,
  filters = {},
  searchTab = 'listings',
}) {
  // Debug: Log the filters being passed from WebsiteController
  console.log('🔍 Search page filters from controller:', filters);

  // State for login modal
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Function to map backend status to user-friendly display
  const mapStatusToDisplay = (status) => {
    if (status === 'For Lease') return 'For Rent';
    return status;
  };
  
  // Function to map display status to backend API format
  const mapDisplayToStatus = (display) => {
    if (display === 'For Rent') return 'For Lease';
    return display;
  };
  
  // Get property type from URL params if available
  const urlParams = new URLSearchParams(window.location.search);
  const propertySubType = urlParams.get('property_sub_type');
  const buildingId = urlParams.get('building_id');
  const transactionType = filters.transaction_type || urlParams.get('transaction_type');
  
  // Map transaction_type to status
  let statusFromTransaction = '';
  if (transactionType === 'rent') {
    statusFromTransaction = 'For Lease';
  } else if (transactionType === 'sale') {
    statusFromTransaction = 'For Sale';
  }
  
  // Convert property_sub_type to property_type array
  let propertyTypeArray = filters.property_type || [];
  if (propertySubType !== null) {
    // If property_sub_type is explicitly set in URL (even as empty), use it
    propertyTypeArray = propertySubType ? [propertySubType] : [];
    console.log('🏠 Property type from URL:', propertySubType, '→ Array:', propertyTypeArray);
  }
  
  // Default to Condo Apartment if building_id is provided (from building count buttons)
  if (buildingId && propertyTypeArray.length === 0) {
    propertyTypeArray = ['Condo Apartment'];
  }
  
  // Get street address from filters (passed from controller) or URL parameters
  const streetNumber = filters.street_number || urlParams.get('street_number');
  const streetName = filters.street_name || urlParams.get('street_name');
  const locationQuery = (streetNumber && streetName) ? `${streetNumber} ${streetName}` : (urlParams.get('query') || filters.search || urlParams.get('location') || '');

  const [searchFilters, setSearchFilters] = useState({
    query: locationQuery,
    status: mapStatusToDisplay(filters.status || filters.forSale || statusFromTransaction || urlParams.get('status') || urlParams.get('property_type') || 'For Sale'),
    property_status: urlParams.get('property_status') || filters.property_status || '', // For Sold/Leased properties
    property_type: propertyTypeArray.length > 0 ? propertyTypeArray : [], // Don't default if no type specified
    building_id: buildingId || filters.building_id || '',
    street_number: streetNumber || filters.street_number || '',
    street_name: streetName || filters.street_name || '',
    price_min: parseInt(urlParams.get('price_min')) || filters.minPrice || parseInt(urlParams.get('min_price')) || 0,
    price_max: parseInt(urlParams.get('price_max')) || filters.maxPrice || parseInt(urlParams.get('max_price')) || 10000000, // Default max price 10M
    bedrooms: filters.bedType || parseInt(urlParams.get('bedrooms')) || 0,
    bathrooms: filters.bathrooms || parseInt(urlParams.get('bathrooms')) || 0,
    sort: filters.sort || 'newest',
    tab: filters.tab || searchTab || 'listings',
    page: filters.page || 1,
  });

  const [viewType, setViewType] = useState('grid'); // 'grid', 'map', 'mixed'
  const [activeTab, setActiveTab] = useState(searchTab || 'listings');
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [mapProperties, setMapProperties] = useState([]); // Properties for map display (32 on initial load)
  const [viewportProperties, setViewportProperties] = useState([]); // Properties from map viewport
  const [showViewportProperties, setShowViewportProperties] = useState(false); // Toggle between search results and viewport properties
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [activeProperty, setActiveProperty] = useState(null);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [propertyImages, setPropertyImages] = useState({});

  // Initialize lazy loading hook for property images
  const {
    observeElement,
    loadImageNow,
    getImage,
    isImageLoading,
    imageCache
  } = usePropertyImageLazyLoad({
    batchSize: 4,
    batchDelay: 100,
    rootMargin: '50px', // Load images just before they come into view
    threshold: 0.01,
    debug: false // Disable debug logging for production
  });

  // Update property images when cache changes
  useEffect(() => {
    setPropertyImages(imageCache);
  }, [imageCache]);

  const handlePropertyHover = (listingKey) => {
    setActiveProperty(listingKey);
  };

  // Get CSRF token
  const getCsrfToken = () => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
  };

  // Perform search
  const performSearch = async (params = searchFilters, resetPage = false, tabOverride = null) => {
    setIsLoading(true);
    // Reset viewport properties when doing a new search
    setShowViewportProperties(false);
    setViewportProperties([]);

    // Update URL with search params
    const url = new URL(window.location);

    // Clear all existing search params except 'tab' and 'page'
    const tabParam = url.searchParams.get('tab');
    const pageParam = resetPage ? '1' : (url.searchParams.get('page') || '1');

    // Clear all params
    for (const key of [...url.searchParams.keys()]) {
      url.searchParams.delete(key);
    }

    // Add back essential params
    if (tabParam) url.searchParams.set('tab', tabParam);
    url.searchParams.set('page', pageParam);

    // Add query/location to URL
    if (params.query) {
      url.searchParams.set('query', params.query);
    }

    // Add other relevant params
    if (params.status && params.status !== 'For Sale') {
      url.searchParams.set('status', params.status);
    }

    // Update the URL without reloading
    window.history.replaceState({}, '', url);

    try {
      // Use different endpoint based on active tab (use override if provided)
      const currentTab = tabOverride || activeTab;
      
      // Prepare search params based on tab
      let searchParams;
      if (currentTab === 'buildings') {
        // For buildings, only send relevant filters (no default status filter)
        searchParams = {
          page: resetPage ? 1 : (params.page || 1),
          page_size: 16
        };
        
        // Only add filters if they have meaningful values
        if (params.query) searchParams.query = params.query;
        if (params.street_number) searchParams.street_number = params.street_number;
        if (params.street_name) searchParams.street_name = params.street_name;
        if (params.floors && params.floors > 0) searchParams.floors = params.floors;
        if (params.price_min && params.price_min > 0) searchParams.price_min = params.price_min;
        if (params.price_max && params.price_max < 10000000) searchParams.price_max = params.price_max;
        // Don't send status filter for buildings unless explicitly set to something other than default
      } else {
        // For properties, send all filters with proper status mapping
        const mappedParams = { ...params };
        
        // Map display status to backend API format
        mappedParams.status = mapDisplayToStatus(mappedParams.status);
        
        // Include property_status if it's set (for Sold/Leased)
        if (params.property_status) {
          mappedParams.property_status = params.property_status;
        }
        
        // Include street_number and street_name if present
        if (params.street_number) mappedParams.street_number = params.street_number;
        if (params.street_name) mappedParams.street_name = params.street_name;
        if (params.mercer_buildings) mappedParams.mercer_buildings = params.mercer_buildings;

        searchParams = {
          ...mappedParams,
          page: resetPage ? 1 : (params.page || 1),
          page_size: 16
        };
      }

      const endpoint = currentTab === 'buildings' ? '/api/buildings-search' : '/api/property-search';

      // Debug: Log search parameters being sent
      console.log('🔍 Search Parameters:', {
        ...searchParams,
        property_status: searchParams.property_status,
        status: searchParams.status,
        query: searchParams.query,
        property_type: searchParams.property_type
      });

      // Special logging for neighborhood searches
      if (searchParams.query) {
        console.log('🏘️ Neighborhood Search:', {
          query: searchParams.query,
          isNeighborhoodSearch: ['yorkville', 'the annex', 'rosedale', 'forest hill'].includes(searchParams.query.toLowerCase()),
          propertyTypes: searchParams.property_type
        });
      }

      // Add fetch_for_map flag when on page 1 for properties
      const fetchForMap = currentTab === 'listings' && searchParams.page === 1;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken()
        },
        body: JSON.stringify({
          search_params: searchParams,
          fetch_for_map: fetchForMap
        })
      });

      const result = await response.json();

      if (result.success) {
        const currentTab = tabOverride || activeTab;
        if (currentTab === 'listings') {
          // Enhanced debugging for Sold/Leased properties
          if (result.data.properties && result.data.properties.length > 0) {
            console.log('📦 Properties loaded:', result.data.properties.length);
            console.log('🏷️ First property details:', {
              ListingKey: result.data.properties[0].ListingKey,
              StandardStatus: result.data.properties[0].StandardStatus,
              MlsStatus: result.data.properties[0].MlsStatus,
              TransactionType: result.data.properties[0].TransactionType,
              formatted_status: result.data.properties[0].formatted_status
            });

            // Check if we're getting the right properties
            if (searchParams.property_status === 'Sold' || searchParams.property_status === 'Leased') {
              const statusCount = result.data.properties.filter(p =>
                p.StandardStatus === searchParams.property_status ||
                p.MlsStatus === searchParams.property_status
              ).length;
              console.log(`✅ ${searchParams.property_status} properties: ${statusCount}/${result.data.properties.length}`);
            }
          }
          setProperties(result.data.properties || []);
          setBuildings([]);

          // Handle map properties
          if (result.data.map_properties) {
            // Page 1: Set 32 properties (2 pages) for map
            console.log('🗺️ Loading 32 properties for map display (pages 1 & 2)');
            setMapProperties(result.data.map_properties);
          } else {
            // Other pages: Set only current page properties for map
            console.log(`🗺️ Loading ${result.data.properties?.length || 0} properties for map display (page ${result.data.page})`);
            setMapProperties(result.data.properties || []);
          }
        } else {
          setBuildings(result.data.buildings || []);
          setProperties([]);
          setMapProperties([]); // Clear map properties for buildings tab
        }
        setTotal(result.data.total || 0);
        setCurrentPage(result.data.page || 1);
        setLastPage(Math.ceil((result.data.total || 0) / 16));
      } else {
        console.error('Search failed:', result.message);
        setProperties([]);
        setBuildings([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Search error:', error);
      setProperties([]);
      setBuildings([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial search on mount and handle URL changes
  useEffect(() => {
    const loadFromUrl = () => {
      // Get all params from URL
      const urlParams = new URLSearchParams(window.location.search);
      const pageFromUrl = parseInt(urlParams.get('page')) || 1;
      const tabFromUrl = urlParams.get('tab') || activeTab;
      const statusFromUrl = urlParams.get('status') || urlParams.get('property_type');
      const propertySubType = urlParams.get('property_sub_type');
      
      // Update tab if different from URL
      if (tabFromUrl !== activeTab) {
        setActiveTab(tabFromUrl);
      }
      
      // Get building and transaction type from URL or filters prop
      const buildingIdFromUrl = urlParams.get('building_id');
      const transactionTypeFromUrl = filters.transaction_type || urlParams.get('transaction_type');
      
      // Map transaction_type to status
      let statusFromTransaction = '';
      if (transactionTypeFromUrl === 'rent') {
        statusFromTransaction = 'For Lease';
      } else if (transactionTypeFromUrl === 'sale') {
        statusFromTransaction = 'For Sale';
      }
      
      // Default to Condo Apartment if building_id is provided
      let propertyTypes = ['Condo Apartment'];
      if (propertySubType) {
        propertyTypes = [propertySubType];
      } else if (buildingIdFromUrl) {
        propertyTypes = ['Condo Apartment'];
      }

      // Get street address from filters prop (passed from controller) or URL parameters
      const streetNumber = filters.street_number || urlParams.get('street_number');
      const streetName = filters.street_name || urlParams.get('street_name');
      // Special handling for Mercer buildings
      const locationQuery = filters.mercer_buildings ? '15 & 35 Mercer' :
        (streetNumber && streetName) ? `${streetNumber} ${streetName}` :
        (urlParams.get('query') || urlParams.get('location') || filters.location || filters.query || '');

      // Build filters from URL params, but use controller filters as defaults
      const initialFilters = {
        query: locationQuery,
        street_number: streetNumber || '',
        street_name: streetName || '',
        mercer_buildings: filters.mercer_buildings || false,
        status: mapStatusToDisplay(statusFromTransaction || statusFromUrl || filters.status || 'For Sale'),
        property_type: propertyTypes.length > 0 ? propertyTypes : (filters.property_type || ['Condo Apartment']),
        building_id: buildingIdFromUrl || filters.building_id || '',
        price_min: parseInt(urlParams.get('price_min')) || parseInt(urlParams.get('min_price')) || filters.price_min || 0,
        price_max: parseInt(urlParams.get('price_max')) || parseInt(urlParams.get('max_price')) || filters.price_max || 10000000,
        bedrooms: parseInt(urlParams.get('bedrooms')) || filters.bedrooms || 0,
        bathrooms: parseInt(urlParams.get('bathrooms')) || filters.bathrooms || 0,
        sort: urlParams.get('sort') || filters.sort || 'newest',
        tab: tabFromUrl,
        page: pageFromUrl
      };
      
      setSearchFilters(initialFilters);
      setCurrentPage(pageFromUrl);
      
      // Always perform search with the initial filters
      performSearch(initialFilters, false, tabFromUrl);
    };
    
    // Load initial state
    loadFromUrl();
    
    // Handle browser back/forward navigation
    const handlePopState = () => {
      loadFromUrl();
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [filters.street_number, filters.street_name, filters.transaction_type, filters.mercer_buildings]); // Re-run when filters from controller change

  const handleFilterChange = (field, value) => {
    // Reset to page 1 when filters change
    const url = new URL(window.location);
    url.searchParams.set('page', 1);
    window.history.pushState({}, '', url);
    
    const newFilters = {
      ...searchFilters,
      [field]: value,
      page: 1
    };
    
    setSearchFilters(newFilters);
    setCurrentPage(1);
    
    // Perform search with new filters
    performSearch(newFilters, false, activeTab);
  };

  const handleTabChange = (tab) => {
    // Reset to page 1 when tab changes and update tab in URL
    const url = new URL(window.location);
    url.searchParams.set('page', 1);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url);
    
    setActiveTab(tab);
    
    // Reset view type to grid when switching to buildings tab
    if (tab === 'buildings' && (viewType === 'map' || viewType === 'mixed')) {
      setViewType('grid');
    }
    
    const newFilters = {
      ...searchFilters,
      tab: tab,
      page: 1
    };
    setSearchFilters(newFilters);
    setCurrentPage(1);
    
    // Perform search with new tab
    performSearch(newFilters, false, tab);
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    
    // Reset page to 1 for new search and update URL
    const url = new URL(window.location);
    url.searchParams.set('page', 1);
    window.history.pushState({}, '', url);
    
    const newFilters = { ...searchFilters, page: 1 };
    setSearchFilters(newFilters);
    setCurrentPage(1);
    performSearch(newFilters, true, activeTab);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > lastPage || page === currentPage) return;
    
    // Update URL with new page number
    const url = new URL(window.location);
    url.searchParams.set('page', page);
    window.history.pushState({}, '', url);
    
    const newFilters = { ...searchFilters, page };
    setSearchFilters(newFilters);
    setCurrentPage(page);
    performSearch(newFilters, false, activeTab);
    
    // Scroll to top of results smoothly
    const resultsSection = document.querySelector('.property-listing-section');
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSaveSearch = async () => {
    // Check if user is authenticated
    if (!auth?.user) {
      // Show login modal instead of saving
      setShowLoginModal(true);
      return;
    }

    // Generate a default name for the search based on filters
    const filters = [];
    if (searchFilters.status) filters.push(searchFilters.status);
    if (searchFilters.price_min || searchFilters.price_max) {
      filters.push(`$${(searchFilters.price_min || 0).toLocaleString()}-$${(searchFilters.price_max || 10000000).toLocaleString()}`);
    }
    if (searchFilters.bedrooms) filters.push(`${searchFilters.bedrooms}+ beds`);

    const searchName = filters.length > 0
      ? filters.join(', ')
      : `Search - ${new Date().toLocaleDateString()}`;

    const saveData = {
      name: searchName,
      search_params: searchFilters,
      email_alerts: false
    };

    try {
      const response = await fetch('/api/save-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken()
        },
        body: JSON.stringify(saveData)
      });

      // Check if response is HTML (likely a redirect to login)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        // User is not authenticated - show login modal
        setShowLoginModal(true);
        return;
      }

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to save searches');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Show success message briefly
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successMsg.innerHTML = '<span class="flex items-center gap-2">✓ Search saved successfully!</span>';
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
          successMsg.style.transition = 'opacity 0.3s';
          successMsg.style.opacity = '0';
          setTimeout(() => successMsg.remove(), 300);
        }, 2500);
      } else {
        throw new Error(result.message || 'Failed to save search');
      }
    } catch (error) {
      console.error('Save search error:', error);
      
      // Show error message
      const errorMsg = document.createElement('div');
      errorMsg.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      errorMsg.innerHTML = `<span class="flex items-center gap-2">❌ ${error.message || 'Failed to save search'}</span>`;
      document.body.appendChild(errorMsg);
      
      setTimeout(() => {
        errorMsg.style.transition = 'opacity 0.3s';
        errorMsg.style.opacity = '0';
        setTimeout(() => errorMsg.remove(), 300);
      }, 3000);
    }
  };

  // Format property data for PropertyCardV5
  const formatPropertyForCard = (property) => {
    // Debug: Log raw property to see what fields are available
    if (property.ListingKey === 'C12373183') {
      console.log('🔍 Raw property from API:', property);
    }
    
    // Get image from lazy loaded cache if available
    const cachedImage = propertyImages[property.ListingKey];
    let imageUrl = property.MediaURL; // Use MediaURL from initial response
    
    // Override with cached image if it's available and valid
    if (cachedImage && cachedImage.image_url) {
      imageUrl = cachedImage.image_url;
    }
    
    return {
      id: property.ListingKey,
      listingKey: property.ListingKey,
      ListingKey: property.ListingKey,  // Include both cases
      price: property.ListPrice,
      bedrooms: property.BedroomsTotal,
      bathrooms: property.BathroomsTotalInteger,
      sqft: property.LivingAreaRange || property.AboveGradeFinishedArea || 0,
      parking: property.ParkingTotal,
      address: property.UnparsedAddress,
      propertyType: property.PropertySubType,
      PropertySubType: property.PropertySubType,  // Include both cases
      transactionType: property.TransactionType,
      TransactionType: property.TransactionType,  // Include both cases
      StandardStatus: property.StandardStatus,     // IMPORTANT: Include StandardStatus
      MlsStatus: property.MlsStatus,              // IMPORTANT: Include MlsStatus
      formatted_status: property.formatted_status, // IMPORTANT: Include formatted_status
      city: property.City,
      province: property.StateOrProvince,
      source: 'mls',
      imageUrl: imageUrl, // Will be updated via lazy loading
      images: cachedImage?.all_images || property.Images || [],
      isImageLoading: isImageLoading(property.ListingKey),
      // Add all MLS fields needed for formatters (both cases for compatibility)
      UnitNumber: property.UnitNumber,
      unitNumber: property.UnitNumber,
      StreetNumber: property.StreetNumber,
      streetNumber: property.StreetNumber,
      StreetName: property.StreetName,
      streetName: property.StreetName,
      StreetSuffix: property.StreetSuffix,
      streetSuffix: property.StreetSuffix,
      LivingAreaRange: property.LivingAreaRange,
      livingAreaRange: property.LivingAreaRange,
      LivingArea: property.LivingArea,
      livingArea: property.LivingArea,
      BuildingAreaTotal: property.BuildingAreaTotal || property.AboveGradeFinishedArea,
      buildingAreaTotal: property.BuildingAreaTotal || property.AboveGradeFinishedArea,
      AboveGradeFinishedArea: property.AboveGradeFinishedArea,
      ParkingSpaces: property.ParkingSpaces,
      parkingSpaces: property.ParkingSpaces,
      ParkingTotal: property.ParkingTotal,
      parkingTotal: property.ParkingTotal,
      ListOfficeName: property.ListOfficeName,
      listOfficeName: property.ListOfficeName,
      BedroomsTotal: property.BedroomsTotal,
      bedroomsTotal: property.BedroomsTotal,
      BathroomsTotalInteger: property.BathroomsTotalInteger,
      bathroomsTotalInteger: property.BathroomsTotalInteger
    };
  };

  // Format building data for PropertyCardV5
  const formatBuildingForCard = (building) => {
    console.log('🏢 Formatting building for card:', building); // Debug log
    console.log('🏢 Building for URL generation:', {
      id: building.id,
      name: building.name,
      address: building.address,
      city: building.city
    });
    
    return {
      id: building.id,
      listingKey: building.id,
      price: building.price_range || 'Price on Request',
      bedrooms: building.total_units ? `${building.total_units} Units` : null,
      bathrooms: building.floors ? `${building.floors} Floors` : null,
      sqft: building.year_built ? `Built ${building.year_built}` : null,
      parking: building.parking_spots || null,
      address: building.address,
      propertyType: building.name || building.building_type || 'Building', // Show building name as property type
      transactionType: building.listing_type || 'For Sale',
      city: building.city,
      province: building.province,
      source: 'building',
      imageUrl: building.main_image || '/images/no-image-placeholder.jpg',
      images: building.images || [],
      isImageLoading: false,
      // Additional building-specific data
      developer: building.developer?.name || null,
      totalUnits: building.total_units,
      floors: building.floors,
      status: building.status,
      // Map coordinates for building markers (ensure proper case)
      Latitude: building.latitude || building.Latitude,
      Longitude: building.longitude || building.Longitude,
      // Building name for map labels - make sure it's available
      name: building.name,
      building_name: building.name // Additional fallback
    };
  };


  return (
    <MainLayout siteName={siteName} siteUrl={siteUrl} year={year} website={website} auth={auth} noPadding={true} blueHeader={true}>
        <Head title={`Property Search - ${siteName}`} />
        <div className="enhanced-property-search">
        

        <div className="max-w-[1280px] mx-auto px-4 md:px-0">
          {/* OLD Mobile Search Filters - REPLACED BY SearchBar Component */}
          {false && (
          <div className="md:hidden mb-6">
            <div className="bg-[#F5F5F5] p-4 rounded-lg">
              {/* Mobile Search Bar */}
              <div className="flex gap-2 mb-4">
                <div className="flex-1 bg-white rounded-xl p-3">
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchFilters.query}
                    onChange={(e) => handleFilterChange('query', e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch(e);
                      }
                    }}
                    className="w-full font-work-sans font-bold text-sm text-[#1C1463] bg-transparent border-none outline-none focus:ring-0 focus:border-none placeholder:font-bold placeholder:text-[#1C1463]"
                  />
                </div>
                <button 
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="bg-black p-3 rounded-xl disabled:opacity-50"
                >
                  <SearchIcon className="w-[18px] h-[19px] text-white" />
                </button>
              </div>
              
              {/* Mobile Filter Pills */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                <div className="relative bg-white rounded-lg">
                  <select
                    value={searchFilters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="px-3 py-2 pr-8 font-work-sans font-bold text-sm text-[#293056] bg-transparent border-none outline-none whitespace-nowrap appearance-none"
                    style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                  >
                    <option value="For Sale">For Sale</option>
                    <option value="For Rent">For Rent</option>
                    <option value="Sold">Sold</option>
                    <option value="Leased">Leased</option>
                  </select>
                  {/* Removed ChevronDownIcon - icon is being displayed from elsewhere */}
                </div>
                
                <div className="relative bg-white rounded-lg">
                  <select
                    value={activeTab === 'buildings' ? (searchFilters.floors || 0) : searchFilters.bedrooms}
                    onChange={(e) => handleFilterChange(activeTab === 'buildings' ? 'floors' : 'bedrooms', e.target.value)}
                    className="px-3 py-2 pr-8 font-work-sans font-bold text-sm text-[#293056] bg-transparent border-none outline-none whitespace-nowrap appearance-none"
                    style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                  >
                    <option value="0">{activeTab === 'buildings' ? 'Floors' : 'Bed type'}</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    {activeTab === 'buildings' && (
                      <>
                        <option value="5">5+</option>
                        <option value="10">10+</option>
                        <option value="20">20+</option>
                      </>
                    )}
                  </select>
                  {/* Removed ChevronDownIcon - icon is being displayed from elsewhere */}
                </div>
              </div>
              
              {/* Mobile Price Range */}
              <div className="mt-4">
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min price"
                    value={searchFilters.price_min || ''}
                    onChange={(e) => handleFilterChange('price_min', parseInt(e.target.value) || 0)}
                    className="flex-1 bg-white px-3 py-2 rounded-lg text-xs font-work-sans text-black border border-[#293056] outline-none"
                  />
                  <span className="text-[#293056] text-xs font-work-sans py-2">to</span>
                  <input
                    type="number"
                    placeholder="Max price"
                    value={searchFilters.price_max || ''}
                    onChange={(e) => handleFilterChange('price_max', parseInt(e.target.value) || 0)}
                    className="flex-1 bg-white px-3 py-2 rounded-lg text-xs font-work-sans text-black border border-[#293056] outline-none"
                  />
                </div>
                
                {/* Mobile Price Slider - Functional Dual Handle */}
                <div className="relative w-full h-5 mt-3">
                  {/* Background track */}
                  <div className="absolute left-0 right-0 top-[45%] h-[2px] bg-gray-200 rounded-full"></div>
                  
                  {/* Active track */}
                  <div 
                    className="absolute top-[45%] h-[2px] bg-[#293056] rounded-full"
                    style={{
                      left: `${Math.max(0, Math.min(100, (searchFilters.price_min || 0) / 10000000 * 100))}%`,
                      right: `${Math.max(0, Math.min(100, 100 - (searchFilters.price_max || 10000000) / 10000000 * 100))}%`
                    }}
                  ></div>
                  
                  {/* Min thumb - LEFT handle for minimum price (draggable) */}
                  <div 
                    className="absolute top-[0.95px] w-[20px] h-[19px] bg-white border border-[#293056] rounded-full cursor-pointer flex items-center justify-center"
                    style={{
                      left: `calc(${Math.max(0, Math.min(100, (searchFilters.price_min || 0) / 10000000 * 100))}% - 10px)`,
                      zIndex: 25
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      const slider = e.currentTarget.parentElement;
                      const rect = slider.getBoundingClientRect();
                      const touch = e.touches[0];
                      
                      const handleDrag = (event) => {
                        const currentTouch = event.touches[0];
                        const percentage = Math.max(0, Math.min(100, ((currentTouch.clientX - rect.left) / rect.width) * 100));
                        const value = Math.round((percentage / 100) * 10000000 / 50000) * 50000;
                        const maxValue = searchFilters.price_max || 10000000;
                        
                        if (value < maxValue) {
                          handleFilterChange('price_min', value);
                        }
                      };
                      
                      const handleRelease = () => {
                        document.removeEventListener('touchmove', handleDrag);
                        document.removeEventListener('touchend', handleRelease);
                      };
                      
                      document.addEventListener('touchmove', handleDrag);
                      document.addEventListener('touchend', handleRelease);
                    }}
                  >
                    <div className="w-[7px] h-[7px] bg-[#293056] rounded-full"></div>
                  </div>
                  
                  {/* Max thumb - RIGHT handle for maximum price (draggable) */}
                  <div 
                    className="absolute top-0 w-[20px] h-[19px] bg-white border border-[#293056] rounded-full cursor-pointer flex items-center justify-center"
                    style={{
                      left: `calc(${Math.max(0, Math.min(100, (searchFilters.price_max || 10000000) / 10000000 * 100))}% - 10px)`,
                      zIndex: 25
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      const slider = e.currentTarget.parentElement;
                      const rect = slider.getBoundingClientRect();
                      const touch = e.touches[0];
                      
                      const handleDrag = (event) => {
                        const currentTouch = event.touches[0];
                        const percentage = Math.max(0, Math.min(100, ((currentTouch.clientX - rect.left) / rect.width) * 100));
                        const value = Math.round((percentage / 100) * 10000000 / 50000) * 50000;
                        const minValue = searchFilters.price_min || 0;
                        
                        if (value > minValue) {
                          handleFilterChange('price_max', value);
                        }
                      };
                      
                      const handleRelease = () => {
                        document.removeEventListener('touchmove', handleDrag);
                        document.removeEventListener('touchend', handleRelease);
                      };
                      
                      document.addEventListener('touchmove', handleDrag);
                      document.addEventListener('touchend', handleRelease);
                    }}
                  >
                    <div className="w-[7px] h-[7px] bg-[#293056] rounded-full"></div>
                  </div>
                </div>
              </div>
              
              {/* Mobile Save Search */}
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={handleSaveSearch}
                  className="flex-1 bg-white px-4 py-2 rounded-lg font-work-sans font-bold text-sm text-[#293056] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <SaveIcon className="w-4 h-4" />
                  Save search
                </button>
              </div>
            </div>
          </div>
          )}

          {/* Search Bar Component - Replaces both Mobile and Desktop Search Filters */}
          <div className="my-6">
            <IDXAmpreSearchBar
              isAuthenticated={!!auth?.user}
              initialValues={{
                location: searchFilters.query || '',
                propertyType: searchFilters.status || 'For Sale',
                propertySubType: searchFilters.property_type && searchFilters.property_type.length > 0 ? searchFilters.property_type[0] : '',
                bedrooms: String(searchFilters.bedrooms || '0'),
                bathrooms: String(searchFilters.bathrooms || '0'),
                minPrice: searchFilters.price_min || 0,
                maxPrice: searchFilters.price_max || 10000000,
                searchType: urlParams.get('search_type') || 'global',
              }}
              onSearch={(searchData) => {
                setSearchFilters(prev => ({
                  ...prev,
                  query: searchData.location,
                  status: searchData.propertyStatus || searchData.propertyType, // Use property_status if set, otherwise property_type
                  property_status: searchData.propertyStatus || '', // New field for Sold/Leased
                  property_type: searchData.propertySubType ? [searchData.propertySubType] : [],
                  bedrooms: parseInt(searchData.bedrooms) || 0,
                  bathrooms: parseInt(searchData.bathrooms) || 0,
                  price_min: searchData.minPrice,
                  price_max: searchData.maxPrice,
                  search_type: searchData.searchType || 'street',
                  sort: searchData.sortBy || 'newest',
                  page: 1
                }));
                performSearch({
                  ...searchFilters,
                  query: searchData.location,
                  status: searchData.propertyStatus || searchData.propertyType, // Use property_status if set, otherwise property_type
                  property_status: searchData.propertyStatus || '', // New field for Sold/Leased
                  property_type: searchData.propertySubType ? [searchData.propertySubType] : [],
                  bedrooms: parseInt(searchData.bedrooms) || 0,
                  bathrooms: parseInt(searchData.bathrooms) || 0,
                  price_min: searchData.minPrice,
                  price_max: searchData.maxPrice,
                  search_type: searchData.searchType || 'street',
                  sort: searchData.sortBy || 'newest',
                  page: 1
                }, true, activeTab);
              }}
              onSaveSearch={handleSaveSearch}
            />
          </div>

          {/* OLD Desktop Search Filters Header - REPLACED BY SearchBar Component Above */}
          {false && (
          <div className="hidden md:block mb-6">
            <div className="bg-[#F5F5F5] px-4 py-3 h-[75px] flex items-center">
              <div className="w-full max-w-[1248px] mx-auto flex items-center justify-between">
                {/* Left Side - Search and Filters */}
                <div className="flex items-center gap-8">
                  {/* Search Bar */}
                  <div className="flex items-center bg-white rounded-xl w-[324px] h-12">
                    <div className="flex items-center justify-between w-full px-1">
                      <div className="flex items-center px-4 flex-1">
                        <input
                          type="text"
                          placeholder="Search"
                          value={searchFilters.query}
                          onChange={(e) => handleFilterChange('query', e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSearch(e);
                            }
                          }}
                          className="w-full font-work-sans font-bold text-sm text-[#1C1463] bg-transparent border-none outline-none focus:ring-0 focus:border-none placeholder-[#1C1463] placeholder:font-bold"
                        />
                      </div>
                      <button 
                        onClick={handleSearch}
                        disabled={isLoading}
                        className="flex items-center justify-center w-10 h-10 bg-black rounded-xl mr-1 disabled:opacity-50"
                      >
                        <SearchIcon className="w-6 h-6 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center bg-white rounded-lg w-[99px] h-10 relative">
                    <select
                      value={searchFilters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full h-full px-3 font-work-sans font-bold text-sm text-[#293056] bg-transparent border-none outline-none appearance-none cursor-pointer"
                      style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                    >
                      <option value="For Sale">For Sale</option>
                      <option value="For Rent">For Rent</option>
                      <option value="Sold">Sold</option>
                      <option value="Leased">Leased</option>
                    </select>
                    {/* Removed ChevronDownIcon - icon is being displayed from elsewhere */}
                  </div>

                  {/* Bed Type/Floors Dropdown */}
                  <div className="flex items-center bg-white rounded-lg w-[105px] h-10 relative">
                    <select
                      value={activeTab === 'buildings' ? (searchFilters.floors || 0) : searchFilters.bedrooms}
                      onChange={(e) => handleFilterChange(activeTab === 'buildings' ? 'floors' : 'bedrooms', e.target.value)}
                      className="w-full h-full px-3 font-work-sans font-bold text-sm text-[#293056] bg-transparent border-none outline-none appearance-none cursor-pointer"
                      style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                    >
                      <option value="0">{activeTab === 'buildings' ? 'Floors' : 'Bed type'}</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                      <option value="5">5+</option>
                      {activeTab === 'buildings' && (
                        <>
                          <option value="10">10+</option>
                          <option value="20">20+</option>
                          <option value="30">30+</option>
                        </>
                      )}
                    </select>
                    {/* Removed ChevronDownIcon - icon is being displayed from elsewhere */}
                  </div>

                  {/* Price Range */}
                  <div className="flex flex-col w-[286px]">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center justify-center bg-white border border-[#293056] rounded-lg w-[99px] h-[27px]">
                        <input
                          type="number"
                          placeholder="0"
                          value={searchFilters.price_min || ''}
                          onChange={(e) => handleFilterChange('price_min', parseInt(e.target.value) || 0)}
                          className="w-full text-center font-work-sans text-xs text-black bg-transparent border-none outline-none placeholder:text-black"
                        />
                      </div>
                      
                      <span className="font-work-sans text-xs text-[#293056] mx-3">to</span>
                      
                      <div className="flex items-center justify-center bg-white border border-[#293056] rounded-lg w-[99px] h-[27px]">
                        <input
                          type="number"
                          placeholder="No max"
                          value={searchFilters.price_max || ''}
                          onChange={(e) => handleFilterChange('price_max', parseInt(e.target.value) || 0)}
                          className="w-full text-center font-work-sans text-xs text-black bg-transparent border-none outline-none placeholder:text-black"
                        />
                      </div>
                    </div>
                    
                    {/* Price Slider - Functional Dual Handle */}
                    <div className="relative w-full h-5">
                      {/* Background track */}
                      <div className="absolute left-0 right-0 top-[45%] h-[2px] bg-gray-200 rounded-full"></div>
                      
                      {/* Active track */}
                      <div 
                        className="absolute top-[45%] h-[2px] bg-[#293056] rounded-full"
                        style={{
                          left: `${Math.max(0, Math.min(100, (searchFilters.price_min || 0) / 10000000 * 100))}%`,
                          right: `${Math.max(0, Math.min(100, 100 - (searchFilters.price_max || 10000000) / 10000000 * 100))}%`
                        }}
                      ></div>
                      
                      {/* Container for both range inputs with proper z-index handling */}
                      <div className="absolute w-full h-full">
                        {/* Min price input - LEFT slider */}
                        <input
                          type="range"
                          min="0"
                          max="10000000"
                          step="50000"
                          value={searchFilters.price_min || 0}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            const maxValue = searchFilters.price_max || 10000000;
                            // Only update if not crossing over max
                            if (value < maxValue) {
                              handleFilterChange('price_min', value);
                            }
                          }}
                          className="absolute w-full h-full opacity-0 cursor-pointer"
                          style={{ 
                            pointerEvents: 'none'
                          }}
                        />
                        
                        {/* Max price input - RIGHT slider */}
                        <input
                          type="range"
                          min="0"
                          max="10000000"
                          step="50000"
                          value={searchFilters.price_max || 10000000}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            const minValue = searchFilters.price_min || 0;
                            // Only update if not crossing under min
                            if (value > minValue) {
                              handleFilterChange('price_max', value);
                            }
                          }}
                          className="absolute w-full h-full opacity-0 cursor-pointer"
                          style={{ 
                            pointerEvents: 'none'
                          }}
                        />
                      </div>
                      
                      {/* Min thumb - LEFT handle for minimum price (draggable) */}
                      <div 
                        className="absolute top-[0.95px] w-[20px] h-[19px] bg-white border border-[#293056] rounded-full cursor-pointer flex items-center justify-center"
                        style={{
                          left: `calc(${Math.max(0, Math.min(100, (searchFilters.price_min || 0) / 10000000 * 100))}% - 10px)`,
                          zIndex: 25,
                          pointerEvents: 'auto'
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          const slider = e.currentTarget.parentElement;
                          const rect = slider.getBoundingClientRect();
                          
                          const handleDrag = (event) => {
                            const clientX = event.type.includes('touch') ? event.touches[0].clientX : event.clientX;
                            const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
                            const value = Math.round((percentage / 100) * 10000000 / 50000) * 50000;
                            const maxValue = searchFilters.price_max || 10000000;
                            
                            if (value < maxValue) {
                              handleFilterChange('price_min', value);
                            }
                          };
                          
                          const handleRelease = () => {
                            document.removeEventListener('mousemove', handleDrag);
                            document.removeEventListener('mouseup', handleRelease);
                            document.removeEventListener('touchmove', handleDrag);
                            document.removeEventListener('touchend', handleRelease);
                          };
                          
                          document.addEventListener('mousemove', handleDrag);
                          document.addEventListener('mouseup', handleRelease);
                        }}
                        onTouchStart={(e) => {
                          const touch = e.touches[0];
                          const mouseEvent = new MouseEvent('mousedown', {
                            clientX: touch.clientX,
                            clientY: touch.clientY
                          });
                          e.currentTarget.dispatchEvent(mouseEvent);
                        }}
                      >
                        <div className="w-[7px] h-[7px] bg-[#293056] rounded-full"></div>
                      </div>
                      
                      {/* Max thumb - RIGHT handle for maximum price (draggable) */}
                      <div 
                        className="absolute top-0 w-[20px] h-[19px] bg-white border border-[#293056] rounded-full cursor-pointer flex items-center justify-center"
                        style={{
                          left: `calc(${Math.max(0, Math.min(100, (searchFilters.price_max || 10000000) / 10000000 * 100))}% - 10px)`,
                          zIndex: 25,
                          pointerEvents: 'auto'
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          const slider = e.currentTarget.parentElement;
                          const rect = slider.getBoundingClientRect();
                          
                          const handleDrag = (event) => {
                            const clientX = event.type.includes('touch') ? event.touches[0].clientX : event.clientX;
                            const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
                            const value = Math.round((percentage / 100) * 10000000 / 50000) * 50000;
                            const minValue = searchFilters.price_min || 0;
                            
                            if (value > minValue) {
                              handleFilterChange('price_max', value);
                            }
                          };
                          
                          const handleRelease = () => {
                            document.removeEventListener('mousemove', handleDrag);
                            document.removeEventListener('mouseup', handleRelease);
                            document.removeEventListener('touchmove', handleDrag);
                            document.removeEventListener('touchend', handleRelease);
                          };
                          
                          document.addEventListener('mousemove', handleDrag);
                          document.addEventListener('mouseup', handleRelease);
                        }}
                        onTouchStart={(e) => {
                          const touch = e.touches[0];
                          const mouseEvent = new MouseEvent('mousedown', {
                            clientX: touch.clientX,
                            clientY: touch.clientY
                          });
                          e.currentTarget.dispatchEvent(mouseEvent);
                        }}
                      >
                        <div className="w-[7px] h-[7px] bg-[#293056] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Save Search */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleSaveSearch}
                    className="flex items-center justify-center bg-white rounded-lg px-4 py-2 w-[120px] h-12 hover:bg-gray-50 transition-colors whitespace-nowrap gap-2"
                  >
                    <SaveIcon className="w-4 h-4 text-[#293056]" />
                    <span className="font-work-sans font-bold text-sm text-[#293056]">Save search</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Loading Indicator - removed from here, now shown inside content area */}

          {/* Property Listing Section */}
          <div className="py-8">
            {/* Header Section */}
            <div className="mb-8">
              {/* Main Heading */}
              <h1 className="font-space-grotesk font-bold text-[40px] leading-[50px] tracking-[-0.03em] text-black mb-6">
                {activeTab === 'listings'
                  ? (searchFilters.property_status === 'Sold' ? 'Sold Properties' :
                     searchFilters.property_status === 'Leased' ? 'Leased Properties' :
                     searchFilters.status === 'For Rent' ? 'Properties For Rent' :
                     searchFilters.status === 'For Sale' ? 'Properties For Sale' :
                     'Property Listings')
                  : 'Buildings'}
              </h1>
              
              {/* Navigation and Controls */}
              <div className="flex items-center justify-between">
                {/* Left: Listing and Buildings Tabs */}
                <div className="flex items-center">
                  {/* Listing Tab */}
                  <button
                    onClick={() => handleTabChange('listings')}
                    className={`flex flex-row justify-center items-center px-[10px] py-[10px] gap-[10px] w-[168px] h-[50px] ${
                      activeTab === 'listings' ? 'border-b border-[#252B37]' : ''
                    } box-border`}
                  >
                    <span className={`w-[148px] h-[30px] font-red-hat-display font-bold text-[20px] leading-[30px] flex items-center gap-2 tracking-[-0.03em] ${
                      activeTab === 'listings' ? 'text-[#252B37]' : 'text-gray-400'
                    }`}>
                      Listings {total > 0 && activeTab === 'listings' && (
                        <span className="inline-flex items-center justify-center px-2 py-0.5 text-sm font-bold text-white bg-[#293056] rounded-full min-w-[28px]">
                          {total.toLocaleString()}
                        </span>
                      )}
                    </span>
                  </button>
                  
                  {/* Buildings Tab */}
                  <button
                    onClick={() => handleTabChange('buildings')}
                    className={`flex flex-row justify-center items-center px-[10px] py-[10px] gap-[10px] w-[120px] h-[50px] ${
                      activeTab === 'buildings' ? 'border-b border-[#252B37]' : ''
                    }`}
                  >
                    <span className={`font-red-hat-display font-bold text-[20px] leading-[30px] flex items-center gap-2 tracking-[-0.03em] ${
                      activeTab === 'buildings' ? 'text-[#252B37]' : 'text-gray-400'
                    }`}>
                      Buildings {total > 0 && activeTab === 'buildings' && (
                        <span className="inline-flex items-center justify-center px-2 py-0.5 text-sm font-bold text-white bg-[#293056] rounded-full min-w-[28px]">
                          {total.toLocaleString()}
                        </span>
                      )}
                    </span>
                  </button>
                </div>
                
                {/* Right: View Controls and Sort */}
                <div className="flex items-center gap-4">
                  {/* View Type Controls - Only show map/mixed for listings, not buildings */}
                  {activeTab === 'listings' ? (
                    <div className="flex items-center bg-white border border-black rounded-lg p-1">
                      <button
                        onClick={() => setViewType('grid')}
                        className={`p-2 rounded ${viewType === 'grid' ? 'bg-[#293056] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        title="Grid View"
                      >
                        <GridIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setViewType('mixed')}
                        className={`p-2 rounded ${viewType === 'mixed' ? 'bg-[#293056] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        title="Mixed View"
                      >
                        <MixedIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setViewType('map')}
                        className={`p-2 rounded ${viewType === 'map' ? 'bg-[#293056] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        title="Map View"
                      >
                        <MapIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    // For buildings tab, only show grid view
                    <div className="flex items-center bg-white border border-black rounded-lg p-1">
                      <button
                        className="p-2 rounded bg-[#293056] text-white"
                        title="Grid View"
                      >
                        <GridIcon className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  {/* Sort Control */}
                  <div className="flex items-center gap-4">
                    {/* Sort Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowSortDropdown(!showSortDropdown)}
                        className="flex flex-row justify-center items-center px-4 py-2 gap-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 bg-white transition-colors"
                      >
                        <span className="font-work-sans font-medium text-base leading-[25px] flex items-center text-center tracking-[-0.03em] text-black">
                          Sort
                        </span>
                        <div className="w-4 h-4">
                          <ChevronDownIcon className="w-4 h-4 text-black" />
                        </div>
                      </button>
                      
                      {/* Sort Dropdown Menu */}
                      {showSortDropdown && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-xl z-50">
                          <button
                            onClick={() => {
                              setSearchFilters(prev => ({ ...prev, sort: 'newest' }));
                              setShowSortDropdown(false);
                              performSearch({ ...searchFilters, sort: 'newest' }, false, activeTab);
                            }}
                            className={`w-full px-4 py-2 text-left hover:bg-gray-100 rounded-t-lg ${
                              searchFilters.sort === 'newest' ? 'bg-[#912018] text-white' : ''
                            }`}
                          >
                            Newest First
                          </button>
                          <button
                            onClick={() => {
                              setSearchFilters(prev => ({ ...prev, sort: 'price-high' }));
                              setShowSortDropdown(false);
                              performSearch({ ...searchFilters, sort: 'price-high' }, false, activeTab);
                            }}
                            className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${
                              searchFilters.sort === 'price-high' ? 'bg-[#912018] text-white' : ''
                            }`}
                          >
                            Price: High to Low
                          </button>
                          <button
                            onClick={() => {
                              setSearchFilters(prev => ({ ...prev, sort: 'price-low' }));
                              setShowSortDropdown(false);
                              performSearch({ ...searchFilters, sort: 'price-low' }, false, activeTab);
                            }}
                            className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${
                              searchFilters.sort === 'price-low' ? 'bg-[#912018] text-white' : ''
                            }`}
                          >
                            Price: Low to High
                          </button>
                          <button
                            onClick={() => {
                              setSearchFilters(prev => ({ ...prev, sort: 'bedrooms' }));
                              setShowSortDropdown(false);
                              performSearch({ ...searchFilters, sort: 'bedrooms' }, false, activeTab);
                            }}
                            className={`w-full px-4 py-2 text-left hover:bg-gray-100 rounded-b-lg ${
                              searchFilters.sort === 'bedrooms' ? 'bg-[#912018] text-white' : ''
                            }`}
                          >
                            Bedrooms: Most First
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Content Area */}
            {isLoading ? (
              // Centered loader in the property listings area
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="inline-block w-12 h-12 border-3 border-[#293056] border-t-transparent rounded-full animate-spin mb-4"></div>
                  <div className="text-[#293056] text-lg font-medium">Loading properties...</div>
                </div>
              </div>
            ) : viewType === 'map' ? (
              // Full Map View with viewport-aware loading
              <ViewportAwarePropertyMap
                properties={activeTab === 'listings' ? mapProperties : buildings}
                className="w-full h-[600px]"
                onPropertyClick={(property) => {
                  // Don't navigate directly - let the info window handle it
                  console.log('Property clicked:', property.ListingKey || property.id);
                }}
                viewType="full"
                searchFilters={searchFilters}
                isLoading={isLoading}
                activeTab={activeTab}
                onViewportChange={(newViewportProperties, bounds) => {
                  console.log(`Loaded ${newViewportProperties.length} properties for viewport`, bounds);
                  // Replace all properties with new viewport properties
                  setViewportProperties(newViewportProperties);
                  setShowViewportProperties(true);
                }}
              />
            ) : viewType === 'mixed' ? (
              // Enhanced Mixed View - IDX-AMPRE style split layout with two cards per row
              <div className="flex h-[calc(100vh-300px)] min-h-[700px] bg-white rounded-lg shadow-sm border overflow-hidden" 
                   style={{ fontFamily: "'Work Sans', sans-serif" }}>
                {/* Left side - Property Cards with enhanced scrolling - IDX-AMPRE style */}
                <div className="flex-1 flex flex-col border-r border-gray-200">
                  {/* Properties section header - IDX-AMPRE style */}
                  <div className="flex-shrink-0 px-6 py-4 bg-white border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg text-gray-900">
                        {activeTab === 'listings' ? 
                          (showViewportProperties && viewportProperties.length > 0 ? 'Area Properties' : 'Properties for Sale') : 
                          'Buildings'}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600">
                          {activeTab === 'listings' ? 
                            (showViewportProperties && viewportProperties.length > 0 ? viewportProperties.length : properties.length) : 
                            buildings.length} results
                        </span>
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Scrollable cards area - IDX-AMPRE style with two cards per row */}
                  <div className="flex-1 overflow-y-auto p-4 mixed-view-scroll">
                    {isLoading ? (
                      // Loader for mixed view left panel
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="inline-block w-10 h-10 border-3 border-[#293056] border-t-transparent rounded-full animate-spin mb-3"></div>
                          <div className="text-[#293056] text-sm">Loading...</div>
                        </div>
                      </div>
                    ) : activeTab === 'listings' ? (
                      // Show viewport properties if available, otherwise show search results
                      (showViewportProperties && viewportProperties.length > 0 ? viewportProperties : properties).length > 0 ? (
                        <div className="idx-ampre-mixed-grid">
                          {(showViewportProperties && viewportProperties.length > 0 ? viewportProperties : properties).map((property) => {
                            const formattedProperty = formatPropertyForCard(property);
                            // Use PropertyCardV5 directly if we already have an image
                            if (formattedProperty.imageUrl) {
                              return (
                                <PropertyCardV5
                                key={property.ListingKey}
                                property={formattedProperty}
                                size="grid"
                                onClick={(property) => {
                                window.location.href = generatePropertyUrl(property);
                                }}
                                className={`w-full transition-all duration-300 ${
                                    activeProperty === property.ListingKey ? 'scale-[1.02] z-10' : ''
                                  }`}
                                />
                              );
                            }
                            // Use LazyPropertyCard for properties without images
                            return (
                              <LazyPropertyCard
                                key={property.ListingKey}
                                property={formattedProperty}
                                size="mobile"
                                observeElement={observeElement}
                                onMouseEnter={() => handlePropertyHover(property.ListingKey)}
                                onMouseLeave={() => handlePropertyHover(null)}
                                onClick={(property) => {
                                  window.location.href = `/property/${property.listingKey}`;
                                }}
                                className={`w-full transition-all duration-300 ${
                                  activeProperty === property.ListingKey ? 'scale-[1.02] z-10' : ''
                                }`}
                              />
                            );
                          })
                        }</div>
                      ) : (
                        <div className="text-center py-16">
                          <div className="mb-4">
                            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div className="text-gray-600 text-xl font-semibold mb-2">No properties found</div>
                          <p className="text-gray-500">Try adjusting your search filters to see more results</p>
                        </div>
                      )
                    ) : (
                      buildings && buildings.length > 0 ? (
                        <div className="idx-ampre-mixed-grid">
                          {buildings.map((building) => {
                            const formattedBuilding = formatBuildingForCard(building);
                            return (
                              <PropertyCardV5
                                key={building.id}
                                property={formattedBuilding}
                                size="grid"
                                onClick={() => {
                                window.location.href = createSEOBuildingUrl(building);
                                }}
                                className={`w-full transition-all duration-300 ${
                                  activeProperty === building.id ? 'scale-[1.02] z-10' : ''
                                }`}
                              />
                            );
                          })
                        }</div>
                      ) : (
                        <div className="text-center py-16">
                          <div className="mb-4">
                            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div className="text-gray-600 text-xl font-semibold mb-2">No buildings found</div>
                          <p className="text-gray-500">Try adjusting your search filters to see more results</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
                
                {/* Right side - Enhanced Map with viewport loading - IDX-AMPRE style */}
                <div className="flex-shrink-0 flex flex-col bg-gray-50" style={{ width: '600px' }}>
                  <ViewportAwarePropertyMap
                    properties={activeTab === 'listings' ? mapProperties : buildings}
                    className="w-full h-full"
                    onPropertyClick={(property) => {
                      // Don't navigate directly - let the info window handle it
                      console.log('Property clicked:', property.ListingKey);
                    }}
                    viewType="mixed"
                    searchFilters={searchFilters}
                    isLoading={isLoading}
                    activeTab={activeTab}
                    onViewportChange={(newViewportProperties, bounds) => {
                      console.log(`Loaded ${newViewportProperties.length} properties for viewport`, bounds);
                      // Replace all properties with new viewport properties in the left grid
                      setViewportProperties(newViewportProperties);
                      setShowViewportProperties(true);
                    }}
                  />
                </div>
              </div>
            ) : (
              // Grid View - IDX-AMPRE style 4 cards per row like the plugin
              <div>
                {activeTab === 'listings' ? (
                  // Property Cards - 4 per row IDX-AMPRE style with lazy loading
                  properties && properties.length > 0 ? (
                    <div className="idx-ampre-grid">
                      {properties.map((property) => {
                        const formattedProperty = formatPropertyForCard(property);
                        // Use PropertyCardV5 directly if we already have an image
                        if (formattedProperty.imageUrl) {
                          return (
                            <PropertyCardV5
                              key={property.ListingKey}
                              property={formattedProperty}
                              size="default"
                              onClick={(property) => {
                                window.location.href = `/property/${property.listingKey}`;
                              }}
                              className=""
                            />
                          );
                        }
                        // Use LazyPropertyCard for properties without images
                        return (
                          <LazyPropertyCard
                            key={property.ListingKey}
                            property={formattedProperty}
                            size="default"
                            observeElement={observeElement}
                            onMouseEnter={() => handlePropertyHover(property.ListingKey)}
                            onMouseLeave={() => handlePropertyHover(null)}
                            onClick={(property) => {
                              window.location.href = generatePropertyUrl(property);
                            }}
                            className=""
                          />
                        );
                      })
                    }</div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-500 text-lg">No properties found</div>
                      <p className="text-gray-400 mt-2">Try adjusting your search filters</p>
                    </div>
                  )
                ) : (
                  // Building Cards - using same PropertyCardV5 as properties
                  buildings && buildings.length > 0 ? (
                    <div className="idx-ampre-grid">
                      {buildings.map((building) => {
                        const formattedBuilding = formatBuildingForCard(building);
                        return (
                          <PropertyCardV5
                            key={building.id}
                            property={formattedBuilding}
                            size="default"
                            onClick={() => {
                              window.location.href = createSEOBuildingUrl(building);
                            }}
                            className=""
                          />
                        );
                      })
                    }</div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-500 text-lg">No buildings found</div>
                      <p className="text-gray-400 mt-2">Try adjusting your search filters</p>
                    </div>
                  )
                )}
              </div>
            )}
            
            {/* Pagination - IDX-AMPRE style */}
            {total > 16 && (
              <div className="pagination-grid-container mt-12">
                <div className="pagination-wrapper flex justify-center items-center gap-2">
                  {/* Previous Button */}
                  {currentPage > 1 && (
                    <button
                      className="pagination-btn pagination-prev p-2 rounded border border-gray-300 hover:bg-gray-50"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={isLoading}
                      aria-label="Previous page"
                    >
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                      </svg>
                    </button>
                  )}
                  
                  {/* First page if not in range */}
                  {(() => {
                    const paginationRange = 5;
                    const startPage = Math.max(1, currentPage - Math.floor(paginationRange / 2));
                    let endPage = Math.min(lastPage, startPage + paginationRange - 1);
                    
                    // Adjust start_page if we're near the end
                    const adjustedStartPage = endPage - startPage < paginationRange - 1 
                      ? Math.max(1, endPage - paginationRange + 1)
                      : startPage;
                    
                    return (
                      <>
                        {adjustedStartPage > 1 && (
                          <>
                            <button
                              className="pagination-btn px-3 py-2 rounded border border-gray-300 hover:bg-gray-50"
                              onClick={() => handlePageChange(1)}
                              disabled={isLoading}
                            >
                              1
                            </button>
                            {adjustedStartPage > 2 && (
                              <span className="pagination-ellipsis px-2">...</span>
                            )}
                          </>
                        )}
                        
                        {/* Page numbers */}
                        {Array.from({ length: endPage - adjustedStartPage + 1 }, (_, i) => adjustedStartPage + i).map((pageNum) => (
                          <button
                            key={`page-${pageNum}`}
                            className={`pagination-btn px-3 py-2 rounded border ${
                              pageNum === currentPage
                                ? 'bg-[#293056] text-white border-[#293056] active'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                            onClick={() => handlePageChange(pageNum)}
                            disabled={isLoading}
                            aria-current={pageNum === currentPage ? 'page' : undefined}
                          >
                            {pageNum}
                          </button>
                        ))}
                        
                        {/* Last page if not in range */}
                        {endPage < lastPage && (
                          <>
                            {endPage < lastPage - 1 && (
                              <span className="pagination-ellipsis px-2">...</span>
                            )}
                            <button
                              className="pagination-btn px-3 py-2 rounded border border-gray-300 hover:bg-gray-50"
                              onClick={() => handlePageChange(lastPage)}
                              disabled={isLoading}
                            >
                              {lastPage}
                            </button>
                          </>
                        )}
                      </>
                    );
                  })()}
                  
                  {/* Next Button */}
                  {currentPage < lastPage && (
                    <button
                      className="pagination-btn pagination-next p-2 rounded border border-gray-300 hover:bg-gray-50"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={isLoading}
                      aria-label="Next page"
                    >
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                      </svg>
                    </button>
                  )}
                </div>
                
                {/* Page Info */}
                <div className="pagination-info text-center mt-3 text-gray-600">
                  <span>Page {currentPage} of {lastPage}</span>
                  <span className="pagination-separator mx-2">•</span>
                  <span>{total.toLocaleString()} total properties</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Search Modal */}
        </div>

        {/* Login Modal */}
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      </MainLayout>
  );
}
