import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useRef } from "react";
import PropertyCardV3 from "./PropertyCardV3-BhS8VPmx.js";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import "@inertiajs/react";
import "./PhoneInput-BOSF9o14.js";
function BuildingSlider({
  title = "More Buildings in the Area",
  buildings = [],
  agentName,
  className = ""
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef(null);
  const itemsPerView = 4;
  const maxIndex = Math.max(0, buildings.length - itemsPerView);
  const nextSlide = () => {
    if (currentIndex < maxIndex) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  const translateX = -currentIndex * (100 / itemsPerView);
  return /* @__PURE__ */ jsx("section", { className: `py-8 bg-gray-50 ${className}`, children: /* @__PURE__ */ jsxs("div", { className: "mx-auto px-4 md:px-0 max-w-[1280px]", children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-6", children: /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900", children: agentName ? /* @__PURE__ */ jsxs(Fragment, { children: [
      "More Buildings by",
      " ",
      /* @__PURE__ */ jsx("span", { className: "underline text-blue-600", children: agentName })
    ] }) : title }) }),
    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      buildings.length > itemsPerView && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: prevSlide,
            disabled: currentIndex === 0,
            className: "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg",
            children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: nextSlide,
            disabled: currentIndex >= maxIndex,
            className: "absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg",
            children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "overflow-hidden", children: /* @__PURE__ */ jsx(
        "div",
        {
          ref: sliderRef,
          className: "flex transition-transform duration-300 ease-in-out",
          style: { transform: `translateX(${translateX}%)` },
          children: buildings.map((building, index) => /* @__PURE__ */ jsx(
            "div",
            {
              className: "flex-shrink-0 px-2",
              style: { width: `${100 / itemsPerView}%` },
              children: /* @__PURE__ */ jsx(
                PropertyCardV3,
                {
                  property: building,
                  className: "h-full"
                }
              )
            },
            building.id || index
          ))
        }
      ) })
    ] }),
    buildings.length > itemsPerView && /* @__PURE__ */ jsx("div", { className: "flex justify-center mt-6 space-x-2", children: Array.from({ length: maxIndex + 1 }).map((_, index) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setCurrentIndex(index),
        className: `w-2 h-2 rounded-full transition-colors duration-200 ${currentIndex === index ? "bg-orange-600" : "bg-gray-300"}`
      },
      index
    )) })
  ] }) });
}
export {
  BuildingSlider as default
};
