import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
const RealEstateLinksSection = () => {
  const [showMore, setShowMore] = useState(false);
  const toggleShowMore = () => {
    setShowMore(!showMore);
  };
  const northRiverdaleLinks = [
    {
      column: 1,
      links: [
        "2 bedroom condos for sale in North Riverdale",
        "2 bed apartments for sale in North Riverdale"
      ]
    },
    {
      column: 2,
      links: [
        "1 bedroom condos for sale in North Riverdale",
        "3 bed apartments for sale in North Riverdale"
      ]
    },
    {
      column: 3,
      links: [
        "3 bedroom condos for sale in North Riverdale",
        "Cheap condos for sale in North Riverdale"
      ]
    },
    {
      column: 4,
      links: [
        "1 bed apartments for sale in North Riverdale",
        "Luxury condos for sale in North Riverdale"
      ]
    }
  ];
  const torontoSearches = [
    {
      column: 1,
      links: [
        "condos for sale in King West",
        "condos for sale in Willowdale East"
      ]
    },
    {
      column: 2,
      links: [
        "condos for sale in Mimico",
        "condos for sale in Bay St. Corridor"
      ]
    },
    {
      column: 3,
      links: [
        "condos for sale in The Waterfront",
        "condos for sale in Mount Pleasant West"
      ]
    },
    {
      column: 4,
      links: [
        "condos for sale in Church St. Corridor",
        "condos for sale in Yonge and Bloor"
      ]
    }
  ];
  const additionalTorontoSearches = [
    {
      column: 1,
      links: [
        "condos for sale in Entertainment District",
        "condos for sale in CityPlace"
      ]
    },
    {
      column: 2,
      links: [
        "condos for sale in Liberty Village",
        "condos for sale in Financial District"
      ]
    },
    {
      column: 3,
      links: [
        "condos for sale in St. Lawrence",
        "condos for sale in Distillery District"
      ]
    },
    {
      column: 4,
      links: [
        "condos for sale in Regent Park",
        "condos for sale in Corktown"
      ]
    }
  ];
  const nearbyCities = [
    {
      column: 1,
      links: [
        "condos for sale in Richmond Hill",
        "condos for sale in Pickering"
      ]
    },
    {
      column: 2,
      links: [
        "condos for sale in Vaughan",
        "condos for sale in Brampton"
      ]
    },
    {
      column: 3,
      links: [
        "condos for sale in Markham",
        "condos for sale in Ajax"
      ]
    },
    {
      column: 4,
      links: [
        "condos for sale in Mississauga",
        "condos for sale in Aurora"
      ]
    }
  ];
  const LinkGrid = ({ data, className = "" }) => /* @__PURE__ */ jsx("div", { className: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 ${className}`, children: data.map((column, columnIndex) => /* @__PURE__ */ jsx("div", { className: "space-y-4", children: column.links.map((link, linkIndex) => /* @__PURE__ */ jsx(
    "a",
    {
      href: "#",
      className: "block text-gray-700 hover:text-blue-600 transition-colors duration-200",
      children: link
    },
    linkIndex
  )) }, columnIndex)) });
  return /* @__PURE__ */ jsxs("div", { className: "real-estate-links-container mx-auto max-w-[1200px]", children: [
    /* @__PURE__ */ jsxs("section", { className: "mb-12", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-6", children: "Explore the North Riverdale Real Estate Market" }),
      /* @__PURE__ */ jsx(LinkGrid, { data: northRiverdaleLinks })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mb-12", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-6", children: "Popular Toronto Searches" }),
      /* @__PURE__ */ jsx(LinkGrid, { data: torontoSearches }),
      /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: toggleShowMore,
          className: "flex items-center transition-colors duration-200 font-medium focus:outline-2 focus:outline-blue-500 focus:outline-offset-2 bg-none border-none cursor-pointer p-0 text-left",
          style: { color: "#9C2A10" },
          onMouseEnter: (e) => e.target.style.color = "#7A1F0D",
          onMouseLeave: (e) => e.target.style.color = "#9C2A10",
          children: [
            /* @__PURE__ */ jsx("span", { className: "mr-2", children: showMore ? "Show less" : "Show more" }),
            /* @__PURE__ */ jsx(
              "svg",
              {
                className: `w-4 h-4 transform transition-transform duration-200 ${showMore ? "rotate-180" : ""}`,
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
                children: /* @__PURE__ */ jsx(
                  "path",
                  {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: "2",
                    d: "M19 9l-7 7-7-7"
                  }
                )
              }
            )
          ]
        }
      ) }),
      showMore && /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(LinkGrid, { data: additionalTorontoSearches }) })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mb-12", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-6", children: "Nearby Cities" }),
      /* @__PURE__ */ jsx(LinkGrid, { data: nearbyCities })
    ] })
  ] });
};
export {
  RealEstateLinksSection as default
};
