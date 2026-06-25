import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { router } from "@inertiajs/react";
function RealEstateLinksSection() {
  const [showMore, setShowMore] = useState(false);
  const gtaLinks = {
    "Popular Toronto Neighborhoods": [
      "Condos for sale in Yorkville",
      "Condos for sale in The Annex",
      "Houses for sale in Rosedale",
      "Condos for sale in Forest Hill"
    ],
    "West GTA": [
      "Houses for sale in Mississauga",
      "Condos for sale in Oakville",
      "Townhouses for sale in Burlington",
      "Condos for sale in Etobicoke"
    ],
    "North GTA": [
      "Houses for sale in Richmond Hill",
      "Condos for sale in Vaughan",
      "Townhouses for sale in Markham",
      "Houses for sale in Aurora"
    ],
    "East GTA": [
      "Houses for sale in Scarborough",
      "Condos for sale in North York",
      "Townhouses for sale in Pickering",
      "Condos for sale in Ajax"
    ]
  };
  const popularSearches = {
    "Downtown Core": [
      "Condos for sale in King West",
      "Condos for sale in Bay St. Corridor",
      "Condos for sale in Entertainment District",
      "Condos for sale in Financial District",
      "Recently sold condos in King West",
      "Recently leased condos in Entertainment District"
    ],
    "West Toronto": [
      "Condos for sale in Liberty Village",
      "Condos for sale in CityPlace",
      "Condos for sale in Mimico",
      "Condos for sale in The Waterfront"
    ],
    "East Toronto": [
      "Condos for sale in St. Lawrence",
      "Condos for sale in Distillery District",
      "Condos for sale in Regent Park",
      "Condos for sale in Corktown"
    ],
    "Central Toronto": [
      "Condos for sale in Church St. Corridor",
      "Condos for sale in Yonge and Bloor",
      "Condos for sale in Mount Pleasant West",
      "Condos for sale in Willowdale East"
    ],
    "Midtown Toronto": [
      "Condos for sale in Davisville",
      "Condos for sale in Yonge and Eglinton",
      "Condos for sale in Lawrence Park",
      "Condos for sale in Leaside"
    ],
    "North York": [
      "Condos for sale in Sheppard and Yonge",
      "Condos for sale in Bayview Village",
      "Condos for sale in Don Mills",
      "Condos for sale in York Mills"
    ],
    "Etobicoke": [
      "Condos for sale in Humber Bay",
      "Condos for sale in Islington Village",
      "Condos for sale in Royal York",
      "Condos for sale in The Kingsway"
    ],
    "Scarborough": [
      "Condos for sale in Scarborough Town Centre",
      "Condos for sale in Birch Cliff",
      "Condos for sale in Cliffside",
      "Condos for sale in Guildwood"
    ]
  };
  const nearbyCities = {
    "York Region": [
      "Condos for sale in Richmond Hill",
      "Condos for sale in Vaughan",
      "Condos for sale in Markham",
      "Condos for sale in Aurora"
    ],
    "Durham Region": [
      "Condos for sale in Pickering",
      "Condos for sale in Ajax",
      "Condos for sale in Whitby",
      "Condos for sale in Oshawa"
    ],
    "Peel Region": [
      "Condos for sale in Mississauga",
      "Condos for sale in Brampton",
      "Condos for sale in Caledon",
      "Townhouses for sale in Mississauga"
    ],
    "Halton Region": [
      "Condos for sale in Oakville",
      "Condos for sale in Burlington",
      "Condos for sale in Milton",
      "Townhouses for sale in Oakville"
    ]
  };
  const slugify = (s) => (s || "").toString().toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
  const parseSearchLink = (linkText) => {
    const text = linkText.toLowerCase();
    const bedMatch = text.match(/(\d+)\s*(?:bed|bedroom)/i);
    const beds = bedMatch ? parseInt(bedMatch[1], 10) : null;
    let kindSegment = "condos";
    if (text.includes("townhouse")) kindSegment = "townhouses";
    else if (text.includes("house")) kindSegment = "houses";
    else if (text.includes("apartment")) kindSegment = "apartments";
    else if (text.includes("condo")) kindSegment = "condos";
    let txnSegment = "for-sale";
    let statusFilter = null;
    if (text.includes("sold")) {
      txnSegment = "for-sale";
      statusFilter = "Sold";
    } else if (text.includes("leased")) {
      txnSegment = "for-rent";
      statusFilter = "Leased";
    } else if (text.includes("for rent")) {
      txnSegment = "for-rent";
    }
    const locationMatch = text.match(/in\s+(.+)$/i);
    const locationLabel = locationMatch ? locationMatch[1].trim() : "";
    const locationSlug = slugify(locationLabel);
    const knownCities = /* @__PURE__ */ new Set([
      "toronto",
      "mississauga",
      "oakville",
      "burlington",
      "milton",
      "brampton",
      "caledon",
      "vaughan",
      "richmond-hill",
      "markham",
      "aurora",
      "pickering",
      "ajax",
      "whitby",
      "oshawa",
      "etobicoke",
      "scarborough",
      "north-york"
    ]);
    let citySlug = "toronto";
    let neighbourhoodSlug = "";
    if (knownCities.has(locationSlug)) {
      citySlug = locationSlug;
    } else if (locationSlug) {
      neighbourhoodSlug = locationSlug;
    }
    const bedroomPrefix = beds ? `${beds}-bedroom-` : "";
    const lastSegment = `${bedroomPrefix}${kindSegment}-${txnSegment}`;
    const search = new URLSearchParams();
    if (beds) {
      search.append("beds", `${beds}-${beds},${beds}.1-${beds}.9`);
    }
    if (statusFilter) {
      search.append("property_status", statusFilter);
    }
    const path = neighbourhoodSlug ? `/${citySlug}/${neighbourhoodSlug}/${lastSegment}` : `/${citySlug}/${lastSegment}`;
    const qs = search.toString();
    return qs ? `${path}?${qs}` : path;
  };
  const generateSearchUrl = (linkText) => parseSearchLink(linkText);
  const handleLinkClick = (e, linkText) => {
    e.preventDefault();
    router.get(parseSearchLink(linkText));
  };
  const RenderLink = ({ text }) => /* @__PURE__ */ jsx(
    "a",
    {
      href: generateSearchUrl(text),
      onClick: (e) => handleLinkClick(e, text),
      className: "block text-gray-700 hover:text-blue-600 transition-colors duration-200",
      children: text
    }
  );
  return /* @__PURE__ */ jsx("section", { className: "bg-white", children: /* @__PURE__ */ jsx("div", { className: "max-w-[1280px] mx-auto px-4 md:px-0", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-sm", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-12", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg md:text-2xl font-bold font-space-grotesk leading-tight mb-6", style: { color: "#293056" }, children: "Explore the Greater Toronto Area Real Estate Market" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8", children: Object.entries(gtaLinks).map(([category, links], index) => /* @__PURE__ */ jsx("div", { className: "space-y-4", children: links.map((link, linkIndex) => /* @__PURE__ */ jsx(RenderLink, { text: link }, linkIndex)) }, index)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-12", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg md:text-2xl font-bold font-space-grotesk leading-tight mb-6", style: { color: "#293056" }, children: "Popular Toronto Searches" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8", children: Object.entries(popularSearches).slice(0, showMore ? 8 : 4).map(([category, links], index) => /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-800 mb-2", children: category }),
        links.slice(0, 4).map((link, linkIndex) => /* @__PURE__ */ jsx(RenderLink, { text: link }, linkIndex))
      ] }, index)) }),
      /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setShowMore(!showMore),
          className: "flex items-center text-gray-600 hover:text-gray-700 transition-colors duration-200 font-medium",
          children: [
            /* @__PURE__ */ jsx("span", { className: "mr-2", children: showMore ? "Show less" : "Show more" }),
            /* @__PURE__ */ jsx(
              "svg",
              {
                className: `w-4 h-4 transform transition-transform duration-200 ${showMore ? "rotate-180" : ""}`,
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
                children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M19 9l-7 7-7-7" })
              }
            )
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-12", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg md:text-2xl font-bold font-space-grotesk leading-tight mb-6", style: { color: "#293056" }, children: "Nearby Cities" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8", children: Object.entries(nearbyCities).map(([category, links], index) => /* @__PURE__ */ jsx("div", { className: "space-y-4", children: links.map((link, linkIndex) => /* @__PURE__ */ jsx(RenderLink, { text: link }, linkIndex)) }, index)) })
    ] })
  ] }) }) });
}
export {
  RealEstateLinksSection as default
};
