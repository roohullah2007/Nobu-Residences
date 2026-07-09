import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import PropertyRooms from "./PropertyRooms-CuQrzH0C.js";
import MortgageCalculator from "./MortgageCalculator-Cp8HgKSN.js";
import NearbySchools from "./NearbySchools-B1yt2xDw.js";
import Amenities from "./Amenities-D8UjScBp.js";
import { u as usePropertyAiDescription } from "./usePropertyAiDescription-C5QLpmY7.js";
import "axios";
const PropertyStatusTabs = ({ property, buildingData, aiDescription: backendAiDescription, auth }) => {
  const { globalWebsite, website } = usePage().props;
  const brandColors = globalWebsite?.brand_colors || website?.brand_colors || {};
  const buttonPrimaryBg = brandColors.button_primary_bg || "#293056";
  const buttonPrimaryText = brandColors.button_primary_text || "#FFFFFF";
  const [activeTab, setActiveTab] = useState("overview");
  const isAdmin = auth?.user?.role === "admin" || auth?.user?.is_admin === true;
  const {
    loading: aiLoading,
    description: aiDescription,
    error: aiError,
    generateDescriptionAndFaqs,
    getAllContent,
    setDescription
  } = usePropertyAiDescription();
  const mlsId = property?.ListingKey || property?.listingKey || property?.MLS_NUMBER || property?.mls_number || "";
  const [isGenerating, setIsGenerating] = useState(false);
  useEffect(() => {
    if (backendAiDescription) {
      if (backendAiDescription.overview || backendAiDescription.detailed) {
        setDescription({
          overview: backendAiDescription.overview,
          detailed: backendAiDescription.detailed
        });
      }
      if ((backendAiDescription.overview || backendAiDescription.detailed) && backendAiDescription.faqs) {
        return;
      }
    }
    if (mlsId && !isGenerating) {
      setIsGenerating(true);
      getAllContent(mlsId).then((result) => {
        const hasDescription = result && result.description;
        const hasFaqs = result && result.faqs && result.faqs.length > 0;
        if (hasDescription && hasFaqs) {
          setIsGenerating(false);
        } else {
          handleGenerateAiDescription();
        }
      }).catch((error) => {
        handleGenerateAiDescription();
      });
    }
  }, [mlsId, backendAiDescription]);
  const handleGenerateAiDescription = async () => {
    if (!mlsId || isGenerating) {
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateDescriptionAndFaqs(mlsId, false);
    } catch (error) {
      console.error("Error generating AI content");
    } finally {
      setIsGenerating(false);
    }
  };
  const calculateDaysOnMarket = () => {
    let listingDate = null;
    if (property?.ListingContractDate) {
      listingDate = property.ListingContractDate;
    } else if (property?.listingContractDate) {
      listingDate = property.listingContractDate;
    } else if (property?.property?.ListingContractDate) {
      listingDate = property.property.ListingContractDate;
    } else if (property?.property?.listingContractDate) {
      listingDate = property.property.listingContractDate;
    }
    if (listingDate) {
      try {
        let parsedDate;
        if (typeof listingDate === "string") {
          if (listingDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            parsedDate = /* @__PURE__ */ new Date(listingDate + "T00:00:00");
          } else {
            parsedDate = new Date(listingDate);
          }
        } else {
          parsedDate = new Date(listingDate);
        }
        if (!isNaN(parsedDate.getTime())) {
          const today = /* @__PURE__ */ new Date();
          parsedDate.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);
          const diffInMs = today.getTime() - parsedDate.getTime();
          const diffInDays = Math.floor(diffInMs / (1e3 * 60 * 60 * 24));
          return Math.max(0, diffInDays);
        } else {
          console.warn("⚠️ Could not parse date:", listingDate);
        }
      } catch (error) {
        console.error("❌ Error parsing date:", error);
      }
    }
    const originalEntry = property?.OriginalEntryTimestamp || property?.originalEntryTimestamp || property?.property?.OriginalEntryTimestamp || property?.property?.originalEntryTimestamp;
    if (originalEntry) {
      try {
        const entryDate = new Date(originalEntry);
        if (!isNaN(entryDate.getTime())) {
          const today = /* @__PURE__ */ new Date();
          entryDate.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);
          const diffInMs = today.getTime() - entryDate.getTime();
          const diffInDays = Math.floor(diffInMs / (1e3 * 60 * 60 * 24));
          return Math.max(0, diffInDays);
        }
      } catch (error) {
        console.error("❌ Error parsing OriginalEntryTimestamp:", error);
      }
    }
    const existingDays = property?.DaysOnMarket || property?.daysOnMarket;
    if (existingDays !== void 0 && existingDays !== null && existingDays !== "") {
      return parseInt(existingDays) || 0;
    }
    console.warn("⚠️ No date information found for days on market calculation");
    return 0;
  };
  const formatCloseDate = () => {
    const closeDate = property?.CloseDate || property?.closeDate;
    if (closeDate) {
      const date = new Date(closeDate);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
    return null;
  };
  const propertyData = {
    daysOnMarket: calculateDaysOnMarket(),
    closeDate: formatCloseDate(),
    status: property?.StandardStatus || property?.standardStatus || property?.MlsStatus || property?.mlsStatus || "Active",
    transactionType: property?.TransactionType || property?.transactionType || "For Sale",
    description: property?.PublicRemarks || property?.publicRemarks || property?.description || ""
  };
  buildingData && buildingData.amenities && Array.isArray(buildingData.amenities) && buildingData.amenities.length > 0;
  buildingData && buildingData.maintenance_fee_amenities && Array.isArray(buildingData.maintenance_fee_amenities) && buildingData.maintenance_fee_amenities.length > 0;
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "rooms", label: "Property rooms" },
    { id: "mortgage", label: "Mortgage calculator" },
    { id: "schools", label: "Nearby schools" }
  ];
  if (buildingData && buildingData.id) {
    tabs.push({ id: "amenities", label: "Amenities" });
  }
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        const displayDescription = aiDescription?.overview || aiDescription?.detailed || backendAiDescription?.overview || backendAiDescription?.detailed || property?.PublicRemarks || property?.publicRemarks || property?.description || "Loading property description...";
        const isAiGenerated = !!(aiDescription?.overview || aiDescription?.detailed || backendAiDescription?.overview || backendAiDescription?.detailed);
        return /* @__PURE__ */ jsx("div", { className: "flex flex-col rounded-xl border-gray-200 border p-4 items-start gap-2 w-full max-w-[1280px]", children: /* @__PURE__ */ jsxs("div", { className: "w-full font-work-sans text-lg leading-7 tracking-tight text-[#252B37]", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-bold mr-2 font-space-grotesk", style: { color: "#293056" }, children: "About" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              isAdmin && isAiGenerated && /* @__PURE__ */ jsxs("span", { className: "text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1", children: [
                /* @__PURE__ */ jsx("svg", { className: "w-3 h-3", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 10V3L4 14h7v7l9-11h-7z" }) }),
                "AI Generated"
              ] }),
              isAdmin && !aiLoading && isAiGenerated && /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: handleGenerateAiDescription,
                  className: "text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-1",
                  title: "Regenerate AI Description",
                  children: [
                    /* @__PURE__ */ jsx("svg", { className: "w-3 h-3", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 10V3L4 14h7v7l9-11h-7z" }) }),
                    "Regenerate"
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "font-normal block", children: displayDescription }),
          aiError && /* @__PURE__ */ jsx("div", { className: "mt-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
            "AI Generation Error: ",
            aiError
          ] }) })
        ] }) });
      case "rooms":
        return /* @__PURE__ */ jsx("div", { className: "p-4 rounded-xl border-gray-200 border", children: /* @__PURE__ */ jsx(PropertyRooms, { property }) });
      case "mortgage":
        return /* @__PURE__ */ jsx("div", { className: "p-4 rounded-xl border-gray-200 border shadow-sm", children: /* @__PURE__ */ jsx(MortgageCalculator, { property }) });
      case "schools":
        return /* @__PURE__ */ jsx("div", { className: "p-4 rounded-xl border-gray-200 border shadow-sm", children: /* @__PURE__ */ jsx(NearbySchools, { propertyData: property }) });
      case "amenities":
        return /* @__PURE__ */ jsx("div", { className: "p-4 rounded-xl border-gray-200 border shadow-sm", children: /* @__PURE__ */ jsx(Amenities, { buildingData }) });
      default:
        return null;
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "w-full max-w-[1280px] mx-auto py-0", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start gap-6 w-full relative z-10", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-row items-start gap-[22px] h-10", children: [
        propertyData.status === "Active" && /* @__PURE__ */ jsx("div", { className: "flex items-center px-2 gap-2 min-w-[138px] h-10 rounded-xl", style: { backgroundColor: buttonPrimaryBg }, children: /* @__PURE__ */ jsxs("span", { className: "font-work-sans font-bold text-sm leading-6 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis", style: { color: buttonPrimaryText }, children: [
          propertyData.daysOnMarket,
          " Days on Market"
        ] }) }),
        (propertyData.status === "Sold" || propertyData.status === "Closed") && propertyData.closeDate && /* @__PURE__ */ jsx("div", { className: "flex items-center px-3 gap-2 min-w-fit h-10 bg-[#3E4784] rounded-xl", children: /* @__PURE__ */ jsxs("span", { className: "font-work-sans font-bold text-sm leading-6 tracking-tight text-white whitespace-nowrap", children: [
          "Sold on ",
          propertyData.closeDate
        ] }) }),
        propertyData.status === "Leased" && propertyData.closeDate && /* @__PURE__ */ jsx("div", { className: "flex items-center px-3 gap-2 min-w-fit h-10 bg-[#3E4784] rounded-xl", children: /* @__PURE__ */ jsxs("span", { className: "font-work-sans font-bold text-sm leading-6 tracking-tight text-white whitespace-nowrap", children: [
          "Leased on ",
          propertyData.closeDate
        ] }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-col items-start gap-[18px] w-full", children: /* @__PURE__ */ jsx("div", { className: "flex flex-row items-center gap-[8px] h-[50px] overflow-x-auto scrollbar-hide w-full md:flex-wrap", children: tabs.map((tab, index) => /* @__PURE__ */ jsx(
        "div",
        {
          className: `flex justify-center items-center p-2.5 cursor-pointer transition-all duration-300 border-b flex-shrink-0 ${activeTab === tab.id ? "border-[#252B37]" : "border-transparent hover:border-[#3E4784]"} ${index === 0 ? "min-w-[108px]" : index === 1 ? "min-w-[163px]" : index === 2 ? "min-w-[202px]" : index === 3 ? "min-w-[158px]" : index === 4 ? "min-w-[112px]" : "min-w-[173px]"} h-[50px]`,
          onClick: () => handleTabClick(tab.id),
          children: /* @__PURE__ */ jsx("span", { className: `font-red-hat font-bold text-xl leading-[30px] tracking-tight whitespace-nowrap flex items-center ${activeTab === tab.id ? "text-[#252B37]" : "text-[#252B37] hover:text-[#3E4784]"}`, children: tab.label })
        },
        tab.id
      )) }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "w-full relative min-h-[200px] mt-5", children: /* @__PURE__ */ jsx("div", { className: "w-full animate-fadeIn", children: renderTabContent() }) }),
    /* @__PURE__ */ jsx("style", { children: `
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        /* Hide scrollbar but keep functionality */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Mobile responsive adjustments */
        @media (max-width: 768px) {
          .flex-row.items-center.gap-\\[14px\\] {
            padding-bottom: 8px;
          }
          
          .font-red-hat.font-bold.text-xl {
            font-size: 16px;
            line-height: 24px;
          }
        }
      ` })
  ] });
};
export {
  PropertyStatusTabs as default
};
