import { jsxs, jsx } from "react/jsx-runtime";
import "react";
const Amenities = ({ buildingData, propertyData }) => {
  const amenityIcons = {
    "Concierge": "/assets/svgs/concierge.svg",
    "Party Room": "/assets/svgs/party-horn.svg",
    "Meeting Room": "/assets/svgs/meeting-consider-deliberate-about-meet.svg",
    "Security Guard": "/assets/svgs/police-security-policeman.svg",
    "Gym": "/assets/svgs/gym.svg",
    "Fitness Center": "/assets/svgs/gym.svg",
    "Visitor Parking": "/assets/svgs/parking.svg",
    "Parking Garage": "/assets/svgs/parking-garage-transportation-car-parking.svg",
    "Guest Suites": "/assets/svgs/bed.svg",
    "Pet Restriction": "/assets/svgs/pets.svg",
    "BBQ Permitted": "/assets/svgs/bbq-permitted.svg",
    "Outdoor Pool": "/assets/svgs/pool-ladder.svg",
    "Pool": "/assets/svgs/pool-ladder.svg",
    "Media Room": "/assets/svgs/media-room.svg",
    "Rooftop Deck": "/assets/svgs/deck-chair-under-the-sun.svg",
    "Security System": "/assets/svgs/security.svg",
    "Sauna": "/assets/svgs/amenity-default.svg",
    "Hot Tub": "/assets/svgs/shower.svg",
    "Playground": "/assets/svgs/party-horn.svg",
    "Tennis Court": "/assets/svgs/gym.svg",
    "Basketball Court": "/assets/svgs/gym.svg",
    "Library": "/assets/svgs/meeting-consider-deliberate-about-meet.svg",
    "Storage": "/assets/svgs/parking-garage-transportation-car-parking.svg",
    "Lounge": "/assets/svgs/party-horn.svg"
  };
  const building = buildingData || propertyData?.buildingData || propertyData;
  const buildingAmenities = building?.amenities || [];
  console.log("Amenities Component - Property Data:", propertyData);
  console.log("Amenities Component - Building Data:", buildingData);
  console.log("Amenities Component - Building:", building);
  console.log("Amenities Component - Building Amenities:", buildingAmenities);
  console.log("Amenities Component - Maintenance Fee Amenities:", building?.maintenance_fee_amenities);
  let allAmenities = [];
  if (buildingAmenities && Array.isArray(buildingAmenities) && buildingAmenities.length > 0) {
    allAmenities = buildingAmenities.map((amenity) => {
      let iconPath = amenity.icon;
      if (iconPath && (iconPath.startsWith("/assets") || iconPath.startsWith("http"))) ;
      else if (amenityIcons[amenity.name]) {
        iconPath = amenityIcons[amenity.name];
      } else {
        iconPath = "/assets/svgs/amenity-default.svg";
      }
      return {
        name: amenity.name,
        iconPath
      };
    });
  }
  const maintenanceFeeAmenities = building?.maintenance_fee_amenities || building?.maintenanceFeeAmenities || [];
  console.log("Maintenance Fee Amenities from Backend:", maintenanceFeeAmenities);
  console.log("Type of maintenance_fee_amenities:", typeof maintenanceFeeAmenities);
  console.log("Is Array:", Array.isArray(maintenanceFeeAmenities));
  const includedAmenities = Array.isArray(maintenanceFeeAmenities) ? maintenanceFeeAmenities.map((amenity) => ({
    name: amenity.name,
    iconPath: amenity.icon || "/assets/svgs/amenity-default.svg",
    included: true
  })) : [];
  const CheckIcon = () => /* @__PURE__ */ jsx("img", { src: "/assets/svgs/tick.svg", alt: "Check", className: "w-5 h-5" });
  const buildingName = building?.name || propertyData?.buildingName || propertyData?.building?.name || "this building";
  if (!allAmenities || allAmenities.length === 0) {
    return /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold mb-4", style: { color: "#293056" }, children: "Amenities" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-sm", children: "No amenities information available for this property." })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold mb-4", style: { color: "#293056" }, children: "Amenities" }),
    /* @__PURE__ */ jsxs("p", { className: "text-gray-600 text-sm mb-4", children: [
      "Explore the amenities available at ",
      buildingName,
      ", including shared spaces and building services."
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row items-start gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1 w-full lg:max-w-[658px]", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold mb-4", style: { color: "#293056" }, children: "Building Features & Services" }),
        /* @__PURE__ */ jsx("div", { className: "border border-gray-200 rounded-lg p-4 h-full", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-4 lg:gap-x-8 lg:gap-y-4", children: allAmenities.map((amenity, index) => /* @__PURE__ */ jsxs("div", { className: "flex flex-row items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: amenity.iconPath,
              alt: amenity.name,
              className: "w-5 h-5 flex-shrink-0",
              onError: (e) => {
                e.target.src = "/assets/svgs/amenity-default.svg";
              }
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "font-red-hat font-semibold text-sm leading-6 text-[#545454] truncate", children: amenity.name })
        ] }, amenity.id || index)) }) })
      ] }),
      includedAmenities.length > 0 && /* @__PURE__ */ jsxs("div", { className: "w-full lg:w-[300px] lg:flex-shrink-0", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold mb-4", style: { color: "#293056" }, children: "Included in Maintenance Fees" }),
        /* @__PURE__ */ jsx("div", { className: "border border-gray-200 rounded-lg p-4 h-full", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 lg:grid-cols-1 gap-4", children: includedAmenities.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "No amenities included in maintenance fees" }) : includedAmenities.map((amenity, index) => /* @__PURE__ */ jsxs("div", { className: "flex flex-row items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: amenity.iconPath,
              alt: amenity.name,
              className: "w-5 h-5 flex-shrink-0"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "font-work-sans font-medium text-sm leading-6 tracking-[-0.03em] text-[#293056] flex-1 truncate", children: amenity.name }),
          /* @__PURE__ */ jsx("div", { className: "w-5 h-5 flex-shrink-0", children: /* @__PURE__ */ jsx(CheckIcon, {}) })
        ] }, index)) }) })
      ] })
    ] })
  ] });
};
export {
  Amenities as default
};
