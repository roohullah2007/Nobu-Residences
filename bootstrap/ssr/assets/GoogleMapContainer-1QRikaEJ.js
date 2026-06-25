import { jsx } from "react/jsx-runtime";
import { useRef, useState, useEffect } from "react";
const GoogleMapContainer = ({ onMapReady, className = "", style = {} }) => {
  const containerRef = useRef(null);
  const mapDivRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    if (!containerRef.current) return;
    const mapDiv = document.createElement("div");
    mapDiv.style.width = "100%";
    mapDiv.style.height = "100%";
    mapDiv.className = "google-map-container";
    containerRef.current.appendChild(mapDiv);
    mapDivRef.current = mapDiv;
    setIsReady(true);
    if (onMapReady) {
      onMapReady(mapDiv);
    }
    return () => {
      if (mapDivRef.current && mapDivRef.current.parentNode) {
        if (window.google && window.google.maps) {
          const mapInstance = mapDivRef.current._mapInstance;
          if (mapInstance) {
            if (window.google.maps.event) {
              window.google.maps.event.clearInstanceListeners(mapInstance);
            }
          }
        }
        setTimeout(() => {
          if (mapDivRef.current && mapDivRef.current.parentNode) {
            mapDivRef.current.parentNode.removeChild(mapDivRef.current);
          }
        }, 0);
      }
    };
  }, []);
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: containerRef,
      className,
      style
    }
  );
};
export {
  GoogleMapContainer as default
};
