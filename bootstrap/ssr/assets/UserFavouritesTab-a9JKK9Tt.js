import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { usePage, Link } from "@inertiajs/react";
import PropertyCardV5 from "./PropertyCardV5-BLJPzawm.js";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import "./propertyUrl-B4IVbEgn.js";
import "./slug-BdTdDGUL.js";
import "./propertyFormatters-B0QibXFa.js";
function UserFavouritesTab({ onCountUpdate }) {
  const { globalWebsite, website } = usePage().props;
  const effectiveWebsite = website || globalWebsite;
  const brandColors = effectiveWebsite?.brand_colors || {
    button_primary_bg: "#293056",
    button_primary_text: "#FFFFFF"
  };
  const buttonPrimaryBg = brandColors.button_primary_bg || "#293056";
  const buttonPrimaryText = brandColors.button_primary_text || "#FFFFFF";
  const [savedProperties, setSavedProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    fetchFavourites();
  }, []);
  const pickImageUrl = (img) => {
    if (!img) return null;
    if (typeof img === "string") return img;
    return img.MediaURL || img.url || img.Uri || img.uri || null;
  };
  const fetchFavourites = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/favourites/properties/with-data", {
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched favorites data:", data);
        const formattedFavourites = (data.data || []).map((fav) => {
          const propertyData = fav.property_data || {};
          return {
            id: fav.id,
            ListingKey: fav.property_listing_key,
            listingKey: fav.property_listing_key,
            // Price information
            ListPrice: fav.property_price || propertyData.ListPrice,
            // Address information
            StreetNumber: propertyData.StreetNumber || "",
            StreetName: propertyData.StreetName || "",
            StreetSuffix: propertyData.StreetSuffix || "",
            UnitNumber: propertyData.UnitNumber || propertyData.ApartmentNumber || "",
            City: fav.property_city || propertyData.City || "",
            StateOrProvince: propertyData.StateOrProvince || "ON",
            PostalCode: propertyData.PostalCode || "",
            // Property details
            BedroomsTotal: propertyData.BedroomsTotal || 0,
            BathroomsTotalInteger: propertyData.BathroomsTotalInteger || 0,
            LivingAreaRange: propertyData.LivingAreaRange || propertyData.LivingArea || "",
            PropertyType: propertyData.PropertyType || fav.property_type || "Residential",
            PropertySubType: propertyData.PropertySubType || "",
            StandardStatus: propertyData.StandardStatus || "Active",
            // Additional data
            savedDate: formatTimeAgo(fav.created_at),
            // Try multiple sources for image. Stored shapes vary —
            // strings, {MediaURL: '...'}, {url: '...'}, {Uri: '...'}.
            imageUrl: pickImageUrl(propertyData.MediaURL) || pickImageUrl(propertyData.images?.[0]) || pickImageUrl(propertyData.imageUrl) || pickImageUrl(propertyData.Photos?.[0]) || null,
            originalPropertyData: fav
          };
        });
        console.log("Formatted favorites:", formattedFavourites);
        setSavedProperties(formattedFavourites);
        if (onCountUpdate) {
          onCountUpdate(formattedFavourites.length);
        }
      }
    } catch (error) {
      console.error("Error fetching favourites:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const formatTimeAgo = (date) => {
    const now = /* @__PURE__ */ new Date();
    const saved = new Date(date);
    const diffTime = Math.abs(now - saved);
    const diffDays = Math.floor(diffTime / (1e3 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""} ago`;
  };
  const removeFavourite = async (listingKey) => {
    try {
      const response = await fetch("/api/favourites/properties", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: JSON.stringify({
          property_listing_key: listingKey
        })
      });
      if (response.ok) {
        const updatedProperties = savedProperties.filter((prop) => prop.listingKey !== listingKey);
        setSavedProperties(updatedProperties);
        if (onCountUpdate) {
          onCountUpdate(updatedProperties.length);
        }
        const successMsg = document.createElement("div");
        successMsg.className = "fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
        successMsg.innerHTML = '<span class="flex items-center gap-2">💔 Property removed from favourites</span>';
        document.body.appendChild(successMsg);
        setTimeout(() => {
          successMsg.style.transition = "opacity 0.3s";
          successMsg.style.opacity = "0";
          setTimeout(() => successMsg.remove(), 300);
        }, 2500);
      }
    } catch (error) {
      console.error("Error removing favourite:", error);
    }
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-6", children: /* @__PURE__ */ jsx("h2", { className: "text-xl font-space-grotesk font-bold text-[#293056]", children: "Saved Properties" }) }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "inline-block w-12 h-12 border-4 border-[#293056] border-t-transparent rounded-full animate-spin mb-4" }),
        /* @__PURE__ */ jsx("div", { className: "text-gray-600", children: "Loading your favourites..." })
      ] }) })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-space-grotesk font-bold text-[#293056]", children: "Saved Properties" }),
      savedProperties.length > 0 && /* @__PURE__ */ jsx(
        Link,
        {
          href: "/user/favourites",
          className: "text-sm text-[#293056] hover:text-[#1e2142] font-medium",
          children: "View all favourites →"
        }
      )
    ] }),
    savedProperties.length > 0 ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6", children: savedProperties.map((property) => /* @__PURE__ */ jsx(
      PropertyCardV5,
      {
        property,
        isBuilding: false,
        onFavoriteChange: () => removeFavourite(property.ListingKey),
        isFavorited: true
      },
      property.id
    )) }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-12 bg-gray-50 rounded-lg", children: [
      /* @__PURE__ */ jsx("div", { className: "w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsx("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "#6B7280", strokeWidth: "2", children: /* @__PURE__ */ jsx("path", { d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" }) }) }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No saved properties yet" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-600 mb-6 max-w-md mx-auto", children: "Start browsing and save properties you're interested in by clicking the heart icon" }),
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: "/search",
          className: "inline-flex items-center px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-all",
          style: { backgroundColor: buttonPrimaryBg, color: buttonPrimaryText },
          children: [
            /* @__PURE__ */ jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", className: "mr-2", children: /* @__PURE__ */ jsx("path", { d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }),
            "Browse Properties"
          ]
        }
      )
    ] })
  ] });
}
export {
  UserFavouritesTab as default
};
