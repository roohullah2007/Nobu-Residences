import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
const CompareModal = ({ isOpen, onClose, properties = [] }) => {
  const [compareList, setCompareList] = useState([]);
  useEffect(() => {
    if (properties.length > 0) {
      setCompareList(properties);
    }
  }, [properties]);
  if (!isOpen) return null;
  const formatPrice = (price, isRental = false) => {
    if (!price || price <= 0) return "N/A";
    let formattedPrice = "$" + price.toLocaleString();
    if (isRental) {
      formattedPrice += "/mo";
    }
    return formattedPrice;
  };
  const removeFromCompare = (listingKey) => {
    setCompareList(compareList.filter((p) => p.listingKey !== listingKey));
    if (window.removeFromCompare) {
      window.removeFromCompare(listingKey);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-800", children: "Compare Properties" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onClose,
          className: "p-2 hover:bg-gray-100 rounded-full transition-colors",
          "aria-label": "Close compare modal",
          children: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
        }
      )
    ] }),
    compareList.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-lg", children: "No properties selected for comparison" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-400 mt-2", children: 'Click "Compare" on property cards to add them here' })
    ] }) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full border-collapse", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b-2 border-gray-200", children: [
        /* @__PURE__ */ jsx("th", { className: "text-left p-4 font-semibold text-gray-700", children: "Property" }),
        compareList.map((property) => /* @__PURE__ */ jsx("th", { className: "p-4 min-w-[250px]", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => removeFromCompare(property.listingKey),
              className: "absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors",
              "aria-label": `Remove ${property.address} from comparison`,
              children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
            }
          ),
          property.imageUrl && /* @__PURE__ */ jsx(
            "img",
            {
              src: property.imageUrl,
              alt: property.address,
              className: "w-full h-32 object-cover rounded-lg mb-2"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "text-left", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-800", children: property.address }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: property.propertyType || "Residential" })
          ] })
        ] }) }, property.listingKey))
      ] }) }),
      /* @__PURE__ */ jsxs("tbody", { children: [
        /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-200", children: [
          /* @__PURE__ */ jsx("td", { className: "p-4 font-semibold text-gray-700", children: "Price" }),
          compareList.map((property) => /* @__PURE__ */ jsx("td", { className: "p-4 text-center font-bold text-lg", children: formatPrice(property.price, property.isRental) }, property.listingKey))
        ] }),
        /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-200 bg-gray-50", children: [
          /* @__PURE__ */ jsx("td", { className: "p-4 font-semibold text-gray-700", children: "Bedrooms" }),
          compareList.map((property) => /* @__PURE__ */ jsx("td", { className: "p-4 text-center", children: property.bedrooms || "N/A" }, property.listingKey))
        ] }),
        /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-200", children: [
          /* @__PURE__ */ jsx("td", { className: "p-4 font-semibold text-gray-700", children: "Bathrooms" }),
          compareList.map((property) => /* @__PURE__ */ jsx("td", { className: "p-4 text-center", children: property.bathrooms || "N/A" }, property.listingKey))
        ] }),
        /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-200 bg-gray-50", children: [
          /* @__PURE__ */ jsx("td", { className: "p-4 font-semibold text-gray-700", children: "Square Feet" }),
          compareList.map((property) => /* @__PURE__ */ jsx("td", { className: "p-4 text-center", children: property.squareFeet ? `${property.squareFeet.toLocaleString()} sq ft` : "N/A" }, property.listingKey))
        ] }),
        /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-200", children: [
          /* @__PURE__ */ jsx("td", { className: "p-4 font-semibold text-gray-700", children: "Lot Size" }),
          compareList.map((property) => /* @__PURE__ */ jsx("td", { className: "p-4 text-center", children: property.lotSize || "N/A" }, property.listingKey))
        ] }),
        /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-200 bg-gray-50", children: [
          /* @__PURE__ */ jsx("td", { className: "p-4 font-semibold text-gray-700", children: "Year Built" }),
          compareList.map((property) => /* @__PURE__ */ jsx("td", { className: "p-4 text-center", children: property.yearBuilt || "N/A" }, property.listingKey))
        ] }),
        /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-200", children: [
          /* @__PURE__ */ jsx("td", { className: "p-4 font-semibold text-gray-700", children: "MLS #" }),
          compareList.map((property) => /* @__PURE__ */ jsx("td", { className: "p-4 text-center", children: property.listingKey || "N/A" }, property.listingKey))
        ] }),
        /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("td", { className: "p-4 font-semibold text-gray-700", children: "Actions" }),
          compareList.map((property) => /* @__PURE__ */ jsx("td", { className: "p-4 text-center", children: /* @__PURE__ */ jsx(
            "a",
            {
              href: `/property/${property.listingKey}`,
              className: "inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors",
              children: "View Details"
            }
          ) }, property.listingKey))
        ] })
      ] })
    ] }) }),
    compareList.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-6 flex justify-end gap-4", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            setCompareList([]);
            if (window.clearCompareList) {
              window.clearCompareList();
            }
          },
          className: "px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors",
          children: "Clear All"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onClose,
          className: "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors",
          children: "Close"
        }
      )
    ] })
  ] }) });
};
export {
  CompareModal as default
};
