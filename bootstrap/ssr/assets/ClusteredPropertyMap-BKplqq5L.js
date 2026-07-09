import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useRef, useState, useCallback, useEffect } from "react";
import GoogleMapContainer from "./GoogleMapContainer-1QRikaEJ.js";
import { debounce } from "lodash";
const CONDOS_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#f3f4f6" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6b7280" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.neighborhood", stylers: [{ visibility: "off" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#d7ead5" }, { visibility: "on" }] },
  { featureType: "poi.park", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#e5e7eb" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#d1d5db" }] },
  { featureType: "road.local", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#cfe3ef" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#7fa9c3" }] }
];
const ClusteredPropertyMap = ({
  searchFilters = {},
  className = "",
  onPropertyClick = null,
  onMarkerCountChange = null,
  onPolygonDraw = null,
  initialCenter = { lat: 43.6532, lng: -79.3832 },
  // Toronto default
  initialZoom = 11
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
  const isDrawingModeRef = useRef(false);
  const wasDrawingRef = useRef(false);
  const justCommittedPolygonRef = useRef(false);
  const [hasDrawnPolygon, setHasDrawnPolygon] = useState(false);
  const [markerStats, setMarkerStats] = useState({ displayed: 0, total: 0 });
  const lastBoundsRef = useRef(null);
  const lastZoomRef = useRef(initialZoom);
  const getCsrfToken = () => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";
  };
  const formatPrice = (price) => {
    if (!price || price <= 0) return "?";
    if (price >= 1e6) {
      return "$" + (price / 1e6).toFixed(1) + "M";
    }
    return "$" + Math.round(price / 1e3) + "K";
  };
  const fetchMapCoordinates = useCallback(async (bounds, zoom) => {
    if (!bounds) return { coordinates: [], clusters: [] };
    setIsLoading(true);
    try {
      const searchParams = {
        ...searchFilters,
        viewport_bounds: bounds,
        zoom_level: zoom
      };
      const response = await fetch("/api/map-coordinates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCsrfToken(),
          "Accept": "application/json"
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
        return {
          coordinates: result.data.coordinates || [],
          clusters: result.data.clusters || [],
          fitBounds: result.data.fit_bounds || null
        };
      }
      return { coordinates: [], clusters: [], fitBounds: null };
    } catch (error) {
      console.error("Error fetching map coordinates:", error);
      return { coordinates: [], clusters: [], fitBounds: null };
    } finally {
      setIsLoading(false);
    }
  }, [searchFilters, onMarkerCountChange]);
  const createMarkerIcon = (price, isHovered = false) => {
    const priceText = formatPrice(price);
    const bgColor = isHovered ? "#0056b3" : "#007cba";
    const width = 70;
    const height = 36;
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="${width - 4}" height="${height - 10}" rx="4" fill="${bgColor}" stroke="white" stroke-width="1.5"/>
          <text x="${width / 2}" y="${height / 2 - 2}" text-anchor="middle" fill="white" font-size="11" font-weight="bold" font-family="Arial, sans-serif">${priceText}</text>
          <polygon points="${width / 2},${height - 4} ${width / 2 + 6},${height - 10} ${width / 2 - 6},${height - 10}" fill="${bgColor}" stroke="white" stroke-width="1.5"/>
        </svg>
      `)}`,
      scaledSize: new window.google.maps.Size(width, height),
      anchor: new window.google.maps.Point(width / 2, height)
    };
  };
  const createClusterIcon = (count) => {
    const size = count < 10 ? 28 : count < 100 ? 34 : 42;
    const bgColor = count < 10 ? "#2e7a8b" : count < 100 ? "#236676" : "#1a5260";
    const fontSize = count < 10 ? 12 : count < 100 ? 12 : 11;
    const pad = 3;
    const box = size + pad * 2;
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="${box}" height="${box}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="s" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-opacity="0.25"/>
            </filter>
          </defs>
          <g filter="url(#s)">
            <circle cx="${box / 2}" cy="${box / 2}" r="${size / 2}" fill="${bgColor}" stroke="white" stroke-width="2"/>
          </g>
          <text x="${box / 2}" y="${box / 2 + fontSize / 3}" text-anchor="middle" fill="white" font-size="${fontSize}" font-weight="700" font-family="'Helvetica',Arial,sans-serif">${count}</text>
        </svg>
      `)}`,
      scaledSize: new window.google.maps.Size(box, box),
      anchor: new window.google.maps.Point(box / 2, box / 2)
    };
  };
  const clearMarkers = useCallback(() => {
    if (markerClustererRef.current) {
      markerClustererRef.current.clearMarkers();
    }
    markersRef.current.forEach((marker) => {
      marker.setMap(null);
    });
    markersRef.current = [];
  }, []);
  const updateMarkers = useCallback(async (bounds, zoom) => {
    if (!mapInstanceRef.current || !window.google) return;
    if (isDrawingModeRef.current) {
      clearMarkers();
      return;
    }
    const roundedBounds = {
      north: Math.round(bounds.north * 1e3) / 1e3,
      south: Math.round(bounds.south * 1e3) / 1e3,
      east: Math.round(bounds.east * 1e3) / 1e3,
      west: Math.round(bounds.west * 1e3) / 1e3
    };
    if (bounds.polygon) {
      roundedBounds.polygon = bounds.polygon;
    }
    const polyKey = bounds.polygon ? `_p${bounds.polygon.length}_${bounds.polygon[0]?.[0]}_${bounds.polygon[0]?.[1]}` : "";
    const boundsKey = `${roundedBounds.north}_${roundedBounds.south}_${roundedBounds.east}_${roundedBounds.west}_${zoom}${polyKey}`;
    if (lastBoundsRef.current === boundsKey) {
      return;
    }
    lastBoundsRef.current = boundsKey;
    const { coordinates, clusters, fitBounds } = await fetchMapCoordinates(roundedBounds, zoom);
    clearMarkers();
    if ((!coordinates || coordinates.length === 0) && (!clusters || clusters.length === 0)) {
      return;
    }
    if (!infoWindowRef.current) {
      infoWindowRef.current = new window.google.maps.InfoWindow({
        maxWidth: 280,
        pixelOffset: new window.google.maps.Size(0, -5)
      });
    }
    const map = mapInstanceRef.current;
    const allMarkers = [];
    coordinates.forEach((coord) => {
      const marker = new window.google.maps.Marker({
        position: { lat: coord.lat, lng: coord.lng },
        icon: createMarkerIcon(coord.price),
        title: coord.address,
        optimized: true,
        zIndex: 100,
        map
      });
      marker._propertyData = coord;
      marker.addListener("mouseover", () => {
        marker.setIcon(createMarkerIcon(coord.price, true));
        marker.setZIndex(200);
      });
      marker.addListener("mouseout", () => {
        marker.setIcon(createMarkerIcon(coord.price, false));
        marker.setZIndex(100);
      });
      marker.addListener("click", () => {
        const href = coord.mls_id ? `/property/${coord.mls_id}` : "#";
        const imageHtml = coord.image ? `<div style="width:100%;height:160px;background:#f3f4f6 url('${coord.image}') center/cover no-repeat;"></div>` : `<div style="width:100%;height:160px;background:#e5e7eb;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:12px;">No image</div>`;
        const content = `
          <a href="${href}" style="display:block;width:260px;text-decoration:none;color:inherit;font-family:'Helvetica',Arial,sans-serif;background:#fff;border-radius:14px;overflow:hidden;">
            ${imageHtml}
            <div style="padding:14px 14px 16px 14px;">
              <div style="font-weight:800;font-size:22px;color:#0f172a;line-height:1.1;margin-bottom:8px;">${formatPrice(coord.price)}</div>
              <div style="font-size:14px;color:#0f172a;line-height:1.35;margin-bottom:2px;">${coord.address || "Address not available"}</div>
              <div style="font-size:13px;color:#94a3b8;margin-bottom:10px;">${coord.city || ""}</div>
              <div style="font-size:13px;color:#0f172a;display:flex;gap:14px;align-items:center;">
                <span>${coord.beds || 0} bd</span>
                <span>${coord.baths || 0} ba</span>
                ${coord.type ? `<span>${coord.type}</span>` : ""}
              </div>
            </div>
          </a>
        `;
        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(map, marker);
      });
      allMarkers.push(marker);
    });
    clusters.forEach((cluster) => {
      const marker = new window.google.maps.Marker({
        position: { lat: cluster.lat, lng: cluster.lng },
        icon: createClusterIcon(cluster.count),
        title: `${cluster.count} listings`,
        optimized: true,
        zIndex: Number(window.google.maps.Marker.MAX_ZINDEX) + cluster.count,
        map
      });
      marker.addListener("click", () => {
        const currentZoom = map.getZoom();
        const targetZoom = Math.min(currentZoom + 3, 21);
        map.setCenter({ lat: cluster.lat, lng: cluster.lng });
        map.setZoom(targetZoom);
      });
      allMarkers.push(marker);
    });
    markersRef.current = allMarkers;
    if (fitBounds) {
      lastBoundsRef.current = null;
      const isSinglePoint = Math.abs(fitBounds.north - fitBounds.south) < 5e-4 && Math.abs(fitBounds.east - fitBounds.west) < 5e-4;
      if (isSinglePoint) {
        map.setCenter({
          lat: (fitBounds.north + fitBounds.south) / 2,
          lng: (fitBounds.east + fitBounds.west) / 2
        });
        map.setZoom(15);
      } else {
        map.fitBounds(
          new window.google.maps.LatLngBounds(
            { lat: fitBounds.south, lng: fitBounds.west },
            { lat: fitBounds.north, lng: fitBounds.east }
          ),
          40
        );
      }
    }
    console.log(`Map updated: ${coordinates.length} listings + ${clusters.length} clusters`);
  }, [fetchMapCoordinates, clearMarkers]);
  const debouncedUpdate = useCallback(
    debounce((bounds, zoom) => {
      updateMarkers(bounds, zoom);
    }, 500),
    [updateMarkers]
  );
  const clearDrawnPolygon = useCallback(() => {
    if (drawnPolygonRef.current) {
      drawnPolygonRef.current.setMap(null);
      drawnPolygonRef.current = null;
    }
    const wasLocked = !!lockedClusterRef.current;
    lockedClusterRef.current = null;
    setHasDrawnPolygon(false);
    if (wasLocked && mapInstanceRef.current) {
      const map = mapInstanceRef.current;
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      if (bounds) {
        const viewportBounds = {
          north: bounds.getNorthEast().lat(),
          south: bounds.getSouthWest().lat(),
          east: bounds.getNorthEast().lng(),
          west: bounds.getSouthWest().lng()
        };
        lastBoundsRef.current = null;
        updateMarkers(viewportBounds, zoom);
      }
    }
    if (onPolygonDraw) {
      onPolygonDraw(null);
    }
  }, [onPolygonDraw, updateMarkers]);
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
    if (prevMapOptionsRef.current) {
      map.setOptions(prevMapOptionsRef.current);
      prevMapOptionsRef.current = null;
    }
    const points = drawPointsRef.current.slice();
    clearDrawingPreview();
    setIsDrawingMode(false);
    if (!commit || points.length < 3) return;
    const polygon = new window.google.maps.Polygon({
      paths: points,
      fillColor: "#2563eb",
      fillOpacity: 0.1,
      strokeColor: "#2563eb",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      clickable: false,
      editable: false,
      zIndex: 1
    });
    polygon.setMap(map);
    if (drawnPolygonRef.current) {
      drawnPolygonRef.current.setMap(null);
    }
    drawnPolygonRef.current = polygon;
    setHasDrawnPolygon(true);
    const coordinates = points.map((p) => [p.lng(), p.lat()]);
    coordinates.push(coordinates[0]);
    const bounds = new window.google.maps.LatLngBounds();
    points.forEach((p) => bounds.extend(p));
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    if (onPolygonDraw) {
      justCommittedPolygonRef.current = true;
      onPolygonDraw({
        north: ne.lat(),
        south: sw.lat(),
        east: ne.lng(),
        west: sw.lng(),
        polygon: coordinates
      });
    }
  }, [clearDrawingPreview, onPolygonDraw]);
  const redrawPreview = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const pts = drawPointsRef.current;
    if (!previewPolylineRef.current) {
      previewPolylineRef.current = new window.google.maps.Polyline({
        path: pts,
        strokeColor: "#2563eb",
        strokeOpacity: 0.9,
        strokeWeight: 2,
        clickable: false,
        map
      });
    } else {
      previewPolylineRef.current.setPath(pts);
    }
    while (previewMarkersRef.current.length < pts.length) {
      const idx = previewMarkersRef.current.length;
      const isFirst = idx === 0;
      const marker = new window.google.maps.Marker({
        position: pts[idx],
        map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: isFirst ? 7 : 5,
          fillColor: isFirst ? "#2563eb" : "#ffffff",
          fillOpacity: 1,
          strokeColor: "#2563eb",
          strokeWeight: 2
        },
        clickable: false,
        zIndex: 10
      });
      previewMarkersRef.current.push(marker);
    }
  }, []);
  const toggleDrawingMode = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (isDrawingMode) {
      stopDrawing(false);
      return;
    }
    if (drawnPolygonRef.current) {
      drawnPolygonRef.current.setMap(null);
      drawnPolygonRef.current = null;
      setHasDrawnPolygon(false);
    }
    prevMapOptionsRef.current = {
      draggableCursor: null,
      disableDoubleClickZoom: false
    };
    map.setOptions({
      draggableCursor: "crosshair",
      disableDoubleClickZoom: true
    });
    drawPointsRef.current = [];
    setIsDrawingMode(true);
    drawMoveListenerRef.current = map.addListener("mousemove", (e) => {
      const pts = drawPointsRef.current;
      if (pts.length === 0) return;
      const last = pts[pts.length - 1];
      const path = [last, e.latLng];
      if (!rubberLineRef.current) {
        const dashSymbol = {
          path: "M 0,-1 0,1",
          strokeColor: "#2563eb",
          strokeOpacity: 0.9,
          strokeWeight: 2,
          scale: 3
        };
        rubberLineRef.current = new window.google.maps.Polyline({
          path,
          strokeOpacity: 0,
          icons: [{ icon: dashSymbol, offset: "0", repeat: "10px" }],
          clickable: false,
          map,
          zIndex: 5
        });
      } else {
        rubberLineRef.current.setPath(path);
      }
    });
    drawClickListenerRef.current = map.addListener("click", (e) => {
      const pts = drawPointsRef.current;
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
  const handleMapContainerReady = useCallback((mapDiv) => {
    if (!mapDiv || mapInstanceRef.current) return;
    const initMap = async () => {
      if (!window.google || !window.google.maps) {
        setMapError("Google Maps not loaded");
        return;
      }
      try {
        const map = new window.google.maps.Map(mapDiv, {
          center: initialCenter,
          zoom: initialZoom,
          mapTypeId: "roadmap",
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: true,
          scrollwheel: true,
          gestureHandling: "greedy",
          clickableIcons: false,
          styles: CONDOS_MAP_STYLE
        });
        mapInstanceRef.current = map;
        setMapLoaded(true);
        const gtaPath = [
          { lat: 44.05, lng: -79.95 },
          { lat: 44.3, lng: -79.5 },
          { lat: 44.4, lng: -79.1 },
          { lat: 44.05, lng: -78.85 },
          { lat: 43.85, lng: -78.75 },
          { lat: 43.55, lng: -78.85 },
          { lat: 43.4, lng: -79.4 },
          { lat: 43.3, lng: -79.95 }
        ];
        new window.google.maps.Polygon({
          paths: gtaPath,
          strokeColor: "#0f172a",
          strokeOpacity: 0.7,
          strokeWeight: 2,
          fillOpacity: 0,
          clickable: false,
          map
        });
        map.addListener("idle", () => {
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
        map.addListener("zoom_changed", () => {
          lastZoomRef.current = map.getZoom();
        });
      } catch (error) {
        console.error("Error initializing map:", error);
        setMapError("Failed to initialize map");
      }
    };
    if (!window.google || !window.google.maps) {
      loadGoogleMapsScript(initMap);
    } else {
      initMap();
    }
  }, [initialCenter, initialZoom, debouncedUpdate]);
  const loadGoogleMapsScript = (callback) => {
    const apiKey = window.googleMapsApiKey;
    if (!apiKey) {
      setMapError("Google Maps API key not configured");
      return;
    }
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      const checkInterval = setInterval(async () => {
        if (window.google && window.google.maps) {
          clearInterval(checkInterval);
          if (!window.google.maps.drawing && window.google.maps.importLibrary) {
            try {
              await window.google.maps.importLibrary("drawing");
            } catch (e) {
            }
          }
          callback();
        }
      }, 100);
      setTimeout(() => clearInterval(checkInterval), 5e3);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=drawing&callback=initClusteredMap`;
    script.async = true;
    script.defer = true;
    window.initClusteredMap = () => {
      callback();
      delete window.initClusteredMap;
    };
    script.onerror = () => setMapError("Failed to load Google Maps");
    document.head.appendChild(script);
  };
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
  }, []);
  useEffect(() => {
    if (mapLoaded && mapInstanceRef.current) {
      if (lockedClusterRef.current) return;
      const zoom = mapInstanceRef.current.getZoom();
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
        lastBoundsRef.current = null;
        updateMarkers(viewportBounds, zoom);
      }
    }
  }, [searchFilters, mapLoaded, updateMarkers]);
  useEffect(() => {
    isDrawingModeRef.current = isDrawingMode;
    if (!mapLoaded || !mapInstanceRef.current) return;
    if (isDrawingMode) {
      wasDrawingRef.current = true;
      clearMarkers();
    } else if (wasDrawingRef.current) {
      wasDrawingRef.current = false;
      if (justCommittedPolygonRef.current) {
        justCommittedPolygonRef.current = false;
        return;
      }
      const map = mapInstanceRef.current;
      const bounds = map.getBounds();
      if (bounds) {
        lastBoundsRef.current = null;
        updateMarkers({
          north: bounds.getNorthEast().lat(),
          south: bounds.getSouthWest().lat(),
          east: bounds.getNorthEast().lng(),
          west: bounds.getSouthWest().lng()
        }, map.getZoom());
      }
    }
  }, [isDrawingMode, mapLoaded, clearMarkers, updateMarkers]);
  if (mapError) {
    return /* @__PURE__ */ jsx("div", { className: `${className} bg-gray-100 rounded-lg border flex items-center justify-center`, children: /* @__PURE__ */ jsxs("div", { className: "text-center p-8", children: [
      /* @__PURE__ */ jsx("div", { className: "text-red-500 mb-2", children: /* @__PURE__ */ jsx("svg", { className: "w-12 h-12 mx-auto", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-1", children: "Map Unavailable" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: mapError })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: `${className} relative rounded-lg overflow-hidden border bg-gray-50`, style: { minHeight: "400px" }, children: [
    /* @__PURE__ */ jsxs("div", { className: "absolute top-4 left-4 z-10 flex flex-row gap-2", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: toggleDrawingMode,
          className: `flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold shadow-sm transition-colors ${isDrawingMode ? "bg-[#1e293b] text-white border-[#1e293b]" : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"}`,
          title: "Draw a polygon to search within an area",
          children: [
            /* @__PURE__ */ jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ jsx("path", { d: "M12 19l7-7 3 3-7 7-3-3z" }),
              /* @__PURE__ */ jsx("path", { d: "M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" }),
              /* @__PURE__ */ jsx("path", { d: "M2 2l7.586 7.586" }),
              /* @__PURE__ */ jsx("circle", { cx: "11", cy: "11", r: "2" })
            ] }),
            isDrawingMode ? "Drawing..." : "Draw"
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: clearDrawnPolygon,
          disabled: !hasDrawnPolygon && !isDrawingMode,
          className: "flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-800 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed",
          title: "Reset the drawn area",
          children: "Reset"
        }
      )
    ] }),
    isDrawingMode && /* @__PURE__ */ jsx("div", { className: "absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-black/75 text-white rounded-full px-4 py-2 text-sm font-medium shadow-lg pointer-events-none", children: "Click on the map to add points — click the first point to close the area" }),
    /* @__PURE__ */ jsx("div", { className: "absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg px-3 py-2", children: /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-gray-700", children: isLoading ? /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-[#007cba]" }),
      "Loading..."
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      markerStats.total.toLocaleString(),
      " ",
      markerStats.total === 1 ? "listing" : "listings"
    ] }) }) }),
    /* @__PURE__ */ jsx(
      GoogleMapContainer,
      {
        onMapReady: handleMapContainerReady,
        className: "w-full h-full",
        style: { minHeight: "400px" }
      }
    ),
    !mapLoaded && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gray-50 flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center p-8", children: [
      /* @__PURE__ */ jsx("div", { className: "w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-1", children: "Loading Map" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: "Please wait..." })
    ] }) })
  ] });
};
export {
  ClusteredPropertyMap as default
};
