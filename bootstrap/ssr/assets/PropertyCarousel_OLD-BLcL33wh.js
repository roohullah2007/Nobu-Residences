import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import PropertyCardV1 from "./PropertyCardV1-BOo2rQTn.js";
import PropertyCardV2 from "./PropertyCardV2-mUYMOs8M.js";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import "@inertiajs/react";
import "./PropertyImageLoader-BD5_TkCg.js";
import "./propertyUrl-B4IVbEgn.js";
import "./slug-BdTdDGUL.js";
import "./propertyFormatters-B0QibXFa.js";
const PropertyCarousel = ({
  properties = [],
  title = "Properties",
  type = "sale",
  viewAllLink = "/properties",
  onCardClick,
  className = ""
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsToShow = { desktop: 3, tablet: 2, mobile: 1 };
  const getMaxIndex = (screenType) => {
    const cardsVisible = cardsToShow[screenType];
    return Math.max(0, properties.length - cardsVisible);
  };
  const maxIndexDesktop = getMaxIndex("desktop");
  const maxIndexTablet = getMaxIndex("tablet");
  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };
  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndexDesktop, prev + 1));
  };
  const handleNextTablet = () => {
    setCurrentIndex((prev) => Math.min(maxIndexTablet, prev + 1));
  };
  const ChevronLeftIcon = ({ className: className2 }) => /* @__PURE__ */ jsx("svg", { className: className2, width: "24", height: "24", fill: "white", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { d: "M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" }) });
  const ChevronRightIcon = ({ className: className2 }) => /* @__PURE__ */ jsx("svg", { className: className2, width: "24", height: "24", fill: "white", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { d: "M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" }) });
  const PropertyCard = type === "rent" ? PropertyCardV2 : PropertyCardV1;
  if (!properties.length) {
    return null;
  }
  return /* @__PURE__ */ jsxs("div", { className: `font-work-sans my-8 w-full max-w-[1280px] mx-auto clear-both overflow-visible ${className}`, children: [
    /* @__PURE__ */ jsx("div", { className: "mb-8 flex w-full", children: /* @__PURE__ */ jsx("h2", { className: "font-space-grotesk text-3xl font-bold text-gray-900 m-0 leading-9", children: title }) }),
    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx("div", { className: "hidden lg:block", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "flex flex-col justify-center items-center p-1 gap-2.5 w-16 h-16 flex-none", children: /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handlePrevious,
            disabled: currentIndex === 0,
            className: "flex items-center justify-center w-14 h-14 bg-orange-700 hover:bg-orange-800 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full border-none cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:hover:bg-gray-300 flex-none",
            "aria-label": "Previous properties",
            children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center p-2 gap-2.5 w-10 h-10", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-6 h-6 rounded-full", children: /* @__PURE__ */ jsx(ChevronLeftIcon, { className: "w-6 h-6" }) }) })
          }
        ) }),
        /* @__PURE__ */ jsx("div", { className: "overflow-hidden", style: { width: "calc(3 * 360px + 2 * 20px)" }, children: /* @__PURE__ */ jsx(
          "div",
          {
            className: "flex gap-5 transition-transform duration-300 ease-in-out",
            style: { transform: `translateX(-${currentIndex * (360 + 20)}px)` },
            children: properties.map((property) => /* @__PURE__ */ jsx(
              PropertyCard,
              {
                property,
                size: "default",
                onClick: onCardClick
              },
              property.id
            ))
          }
        ) }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-col justify-center items-center p-1 gap-2.5 w-16 h-16 flex-none", children: /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleNext,
            disabled: currentIndex >= maxIndexDesktop,
            className: "flex items-center justify-center w-14 h-14 bg-orange-700 hover:bg-orange-800 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full border-none cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:hover:bg-gray-300 flex-none",
            "aria-label": "Next properties",
            children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center p-2 gap-2.5 w-10 h-10", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-6 h-6 rounded-full", children: /* @__PURE__ */ jsx(ChevronRightIcon, { className: "w-6 h-6" }) }) })
          }
        ) })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "hidden md:block lg:hidden", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "flex flex-col justify-center items-center p-1 gap-2.5 w-16 h-16 flex-none", children: /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handlePrevious,
            disabled: currentIndex === 0,
            className: "flex items-center justify-center w-14 h-14 bg-orange-700 hover:bg-orange-800 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full border-none cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:hover:bg-gray-300 flex-none",
            "aria-label": "Previous properties",
            children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center p-2 gap-2.5 w-10 h-10", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-6 h-6 rounded-full", children: /* @__PURE__ */ jsx(ChevronLeftIcon, { className: "w-6 h-6" }) }) })
          }
        ) }),
        /* @__PURE__ */ jsx("div", { className: "overflow-hidden", style: { width: "calc(2 * 360px + 1 * 20px)" }, children: /* @__PURE__ */ jsx(
          "div",
          {
            className: "flex gap-5 transition-transform duration-300 ease-in-out",
            style: { transform: `translateX(-${currentIndex * (360 + 20)}px)` },
            children: properties.map((property) => /* @__PURE__ */ jsx(
              PropertyCard,
              {
                property,
                size: "default",
                onClick: onCardClick
              },
              property.id
            ))
          }
        ) }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-col justify-center items-center p-1 gap-2.5 w-16 h-16 flex-none", children: /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleNextTablet,
            disabled: currentIndex >= maxIndexTablet,
            className: "flex items-center justify-center w-14 h-14 bg-orange-700 hover:bg-orange-800 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full border-none cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:hover:bg-gray-300 flex-none",
            "aria-label": "Next properties",
            children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center p-2 gap-2.5 w-10 h-10", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-6 h-6 rounded-full", children: /* @__PURE__ */ jsx(ChevronRightIcon, { className: "w-6 h-6" }) }) })
          }
        ) })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "md:hidden overflow-x-auto scrollbar-hide py-4", children: /* @__PURE__ */ jsx("div", { className: "flex gap-5", children: properties.map((property) => /* @__PURE__ */ jsx(
        PropertyCard,
        {
          property,
          size: "mobile",
          onClick: onCardClick,
          className: "flex-none"
        },
        property.id
      )) }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-center mt-8", children: /* @__PURE__ */ jsx(
      "a",
      {
        href: viewAllLink,
        className: "flex items-center justify-center px-8 py-2.5 gap-2 h-11 bg-black rounded-full text-white font-work-sans font-bold text-base leading-6 tracking-tight no-underline transition-all duration-200 hover:bg-gray-700 hover:-translate-y-0.5 hover:shadow-lg hover:no-underline whitespace-nowrap",
        children: "View all"
      }
    ) })
  ] });
};
export {
  PropertyCarousel as default
};
