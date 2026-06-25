import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
const PropertyRooms = ({ property }) => {
  const [isMetric, setIsMetric] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const rawRooms = property?.Rooms || property?.rooms || [];
  if (!rawRooms || rawRooms.length === 0) {
    return null;
  }
  const rooms = rawRooms.map((room, index) => {
    const length = parseFloat(room.length) || 0;
    const width = parseFloat(room.width) || 0;
    const hasDimensions = length > 0 && width > 0;
    const lengthFt = (length * 3.28084).toFixed(1);
    const widthFt = (width * 3.28084).toFixed(1);
    return {
      name: room.name || room.type || room.description || "",
      meters: hasDimensions ? `${length} x ${width} m` : room.dimensions || "",
      feet: hasDimensions ? `${lengthFt} x ${widthFt} ft` : room.dimensions || "",
      features: room.features || "",
      isAlternate: index % 2 === 0
    };
  });
  const visibleRooms = showAll ? rooms : rooms.slice(0, 3);
  const hasMore = rooms.length > 3;
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold mb-4", style: { color: "#293056" }, children: "Room Dimensions" }),
    /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-sm mb-4", children: "Explore the dimensions of each room and the overall layout of the unit." }),
    /* @__PURE__ */ jsx("div", { className: "md:hidden mb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-700", children: "Unit:" }),
      /* @__PURE__ */ jsx(ToggleSwitch, { id: "unit-toggle-mobile", isMetric, onToggle: () => setIsMetric(!isMetric) })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "mb-2", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 text-sm gap-2 w-full", children: [
      /* @__PURE__ */ jsx("div", { className: "col-span-3 font-medium", children: "Rooms" }),
      /* @__PURE__ */ jsx("div", { className: "col-span-3 font-medium", children: "Dimensions" }),
      /* @__PURE__ */ jsx("div", { className: "col-span-2" }),
      /* @__PURE__ */ jsx("div", { className: "col-span-4 font-medium", children: "Features" })
    ] }) }),
    /* @__PURE__ */ jsx("div", { id: "rooms-container", children: visibleRooms.map((room, index) => /* @__PURE__ */ jsx("div", { className: `mb-1 ${room.isAlternate ? "bg-blue-50" : "bg-white"}`, children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 py-2 text-sm items-center px-3", children: [
      /* @__PURE__ */ jsx("div", { className: "col-span-3 text-[#263238]", children: room.name }),
      /* @__PURE__ */ jsx("div", { className: "col-span-3", children: isMetric ? room.meters : room.feet }),
      /* @__PURE__ */ jsx("div", { className: "col-span-2" }),
      /* @__PURE__ */ jsx("div", { className: "col-span-4 text-[#263238]", children: room.features })
    ] }) }, index)) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4 flex justify-between items-center", children: [
      hasMore && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setShowAll(!showAll),
          className: "text-blue-600 text-sm hover:underline focus:outline-none",
          children: showAll ? "Show less" : `Show all ${rooms.length} rooms`
        }
      ),
      /* @__PURE__ */ jsx(ToggleSwitch, { id: "unit-toggle-bottom", isMetric, onToggle: () => setIsMetric(!isMetric) })
    ] })
  ] });
};
const ToggleSwitch = ({ id, isMetric, onToggle }) => /* @__PURE__ */ jsxs("div", { className: "relative inline-block align-middle", children: [
  /* @__PURE__ */ jsx("input", { type: "checkbox", id, className: "sr-only", checked: !isMetric, onChange: onToggle }),
  /* @__PURE__ */ jsx("label", { htmlFor: id, className: "flex items-center cursor-pointer", children: /* @__PURE__ */ jsxs("div", { className: "w-28 h-8 bg-gray-200 rounded-full relative flex items-center", children: [
    /* @__PURE__ */ jsx("div", { className: `absolute w-14 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out top-1 ${isMetric ? "left-1" : "left-[52px]"}` }),
    /* @__PURE__ */ jsxs("div", { className: "flex w-full relative z-10", children: [
      /* @__PURE__ */ jsx("span", { className: `text-xs font-medium flex items-center justify-center w-14 transition-colors duration-300 ${isMetric ? "text-gray-700" : "text-gray-400"}`, children: "Meter" }),
      /* @__PURE__ */ jsx("span", { className: `text-xs font-medium flex items-center justify-center w-14 transition-colors duration-300 ${!isMetric ? "text-gray-700" : "text-gray-400"}`, children: "Feet" })
    ] })
  ] }) })
] });
export {
  PropertyRooms as default
};
