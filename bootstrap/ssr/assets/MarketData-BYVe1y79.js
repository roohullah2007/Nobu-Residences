import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
const NAVY = "rgb(2, 46, 80)";
const fmtMoney = (n) => {
  if (!n) return "$0";
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${Math.round(n / 1e3)}K`;
  return `$${n}`;
};
function MarketData({ propertyData = {}, buildingData = null, auth = null, onLoginClick }) {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("price");
  const [loading, setLoading] = useState(true);
  const isGuest = !auth?.user;
  const city = propertyData.city || propertyData.City || "";
  const area = propertyData.area || buildingData?.neighbourhood || "";
  const neighborhood = propertyData.neighborhood || buildingData?.sub_neighbourhood || buildingData?.neighbourhood || "";
  const isRent = /rent|lease/i.test(propertyData.transactionType || propertyData.TransactionType || "");
  useEffect(() => {
    if (isGuest) {
      setLoading(false);
      return;
    }
    if (!city && !area) {
      setLoading(false);
      return;
    }
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (area) params.set("area", area);
    if (neighborhood) params.set("neighborhood", neighborhood);
    params.set("type", isRent ? "lease" : "sale");
    let cancelled = false;
    fetch(`/api/market-stats?${params.toString()}`, {
      headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" }
    }).then((r) => r.json()).then((d) => {
      if (!cancelled) {
        setData(d);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [city, area, neighborhood, isGuest]);
  if (loading) return null;
  if (isGuest) {
    const gatedScope = neighborhood || area || city;
    return /* @__PURE__ */ jsxs("div", { id: "market-info", className: "scroll-mt-32 rounded-2xl bg-white p-5 sm:p-6 border border-gray-200", children: [
      /* @__PURE__ */ jsx("h3", { style: { fontSize: "20px", fontWeight: 700, color: NAVY }, children: "Market Data" }),
      /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-gray-500", children: [
        "Sold price & sales trends",
        gatedScope ? ` in ${gatedScope}` : ""
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-5 flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-gray-200 bg-gray-50/60 py-10 px-4", children: [
        /* @__PURE__ */ jsxs("svg", { width: "26", height: "26", viewBox: "0 0 24 24", fill: "none", stroke: NAVY, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
          /* @__PURE__ */ jsx("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2", ry: "2" }),
          /* @__PURE__ */ jsx("path", { d: "M7 11V7a5 5 0 0 1 10 0v4" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm font-semibold", style: { color: NAVY }, children: "Sign in to view market trends" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-500", children: "See median sold price and sales history for this area." }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => onLoginClick && onLoginClick(),
            className: "mt-4 px-5 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity",
            style: { backgroundColor: NAVY },
            children: "Sign in"
          }
        )
      ] })
    ] });
  }
  const priceByYear = data?.trends?.priceByYear || [];
  const salesByYear = data?.trends?.salesByYear || [];
  if (priceByYear.length < 2) return null;
  const series = (tab === "price" ? priceByYear : salesByYear).map((p) => ({
    x: p.year,
    y: tab === "price" ? p.value : p.count
  }));
  const X0 = 56, X1 = 704, Y0 = 16, Y1 = 212;
  const ys = series.map((p) => p.y);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const range = maxY - minY || 1;
  const px = (i) => series.length === 1 ? X1 : X0 + (X1 - X0) * i / (series.length - 1);
  const py = (y) => Y1 - (Y1 - Y0) * ((y - minY) / range);
  const pts = series.map((p, i) => ({ cx: px(i), cy: py(p.y), ...p }));
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.cx.toFixed(0)},${p.cy.toFixed(0)}`).join(" ");
  const areaPath = `${linePath} L${X1},${Y1} L${X0},${Y1} Z`;
  const grid = [0, 0.25, 0.5, 0.75, 1].map((t) => ({ y: Y0 + (Y1 - Y0) * t, val: maxY - (maxY - minY) * t }));
  const fmtY = (v) => tab === "price" ? fmtMoney(v) : Math.round(v).toLocaleString();
  const scopeName = data?.area || neighborhood || area || city;
  const tabBtn = (id, label) => /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      onClick: () => setTab(id),
      className: "-mb-px pb-2.5 transition-colors",
      style: {
        fontSize: "14px",
        fontWeight: tab === id ? 700 : 500,
        color: tab === id ? NAVY : "rgb(107, 114, 128)",
        borderBottom: `2px solid ${tab === id ? NAVY : "transparent"}`
      },
      children: label
    }
  );
  return /* @__PURE__ */ jsxs("div", { id: "market-info", className: "scroll-mt-32 rounded-2xl bg-white p-5 sm:p-6 border border-gray-200", children: [
    /* @__PURE__ */ jsx("h3", { style: { fontSize: "20px", fontWeight: 700, color: NAVY }, children: "Market Data" }),
    /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-gray-500", children: [
      "Sold price & sales trends in ",
      scopeName
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex gap-6 border-b border-gray-200", children: [
        tabBtn("price", "Price Trends"),
        tabBtn("sales", "Sales Trends")
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
        /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 720 240", className: "w-full", preserveAspectRatio: "xMidYMid meet", children: [
          /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "trendGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#0e9f6e", stopOpacity: "0.18" }),
            /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#0e9f6e", stopOpacity: "0" })
          ] }) }),
          grid.map((g, i) => /* @__PURE__ */ jsxs("g", { children: [
            /* @__PURE__ */ jsx("line", { x1: X0, y1: g.y, x2: X1, y2: g.y, stroke: "#f3f4f6", strokeWidth: "1" }),
            /* @__PURE__ */ jsx("text", { x: "48", y: g.y + 4, textAnchor: "end", style: { fontSize: "10px", fill: "rgb(156,163,175)" }, children: fmtY(g.val) })
          ] }, i)),
          /* @__PURE__ */ jsx("path", { d: areaPath, fill: "url(#trendGrad)" }),
          /* @__PURE__ */ jsx("path", { d: linePath, fill: "none", stroke: "#0e9f6e", strokeWidth: "2.5", strokeLinejoin: "round", strokeLinecap: "round" }),
          pts.map((p, i) => /* @__PURE__ */ jsx("circle", { cx: p.cx, cy: p.cy, r: "3", fill: "#fff", stroke: "#0e9f6e", strokeWidth: "2" }, i)),
          pts.map((p, i) => /* @__PURE__ */ jsx("text", { x: p.cx, y: "232", textAnchor: "middle", style: { fontSize: "10px", fill: "rgb(156,163,175)" }, children: p.x }, `t${i}`))
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "mt-2 text-xs text-gray-400", children: [
          tab === "price" ? "Median sold price by year" : "Sales count by year",
          " in ",
          scopeName,
          " — source: Repliers."
        ] })
      ] })
    ] })
  ] });
}
export {
  MarketData as default
};
