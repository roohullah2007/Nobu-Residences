import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { usePage } from "@inertiajs/react";
import PropertyCardV4 from "./PropertyCardV4-DCjy1DO5.js";
const PropertyCarouselBuilding = ({
  properties = [],
  title = "Properties",
  viewAllLink = "/properties",
  onCardClick,
  className = "",
  showBackground = true
}) => {
  const { globalWebsite, website } = usePage().props;
  const currentWebsite = website || globalWebsite;
  const brandColors = currentWebsite?.brand_colors || {};
  const buttonTertiaryBg = brandColors.button_tertiary_bg || "#000000";
  const buttonTertiaryText = brandColors.button_tertiary_text || "#FFFFFF";
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsToShow = 2;
  const maxIndex = Math.max(0, properties.length - cardsToShow);
  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };
  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };
  const formatPropertyData = (property) => {
    return {
      image: property.image,
      title: property.propertyType || property.name || "Property",
      address: property.address,
      units: property.bedrooms && property.bathrooms ? `${property.bedrooms} Beds | ${property.bathrooms} Baths` : property.units || "N/A",
      priceRange: property.price ? property.isRental ? `$${property.price.toLocaleString()}` : `$${property.price.toLocaleString()}` : property.priceRange || "Price on request",
      transactionType: property.isRental ? "Rent" : "Sale",
      price: property.price
    };
  };
  if (!properties.length) {
    return null;
  }
  const cardWidth = 360;
  const cardGap = 20;
  return /* @__PURE__ */ jsxs("div", { className: `font-work-sans w-full max-w-[1280px] mx-auto clear-both overflow-visible ${showBackground ? "bg-gray-50 p-4 rounded-xl border-gray-200 border shadow-sm" : "my-8"} ${className}`, children: [
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
            children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center p-2 gap-2.5 w-10 h-10", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-6 h-6 rounded-full", children: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6", width: "24", height: "24", fill: "white", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { d: "M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" }) }) }) })
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "overflow-hidden w-full max-w-[740px]", children: [
          " ",
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "flex gap-5 transition-transform duration-300 ease-in-out",
              style: { transform: `translateX(-${currentIndex * (cardWidth + cardGap)}px)` },
              children: properties.map((property, index) => {
                const formattedData = formatPropertyData(property);
                return /* @__PURE__ */ jsx(
                  PropertyCardV4,
                  {
                    ...formattedData,
                    onClick: () => onCardClick && onCardClick(property),
                    className: "flex-none w-[360px]"
                  },
                  `${property.id}-${index}`
                );
              })
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-col justify-center items-center p-1 gap-2.5 w-16 h-16 flex-none", children: /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleNext,
            disabled: currentIndex >= maxIndex,
            className: "flex items-center justify-center w-14 h-14 bg-orange-700 hover:bg-orange-800 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full border-none cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:hover:bg-gray-300 flex-none",
            "aria-label": "Next properties",
            children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center p-2 gap-2.5 w-10 h-10", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-6 h-6 rounded-full", children: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6", width: "24", height: "24", fill: "white", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { d: "M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" }) }) }) })
          }
        ) })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "lg:hidden overflow-x-auto scrollbar-hide py-4", children: /* @__PURE__ */ jsx("div", { className: "flex gap-5", children: properties.map((property, index) => {
        const formattedData = formatPropertyData(property);
        return /* @__PURE__ */ jsx(
          PropertyCardV4,
          {
            ...formattedData,
            onClick: () => onCardClick && onCardClick(property),
            className: "flex-none w-80"
          },
          `mobile-${property.id}-${index}`
        );
      }) }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-center mt-8", children: /* @__PURE__ */ jsx(
      "a",
      {
        href: viewAllLink,
        className: "flex items-center justify-center px-8 py-2.5 gap-2 h-11 rounded-full font-work-sans font-bold text-base leading-6 tracking-tight no-underline transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg hover:no-underline whitespace-nowrap",
        style: { backgroundColor: buttonTertiaryBg, color: buttonTertiaryText },
        children: "View all"
      }
    ) })
  ] });
};
export {
  PropertyCarouselBuilding as default
};
