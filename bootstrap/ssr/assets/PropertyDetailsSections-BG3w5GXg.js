import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { usePage } from "@inertiajs/react";
import MortgageCalculator from "./MortgageCalculator-Oo7_FBQb.js";
import NearbySchools from "./NearbySchools-B1yt2xDw.js";
import Amenities from "./Amenities-D8UjScBp.js";
const NAVY = "rgb(2, 46, 80)";
const LABEL = "rgb(75, 85, 99)";
const VALUE = "rgb(55, 65, 81)";
const pick = (...cands) => {
  for (const c of cands) {
    if (c === void 0 || c === null) continue;
    if (Array.isArray(c)) {
      const joined = c.filter((v) => v !== void 0 && v !== null && String(v).trim() !== "").join(", ");
      if (joined) return joined;
      continue;
    }
    const s = String(c).trim();
    if (s === "" || s === "0") continue;
    return c;
  }
  return "";
};
const num = (...cands) => {
  for (const c of cands) {
    const n = parseInt(c, 10);
    if (!isNaN(n) && n > 0) return n;
  }
  return "";
};
const money = (v) => {
  const n = Number(String(v ?? "").replace(/[^0-9.]/g, ""));
  if (!n) return "";
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0
  }).format(n);
};
const Card = ({ id, title, subtitle, children }) => /* @__PURE__ */ jsxs(
  "div",
  {
    id,
    className: "scroll-mt-32 rounded-2xl bg-white p-5 sm:p-6 border border-gray-200",
    children: [
      /* @__PURE__ */ jsx("h3", { style: { fontSize: "20px", fontWeight: 700, color: NAVY }, children: title }),
      subtitle && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500", children: subtitle }),
      children
    ]
  }
);
const Group = ({ title, rows }) => {
  const filled = (rows || []).filter(
    ([, v]) => v !== "" && v !== null && v !== void 0
  );
  if (!filled.length) return null;
  return /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
    /* @__PURE__ */ jsx("h4", { style: { fontSize: "15px", fontWeight: 700, color: NAVY }, children: title }),
    /* @__PURE__ */ jsx("ul", { className: "mt-2 list-disc pl-5 space-y-1.5", children: filled.map(([label, v]) => /* @__PURE__ */ jsxs("li", { style: { fontSize: "14px", color: LABEL, lineHeight: "22px" }, children: [
      label,
      ": ",
      /* @__PURE__ */ jsx("span", { style: { fontWeight: 600, color: VALUE }, children: v })
    ] }, label)) })
  ] });
};
const UnitToggle = ({ useFeet, setUseFeet, id }) => /* @__PURE__ */ jsxs("div", { className: "relative inline-block align-middle", children: [
  /* @__PURE__ */ jsx(
    "input",
    {
      type: "checkbox",
      id,
      className: "sr-only",
      checked: useFeet,
      onChange: (e) => setUseFeet(e.target.checked)
    }
  ),
  /* @__PURE__ */ jsx("label", { htmlFor: id, className: "flex items-center cursor-pointer", children: /* @__PURE__ */ jsxs("div", { className: "w-28 h-8 bg-gray-200 rounded-full relative flex items-center", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute w-14 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out top-1 left-1",
        style: { transform: useFeet ? "translateX(56px)" : "translateX(0)" }
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex w-full relative z-10", children: [
      /* @__PURE__ */ jsx(
        "span",
        {
          className: `text-xs font-medium flex items-center justify-center w-14 transition-colors duration-300 ${useFeet ? "text-gray-400" : "text-gray-700"}`,
          children: "Meter"
        }
      ),
      /* @__PURE__ */ jsx(
        "span",
        {
          className: `text-xs font-medium flex items-center justify-center w-14 transition-colors duration-300 ${useFeet ? "text-gray-700" : "text-gray-400"}`,
          children: "Feet"
        }
      )
    ] })
  ] }) })
] });
const calculateDaysOnMarket = (property) => {
  const listingDate = property?.ListingContractDate || property?.listingContractDate || property?.listDate || property?.listingDate || null;
  if (listingDate) {
    const parsed = new Date(
      typeof listingDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(listingDate) ? `${listingDate}T00:00:00` : listingDate
    );
    if (!isNaN(parsed.getTime())) {
      const today = /* @__PURE__ */ new Date();
      parsed.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      return Math.max(0, Math.floor((today - parsed) / 864e5));
    }
  }
  const existing = property?.DaysOnMarket ?? property?.daysOnMarket;
  if (existing !== void 0 && existing !== null && existing !== "") {
    return parseInt(existing, 10) || 0;
  }
  return 0;
};
const PropertyDetailsSections = ({ property = {}, buildingData = null, aiDescription = null }) => {
  const { globalWebsite, website } = usePage().props;
  const brandColors = globalWebsite?.brand_colors || website?.brand_colors || {};
  const buttonPrimaryBg = brandColors.button_primary_bg || "#293056";
  const buttonPrimaryText = brandColors.button_primary_text || "#FFFFFF";
  const [activeTab, setActiveTab] = useState("overview");
  const [expanded, setExpanded] = useState(false);
  const [showAllRooms, setShowAllRooms] = useState(false);
  const [useFeet, setUseFeet] = useState(false);
  const r = property?.repliers || {};
  const details = r.details || {};
  const condo = r.condominium || {};
  const lot = r.lot || {};
  r.address || {};
  const taxesRaw = r.taxes;
  const taxes = Array.isArray(taxesRaw) ? taxesRaw[0] || {} : taxesRaw || {};
  const originalDescription = pick(
    property.publicRemarks,
    property.PublicRemarks,
    property.description,
    details.description
  );
  const aiOverview = typeof aiDescription?.overview === "string" ? aiDescription.overview.trim() : "";
  const aiDetailed = typeof aiDescription?.detailed === "string" ? aiDescription.detailed.trim() : "";
  const description = aiOverview || originalDescription;
  const DESC_LIMIT = 320;
  const isLong = typeof description === "string" && description.length > DESC_LIMIT;
  const hasExpandedExtras = !!aiOverview && !!(aiDetailed || originalDescription);
  const shownDescription = !isLong || expanded ? description : `${description.slice(0, DESC_LIMIT).trim()}...`;
  const mlsNumber = pick(property.mlsNumber, property.listingKey, property.ListingKey);
  const office = pick(property.listOfficeName, property.ListOfficeName, property.listingOffice);
  const mlsLine = mlsNumber ? `MLS®: ${mlsNumber}${office ? `; ${office}` : ""}` : "";
  const livingArea = pick(property.LivingAreaRange, property.livingArea, details.sqft);
  const kitchens = num(details.numKitchens) ? (details.numKitchens || 0) + (details.numKitchensPlus || 0) : "";
  const interior = [
    ["Living Area", livingArea ? `${livingArea} ft²` : ""],
    ["Kitchens", kitchens || ""],
    ["Flooring", pick(details.flooring, details.floorType)]
  ];
  let bathBreakdown = details.bathrooms;
  if (bathBreakdown && !Array.isArray(bathBreakdown)) bathBreakdown = Object.values(bathBreakdown);
  let fullBaths = 0;
  let halfBaths = 0;
  (Array.isArray(bathBreakdown) ? bathBreakdown : []).forEach((b) => {
    const cnt = parseInt(b?.count, 10) || 1;
    const pcs = parseInt(b?.pieces, 10) || 0;
    if (pcs >= 3) fullBaths += cnt;
    else if (pcs > 0) halfBaths += cnt;
  });
  const totalBaths = num(property.bathroomsTotal, property.BathroomsTotalInteger, details.numBathrooms);
  const bedsBaths = [
    ["Bedrooms", num(property.bedroomsTotal, property.BedroomsTotal, details.numBedrooms)],
    ["Bathrooms", totalBaths],
    ["Full bathrooms", fullBaths || ""],
    ["Half bathrooms", halfBaths || ""]
  ];
  const parking = [
    ["Parking Spaces", num(property.parkingTotal, property.ParkingTotal, details.numParkingSpaces)],
    ["Parking Type", pick(details.garage, property.garage)]
  ];
  const construction = [
    ["Year Built", pick(property.yearBuilt, details.yearBuilt)],
    ["Style", pick(details.style, property.propertySubType, property.PropertySubType)],
    ["Stories", num(condo.stories, details.numStories)],
    ["Heating", pick(details.heating, property.heating)],
    ["Cooling", pick(details.airConditioning, property.cooling)],
    ["Basement", pick(details.basement, [details.basement1, details.basement2, details.basement3])],
    ["Roof", pick(details.roofMaterial, details.roof)],
    ["Foundation", pick(details.foundationType, details.foundationDetails, details.foundation)],
    ["Exterior", pick([details.exteriorConstruction1, details.exteriorConstruction2], details.construction)]
  ];
  const lotLand = [
    ["Zoning", pick(details.zoning, lot.zoning, property.zoning)],
    ["Water Source", pick(details.waterSource, details.water)],
    ["Sewer", pick(details.sewer, details.sewers)]
  ];
  const maintFee = pick(property.associationFee, property.AssociationFee, condo?.fees?.maintenance, details.maintenanceFee);
  const parkingMaintFee = pick(
    condo?.fees?.parking,
    condo?.parkingCost,
    details.parkingCost,
    buildingData?.parking_maintenance_fee
  );
  const lockerMaintFee = pick(
    condo?.fees?.locker,
    condo?.lockerCost,
    details.lockerCost,
    buildingData?.locker_maintenance_fee
  );
  const annualTaxVal = Number(String(taxes.annualAmount || property.taxAnnualAmount || "").replace(/[^0-9.]/g, "")) || 0;
  const fees = [
    ["Strata / Maintenance Fee", maintFee ? `${money(maintFee)}/mo` : ""],
    ["Parking Maintenance", money(parkingMaintFee) ? `${money(parkingMaintFee)}/mo` : ""],
    ["Locker Maintenance", money(lockerMaintFee) ? `${money(lockerMaintFee)}/mo` : ""],
    ["Annual Taxes", annualTaxVal ? money(annualTaxVal) : ""],
    ["Property Taxes (Monthly)", annualTaxVal ? `${money(annualTaxVal / 12)}/mo` : ""]
  ];
  const listingDetails = [
    ["Property Type", pick(property.propertyType, property.PropertyType, details.propertyType)],
    ["MLS®#", mlsNumber],
    ["Status", pick(property.StandardStatus, property.standardStatus, property.status)]
  ];
  const detailGroups = [
    { title: "Interior", rows: interior },
    { title: "Bedrooms & bathrooms", rows: bedsBaths },
    { title: "Parking", rows: parking },
    { title: "Construction", rows: construction },
    { title: "Lot & land", rows: lotLand },
    { title: "Fees & assessments", rows: fees },
    { title: "Listing details", rows: listingDetails }
  ];
  const hasAnyDetail = detailGroups.some(
    (g) => g.rows.some(([, v]) => v !== "" && v !== null && v !== void 0)
  );
  const rooms = (property.Rooms || property.rooms || []).filter(
    (room) => room && (room.name || room.type || room.level || room.dimensions)
  );
  const roomDims = (room) => {
    if (room.dimensions) return room.dimensions;
    const l = parseFloat(room.length) || 0;
    const w = parseFloat(room.width) || 0;
    return l && w ? `${room.length} x ${room.width} m` : "";
  };
  const roomDimsUnit = (room) => {
    const raw = roomDims(room);
    if (!raw) return "";
    const m = String(raw).match(/([\d.]+)\s*x\s*([\d.]+)/i);
    if (!m) return raw;
    const l = parseFloat(m[1]);
    const w = parseFloat(m[2]);
    if (useFeet) {
      return `${(l * 3.28084).toFixed(2)} x ${(w * 3.28084).toFixed(2)} ft`;
    }
    return `${l} x ${w} m`;
  };
  const hasBuildingAmenities = Array.isArray(buildingData?.amenities) && buildingData.amenities.length > 0;
  const status = pick(property.StandardStatus, property.standardStatus, property.MlsStatus, property.mlsStatus, "Active");
  const daysOnMarket = calculateDaysOnMarket(property);
  const overviewCard = description ? /* @__PURE__ */ jsxs(Card, { id: "overview", title: "Overview", children: [
    /* @__PURE__ */ jsxs("div", { className: "mt-3", style: { fontSize: "15px", color: VALUE, lineHeight: "26px" }, children: [
      /* @__PURE__ */ jsx("p", { style: { whiteSpace: "pre-line" }, children: shownDescription }),
      expanded && aiOverview && aiDetailed && /* @__PURE__ */ jsx("p", { className: "mt-3", style: { whiteSpace: "pre-line" }, children: aiDetailed }),
      expanded && aiOverview && originalDescription && /* @__PURE__ */ jsxs("div", { className: "mt-4 pt-4 border-t border-gray-100", children: [
        /* @__PURE__ */ jsx("h4", { style: { fontSize: "14px", fontWeight: 600, color: LABEL }, children: "Original listing remarks" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2", style: { whiteSpace: "pre-line", fontSize: "14px", color: LABEL }, children: originalDescription })
      ] }),
      (isLong || hasExpandedExtras) && /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setExpanded((v) => !v),
          className: "mt-3 underline",
          style: { fontSize: "14px", fontWeight: 600, color: NAVY },
          children: expanded ? "Read less" : "Read more"
        }
      )
    ] }),
    mlsLine && /* @__PURE__ */ jsx("div", { className: "mt-4 flex items-center gap-2.5 pt-4 border-t border-gray-100", children: /* @__PURE__ */ jsx("span", { style: { fontSize: "14px", fontWeight: 600, color: NAVY }, children: mlsLine }) })
  ] }, "overview") : null;
  const propertyDetailsCard = hasAnyDetail ? /* @__PURE__ */ jsx(Card, { id: "property-details", title: "Property Details", subtitle: "Essentials & finishes", children: /* @__PURE__ */ jsx("div", { className: "mt-5 grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-7", children: detailGroups.map((g) => /* @__PURE__ */ jsx(Group, { title: g.title, rows: g.rows }, g.title)) }) }, "details") : null;
  const visibleRooms = showAllRooms ? rooms : rooms.slice(0, 3);
  const roomsCard = rooms.length > 0 ? /* @__PURE__ */ jsx(
    "div",
    {
      id: "rooms",
      className: "scroll-mt-32 p-4 rounded-xl border-gray-200 border bg-white",
      children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold mb-4", style: { color: "rgb(41, 48, 86)" }, children: "Room Dimensions" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-sm mb-4", children: "Explore the dimensions of each room and the overall layout of the unit." }),
        /* @__PURE__ */ jsx("div", { className: "md:hidden mb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-700", children: "Unit:" }),
          /* @__PURE__ */ jsx(UnitToggle, { useFeet, setUseFeet, id: "unit-toggle-mobile" })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "mb-2", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 text-sm gap-2 w-full", children: [
          /* @__PURE__ */ jsx("div", { className: "col-span-3 font-medium", children: "Rooms" }),
          /* @__PURE__ */ jsx("div", { className: "col-span-3 font-medium", children: "Dimensions" }),
          /* @__PURE__ */ jsx("div", { className: "col-span-2" }),
          /* @__PURE__ */ jsx("div", { className: "col-span-4 font-medium", children: "Features" })
        ] }) }),
        /* @__PURE__ */ jsx("div", { id: "rooms-container", children: visibleRooms.map((room, i) => /* @__PURE__ */ jsx("div", { className: `mb-1 ${i % 2 === 0 ? "bg-blue-50" : "bg-white"}`, children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 py-2 text-sm items-center px-3", children: [
          /* @__PURE__ */ jsx("div", { className: "col-span-3 text-[#263238]", children: room.name || room.type || "Room" }),
          /* @__PURE__ */ jsx("div", { className: "col-span-3", children: roomDimsUnit(room) }),
          /* @__PURE__ */ jsx("div", { className: "col-span-2" }),
          /* @__PURE__ */ jsx("div", { className: "col-span-4 text-[#263238]", children: pick(room.features) })
        ] }) }, `${room.name || room.type}-${i}`)) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 flex justify-between items-center", children: [
          rooms.length > 3 ? /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setShowAllRooms((v) => !v),
              className: "text-blue-600 text-sm hover:underline focus:outline-none",
              children: showAllRooms ? "Show less" : `Show all ${rooms.length} rooms`
            }
          ) : /* @__PURE__ */ jsx("span", {}),
          /* @__PURE__ */ jsx(UnitToggle, { useFeet, setUseFeet, id: "unit-toggle-bottom" })
        ] })
      ] })
    },
    "rooms"
  ) : null;
  const amenitiesCard = hasBuildingAmenities ? /* @__PURE__ */ jsx(
    "div",
    {
      id: "amenities",
      className: "scroll-mt-32 p-4 rounded-xl border-gray-200 border shadow-sm bg-white",
      children: /* @__PURE__ */ jsx(Amenities, { buildingData, propertyData: property })
    },
    "amenities"
  ) : null;
  const overviewContent = [overviewCard, propertyDetailsCard].filter(Boolean);
  const floorsContent = [roomsCard].filter(Boolean);
  const tabs = [];
  tabs.push({ id: "overview", label: "Overview" });
  if (floorsContent.length) tabs.push({ id: "floors", label: "Property rooms" });
  if (amenitiesCard) tabs.push({ id: "amenities", label: "Amenities" });
  tabs.push({ id: "mortgage", label: "Mortgage Calculator" });
  tabs.push({ id: "schools", label: "Nearby schools" });
  const activeExists = tabs.some((t) => t.id === activeTab);
  const currentTab = activeExists ? activeTab : "overview";
  const renderTabContent = () => {
    switch (currentTab) {
      case "overview":
        return /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-4", children: overviewContent });
      case "floors":
        return /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-4", children: floorsContent });
      case "amenities":
        return /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-4", children: amenitiesCard });
      case "mortgage":
        return /* @__PURE__ */ jsx(Card, { title: "Mortgage Calculator", children: /* @__PURE__ */ jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsx(MortgageCalculator, { property, hideHeading: true }) }) });
      case "schools":
        return /* @__PURE__ */ jsx(Card, { title: "Nearby Schools", children: /* @__PURE__ */ jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsx(NearbySchools, { propertyData: property, hideHeading: true }) }) });
      default:
        return null;
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "w-full max-w-[1280px] mx-auto py-0", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start gap-6 w-full relative z-10", children: [
      /* @__PURE__ */ jsx("div", { className: "flex flex-row items-start gap-[22px] h-10", children: status === "Active" && /* @__PURE__ */ jsx("div", { className: "flex items-center px-2 gap-2 min-w-[138px] h-10 rounded-xl", style: { backgroundColor: buttonPrimaryBg }, children: /* @__PURE__ */ jsxs("span", { className: "font-work-sans font-bold text-sm leading-6 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis", style: { color: buttonPrimaryText }, children: [
        daysOnMarket,
        " Days on Market"
      ] }) }) }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-col items-start gap-[18px] w-full", children: /* @__PURE__ */ jsx("div", { className: "flex flex-row items-center gap-[8px] h-[50px] overflow-x-auto scrollbar-hide w-full md:flex-wrap", children: tabs.map((tab) => /* @__PURE__ */ jsx(
        "div",
        {
          className: `flex justify-center items-center p-2.5 cursor-pointer transition-all duration-300 border-b flex-shrink-0 ${currentTab === tab.id ? "border-[#252B37]" : "border-transparent hover:border-[#3E4784]"} h-[50px]`,
          onClick: () => setActiveTab(tab.id),
          children: /* @__PURE__ */ jsx("span", { className: `font-red-hat font-bold text-xl leading-[30px] tracking-tight whitespace-nowrap flex items-center ${currentTab === tab.id ? "text-[#252B37]" : "text-[#252B37] hover:text-[#3E4784]"}`, children: tab.label })
        },
        tab.id
      )) }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "w-full relative min-h-[200px] mt-5", children: /* @__PURE__ */ jsx("div", { className: "w-full animate-fadeIn", children: renderTabContent() }) }),
    /* @__PURE__ */ jsx("style", { children: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-in-out; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      ` })
  ] });
};
export {
  PropertyDetailsSections as default
};
