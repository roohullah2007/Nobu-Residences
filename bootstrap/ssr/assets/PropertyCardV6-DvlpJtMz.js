import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import PluginStyleImageLoader from "./PluginStyleImageLoader-Rq93vDmq.js";
import { g as generatePropertyUrl } from "./propertyUrl-B4IVbEgn.js";
import RequestTourModal from "./RequestTourModal-CSp0gv_R.js";
import { f as formatCardAddress, b as buildCardFeatures, g as getBrokerageName } from "./propertyFormatters-B0QibXFa.js";
import "./slug-BdTdDGUL.js";
import "@inertiajs/react";
const PropertyCardV5 = ({
  property,
  size = "default",
  onClick,
  className = ""
}) => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const formatPrice = (price, isRental = false) => {
    if (!price || price <= 0) return "Price on request";
    let formattedPrice2 = "$" + price.toLocaleString();
    if (isRental) {
      formattedPrice2 += "/mo";
    }
    return formattedPrice2;
  };
  property.source === "mls" || property.listingKey && property.listingKey.length > 10;
  const formattedPrice = property.formatted_price || formatPrice(property.price, property.isRental);
  const displayAddress = formatCardAddress(property);
  const features = buildCardFeatures(property);
  const brokerageName = getBrokerageName(property);
  const detailsUrl = generatePropertyUrl(property);
  const sizeConfig = {
    default: {
      container: "w-[300px] max-w-[300px] min-h-[380px] idx-ampre-property-card",
      image: "h-[200px] property-image-container",
      content: "p-3 gap-2 min-h-[180px]",
      chip: "px-2.5 py-1.5 text-sm property-badge",
      title: "text-lg",
      details: "text-base"
    },
    mobile: {
      container: "w-[280px] max-w-[280px] min-h-[360px] idx-ampre-property-card",
      image: "h-[180px] property-image-container",
      content: "p-2.5 gap-2 min-h-[180px]",
      chip: "px-2 py-1 text-xs property-badge",
      title: "text-lg",
      details: "text-sm"
    },
    grid: {
      container: "w-full max-w-[300px] min-h-[380px] idx-ampre-property-card",
      image: "h-[200px] property-image-container",
      content: "p-3 gap-2 min-h-[180px]",
      chip: "px-2.5 py-1.5 text-sm property-badge",
      title: "text-lg",
      details: "text-base"
    }
  };
  const config = sizeConfig[size];
  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick(property);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: `flex flex-col ${config.container} bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl group ${className} relative flex-shrink-0`, children: [
    /* @__PURE__ */ jsxs(
      "a",
      {
        href: detailsUrl,
        className: "flex flex-col h-full text-inherit no-underline",
        onClick: handleClick,
        children: [
          /* @__PURE__ */ jsxs("div", { className: `relative w-full ${config.image} overflow-hidden bg-gray-100 rounded-t-xl`, children: [
            /* @__PURE__ */ jsx(
              PluginStyleImageLoader,
              {
                src: property.imageUrl,
                alt: `${property.propertyType || "Property"} in ${property.address}`,
                className: "w-full h-full property-image lazy-property-image transition-transform duration-300 group-hover:scale-105",
                enableLazyLoading: true,
                rootMargin: "200px",
                threshold: 0.01,
                enableBlurEffect: true,
                priority: "normal",
                "data-listing-key": property.listingKey
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "absolute inset-2 flex flex-col justify-between", children: [
              /* @__PURE__ */ jsx("div", { className: "flex justify-between items-center gap-2.5 h-8", children: property.source === "building" ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("span", { className: `flex items-center justify-center ${config.chip} h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm bg-white text-[#293056] border border-gray-200 status-badge`, children: "Building" }),
                (property.unitsForSale > 0 || property.unitsForRent > 0) && /* @__PURE__ */ jsx("span", { className: `flex items-center justify-center ${config.chip} h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm ml-auto bg-white text-[#293056] border border-gray-200`, children: property.unitsForSale > 0 ? `${property.unitsForSale} for sale` : `${property.unitsForRent} for rent` })
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("span", { className: `flex items-center justify-center ${config.chip} h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm bg-white text-[#293056] border border-gray-200 status-badge`, children: property.transactionType || (property.isRental ? "Rent" : "Sale") }),
                /* @__PURE__ */ jsx("span", { className: `flex items-center justify-center ${config.chip} h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm ml-auto bg-white text-[#293056] border border-gray-200`, children: formattedPrice })
              ] }) }),
              property.source !== "building" && /* @__PURE__ */ jsx("div", { className: "flex justify-end items-center gap-2.5 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300", children: /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowRequestModal(true);
                  },
                  className: "property-action-btn flex items-center justify-center px-3 py-1.5 h-8 rounded-full font-bold tracking-tight whitespace-nowrap",
                  "aria-label": `Request viewing for ${property.address}`,
                  children: "Request"
                }
              ) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: `flex flex-col flex-grow border-gray-300 border items-start ${config.content} box-border`, children: [
            /* @__PURE__ */ jsx("div", { className: `flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-bold ${config.title} leading-7 tracking-tight text-[#293056]`, children: property.source === "building" ? property.name || property.propertyType || "Residential Building" : property.propertyType || "Residential" }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start gap-2 w-full flex-1", children: [
              /* @__PURE__ */ jsx("div", { className: `flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal ${config.details} leading-6 tracking-tight text-[#293056] line-clamp-2`, children: displayAddress }),
              features && /* @__PURE__ */ jsx("div", { className: `flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal ${config.details} leading-6 tracking-tight text-[#293056]`, children: features }),
              brokerageName && /* @__PURE__ */ jsx("div", { className: `flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-sm leading-5 tracking-tight text-gray-600`, children: brokerageName }),
              /* @__PURE__ */ jsx("div", { className: "flex items-center justify-start w-full min-h-8", children: /* @__PURE__ */ jsx("div", { className: `font-work-sans font-normal ${config.details} leading-6 tracking-tight text-[#293056]`, children: property.source === "building" ? property.city && property.province ? `${property.city}, ${property.province}` : "" : property.source === "mls" ? `MLS#: ${property.listingKey}` : `ID: ${property.listingKey}` }) })
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      RequestTourModal,
      {
        isOpen: showRequestModal,
        onClose: () => setShowRequestModal(false),
        property
      }
    )
  ] });
};
export {
  PropertyCardV5 as default
};
