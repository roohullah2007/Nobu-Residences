import { jsxs, jsx } from "react/jsx-runtime";
import React, { useState } from "react";
import NearbySchools from "./NearbySchools-B1yt2xDw.js";
import Amenities from "./Amenities-D8UjScBp.js";
import MortgageCalculator from "./MortgageCalculator-Cp8HgKSN.js";
import "@inertiajs/react";
const BuildingStatusTabs = ({ building }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const buildingData = {
    description: "Found in Toronto's North York suburb and built in 2001 by Menkes Development Inc, this Toronto condo sits near the intersection of Yonge St & Hillcrest Ave. The Pinnacle is a high-rise condo situated in the bustling neighbourhood of Willowdale East. Located at The Pinnacle this North York condo has suites ranging from 406 to 1790 sqft. There are 378 units at The Pinnacle, with a variety of exposures and layouts over 31 levels. Residents of this condo can enjoy amenities like a Gym / Exercise Room, Concierge, Parking Garage and a Sauna, along with an Enter Phone System. Monthly maintenance fees include Common Element Maintenance, Building Insurance and Water. Ranked the 154 most expensive condo building in North York, this condo is one of the more exclusive options. The price per square foot is currently averaging $882.07. The average one bed condo at The Pinnacle has been selling for around $535000.00. The average two bed condo at The Pinnacle has been selling for around $750000.00."
  };
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "amenities", label: "Amenities" },
    { id: "schools", label: "Nearby schools" },
    { id: "mortgage", label: "Mortgage Calculator" },
    { id: "floors", label: "Floors & Rooms" }
  ];
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return /* @__PURE__ */ jsx("div", { className: "flex flex-col rounded-xl border-gray-200 border p-4 items-start gap-2 w-full max-w-[1280px]", children: /* @__PURE__ */ jsxs("div", { className: "w-full font-work-sans text-lg leading-7 tracking-tight text-[#252B37]", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-bold mr-2 font-space-grotesk", style: { color: "#293056" }, children: "About The Building" }),
          /* @__PURE__ */ jsx("span", { className: "font-normal", children: building?.description || buildingData.description })
        ] }) });
      case "amenities":
        return /* @__PURE__ */ jsx("div", { className: "p-4 rounded-xl border-gray-200 border shadow-sm", children: /* @__PURE__ */ jsx(Amenities, { buildingData: building }) });
      case "schools":
        return /* @__PURE__ */ jsx("div", { className: "p-4 rounded-xl border-gray-200 border shadow-sm", children: /* @__PURE__ */ jsx(NearbySchools, { propertyData: building }) });
      case "mortgage":
        return /* @__PURE__ */ jsx("div", { className: "p-4 rounded-xl border-gray-200 border shadow-sm", children: /* @__PURE__ */ jsx(MortgageCalculator, { property: building }) });
      case "floors":
        return /* @__PURE__ */ jsx(BuildingFloorsRooms, { building });
      default:
        return null;
    }
  };
  const BuildingFloorsRooms = ({ building: building2 }) => {
    const [isMetric, setIsMetric] = useState(true);
    const [showAllFloors, setShowAllFloors] = useState(false);
    const totalFloors = building2?.floors || building2?.total_floors || 45;
    const totalUnits = building2?.total_units || 660;
    const unitsPerFloor = Math.ceil(totalUnits / totalFloors);
    const commonAreas = [
      { name: "Lobby", floor: "1", size: { meters: "15.0 x 12.0 m", feet: "49.2 x 39.4 ft" }, features: "Marble Flooring, 24/7 Concierge" },
      { name: "Amenity Floor", floor: "2-3", size: { meters: "25.0 x 20.0 m", feet: "82.0 x 65.6 ft" }, features: "Fitness Center, Pool, Lounge" },
      { name: "Party Room", floor: "2", size: { meters: "8.0 x 6.0 m", feet: "26.2 x 19.7 ft" }, features: "Kitchen, Entertainment System" },
      { name: "Rooftop Terrace", floor: String(totalFloors), size: { meters: "30.0 x 15.0 m", feet: "98.4 x 49.2 ft" }, features: "BBQ Area, Lounge Seating" }
    ];
    const floorBreakdown = [];
    for (let i = 1; i <= Math.min(showAllFloors ? totalFloors : 10, totalFloors); i++) {
      let floorType = "Residential";
      let units = unitsPerFloor;
      if (i === 1) {
        floorType = "Lobby & Commercial";
        units = 0;
      } else if (i === 2 || i === 3) {
        floorType = "Amenity Level";
        units = 0;
      } else if (i >= totalFloors - 2) {
        floorType = "Penthouse Level";
        units = Math.max(1, Math.floor(unitsPerFloor / 2));
      }
      floorBreakdown.push({
        floor: i,
        type: floorType,
        units,
        avgSqft: floorType === "Penthouse Level" ? "1,800 - 3,500" : floorType === "Residential" ? "500 - 1,500" : "-"
      });
    }
    return /* @__PURE__ */ jsx("div", { className: "p-4 rounded-xl border-gray-200 border shadow-sm", children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold mb-2", style: { color: "#293056" }, children: "Building Floor Plan Overview" }),
        /* @__PURE__ */ jsxs("p", { className: "text-gray-600 text-sm mb-4", children: [
          building2?.name || "This building",
          " features ",
          totalFloors,
          " floors with ",
          totalUnits,
          " total units."
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-[#F5F5F5] rounded-lg p-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-600", children: "Total Floors" }),
            /* @__PURE__ */ jsx("p", { className: "text-lg font-bold", style: { color: "#293056" }, children: totalFloors })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-[#F5F5F5] rounded-lg p-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-600", children: "Total Units" }),
            /* @__PURE__ */ jsx("p", { className: "text-lg font-bold", style: { color: "#293056" }, children: totalUnits })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-[#F5F5F5] rounded-lg p-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-600", children: "Parking Spots" }),
            /* @__PURE__ */ jsx("p", { className: "text-lg font-bold", style: { color: "#293056" }, children: building2?.parking_spots || "N/A" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-[#F5F5F5] rounded-lg p-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-600", children: "Year Built" }),
            /* @__PURE__ */ jsx("p", { className: "text-lg font-bold", style: { color: "#293056" }, children: building2?.year_built || "N/A" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold mb-3", style: { color: "#293056" }, children: "Common Areas & Amenity Spaces" }),
        /* @__PURE__ */ jsx("div", { className: "flex justify-end mb-3", children: /* @__PURE__ */ jsxs("div", { className: "relative inline-block align-middle", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              id: "unit-toggle-floors",
              className: "sr-only",
              checked: !isMetric,
              onChange: () => setIsMetric(!isMetric)
            }
          ),
          /* @__PURE__ */ jsx("label", { htmlFor: "unit-toggle-floors", className: "flex items-center cursor-pointer", children: /* @__PURE__ */ jsxs("div", { className: "w-28 h-8 bg-gray-200 rounded-full relative flex items-center", children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: `absolute w-14 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out top-1 ${isMetric ? "left-1" : "left-[52px]"}`
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex w-full relative z-10", children: [
              /* @__PURE__ */ jsx("span", { className: `text-xs font-medium flex items-center justify-center w-14 transition-colors duration-300 ${isMetric ? "text-gray-700" : "text-gray-400"}`, children: "Meter" }),
              /* @__PURE__ */ jsx("span", { className: `text-xs font-medium flex items-center justify-center w-14 transition-colors duration-300 ${!isMetric ? "text-gray-700" : "text-gray-400"}`, children: "Feet" })
            ] })
          ] }) })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-200", children: [
            /* @__PURE__ */ jsx("th", { className: "text-left py-2 px-3 font-medium text-gray-600", children: "Area" }),
            /* @__PURE__ */ jsx("th", { className: "text-left py-2 px-3 font-medium text-gray-600", children: "Floor" }),
            /* @__PURE__ */ jsx("th", { className: "text-left py-2 px-3 font-medium text-gray-600", children: "Size" }),
            /* @__PURE__ */ jsx("th", { className: "text-left py-2 px-3 font-medium text-gray-600", children: "Features" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: commonAreas.map((area, index) => /* @__PURE__ */ jsxs("tr", { className: index % 2 === 0 ? "bg-blue-50" : "bg-white", children: [
            /* @__PURE__ */ jsx("td", { className: "py-2 px-3 text-[#263238]", children: area.name }),
            /* @__PURE__ */ jsx("td", { className: "py-2 px-3", children: area.floor }),
            /* @__PURE__ */ jsx("td", { className: "py-2 px-3", children: isMetric ? area.size.meters : area.size.feet }),
            /* @__PURE__ */ jsx("td", { className: "py-2 px-3 text-[#263238]", children: area.features })
          ] }, index)) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold mb-3", style: { color: "#293056" }, children: "Floor Breakdown" }),
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-200", children: [
            /* @__PURE__ */ jsx("th", { className: "text-left py-2 px-3 font-medium text-gray-600", children: "Floor" }),
            /* @__PURE__ */ jsx("th", { className: "text-left py-2 px-3 font-medium text-gray-600", children: "Type" }),
            /* @__PURE__ */ jsx("th", { className: "text-left py-2 px-3 font-medium text-gray-600", children: "Units" }),
            /* @__PURE__ */ jsx("th", { className: "text-left py-2 px-3 font-medium text-gray-600", children: "Avg. Unit Size (sqft)" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: floorBreakdown.map((floor, index) => /* @__PURE__ */ jsxs("tr", { className: index % 2 === 0 ? "bg-blue-50" : "bg-white", children: [
            /* @__PURE__ */ jsx("td", { className: "py-2 px-3 font-medium", style: { color: "#293056" }, children: floor.floor }),
            /* @__PURE__ */ jsx("td", { className: "py-2 px-3", children: floor.type }),
            /* @__PURE__ */ jsx("td", { className: "py-2 px-3", children: floor.units > 0 ? floor.units : "-" }),
            /* @__PURE__ */ jsx("td", { className: "py-2 px-3", children: floor.avgSqft })
          ] }, index)) })
        ] }) }),
        totalFloors > 10 && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setShowAllFloors(!showAllFloors),
            className: "mt-4 text-blue-600 text-sm hover:underline focus:outline-none",
            children: showAllFloors ? `Show less (first 10 floors)` : `Show all ${totalFloors} floors`
          }
        )
      ] })
    ] }) });
  };
  return /* @__PURE__ */ jsxs("div", { className: "w-full max-w-[1280px] mx-auto py-0", "data-building-status-tabs": true, children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start gap-3 md:gap-6 w-full relative z-10", children: [
      (() => {
        const statusLabel = building?.status ? String(building.status).charAt(0).toUpperCase() + String(building.status).slice(1) : "Available";
        const segments = [{ text: statusLabel, color: "#1F8A3C" }];
        if (building?.year_built) segments.push({ text: `Year Built: ${building.year_built}`, color: "#111827" });
        if (building?.total_units) segments.push({ text: `Total Units: ${building.total_units}`, color: "#111827" });
        return /* @__PURE__ */ jsx("div", { className: "w-full pb-1", children: /* @__PURE__ */ jsx("p", { className: "font-work-sans font-semibold text-sm md:text-base flex flex-wrap items-center gap-x-3 gap-y-1", children: segments.map((seg, i) => /* @__PURE__ */ jsxs(React.Fragment, { children: [
          i > 0 && /* @__PURE__ */ jsx("span", { "aria-hidden": "true", style: { color: "#912018" }, children: "|" }),
          /* @__PURE__ */ jsx("span", { style: { color: seg.color }, children: seg.text })
        ] }, i)) }) });
      })(),
      /* @__PURE__ */ jsx("div", { className: "flex flex-col items-start gap-[18px] w-full", children: /* @__PURE__ */ jsx("div", { className: "flex flex-row items-center gap-[8px] min-h-[50px] overflow-x-auto scrollbar-hide w-full md:flex-wrap", children: tabs.map((tab, index) => /* @__PURE__ */ jsx(
        "div",
        {
          className: `flex justify-center items-center p-2.5 cursor-pointer transition-all duration-300 border-b flex-shrink-0 ${activeTab === tab.id ? "border-[#252B37]" : "border-transparent hover:border-[#3E4784]"} ${index === 0 ? "min-w-[108px]" : index === 1 ? "min-w-[120px]" : index === 2 ? "min-w-[158px]" : index === 3 ? "min-w-[180px]" : "min-w-[150px]"} h-[50px]`,
          onClick: () => handleTabClick(tab.id),
          "data-tab": tab.id,
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
  BuildingStatusTabs as default
};
