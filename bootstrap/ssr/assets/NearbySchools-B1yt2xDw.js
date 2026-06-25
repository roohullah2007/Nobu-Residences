import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
const NearbySchools = ({ propertyData = null, hideHeading = false }) => {
  const [showAll, setShowAll] = useState(false);
  const [schools, setSchools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const getPropertyAddress = () => {
    const addressFields = [
      "UnparsedAddress",
      "unparsedAddress",
      "address",
      "Address",
      "full_address",
      "FullAddress"
    ];
    for (const field of addressFields) {
      if (propertyData?.[field]) {
        return propertyData[field];
      }
    }
    if (propertyData?.StreetNumber && propertyData?.StreetName) {
      const streetAddress = `${propertyData.StreetNumber} ${propertyData.StreetName} ${propertyData.StreetSuffix || ""}`.trim();
      const city = propertyData.City || "Toronto";
      const province = propertyData.StateOrProvince || propertyData.Province || "ON";
      const postalCode = propertyData.PostalCode || "";
      return `${streetAddress}, ${city}, ${province} ${postalCode}`.trim();
    }
    return null;
  };
  useEffect(() => {
    const fetchNearbySchools = async () => {
      if (!propertyData) {
        setIsLoading(false);
        return;
      }
      if (schools.length > 0) {
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const possibleLatFields = ["latitude", "Latitude", "lat", "Lat", "LAT"];
        const possibleLngFields = ["longitude", "Longitude", "lng", "Lng", "LNG", "long", "Long"];
        let latitude = null;
        let longitude = null;
        for (const field of possibleLatFields) {
          if (propertyData?.[field]) {
            latitude = parseFloat(propertyData[field]);
            break;
          }
        }
        for (const field of possibleLngFields) {
          if (propertyData?.[field]) {
            longitude = parseFloat(propertyData[field]);
            break;
          }
        }
        const radius = 2;
        let apiUrl = `/api/schools/nearby?radius=${radius}&limit=100`;
        if (latitude && longitude) {
          apiUrl += `&latitude=${latitude}&longitude=${longitude}`;
          console.info("📍 Using property coordinates for schools search:", { latitude, longitude });
        } else {
          const address = getPropertyAddress();
          if (address) {
            apiUrl += `&address=${encodeURIComponent(address)}`;
            console.info("📍 Using property address for schools search:", address);
          } else {
            console.warn("No coordinates or address available for property");
            setError("Unable to determine property location");
            setIsLoading(false);
            return;
          }
        }
        const response = await fetch(apiUrl);
        const result = await response.json();
        if (result.success && result.data) {
          console.info(`✅ Found ${result.data.length} schools within ${radius}km`);
          setSchools(result.data);
        } else {
          console.warn("No schools data returned from API:", result.message);
          setError(result.message || "No schools found nearby");
          setSchools([]);
        }
      } catch (err) {
        console.error("Error fetching nearby schools:", err);
        setError("Error loading nearby schools. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchNearbySchools();
  }, [propertyData]);
  const getSchoolsData = () => {
    return schools.map((school) => {
      let url = null;
      if (school.slug) {
        url = `/school/${school.slug}`;
      } else if (school.name) {
        const schoolNameSlug = school.name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim("-");
        url = `/school/${schoolNameSlug}`;
      }
      return {
        id: school.id,
        slug: school.slug,
        distance_km: school.distance_text || `${school.distance_km} km`,
        walk_time: school.walking_time_text || `${school.walking_time_minutes} min walk`,
        name: school.name,
        type: school.school_type_label,
        board: `${school.school_type_label} | ${school.grade_level_label}${school.school_board ? " | " + school.school_board : ""}`,
        url,
        rating: school.rating,
        in_boundary: school.in_boundary,
        place_id: school.place_id
        // Keep track of Google Place ID if available
      };
    });
  };
  const schoolsData = getSchoolsData();
  const displayedSchools = showAll ? schoolsData : schoolsData.slice(0, 3);
  const remainingCount = schoolsData.length - 3;
  const handleToggleShow = () => {
    setShowAll(!showAll);
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxs("div", { children: [
      !hideHeading && /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold mb-4", style: { color: "#293056" }, children: "Nearby Schools" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-sm mb-4", children: "Explore the educational institutions in the surrounding area and their proximity to this property." }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-col space-y-4", children: [1, 2, 3].map((index) => /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center p-4 gap-3 md:gap-8 w-full min-h-[82px] border border-[#D2D2D2] rounded-lg md:rounded-none animate-pulse", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-row md:flex-col justify-between md:justify-center items-center md:items-start p-0 w-full md:w-[104px] h-auto md:h-12 md:border-r border-[#A4A7AE]", children: [
          /* @__PURE__ */ jsx("div", { className: "h-4 bg-gray-200 rounded w-12" }),
          /* @__PURE__ */ jsx("div", { className: "h-4 bg-gray-200 rounded w-16" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-center items-start p-0 gap-1 flex-1 h-auto md:h-[50px]", children: [
          /* @__PURE__ */ jsx("div", { className: "h-5 bg-gray-200 rounded w-48" }),
          /* @__PURE__ */ jsx("div", { className: "h-4 bg-gray-200 rounded w-64" })
        ] })
      ] }, index)) })
    ] });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("div", { children: [
      !hideHeading && /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold mb-4", style: { color: "#293056" }, children: "Nearby Schools" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-sm mb-4", children: "Explore the educational institutions in the surrounding area and their proximity to this property." }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-8 text-gray-500", children: "Unable to load nearby schools. Please try again later." })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    !hideHeading && /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold mb-4", style: { color: "#293056" }, children: "Nearby Schools" }),
    /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-sm mb-4", children: "Explore the educational institutions in the surrounding area and their proximity to this property." }),
    schoolsData.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-8 text-gray-500 border border-gray-200 rounded-lg", children: [
      /* @__PURE__ */ jsx("p", { children: "No schools found within walking distance (2km) of this property." }),
      /* @__PURE__ */ jsx("p", { className: "text-sm mt-2", children: "Try expanding your search radius for more results." })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
      /* @__PURE__ */ jsx("div", { className: "space-y-4", children: displayedSchools.map((school, index) => /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center p-4 gap-3 md:gap-8 w-full min-h-[82px] border border-[#D2D2D2] rounded-lg md:rounded-none", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-row md:flex-col justify-between md:justify-center items-center md:items-start p-0 w-full md:w-[104px] h-auto md:h-12 md:border-r border-[#A4A7AE]", children: [
          /* @__PURE__ */ jsx("div", { className: "font-work-sans font-bold text-sm leading-6 flex items-center tracking-[-0.03em] text-[#727272]", children: school.distance_km }),
          /* @__PURE__ */ jsx("div", { className: "font-work-sans font-medium text-sm leading-6 flex items-center tracking-[-0.03em] text-[#707070]", children: school.walk_time })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-center items-start p-0 gap-1 flex-1 h-auto md:h-[50px]", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            school.url ? /* @__PURE__ */ jsx(
              Link,
              {
                href: school.url,
                className: "font-work-sans font-bold text-base leading-[25px] flex items-center tracking-[-0.03em] text-[#293056] hover:underline cursor-pointer transition-colors duration-200",
                children: school.name
              }
            ) : /* @__PURE__ */ jsx("div", { className: "font-work-sans font-bold text-base leading-[25px] flex items-center tracking-[-0.03em] text-[#293056]", children: school.name }),
            school.rating && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800", children: [
              school.rating,
              "/10"
            ] }),
            school.in_boundary !== null && school.in_boundary !== void 0 && /* @__PURE__ */ jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${school.in_boundary ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`, children: school.in_boundary ? "In Boundary" : "Out of Boundary" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "font-work-sans font-normal text-sm leading-6 flex items-center tracking-[-0.03em] text-[#717680]", children: school.board })
        ] })
      ] }, school.id || index)) }),
      schoolsData.length > 3 && /* @__PURE__ */ jsx("div", { className: "px-6 py-4", children: /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleToggleShow,
          className: "text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1",
          children: showAll ? "Show Less" : `Show More (${remainingCount})`
        }
      ) })
    ] })
  ] });
};
export {
  NearbySchools as default
};
