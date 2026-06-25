import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import MainLayout from "./MainLayout-BFh5qQm3.js";
import Navbar from "./Navbar-BOM1Kycz.js";
import ProtectedPropertyCard from "./ProtectedPropertyCard-BIxREphI.js";
import "./Footer-BjazYOa4.js";
import "./ContactAgentModal-Bc8CTpfm.js";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import "./LoginModal-C-0W-anf.js";
import "./GoogleLoginButton-wrwag0eM.js";
import "./PropertyDetailIcons-3huqvWqW.js";
import "@headlessui/react";
const SearchIcon = ({ className }) => /* @__PURE__ */ jsx("svg", { className, width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsx(
  "path",
  {
    d: "M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }
) });
const ChevronDownIcon = ({ className }) => /* @__PURE__ */ jsx("svg", { className, width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsx("path", { d: "M6 9L12 15L18 9", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) });
const GridIcon = ({ className }) => /* @__PURE__ */ jsxs("svg", { className, width: "16", height: "14", viewBox: "0 0 16 14", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
  /* @__PURE__ */ jsx("rect", { x: "12", y: "0.5", width: "3.5", height: "3.5", fill: "currentColor" }),
  /* @__PURE__ */ jsx("rect", { x: "12", y: "5.25", width: "3.5", height: "3.5", fill: "currentColor" }),
  /* @__PURE__ */ jsx("rect", { x: "12", y: "10.5", width: "3.5", height: "3.5", fill: "currentColor" }),
  /* @__PURE__ */ jsx("rect", { x: "6", y: "0.5", width: "3.5", height: "3.5", fill: "currentColor" }),
  /* @__PURE__ */ jsx("rect", { x: "0", y: "0.5", width: "3.5", height: "3.5", fill: "currentColor" }),
  /* @__PURE__ */ jsx("rect", { x: "6", y: "5.25", width: "3.5", height: "3.5", fill: "currentColor" }),
  /* @__PURE__ */ jsx("rect", { x: "0", y: "5.25", width: "3.5", height: "3.5", fill: "currentColor" }),
  /* @__PURE__ */ jsx("rect", { x: "6", y: "10.5", width: "3.5", height: "3.5", fill: "currentColor" }),
  /* @__PURE__ */ jsx("rect", { x: "0", y: "10.5", width: "3.5", height: "3.5", fill: "currentColor" })
] });
const ListIcon = ({ className }) => /* @__PURE__ */ jsxs("svg", { className, width: "26", height: "14", viewBox: "0 0 26 14", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
  /* @__PURE__ */ jsx("rect", { x: "12.5", y: "1", width: "12.5", height: "1", stroke: "currentColor" }),
  /* @__PURE__ */ jsx("rect", { x: "6", y: "0.5", width: "3.5", height: "3.5", fill: "currentColor" }),
  /* @__PURE__ */ jsx("rect", { x: "0", y: "0.5", width: "3.5", height: "3.5", fill: "currentColor" }),
  /* @__PURE__ */ jsx("rect", { x: "6", y: "5.25", width: "3.5", height: "3.5", fill: "currentColor" }),
  /* @__PURE__ */ jsx("rect", { x: "0", y: "5.25", width: "3.5", height: "3.5", fill: "currentColor" }),
  /* @__PURE__ */ jsx("rect", { x: "6", y: "10.5", width: "3.5", height: "3.5", fill: "currentColor" }),
  /* @__PURE__ */ jsx("rect", { x: "0", y: "10.5", width: "3.5", height: "3.5", fill: "currentColor" })
] });
const Shield = ({ className }) => /* @__PURE__ */ jsx("svg", { className, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" }) });
function PublicPropertyListing({ auth, siteName, siteUrl, year, properties, filters = {} }) {
  const [searchFilters, setSearchFilters] = useState({
    city: filters.city || "",
    property_type: filters.property_type || "",
    transaction_type: filters.transaction_type || "",
    min_price: filters.min_price || "",
    max_price: filters.max_price || "",
    bedrooms: filters.bedrooms || "",
    bathrooms: filters.bathrooms || ""
  });
  const [viewType, setViewType] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const handleFilterChange = (field, value) => {
    setSearchFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  };
  const handleSearch = (e) => {
    e.preventDefault();
    const cleanFilters = Object.fromEntries(
      Object.entries(searchFilters).filter(([_, value]) => value !== "")
    );
    router.get("/agent/properties", cleanFilters);
  };
  const clearFilters = () => {
    setSearchFilters({
      city: "",
      property_type: "",
      transaction_type: "",
      min_price: "",
      max_price: "",
      bedrooms: "",
      bathrooms: ""
    });
    router.get("/agent/properties");
  };
  const propertyTypes = [
    { value: "detached", label: "Detached House" },
    { value: "semi_detached", label: "Semi-Detached" },
    { value: "townhouse", label: "Townhouse" },
    { value: "condo", label: "Condo" },
    { value: "apartment", label: "Apartment" },
    { value: "commercial", label: "Commercial" },
    { value: "land", label: "Land" }
  ];
  const transactionTypes = [
    { value: "sale", label: "For Sale" },
    { value: "rent", label: "For Rent" },
    { value: "lease", label: "For Lease" }
  ];
  return /* @__PURE__ */ jsxs(MainLayout, { siteName, siteUrl, year, children: [
    /* @__PURE__ */ jsx(Head, { title: "Protected Properties - Proprio-Link" }),
    /* @__PURE__ */ jsx("div", { className: "bg-[#293056] w-screen h-[85px] md:h-[120px] mb-10", children: /* @__PURE__ */ jsx(Navbar, { auth }) }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-[1280px] mx-auto px-4 md:px-0", children: [
      /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-[10px] px-3 md:px-4 py-3 mb-6 bg-[#F5F5F5] w-full h-[75px]", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-row justify-between items-center gap-[161px] w-full h-[51px]", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-row items-center gap-8 mx-auto w-[902px] h-[51px]", children: [
          /* @__PURE__ */ jsx("div", { className: "flex flex-row items-center gap-1 w-[324px] h-12 bg-white rounded-xl", children: /* @__PURE__ */ jsx("div", { className: "flex flex-row justify-between items-center p-1 gap-1 w-full h-12", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-row justify-between items-center gap-[6px] mx-auto w-[316px] h-10", children: [
            /* @__PURE__ */ jsx("div", { className: "flex flex-row items-center pl-4 gap-[10px] w-[270px] h-10", children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                placeholder: "Search",
                value: searchFilters.city,
                onChange: (e) => handleFilterChange("city", e.target.value),
                className: "w-[46px] h-6 font-work-sans font-bold text-sm leading-6 flex items-center tracking-[-0.03em] text-[#1C1463] bg-transparent border-none outline-none placeholder-[#1C1463]"
              }
            ) }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-row justify-center items-center w-10 h-10 bg-black rounded-xl cursor-pointer", onClick: handleSearch, children: /* @__PURE__ */ jsx(SearchIcon, { className: "w-6 h-6 text-white" }) })
          ] }) }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-row items-center p-2 gap-2 w-[99px] h-10 bg-white rounded-lg", children: [
            /* @__PURE__ */ jsx("div", { className: "flex flex-col items-start gap-4 w-[53px] h-6", children: /* @__PURE__ */ jsxs(
              "select",
              {
                value: searchFilters.transaction_type,
                onChange: (e) => handleFilterChange("transaction_type", e.target.value),
                className: "w-full h-6 font-work-sans font-bold text-sm leading-6 tracking-[-0.03em] text-[#293056] bg-transparent border-none outline-none",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "For Sale" }),
                  transactionTypes.map((type) => /* @__PURE__ */ jsx("option", { value: type.value, children: type.label }, type.value))
                ]
              }
            ) }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-col justify-center items-center p-1 gap-2 w-[22px] h-4", children: /* @__PURE__ */ jsx(ChevronDownIcon, { className: "w-6 h-6 text-[#1C1463]" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-row items-center p-2 gap-2 w-[105px] h-10 bg-white rounded-lg", children: [
            /* @__PURE__ */ jsx("div", { className: "flex flex-col items-start gap-4 w-[59px] h-6", children: /* @__PURE__ */ jsxs(
              "select",
              {
                value: searchFilters.bedrooms,
                onChange: (e) => handleFilterChange("bedrooms", e.target.value),
                className: "w-full h-6 font-work-sans font-bold text-sm leading-6 tracking-[-0.03em] text-[#293056] bg-transparent border-none outline-none",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "Bed type" }),
                  /* @__PURE__ */ jsx("option", { value: "1", children: "1+" }),
                  /* @__PURE__ */ jsx("option", { value: "2", children: "2+" }),
                  /* @__PURE__ */ jsx("option", { value: "3", children: "3+" }),
                  /* @__PURE__ */ jsx("option", { value: "4", children: "4+" }),
                  /* @__PURE__ */ jsx("option", { value: "5", children: "5+" })
                ]
              }
            ) }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-col justify-center items-center p-1 gap-2 w-[22px] h-4", children: /* @__PURE__ */ jsx(ChevronDownIcon, { className: "w-6 h-6 text-[#1C1463]" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start gap-1 w-[286px] h-[51px]", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-row justify-between items-center gap-3 w-[286px] h-[27px]", children: [
              /* @__PURE__ */ jsx("div", { className: "flex flex-row justify-center items-center px-[7px] py-[3px] gap-[10px] mx-auto w-[99px] h-[27px] bg-white border border-[#293056] rounded-lg box-border", children: /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  placeholder: "0",
                  value: searchFilters.min_price,
                  onChange: (e) => handleFilterChange("min_price", e.target.value),
                  className: "w-full h-[21px] font-work-sans font-normal text-xs leading-[21px] tracking-[-0.04em] text-black bg-transparent border-none outline-none"
                }
              ) }),
              /* @__PURE__ */ jsx("div", { className: "flex flex-col items-start mx-auto w-3 h-[21px]", children: /* @__PURE__ */ jsx("span", { className: "w-3 h-[21px] font-work-sans font-normal text-xs leading-[21px] flex items-center tracking-[-0.04em] text-[#293056]", children: "to" }) }),
              /* @__PURE__ */ jsx("div", { className: "flex flex-row justify-center items-center px-[7px] py-[3px] gap-[10px] mx-auto w-[99px] h-[27px] bg-white border border-[#293056] rounded-lg box-border", children: /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  placeholder: "$37,000,000",
                  value: searchFilters.max_price,
                  onChange: (e) => handleFilterChange("max_price", e.target.value),
                  className: "w-full h-[21px] font-work-sans font-normal text-xs leading-[21px] tracking-[-0.04em] text-black bg-transparent border-none outline-none"
                }
              ) })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-row justify-between items-center w-[286px] h-5 isolate relative", children: /* @__PURE__ */ jsxs("div", { className: "absolute w-[286px] h-5 left-0 top-0", children: [
              /* @__PURE__ */ jsx("div", { className: "absolute left-[2.91%] right-[0.69%] top-[42.8%] bottom-[49.13%] bg-[#293056] rounded-full" }),
              /* @__PURE__ */ jsx("div", { className: "flex flex-row justify-center items-center p-[1.6px] absolute w-[20.36px] h-[19.05px] left-[265.64px] top-0 bg-white border border-[#293056] shadow-[0px_3px_8px_rgba(0,0,0,0.02)] rounded-full box-border", children: /* @__PURE__ */ jsx("div", { className: "w-4 h-4 relative", children: /* @__PURE__ */ jsx("div", { className: "absolute left-[27.08%] right-[27.08%] top-[12.5%] bottom-[12.5%] bg-[#293056] rounded-full" }) }) }),
              /* @__PURE__ */ jsx("div", { className: "flex flex-row justify-center items-center p-[1.6px] absolute w-[20.36px] h-[19.05px] left-0 top-[0.95px] bg-white border border-[#293056] shadow-[0px_3px_8px_rgba(0,0,0,0.02)] rounded-full box-border", children: /* @__PURE__ */ jsx("div", { className: "w-4 h-4 relative", children: /* @__PURE__ */ jsx("div", { className: "absolute left-[27.08%] right-[27.08%] top-[12.8%] bottom-[12.2%] bg-[#293056] rounded-full" }) }) })
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-row items-center gap-2 mx-auto w-[264px] h-12", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-row items-end gap-[0.2px] w-[145px] h-11 bg-white shadow-[0px_4px_5px_rgba(0,0,0,0.15)] rounded-[10px]", children: [
            /* @__PURE__ */ jsxs(
              "div",
              {
                className: `flex flex-col justify-center items-center px-3 pt-2 pb-0 w-[79px] h-[43px] cursor-pointer ${viewType === "grid" ? "bg-black" : ""}`,
                onClick: () => setViewType("grid"),
                children: [
                  /* @__PURE__ */ jsx(GridIcon, { className: `w-4 h-[14px] ${viewType === "grid" ? "text-white" : "text-black"}` }),
                  /* @__PURE__ */ jsx("div", { className: "flex flex-col items-start w-[23px] h-[21px]", children: /* @__PURE__ */ jsx("span", { className: `w-[23px] h-[21px] font-work-sans font-normal text-xs leading-[21px] flex items-center tracking-[-0.04em] ${viewType === "grid" ? "text-white" : "text-black"}`, children: "Grid" }) })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "div",
              {
                className: `flex flex-col justify-center items-center px-3 pt-2 pb-0 w-[66px] h-[43px] cursor-pointer ${viewType === "mixed" ? "bg-black" : ""}`,
                onClick: () => setViewType("mixed"),
                children: [
                  /* @__PURE__ */ jsx(ListIcon, { className: `w-[26px] h-[14px] ${viewType === "mixed" ? "text-white" : "text-[#263238]"}` }),
                  /* @__PURE__ */ jsx("div", { className: "flex flex-col items-start w-[33px] h-[21px]", children: /* @__PURE__ */ jsx("span", { className: `w-[33px] h-[21px] font-work-sans font-normal text-xs leading-[21px] flex items-center tracking-[-0.04em] ${viewType === "mixed" ? "text-white" : "text-[#263238]"}`, children: "Mixed" }) })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-row items-center px-4 gap-2 w-[111px] h-12 bg-white rounded-lg cursor-pointer", children: /* @__PURE__ */ jsx("div", { className: "flex flex-col items-start gap-4 w-[79px] h-6", children: /* @__PURE__ */ jsx("span", { className: "w-[79px] h-6 font-work-sans font-bold text-sm leading-6 flex items-center tracking-[-0.03em] text-[#293056]", children: "Save search" }) }) })
        ] })
      ] }) }),
      showFilters && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-gray-50 rounded-lg mb-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Property Type" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: searchFilters.property_type,
              onChange: (e) => handleFilterChange("property_type", e.target.value),
              className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#93370D] focus:border-transparent",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "All Types" }),
                propertyTypes.map((type) => /* @__PURE__ */ jsx("option", { value: type.value, children: type.label }, type.value))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Min Bathrooms" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: searchFilters.bathrooms,
              onChange: (e) => handleFilterChange("bathrooms", e.target.value),
              className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#93370D] focus:border-transparent",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Any" }),
                /* @__PURE__ */ jsx("option", { value: "1", children: "1+" }),
                /* @__PURE__ */ jsx("option", { value: "2", children: "2+" }),
                /* @__PURE__ */ jsx("option", { value: "3", children: "3+" }),
                /* @__PURE__ */ jsx("option", { value: "4", children: "4+" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "md:col-span-2 flex gap-4", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: clearFilters,
              className: "flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors",
              children: "Clear Filters"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: handleSearch,
              className: "flex-1 px-4 py-2 bg-[#93370D] text-white rounded-md hover:bg-[#7A2A09] transition-colors",
              children: "Apply Filters"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "py-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-8", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h2", { className: "text-2xl font-bold text-[#293056] mb-2", children: [
              properties?.total || 0,
              " Protected Properties Found"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: properties?.total > 0 ? `Showing ${properties.from}-${properties.to} of ${properties.total} results` : "No results found" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2", children: [
            /* @__PURE__ */ jsx(Shield, { className: "w-4 h-4 inline mr-2" }),
            "All properties are privacy-protected"
          ] })
        ] }),
        properties?.data?.length > 0 ? /* @__PURE__ */ jsx("div", { className: `grid gap-6 mb-8 ${viewType === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`, children: properties.data.map((property) => /* @__PURE__ */ jsx(
          ProtectedPropertyCard,
          {
            property,
            size: "default"
          },
          property.id
        )) }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-16", children: [
          /* @__PURE__ */ jsx("div", { className: "w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6", children: /* @__PURE__ */ jsx(SearchIcon, { className: "w-12 h-12 text-gray-400" }) }),
          /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-gray-900 mb-2", children: "No Properties Found" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-600 mb-6", children: "Try adjusting your search criteria or filters." }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: clearFilters,
              className: "px-6 py-3 bg-[#93370D] text-white rounded-lg hover:bg-[#7A2A09] transition-colors",
              children: "Clear All Filters"
            }
          )
        ] }),
        properties?.last_page > 1 && /* @__PURE__ */ jsx("div", { className: "flex justify-center items-center gap-2", children: properties.links.map((link, index) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              if (link.url) {
                const url = new URL(link.url);
                const page = url.searchParams.get("page");
                router.get("/agent/properties", { ...searchFilters, page });
              }
            },
            disabled: !link.url,
            className: `px-4 py-2 rounded-lg font-medium transition-colors ${link.active ? "bg-[#93370D] text-white" : link.url ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`,
            dangerouslySetInnerHTML: { __html: link.label }
          },
          index
        )) })
      ] })
    ] })
  ] });
}
export {
  PublicPropertyListing as default
};
