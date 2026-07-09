import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useRef } from "react";
import { usePage, Head } from "@inertiajs/react";
import Navbar from "./Navbar-BcUYeBAy.js";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import "./PhoneInput-BOSF9o14.js";
import "./LoginModal-CkvRiYR7.js";
import "./GoogleLoginButton-wrwag0eM.js";
import "./PropertyDetailIcons-3huqvWqW.js";
import "@headlessui/react";
const ChevronLeft = ({ className }) => /* @__PURE__ */ jsx(
  "svg",
  {
    className,
    fill: "currentColor",
    viewBox: "0 0 24 24",
    children: /* @__PURE__ */ jsx("path", { d: "M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" })
  }
);
const ChevronRight = ({ className }) => /* @__PURE__ */ jsx(
  "svg",
  {
    className,
    fill: "currentColor",
    viewBox: "0 0 24 24",
    children: /* @__PURE__ */ jsx("path", { d: "M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" })
  }
);
const Lock = ({ className }) => /* @__PURE__ */ jsx(
  "svg",
  {
    className,
    fill: "currentColor",
    viewBox: "0 0 24 24",
    children: /* @__PURE__ */ jsx("path", { d: "M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" })
  }
);
function PropertyCarousel({ auth }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentRentalSlide, setCurrentRentalSlide] = useState(0);
  const carouselRef = useRef(null);
  const rentalCarouselRef = useRef(null);
  const { globalWebsite, website } = usePage().props;
  const currentWebsite = website || globalWebsite || {};
  const brandColors = currentWebsite?.brand_colors || {};
  const buttonTertiaryBg = brandColors.button_tertiary_bg || "#000000";
  const buttonTertiaryText = brandColors.button_tertiary_text || "#FFFFFF";
  const saleProperties = [
    {
      id: 1,
      type: "Condo Apartment",
      price: "$1.2M",
      address: "55 Mercer Street #102, Toronto C01, ON M5V 0W4",
      features: "3 Beds | 2 Bath",
      mls: "MLS#: C12291820",
      image: "/assets/nobu-building.jpg",
      isLocked: true
    },
    {
      id: 2,
      type: "Condo Apartment",
      price: "$660K",
      address: "55 Mercer Street 322, Toronto C01, ON M5V 0W4",
      features: "2 Beds | 2 Bath",
      mls: "MLS#: C12128489",
      image: "/assets/nobu-building.jpg",
      isLocked: false
    },
    {
      id: 3,
      type: "Condo Apartment",
      price: "$1.3M",
      address: "55 Mercer Street S 1602, Toronto C01, ON M5V 1H2",
      features: "3 Beds | 2 Bath",
      mls: "MLS#: C12072752",
      image: "/assets/nobu-building.jpg",
      isLocked: false
    },
    {
      id: 4,
      type: "Exclusive",
      price: "$2.1M",
      address: "55 Mercer Street #205, Toronto C01, ON M5V 0W4",
      features: "X BEDROOM",
      mls: "MLS#: C12345678",
      image: "/assets/nobu-building.jpg",
      isLocked: false
    },
    {
      id: 5,
      type: "Condo Apartment",
      price: "$950K",
      address: "55 Mercer Street #302, Toronto C01, ON M5V 0W4",
      features: "2 Beds | 1 Bath",
      mls: "MLS#: C12987654",
      image: "/assets/nobu-building.jpg",
      isLocked: false
    }
  ];
  const rentalProperties = [
    {
      id: 1,
      type: "Condo Apartment",
      price: "$4K/mo",
      address: "15 Mercer Street 4303, Toronto C01, ON M5V 1H2",
      features: "3 Beds | 2 Bath",
      mls: "MLS#: C12045923",
      image: "/assets/nobu-building.jpg",
      isLocked: false
    },
    {
      id: 2,
      type: "Condo Apartment",
      price: "$3K/mo",
      address: "15 Mercer Street 2305, Toronto C01, ON M5V 0T8",
      features: "2 Beds | 2 Bath",
      mls: "MLS#: C12265883",
      image: "/assets/nobu-building.jpg",
      isLocked: false
    },
    {
      id: 3,
      type: "Condo Apartment",
      price: "$3K/mo",
      address: "15 Mercer Street 418, Toronto C01, ON M5V 0T8",
      features: "2 Beds | 2 Bath",
      mls: "MLS#: C12260340",
      image: "/assets/nobu-building.jpg",
      isLocked: false
    },
    {
      id: 4,
      type: "Condo Apartment",
      price: "$5K/mo",
      address: "15 Mercer Street 1205, Toronto C01, ON M5V 0T8",
      features: "3 Beds | 2 Bath",
      mls: "MLS#: C12789123",
      image: "/assets/nobu-building.jpg",
      isLocked: false
    }
  ];
  const scrollCarousel = (direction, isRental = false) => {
    const carousel = isRental ? rentalCarouselRef.current : carouselRef.current;
    const cardWidth = 300 + 19;
    const scrollAmount = cardWidth * (direction === "next" ? 1 : -1);
    carousel.scrollBy({
      left: scrollAmount,
      behavior: "smooth"
    });
  };
  const PropertyCard = ({ property, isRental = false }) => /* @__PURE__ */ jsxs("div", { className: "w-[300px] h-[420px] bg-white shadow-[0px_4px_4px_rgba(0,0,0,0.12)] rounded-xl flex-none flex flex-col overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0px_8px_16px_rgba(0,0,0,0.15)] min-w-[300px] max-w-[300px] relative", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative w-[300px] h-[228px] overflow-hidden rounded-xl flex-shrink-0", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: property.image,
          alt: property.type,
          className: `w-full h-full object-cover rounded-xl transition-transform duration-300 hover:scale-105 ${property.isLocked ? "blur-sm" : ""}`,
          onError: (e) => {
            e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIyOCIgdmlld0JveD0iMCAwIDMwMCAyMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjUgMTAwSDE3NVYxMjBIMTI1VjEwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEyNSA4MEgxNzVWOTBIMTI1VjgwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K";
          }
        }
      ),
      property.isLocked && /* @__PURE__ */ jsxs("div", { className: "absolute top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-center bg-black bg-opacity-30 rounded-xl z-10", children: [
        /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx(Lock, { className: "w-12 h-12 text-white opacity-90" }) }),
        /* @__PURE__ */ jsxs("div", { className: "text-center text-white", children: [
          /* @__PURE__ */ jsx("button", { className: "text-xs font-medium bg-white text-red-600 px-4 py-2 rounded-lg mb-2 font-work-sans", children: "Login to view" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs flex items-center justify-center font-work-sans", children: "Access full listing details" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "absolute top-2 left-2 right-2 flex justify-between items-center z-20", children: [
        /* @__PURE__ */ jsx("span", { className: `flex justify-center items-center px-4 py-1.5 h-8 rounded-full font-work-sans font-bold text-sm text-center tracking-tight ${isRental ? "bg-green-50 text-green-800 border border-green-200" : "bg-white text-gray-800"}`, children: isRental ? "Rent" : "Sale" }),
        /* @__PURE__ */ jsx("span", { className: "flex justify-center items-center px-4 py-1.5 h-8 bg-white rounded-full font-work-sans font-bold text-sm text-center tracking-tight text-gray-800 min-w-[80px]", children: property.price })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start p-[14px] gap-1.5 w-full h-[192px] flex-1 justify-between", children: [
      /* @__PURE__ */ jsx("div", { className: "flex justify-start items-center w-full h-auto pb-1.5 border-b border-gray-200 font-work-sans font-normal text-base leading-6 tracking-tight text-gray-800 text-left", children: property.type }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-start items-center w-full h-auto pb-1.5 border-b border-gray-200 font-work-sans font-normal text-sm leading-5 tracking-tight text-gray-800 text-left", children: property.address }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-start items-center w-full h-auto pb-1.5 border-b border-gray-200 font-work-sans font-normal text-sm leading-5 tracking-tight text-gray-800 text-left", children: property.features }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-start items-center w-full h-auto font-work-sans font-normal text-sm leading-5 tracking-tight text-gray-800 text-left", children: property.mls })
    ] })
  ] });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Property Carousel - Nobu Residences" }),
    /* @__PURE__ */ jsxs("div", { className: "relative bg-cover bg-center bg-no-repeat font-work-sans h-[400px]", style: {
      backgroundImage: "url('/assets/hero-section.jpg')"
    }, children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" }),
      /* @__PURE__ */ jsx(Navbar, { auth }),
      /* @__PURE__ */ jsx("main", { className: "relative z-10 flex items-center h-[calc(400px-64px)]", children: /* @__PURE__ */ jsx("div", { className: "mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-screen-xl", children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl", children: [
        /* @__PURE__ */ jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsx("p", { className: "text-white font-work-sans font-normal text-sm leading-6 -tracking-wider", children: "/ PROPERTY SHOWCASE" }) }),
        /* @__PURE__ */ jsxs("h1", { className: "text-white mb-6 font-space-grotesk font-bold text-[48px] leading-[56px] -tracking-wider", children: [
          "Nobu Residences",
          /* @__PURE__ */ jsx("br", {}),
          "Property Carousel"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-white mb-8 max-w-2xl font-work-sans font-normal text-lg leading-[27px] -tracking-wider", children: "Explore our premium property collection with interactive carousels matching the original design" })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-white font-work-sans", children: [
      /* @__PURE__ */ jsx("section", { className: "py-16 bg-white", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [
        /* @__PURE__ */ jsx("div", { className: "mb-8", children: /* @__PURE__ */ jsx("h2", { className: "text-3xl font-semibold text-gray-900 font-work-sans", children: "Nobu Residences For Sale" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-[19px] w-full max-w-[1400px] mx-auto", children: [
          /* @__PURE__ */ jsx("div", { className: "flex flex-col justify-center items-center p-1 gap-2.5 w-16 h-16 flex-none", children: /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => scrollCarousel("prev"),
              className: "flex justify-center items-center w-14 h-14 bg-[#93370D] rounded-full border-none cursor-pointer transition-all duration-200 hover:bg-[#7d2f0b] hover:scale-105 active:scale-95",
              "aria-label": "Previous properties",
              children: /* @__PURE__ */ jsx("div", { className: "flex justify-center items-center p-2 gap-2.5 w-10 h-10", children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-6 h-6 text-white" }) })
            }
          ) }),
          /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-hidden w-[1257px] max-w-[1257px]", children: /* @__PURE__ */ jsx(
            "div",
            {
              ref: carouselRef,
              className: "flex gap-[19px] overflow-x-auto scroll-smooth py-4 scrollbar-hide",
              style: { scrollbarWidth: "none", msOverflowStyle: "none" },
              children: saleProperties.map((property) => /* @__PURE__ */ jsx(PropertyCard, { property }, property.id))
            }
          ) }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-col justify-center items-center p-1 gap-2.5 w-16 h-16 flex-none", children: /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => scrollCarousel("next"),
              className: "flex justify-center items-center w-14 h-14 bg-[#93370D] rounded-full border-none cursor-pointer transition-all duration-200 hover:bg-[#7d2f0b] hover:scale-105 active:scale-95",
              "aria-label": "Next properties",
              children: /* @__PURE__ */ jsx("div", { className: "flex justify-center items-center p-2 gap-2.5 w-10 h-10", children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-6 h-6 text-white" }) })
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex justify-center mt-8", children: /* @__PURE__ */ jsx(
          "button",
          {
            className: "flex flex-col justify-center items-center p-0 gap-2 w-[132px] h-16 rounded-full transition-all duration-200 hover:opacity-90 hover:-translate-y-1 hover:shadow-lg",
            style: { backgroundColor: buttonTertiaryBg, color: buttonTertiaryText },
            children: /* @__PURE__ */ jsx("div", { className: "flex justify-center items-center py-2.5 px-8 gap-2 w-[132px] h-16", children: /* @__PURE__ */ jsx("span", { className: "w-[68px] h-7 font-work-sans font-bold text-lg leading-7 flex items-center text-center tracking-tight", children: "View all" }) })
          }
        ) })
      ] }) }),
      /* @__PURE__ */ jsx("section", { className: "py-16 bg-gray-50", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [
        /* @__PURE__ */ jsx("div", { className: "mb-8", children: /* @__PURE__ */ jsx("h2", { className: "text-3xl font-semibold text-gray-900 font-work-sans", children: "Available for Lease" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-[19px] w-full max-w-[1400px] mx-auto", children: [
          /* @__PURE__ */ jsx("div", { className: "flex flex-col justify-center items-center p-1 gap-2.5 w-16 h-16 flex-none", children: /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => scrollCarousel("prev", true),
              className: "flex justify-center items-center w-14 h-14 bg-[#93370D] rounded-full border-none cursor-pointer transition-all duration-200 hover:bg-[#7d2f0b] hover:scale-105 active:scale-95",
              "aria-label": "Previous rental properties",
              children: /* @__PURE__ */ jsx("div", { className: "flex justify-center items-center p-2 gap-2.5 w-10 h-10", children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-6 h-6 text-white" }) })
            }
          ) }),
          /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-hidden w-[1257px] max-w-[1257px]", children: /* @__PURE__ */ jsx(
            "div",
            {
              ref: rentalCarouselRef,
              className: "flex gap-[19px] overflow-x-auto scroll-smooth py-4 scrollbar-hide",
              style: { scrollbarWidth: "none", msOverflowStyle: "none" },
              children: rentalProperties.map((property) => /* @__PURE__ */ jsx(PropertyCard, { property, isRental: true }, property.id))
            }
          ) }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-col justify-center items-center p-1 gap-2.5 w-16 h-16 flex-none", children: /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => scrollCarousel("next", true),
              className: "flex justify-center items-center w-14 h-14 bg-[#93370D] rounded-full border-none cursor-pointer transition-all duration-200 hover:bg-[#7d2f0b] hover:scale-105 active:scale-95",
              "aria-label": "Next rental properties",
              children: /* @__PURE__ */ jsx("div", { className: "flex justify-center items-center p-2 gap-2.5 w-10 h-10", children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-6 h-6 text-white" }) })
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex justify-center mt-8", children: /* @__PURE__ */ jsx(
          "button",
          {
            className: "flex flex-col justify-center items-center p-0 gap-2 w-[132px] h-16 rounded-full transition-all duration-200 hover:opacity-90 hover:-translate-y-1 hover:shadow-lg",
            style: { backgroundColor: buttonTertiaryBg, color: buttonTertiaryText },
            children: /* @__PURE__ */ jsx("div", { className: "flex justify-center items-center py-2.5 px-8 gap-2 w-[132px] h-16", children: /* @__PURE__ */ jsx("span", { className: "w-[68px] h-7 font-work-sans font-bold text-lg leading-7 flex items-center text-center tracking-tight", children: "View all" }) })
          }
        ) })
      ] }) }),
      /* @__PURE__ */ jsx("section", { className: "py-16 bg-white", children: /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-gray-900 mb-4 font-space-grotesk", children: "Carousel Features" }),
        /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-3 gap-8 mt-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "w-16 h-16 bg-[#93370D] rounded-full flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-8 h-8 text-white" }) }),
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold mb-2 font-work-sans", children: "Smooth Navigation" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-600 font-work-sans", children: "Navigate through properties with smooth scroll animations and intuitive controls" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "w-16 h-16 bg-[#93370D] rounded-full flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(Lock, { className: "w-8 h-8 text-white" }) }),
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold mb-2 font-work-sans", children: "Protected Content" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-600 font-work-sans", children: "Some properties require login to view full details and images" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "w-16 h-16 bg-[#93370D] rounded-full flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-8 h-8 text-white" }) }),
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold mb-2 font-work-sans", children: "Responsive Design" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-600 font-work-sans", children: "Optimized for all devices with consistent 4-card desktop layout" })
          ] })
        ] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsx("style", { dangerouslySetInnerHTML: { __html: `
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Responsive adjustments */
        @media (max-width: 640px) {
          .property-card-mobile {
            width: 320px !important;
            min-width: 320px !important;
            max-width: 320px !important;
          }
          .property-card-mobile .image-container {
            width: 320px !important;
            height: 240px !important;
          }
        }
        
        @media (min-width: 641px) and (max-width: 1023px) {
          .property-card-tablet {
            width: 350px !important;
            min-width: 350px !important;
            max-width: 350px !important;
          }
          .property-card-tablet .image-container {
            width: 350px !important;
            height: 270px !important;
          }
        }
        
        @media (min-width: 1024px) {
          .property-card-desktop {
            width: 300px !important;
            min-width: 300px !important;
            max-width: 300px !important;
          }
          .property-card-desktop .image-container {
            width: 300px !important;
            height: 228px !important;
          }
        }
      ` } })
  ] });
}
export {
  PropertyCarousel as default
};
