import React, { useEffect, useRef, useState, useCallback } from 'react';
import SimplePropertyMap from './SimplePropertyMap';
import { debounce } from 'lodash';

const ViewportAwarePropertyMap = ({ 
  properties = [], 
  className = '', 
  onPropertyClick = null,
  onPropertyHover = null,
  viewType = 'full',
  onViewportChange = null, // Callback to fetch new properties
  isLoading = false,
  searchFilters = {},
  activeTab = 'listings' // Add activeTab prop to pass through to SimplePropertyMap
}) => {
  console.log('🗺️ ViewportAwarePropertyMap activeTab:', activeTab, 'Properties count:', properties.length); // Debug log
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [viewportProperties, setViewportProperties] = useState([]);
  const [combinedProperties, setCombinedProperties] = useState(properties);
  const [isFetchingViewport, setIsFetchingViewport] = useState(false);
  const lastBoundsRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  // Get CSRF token
  const getCsrfToken = () => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
  };

  // Fetch properties for current viewport
  const fetchPropertiesForBounds = useCallback(async (bounds) => {
    console.log('fetchPropertiesForBounds called with:', bounds);
    
    if (!bounds) {
      console.log('No bounds provided, skipping fetch');
      return;
    }
    
    // Check if bounds have changed significantly (avoid duplicate calls)
    const boundsKey = `${bounds.north}_${bounds.south}_${bounds.east}_${bounds.west}`;
    if (lastBoundsRef.current === boundsKey) {
      console.log('Bounds unchanged, skipping fetch');
      return;
    }
    lastBoundsRef.current = boundsKey;

    console.log('Starting viewport fetch...');
    setIsFetchingViewport(true);
    
    try {
      // Prepare search params with viewport bounds
      const searchParams = {
        ...searchFilters,
        viewport_bounds: {
          north: bounds.north,
          south: bounds.south,
          east: bounds.east,
          west: bounds.west
        },
        page: 1,
        page_size: 15, // Load only 15 properties at once
        map_search: true // Flag to indicate this is a map-based search
      };

      console.log('Fetching properties for viewport:', bounds);
      console.log('Search params:', searchParams);

      const response = await fetch('/api/property-search-viewport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
          'Accept': 'application/json'
        },
        body: JSON.stringify({ search_params: searchParams })
      });

      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('API Result:', result);
      
      if (result.success) {
        console.log(`Fetched ${result.data.properties.length} properties for viewport`);
        
        const newProperties = result.data.properties || [];
        setViewportProperties(newProperties);
        
        // If callback provided, let parent handle the properties
        if (onViewportChange) {
          onViewportChange(newProperties, bounds);
        }
      } else {
        console.error('Viewport search failed:', result.message);
        setViewportProperties([]);
      }
    } catch (error) {
      console.error('Error fetching viewport properties:', error);
      console.error('Error details:', error.message);
      setViewportProperties([]);
    } finally {
      console.log('Fetch completed, setting isFetchingViewport to false');
      setIsFetchingViewport(false);
    }
  }, [searchFilters, onViewportChange]);

  // Create stable debounced function
  const debouncedFetch = useCallback(
    debounce((bounds) => {
      console.log('Debounced fetch triggered with bounds:', bounds);
      fetchPropertiesForBounds(bounds);
    }, 500), // Wait 500ms after user stops moving the map (reduced for better responsiveness)
    [fetchPropertiesForBounds]
  );

  // Handle map ready event
  const handleMapReady = useCallback((map) => {
    if (!map) return;
    
    console.log('Map instance ready, setting up viewport listeners');
    setMapInstance(map);

    // Listen for map idle event (user stopped moving/zooming)
    const idleListener = map.addListener('idle', () => {
      const bounds = map.getBounds();
      if (!bounds) return;

      const viewportBounds = {
        north: bounds.getNorthEast().lat(),
        south: bounds.getSouthWest().lat(),
        east: bounds.getNorthEast().lng(),
        west: bounds.getSouthWest().lng()
      };

      // Skip the initial load to avoid duplicate fetch
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
        console.log('Skipping initial idle event, but will trigger first fetch');
        // Still trigger the first fetch after a short delay
        setTimeout(() => {
          console.log('Triggering initial viewport fetch');
          debouncedFetch(viewportBounds);
        }, 100);
        return;
      }

      console.log('Map viewport changed:', viewportBounds);
      debouncedFetch(viewportBounds);
    });

    // Listen for zoom changes
    const zoomListener = map.addListener('zoom_changed', () => {
      const zoom = map.getZoom();
      console.log('Map zoom changed:', zoom);
      
      // Show loading indicator
      setIsFetchingViewport(true);
      
      // The idle event will handle the actual fetch
    });

    // Clean up listeners on unmount
    return () => {
      if (idleListener) idleListener.remove();
      if (zoomListener) zoomListener.remove();
    };
  }, [debouncedFetch]);

  // Replace properties with viewport properties when map moves
  useEffect(() => {
    console.log('Properties update - Initial:', properties.length, 'Viewport:', viewportProperties.length);
    
    // When viewport properties are loaded, replace existing properties
    if (viewportProperties.length > 0) {
      // Replace all properties with viewport properties
      console.log('Replacing properties with viewport results');
      setCombinedProperties(viewportProperties);
    } else if (properties.length > 0) {
      // Use initial properties only when no viewport properties
      console.log('Using initial properties');
      setCombinedProperties(properties);
    } else {
      // No properties at all
      setCombinedProperties([]);
    }
  }, [properties, viewportProperties]);

  // Get the SimplePropertyMap ref to access its map instance
  const handleSimpleMapRef = useCallback((ref) => {
    mapRef.current = ref;
    // Don't try to get map instance here - wait for onMapReady callback
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Loading overlay for viewport fetching */}
      {isFetchingViewport && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#912018]"></div>
          <span className="text-sm font-medium text-gray-700">Loading area properties...</span>
        </div>
      )}

      {/* Property count indicator */}
      {combinedProperties.length > 0 && (
        <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg px-3 py-1">
          <span className="text-sm font-medium text-gray-700">
            {combinedProperties.length} properties in view
          </span>
        </div>
      )}

      {/* Pass through to SimplePropertyMap */}
      <SimplePropertyMap
        ref={handleSimpleMapRef}
        properties={combinedProperties}
        className={className}
        onPropertyClick={onPropertyClick}
        onPropertyHover={onPropertyHover}
        viewType={viewType}
        onMapReady={handleMapReady}
        activeTab={activeTab}
      />
    </div>
  );
};

export default ViewportAwarePropertyMap;