import { jsxs, jsx } from "react/jsx-runtime";
import { p as priceStats, f as formatMoneyShort, a as formatMoney } from "./iceData-C26SR6UI.js";
const svgProps = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true
};
const ICONS = {
  chart: /* @__PURE__ */ jsxs("svg", { ...svgProps, children: [
    /* @__PURE__ */ jsx("path", { d: "M3 3v16a2 2 0 0 0 2 2h16" }),
    /* @__PURE__ */ jsx("path", { d: "M18 17V9" }),
    /* @__PURE__ */ jsx("path", { d: "M13 17V5" }),
    /* @__PURE__ */ jsx("path", { d: "M8 17v-3" })
  ] }),
  dollar: /* @__PURE__ */ jsxs("svg", { ...svgProps, children: [
    /* @__PURE__ */ jsx("line", { x1: "12", x2: "12", y1: "2", y2: "22" }),
    /* @__PURE__ */ jsx("path", { d: "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" })
  ] }),
  layers: /* @__PURE__ */ jsxs("svg", { ...svgProps, children: [
    /* @__PURE__ */ jsx("path", { d: "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" }),
    /* @__PURE__ */ jsx("path", { d: "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" }),
    /* @__PURE__ */ jsx("path", { d: "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" })
  ] }),
  clock: /* @__PURE__ */ jsxs("svg", { ...svgProps, children: [
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
    /* @__PURE__ */ jsx("path", { d: "M12 6v6l4 2" })
  ] }),
  trending: /* @__PURE__ */ jsxs("svg", { ...svgProps, children: [
    /* @__PURE__ */ jsx("path", { d: "M16 7h6v6" }),
    /* @__PURE__ */ jsx("path", { d: "m22 7-8.5 8.5-5-5L2 17" })
  ] })
};
function StatCard({ label, value, sub, icon }) {
  return /* @__PURE__ */ jsxs("div", { className: "bg-white/5 border border-white/10 rounded-lg p-5 hover:bg-white/10 transition-colors", children: [
    icon && /* @__PURE__ */ jsx("div", { className: "text-white mb-3", children: icon }),
    /* @__PURE__ */ jsx("span", { className: "block font-playfair text-2xl text-white font-light", children: value }),
    /* @__PURE__ */ jsx("span", { className: "block text-[12px] text-white/60 font-medium mt-1", children: label }),
    sub && /* @__PURE__ */ jsx("span", { className: "block text-[11px] text-white/30 mt-1", children: sub })
  ] });
}
function MarketSnapshot({ forSale = [], forRent = [], building = {} }) {
  const buildingName = building.name || "Nobu Residences";
  const saleStats = priceStats(forSale);
  const rentStats = priceStats(forRent);
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1e3;
  const dated = [...forSale, ...forRent].filter((l) => l.listedAt instanceof Date);
  const newThisWeek = dated.filter((l) => now - l.listedAt.getTime() <= weekMs).length;
  const showNewCard = dated.length > 0;
  const cards = [
    {
      label: "Units For Sale",
      value: String(saleStats.count),
      sub: saleStats.min ? `${formatMoneyShort(saleStats.min)} – ${formatMoneyShort(saleStats.max)}` : null,
      icon: ICONS.chart
    },
    {
      label: "Avg Sale Price",
      value: saleStats.avg ? formatMoneyShort(saleStats.avg) : "—",
      sub: saleStats.avg ? formatMoney(saleStats.avg) : null,
      icon: ICONS.dollar
    },
    {
      label: "Units For Rent",
      value: String(rentStats.count),
      sub: rentStats.min ? `${formatMoney(rentStats.min)} – ${formatMoney(rentStats.max)}/mo` : null,
      icon: ICONS.layers
    },
    {
      label: "Avg Rent Price",
      value: rentStats.avg ? `${formatMoney(rentStats.avg)}` : "—",
      sub: rentStats.avg ? "per month" : null,
      icon: ICONS.dollar
    },
    ...showNewCard ? [{
      label: "New This Week",
      value: String(newThisWeek),
      sub: "fresh listings",
      icon: ICONS.clock
    }] : [],
    {
      label: "Data Refresh",
      value: "15 min",
      sub: "live MLS feed",
      icon: ICONS.trending
    }
  ];
  return /* @__PURE__ */ jsx("section", { className: "bg-neutral-900 py-16 md:py-20", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-screen-xl px-4 md:px-0", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-end md:justify-between mb-12", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-white/70 text-[11px] tracking-[0.3em] uppercase mb-3", children: "Real-Time Market Data" }),
        /* @__PURE__ */ jsxs("h2", { className: "font-playfair text-3xl md:text-4xl text-white", children: [
          buildingName,
          " Market Snapshot"
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-neutral-500 text-sm mt-3 md:mt-0", children: "Powered by Toronto MLS® · Updated every 15 minutes" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4", children: cards.map((c) => /* @__PURE__ */ jsx(StatCard, { ...c }, c.label)) })
  ] }) });
}
export {
  MarketSnapshot as default
};
