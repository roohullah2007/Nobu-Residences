import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
const PriceHistory = ({ propertyData = null }) => {
  const [activeTab, setActiveTab] = useState("Sold");
  const [showAll, setShowAll] = useState(false);
  const getPropertyImage = () => {
    if (propertyData?.Images && Array.isArray(propertyData.Images) && propertyData.Images.length > 0) {
      const firstImage = propertyData.Images[0];
      if (firstImage?.MediaURL) {
        return firstImage.MediaURL;
      }
    }
    return "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";
  };
  const propertyImage = getPropertyImage();
  const defaultPriceHistory = [
    {
      date: "24/04/2025",
      price: "$1,139,000",
      event: "Listed for Sale",
      daysOnMarket: "5",
      image: propertyImage
    },
    {
      date: "20/04/2025",
      price: "$1,120,000",
      event: "Price Reduced",
      daysOnMarket: "10",
      image: propertyImage
    },
    {
      date: "15/04/2025",
      price: "$1,095,000",
      event: "Listed for Sale",
      daysOnMarket: "15",
      image: propertyImage
    },
    {
      date: "10/04/2025",
      price: "$1,075,000",
      event: "Price Reduced",
      daysOnMarket: "25",
      image: propertyImage
    },
    {
      date: "05/04/2025",
      price: "$1,050,000",
      event: "Listed for Sale",
      daysOnMarket: "35",
      image: propertyImage
    }
  ];
  const getPriceHistoryData = () => {
    if (propertyData?.priceHistory && Array.isArray(propertyData.priceHistory)) {
      return propertyData.priceHistory;
    }
    return defaultPriceHistory;
  };
  const priceHistoryData = getPriceHistoryData();
  const displayedRows = showAll ? priceHistoryData : priceHistoryData.slice(0, 2);
  const remainingCount = priceHistoryData.length - 2;
  const tabs = ["All", "Sold", "Rented"];
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };
  const handleToggleShow = () => {
    setShowAll(!showAll);
  };
  const ChevronDownIcon = ({ className }) => /* @__PURE__ */ jsx("svg", { className, width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", children: /* @__PURE__ */ jsx("path", { d: "M4 6L8 10L12 6", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) });
  return /* @__PURE__ */ jsx("div", { className: "w-full max-w-[1280px] mx-auto px-5 py-0", children: /* @__PURE__ */ jsx("div", { className: "flex flex-row justify-between items-start p-6 lg:p-12 gap-4 lg:gap-12 w-full min-h-[507px] bg-gray-100 rounded-xl mb-20 transition-all duration-[400ms] overflow-visible", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center p-0 gap-8 w-full max-w-[1184px] mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-16 w-full min-h-[50px] bg-gray-50 rounded-xl p-5", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-space-grotesk font-bold text-2xl lg:text-4xl leading-tight lg:leading-[50px] tracking-tight text-[#293056] text-center lg:text-left", children: "PRICE HISTORY" }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-row items-center p-0 gap-4 w-full lg:w-[285px] h-[26px]", children: /* @__PURE__ */ jsx("div", { className: "flex flex-row items-center p-0 w-full lg:w-[285px] h-[26px] bg-gray-200 rounded-lg lg:rounded-2xl", children: tabs.map((tab, index) => /* @__PURE__ */ jsx(
        "div",
        {
          className: `flex flex-row justify-center items-center p-0 h-[26px] cursor-pointer transition-all duration-300 ${index === 0 ? "flex-1 lg:w-[84px] rounded-l-lg lg:rounded-l-2xl" : index === 1 ? "flex-1 lg:w-[117px] rounded-lg lg:rounded-2xl" : "flex-1 lg:w-[84px] rounded-r-lg lg:rounded-r-2xl"} ${activeTab === tab ? "bg-black text-white" : "bg-gray-200 text-[#293056] hover:opacity-80"}`,
          onClick: () => handleTabClick(tab),
          children: /* @__PURE__ */ jsx("span", { className: "font-work-sans font-medium text-sm lg:text-base leading-5 whitespace-nowrap", children: tab })
        },
        tab
      )) }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start p-0 gap-2 w-full", children: [
      /* @__PURE__ */ jsxs("div", { className: "hidden lg:grid lg:grid-cols-5 items-center px-4 py-1 gap-5 w-full h-[35px] bg-gray-50 rounded-xl", children: [
        /* @__PURE__ */ jsx("span", { className: "font-work-sans font-bold text-sm leading-6 tracking-tight text-gray-900", children: "Buildings" }),
        /* @__PURE__ */ jsx("span", { className: "font-work-sans font-bold text-sm leading-6 tracking-tight text-gray-900 text-center", children: "Date" }),
        /* @__PURE__ */ jsx("span", { className: "font-work-sans font-bold text-sm leading-6 tracking-tight text-gray-900 text-center", children: "Price" }),
        /* @__PURE__ */ jsx("span", { className: "font-work-sans font-bold text-sm leading-6 tracking-tight text-gray-900 text-center", children: "Event" }),
        /* @__PURE__ */ jsx("span", { className: "font-work-sans font-bold text-sm leading-6 tracking-tight text-gray-900 text-center", children: "Days On Market" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex lg:hidden flex-row justify-between items-center px-4 py-1 gap-2 w-full h-[35px] bg-gray-50 rounded-xl", children: [
        /* @__PURE__ */ jsx("span", { className: "font-work-sans font-bold text-sm leading-6 tracking-tight text-gray-900", children: "Buildings" }),
        /* @__PURE__ */ jsx("span", { className: "font-work-sans font-bold text-sm leading-6 tracking-tight text-gray-900", children: "Date" }),
        /* @__PURE__ */ jsx("span", { className: "font-work-sans font-bold text-sm leading-6 tracking-tight text-gray-900", children: "Price" }),
        /* @__PURE__ */ jsx("span", { className: "font-work-sans font-bold text-sm leading-6 tracking-tight text-gray-900", children: "Event" }),
        /* @__PURE__ */ jsx("span", { className: "font-work-sans font-bold text-sm leading-6 tracking-tight text-gray-900", children: "Days" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-col items-start p-0 gap-0 w-full bg-white rounded-xl overflow-hidden", children: displayedRows.map((history, index) => /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
        /* @__PURE__ */ jsxs("div", { className: `hidden lg:grid lg:grid-cols-5 items-center p-2 gap-5 w-full ${index !== displayedRows.length - 1 ? "border-b border-gray-200" : ""}`, children: [
          /* @__PURE__ */ jsx("div", { className: "h-[140px] relative overflow-hidden rounded-lg bg-gray-100 border border-gray-200", children: /* @__PURE__ */ jsx(
            "img",
            {
              src: history.image,
              alt: "Building Image",
              className: "w-full h-full object-cover rounded-md",
              loading: "lazy",
              onError: (e) => {
                e.target.src = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";
              }
            }
          ) }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "font-work-sans font-normal text-sm leading-6 text-center tracking-tight text-gray-500 whitespace-nowrap", children: history.date }) }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "font-work-sans font-normal text-sm leading-6 text-center tracking-tight text-gray-500 whitespace-nowrap", children: history.price }) }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "font-work-sans font-normal text-sm leading-6 text-center tracking-tight text-gray-500 whitespace-nowrap", children: history.event }) }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "font-work-sans font-normal text-sm leading-6 text-center tracking-tight text-gray-500 whitespace-nowrap", children: history.daysOnMarket }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex lg:hidden flex-col items-center justify-between p-3 gap-2 w-full bg-white border border-gray-200 rounded-xl shadow-sm mb-3 mx-2", children: [
          /* @__PURE__ */ jsx("div", { className: "w-full h-[71px] relative overflow-hidden rounded-lg bg-gray-100 border border-gray-200", children: /* @__PURE__ */ jsx(
            "img",
            {
              src: history.image,
              alt: "Building Image",
              className: "w-full h-full object-cover rounded-md",
              loading: "lazy",
              onError: (e) => {
                e.target.src = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";
              }
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center w-full gap-1", children: [
            /* @__PURE__ */ jsx("div", { className: "flex flex-col items-center justify-center flex-1 min-w-[60px] p-1 text-center", children: /* @__PURE__ */ jsx("span", { className: "font-work-sans font-normal text-xs leading-4 text-center text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis w-full", children: history.date }) }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-col items-center justify-center flex-1 min-w-[60px] p-1 text-center", children: /* @__PURE__ */ jsx("span", { className: "font-work-sans font-normal text-xs leading-4 text-center text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis w-full", children: history.price }) }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-col items-center justify-center flex-1 min-w-[60px] p-1 text-center", children: /* @__PURE__ */ jsx("span", { className: "font-work-sans font-normal text-xs leading-4 text-center text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis w-full", children: history.event }) }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-col items-center justify-center flex-1 min-w-[60px] p-1 text-center", children: /* @__PURE__ */ jsx("span", { className: "font-work-sans font-normal text-xs leading-4 text-center text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis w-full", children: history.daysOnMarket }) })
          ] })
        ] })
      ] }, index)) }),
      priceHistoryData.length > 2 && /* @__PURE__ */ jsx("div", { className: "flex justify-center items-center p-4 w-full mt-8", children: /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: handleToggleShow,
          className: "flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-lg font-work-sans font-medium text-sm leading-5 text-[#293056] cursor-pointer transition-all duration-300 hover:bg-gray-50 hover:border-gray-300 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-md focus:outline-none focus:ring-4 focus:ring-gray-200",
          type: "button",
          "aria-expanded": showAll,
          children: [
            /* @__PURE__ */ jsxs("span", { className: showAll ? "hidden" : "block", children: [
              "Show more (",
              remainingCount,
              ")"
            ] }),
            /* @__PURE__ */ jsx("span", { className: showAll ? "block" : "hidden", children: "Show less" }),
            /* @__PURE__ */ jsx(ChevronDownIcon, { className: `w-4 h-4 transition-transform duration-300 ${showAll ? "rotate-180" : "rotate-0"}` })
          ]
        }
      ) })
    ] })
  ] }) }) });
};
export {
  PriceHistory as default
};
