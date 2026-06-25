import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import PropertyCard from "./PropertyCard-BWgqbSLf.js";
import { usePage } from "@inertiajs/react";
import "axios";
const PropertyCarousel = ({
  properties = [],
  auth,
  title = "Properties",
  type = "sale",
  viewAllLink = "/properties",
  onCardClick,
  className = ""
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { globalWebsite, website } = usePage().props;
  const currentWebsite = website || globalWebsite;
  const brandColors = currentWebsite?.brand_colors || {
    button_secondary_bg: "#912018",
    button_secondary_text: "#FFFFFF",
    button_tertiary_bg: "#000000",
    button_tertiary_text: "#FFFFFF"
  };
  const buttonSecondaryBg = brandColors.button_secondary_bg || "#912018";
  const buttonSecondaryText = brandColors.button_secondary_text || "#FFFFFF";
  const buttonTertiaryBg = brandColors.button_tertiary_bg || "#000000";
  const buttonTertiaryText = brandColors.button_tertiary_text || "#FFFFFF";
  const limitedProperties = properties.slice(0, 12);
  const carouselItems = [...limitedProperties];
  carouselItems.push({ isViewAllCard: true });
  const cardsToShow = { desktop: 3, tablet: 2, mobile: 1 };
  const cardWidth = 360;
  const cardGap = 20;
  const getMaxIndex = (screenType) => {
    const cardsVisible = cardsToShow[screenType];
    if (carouselItems.length <= cardsVisible) {
      return 0;
    }
    return carouselItems.length - cardsVisible;
  };
  const maxIndexDesktop = getMaxIndex("desktop");
  const maxIndexTablet = getMaxIndex("tablet");
  const getTranslateX = (index, visibleCards) => {
    const totalCards = carouselItems.length;
    const cardTotalWidth = cardWidth + cardGap;
    if (index >= totalCards - visibleCards) {
      const containerWidth = visibleCards * cardWidth + (visibleCards - 1) * cardGap;
      const totalWidth = totalCards * cardWidth + (totalCards - 1) * cardGap;
      return Math.max(0, totalWidth - containerWidth);
    }
    return index * cardTotalWidth;
  };
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
  if (!properties.length) {
    return null;
  }
  return /* @__PURE__ */ jsxs("div", { className: `font-work-sans w-full max-w-[1280px] mx-auto clear-both overflow-visible ${className}`, children: [
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
        /* @__PURE__ */ jsx("div", { className: "overflow-hidden flex-1", style: { maxWidth: "1120px" }, children: /* @__PURE__ */ jsx(
          "div",
          {
            className: "flex gap-5 transition-transform duration-300 ease-in-out",
            style: {
              transform: `translateX(-${getTranslateX(currentIndex, cardsToShow.desktop)}px)`,
              minWidth: "max-content"
            },
            children: carouselItems.map((item, index) => {
              if (item.isViewAllCard) {
                return /* @__PURE__ */ jsx("div", { className: "flex flex-col w-[300px] min-h-0 idx-ampre-property-card bg-white border-gray-300 border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl group relative", children: /* @__PURE__ */ jsxs(
                  "a",
                  {
                    href: viewAllLink,
                    className: "flex flex-col h-full text-inherit no-underline",
                    children: [
                      /* @__PURE__ */ jsx(
                        "div",
                        {
                          className: "relative w-full h-[200px] property-image-container overflow-hidden rounded-t-xl flex items-center justify-center",
                          style: { backgroundColor: buttonSecondaryBg },
                          children: /* @__PURE__ */ jsxs("div", { className: "text-center", style: { color: buttonSecondaryText }, children: [
                            /* @__PURE__ */ jsx("svg", { className: "w-16 h-16 mx-auto mb-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }),
                            /* @__PURE__ */ jsx("p", { className: "text-xl font-bold", children: "Explore More" })
                          ] })
                        }
                      ),
                      /* @__PURE__ */ jsxs("div", { className: "flex flex-col flex-grow items-start p-4 gap-2.5 box-border", children: [
                        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-bold text-lg leading-7 tracking-tight text-[#293056]", children: "Discover More Properties" }),
                        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start gap-2 w-full", children: [
                          /* @__PURE__ */ jsx("div", { className: "flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-base leading-6 tracking-tight text-[#293056]", children: "Browse All Available Listings" }),
                          /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-full min-h-8 pb-2 border-b border-gray-200", children: /* @__PURE__ */ jsx(
                            "div",
                            {
                              className: "inline-flex items-center justify-center px-6 py-2 rounded-full hover:opacity-90 transition-all font-work-sans font-semibold text-sm",
                              style: { backgroundColor: buttonSecondaryBg, color: buttonSecondaryText },
                              children: "View All Properties →"
                            }
                          ) }),
                          /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-full min-h-8", children: /* @__PURE__ */ jsx("div", { className: "font-work-sans font-normal text-base leading-6 tracking-tight text-[#293056] text-center", children: "Updated Daily" }) })
                        ] })
                      ] })
                    ]
                  }
                ) }, `desktop-view-all-${index}`);
              }
              return /* @__PURE__ */ jsx(
                PropertyCard,
                {
                  property: item
                },
                `desktop-${item.id}-${index}`
              );
            })
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
        /* @__PURE__ */ jsx("div", { className: "overflow-hidden flex-1", style: { maxWidth: "740px" }, children: /* @__PURE__ */ jsx(
          "div",
          {
            className: "flex gap-5 transition-transform duration-300 ease-in-out",
            style: { transform: `translateX(-${getTranslateX(currentIndex, cardsToShow.tablet)}px)` },
            children: carouselItems.map((item, index) => {
              if (item.isViewAllCard) {
                return /* @__PURE__ */ jsx("div", { className: "flex flex-col w-[300px] min-h-0 idx-ampre-property-card bg-white border-gray-300 border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl group relative", children: /* @__PURE__ */ jsxs(
                  "a",
                  {
                    href: viewAllLink,
                    className: "flex flex-col h-full text-inherit no-underline",
                    children: [
                      /* @__PURE__ */ jsx(
                        "div",
                        {
                          className: "relative w-full h-[200px] property-image-container overflow-hidden rounded-t-xl flex items-center justify-center",
                          style: { backgroundColor: buttonSecondaryBg },
                          children: /* @__PURE__ */ jsxs("div", { className: "text-center", style: { color: buttonSecondaryText }, children: [
                            /* @__PURE__ */ jsx("svg", { className: "w-16 h-16 mx-auto mb-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }),
                            /* @__PURE__ */ jsx("p", { className: "text-xl font-bold", children: "Explore More" })
                          ] })
                        }
                      ),
                      /* @__PURE__ */ jsxs("div", { className: "flex flex-col flex-grow items-start p-4 gap-2.5 box-border", children: [
                        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-bold text-lg leading-7 tracking-tight text-[#293056]", children: "Discover More Properties" }),
                        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start gap-2 w-full", children: [
                          /* @__PURE__ */ jsx("div", { className: "flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-base leading-6 tracking-tight text-[#293056]", children: "Browse All Available Listings" }),
                          /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-full min-h-8 pb-2 border-b border-gray-200", children: /* @__PURE__ */ jsx(
                            "div",
                            {
                              className: "inline-flex items-center justify-center px-6 py-2 rounded-full hover:opacity-90 transition-all font-work-sans font-semibold text-sm",
                              style: { backgroundColor: buttonSecondaryBg, color: buttonSecondaryText },
                              children: "View All Properties →"
                            }
                          ) }),
                          /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-full min-h-8", children: /* @__PURE__ */ jsx("div", { className: "font-work-sans font-normal text-base leading-6 tracking-tight text-[#293056] text-center", children: "Updated Daily" }) })
                        ] })
                      ] })
                    ]
                  }
                ) }, `tablet-view-all-${index}`);
              }
              return /* @__PURE__ */ jsx(
                PropertyCard,
                {
                  property: item
                },
                `tablet-${item.id}-${index}`
              );
            })
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
      /* @__PURE__ */ jsx("div", { className: "md:hidden overflow-x-auto scrollbar-hide py-4", children: /* @__PURE__ */ jsx("div", { className: "flex gap-5", children: carouselItems.map((item, index) => {
        if (item.isViewAllCard) {
          return /* @__PURE__ */ jsx("div", { className: "flex flex-col w-[300px] min-h-0 idx-ampre-property-card bg-white border-gray-300 border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl group relative flex-none", children: /* @__PURE__ */ jsxs(
            "a",
            {
              href: viewAllLink,
              className: "flex flex-col h-full text-inherit no-underline",
              children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "relative w-full h-[200px] property-image-container overflow-hidden rounded-t-xl flex items-center justify-center",
                    style: { backgroundColor: buttonSecondaryBg },
                    children: /* @__PURE__ */ jsxs("div", { className: "text-center", style: { color: buttonSecondaryText }, children: [
                      /* @__PURE__ */ jsx("svg", { className: "w-16 h-16 mx-auto mb-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }),
                      /* @__PURE__ */ jsx("p", { className: "text-xl font-bold", children: "Explore More" })
                    ] })
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col flex-grow items-start p-4 gap-2.5 box-border", children: [
                  /* @__PURE__ */ jsx("div", { className: "flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-bold text-lg leading-7 tracking-tight text-[#293056]", children: "Discover More Properties" }),
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start gap-2 w-full", children: [
                    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-base leading-6 tracking-tight text-[#293056]", children: "Browse All Available Listings" }),
                    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-full min-h-8 pb-2 border-b border-gray-200", children: /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: "inline-flex items-center justify-center px-6 py-2 rounded-full hover:opacity-90 transition-all font-work-sans font-semibold text-sm",
                        style: { backgroundColor: buttonSecondaryBg, color: buttonSecondaryText },
                        children: "View All Properties →"
                      }
                    ) }),
                    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-sm leading-5 tracking-tight text-gray-600", children: "100+ Active Listings" }),
                    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-start w-full min-h-8", children: /* @__PURE__ */ jsx("div", { className: "font-work-sans font-normal text-base leading-6 tracking-tight text-[#293056]", children: "Updated Daily" }) })
                  ] })
                ] })
              ]
            }
          ) }, `mobile-view-all-${index}`);
        }
        return /* @__PURE__ */ jsx("div", { className: "flex-none", children: /* @__PURE__ */ jsx(
          PropertyCard,
          {
            property: item
          }
        ) }, `mobile-${item.id}-${index}`);
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
  PropertyCarousel as default
};
