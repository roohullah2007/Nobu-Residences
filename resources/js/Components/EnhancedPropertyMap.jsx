import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import EnhancedPropertyImageLoader from '@/Components/EnhancedPropertyImageLoader';

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
        gestureHandling: 'cooperative'
      },
      mixed: {
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false,
        gestureHandling: 'cooperative'
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
      if (price >= 1000000) return Math.round(price / 1000000) + 'M';
      if (price >= 1000) return Math.round(price / 1000) + 'K';
      return Math.round(price / 1000) + 'K';
    };

    const priceText = formatPrice(property.ListPrice);
    const isActive = activeProperty === property.ListingKey;
    
    // IDX-AMPRE style marker content
    const markerContent = document.createElement('div');
    markerContent.className = 'property-marker-ampre';
    markerContent.innerHTML = `
      <div class="property-marker-content-ampre ${isActive ? 'active' : ''}" 
           style="background: ${isActive ? '#e53e3e' : '#3182ce'}; 
                  color: white; 
                  padding: 6px 12px; 
                  border-radius: 16px; 
                  font-size: 13px; 
                  font-weight: 600; 
                  border: 2px solid white; 
                  box-shadow: ${isActive ? '0 4px 12px rgba(229, 62, 62, 0.4)' : '0 2px 8px rgba(0,0,0,0.25)'};
                  cursor: pointer;
                  transition: all 0.3s ease;
                  white-space: nowrap;
                  font-family: 'Work Sans', sans-serif;
                  position: relative;
                  z-index: ${isActive ? '1000' : '100'};">
        $${priceText}
        ${isActive ? '<div style="position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background: #fff; border-radius: 50%; animation: pulse 2s infinite;"></div>' : ''}
      </div>
    `;

    // Add CSS for pulse animation only once
    if (!document.querySelector('#marker-pulse-styles')) {
      const style = document.createElement('style');
      style.id = 'marker-pulse-styles';
      style.textContent = `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        .property-marker-content-ampre:hover {
          transform: scale(1.05) !important;
          box-shadow: 0 6px 16px rgba(0,0,0,0.3) !important;
        }
      `;
      document.head.appendChild(style);
    }

    // Use AdvancedMarkerElement if available (newer API), fallback to Marker
    let marker;
    if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
      marker = new window.google.maps.marker.AdvancedMarkerElement({
        map: mapInstanceRef.current,
        position: position,
        content: markerContent,
        title: property.UnparsedAddress,
        zIndex: isActive ? 1000 : 100
      });
    } else {
      // Fallback to classic marker with custom icon
      const icon = {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg width="80" height="36" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.25)"/>
              </filter>
            </defs>
            <rect x="2" y="2" width="76" height="32" rx="16" fill="${isActive ? '#e53e3e' : '#3182ce'}" stroke="white" stroke-width="2" filter="url(#shadow)"/>
            <text x="40" y="22" text-anchor="middle" fill="white" font-size="13" font-weight="600" font-family="Work Sans, sans-serif">$${priceText}</text>
            ${isActive ? '<circle cx="70" cy="8" r="3" fill="white"/>' : ''}
          </svg>
        `)}`,
        scaledSize: new window.google.maps.Size(80, 36),
        anchor: new window.google.maps.Point(40, 18)
      };

      marker = new window.google.maps.Marker({
        map: mapInstanceRef.current,
        position: position,
        icon: icon,
        title: property.UnparsedAddress,
        optimized: false,
        zIndex: isActive ? 1000 : 100
      });
    }

    // Add hover effects
    marker.addListener('mouseover', () => {
      if (onPropertyHover) {
        onPropertyHover(property.ListingKey);
      }
      
      // Update marker style
      if (markerContent) {
        const content = markerContent.querySelector('.property-marker-content-ampre');
        if (content) {
          content.style.transform = 'scale(1.05)';
          content.style.zIndex = '1001';
        }
      }
    });

    marker.addListener('mouseout', () => {
      if (onPropertyHover) {
        onPropertyHover(null);
      }
      
      // Reset marker style
      if (markerContent) {
        const content = markerContent.querySelector('.property-marker-content-ampre');
        if (content) {
          content.style.transform = 'scale(1)';
          content.style.zIndex = isActive ? '1000' : '100';
        }
      }
    });

    // Add click handler
    marker.addListener('click', () => {
      if (onPropertyClick) {
        onPropertyClick(property);
      }

      // Show info window
      if (enableInfoWindows && infoWindowRef.current) {
        showPropertyInfoWindow(property, marker);
      }
    });

    return marker;
  }, [activeProperty, onPropertyHover, onPropertyClick, enableInfoWindows]);

  // Show property info window with IDX-AMPRE styling
  const showPropertyInfoWindow = useCallback((property, marker) => {
    if (!infoWindowRef.current) return;

    const formatPrice = (price) => {
      if (!price || price <= 0) return 'Price on request';
      return '$' + price.toLocaleString();
    };

    const features = [];
    if (property.BedroomsTotal > 0) {
      features.push(`${property.BedroomsTotal} bed${property.BedroomsTotal > 1 ? 's' : ''}`);
    }
    if (property.BathroomsTotalInteger > 0) {
      features.push(`${property.BathroomsTotalInteger} bath${property.BathroomsTotalInteger > 1 ? 's' : ''}`);
    }
    if (property.AboveGradeFinishedArea > 0) {
      features.push(`${property.AboveGradeFinishedArea.toLocaleString()} sqft`);
    }

    // IDX-AMPRE style info window content
    const infoContent = `
      <div class="property-info-window-ampre" style="max-width: 300px; font-family: 'Work Sans', sans-serif; border-radius: 8px; overflow: hidden;">
        <div style="display: flex; gap: 12px; padding: 16px; background: white;">
          <div style="width: 90px; height: 70px; flex-shrink: 0; border-radius: 8px; overflow: hidden; background: #f7fafc;">
            <img src="${property.MediaURL || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&h=150&fit=crop&auto=format&q=80'}" 
                 alt="${property.UnparsedAddress}" 
                 style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 700; font-size: 16px; color: #1a202c; margin-bottom: 6px; line-height: 1.2;">
              ${formatPrice(property.ListPrice)}
            </div>
            <div style="font-size: 13px; color: #4a5568; margin-bottom: 6px; line-height: 1.3;">
              ${property.UnparsedAddress || 'Address not available'}
            </div>
            ${features.length > 0 ? `
              <div style="font-size: 12px; color: #718096; line-height: 1.2; margin-bottom: 8px;">
                ${features.join(' • ')}
              </div>
            ` : ''}
            <div style="margin-top: 10px;">
              <a href="/property/${property.ListingKey}" 
                 style="display: inline-block; background: #3182ce; color: white; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 600; transition: background 0.2s ease;"
                 onmouseover="this.style.background='#2c5282'" onmouseout="this.style.background='#3182ce'">
                View Details
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

    infoWindowRef.current.setContent(infoContent);
    
    if (marker.getPosition) {
      infoWindowRef.current.open(mapInstanceRef.current, marker);
    } else {
      // For AdvancedMarkerElement
      infoWindowRef.current.open({
        map: mapInstanceRef.current,
        anchor: marker
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

      // Create info window
      if (enableInfoWindows) {
        infoWindowRef.current = new window.google.maps.InfoWindow({
          maxWidth: 300,
          pixelOffset: new window.google.maps.Size(0, -10)
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
    const apiKey = mapConfig.apiKey;
    
    if (!apiKey) {
      setMapState(prev => ({ 
        ...prev, 
        error: 'Google Maps API key not configured' 
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
      addPropertyMarkers();
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

  // Error state
  if (mapState.error) {
    return (
      <div className={`${className} bg-gray-100 rounded-lg border flex items-center justify-center`}>
        <div className="text-center p-8">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Map Unavailable</h3>
          <p className="text-sm text-gray-600">{mapState.error}</p>
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
