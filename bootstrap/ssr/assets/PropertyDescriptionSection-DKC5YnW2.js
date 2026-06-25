import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { u as usePropertyAiDescription } from "./usePropertyAiDescription-C5QLpmY7.js";
import "axios";
function PropertyDescriptionSection({ propertyData, aiDescription: backendAiDescription, auth }) {
  const {
    description: aiDescription,
    loading: aiLoading,
    getAllContent,
    setDescription
  } = usePropertyAiDescription();
  const [waitingForAi, setWaitingForAi] = useState(false);
  const [hasLoadedAi, setHasLoadedAi] = useState(false);
  const mlsId = propertyData?.ListingKey || propertyData?.listingKey || propertyData?.MLS_NUMBER || propertyData?.mls_number || "";
  useEffect(() => {
    if (backendAiDescription && (backendAiDescription.exists || backendAiDescription.overview || backendAiDescription.detailed)) {
      setDescription({
        overview: backendAiDescription.overview,
        detailed: backendAiDescription.detailed
      });
      setHasLoadedAi(true);
      setWaitingForAi(false);
      return;
    }
    if (mlsId && !backendAiDescription && !hasLoadedAi) {
      setWaitingForAi(true);
      getAllContent(mlsId).then((result) => {
        if (result && result.description) {
          setHasLoadedAi(true);
          setWaitingForAi(false);
        }
      }).catch((error) => {
      });
    }
  }, [mlsId, backendAiDescription, hasLoadedAi]);
  useEffect(() => {
    if (aiDescription && (aiDescription.overview || aiDescription.detailed)) {
      setHasLoadedAi(true);
      setWaitingForAi(false);
    }
  }, [aiDescription]);
  useEffect(() => {
    if (waitingForAi && mlsId && !hasLoadedAi) {
      const pollInterval = setInterval(() => {
        getAllContent(mlsId).then((result) => {
          if (result && result.description) {
            setHasLoadedAi(true);
            setWaitingForAi(false);
            clearInterval(pollInterval);
          }
        }).catch(() => {
        });
      }, 3e3);
      return () => clearInterval(pollInterval);
    }
  }, [waitingForAi, mlsId, hasLoadedAi]);
  const formatAddress = () => {
    if (!propertyData) return "About Unit 408, 155 Dalhousie St, Toronto";
    const abbreviateStreetSuffix = (suffix) => {
      if (!suffix) return "";
      const suffixMap = {
        "Street": "St",
        "Avenue": "Ave",
        "Road": "Rd",
        "Drive": "Dr",
        "Lane": "Ln",
        "Court": "Ct",
        "Circle": "Cir",
        "Boulevard": "Blvd",
        "Parkway": "Pkwy",
        "Terrace": "Ter",
        "Place": "Pl",
        "Way": "Way",
        "Crescent": "Cres"
      };
      return suffixMap[suffix] || suffix;
    };
    const cleanCityName = (city2) => {
      if (!city2) return "";
      return city2.replace(/\s+[CEWNS]\d{2}$/i, "").trim();
    };
    const unit = propertyData.UnitNumber || propertyData.unitNumber || propertyData.ApartmentNumber || propertyData.apartmentNumber || "";
    const streetNumber = propertyData.StreetNumber || propertyData.streetNumber || "";
    const streetName = propertyData.StreetName || propertyData.streetName || "";
    const streetSuffix = propertyData.StreetSuffix || propertyData.streetSuffix || "";
    const city = cleanCityName(propertyData.City || propertyData.city || "");
    const abbreviatedSuffix = abbreviateStreetSuffix(streetSuffix);
    let formattedAddress = "About ";
    if (unit) {
      formattedAddress += `Unit ${unit}, `;
    }
    formattedAddress += `${streetNumber} ${streetName} ${abbreviatedSuffix}`.trim();
    if (city) {
      formattedAddress += `, ${city}`;
    }
    return formattedAddress;
  };
  const formatPrice = (price) => {
    if (!price || price === 0) return "Price on request";
    return "$" + price.toLocaleString();
  };
  const generateBasicDescription = () => {
    if (!propertyData) return "Property information is loading...";
    const type = propertyData.PropertySubType || propertyData.propertySubType || propertyData.propertyType || "Property";
    const bedrooms = propertyData.BedroomsTotal || propertyData.bedroomsTotal || propertyData.bedrooms || propertyData.Bedrooms || 0;
    const bathrooms = propertyData.BathroomsTotal || propertyData.bathroomsTotal || propertyData.bathrooms || propertyData.Bathrooms || propertyData.BathroomTotal || propertyData.bathroomTotal || 0;
    const sqft = propertyData.LivingArea || propertyData.livingArea || propertyData.LivingAreaRange || null;
    const price = formatPrice(propertyData.ListPrice || propertyData.listPrice || propertyData.price);
    const bedroomText = bedrooms > 0 ? `${bedrooms} bedroom${bedrooms > 1 ? "s" : ""}` : "bedroom";
    const bathroomText = bathrooms > 0 ? `${bathrooms} bathroom${bathrooms > 1 ? "s" : ""}` : "bathroom";
    let description2 = `This ${type.toLowerCase()} features ${bedroomText} and ${bathroomText}`;
    if (sqft && sqft !== "N/A" && sqft > 0) {
      description2 += ` with ${sqft} square feet of living space`;
    }
    description2 += `. Listed at ${price}, this property offers a great opportunity in a desirable location.`;
    return description2;
  };
  const getDescription = () => {
    const aiDetailedContent = aiDescription?.detailed || backendAiDescription?.detailed;
    const aiOverviewContent = aiDescription?.overview || backendAiDescription?.overview;
    const aiContent = aiDetailedContent || aiOverviewContent;
    if (aiContent) {
      if (waitingForAi) {
        setWaitingForAi(false);
        setHasLoadedAi(true);
      }
      return {
        main: aiContent,
        amenities: "",
        transportation: "",
        isAiGenerated: true,
        isLoading: false
      };
    }
    const propertyRemarks = propertyData?.PublicRemarks || propertyData?.publicRemarks || propertyData?.description;
    if (propertyRemarks && propertyRemarks.trim()) {
      return {
        main: propertyRemarks,
        amenities: "",
        transportation: "",
        isAiGenerated: false,
        isLoading: waitingForAi
      };
    }
    const basicDescription = generateBasicDescription();
    return {
      main: basicDescription,
      amenities: "",
      transportation: "",
      isAiGenerated: false,
      isLoading: waitingForAi || aiLoading
    };
  };
  const description = getDescription();
  const address = formatAddress();
  return /* @__PURE__ */ jsx("section", { className: "bg-white md:py-8 ", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-[950px]", children: /* @__PURE__ */ jsxs("div", { className: "bg-white", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2 mb-4 md:mb-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-center font-space-grotesk font-bold text-lg md:text-xl leading-tight", style: { color: "#293056" }, children: address }),
      description.isAiGenerated && auth?.user?.role === "admin" && /* @__PURE__ */ jsxs("span", { className: "text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1", children: [
        /* @__PURE__ */ jsx("svg", { className: "w-3 h-3", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M13 10V3L4 14h7v7l9-11h-7z" }) }),
        "AI Generated"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4 md:space-y-6 text-sm md:text-base leading-relaxed md:leading-normal", style: { fontFamily: "'Helvetica', 'Arial', sans-serif", fontWeight: 400 }, children: [
      description.main && /* @__PURE__ */ jsx("p", { className: "text-gray-700", children: description.main }),
      description.amenities && /* @__PURE__ */ jsx("p", { className: "text-gray-700", children: description.amenities }),
      description.transportation && /* @__PURE__ */ jsx("p", { className: "text-gray-700", children: description.transportation })
    ] })
  ] }) }) });
}
export {
  PropertyDescriptionSection as default
};
