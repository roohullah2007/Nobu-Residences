import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import PropertyCardV5 from "./PropertyCardV5-CEcGAClp.js";
import { c as createBuildingUrl } from "./slug-BdTdDGUL.js";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import "./propertyUrl-B4IVbEgn.js";
import "./propertyFormatters-B0QibXFa.js";
const DeveloperBuildings = ({ buildingData }) => {
  const { globalWebsite, website } = usePage().props;
  const brandColors = globalWebsite?.brand_colors || website?.brand_colors || {};
  const buttonPrimaryBg = brandColors.button_primary_bg || "#293056";
  const buttonPrimaryText = brandColors.button_primary_text || "#FFFFFF";
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);
  const [buildings, setBuildings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const developerId = buildingData?.developer_id;
  const developerName = buildingData?.developer?.name || buildingData?.developer_name;
  const title = `More Buildings by ${developerName}`;
  useEffect(() => {
    if (!developerId && !developerName) {
      setIsLoading(false);
      return;
    }
    fetchDeveloperBuildings();
  }, [developerId, developerName, buildingData?.city, buildingData?.id]);
  const fetchDeveloperBuildings = async () => {
    setIsLoading(true);
    console.log("DeveloperBuildings - buildingData:", buildingData);
    console.log("DeveloperBuildings - developer_id:", developerId);
    console.log("DeveloperBuildings - developer_name:", developerName);
    console.log("DeveloperBuildings - Fetching buildings for developer:", developerName);
    try {
      const params = new URLSearchParams();
      if (developerId) {
        params.append("developer_id", developerId);
      } else if (developerName) {
        params.append("developer_name", developerName);
      }
      const url = `/api/buildings?${params.toString()}`;
      console.log("DeveloperBuildings - API URL:", url);
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        }
      });
      const result = await response.json();
      console.log("DeveloperBuildings - API response:", result);
      const allBuildings = result.data || result || [];
      console.log("DeveloperBuildings - Total buildings found:", allBuildings.length);
      const filteredBuildings = allBuildings.filter((b) => b.id !== buildingData?.id);
      console.log("DeveloperBuildings - After filtering current building:", filteredBuildings.length);
      if (filteredBuildings.length > 0) {
        const formattedBuildings = filteredBuildings.map((building) => {
          let imageUrl = building.main_image;
          if (!imageUrl && building.images && Array.isArray(building.images) && building.images.length > 0) {
            imageUrl = building.images[0];
          }
          if (!imageUrl) {
            imageUrl = "/images/placeholder-property.jpg";
          }
          return {
            id: building.id,
            listingKey: `BLDG-${building.id}`,
            propertyType: building.building_type || "Residential Building",
            address: building.address || building.name,
            name: building.name,
            city: building.city,
            province: building.province,
            imageUrl,
            price: building.price_range || building.units_for_sale || 0,
            bedrooms: building.bedrooms || "1-3",
            bathrooms: building.bathrooms || "1-2",
            total_units: building.total_units,
            total_floors: building.floors,
            unitsForSale: building.units_for_sale,
            unitsForRent: building.units_for_rent,
            yearBuilt: building.year_built,
            isRental: false,
            transactionType: "Building",
            source: "building",
            // Add formatted address for card display
            UnitNumber: "",
            StreetNumber: "",
            StreetName: building.address || building.name,
            City: building.city,
            StateOrProvince: building.province
          };
        });
        console.log("DeveloperBuildings - Formatted buildings:", formattedBuildings);
        console.log("DeveloperBuildings - Rendering with", formattedBuildings.length, "buildings");
        setBuildings(formattedBuildings);
      } else {
        setBuildings([]);
      }
    } catch (error) {
      console.error("DeveloperBuildings - Error fetching buildings:", error);
      setBuildings([]);
    } finally {
      setIsLoading(false);
    }
  };
  const itemsPerSlide = 3;
  const totalSlides = Math.ceil(buildings.length / itemsPerSlide);
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
  const handleCardClick = (building) => {
    window.location.href = createBuildingUrl(building.name || building.address, building.id);
  };
  return /* @__PURE__ */ jsxs("section", { className: "p-3 rounded-xl border-gray-200 border shadow-sm bg-gray-50", children: [
    /* @__PURE__ */ jsxs("div", { className: "max-w-[1280px] mx-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl md:text-2xl font-bold font-space-grotesk", style: { color: "#293056" }, children: title }),
          buildings.length > 0 && /* @__PURE__ */ jsx("span", { className: "inline-flex items-center justify-center px-3 py-1 text-sm font-bold rounded-full", style: { backgroundColor: buttonPrimaryBg, color: buttonPrimaryText }, children: buildings.length })
        ] }),
        buildings.length > itemsPerSlide && /* @__PURE__ */ jsxs("div", { className: "hidden md:flex gap-2", children: [
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
      isLoading && /* @__PURE__ */ jsx("div", { className: "flex justify-center items-center py-12", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2", style: { borderColor: buttonPrimaryBg } }) }),
      !isLoading && buildings.length === 0 && /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-center items-center py-12 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xl font-bold text-gray-700 mb-2", children: "No buildings found" }),
        /* @__PURE__ */ jsxs("div", { className: "text-gray-500", children: [
          "No other buildings by ",
          developerName,
          " are currently available in our database."
        ] })
      ] }),
      !isLoading && buildings.length > 0 && /* @__PURE__ */ jsx("div", { className: "block md:hidden", children: /* @__PURE__ */ jsx("div", { className: "mobile-listings-scroll", children: buildings.map((building) => /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 carousel-item", children: /* @__PURE__ */ jsx(
        PropertyCardV5,
        {
          property: building,
          size: "default",
          onClick: () => handleCardClick(building),
          className: "w-[300px]"
        }
      ) }, building.id)) }) }),
      !isLoading && buildings.length > 0 && /* @__PURE__ */ jsx("div", { className: "hidden md:block relative overflow-hidden", children: /* @__PURE__ */ jsx(
        "div",
        {
          ref: sliderRef,
          className: "flex transition-transform duration-500 ease-in-out",
          style: { transform: `translateX(-${currentSlide * 100}%)` },
          children: Array.from({ length: totalSlides }).map((_, slideIndex) => /* @__PURE__ */ jsx("div", { className: "w-full flex-shrink-0", children: /* @__PURE__ */ jsx("div", { className: "desktop-listings-grid", children: buildings.slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide).map((building) => /* @__PURE__ */ jsx("div", { className: "flex justify-center items-start slider-item", children: /* @__PURE__ */ jsx(
            PropertyCardV5,
            {
              property: building,
              size: "default",
              onClick: () => handleCardClick(building),
              className: "w-[300px]"
            }
          ) }, building.id)) }) }, slideIndex))
        }
      ) }),
      !isLoading && buildings.length > 0 && totalSlides > 1 && /* @__PURE__ */ jsx("div", { className: "hidden md:flex justify-center mt-6 gap-2", children: Array.from({ length: totalSlides }).map((_, index) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => goToSlide(index),
          className: `w-3 h-3 rounded-full transition-all ${currentSlide === index ? "bg-gray-800" : "bg-gray-300 hover:bg-gray-400"}`
        },
        index
      )) })
    ] }),
    /* @__PURE__ */ jsx("style", { children: `
        .mobile-listings-scroll {
          display: flex;
          overflow-x: auto;
          gap: 1rem;
          padding-bottom: 1rem;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .mobile-listings-scroll::-webkit-scrollbar {
          display: none;
        }
        .desktop-listings-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        .carousel-item {
          min-width: 300px;
        }
        .slider-item {
          min-width: 0;
        }
      ` })
  ] });
};
export {
  DeveloperBuildings as default
};
