import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link } from "@inertiajs/react";
import axios from "axios";
const formatPrice = (price, isRental = false) => {
  if (!price || price === 0) return "Price TBD";
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isRental) {
    return `$${numPrice.toLocaleString()}/mo`;
  } else {
    if (numPrice >= 1e6) {
      const millions = (numPrice / 1e6).toFixed(1);
      return `$${millions.replace(/\.0$/, "")}M`;
    } else if (numPrice >= 1e3) {
      const thousands = (numPrice / 1e3).toFixed(0);
      return `$${thousands}K`;
    } else {
      return `$${numPrice.toLocaleString()}`;
    }
  }
};
const PropertyCard = ({ property }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const price = formatPrice(property.ListPrice || property.price || 0, property.isRental);
  const bedrooms = property.BedroomsTotal || property.bedroomsTotal || property.bedrooms || 0;
  const bathrooms = property.BathroomsTotalInteger || property.bathroomsTotalInteger || property.bathrooms || 0;
  const sqft = property.LivingAreaRange || property.livingAreaRange || property.sqft || "";
  property.ParkingTotal || property.parkingTotal || property.parking || 0;
  const listingKey = property.ListingKey || property.listingKey || "";
  const propertyType = property.PropertySubType || property.propertyType || "Property";
  const transactionType = property.TransactionType || property.transactionType || "For Sale";
  const listOfficeName = property.ListOfficeName || property.listOfficeName || "";
  let displayAddress = "";
  if (property.source === "building") {
    displayAddress = property.address || property.name || "Building Address";
  } else {
    const unitNumber = property.UnitNumber || property.unitNumber || "";
    const streetNumber = property.StreetNumber || property.streetNumber || "";
    const streetName = property.StreetName || property.streetName || "";
    property.StreetSuffix || property.streetSuffix || "";
    if (unitNumber && streetNumber && streetName) {
      displayAddress = `${unitNumber} - ${streetNumber} ${streetName}`.trim();
    } else if (streetNumber && streetName) {
      displayAddress = `${streetNumber} ${streetName}`.trim();
    } else {
      const fallbackAddress = property.address || property.UnparsedAddress || property.unparsedAddress || "";
      if (fallbackAddress) {
        const parts = fallbackAddress.split(",");
        displayAddress = parts[0].trim();
      } else {
        displayAddress = "Address not available";
      }
    }
  }
  const imageUrl = property.MediaURL || property.imageUrl || property.image || "/images/no-image-placeholder.jpg";
  const propertyUrl = `/property/${listingKey}`;
  const statusBadgeText = transactionType === "For Lease" ? "For Rent" : transactionType;
  const sqftDisplay = sqft ? typeof sqft === "string" ? sqft : `${sqft} sqft` : "";
  const handlePropertyClick = (e) => {
    const mlsId = listingKey;
    if (mlsId) {
      console.log("🤖 PropertyCard clicked - Triggering immediate AI generation for:", mlsId);
      axios.post("/api/property-ai/generate-description", {
        mls_id: mlsId,
        force_regenerate: false
      }).catch(() => {
      });
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "flex flex-col w-[300px] min-h-0 idx-property-card bg-white border-gray-300 border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl group relative", children: /* @__PURE__ */ jsxs(Link, { href: propertyUrl, className: "flex flex-col h-full text-inherit no-underline", onClick: handlePropertyClick, children: [
    /* @__PURE__ */ jsxs("div", { className: "relative w-full h-[200px] property-image-container overflow-hidden bg-gray-100 rounded-t-xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden w-full h-full property-image lazy-property-image transition-transform duration-300 group-hover:scale-105", children: [
        imageLoading && !imageError && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 z-20 flex items-center justify-center bg-gray-100", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-2", children: [
          /* @__PURE__ */ jsx("div", { className: "w-full h-full absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-pulse" }),
          /* @__PURE__ */ jsx("div", { className: "relative z-10 w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" }),
          /* @__PURE__ */ jsx("span", { className: "relative z-10 text-xs text-gray-600 font-medium", children: "Loading image..." })
        ] }) }),
        imageError && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 z-20 flex items-center justify-center bg-gray-50", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-2 text-gray-500", children: [
          /* @__PURE__ */ jsx("svg", { className: "w-8 h-8", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" }) }),
          /* @__PURE__ */ jsx("span", { className: "text-xs font-medium", children: "Image unavailable" })
        ] }) }),
        /* @__PURE__ */ jsx(
          "img",
          {
            src: imageUrl,
            alt: `${propertyType} in ${displayAddress}`,
            className: `w-full h-full object-cover transition-all duration-500 ease-out ${imageLoading ? "opacity-50 scale-105 blur-sm" : "opacity-100 scale-100 blur-0"}`,
            onLoad: () => {
              setImageLoading(false);
              setImageError(false);
            },
            onError: (e) => {
              if (!imageError) {
                setImageError(true);
                setImageLoading(false);
                e.target.src = "/images/no-image-placeholder.jpg";
              }
            }
          }
        ),
        !imageLoading && !imageError && /* @__PURE__ */ jsx("div", { className: "absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full opacity-75 animate-pulse" }),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 animate-fade-in" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "absolute inset-2 flex flex-col justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center gap-2.5 h-8", children: [
          /* @__PURE__ */ jsx("span", { className: "flex items-center justify-center px-3 py-1.5 text-sm property-badge h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm bg-white text-[#293056] border border-gray-200 status-badge", children: statusBadgeText }),
          /* @__PURE__ */ jsx("span", { className: "flex items-center justify-center px-3 py-1.5 text-sm property-badge h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm ml-auto bg-white text-[#293056] border border-gray-200", children: propertyType })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex justify-end items-center gap-2.5 h-8" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col flex-grow items-start p-4 gap-2.5 box-border", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-bold text-lg leading-7 tracking-tight text-[#293056]", children: price }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start gap-2 w-full", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-base leading-6 tracking-tight text-[#293056] line-clamp-2", children: displayAddress }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-sm leading-6 tracking-tight text-[#293056]", children: [
          bedrooms,
          "BD | ",
          bathrooms,
          "BA",
          sqftDisplay ? ` | ${sqftDisplay}` : ""
        ] }),
        listOfficeName && /* @__PURE__ */ jsx("div", { className: "flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-sm leading-5 tracking-tight text-gray-600", children: listOfficeName }),
        listingKey && /* @__PURE__ */ jsx("div", { className: "flex items-center justify-start w-full min-h-8", children: /* @__PURE__ */ jsxs("div", { className: "font-work-sans font-normal text-base leading-6 tracking-tight text-[#293056]", children: [
          "MLS#: ",
          listingKey
        ] }) })
      ] })
    ] })
  ] }) });
};
export {
  PropertyCard as default
};
