import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
function RealEstateLinksSection() {
  const [showMore, setShowMore] = useState(false);
  const toggleShowMore = () => {
    setShowMore(!showMore);
  };
  return /* @__PURE__ */ jsx("section", { className: " bg-white", children: /* @__PURE__ */ jsx("div", { className: "mx-auto px-4 md:px-0", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-sm", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-12", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg md:text-2xl font-bold font-space-grotesk leading-tight mb-6", style: { color: "#293056" }, children: "Explore the North Riverdale Real Estate Market" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx("a", { href: "#", className: "block text-gray-700 hover:text-blue-600 transition-colors duration-200", children: "2 bedroom condos for sale in North Riverdale" }),
          /* @__PURE__ */ jsx("a", { href: "#", className: "block text-gray-700 hover:text-blue-600 transition-colors duration-200", children: "2 bed apartments for sale in North Riverdale" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx("a", { href: "#", className: "block text-gray-700 hover:text-blue-600 transition-colors duration-200", children: "1 bedroom condos for sale in North Riverdale" }),
          /* @__PURE__ */ jsx("a", { href: "#", className: "block text-gray-700 hover:text-blue-600 transition-colors duration-200", children: "3 bed apartments for sale in North Riverdale" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx("a", { href: "#", className: "block text-gray-700 hover:text-blue-600 transition-colors duration-200", children: "3 bedroom condos for sale in North Riverdale" }),
          /* @__PURE__ */ jsx("a", { href: "#", className: "block text-gray-700 hover:text-blue-600 transition-colors duration-200", children: "Cheap condos for sale in North Riverdale" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx("a", { href: "#", className: "block text-gray-700 hover:text-blue-600 transition-colors duration-200", children: "1 bed apartments for sale in North Riverdale" }),
          /* @__PURE__ */ jsx("a", { href: "#", className: "block text-gray-700 hover:text-blue-600 transition-colors duration-200", children: "Luxury condos for sale in North Riverdale" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-12", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg md:text-2xl font-bold font-space-grotesk leading-tight mb-6", style: { color: "#293056" }, children: "Popular Toronto Searches" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx("a", { href: "#", className: "block text-gray-700 hover:text-blue-600 transition-colors duration-200", children: "Condos for sale in King West" }),
          /* @__PURE__ */ jsx("a", { href: "#", className: "block text-gray-700 hover:text-blue-600 transition-colors duration-200", children: "Condos for sale in Willowdale East" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx("a", { href: "#", className: "block text-gray-700 hover:text-blue-600 transition-colors duration-200", children: "Condos for sale in Mimico" }),
          /* @__PURE__ */ jsx("a", { href: "#", className: "block text-gray-700 hover:text-blue-600 transition-colors duration-200", children: "Condos for sale in Bay St. Corridor" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx("a", { href: "#", className: "block text-gray-700 hover:text-blue-600 transition-colors duration-200", children: "Condos for sale in The Waterfront" }),
          /* @__PURE__ */ jsx("a", { href: "#", className: "block text-gray-700 hover:text-blue-600 transition-colors duration-200", children: "Condos for sale in Mount Pleasant West" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx("a", { href: "#", className: "block text-gray-700 hover:text-blue-600 transition-colors duration-200", children: "Condos for sale in Church St. Corridor" }),
          /* @__PURE__ */ jsx("a", { href: "#", className: "block text-gray-700 hover:text-blue-600 transition-colors duration-200", children: "Condos for sale in Yonge and Bloor" })
        ] })
      ] }),
      !showMore && /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: toggleShowMore,
          className: "flex items-center text-gray-600 hover:text-gray-700 transition-colors duration-200 font-medium",
          children: [
            /* @__PURE__ */ jsx("span", { className: "mr-2", children: "Show more" }),
            /* @__PURE__ */ jsx(
              "svg",
              {
                className: "w-4 h-4 transform transition-transform duration-200",
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
                children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M19 9l-7 7-7-7" })
              }
            )
          ]
        }
      ) }),
      showMore && /* @__PURE__ */ jsxs("div", { className: "mt-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsx("a", { href: "#", className: "block text-gray-700 hover:text-blue-600 transition-colors duration-200", children: "Condos for sale in Entertainment District" }),
            /* @__PURE__ */ jsx("a", { href: "#", className: "block text-gray-700 hover:text-blue-600 transition-colors duration-200", children: "Condos for sale in CityPlace" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsx("a", { href: "#", className: "block text-gray-700 hover:text-blue-600 transition-colors duration-200", children: "Condos for sale in Liberty Village" }),
            /* @__PURE__ */ jsx("a", { href: "#", className: "block text-gray-700 hover:text-blue-600 transition-colors duration-200", children: "Condos for sale in Financial District" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsx("a", { href: "#", className: "block text-gray-700 hover:text-blue-600 transition-colors duration-200", children: "Condos for sale in St. Lawrence" }),
            /* @__PURE__ */ jsx("a", { href: "#", className: "block text-gray-700 hover:text-blue-600 transition-colors duration-200", children: "Condos for sale in Distillery District" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsx("a", { href: "#", className: "block text-gray-700 hover:text-blue-600 transition-colors duration-200", children: "Condos for sale in Regent Park" }),
            /* @__PURE__ */ jsx("a", { href: "#", className: "block text-gray-700 hover:text-blue-600 transition-colors duration-200", children: "Condos for sale in Corktown" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: toggleShowMore,
            className: "flex items-center text-gray-600 hover:text-gray-700 transition-colors duration-200 font-medium",
            children: [
              /* @__PURE__ */ jsx("span", { className: "mr-2", children: "Show less" }),
              /* @__PURE__ */ jsx(
                "svg",
                {
                  className: "w-4 h-4 transform transition-transform duration-200 rotate-180",
                  fill: "none",
                  stroke: "currentColor",
                  viewBox: "0 0 24 24",
                  children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M19 9l-7 7-7-7" })
                }
              )
            ]
          }
        ) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-12", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg md:text-2xl font-bold font-space-grotesk leading-tight mb-6", style: { color: "#293056" }, children: "Nearby Cities" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx("a", { href: "#", className: "block text-gray-700 hover:text-blue-600 transition-colors duration-200", children: "Condos for sale in Richmond Hill" }),
          /* @__PURE__ */ jsx("a", { href: "#", className: "block text-gray-700 hover:text-blue-600 transition-colors duration-200", children: "Condos for sale in Pickering" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx("a", { href: "#", className: "block text-gray-700 hover:text-blue-600 transition-colors duration-200", children: "Condos for sale in Vaughan" }),
          /* @__PURE__ */ jsx("a", { href: "#", className: "block text-gray-700 hover:text-blue-600 transition-colors duration-200", children: "Condos for sale in Brampton" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx("a", { href: "#", className: "block text-gray-700 hover:text-blue-600 transition-colors duration-200", children: "Condos for sale in Markham" }),
          /* @__PURE__ */ jsx("a", { href: "#", className: "block text-gray-700 hover:text-blue-600 transition-colors duration-200", children: "Condos for sale in Ajax" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx("a", { href: "#", className: "block text-gray-700 hover:text-blue-600 transition-colors duration-200", children: "Condos for sale in Mississauga" }),
          /* @__PURE__ */ jsx("a", { href: "#", className: "block text-gray-700 hover:text-blue-600 transition-colors duration-200", children: "Condos for sale in Aurora" })
        ] })
      ] })
    ] })
  ] }) }) });
}
export {
  RealEstateLinksSection as default
};
