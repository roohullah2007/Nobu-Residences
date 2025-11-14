import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import EnhancedPropertyImageLoader from '@/Components/EnhancedPropertyImageLoader';
import { renderPropertyCardInInfoWindow } from '@/Website/Components/MapPropertyCard';
import frontendGeocoding from '@/services/frontendGeocoding';

/**
 * Enhanced PropertyMap Component with IDX-AMPRE Style Mixed View Support
 * 
 * Features inspired by IDX-AMPRE plugin:
 * - Interactive property markers with clustering
 * - Real-time sync between map and property cards
 * - Advanced info windows with property previews
 * - Responsive map controls and zoom management
 * - Property highlighting and hover effects
 * - Batch marker rendering for performance
 * - IDX-AMPRE style split-screen layout integration
 */

const PropertyMap = ({ 
  properties = [], 
  className = '', 
  activeProperty = null, 
  onPropertyHover = null,
  onPropertyClick = null,
  viewType = 'full', // 'full', 'mixed'
  mapOptions = {},
  enableClustering = true,
  enableInfoWindows = true,
  mixedViewConfig = {}
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef(new Map());
  const infoWindowRef = useRef(null);
  const markerClusterRef = useRef(null);
  const initializationRef = useRef(false);
  const [isMapRefReady, setIsMapRefReady] = useState(false);
  
  const [mapState, setMapState] = useState({
    loaded: false,
    error: null,
    center: { lat: 43.6532, lng: -79.3832 }, // Toronto default
    zoom: 11,
    bounds: null
  });

  // Memoize configuration to prevent re-creation on every render
  const mapConfig = useMemo(() => ({
    apiKey: window.googleMapsApiKey || '',
    defaultCenter: { lat: 43.6532, lng: -79.3832 },
    defaultZoom: 11,
    mapStyles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'transit',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ],
    mapOptions: {
      full: {
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true,
        scrollwheel: true, // Enable scroll wheel zoom
        gestureHandling: 'greedy' // Allow single finger/mouse drag and scroll
      },
      mixed: {
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false,
        scrollwheel: true, // Enable scroll wheel zoom
        gestureHandling: 'greedy' // Allow single finger/mouse drag and scroll on mixed view too
      }
    },
    clustering: {
      enabled: true,
      gridSize: 50,
      maxZoom: 15
    },
    mixedView: {
      mapPadding: 30,
      autoCenter: true,
      syncHover: true
    }
  }), []);

  // Memoize valid properties to prevent unnecessary recalculations
  const validProperties = useMemo(() => {
    return properties.filter(p => p.Latitude && p.Longitude);
  }, [properties]);

  // Calculate map center from properties - memoized to prevent recalculation
  const mapCenter = useMemo(() => {
    if (!validProperties || validProperties.length === 0) {
      return { lat: 43.6532, lng: -79.3832, zoom: 11 };
    }

    if (validProperties.length === 1) {
      return {
        lat: parseFloat(validProperties[0].Latitude),
        lng: parseFloat(validProperties[0].Longitude),
        zoom: 15
      };
    }

    // Calculate bounds for multiple properties
    const bounds = new window.google.maps.LatLngBounds();
    validProperties.forEach(property => {
      bounds.extend({
        lat: parseFloat(property.Latitude),
        lng: parseFloat(property.Longitude)
      });
    });

    const center = bounds.getCenter();
    return {
      lat: center.lat(),
      lng: center.lng(),
      zoom: 12,
      bounds: bounds
    };
  }, [validProperties]);

  // Create property marker with IDX-AMPRE styling
  const createPropertyMarker = useCallback((property) => {
    if (!mapInstanceRef.current || !property.Latitude || !property.Longitude) {
      return null;
    }

    const position = {
      lat: parseFloat(property.Latitude),
      lng: parseFloat(property.Longitude)
    };

    // Format price for marker
    const formatPrice = (price) => {
      if (!price || price <= 0) return '?';
      return price.toLocaleString();
    };

    const priceText = formatPrice(property.ListPrice);
    const isActive = activeProperty === property.ListingKey;

    // Always use classic marker with custom icon for consistent display
    const icon = {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="80" height="45" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="shadow${property.ListingKey}" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
            </filter>
          </defs>
          <rect x="5" y="5" width="70" height="26" rx="4" fill="${isActive ? '#0056b3' : '#007cba'}" stroke="white" stroke-width="2" filter="url(#shadow${property.ListingKey})"/>
          <text x="40" y="21" text-anchor="middle" fill="white" font-size="14" font-weight="bold" font-family="Arial, sans-serif">$${priceText}</text>
          <polygon points="40,32 48,32 44,40 36,32" fill="${isActive ? '#0056b3' : '#007cba'}" stroke="white" stroke-width="2"/>
        </svg>
      `)}`,
      scaledSize: new window.google.maps.Size(80, 45),
      anchor: new window.google.maps.Point(40, 40)
    };

    const marker = new window.google.maps.Marker({
      map: mapInstanceRef.current,
      position: position,
      icon: icon,
      title: property.UnparsedAddress,
      optimized: false,
      zIndex: isActive ? 1000 : 100
    });

    // Add hover effects and sync with property list
    marker.addListener('mouseover', () => {
      if (onPropertyHover) {
        // Pass the full property object and action for proper sync
        onPropertyHover(property, 'enter');
      }
      
      // Update marker icon on hover
      const hoverIcon = {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg width="85" height="48" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="shadowHover${property.ListingKey}" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.4"/>
              </filter>
            </defs>
            <rect x="5" y="5" width="75" height="28" rx="4" fill="#0056b3" stroke="white" stroke-width="2" filter="url(#shadowHover${property.ListingKey})"/>
            <text x="42.5" y="22" text-anchor="middle" fill="white" font-size="15" font-weight="bold" font-family="Arial, sans-serif">$${priceText}</text>
            <polygon points="42.5,34 50.5,34 46.5,42 38.5,34" fill="#0056b3" stroke="white" stroke-width="2"/>
          </svg>
        `)}`,
        scaledSize: new window.google.maps.Size(85, 48),
        anchor: new window.google.maps.Point(42.5, 42)
      };
      marker.setIcon(hoverIcon);
    });

    marker.addListener('mouseout', () => {
      if (onPropertyHover) {
        // Pass null and 'leave' action to clear hover state
        onPropertyHover(null, 'leave');
      }
      
      // Reset marker icon
      marker.setIcon(icon);
    });

    // Add click handler - only show info window, don't navigate
    marker.addListener('click', () => {
      // Show info window with PropertyCardV5
      if (enableInfoWindows && infoWindowRef.current) {
        showPropertyInfoWindow(property, marker);
      }
      
      // Optional: notify parent component about click without navigating
      if (onPropertyClick) {
        onPropertyClick(property);
      }
    });

    return marker;
  }, [activeProperty, onPropertyHover, onPropertyClick, enableInfoWindows]);

  // Show property info window with PropertyCardV5
  const showPropertyInfoWindow = useCallback((property, marker) => {
    if (!infoWindowRef.current || !mapInstanceRef.current) return;

    // Close any existing info window cleanup
    if (window.currentInfoWindowCleanup) {
      window.currentInfoWindowCleanup();
      window.currentInfoWindowCleanup = null;
    }

    // Use PropertyCardV5 in the info window
    const cleanup = renderPropertyCardInInfoWindow(property, infoWindowRef.current, mapInstanceRef.current);
    window.currentInfoWindowCleanup = cleanup;
    
    // Open the info window at the marker position
    if (marker.getPosition) {
      infoWindowRef.current.open(mapInstanceRef.current, marker);
    } else {
      // For AdvancedMarkerElement
      infoWindowRef.current.open({
        map: mapInstanceRef.current,
        anchor: marker
      });
    }

    // Add close event listener for cleanup
    if (window.google && window.google.maps) {
      window.google.maps.event.addListenerOnce(infoWindowRef.current, 'closeclick', () => {
        if (window.currentInfoWindowCleanup) {
          window.currentInfoWindowCleanup();
          window.currentInfoWindowCleanup = null;
        }
      });
    }
  }, []);

  // Add all property markers
  const addPropertyMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !validProperties.length) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      if (marker.setMap) {
        marker.setMap(null);
      }
    });
    markersRef.current.clear();

    // Clear existing cluster
    if (markerClusterRef.current && markerClusterRef.current.clearMarkers) {
      markerClusterRef.current.clearMarkers();
    }

    // Create markers
    const markers = [];
    validProperties.forEach(property => {
      const marker = createPropertyMarker(property);
      if (marker) {
        markersRef.current.set(property.ListingKey, marker);
        markers.push(marker);
      }
    });

    // Add clustering if enabled and we have multiple markers
    if (enableClustering && markers.length > 1 && window.google.maps.marker) {
      try {
        const { MarkerClusterer } = window.google.maps.marker;
        if (MarkerClusterer) {
          markerClusterRef.current = new MarkerClusterer({
            map: mapInstanceRef.current,
            markers: markers,
            algorithm: new window.google.maps.marker.GridAlgorithm({
              gridSize: 50
            })
          });
        }
      } catch (error) {
        console.warn('Clustering not available:', error);
      }
    }

    // Fit map to show all markers (with proper padding for mixed view)
    if (validProperties.length > 1 && viewType === 'full') {
      const bounds = new window.google.maps.LatLngBounds();
      validProperties.forEach(property => {
        bounds.extend({
          lat: parseFloat(property.Latitude),
          lng: parseFloat(property.Longitude)
        });
      });
      mapInstanceRef.current.fitBounds(bounds, { padding: 50 });
    } else if (validProperties.length > 1 && viewType === 'mixed') {
      // For mixed view, use stored bounds or calculate
      if (mapCenter.bounds) {
        mapInstanceRef.current.fitBounds(mapCenter.bounds, { 
          padding: mixedViewConfig.mapPadding || 30 
        });
      }
    }
  }, [validProperties, createPropertyMarker, enableClustering, viewType, mapCenter, mixedViewConfig]);

  // Initialize Google Maps
  const initializeMap = useCallback(() => {
    if (!window.google || !window.google.maps || !mapRef.current || initializationRef.current || mapState.loaded) {
      return;
    }

    initializationRef.current = true;

    const defaultOptions = {
      center: { lat: mapCenter.lat, lng: mapCenter.lng },
      zoom: mapCenter.zoom,
      mapTypeId: 'roadmap',
      styles: mapConfig.mapStyles,
      ...mapConfig.mapOptions[viewType]
    };

    const finalOptions = { ...defaultOptions, ...mapOptions };
    
    try {
      const map = new window.google.maps.Map(mapRef.current, finalOptions);
      mapInstanceRef.current = map;

      // Store bounds for later use
      if (mapCenter.bounds) {
        setMapState(prev => ({ ...prev, bounds: mapCenter.bounds }));
      }

      // Create info window for PropertyCardV5 - smaller size
      if (enableInfoWindows) {
        infoWindowRef.current = new window.google.maps.InfoWindow({
          maxWidth: 220,
          pixelOffset: new window.google.maps.Size(0, -30), // Offset to position above marker arrow
          disableAutoPan: false
        });
      }

      setMapState(prev => ({ ...prev, loaded: true, error: null }));

      // Add markers after map is loaded
      setTimeout(() => {
        addPropertyMarkers();
      }, 100);

    } catch (error) {
      console.error('Error initializing map:', error);
      setMapState(prev => ({ ...prev, error: error.message }));
      initializationRef.current = false;
    }
  }, [mapCenter, mapConfig, viewType, mapOptions, enableInfoWindows, addPropertyMarkers, mapState.loaded]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all markers
      if (markersRef.current.size > 0) {
        markersRef.current.forEach(marker => {
          if (marker && marker.setMap) {
            marker.setMap(null);
          }
        });
        markersRef.current.clear();
      }
      
      // Clear marker cluster
      if (markerClusterRef.current) {
        markerClusterRef.current.clearMarkers();
        markerClusterRef.current = null;
      }
      
      // Close info window
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
        infoWindowRef.current = null;
      }
      
      // Reset initialization flag
      initializationRef.current = false;
    };
  }, []);

  // Load Google Maps API
  useEffect(() => {
    // Check if we have an API key
    const apiKey = mapConfig.apiKey || window.googleMapsApiKey;
    
    if (!apiKey || apiKey === '' || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
      setMapState(prev => ({ 
        ...prev, 
        error: 'Google Maps API key not configured. Please add your API key to the .env file.' 
      }));
      return;
    }

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    // Check if script is already in the DOM
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // Wait for Google Maps to be available
      const checkGoogleMaps = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkGoogleMaps);
          initializeMap();
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkGoogleMaps);
        if (!window.google || !window.google.maps) {
          setMapState(prev => ({ 
            ...prev, 
            error: 'Google Maps API failed to load' 
          }));
        }
      }, 10000);
      
      return () => clearInterval(checkGoogleMaps);
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry${enableClustering ? ',marker' : ''}&loading=async`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      // Wait a moment for Google Maps to fully initialize
      setTimeout(() => {
        if (window.google && window.google.maps) {
          initializeMap();
        } else {
          setMapState(prev => ({ 
            ...prev, 
            error: 'Google Maps API not available after loading' 
          }));
        }
      }, 100);
    };
    
    script.onerror = () => {
      setMapState(prev => ({ 
        ...prev, 
        error: 'Failed to load Google Maps API' 
      }));
      initializationRef.current = false;
    };

    document.head.appendChild(script);

    // Don't remove the script as other components might need it
    return () => {};
  }, [initializeMap, enableClustering, mapConfig.apiKey]);

  // Track when map ref is ready
  useEffect(() => {
    setIsMapRefReady(!!mapRef.current);
  }, []);

  // Initialize map when ref is ready and Google Maps is loaded
  useEffect(() => {
    if (isMapRefReady && window.google && window.google.maps && !mapState.loaded && !initializationRef.current) {
      initializeMap();
    }
  }, [isMapRefReady, mapState.loaded, initializeMap]);

  // Update markers when properties change
  useEffect(() => {
    if (mapState.loaded && mapInstanceRef.current) {
      // Geocode visible properties first, then add markers
      const handlePropertyUpdate = (property) => {
        console.log('Property geocoded, updating markers:', property.ListingKey);
        // Re-add markers when a property is geocoded
        addPropertyMarkers();
      };
      
      frontendGeocoding.geocodeVisibleProperties(validProperties, handlePropertyUpdate).then(() => {
        // Initial marker add after geocoding queue starts
        addPropertyMarkers();
      });
    }
  }, [validProperties, mapState.loaded]);

  // Update active marker when activeProperty changes (IDX-AMPRE sync)
  useEffect(() => {
    if (!mapState.loaded || !activeProperty || !mapInstanceRef.current) return;

    // Center map on active property for mixed view
    if (viewType === 'mixed' && mixedViewConfig.autoCenter !== false) {
      const activePropertyData = validProperties.find(p => p.ListingKey === activeProperty);
      if (activePropertyData && activePropertyData.Latitude && activePropertyData.Longitude) {
        mapInstanceRef.current.panTo({
          lat: parseFloat(activePropertyData.Latitude),
          lng: parseFloat(activePropertyData.Longitude)
        });
      }
    }
  }, [activeProperty, mapState.loaded, validProperties, viewType, mixedViewConfig]);

  // Error state with helpful message for missing API key
  if (mapState.error) {
    const isApiKeyError = mapState.error.includes('API key');
    
    // Show property locations in a list if we have them but no map
    if (isApiKeyError && validProperties.length > 0) {
      return (
        <div className={`${className} bg-gray-50 rounded-lg border overflow-hidden`}>
          <div className="bg-white border-b p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Property Locations</h3>
                <p className="text-sm text-gray-600 mt-1">{validProperties.length} properties found</p>
              </div>
              <div className="text-amber-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-amber-800">
                <strong>Map requires Google Maps API key.</strong> Properties are listed below with their coordinates.
              </p>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {validProperties.slice(0, 20).map((property, index) => (
                  <div key={property.ListingKey || index} className="bg-white rounded-lg p-3 border hover:shadow-md transition-shadow cursor-pointer"
                       onClick={() => onPropertyClick && onPropertyClick(property)}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {property.UnparsedAddress || 'Address not available'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          ${property.ListPrice ? property.ListPrice.toLocaleString() : 'Price N/A'}
                        </p>
                      </div>
                      <div className="text-right ml-3">
                        <p className="text-xs text-gray-400">
                          {property.Latitude && property.Longitude ? 
                            `${parseFloat(property.Latitude).toFixed(4)}, ${parseFloat(property.Longitude).toFixed(4)}` : 
                            'No coordinates'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {validProperties.length > 20 && (
                  <p className="text-center text-sm text-gray-500 py-2">
                    And {validProperties.length - 20} more properties...
                  </p>
                )}
              </div>
            </div>
            
            {isApiKeyError && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800 font-medium mb-2">To enable the interactive map:</p>
                <ol className="text-xs text-blue-700 list-decimal list-inside space-y-1">
                  <li>Get a Google Maps API key from the <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
                  <li>Add to .env: <code className="bg-blue-100 px-1 rounded">GOOGLE_MAPS_API_KEY=your_key</code></li>
                  <li>Clear cache: <code className="bg-blue-100 px-1 rounded">php artisan config:clear</code></li>
                </ol>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    // Default error display for other errors or no properties
    return (
      <div className={`${className} bg-gray-100 rounded-lg border flex items-center justify-center`}>
        <div className="text-center p-8">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Map Unavailable</h3>
          <p className="text-sm text-gray-600 mb-3">{mapState.error}</p>
          {isApiKeyError && (
            <div className="text-xs text-gray-500 max-w-md mx-auto">
              <p className="mb-2">To enable the map, please add a Google Maps API key:</p>
              <ol className="text-left list-decimal list-inside space-y-1">
                <li>Get an API key from <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a></li>
                <li>Add it to your .env file: <code className="bg-gray-200 px-1 py-0.5 rounded">GOOGLE_MAPS_API_KEY=your_key_here</code></li>
                <li>Clear cache: <code className="bg-gray-200 px-1 py-0.5 rounded">php artisan config:clear</code></li>
              </ol>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} relative`}>
      {/* Map container wrapper to isolate Google Maps DOM manipulation */}
      <div className="w-full h-full relative">
        {/* Map container - always render this so ref can be attached */}
        <div 
          ref={(el) => {
            if (el && mapRef.current !== el) {
              mapRef.current = el;
              setIsMapRefReady(true);
            } else if (!el && mapRef.current) {
              // Don't immediately clear the ref to avoid conflicts
              setTimeout(() => {
                if (!el && mapRef.current === el) {
                  mapRef.current = null;
                  setIsMapRefReady(false);
                }
              }, 100);
            }
          }}
          className="w-full h-full rounded-lg overflow-hidden border bg-gray-50"
          style={{ minHeight: '400px' }}
          suppressHydrationWarning={true}>
          {/* Show loading spinner overlay while map is loading */}
          {!mapState.loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="text-center p-8">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Loading Map</h3>
                <p className="text-sm text-gray-600">Please wait while we load the property locations...</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Map controls overlay for full view */}
      {viewType === 'full' && (
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-white rounded-lg shadow-md p-3 flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium text-gray-900 text-sm">
              {validProperties.length} {validProperties.length === 1 ? 'property' : 'properties'}
            </span>
          </div>
        </div>
      )}

      {/* Mixed view indicator */}
      {viewType === 'mixed' && (
        <div className="absolute bottom-4 left-4 z-10">
          <div className="bg-white rounded-lg shadow-md px-3 py-2">
            <span className="text-xs font-medium text-gray-600">
              Interactive Map • {validProperties.length} locations
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyMap;
