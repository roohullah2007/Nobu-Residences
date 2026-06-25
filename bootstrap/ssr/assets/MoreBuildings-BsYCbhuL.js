import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
const MoreBuildings = ({ agentName = "", buildings = null, website = null }) => {
  const displayAgentName = agentName || website?.agent_info?.agent_name || website?.contact_info?.agent?.name || "";
  const [currentIndex, setCurrentIndex] = useState(0);
  const defaultBuildings = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=300&h=200&fit=crop&crop=center",
      status: "For Sale",
      mlsNumber: "#N7058474",
      price: "$480K",
      agentName: "Logan Mews",
      bedrooms: "1BD",
      bathrooms: "1BA",
      parking: "1 Parking",
      sqft: "603 sqft",
      address: "122-370 Highway 7 #, Richmond Hill, ON",
      link: "#"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&h=200&fit=crop&crop=center",
      status: "For Sale",
      mlsNumber: "#N7058475",
      price: "$520K",
      agentName: "Logan Mews",
      bedrooms: "2BD",
      bathrooms: "1BA",
      parking: "1 Parking",
      sqft: "750 sqft",
      address: "125-380 Highway 7 #, Richmond Hill, ON",
      link: "#"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300&h=200&fit=crop&crop=center",
      status: "For Sale",
      mlsNumber: "#N7058476",
      price: "$650K",
      agentName: "Logan Mews",
      bedrooms: "2BD",
      bathrooms: "2BA",
      parking: "1 Parking",
      sqft: "850 sqft",
      address: "130-390 Highway 7 #, Richmond Hill, ON",
      link: "#"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=200&fit=crop&crop=center",
      status: "For Sale",
      mlsNumber: "#N7058477",
      price: "$780K",
      agentName: "Logan Mews",
      bedrooms: "3BD",
      bathrooms: "2BA",
      parking: "2 Parking",
      sqft: "950 sqft",
      address: "135-400 Highway 7 #, Richmond Hill, ON",
      link: "#"
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=300&h=200&fit=crop&crop=center",
      status: "For Sale",
      mlsNumber: "#N7058478",
      price: "$820K",
      agentName: "Logan Mews",
      bedrooms: "3BD",
      bathrooms: "2BA",
      parking: "2 Parking",
      sqft: "1100 sqft",
      address: "140-410 Highway 7 #, Richmond Hill, ON",
      link: "#"
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=300&h=200&fit=crop&crop=center",
      status: "For Sale",
      mlsNumber: "#N7058479",
      price: "$890K",
      agentName: "Logan Mews",
      bedrooms: "3BD",
      bathrooms: "3BA",
      parking: "2 Parking",
      sqft: "1200 sqft",
      address: "145-420 Highway 7 #, Richmond Hill, ON",
      link: "#"
    }
  ];
  const buildingsData = buildings || defaultBuildings;
  const cardsToShow = 4;
  const maxIndex = Math.max(0, buildingsData.length - cardsToShow);
  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };
  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };
  const ChevronLeftIcon = ({ className }) => /* @__PURE__ */ jsx("svg", { className, width: "20", height: "20", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z", clipRule: "evenodd" }) });
  const ChevronRightIcon = ({ className }) => /* @__PURE__ */ jsx("svg", { className, width: "20", height: "20", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z", clipRule: "evenodd" }) });
  const BuildingCard = ({ building }) => /* @__PURE__ */ jsxs("div", { className: "flex-none w-[249px] bg-white h-80 rounded-xl shadow-lg overflow-hidden transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-xl group", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative h-[169px] overflow-hidden", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: building.image,
          alt: building.address,
          className: "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105",
          onError: (e) => {
            e.target.src = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=300&h=200&fit=crop&crop=center";
          }
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "absolute top-3 left-3 bg-white text-[#293056] text-xs font-semibold px-3 py-1.5 rounded-full shadow-md", children: building.status }),
      /* @__PURE__ */ jsx("span", { className: "absolute top-3 right-3 bg-black bg-opacity-70 text-white text-xs font-medium px-2 py-1 rounded backdrop-blur-sm", children: building.mlsNumber })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-2.5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-3", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xl font-bold text-[#293056]", children: building.price }),
        /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded", children: building.agentName })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3 mb-3 flex-wrap justify-between", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-200", children: building.bedrooms }),
        /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-200", children: building.bathrooms }),
        /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-200", children: building.parking }),
        /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-200", children: building.sqft })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsx(
        "a",
        {
          href: building.link,
          className: "text-sm font-medium text-gray-700 hover:text-blue-700 hover:underline leading-snug block",
          children: building.address
        }
      ) })
    ] })
  ] });
  return /* @__PURE__ */ jsxs("div", { className: "bg-gray-100 rounded-xl py-8 px-6 my-10 font-work-sans max-w-[1280px] mx-auto", children: [
    /* @__PURE__ */ jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsx("h2", { className: "font-red-hat text-2xl font-bold text-[#293056] tracking-tight", children: displayAgentName ? `More Buildings by ${displayAgentName}` : "More Buildings" }) }),
    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx("div", { className: "hidden lg:block", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handlePrevious,
            disabled: currentIndex === 0,
            className: "flex items-center justify-center w-12 h-12 bg-orange-700 hover:bg-orange-800 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full text-white mr-6 transition-colors duration-200 z-10",
            "aria-label": "Previous buildings",
            children: /* @__PURE__ */ jsx(ChevronLeftIcon, { className: "w-5 h-5" })
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "overflow-hidden", style: { width: "calc(4 * 249px + 3 * 16px)" }, children: /* @__PURE__ */ jsx(
          "div",
          {
            className: "flex gap-4 transition-transform duration-300 ease-in-out",
            style: { transform: `translateX(-${currentIndex * (249 + 16)}px)` },
            children: buildingsData.map((building) => /* @__PURE__ */ jsx(BuildingCard, { building }, building.id))
          }
        ) }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleNext,
            disabled: currentIndex >= maxIndex,
            className: "flex items-center justify-center w-12 h-12 bg-orange-700 hover:bg-orange-800 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full text-white ml-6 transition-colors duration-200 z-10",
            "aria-label": "Next buildings",
            children: /* @__PURE__ */ jsx(ChevronRightIcon, { className: "w-5 h-5" })
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "lg:hidden overflow-x-auto scrollbar-hide", children: /* @__PURE__ */ jsx("div", { className: "flex gap-4", children: buildingsData.map((building) => /* @__PURE__ */ jsx(BuildingCard, { building }, building.id)) }) })
    ] })
  ] });
};
export {
  MoreBuildings as default
};
