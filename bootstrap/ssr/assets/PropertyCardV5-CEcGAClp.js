import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import PluginStyleImageLoader from "./PluginStyleImageLoader-Rq93vDmq.js";
import { g as generatePropertyUrl } from "./propertyUrl-B4IVbEgn.js";
import { a as createSEOBuildingUrl } from "./slug-BdTdDGUL.js";
import { f as formatCardAddress, b as buildCardFeatures, g as getBrokerageName } from "./propertyFormatters-B0QibXFa.js";
import { usePage } from "@inertiajs/react";
const PropertyCardV5 = ({
  property,
  size = "default",
  onClick,
  className = "",
  showFavouriteButton = true,
  onFavouriteChange,
  showCompareButton = true,
  onCompareChange,
  onLoginRequired,
  onSignupRequired
}) => {
  const { auth } = usePage().props;
  const [isFavourited, setIsFavourited] = useState(false);
  const [isLoadingFavourite, setIsLoadingFavourite] = useState(false);
  const [isInCompare, setIsInCompare] = useState(false);
  const listingKey = property?.listingKey || property?.ListingKey || property?.id;
  const isAuthenticated = auth?.user ? true : false;
  useEffect(() => {
    if (isAuthenticated && listingKey && showFavouriteButton && property.source !== "building") {
      checkFavouriteStatus();
    }
  }, [isAuthenticated, listingKey]);
  useEffect(() => {
    if (listingKey && showCompareButton && property.source !== "building") {
      checkCompareStatus();
    }
  }, [listingKey]);
  useEffect(() => {
    const handleCompareChange = () => {
      if (listingKey) {
        checkCompareStatus();
      }
    };
    window.addEventListener("compareListChanged", handleCompareChange);
    return () => window.removeEventListener("compareListChanged", handleCompareChange);
  }, [listingKey]);
  const checkCompareStatus = () => {
    try {
      const compareList = JSON.parse(localStorage.getItem("compareListings") || "[]");
      const isInList = compareList.some((item) => item.listingKey === listingKey);
      setIsInCompare(isInList);
    } catch (error) {
      console.error("Error checking compare status:", error);
    }
  };
  const toggleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!listingKey) return;
    try {
      const compareList = JSON.parse(localStorage.getItem("compareListings") || "[]");
      const existingIndex = compareList.findIndex((item) => item.listingKey === listingKey);
      if (existingIndex > -1) {
        compareList.splice(existingIndex, 1);
        localStorage.setItem("compareListings", JSON.stringify(compareList));
        setIsInCompare(false);
        showCompareNotification("Removed from compare", "removed");
      } else {
        if (compareList.length >= 3) {
          showCompareNotification("Maximum 3 properties can be compared", "error");
          return;
        }
        const compareData = {
          listingKey,
          property_listing_key: listingKey,
          property_data: {
            listingKey,
            ListingKey: listingKey,
            MediaURL: property?.MediaURL || property?.imageUrl,
            imageUrl: property?.imageUrl || property?.MediaURL,
            ListPrice: property?.price || property?.ListPrice,
            price: property?.price || property?.ListPrice,
            address: property?.address || property?.Address || property?.UnparsedAddress,
            Address: property?.address || property?.Address || property?.UnparsedAddress,
            UnparsedAddress: property?.UnparsedAddress || property?.address,
            StreetNumber: property?.StreetNumber,
            StreetName: property?.StreetName,
            UnitNumber: property?.UnitNumber,
            City: property?.city || property?.City,
            city: property?.city || property?.City,
            StateOrProvince: property?.province || property?.StateOrProvince || "ON",
            PropertyType: property?.propertyType || property?.PropertyType,
            TransactionType: property?.TransactionType || "For Sale",
            BedroomsTotal: property?.bedrooms || property?.BedroomsTotal,
            bedrooms: property?.bedrooms || property?.BedroomsTotal,
            BathroomsTotalInteger: property?.bathrooms || property?.BathroomsTotalInteger,
            bathrooms: property?.bathrooms || property?.BathroomsTotalInteger,
            LivingArea: property?.area || property?.LivingArea,
            BuildingAreaTotal: property?.BuildingAreaTotal,
            ParkingTotal: property?.ParkingTotal || property?.parking,
            AssociationFee: property?.AssociationFee,
            TaxAnnualAmount: property?.TaxAnnualAmount,
            DirectionFaces: property?.DirectionFaces,
            YearBuilt: property?.YearBuilt,
            SubdivisionName: property?.SubdivisionName,
            Neighborhood: property?.Neighborhood
          }
        };
        compareList.push(compareData);
        localStorage.setItem("compareListings", JSON.stringify(compareList));
        setIsInCompare(true);
        showCompareNotification("Added to compare", "added");
      }
      window.dispatchEvent(new CustomEvent("compareListChanged"));
      if (onCompareChange) {
        onCompareChange(!isInCompare, listingKey);
      }
    } catch (error) {
      console.error("Error toggling compare:", error);
    }
  };
  const showCompareNotification = (message, type) => {
    const notification = document.createElement("div");
    const bgColor = type === "added" ? "#293056" : type === "error" ? "#DC2626" : "#6B7280";
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <span>${type === "added" ? "⚖️" : type === "error" ? "⚠️" : "✓"}</span>
        <span>${message}</span>
        ${type === "added" ? '<a href="/compare-listings" class="ml-2 underline text-white/80 hover:text-white">View</a>' : ""}
      </div>
    `;
    notification.style.cssText = `
      position: fixed;
      top: 70px;
      right: 20px;
      background: ${bgColor};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease-in";
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3e3);
  };
  const checkFavouriteStatus = async () => {
    if (!listingKey) return;
    try {
      const response = await fetch("/api/favourites/properties/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: JSON.stringify({
          property_listing_key: listingKey
        })
      });
      if (response.ok) {
        const data = await response.json();
        setIsFavourited(data.is_favourited || false);
      }
    } catch (error) {
      console.error("Error checking favourite status:", error);
    }
  };
  const toggleFavourite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      if (typeof onLoginRequired === "function") {
        onLoginRequired();
      } else {
        window.location.href = "/login";
      }
      return;
    }
    if (!listingKey || isLoadingFavourite) return;
    setIsLoadingFavourite(true);
    try {
      const propertyData = {
        listingKey,
        ListingKey: listingKey,
        id: listingKey,
        MediaURL: property?.MediaURL || property?.imageUrl,
        imageUrl: property?.imageUrl || property?.MediaURL,
        images: property?.images || property?.Images || [],
        ListPrice: property?.price || property?.ListPrice,
        price: property?.price || property?.ListPrice,
        address: property?.address || property?.Address || property?.UnparsedAddress,
        StreetNumber: property?.StreetNumber,
        StreetName: property?.StreetName,
        StreetSuffix: property?.StreetSuffix,
        UnitNumber: property?.UnitNumber,
        City: property?.city || property?.City,
        StateOrProvince: property?.province || property?.StateOrProvince || "ON",
        PostalCode: property?.PostalCode,
        PropertyType: property?.propertyType || property?.PropertyType,
        PropertySubType: property?.PropertySubType || property?.propertyType,
        TransactionType: property?.TransactionType || "For Sale",
        StandardStatus: property?.StandardStatus || "Active",
        MlsStatus: property?.MlsStatus,
        BedroomsTotal: property?.bedrooms || property?.BedroomsTotal,
        BathroomsTotalInteger: property?.bathrooms || property?.BathroomsTotalInteger,
        LivingAreaRange: property?.area || property?.LivingAreaRange,
        ...property
      };
      const response = await fetch("/api/favourites/properties/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: JSON.stringify({
          property_listing_key: listingKey,
          property_data: propertyData,
          property_address: propertyData.address,
          property_price: propertyData.price,
          property_type: propertyData.PropertySubType || propertyData.PropertyType,
          property_city: propertyData.City
        })
      });
      const data = await response.json();
      if (data.success) {
        setIsFavourited(data.is_favourited);
        showFavouriteNotification(data.message, data.action);
        if (onFavouriteChange) {
          onFavouriteChange(data.is_favourited, listingKey);
        }
      }
    } catch (error) {
      console.error("Error toggling favourite:", error);
    } finally {
      setIsLoadingFavourite(false);
    }
  };
  const showFavouriteNotification = (message, action) => {
    const notification = document.createElement("div");
    const isAdded = action === "added";
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <span>${isAdded ? "❤️" : "💔"}</span>
        <span>${message}</span>
      </div>
    `;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${isAdded ? "#DC2626" : "#6B7280"};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;
    if (!document.getElementById("favourite-notification-styles")) {
      const style = document.createElement("style");
      style.id = "favourite-notification-styles";
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease-in";
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3e3);
  };
  const isRentalProperty = property.isRental || property.TransactionType === "For Lease" || property.TransactionType === "For Rent" || property.transactionType === "For Lease" || property.transactionType === "For Rent";
  const formatPrice = (price, isRental = false) => {
    if (!price || price <= 0) return "Price on request";
    let formattedPrice2 = "$" + price.toLocaleString();
    if (isRental) {
      formattedPrice2 += "/mo";
    }
    return formattedPrice2;
  };
  property.source === "mls" || property.listingKey && property.listingKey.length > 10;
  const formattedPrice = formatPrice(property.price || property.ListPrice, isRentalProperty);
  const displayAddress = formatCardAddress(property);
  const cityDisplay = String(property.city || property.City || "").trim();
  const features = buildCardFeatures(property);
  const brokerageName = getBrokerageName(property);
  const detailsUrl = property.source === "building" ? createSEOBuildingUrl(property) : generatePropertyUrl(property);
  const contentSections = [
    property.source === "building" ? property.name || property.propertyType || "Building" : property.propertyType || "Residential",
    displayAddress,
    features,
    brokerageName,
    property.source !== "building" ? property.source === "mls" ? `MLS#: ${property.listingKey}` : `ID: ${property.listingKey}` : null
  ].filter(Boolean);
  const hasMinimalContent = contentSections.length <= 3;
  const dynamicMinHeight = hasMinimalContent && property.source !== "building" ? "min-h-[380px]" : "min-h-0";
  const sizeConfig = {
    default: {
      container: `w-full md:w-[300px] ${dynamicMinHeight}`,
      image: "h-[200px] property-image-container",
      content: "p-4 gap-2.5",
      chip: "px-3 py-1.5 text-sm property-badge",
      title: "text-lg",
      details: "text-base"
    },
    mobile: {
      container: `w-full md:w-[280px] ${dynamicMinHeight}`,
      image: "h-[200px] property-image-container",
      content: "p-3 gap-2",
      chip: "px-2 py-1 text-xs property-badge",
      title: "text-lg",
      details: "text-sm"
    },
    grid: {
      container: `w-[372px] md:w-[300px] ${dynamicMinHeight}`,
      image: "h-[200px] property-image-container",
      content: "p-4 gap-2.5",
      chip: "px-3 py-1.5 text-sm property-badge",
      title: "text-lg",
      details: "text-base"
    }
  };
  const config = sizeConfig[size];
  const isSoldOrLeased = (() => {
    const ms = (property.MlsStatus || "").toLowerCase();
    const ss = (property.StandardStatus || "").toLowerCase();
    const tt = (property.TransactionType || "").toLowerCase();
    return ["sold", "sld", "sc"].includes(ms) || ["leased", "lsd", "lc"].includes(ms) || ss === "sold" || ss === "leased" || tt === "sold" || tt === "leased";
  })();
  const isLoggedIn = isAuthenticated;
  const lockSoldPrice = isSoldOrLeased && !isLoggedIn;
  const handleClick = (e) => {
    if (isSoldOrLeased && !isLoggedIn) {
      e.preventDefault();
      if (onLoginRequired) {
        onLoginRequired();
      } else {
        window.location.href = "/login";
      }
      return;
    }
    if (onClick) {
      e.preventDefault();
      onClick(property);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: `flex flex-col ${config.container} bg-white border-gray-300 border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl group ${className} relative`, children: [
    /* @__PURE__ */ jsxs(
      "a",
      {
        href: detailsUrl,
        className: "flex flex-col h-full text-inherit no-underline",
        onClick: handleClick,
        children: [
          /* @__PURE__ */ jsxs("div", { className: `relative w-full ${config.image} overflow-hidden bg-gray-100 rounded-t-xl`, children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "w-full h-full",
                style: lockSoldPrice ? { filter: "blur(2px)" } : void 0,
                children: /* @__PURE__ */ jsx(
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
                )
              }
            ),
            property.source !== "building" && /* @__PURE__ */ jsxs(
              "div",
              {
                className: "absolute inset-2 flex flex-col justify-between",
                style: lockSoldPrice ? { filter: "blur(2px)" } : void 0,
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center gap-2.5 h-8", children: [
                    /* @__PURE__ */ jsx("span", { className: `flex items-center justify-center ${config.chip} h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm border status-badge ${(() => {
                      const ms = (property.MlsStatus || "").toLowerCase();
                      const ss = (property.StandardStatus || "").toLowerCase();
                      const tt = (property.TransactionType || "").toLowerCase();
                      const isSold = ["sold", "sld", "sc"].includes(ms) || ss === "sold" || tt === "sold";
                      const isLeased = ["leased", "lsd", "lc"].includes(ms) || ss === "leased" || tt === "leased";
                      if (isSold) return "bg-red-600 text-white border-red-600";
                      if (isLeased) return "bg-orange-500 text-white border-orange-500";
                      if (property.IsJustListed) return "bg-[#293056] text-white border-[#293056]";
                      return "bg-white text-[#293056] border-gray-200";
                    })()}`, children: (() => {
                      const mlsStatusLower = property.MlsStatus ? property.MlsStatus.toLowerCase() : "";
                      if (mlsStatusLower === "sold" || mlsStatusLower === "sld" || mlsStatusLower === "sc") {
                        return "Sold";
                      }
                      if (["leased", "lsd", "lc", "rented", "lease"].includes(mlsStatusLower)) {
                        return "Leased";
                      }
                      const standardStatusLower = property.StandardStatus ? property.StandardStatus.toLowerCase() : "";
                      if (standardStatusLower === "sold" || standardStatusLower === "closed") {
                        if (property.TransactionType === "For Lease" || property.TransactionType === "For Rent" || property.TransactionType === "Leased") {
                          return "Leased";
                        }
                        return "Sold";
                      }
                      if (["leased", "rented"].includes(standardStatusLower)) {
                        return "Leased";
                      }
                      if (property.TransactionType === "Sold") return "Sold";
                      if (property.TransactionType === "Leased") return "Leased";
                      if (property.IsJustListed) return "Just Listed";
                      if (property.formatted_status) {
                        return property.formatted_status;
                      }
                      return property.TransactionType || (property.isRental ? "For Rent" : "For Sale");
                    })() }),
                    /* @__PURE__ */ jsx("span", { className: `flex items-center justify-center ${config.chip} h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm ml-auto bg-white text-[#293056] border border-gray-200`, children: property.PropertySubType || property.propertyType || "Residential" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center h-8", children: [
                    showCompareButton && property.source !== "building" && /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: toggleCompare,
                        className: `flex items-center justify-center ${config.chip} h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm transition-all duration-200 ${isInCompare ? "bg-[#293056] text-white border border-[#293056] hover:bg-[#293056]/90" : "bg-white text-[#293056] border border-gray-200 hover:bg-gray-50"}`,
                        title: isInCompare ? "Remove from compare" : "Add to compare",
                        children: isInCompare ? "Added" : "Compare"
                      }
                    ),
                    (!showCompareButton || property.source === "building") && /* @__PURE__ */ jsx("div", {}),
                    showFavouriteButton && property.source !== "building" && /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: toggleFavourite,
                        disabled: isLoadingFavourite,
                        className: `w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${isFavourited ? "bg-red-500 hover:bg-red-600" : "bg-white/90 hover:bg-white backdrop-blur-sm"} ${isLoadingFavourite ? "opacity-50 cursor-not-allowed" : ""}`,
                        title: isFavourited ? "Remove from favourites" : "Add to favourites",
                        children: isLoadingFavourite ? /* @__PURE__ */ jsx("div", { className: "w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" }) : /* @__PURE__ */ jsx(
                          "svg",
                          {
                            className: `w-5 h-5 transition-colors ${isFavourited ? "text-white" : "text-red-500"}`,
                            fill: isFavourited ? "currentColor" : "none",
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
                    )
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: `flex flex-col flex-grow items-start ${config.content} box-border`, children: [
            /* @__PURE__ */ jsxs("div", { className: `flex items-center justify-between gap-2 w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-bold ${config.title} leading-7 tracking-tight text-[#293056]`, children: [
              /* @__PURE__ */ jsx("span", { children: property.source === "building" ? property.name || "Building" : formattedPrice }),
              property.source !== "building" && cityDisplay && /* @__PURE__ */ jsx("span", { className: "font-work-sans font-normal text-sm text-gray-500 whitespace-nowrap", children: cityDisplay })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start gap-2 w-full", children: [
              /* @__PURE__ */ jsx("div", { className: `flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal ${config.details} leading-6 tracking-tight text-[#293056] line-clamp-2 ${lockSoldPrice ? "blur-md select-none" : ""}`, children: displayAddress }),
              property.source !== "building" && (property.building_name || property.buildingName) && (() => {
                const buildingName = property.building_name || property.buildingName;
                const b = property.building || {};
                const slugify = (s) => (s || "").toString().toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
                const cityName = b.city || property.city || "";
                const isRent = property.isRental || /rent|lease/i.test(property.transactionType || property.TransactionType || "");
                const linkType = isRent ? "rent" : "sale";
                const buildLink = (label) => {
                  if (!cityName || !label) return null;
                  return `/${slugify(cityName)}/${slugify(label)}/condos-for-${linkType}`;
                };
                const neighbourhoodLinks = [
                  b.sub_neighbourhood ? { label: b.sub_neighbourhood, href: buildLink(b.sub_neighbourhood) } : null,
                  b.neighbourhood ? { label: b.neighbourhood, href: buildLink(b.neighbourhood) } : null,
                  cityName ? { label: cityName, href: buildLink(cityName) } : null
                ].filter((x) => x && x.href);
                const handleAreaClick = (e, href) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = href;
                };
                return /* @__PURE__ */ jsxs("div", { className: `flex flex-wrap items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-sm leading-6 tracking-tight text-[#293056] ${lockSoldPrice ? "blur-md select-none" : ""}`, children: [
                  /* @__PURE__ */ jsx("span", { className: "font-semibold", children: buildingName }),
                  neighbourhoodLinks.length > 0 && /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: " in " }),
                  neighbourhoodLinks.map((link, i) => /* @__PURE__ */ jsxs("span", { children: [
                    /* @__PURE__ */ jsx(
                      "a",
                      {
                        href: link.href,
                        onClick: (e) => handleAreaClick(e, link.href),
                        className: "text-[#293056] hover:underline",
                        children: link.label
                      }
                    ),
                    i < neighbourhoodLinks.length - 1 && /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: ", " })
                  ] }, link.href))
                ] });
              })(),
              property.source === "building" && property.developer && /* @__PURE__ */ jsxs("div", { className: `flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-sm leading-6 tracking-tight text-gray-600`, children: [
                /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "By" }),
                " ",
                /* @__PURE__ */ jsx("span", { className: "text-[#293056] font-medium", children: property.developer })
              ] }),
              property.source === "building" ? (
                /* Condos for Sale and Rent */
                /* @__PURE__ */ jsx("div", { className: `flex items-center justify-start w-full min-h-8 font-work-sans font-normal text-sm leading-6 tracking-tight text-[#293056]`, children: `${property.unitsForSale ?? 0} Condos for Sale | ${property.unitsForRent ?? 0} Condos for Rent` })
              ) : (
                /* Property Features - Beds, Baths, etc */
                features && /* @__PURE__ */ jsx("div", { className: `flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-sm leading-6 tracking-tight text-[#293056] ${lockSoldPrice ? "blur-md select-none" : ""}`, children: features })
              ),
              property.source !== "building" && brokerageName && /* @__PURE__ */ jsx("div", { className: `flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-sm leading-5 tracking-tight text-gray-600 ${lockSoldPrice ? "blur-md select-none" : ""}`, children: brokerageName }),
              property.source !== "building" && property.listingKey && /* @__PURE__ */ jsx("div", { className: `flex items-center justify-start w-full min-h-8 ${lockSoldPrice ? "blur-md select-none" : ""}`, children: /* @__PURE__ */ jsx("div", { className: `font-work-sans font-normal ${config.details} leading-6 tracking-tight text-[#293056]`, children: property.source === "mls" ? `MLS#: ${property.listingKey}` : `ID: ${property.listingKey}` }) })
            ] })
          ] })
        ]
      }
    ),
    lockSoldPrice && /* @__PURE__ */ jsxs("div", { className: "absolute inset-x-0 top-0 h-[200px] z-20 flex flex-col items-center justify-center gap-2.5 px-4 pointer-events-none", children: [
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/login",
          onClick: (e) => {
            e.stopPropagation();
            if (typeof onLoginRequired === "function") {
              e.preventDefault();
              onLoginRequired();
            }
          },
          className: "pointer-events-auto w-32 text-center px-5 py-2 rounded-full bg-[#293056] text-white text-sm font-semibold shadow-md hover:bg-[#1f2545] transition-colors",
          children: "Sign In"
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/register",
          onClick: (e) => {
            e.stopPropagation();
            if (typeof onSignupRequired === "function") {
              e.preventDefault();
              onSignupRequired();
            } else if (typeof onLoginRequired === "function") {
              e.preventDefault();
              onLoginRequired();
            }
          },
          className: "pointer-events-auto w-32 text-center px-5 py-2 rounded-full bg-white text-[#293056] text-sm font-semibold border border-[#293056] shadow-md hover:bg-gray-50 transition-colors",
          children: "Sign Up"
        }
      )
    ] })
  ] });
};
export {
  PropertyCardV5 as default
};
