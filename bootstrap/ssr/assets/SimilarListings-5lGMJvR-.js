import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useRef } from "react";
import PropertyCardV3 from "./PropertyCardV3-BcN--v-Y.js";
import "./PluginStyleImageLoader-Rq93vDmq.js";
const SimilarListings = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);
  const buildings = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop&auto=format&q=80",
      title: "Luxury Downtown Tower",
      address: "123 King Street West",
      units: "45 units",
      priceRange: "$800K - $2.5M"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&auto=format&q=80",
      title: "Riverside Condominiums",
      address: "456 Queen Street East",
      units: "32 units",
      priceRange: "$600K - $1.8M"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop&auto=format&q=80",
      title: "Modern Urban Living",
      address: "789 Bay Street",
      units: "67 units",
      priceRange: "$900K - $3.2M"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop&auto=format&q=80",
      title: "Executive Suites",
      address: "321 Yonge Street",
      units: "28 units",
      priceRange: "$1.2M - $4.5M"
    }
  ];
  const itemsPerSlide = 3;
  const totalSlides = Math.ceil(buildings.length / itemsPerSlide);
  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };
  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };
  const goToSlide = (slideIndex) => {
    setCurrentSlide(slideIndex);
  };
  return /* @__PURE__ */ jsx("section", { className: "py-8 bg-white", children: /* @__PURE__ */ jsxs("div", { className: "max-w-[1280px] mx-auto px-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "More Buildings By Agent" }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: prevSlide,
            disabled: currentSlide === 0,
            className: `w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${currentSlide === 0 ? "border-gray-200 text-gray-300 cursor-not-allowed" : "border-gray-400 text-gray-600 hover:border-gray-600 hover:text-gray-800"}`,
            children: /* @__PURE__ */ jsx("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", children: /* @__PURE__ */ jsx("path", { d: "M10 12L6 8L10 4", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: nextSlide,
            disabled: currentSlide === totalSlides - 1,
            className: `w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${currentSlide === totalSlides - 1 ? "border-gray-200 text-gray-300 cursor-not-allowed" : "border-gray-400 text-gray-600 hover:border-gray-600 hover:text-gray-800"}`,
            children: /* @__PURE__ */ jsx("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", children: /* @__PURE__ */ jsx("path", { d: "M6 4L10 8L6 12", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "relative overflow-hidden", children: /* @__PURE__ */ jsx(
      "div",
      {
        ref: sliderRef,
        className: "flex transition-transform duration-500 ease-in-out",
        style: { transform: `translateX(-${currentSlide * 100}%)` },
        children: Array.from({ length: totalSlides }).map((_, slideIndex) => /* @__PURE__ */ jsx("div", { className: "w-full flex-shrink-0", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: buildings.slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide).map((building) => /* @__PURE__ */ jsx(
          PropertyCardV3,
          {
            image: building.image,
            title: building.title,
            address: building.address,
            units: building.units,
            priceRange: building.priceRange,
            onClick: () => console.log("Building clicked:", building.title)
          },
          building.id
        )) }) }, slideIndex))
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-center mt-6 gap-2", children: Array.from({ length: totalSlides }).map((_, index) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => goToSlide(index),
        className: `w-3 h-3 rounded-full transition-all ${currentSlide === index ? "bg-gray-800" : "bg-gray-300 hover:bg-gray-400"}`
      },
      index
    )) })
  ] }) });
};
export {
  SimilarListings as default
};
