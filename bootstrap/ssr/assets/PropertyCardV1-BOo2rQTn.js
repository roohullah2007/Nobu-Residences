import { jsx, jsxs } from "react/jsx-runtime";
import "react";
import PropertyImageLoader from "./PropertyImageLoader-BD5_TkCg.js";
import { g as generatePropertyUrl } from "./propertyUrl-B4IVbEgn.js";
import { f as formatCardAddress, b as buildCardFeatures, g as getBrokerageName } from "./propertyFormatters-B0QibXFa.js";
import "./slug-BdTdDGUL.js";
const PropertyCardV1 = ({
  property,
  size = "default",
  onClick,
  className = ""
}) => {
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
      container: "w-[360px] h-[500px]",
      image: "h-[275px]",
      content: "p-4 gap-2.5 h-[225px]",
      chip: "px-4 py-1.5 text-sm",
      title: "text-lg",
      details: "text-base"
    },
    mobile: {
      container: "w-80 h-[450px]",
      image: "h-60",
      content: "p-3 gap-2 h-44",
      chip: "px-2 py-1 text-xs",
      title: "text-lg",
      details: "text-sm"
    }
  };
  const config = sizeConfig[size];
  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick(property);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: `flex-none ${config.container} bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-200 -translate-y-0.5 hover:-translate-y-0.10 shadow-xl hover:shadow-2xl group ${className}`, children: /* @__PURE__ */ jsxs(
    "a",
    {
      href: detailsUrl,
      className: "block h-full text-inherit no-underline",
      onClick: handleClick,
      children: [
        /* @__PURE__ */ jsxs("div", { className: `relative w-full ${config.image} overflow-hidden bg-gray-100 rounded-t-xl`, children: [
          property.image ? (
            // Use pre-fetched image from API if available
            /* @__PURE__ */ jsx(
              "img",
              {
                src: property.image,
                alt: `${property.propertyType || "Property"} in ${property.address}`,
                className: "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105",
                loading: "lazy"
              }
            )
          ) : (
            // Fallback to PropertyImageLoader for dynamic loading
            /* @__PURE__ */ jsx(
              PropertyImageLoader,
              {
                listingKey: property.listingKey,
                alt: `${property.propertyType || "Property"} in ${property.address}`,
                className: "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105",
                enableLazyLoading: true
              }
            )
          ),
          /* @__PURE__ */ jsxs("div", { className: "absolute inset-2 flex flex-col justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center gap-2.5 h-8", children: [
              /* @__PURE__ */ jsx("span", { className: `flex items-center justify-center ${config.chip} h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm bg-white text-[#293056] border border-gray-200`, children: property.transactionType || (property.isRental ? "Rent" : "Sale") }),
              /* @__PURE__ */ jsx("span", { className: `flex items-center justify-center ${config.chip} h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm ml-auto bg-white text-[#293056] border border-gray-200`, children: formattedPrice })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex justify-end items-center gap-2.5 h-8", children: /* @__PURE__ */ jsx(
              "button",
              {
                onClick: (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (window.openViewingModal) {
                    window.openViewingModal(property);
                  } else {
                    alert(`Request a viewing for ${property.address}`);
                  }
                },
                className: `flex items-center justify-center ${config.chip} h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm bg-white text-[#293056] border border-gray-200 hover:bg-gray-50 transition-colors duration-200`,
                "aria-label": `Request viewing for ${property.address}`,
                children: "Request"
              }
            ) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: `flex flex-col items-start ${config.content} box-border`, children: [
          /* @__PURE__ */ jsx("div", { className: `flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-bold ${config.title} leading-7 tracking-tight text-[#293056]`, children: property.propertyType || "Residential" }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start gap-2 w-full flex-1", children: [
            /* @__PURE__ */ jsx("div", { className: `flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal ${config.details} leading-6 tracking-tight text-[#293056]`, children: displayAddress }),
            features && /* @__PURE__ */ jsx("div", { className: `flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal ${config.details} leading-6 tracking-tight text-[#293056]`, children: features }),
            brokerageName && /* @__PURE__ */ jsx("div", { className: `flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-sm leading-5 tracking-tight text-gray-600`, children: brokerageName }),
            /* @__PURE__ */ jsx("div", { className: "flex items-center justify-start w-full min-h-8", children: /* @__PURE__ */ jsx("div", { className: `font-work-sans font-normal ${config.details} leading-6 tracking-tight text-[#293056]`, children: property.source === "mls" ? `MLS#: ${property.listingKey}` : `ID: ${property.listingKey}` }) })
          ] })
        ] })
      ]
    }
  ) });
};
export {
  PropertyCardV1 as default
};
