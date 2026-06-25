import { jsx, jsxs } from "react/jsx-runtime";
import "react";
import { createRoot } from "react-dom/client";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import "@inertiajs/react";
const MapPropertyCard = ({ property, onClose }) => {
  const formattedProperty = {
    id: property.ListingKey || property.listingKey,
    listingKey: property.ListingKey || property.listingKey,
    price: property.ListPrice || property.price,
    bedrooms: property.BedroomsTotal || property.bedrooms,
    bathrooms: property.BathroomsTotalInteger || property.bathrooms,
    sqft: property.AboveGradeFinishedArea || property.sqft,
    parking: property.ParkingTotal || property.parking,
    address: property.UnparsedAddress || property.address,
    propertyType: property.PropertySubType || property.propertyType,
    transactionType: property.TransactionType || property.transactionType,
    city: property.City || property.city,
    province: property.StateOrProvince || property.province,
    source: property.source || "mls",
    // Use imageUrl which should be the same as what's shown in the list
    imageUrl: property.imageUrl || property.MediaURL || property.image_url,
    images: property.Images || property.images || []
  };
  const handleCardClick = () => {
    window.location.href = `/property/${property.ListingKey}`;
  };
  const formatPrice = (price) => {
    if (!price || price <= 0) return "Price on request";
    return "$" + price.toLocaleString();
  };
  const buildFeatures = (bedrooms, bathrooms) => {
    const features = [];
    if (bedrooms > 0) features.push(bedrooms + " Bed" + (bedrooms > 1 ? "s" : ""));
    if (bathrooms > 0) features.push(bathrooms + " Bath" + (bathrooms > 1 ? "s" : ""));
    return features.join(" | ");
  };
  return /* @__PURE__ */ jsx("div", { className: "map-property-card-wrapper", style: { width: "240px" }, children: /* @__PURE__ */ jsxs(
    "div",
    {
      onClick: handleCardClick,
      className: "cursor-pointer map-card-compact bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "relative", style: { height: "115px" }, children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: formattedProperty.imageUrl || "/images/no-image.jpg",
              alt: formattedProperty.address,
              className: "w-full h-full object-cover",
              style: { height: "115px" }
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-bold shadow", children: formatPrice(formattedProperty.price) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-2.5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-1", children: [
            /* @__PURE__ */ jsx("span", { className: "font-semibold text-sm text-gray-900", children: formattedProperty.propertyType || "Residential" }),
            /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-600", children: [
              "MLS#: ",
              formattedProperty.listingKey
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-700 mb-1 line-clamp-1", children: formattedProperty.address }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-600", children: buildFeatures(formattedProperty.bedrooms, formattedProperty.bathrooms) })
        ] })
      ]
    }
  ) });
};
const renderPropertyCardInInfoWindow = (property, infoWindow, map) => {
  const container = document.createElement("div");
  container.id = `map-card-${property.ListingKey || property.listingKey}`;
  container.style.width = "240px";
  container.style.maxWidth = "240px";
  const root = createRoot(container);
  const handleClose = () => {
    infoWindow.close();
  };
  root.render(/* @__PURE__ */ jsx(MapPropertyCard, { property, onClose: handleClose }));
  infoWindow.setContent(container);
  setTimeout(() => {
    if (infoWindow && infoWindow.getMap()) {
      window.google.maps.event.trigger(infoWindow, "domready");
    }
  }, 100);
  return () => {
    setTimeout(() => {
      try {
        root.unmount();
      } catch (e) {
      }
    }, 100);
  };
};
export {
  MapPropertyCard as default,
  renderPropertyCardInInfoWindow
};
