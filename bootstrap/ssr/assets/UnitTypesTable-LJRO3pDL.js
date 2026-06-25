import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link } from "@inertiajs/react";
import { g as groupByBedrooms, a as formatMoney } from "./iceData-C26SR6UI.js";
function bedroomsForLabel(label) {
  if (!label) return 0;
  if (/studio/i.test(label)) return 0;
  const m = String(label).match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}
function UnitTypesTable({ forSale = [], forRent = [], building = {} }) {
  const [mode, setMode] = useState("sale");
  const source = mode === "sale" ? forSale : forRent;
  const rows = groupByBedrooms(source);
  const totalCount = rows.reduce((sum, r) => sum + r.count, 0);
  const buildingName = building.name || "Nobu Residences";
  const fmt = (n) => n ? formatMoney(n) : "—";
  const sizeText = (s) => s ? `${String(s).replace("-", " – ")} sq ft` : "N/A";
  const streetAddresses = [building.street_address_1, building.street_address_2].map((v) => v == null ? "" : String(v).trim()).filter(Boolean).join(",") || (building.address ? String(building.address).trim() : "");
  const searchUrlFor = (beds) => {
    const params = new URLSearchParams();
    params.set("status", mode === "sale" ? "For Sale" : "For Rent");
    params.set("bedrooms", String(beds));
    if (streetAddresses) params.set("street_addresses", streetAddresses);
    if (building.id) params.set("building_id", String(building.id));
    if (buildingName) params.set("query", buildingName);
    return `/search?${params.toString()}`;
  };
  return /* @__PURE__ */ jsx("section", { id: "units", className: "bg-neutral-50 py-20 md:py-28", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-screen-xl px-4 md:px-0", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-12", children: [
      /* @__PURE__ */ jsx("p", { className: "font-work-sans text-gold-500 text-[11px] tracking-[0.3em] uppercase mb-3", children: "Available Units" }),
      /* @__PURE__ */ jsx("h2", { className: "font-playfair text-3xl md:text-4xl text-neutral-900 mb-4", children: "Unit Types & Price Ranges" }),
      /* @__PURE__ */ jsxs("p", { className: "font-work-sans text-neutral-500 text-sm max-w-xl mx-auto", children: [
        "Real-time breakdown of available units at ",
        buildingName,
        " by bedroom count, with current pricing from the Toronto MLS®."
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-center mb-10", children: /* @__PURE__ */ jsxs("div", { className: "inline-flex bg-neutral-200 rounded-full p-1", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setMode("sale"),
          className: `px-6 py-2.5 text-[13px] tracking-[0.1em] uppercase font-medium rounded-full transition-all ${mode === "sale" ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-700"}`,
          children: "For Sale"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setMode("rent"),
          className: `px-6 py-2.5 text-[13px] tracking-[0.1em] uppercase font-medium rounded-full transition-all ${mode === "rent" ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-700"}`,
          children: "For Rent"
        }
      )
    ] }) }),
    rows.length === 0 ? /* @__PURE__ */ jsxs("p", { className: "text-center font-work-sans text-neutral-500", children: [
      "No ",
      mode === "sale" ? "sale" : "rental",
      " listings are currently available."
    ] }) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("div", { className: "min-w-[680px] bg-white rounded-xl overflow-hidden shadow-sm", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-5 bg-neutral-900 text-white px-6 py-4", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[11px] tracking-[0.15em] uppercase", children: "Unit Type" }),
        /* @__PURE__ */ jsx("span", { className: "text-[11px] tracking-[0.15em] uppercase text-center", children: "Available" }),
        /* @__PURE__ */ jsx("span", { className: "text-[11px] tracking-[0.15em] uppercase text-center", children: mode === "rent" ? "Avg. Rent" : "Avg. Price" }),
        /* @__PURE__ */ jsx("span", { className: "text-[11px] tracking-[0.15em] uppercase text-center", children: "Price Range" }),
        /* @__PURE__ */ jsx("span", { className: "text-[11px] tracking-[0.15em] uppercase text-center", children: "Size Range" })
      ] }),
      rows.map((r, i) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: `grid grid-cols-5 px-6 py-4 items-center border-b border-neutral-100 ${i % 2 === 0 ? "bg-white" : "bg-neutral-50"}`,
          children: [
            /* @__PURE__ */ jsx("span", { className: "text-[14px] font-medium text-neutral-800", children: r.label }),
            /* @__PURE__ */ jsx("span", { className: "text-[14px] text-neutral-600 text-center", children: /* @__PURE__ */ jsx(
              Link,
              {
                href: searchUrlFor(bedroomsForLabel(r.label)),
                "aria-label": `View ${r.count} ${r.label} ${mode === "sale" ? "for sale" : "for rent"} at ${buildingName}`,
                title: `View ${r.label} ${mode === "sale" ? "for sale" : "for rent"} at ${buildingName}`,
                className: "inline-flex items-center justify-center w-8 h-8 bg-gold-50 text-gold-700 rounded-full font-semibold text-sm cursor-pointer transition-all hover:bg-gold-100 hover:ring-2 hover:ring-gold-300 hover:scale-110",
                children: r.count
              }
            ) }),
            /* @__PURE__ */ jsx("span", { className: "text-[14px] text-neutral-600 text-center font-medium", children: fmt(r.avg) }),
            /* @__PURE__ */ jsx("span", { className: "text-[13px] text-neutral-500 text-center", children: r.min ? `${fmt(r.min)} – ${fmt(r.max)}` : "—" }),
            /* @__PURE__ */ jsx("span", { className: "text-[13px] text-neutral-500 text-center", children: sizeText(r.sizeSample) })
          ]
        },
        r.label
      )),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-5 px-6 py-4 bg-neutral-900 text-white", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[13px] font-semibold uppercase tracking-wider", children: "Total" }),
        /* @__PURE__ */ jsx("span", { className: "text-[14px] font-semibold text-center", children: totalCount }),
        /* @__PURE__ */ jsx("span", { className: "text-[13px] text-neutral-400 text-center", children: "—" }),
        /* @__PURE__ */ jsx("span", { className: "text-[13px] text-neutral-400 text-center", children: "—" }),
        /* @__PURE__ */ jsx("span", { className: "text-[13px] text-neutral-400 text-center", children: "—" })
      ] })
    ] }) })
  ] }) });
}
export {
  UnitTypesTable as default
};
