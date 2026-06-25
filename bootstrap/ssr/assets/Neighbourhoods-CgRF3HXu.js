import { jsx, jsxs } from "react/jsx-runtime";
import "react";
const MapMarker = ({ x, y, isMainProperty = false }) => /* @__PURE__ */ jsx(
  "div",
  {
    className: "absolute",
    style: { left: `${x}px`, top: `${y}px`, transform: "translate(-50%, -50%)" },
    children: isMainProperty ? (
      // Main property marker (red location pin)
      /* @__PURE__ */ jsx("div", { className: "relative", children: /* @__PURE__ */ jsxs("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", children: [
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M21 10C21 17 12 23 12 23S3 17 3 10C3 5.58172 7.02944 2 12 2C16.9706 2 21 5.58172 21 10Z",
            fill: "#F34545",
            stroke: "#FFFFFF",
            strokeWidth: "2"
          }
        ),
        /* @__PURE__ */ jsx("circle", { cx: "12", cy: "10", r: "3", fill: "#FFFFFF" })
      ] }) })
    ) : (
      // Other property markers (black dots)
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "w-[10px] h-[10px] bg-black rounded-full",
          style: { borderRadius: "40px" }
        }
      )
    )
  }
);
const Neighbourhoods = ({ propertyData }) => {
  const propertyMarkers = [
    { x: 327, y: 91 },
    { x: 401, y: 91 },
    { x: 379, y: 129 },
    { x: 307, y: 125 },
    { x: 283, y: 66 },
    { x: 348, y: 66 },
    { x: 343, y: 129 },
    { x: 293, y: 109 },
    { x: 401, y: 56 },
    { x: 369, y: 86 }
  ];
  const mainPropertyLocation = { x: 340, y: 85 };
  return /* @__PURE__ */ jsx("div", { className: "w-full max-w-[1280px]", children: /* @__PURE__ */ jsxs("div", { className: "w-full h-[250px] relative", children: [
    /* @__PURE__ */ jsx(
      "img",
      {
        src: "/assets/map.jpg",
        alt: "Neighborhood Map",
        className: "w-full h-full object-cover rounded-[10px]"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 rounded-[10px] overflow-hidden", children: [
      propertyMarkers.map((marker, index) => /* @__PURE__ */ jsx(MapMarker, { x: marker.x, y: marker.y }, index)),
      /* @__PURE__ */ jsx(
        MapMarker,
        {
          x: mainPropertyLocation.x,
          y: mainPropertyLocation.y,
          isMainProperty: true
        }
      )
    ] })
  ] }) });
};
export {
  Neighbourhoods as default
};
