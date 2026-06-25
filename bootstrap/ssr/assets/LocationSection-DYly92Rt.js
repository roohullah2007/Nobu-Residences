import { jsx, jsxs } from "react/jsx-runtime";
function LocationSection({ pageContent, building = {} }) {
  const mlsSettings = pageContent?.mls_settings || {};
  const rawAddress = building.address || mlsSettings.default_building_address || "15 Mercer Street";
  const address = rawAddress.split(",")[0].trim();
  const city = building.city || "Toronto";
  const province = building.province || "ON";
  const fullAddress = `${address}, ${city}, ${province}`;
  const mapQuery = building.latitude && building.longitude ? `${building.latitude},${building.longitude}` : fullAddress;
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;
  const buildingName = building.name || "Nobu Residences";
  const locality = [building.sub_neighbourhood, building.neighbourhood].filter(Boolean).join(", ");
  const transit = [
    "St. Andrew Subway Station — 7 min walk",
    "Spadina & King Streetcar (504/510) — 2 min walk",
    "Union Station & GO Transit — 12 min walk",
    "Gardiner Expressway access — 4 min drive"
  ];
  const neighbourhood = [
    "Toronto Entertainment District",
    "Steps to the Financial District",
    "TIFF Bell Lightbox & Royal Alexandra Theatre",
    "Rogers Centre & Scotiabank Arena nearby",
    "King West dining, cafés & nightlife"
  ];
  return /* @__PURE__ */ jsx("section", { id: "location", className: "bg-white py-16 md:py-24", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-screen-xl px-4 md:px-0", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-10 max-w-2xl", children: [
      /* @__PURE__ */ jsx("p", { className: "font-work-sans text-xs uppercase tracking-[0.3em] text-gold-500", children: "Where You Live" }),
      /* @__PURE__ */ jsx("h2", { className: "mt-2 font-playfair text-3xl md:text-4xl font-semibold text-neutral-900", children: "Location & Neighbourhood" }),
      /* @__PURE__ */ jsxs("p", { className: "mt-3 font-work-sans text-neutral-500", children: [
        fullAddress,
        locality ? ` · ${locality}` : ""
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-8 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsx("div", { className: "overflow-hidden rounded-3xl border border-neutral-200", children: /* @__PURE__ */ jsx(
        "iframe",
        {
          title: `${buildingName} location map`,
          src: mapSrc,
          className: "h-[360px] w-full md:h-[460px]",
          loading: "lazy",
          referrerPolicy: "no-referrer-when-downgrade",
          allowFullScreen: true
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-neutral-200 bg-neutral-50 p-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-playfair text-xl font-semibold text-gold-600", children: "Transit & Connectivity" }),
          /* @__PURE__ */ jsx("ul", { className: "mt-4 space-y-3", children: transit.map((t) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-3 font-work-sans text-sm text-neutral-600", children: [
            /* @__PURE__ */ jsx("span", { className: "mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-gold-500" }),
            t
          ] }, t)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-neutral-200 bg-neutral-50 p-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-playfair text-xl font-semibold text-gold-600", children: "The Neighbourhood" }),
          /* @__PURE__ */ jsx("ul", { className: "mt-4 space-y-3", children: neighbourhood.map((t) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-3 font-work-sans text-sm text-neutral-600", children: [
            /* @__PURE__ */ jsx("span", { className: "mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-gold-500" }),
            t
          ] }, t)) })
        ] })
      ] })
    ] })
  ] }) });
}
export {
  LocationSection as default
};
