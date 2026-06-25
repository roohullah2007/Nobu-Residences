import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
const PropertyRooms = ({ propertyData = null }) => {
  const [activeUnit, setActiveUnit] = useState("feet");
  const metersToFeet = (meters) => {
    return (meters * 3.28084).toFixed(1);
  };
  const feetToMeters = (feet) => {
    return (feet / 3.28084).toFixed(1);
  };
  const getRoomsData = () => {
    let roomsData2 = [];
    if (propertyData?.Rooms && Array.isArray(propertyData.Rooms) && propertyData.Rooms.length > 0) {
      roomsData2 = propertyData.Rooms.map((room) => {
        const name = room.RoomType || "";
        const length = parseFloat(room.RoomLength) || 0;
        const width = parseFloat(room.RoomWidth) || 0;
        const units = room.RoomLengthWidthUnits?.toLowerCase() || "feet";
        let dimensionMeters = "";
        let dimensionFeet = "";
        if (length && width) {
          if (units === "meters" || units === "m") {
            dimensionMeters = `${length}m x ${width}m`;
            const lengthFeet = metersToFeet(length);
            const widthFeet = metersToFeet(width);
            dimensionFeet = `${lengthFeet}ft x ${widthFeet}ft`;
          } else {
            dimensionFeet = `${length}ft x ${width}ft`;
            const lengthMeters = feetToMeters(length);
            const widthMeters = feetToMeters(width);
            dimensionMeters = `${lengthMeters}m x ${widthMeters}m`;
          }
        }
        const features = [
          room.RoomFeature1,
          room.RoomFeature2,
          room.RoomFeature3
        ].filter((feature) => feature && feature.trim()).join(", ");
        return {
          name,
          dimensionMeters,
          dimensionFeet,
          features
        };
      });
    }
    if (roomsData2.length === 0) {
      roomsData2 = [
        {
          name: "Living Room",
          dimensionMeters: "7.19m x 3.26m",
          dimensionFeet: "23.6ft x 10.7ft",
          features: "Combined w/Dining Window Floor to Ceil Laminate"
        },
        {
          name: "Master Bedroom",
          dimensionMeters: "4.5m x 3.8m",
          dimensionFeet: "14.8ft x 12.5ft",
          features: "Walk-in Closet, Ensuite Bathroom"
        },
        {
          name: "Kitchen",
          dimensionMeters: "3.2m x 2.8m",
          dimensionFeet: "10.5ft x 9.2ft",
          features: "Granite Countertops, Stainless Steel Appliances"
        }
      ];
    }
    return roomsData2;
  };
  const roomsData = getRoomsData();
  const handleUnitToggle = (unit) => {
    setActiveUnit(unit);
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-4", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold", children: "Property Rooms" }),
      /* @__PURE__ */ jsxs("div", { className: "inline-flex bg-gray-100 text-black rounded-lg p-1", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => handleUnitToggle("feet"),
            className: `px-2 py-1 border-none rounded-md text-sm font-medium cursor-pointer transition-all duration-200 ${activeUnit === "feet" ? "bg-white shadow-sm text-black" : "bg-transparent hover:bg-gray-200 text-black"}`,
            children: "Square Feet"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => handleUnitToggle("meters"),
            className: `px-2 py-1 border-none rounded-md text-sm font-medium cursor-pointer transition-all duration-200 ${activeUnit === "meters" ? "bg-white shadow-sm text-black" : "bg-transparent hover:bg-gray-200 text-black"}`,
            children: "Meters"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-white border border-[#D2D2D2] rounded-xl overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("div", { className: "min-w-full", children: [
      /* @__PURE__ */ jsx("div", { className: "bg-[#FBF9F7] border-b border-[#D2D2D2]", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[1fr_1fr_2fr] gap-0", children: [
        /* @__PURE__ */ jsx("div", { className: "px-6 py-3 text-left text-sm font-bold tracking-wide text-gray-700", children: "Room" }),
        /* @__PURE__ */ jsx("div", { className: "px-6 py-3 text-left text-sm font-bold tracking-wide text-gray-700", children: "Dimensions" }),
        /* @__PURE__ */ jsx("div", { className: "px-6 py-3 text-left text-sm font-bold tracking-wide text-gray-700", children: "Features" })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "bg-white", children: roomsData.map((room, index) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: `grid grid-cols-[1fr_1fr_2fr] gap-0 ${index !== roomsData.length - 1 ? "border-b border-gray-200" : ""}`,
          children: [
            /* @__PURE__ */ jsx("div", { className: "px-6 py-4 text-sm font-medium whitespace-nowrap text-[#727272]", children: room.name }),
            /* @__PURE__ */ jsx("div", { className: "px-6 py-4 text-sm font-medium whitespace-nowrap text-[#727272]", children: activeUnit === "feet" ? room.dimensionFeet : room.dimensionMeters }),
            /* @__PURE__ */ jsx("div", { className: "px-6 py-4 text-sm font-medium text-gray-900", children: room.features })
          ]
        },
        index
      )) })
    ] }) }) })
  ] });
};
export {
  PropertyRooms as default
};
