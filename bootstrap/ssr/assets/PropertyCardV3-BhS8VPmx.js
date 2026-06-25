import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
function PropertyCardV3({
  property,
  className = "",
  onFavoriteToggle,
  onViewingRequest
}) {
  const [isFavorited, setIsFavorited] = useState(false);
  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    if (onFavoriteToggle) {
      onFavoriteToggle(property.id, !isFavorited);
    }
  };
  const formatPrice = (price) => {
    if (!price || price <= 0) return "Price on request";
    return `$${price.toLocaleString()}`;
  };
  const formatPriceRange = (minPrice, maxPrice) => {
    if (minPrice && maxPrice) {
      return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
    }
    return formatPrice(minPrice || maxPrice || 0);
  };
  return /* @__PURE__ */ jsxs("div", { className: `bg-white shadow-xl border-gray-200 rounded-lg overflow-hidden hover:shadow-2xl transition-shadow duration-200 ${className}`, children: [
    /* @__PURE__ */ jsxs("div", { className: "relative aspect-[4/3] overflow-hidden", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: property.image || property.Images?.[0]?.MediaURL,
          alt: property.address || property.title,
          className: "w-full h-full object-cover"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleFavoriteClick,
          className: "absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors duration-200",
          children: /* @__PURE__ */ jsx(
            "svg",
            {
              className: `w-4 h-4 transition-colors duration-200 ${isFavorited ? "text-red-500 fill-red-500" : "text-gray-600"}`,
              fill: isFavorited ? "currentColor" : "none",
              stroke: "currentColor",
              viewBox: "0 0 24 24",
              children: /* @__PURE__ */ jsx(
                "path",
                {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                  d: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                }
              )
            }
          )
        }
      ),
      property.transactionType && /* @__PURE__ */ jsx("div", { className: "absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium", children: property.transactionType })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
      /* @__PURE__ */ jsx("div", { className: "text-lg font-bold text-gray-900 mb-1", children: property.priceRange ? formatPriceRange(property.minPrice, property.maxPrice) : formatPrice(property.price || 0) }),
      property.agent && /* @__PURE__ */ jsx("div", { className: "text-sm text-blue-600 font-medium mb-2", children: property.agent }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-sm text-gray-600 mb-2", children: [
        property.bedrooms > 0 && /* @__PURE__ */ jsxs("span", { children: [
          property.bedrooms,
          "BD"
        ] }),
        property.bathrooms > 0 && /* @__PURE__ */ jsxs("span", { children: [
          property.bathrooms,
          "BA"
        ] }),
        property.parking > 0 && /* @__PURE__ */ jsxs("span", { children: [
          property.parking,
          " Parking"
        ] }),
        property.area && /* @__PURE__ */ jsxs("span", { children: [
          property.area,
          " sqft"
        ] }),
        property.units && /* @__PURE__ */ jsxs("span", { children: [
          property.units,
          " units"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-700 leading-tight", children: property.address || property.location })
    ] })
  ] });
}
export {
  PropertyCardV3 as default
};
