import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import PropertyCardV5 from "./PropertyCardV5-CX7Swo2f.js";
import { usePage } from "@inertiajs/react";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import "./propertyUrl-B4IVbEgn.js";
import "./slug-BdTdDGUL.js";
import "./propertyFormatters-B0QibXFa.js";
const ComparableSales = ({
  title = "Comparable Sales",
  propertyData = null,
  onLoginRequired,
  onSignupRequired
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);
  const [comparableSales, setComparableSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { listingKey } = usePage().props;
  useEffect(() => {
    if (listingKey) {
      fetchComparableSales();
    } else {
      setIsLoading(false);
    }
  }, [listingKey]);
  const fetchComparableSales = async () => {
    setIsLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2e4);
    try {
      const response = await fetch(`/api/comparable-sales?listingKey=${listingKey}&limit=12`, {
        signal: controller.signal,
        headers: { "Accept": "application/json", "X-Requested-With": "XMLHttpRequest" }
      });
      clearTimeout(timeoutId);
      const data = await response.json();
      console.log("Comparable sales API response:", data);
      if (data.properties && data.properties.length > 0) {
        const formattedSales = data.properties.map((property) => {
          let imageUrl = property.MediaURL || null;
          return {
            // Match PropertyCardV5 expected format
            listingKey: property.listingKey,
            propertyType: property.propertySubType || property.propertyType || "Residential",
            PropertySubType: property.propertySubType || property.PropertySubType || property.propertyType,
            address: property.address || "Address not available",
            // Include fields needed for formatCardAddress
            UnitNumber: property.UnitNumber || property.unitNumber || "",
            unitNumber: property.unitNumber || property.UnitNumber || "",
            StreetNumber: property.StreetNumber || property.streetNumber || "",
            streetNumber: property.streetNumber || property.StreetNumber || "",
            StreetName: property.StreetName || property.streetName || "",
            streetName: property.streetName || property.StreetName || "",
            StreetSuffix: property.StreetSuffix || property.streetSuffix || "",
            streetSuffix: property.streetSuffix || property.StreetSuffix || "",
            // Include fields for buildCardFeatures
            bedrooms: property.bedrooms || property.BedroomsTotal || property.bedroomsTotal || 0,
            BedroomsTotal: property.BedroomsTotal || property.bedroomsTotal || property.bedrooms || 0,
            bedroomsTotal: property.bedroomsTotal || property.BedroomsTotal || property.bedrooms || 0,
            bathrooms: property.bathrooms || property.BathroomsTotalInteger || property.bathroomsTotalInteger || 0,
            BathroomsTotalInteger: property.BathroomsTotalInteger || property.bathroomsTotalInteger || property.bathrooms || 0,
            bathroomsTotalInteger: property.bathroomsTotalInteger || property.BathroomsTotalInteger || property.bathrooms || 0,
            LivingArea: property.LivingArea || property.livingArea || property.LotSizeSquareFeet || null,
            livingArea: property.livingArea || property.LivingArea || property.LotSizeSquareFeet || null,
            LivingAreaRange: property.LivingAreaRange || property.livingAreaRange || "",
            livingAreaRange: property.livingAreaRange || property.LivingAreaRange || "",
            ParkingTotal: property.ParkingTotal || property.parkingTotal || 0,
            parkingTotal: property.parkingTotal || property.ParkingTotal || 0,
            // Price fields - use sold price for comparable sales
            price: property.soldPrice || property.price || property.ListPrice,
            ListPrice: property.soldPrice || property.ListPrice || property.price,
            listPrice: property.soldPrice || property.listPrice || property.price,
            soldPrice: property.soldPrice,
            soldDate: property.soldDate,
            daysOnMarket: property.daysOnMarket,
            // Image - PropertyCardV5 uses imageUrl
            imageUrl,
            MediaURL: imageUrl,
            image: imageUrl,
            images: property.images || [],
            // MLS fields
            MlsStatus: "Sold",
            mlsStatus: "Sold",
            StandardStatus: "Closed",
            standardStatus: "Closed",
            source: "mls",
            // Additional fields
            City: property.City || property.city || "",
            city: property.city || property.City || "",
            country: property.country || property.Country || "",
            isSold: true
          };
        });
        setComparableSales(formattedSales);
      } else {
        setComparableSales([]);
      }
      setIsLoading(false);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Error fetching comparable sales:", error);
      setComparableSales([]);
      setIsLoading(false);
    }
  };
  const itemsPerSlide = 3;
  const totalSlides = Math.ceil(comparableSales.length / itemsPerSlide);
  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };
  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };
  const goToSlide = (slideIndex) => {
    setCurrentSlide(slideIndex);
  };
  if (!isLoading && (!comparableSales || comparableSales.length === 0)) {
    return null;
  }
  return /* @__PURE__ */ jsxs("section", { className: "p-3 rounded-xl border-gray-200 border shadow-sm bg-gray-50 similar-listings-container", children: [
    /* @__PURE__ */ jsxs("div", { className: "max-w-[1280px] mx-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-6", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsx("h2", { className: "text-xl md:text-2xl font-bold font-space-grotesk", style: { color: "#293056" }, children: title }) }),
        /* @__PURE__ */ jsxs("div", { className: "hidden md:flex gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: prevSlide,
              disabled: currentSlide === 0,
              className: `w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${currentSlide === 0 ? "border-gray-200 text-gray-300 cursor-not-allowed" : "border-gray-400 text-gray-600 hover:border-gray-600 hover:text-gray-800 hover:bg-white"}`,
              children: /* @__PURE__ */ jsx("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", children: /* @__PURE__ */ jsx("path", { d: "M10 12L6 8L10 4", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: nextSlide,
              disabled: currentSlide === totalSlides - 1,
              className: `w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${currentSlide === totalSlides - 1 ? "border-gray-200 text-gray-300 cursor-not-allowed" : "border-gray-400 text-gray-600 hover:border-gray-600 hover:text-gray-800 hover:bg-white"}`,
              children: /* @__PURE__ */ jsx("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", children: /* @__PURE__ */ jsx("path", { d: "M6 4L10 8L6 12", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) })
            }
          )
        ] })
      ] }),
      isLoading && /* @__PURE__ */ jsx("div", { className: "flex justify-center items-center py-12", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-[#293056]" }) }),
      !isLoading && comparableSales.length > 0 && /* @__PURE__ */ jsx("div", { className: "block md:hidden", children: /* @__PURE__ */ jsx("div", { className: "mobile-listings-scroll", children: comparableSales.map((property) => /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 carousel-item", children: /* @__PURE__ */ jsx(
        PropertyCardV5,
        {
          property,
          size: "default",
          className: "w-full",
          onLoginRequired,
          onSignupRequired
        }
      ) }, property.listingKey)) }) }),
      !isLoading && comparableSales.length > 0 && /* @__PURE__ */ jsx("div", { className: "hidden md:block relative overflow-hidden", children: /* @__PURE__ */ jsx(
        "div",
        {
          ref: sliderRef,
          className: "flex transition-transform duration-500 ease-in-out",
          style: { transform: `translateX(-${currentSlide * 100}%)` },
          children: Array.from({ length: totalSlides }).map((_, slideIndex) => /* @__PURE__ */ jsx("div", { className: "w-full flex-shrink-0", children: /* @__PURE__ */ jsx("div", { className: "desktop-listings-grid", children: comparableSales.slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide).map((property) => /* @__PURE__ */ jsx("div", { className: "flex justify-center items-start slider-item", children: /* @__PURE__ */ jsx(
            PropertyCardV5,
            {
              property,
              size: "default",
              className: "w-[300px]",
              onLoginRequired,
              onSignupRequired
            }
          ) }, property.listingKey)) }) }, slideIndex))
        }
      ) }),
      !isLoading && comparableSales.length > 0 && totalSlides > 1 && /* @__PURE__ */ jsx("div", { className: "hidden md:flex justify-center mt-6 gap-2", children: Array.from({ length: totalSlides }).map((_, index) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => goToSlide(index),
          className: `w-3 h-3 rounded-full transition-all ${currentSlide === index ? "bg-gray-800" : "bg-gray-300 hover:bg-gray-400"}`
        },
        index
      )) })
    ] }),
    /* @__PURE__ */ jsx("style", { children: `
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      ` })
  ] });
};
export {
  ComparableSales as default
};
