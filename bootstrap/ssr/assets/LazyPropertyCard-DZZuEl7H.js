import { jsx } from "react/jsx-runtime";
import { useRef, useState, useEffect } from "react";
import PropertyCardV5 from "./PropertyCardV5-CEcGAClp.js";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import "./propertyUrl-B4IVbEgn.js";
import "./slug-BdTdDGUL.js";
import "./propertyFormatters-B0QibXFa.js";
import "@inertiajs/react";
const LazyPropertyCard = ({
  property,
  size = "default",
  onClick,
  className = "",
  observeElement,
  onMouseEnter,
  onMouseLeave
}) => {
  const cardRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [localProperty, setLocalProperty] = useState(property);
  useEffect(() => {
    if (cardRef.current && property.listingKey && observeElement) {
      observeElement(cardRef.current, property.listingKey, (imageData) => {
        setLocalProperty((prev) => ({
          ...prev,
          imageUrl: imageData.image_url || null,
          images: imageData.all_images || []
        }));
        setImageLoaded(true);
      });
    }
  }, [property.listingKey, observeElement]);
  useEffect(() => {
    setLocalProperty(property);
  }, [property]);
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: cardRef,
      "data-listing-key": property.listingKey,
      className: `lazy-property-card ${imageLoaded ? "image-loaded" : "image-loading"}`,
      onMouseEnter,
      onMouseLeave,
      children: /* @__PURE__ */ jsx(
        PropertyCardV5,
        {
          property: localProperty,
          size,
          onClick,
          className
        }
      )
    }
  );
};
export {
  LazyPropertyCard as default
};
