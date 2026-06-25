import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
const NAVY = "rgb(2, 46, 80)";
function MarketSentiment({ propertyData = {}, buildingData = null }) {
  const [sentiment, setSentiment] = useState(null);
  const [loading, setLoading] = useState(true);
  const city = propertyData.city || propertyData.City || "";
  const area = propertyData.area || "";
  const neighborhood = propertyData.neighborhood || buildingData?.sub_neighbourhood || buildingData?.neighbourhood || "";
  const isRent = /rent|lease/i.test(propertyData.transactionType || propertyData.TransactionType || "");
  useEffect(() => {
    if (!city && !area && !neighborhood) {
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
        setSentiment(d.sentiment);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [city, area, neighborhood]);
  if (loading || !sentiment) return null;
  return /* @__PURE__ */ jsxs("div", { className: "bg-white shadow-lg rounded-lg border border-gray-300 p-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("span", { style: { fontSize: "13px", fontWeight: 600, color: NAVY }, children: "Market Sentiment" }),
      /* @__PURE__ */ jsx("span", { style: { fontSize: "12px", fontWeight: 700, color: "rgb(4, 84, 195)" }, children: sentiment.label })
    ] }),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "relative mt-3 h-2 rounded-full",
        style: {
          background: "linear-gradient(to right, rgb(59, 130, 246) 0%, rgb(147, 197, 253) 35%, rgb(134, 239, 172) 50%, rgb(252, 165, 165) 75%, rgb(239, 68, 68) 100%)"
        },
        children: /* @__PURE__ */ jsx("div", { className: "absolute -top-1.5", style: { left: `calc(${sentiment.position}% - 6px)` }, children: /* @__PURE__ */ jsx("svg", { width: "12", height: "12", viewBox: "0 0 12 12", fill: "#022E50", children: /* @__PURE__ */ jsx("path", { d: "M6 9L1 3h10z" }) }) })
      }
    ),
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: "mt-2 flex items-center justify-between",
        style: { fontSize: "11px", color: "rgb(156, 163, 175)", fontWeight: 600 },
        children: [
          /* @__PURE__ */ jsx("span", { children: "Buyer's Market" }),
          /* @__PURE__ */ jsx("span", { children: "Balanced" }),
          /* @__PURE__ */ jsx("span", { children: "Seller's Market" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("p", { className: "mt-3", style: { fontSize: "11px", color: "rgb(156, 163, 175)" }, children: [
      "Based on ",
      sentiment.active,
      " active · ",
      sentiment.sold90,
      " sold in ",
      sentiment.scope,
      " (last 90 days)"
    ] })
  ] });
}
export {
  MarketSentiment as default
};
