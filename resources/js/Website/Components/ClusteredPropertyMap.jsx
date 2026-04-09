import React, { useEffect, useRef, useState, useCallback } from 'react';
import GoogleMapContainer from './GoogleMapContainer';
import { debounce } from 'lodash';

/**
 * ClusteredPropertyMap - High-performance map component for displaying 500+ property markers
 * Uses MarkerClusterer for grouping nearby markers into clusters
 * Shows property markers with price labels, fetches coordinates from API based on viewport
 */
const ClusteredPropertyMap = ({
  searchFilters = {},
  className = '',
  onPropertyClick = null,
  onMarkerCountChange = null,
  onPolygonDraw = null,
  initialCenter = { lat: 43.6532, lng: -79.3832 }, // Toronto default
  initialZoom = 11,
}) => {
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const markerClustererRef = useRef(null);
  const infoWindowRef = useRef(null);
  const drawnPolygonRef = useRef(null);
  const lockedClusterRef = useRef(null);
  const drawPointsRef = useRef([]);
  const previewPolylineRef = useRef(null);
  const rubberLineRef = useRef(null);
  const previewMarkersRef = useRef([]);
  const drawClickListenerRef = useRef(null);
  const drawMoveListenerRef = useRef(null);
  const drawDblClickListenerRef = useRef(null);
  const prevMapOptionsRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [hasDrawnPolygon, setHasDrawnPolygon] = useState(false);
  const [markerStats, setMarkerStats] = useState({ displayed: 0, total: 0 });
  const lastBoundsRef = useRef(null);
  const lastZoomRef = useRef(initialZoom);

  // Get CSRF token
  const getCsrfToken = () => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
  };

  // Format price for marker display
  const formatPrice = (price) => {
    if (!price || price <= 0) return '?';
    if (price >= 1000000) {
      return '$' + (price / 1000000).toFixed(1) + 'M';
    }
    return '$' + Math.round(price / 1000) + 'K';
  };

  // Fetch map coordinates from API
  const fetchMapCoordinates = useCallback(async (bounds, zoom) => {
    if (!bounds) return [];

    setIsLoading(true);
    try {
      const searchParams = {
        ...searchFilters,
        viewport_bounds: bounds,
        zoom_level: zoom,
        limit: 100 // Show at most 100 listings on the map at once
      };

      const response = await fetch('/api/map-coordinates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
          'Accept': 'application/json'
        },
        body: JSON.stringify({ search_params: searchParams })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setMarkerStats({
          displayed: result.data.displayed,
          total: result.data.total
        });

        if (onMarkerCountChange) {
          onMarkerCountChange(result.data.displayed, result.data.total);
        }

        return result.data.coordinates || [];
      }

      return [];
    } catch (error) {
      console.error('Error fetching map coordinates:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [searchFilters, onMarkerCountChange]);

  // Create custom marker icon with price
  const createMarkerIcon = (price, isHovered = false) => {
    const priceText = formatPrice(price);
    const bgColor = isHovered ? '#0056b3' : '#007cba';
    const width = 70;
    const height = 36;

    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="${width-4}" height="${height-10}" rx="4" fill="${bgColor}" stroke="white" stroke-width="1.5"/>
          <text x="${width/2}" y="${height/2 - 2}" text-anchor="middle" fill="white" font-size="11" font-weight="bold" font-family="Arial, sans-serif">${priceText}</text>
          <polygon points="${width/2},${height-4} ${width/2+6},${height-10} ${width/2-6},${height-10}" fill="${bgColor}" stroke="white" stroke-width="1.5"/>
        </svg>
      `)}`,
      scaledSize: new window.google.maps.Size(width, height),
      anchor: new window.google.maps.Point(width/2, height)
    };
  };

  // Create cluster icon
  const createClusterIcon = (count) => {
    const size = count < 10 ? 40 : count < 100 ? 50 : 60;
    const bgColor = count < 10 ? '#007cba' : count < 100 ? '#0056b3' : '#003d82';

    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
          <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="${bgColor}" stroke="white" stroke-width="3"/>
          <text x="${size/2}" y="${size/2 + 5}" text-anchor="middle" fill="white" font-size="${count < 100 ? 14 : 12}" font-weight="bold" font-family="Arial, sans-serif">${count}</text>
        </svg>
      `)}`,
      scaledSize: new window.google.maps.Size(size, size),
      anchor: new window.google.maps.Point(size/2, size/2)
    };
  };

  // Clear all markers and clusterer
  const clearMarkers = useCallback(() => {
    // Clear clusterer first
    if (markerClustererRef.current) {
      markerClustererRef.current.clearMarkers();
    }

    // Then clear individual markers
    markersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    markersRef.current = [];
  }, []);

  // Update markers on the map with clustering
  const updateMarkers = useCallback(async (bounds, zoom) => {
    if (!mapInstanceRef.current || !window.google) return;

    // Round bounds to prevent micro-changes triggering fetches
    const roundedBounds = {
      north: Math.round(bounds.north * 1000) / 1000,
      south: Math.round(bounds.south * 1000) / 1000,
      east: Math.round(bounds.east * 1000) / 1000,
      west: Math.round(bounds.west * 1000) / 1000
    };

    // Preserve polygon coords (Repliers `map` param) when present so the
    // backend filters by the drawn polygon instead of the visible viewport.
    if (bounds.polygon) {
      roundedBounds.polygon = bounds.polygon;
    }

    const polyKey = bounds.polygon ? `_p${bounds.polygon.length}_${bounds.polygon[0]?.[0]}_${bounds.polygon[0]?.[1]}` : '';
    const boundsKey = `${roundedBounds.north}_${roundedBounds.south}_${roundedBounds.east}_${roundedBounds.west}_${zoom}${polyKey}`;

    // Skip if bounds haven't changed significantly
    if (lastBoundsRef.current === boundsKey) {
      return;
    }
    lastBoundsRef.current = boundsKey;

    // Fetch coordinates from API
    const coordinates = await fetchMapCoordinates(roundedBounds, zoom);

    if (!coordinates || coordinates.length === 0) {
      clearMarkers();
      return;
    }

    // Clear existing markers
    clearMarkers();

    // Create info window if not exists
    if (!infoWindowRef.current) {
      infoWindowRef.current = new window.google.maps.InfoWindow({
        maxWidth: 280,
        pixelOffset: new window.google.maps.Size(0, -5)
      });
    }

    // Create new markers for each property
    const newMarkers = coordinates.map((coord) => {
      const marker = new window.google.maps.Marker({
        position: { lat: coord.lat, lng: coord.lng },
        icon: createMarkerIcon(coord.price),
        title: coord.address,
        optimized: true,
        zIndex: 100
      });

      // Store coordinate data on marker for later use
      marker._propertyData = coord;

      // Add hover effect
      marker.addListener('mouseover', () => {
        marker.setIcon(createMarkerIcon(coord.price, true));
        marker.setZIndex(200);
      });

      marker.addListener('mouseout', () => {
        marker.setIcon(createMarkerIcon(coord.price, false));
        marker.setZIndex(100);
      });

      // Add click listener to show property card popup
      marker.addListener('click', () => {
        const href = coord.mls_id ? `/property/${coord.mls_id}` : '#';
        const imageHtml = coord.image
          ? `<div style="width:100%;height:160px;background:#f3f4f6 url('${coord.image}') center/cover no-repeat;"></div>`
          : `<div style="width:100%;height:160px;background:#e5e7eb;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:12px;">No image</div>`;

        const content = `
          <a href="${href}" style="display:block;width:260px;text-decoration:none;color:inherit;font-family:'Work Sans',Arial,sans-serif;background:#fff;border-radius:14px;overflow:hidden;">
            ${imageHtml}
            <div style="padding:14px 14px 16px 14px;">
              <div style="font-weight:800;font-size:22px;color:#0f172a;line-height:1.1;margin-bottom:8px;">
                ${formatPrice(coord.price)}
              </div>
              <div style="font-size:14px;color:#0f172a;line-height:1.35;margin-bottom:2px;">
                ${coord.address || 'Address not available'}
              </div>
              <div style="font-size:13px;color:#94a3b8;margin-bottom:10px;">
                ${coord.city || ''}
              </div>
              <div style="font-size:13px;color:#0f172a;display:flex;gap:14px;align-items:center;">
                <span>${coord.beds || 0} bd</span>
                <span>${coord.baths || 0} ba</span>
                ${coord.type ? `<span>${coord.type}</span>` : ''}
              </div>
            </div>
          </a>
        `;

        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(mapInstanceRef.current, marker);
        // NOTE: do not call onPropertyClick here — clicking the marker
        // should only open the card. Navigation happens when the user
        // clicks the card itself (the wrapping <a>).
      });

      return marker;
    });

    markersRef.current = newMarkers;

    // Initialize or update MarkerClusterer
    if (window.markerClusterer && window.markerClusterer.MarkerClusterer) {
      // Clear existing clusterer
      if (markerClustererRef.current) {
        markerClustererRef.current.clearMarkers();
      }

      // Create new clusterer with markers
      markerClustererRef.current = new window.markerClusterer.MarkerClusterer({
        map: mapInstanceRef.current,
        markers: newMarkers,
        algorithm: new window.markerClusterer.SuperClusterAlgorithm({
          maxZoom: 16,
          radius: 80
        }),
        renderer: {
          render: ({ count, position }) => {
            return new window.google.maps.Marker({
              position,
              icon: createClusterIcon(count),
              label: null,
              zIndex: Number(window.google.maps.Marker.MAX_ZINDEX) + count
            });
          }
        },
        onClusterClick: (event, cluster, map) => {
          // Lock the map to ONLY show the listings inside this cluster.
          // Capture the underlying property markers from the cluster.
          const clusterMarkers = cluster.markers || [];
          const lockedCoords = clusterMarkers
            .map((m) => m._propertyData)
            .filter(Boolean);

          if (lockedCoords.length === 0) return;

          // Compute tight bounds around the cluster's markers.
          const bounds = new window.google.maps.LatLngBounds();
          clusterMarkers.forEach((m) => bounds.extend(m.getPosition()));

          // Tear down the current clusterer + markers so we can re-render
          // only the locked subset.
          if (markerClustererRef.current) {
            markerClustererRef.current.clearMarkers();
            markerClustererRef.current = null;
          }
          markersRef.current.forEach((mk) => mk.setMap(null));
          markersRef.current = [];

          // Mark as locked so the idle/filter effects don't refetch.
          lockedClusterRef.current = lockedCoords;
          setHasDrawnPolygon(true); // reuse the same flag so Reset is enabled

          // Re-add ONLY the locked markers (no clustering — show each one).
          const lockedMarkers = lockedCoords.map((coord) => {
            const mk = new window.google.maps.Marker({
              position: { lat: coord.lat, lng: coord.lng },
              icon: createMarkerIcon(coord.price),
              map,
              title: coord.address,
              zIndex: 100,
            });
            mk._propertyData = coord;
            mk.addListener('mouseover', () => {
              mk.setIcon(createMarkerIcon(coord.price, true));
              mk.setZIndex(200);
            });
            mk.addListener('mouseout', () => {
              mk.setIcon(createMarkerIcon(coord.price, false));
              mk.setZIndex(100);
            });
            mk.addListener('click', () => {
              const href = coord.mls_id ? `/property/${coord.mls_id}` : '#';
              const imageHtml = coord.image
                ? `<div style="width:100%;height:160px;background:#f3f4f6 url('${coord.image}') center/cover no-repeat;"></div>`
                : `<div style="width:100%;height:160px;background:#e5e7eb;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:12px;">No image</div>`;
              const content = `
                <a href="${href}" style="display:block;width:260px;text-decoration:none;color:inherit;font-family:'Work Sans',Arial,sans-serif;background:#fff;border-radius:14px;overflow:hidden;">
                  ${imageHtml}
                  <div style="padding:14px 14px 16px 14px;">
                    <div style="font-weight:800;font-size:22px;color:#0f172a;line-height:1.1;margin-bottom:8px;">${formatPrice(coord.price)}</div>
                    <div style="font-size:14px;color:#0f172a;line-height:1.35;margin-bottom:2px;">${coord.address || 'Address not available'}</div>
                    <div style="font-size:13px;color:#94a3b8;margin-bottom:10px;">${coord.city || ''}</div>
                    <div style="font-size:13px;color:#0f172a;display:flex;gap:14px;align-items:center;">
                      <span>${coord.beds || 0} bd</span>
                      <span>${coord.baths || 0} ba</span>
                      ${coord.type ? `<span>${coord.type}</span>` : ''}
                    </div>
                  </div>
                </a>
              `;
              if (!infoWindowRef.current) {
                infoWindowRef.current = new window.google.maps.InfoWindow({ maxWidth: 280, pixelOffset: new window.google.maps.Size(0, -5) });
              }
              infoWindowRef.current.setContent(content);
              infoWindowRef.current.open(map, mk);
            });
            return mk;
          });
          markersRef.current = lockedMarkers;

          setMarkerStats({ displayed: lockedCoords.length, total: lockedCoords.length });
          if (onMarkerCountChange) {
            onMarkerCountChange(lockedCoords.length, lockedCoords.length);
          }

          // Zoom tightly around the locked markers.
          map.fitBounds(bounds, 60);
        }
      });
    } else {
      // Fallback: add markers directly to map without clustering
      newMarkers.forEach(marker => {
        marker.setMap(mapInstanceRef.current);
      });
    }

    console.log(`Map updated with ${newMarkers.length} property markers (clustered)`);
  }, [fetchMapCoordinates, clearMarkers, onPropertyClick]);

  // Debounced update function
  const debouncedUpdate = useCallback(
    debounce((bounds, zoom) => {
      updateMarkers(bounds, zoom);
    }, 500),
    [updateMarkers]
  );

  // Load MarkerClusterer library
  const loadMarkerClusterer = () => {
    return new Promise((resolve) => {
      if (window.markerClusterer) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js';
      script.async = true;
      script.onload = () => {
        console.log('MarkerClusterer library loaded');
        resolve();
      };
      script.onerror = () => {
        console.warn('Failed to load MarkerClusterer, falling back to individual markers');
        resolve();
      };
      document.head.appendChild(script);
    });
  };

  // Clear drawn polygon and/or cluster lock from the map
  const clearDrawnPolygon = useCallback(() => {
    if (drawnPolygonRef.current) {
      drawnPolygonRef.current.setMap(null);
      drawnPolygonRef.current = null;
    }
    const wasLocked = !!lockedClusterRef.current;
    lockedClusterRef.current = null;
    setHasDrawnPolygon(false);

    if (wasLocked && mapInstanceRef.current) {
      // Force a fresh viewport-based fetch now that the lock is gone.
      const map = mapInstanceRef.current;
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      if (bounds) {
        const viewportBounds = {
          north: bounds.getNorthEast().lat(),
          south: bounds.getSouthWest().lat(),
          east: bounds.getNorthEast().lng(),
          west: bounds.getSouthWest().lng(),
        };
        lastBoundsRef.current = null;
        updateMarkers(viewportBounds, zoom);
      }
    }

    if (onPolygonDraw) {
      onPolygonDraw(null);
    }
  }, [onPolygonDraw, updateMarkers]);

  // Remove preview polyline + vertex markers used while drawing
  const clearDrawingPreview = useCallback(() => {
    if (previewPolylineRef.current) {
      previewPolylineRef.current.setMap(null);
      previewPolylineRef.current = null;
    }
    if (rubberLineRef.current) {
      rubberLineRef.current.setMap(null);
      rubberLineRef.current = null;
    }
    previewMarkersRef.current.forEach((m) => m.setMap(null));
    previewMarkersRef.current = [];
    drawPointsRef.current = [];
  }, []);

  // Stop drawing mode. If commit && >=3 points, create the final polygon.
  const stopDrawing = useCallback((commit) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (drawClickListenerRef.current) {
      window.google.maps.event.removeListener(drawClickListenerRef.current);
      drawClickListenerRef.current = null;
    }
    if (drawMoveListenerRef.current) {
      window.google.maps.event.removeListener(drawMoveListenerRef.current);
      drawMoveListenerRef.current = null;
    }
    if (drawDblClickListenerRef.current) {
      window.google.maps.event.removeListener(drawDblClickListenerRef.current);
      drawDblClickListenerRef.current = null;
    }

    // Restore map options (cursor, doubleClickZoom)
    if (prevMapOptionsRef.current) {
      map.setOptions(prevMapOptionsRef.current);
      prevMapOptionsRef.current = null;
    }

    const points = drawPointsRef.current.slice();
    clearDrawingPreview();
    setIsDrawingMode(false);

    if (!commit || points.length < 3) return;

    // Build the final polygon
    const polygon = new window.google.maps.Polygon({
      paths: points,
      fillColor: '#2563eb',
      fillOpacity: 0.1,
      strokeColor: '#2563eb',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      clickable: false,
      editable: false,
      zIndex: 1,
    });
    polygon.setMap(map);

    // Replace any previously drawn polygon
    if (drawnPolygonRef.current) {
      drawnPolygonRef.current.setMap(null);
    }
    drawnPolygonRef.current = polygon;
    setHasDrawnPolygon(true);

    // Build coords [[lng,lat],...] closed ring
    const coordinates = points.map((p) => [p.lng(), p.lat()]);
    coordinates.push(coordinates[0]);

    // Bounding box
    const bounds = new window.google.maps.LatLngBounds();
    points.forEach((p) => bounds.extend(p));
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    if (onPolygonDraw) {
      onPolygonDraw({
        north: ne.lat(),
        south: sw.lat(),
        east: ne.lng(),
        west: sw.lng(),
        polygon: coordinates,
      });
    }
  }, [clearDrawingPreview, onPolygonDraw]);

  // Redraw the in-progress preview polyline + vertex markers
  const redrawPreview = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const pts = drawPointsRef.current;

    if (!previewPolylineRef.current) {
      previewPolylineRef.current = new window.google.maps.Polyline({
        path: pts,
        strokeColor: '#2563eb',
        strokeOpacity: 0.9,
        strokeWeight: 2,
        clickable: false,
        map,
      });
    } else {
      previewPolylineRef.current.setPath(pts);
    }

    // Add vertex markers for each new point
    while (previewMarkersRef.current.length < pts.length) {
      const idx = previewMarkersRef.current.length;
      const isFirst = idx === 0;
      const marker = new window.google.maps.Marker({
        position: pts[idx],
        map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: isFirst ? 7 : 5,
          fillColor: isFirst ? '#2563eb' : '#ffffff',
          fillOpacity: 1,
          strokeColor: '#2563eb',
          strokeWeight: 2,
        },
        clickable: false,
        zIndex: 10,
      });
      previewMarkersRef.current.push(marker);
    }
  }, []);

  // Toggle drawing mode (manual click-to-draw, no DrawingManager dependency)
  const toggleDrawingMode = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (isDrawingMode) {
      stopDrawing(false);
      return;
    }

    // Remove any existing polygon (without firing onPolygonDraw(null))
    if (drawnPolygonRef.current) {
      drawnPolygonRef.current.setMap(null);
      drawnPolygonRef.current = null;
      setHasDrawnPolygon(false);
    }

    // Save & override map options for drawing
    prevMapOptionsRef.current = {
      draggableCursor: null,
      disableDoubleClickZoom: false,
    };
    map.setOptions({
      draggableCursor: 'crosshair',
      disableDoubleClickZoom: true,
    });

    drawPointsRef.current = [];
    setIsDrawingMode(true);

    drawMoveListenerRef.current = map.addListener('mousemove', (e) => {
      const pts = drawPointsRef.current;
      if (pts.length === 0) return;
      const last = pts[pts.length - 1];
      const path = [last, e.latLng];
      if (!rubberLineRef.current) {
        const dashSymbol = {
          path: 'M 0,-1 0,1',
          strokeColor: '#2563eb',
          strokeOpacity: 0.9,
          strokeWeight: 2,
          scale: 3,
        };
        rubberLineRef.current = new window.google.maps.Polyline({
          path,
          strokeOpacity: 0,
          icons: [{ icon: dashSymbol, offset: '0', repeat: '10px' }],
          clickable: false,
          map,
          zIndex: 5,
        });
      } else {
        rubberLineRef.current.setPath(path);
      }
    });

    drawClickListenerRef.current = map.addListener('click', (e) => {
      const pts = drawPointsRef.current;

      // If user clicks near the first vertex (in screen pixels) and we have
      // at least 3 points, close the polygon and trigger the search.
      if (pts.length >= 3) {
        const projection = map.getProjection();
        if (projection) {
          const scale = Math.pow(2, map.getZoom());
          const firstPx = projection.fromLatLngToPoint(pts[0]);
          const clickPx = projection.fromLatLngToPoint(e.latLng);
          const dx = (firstPx.x - clickPx.x) * scale;
          const dy = (firstPx.y - clickPx.y) * scale;
          const distPx = Math.sqrt(dx * dx + dy * dy);
          if (distPx <= 16) {
            stopDrawing(true);
            return;
          }
        }
      }

      pts.push(e.latLng);
      redrawPreview();
    });
  }, [isDrawingMode, redrawPreview, stopDrawing]);

  // Initialize map
  const handleMapContainerReady = useCallback((mapDiv) => {
    if (!mapDiv || mapInstanceRef.current) return;

    const initMap = async () => {
      if (!window.google || !window.google.maps) {
        setMapError('Google Maps not loaded');
        return;
      }

      try {
        // Load MarkerClusterer library
        await loadMarkerClusterer();

        const map = new window.google.maps.Map(mapDiv, {
          center: initialCenter,
          zoom: initialZoom,
          mapTypeId: 'roadmap',
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: true,
          scrollwheel: true,
          gestureHandling: 'greedy'
        });

        mapInstanceRef.current = map;
        setMapLoaded(true);

        // Listen for map idle (user stopped moving/zooming)
        map.addListener('idle', () => {
          // While a polygon or a cluster lock is active, don't refetch
          // markers based on the visible viewport.
          if (drawnPolygonRef.current || lockedClusterRef.current) return;

          const bounds = map.getBounds();
          const zoom = map.getZoom();

          if (bounds) {
            const viewportBounds = {
              north: bounds.getNorthEast().lat(),
              south: bounds.getSouthWest().lat(),
              east: bounds.getNorthEast().lng(),
              west: bounds.getSouthWest().lng()
            };

            debouncedUpdate(viewportBounds, zoom);
          }
        });

        // Track zoom changes
        map.addListener('zoom_changed', () => {
          lastZoomRef.current = map.getZoom();
        });

      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Failed to initialize map');
      }
    };

    if (!window.google || !window.google.maps) {
      loadGoogleMapsScript(initMap);
    } else {
      initMap();
    }
  }, [initialCenter, initialZoom, debouncedUpdate]);

  // Load Google Maps script
  const loadGoogleMapsScript = (callback) => {
    const apiKey = window.googleMapsApiKey;

    if (!apiKey) {
      setMapError('Google Maps API key not configured');
      return;
    }

    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      const checkInterval = setInterval(async () => {
        if (window.google && window.google.maps) {
          clearInterval(checkInterval);
          // Ensure drawing library is available even if the existing
          // script tag did not include &libraries=drawing.
          if (!window.google.maps.drawing && window.google.maps.importLibrary) {
            try { await window.google.maps.importLibrary('drawing'); } catch (e) {}
          }
          callback();
        }
      }, 100);
      setTimeout(() => clearInterval(checkInterval), 5000);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=drawing&callback=initClusteredMap`;
    script.async = true;
    script.defer = true;

    window.initClusteredMap = () => {
      callback();
      delete window.initClusteredMap;
    };

    script.onerror = () => setMapError('Failed to load Google Maps');
    document.head.appendChild(script);
  };

  // Cleanup on unmount only (empty deps so it doesn't tear down the
  // polygon/markers every time searchFilters or debouncedUpdate change).
  useEffect(() => {
    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      if (markerClustererRef.current) {
        markerClustererRef.current.clearMarkers();
        markerClustererRef.current = null;
      }
      if (drawClickListenerRef.current) {
        window.google?.maps?.event?.removeListener(drawClickListenerRef.current);
        drawClickListenerRef.current = null;
      }
      if (drawMoveListenerRef.current) {
        window.google?.maps?.event?.removeListener(drawMoveListenerRef.current);
        drawMoveListenerRef.current = null;
      }
      if (rubberLineRef.current) {
        rubberLineRef.current.setMap(null);
        rubberLineRef.current = null;
      }
      if (drawDblClickListenerRef.current) {
        window.google?.maps?.event?.removeListener(drawDblClickListenerRef.current);
        drawDblClickListenerRef.current = null;
      }
      if (previewPolylineRef.current) {
        previewPolylineRef.current.setMap(null);
        previewPolylineRef.current = null;
      }
      previewMarkersRef.current.forEach((m) => m.setMap(null));
      previewMarkersRef.current = [];
      if (drawnPolygonRef.current) {
        drawnPolygonRef.current.setMap(null);
        drawnPolygonRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch when filters change
  useEffect(() => {
    if (mapLoaded && mapInstanceRef.current) {
      // While locked to a cluster's listings, don't refetch.
      if (lockedClusterRef.current) return;
      const zoom = mapInstanceRef.current.getZoom();

      // If a polygon was drawn, search inside the polygon (not the visible
      // viewport) so the markers reflect the drawn area.
      const polygonBounds = searchFilters?.viewport_bounds;
      if (polygonBounds && polygonBounds.polygon) {
        lastBoundsRef.current = null;
        updateMarkers(polygonBounds, zoom);
        return;
      }

      const bounds = mapInstanceRef.current.getBounds();
      if (bounds) {
        const viewportBounds = {
          north: bounds.getNorthEast().lat(),
          south: bounds.getSouthWest().lat(),
          east: bounds.getNorthEast().lng(),
          west: bounds.getSouthWest().lng()
        };

        // Reset bounds key to force refresh
        lastBoundsRef.current = null;
        updateMarkers(viewportBounds, zoom);
      }
    }
  }, [searchFilters, mapLoaded, updateMarkers]);

  if (mapError) {
    return (
      <div className={`${className} bg-gray-100 rounded-lg border flex items-center justify-center`}>
        <div className="text-center p-8">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Map Unavailable</h3>
          <p className="text-sm text-gray-600">{mapError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} relative rounded-lg overflow-hidden border bg-gray-50`} style={{ minHeight: '400px' }}>
      {/* Draw / Reset controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-row gap-2">
        <button
          onClick={toggleDrawingMode}
          className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold shadow-sm transition-colors ${
            isDrawingMode
              ? 'bg-[#1e293b] text-white border-[#1e293b]'
              : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
          }`}
          title="Draw a polygon to search within an area"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
            <path d="M2 2l7.586 7.586"></path>
            <circle cx="11" cy="11" r="2"></circle>
          </svg>
          {isDrawingMode ? 'Drawing...' : 'Draw'}
        </button>
        <button
          onClick={clearDrawnPolygon}
          disabled={!hasDrawnPolygon && !isDrawingMode}
          className="flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-800 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Reset the drawn area"
        >
          Reset
        </button>
      </div>

      {/* Drawing hint */}
      {isDrawingMode && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-black/75 text-white rounded-full px-4 py-2 text-sm font-medium shadow-lg pointer-events-none">
          Click on the map to add points — click the first point to close the area
        </div>
      )}

      {/* Stats overlay */}
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg px-3 py-2">
        <div className="text-sm font-medium text-gray-700">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#007cba]"></div>
              Loading...
            </span>
          ) : (
            <>
              {markerStats.displayed} of {markerStats.total.toLocaleString()} properties
            </>
          )}
        </div>
      </div>

      {/* Zoom hint */}
      {markerStats.displayed > 0 && markerStats.displayed < markerStats.total && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-black/70 text-white rounded-full px-4 py-2 text-sm">
          Zoom in to see more properties
        </div>
      )}

      <GoogleMapContainer
        onMapReady={handleMapContainerReady}
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />

      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Loading Map</h3>
            <p className="text-sm text-gray-600">Please wait...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClusteredPropertyMap;
