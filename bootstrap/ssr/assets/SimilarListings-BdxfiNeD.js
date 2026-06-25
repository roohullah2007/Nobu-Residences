import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { usePage } from "@inertiajs/react";
const SimilarListings = ({ currentProperty = null, similarProperties = null }) => {
  const { globalWebsite, website } = usePage().props;
  const currentWebsite = website || globalWebsite;
  const brandColors = currentWebsite?.brand_colors || {};
  const buttonTertiaryBg = brandColors.button_tertiary_bg || "#000000";
  const buttonTertiaryText = brandColors.button_tertiary_text || "#FFFFFF";
  const [currentIndex, setCurrentIndex] = useState(0);
  const defaultSimilarProperties = [
    {
      id: 1,
      listingKey: "N7058474",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop&auto=format&q=80",
      price: 479999,
      propertyType: "Condo Apartment",
      transactionType: "For Sale",
      bedrooms: 1,
      bathrooms: 1,
      address: "122-370 Highway 7 #, Richmond Hill, ON",
      isRental: false
    },
    {
      id: 2,
      listingKey: "N7058475",
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop&auto=format&q=80",
      price: 2200,
      propertyType: "Condo Apartment",
      transactionType: "For Lease",
      bedrooms: 1,
      bathrooms: 1,
      address: "122-370 Highway 7 #, Richmond Hill, ON",
      isRental: true
    },
    {
      id: 3,
      listingKey: "N7058476",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80",
      price: 529999,
      propertyType: "Condo Apartment",
      transactionType: "For Sale",
      bedrooms: 2,
      bathrooms: 1,
      address: "125-380 Highway 7 #, Richmond Hill, ON",
      isRental: false
    },
    {
      id: 4,
      listingKey: "N7058477",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop&auto=format&q=80",
      price: 3500,
      propertyType: "Condo Apartment",
      transactionType: "For Rent",
      bedrooms: 2,
      bathrooms: 2,
      address: "130-390 Highway 7 #, Richmond Hill, ON",
      isRental: true
    },
    {
      id: 5,
      listingKey: "N7058478",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop&auto=format&q=80",
      price: 789999,
      propertyType: "Condo Apartment",
      transactionType: "For Sale",
      bedrooms: 3,
      bathrooms: 2,
      address: "135-400 Highway 7 #, Richmond Hill, ON",
      isRental: false
    },
    {
      id: 6,
      listingKey: "N7058479",
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop&auto=format&q=80",
      price: 4200,
      propertyType: "Condo Apartment",
      transactionType: "For Lease",
      bedrooms: 3,
      bathrooms: 2,
      address: "140-410 Highway 7 #, Richmond Hill, ON",
      isRental: true
    }
  ];
  const propertiesData = similarProperties || defaultSimilarProperties;
  const cardsToShow = { desktop: 3, tablet: 2, mobile: 1 };
  const getMaxIndex = (screenType) => {
    const cardsVisible = cardsToShow[screenType];
    return Math.max(0, propertiesData.length - cardsVisible);
  };
  const maxIndexDesktop = getMaxIndex("desktop");
  const maxIndexTablet = getMaxIndex("tablet");
  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };
  const handleNext = () => {
    const maxIndex = maxIndexDesktop;
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };
  const handleNextTablet = () => {
    setCurrentIndex((prev) => Math.min(maxIndexTablet, prev + 1));
  };
  const formatPrice = (price, isRental = false) => {
    if (!price || price <= 0) return "Price on request";
    let formattedPrice = "$" + price.toLocaleString();
    if (isRental) {
      formattedPrice += "/mo";
    }
    return formattedPrice;
  };
  const buildFeatures = (bedrooms, bathrooms) => {
    const features = [];
    if (bedrooms > 0) {
      features.push(bedrooms + " Bed" + (bedrooms > 1 ? "s" : ""));
    }
    if (bathrooms > 0) {
      features.push(bathrooms + " Bath" + (bathrooms > 1 ? "s" : ""));
    }
    return features.join(" | ");
  };
  const ChevronLeftIcon = ({ className }) => /* @__PURE__ */ jsx("svg", { className, width: "24", height: "24", fill: "white", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { d: "M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" }) });
  const ChevronRightIcon = ({ className }) => /* @__PURE__ */ jsx("svg", { className, width: "24", height: "24", fill: "white", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { d: "M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" }) });
  const PropertyCard = ({ property }) => {
    const formattedPrice = formatPrice(property.price, property.isRental);
    const features = buildFeatures(property.bedrooms, property.bathrooms);
    const detailsUrl = `/property/${property.listingKey}`;
    const getImageUrl = () => {
      const imageUrl = property.image || property.imageUrl || property.MediaURL || property.mainImage || property.main_image || (property.images && property.images.length > 0 ? property.images[0] : null) || (property.Images && property.Images.length > 0 ? typeof property.Images[0] === "string" ? property.Images[0] : property.Images[0]?.MediaURL : null);
      if (imageUrl) {
        if (!imageUrl.startsWith("http") && !imageUrl.startsWith("//")) {
          return window.location.origin + (imageUrl.startsWith("/") ? "" : "/") + imageUrl;
        }
        return imageUrl;
      }
      return "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80";
    };
    return /* @__PURE__ */ jsx("div", { className: "flex-none w-[360px] h-[470px] bg-white shadow-lg rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl group", children: /* @__PURE__ */ jsxs("a", { href: detailsUrl, className: "block h-full text-inherit no-underline", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative w-full h-[275px] overflow-hidden bg-gray-100 rounded-t-xl", children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: getImageUrl(),
            alt: `${property.propertyType} in ${property.address}`,
            className: "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105",
            loading: "lazy",
            onError: (e) => {
              if (!e.target.src.includes("unsplash")) {
                e.target.src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80";
              }
            }
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "absolute top-2 left-2 right-2 flex justify-between items-center gap-2.5 h-8", children: [
          /* @__PURE__ */ jsx("span", { className: `flex items-center justify-center px-4 py-1.5 h-8 rounded-full text-sm font-bold tracking-tight whitespace-nowrap shadow-sm ${property.isRental ? "bg-green-100 text-green-800 border border-green-300" : "bg-white text-[#293056] border border-gray-200"}`, children: property.isRental ? "Rent" : "Sale" }),
          /* @__PURE__ */ jsx("span", { className: `flex items-center justify-center px-4 py-1.5 h-8 rounded-full text-sm font-bold tracking-tight whitespace-nowrap shadow-sm ml-auto ${property.isRental ? "bg-green-100 text-green-800 border border-green-300" : "bg-white text-[#293056] border border-gray-200"}`, children: formattedPrice })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start p-4 gap-2.5 h-[195px] box-border", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-bold text-lg leading-7 tracking-tight text-[#293056]", children: property.propertyType }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start gap-2 w-full flex-1", children: [
          /* @__PURE__ */ jsx("div", { className: "flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-base leading-6 tracking-tight text-[#293056]", children: property.address }),
          features && /* @__PURE__ */ jsx("div", { className: "flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-base leading-6 tracking-tight text-[#293056]", children: features }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-start w-full min-h-8 font-work-sans font-normal text-base leading-6 tracking-tight text-[#293056]", children: [
            "MLS#: ",
            property.listingKey
          ] })
        ] })
      ] })
    ] }) });
  };
  return /* @__PURE__ */ jsxs("div", { className: "font-work-sans my-8 w-full max-w-[1280px] mx-auto clear-both overflow-visible", children: [
    /* @__PURE__ */ jsx("div", { className: "mb-8 flex w-full", children: /* @__PURE__ */ jsx("h2", { className: "font-space-grotesk text-3xl font-bold text-gray-900 m-0 leading-9", children: "Similar Listings" }) }),
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
            children: propertiesData.map((property) => /* @__PURE__ */ jsx(PropertyCard, { property }, property.id))
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
            children: propertiesData.map((property) => /* @__PURE__ */ jsx(PropertyCard, { property }, property.id))
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
      /* @__PURE__ */ jsx("div", { className: "md:hidden overflow-x-auto scrollbar-hide py-4", children: /* @__PURE__ */ jsx("div", { className: "flex gap-5", children: propertiesData.map((property) => /* @__PURE__ */ jsx("div", { className: "flex-none w-80 h-[420px]", children: /* @__PURE__ */ jsx("div", { className: "w-80 h-[420px] bg-white shadow-lg rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl group", children: /* @__PURE__ */ jsxs("a", { href: `/property/${property.listingKey}`, className: "block h-full text-inherit no-underline", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative w-full h-60 overflow-hidden bg-gray-100 rounded-t-xl", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: property.image,
              alt: `${property.propertyType} in ${property.address}`,
              className: "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105",
              loading: "lazy",
              onError: (e) => {
                e.target.src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80";
              }
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "absolute top-2 left-2 right-2 flex justify-between items-center gap-2 h-8", children: [
            /* @__PURE__ */ jsx("span", { className: `flex items-center justify-center px-2 py-1 h-8 rounded-full text-xs font-bold tracking-tight whitespace-nowrap shadow-sm ${property.isRental ? "bg-green-100 text-green-800 border border-green-300" : "bg-white text-[#293056] border border-gray-200"}`, children: property.isRental ? "Rent" : "Sale" }),
            /* @__PURE__ */ jsx("span", { className: `flex items-center justify-center px-2 py-1 h-8 rounded-full text-xs font-bold tracking-tight whitespace-nowrap shadow-sm ml-auto ${property.isRental ? "bg-green-100 text-green-800 border border-green-300" : "bg-white text-[#293056] border border-gray-200"}`, children: formatPrice(property.price, property.isRental) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start p-3 gap-2 h-40 box-border", children: [
          /* @__PURE__ */ jsx("div", { className: "flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-bold text-lg leading-7 tracking-tight text-[#293056]", children: property.propertyType }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start gap-2 w-full flex-1", children: [
            /* @__PURE__ */ jsx("div", { className: "flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-sm leading-5 tracking-tight text-[#293056]", children: property.address }),
            buildFeatures(property.bedrooms, property.bathrooms) && /* @__PURE__ */ jsx("div", { className: "flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-sm leading-5 tracking-tight text-[#293056]", children: buildFeatures(property.bedrooms, property.bathrooms) }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-start w-full min-h-8 font-work-sans font-normal text-sm leading-5 tracking-tight text-[#293056]", children: [
              "MLS#: ",
              property.listingKey
            ] })
          ] })
        ] })
      ] }) }) }, property.id)) }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-center mt-8", children: /* @__PURE__ */ jsx(
      "a",
      {
        href: "/properties",
        className: "flex items-center justify-center px-8 py-2.5 gap-2 h-11 rounded-full font-work-sans font-bold text-base leading-6 tracking-tight no-underline transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg hover:no-underline whitespace-nowrap",
        style: { backgroundColor: buttonTertiaryBg, color: buttonTertiaryText },
        children: "View all"
      }
    ) })
  ] });
};
export {
  SimilarListings as default
};
