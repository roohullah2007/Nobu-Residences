import { jsxs, jsx } from "react/jsx-runtime";
import "react";
const ComparableSales = ({ comparableSales = null }) => {
  const defaultComparableSales = [
    {
      id: 1,
      address: "408-155 Dalhousie Str",
      soldPrice: 1139e3,
      soldDate: "2025-03-15",
      daysOnMarket: 5,
      url: "#",
      latitude: null,
      longitude: null
    },
    {
      id: 2,
      address: "301-200 King Street",
      soldPrice: 125e4,
      soldDate: "2025-03-22",
      daysOnMarket: 12,
      url: "#",
      latitude: null,
      longitude: null
    },
    {
      id: 3,
      address: "505-75 Queens Avenue",
      soldPrice: 899e3,
      soldDate: "2025-03-10",
      daysOnMarket: 8,
      url: "#",
      latitude: null,
      longitude: null
    },
    {
      id: 4,
      address: "1202-180 University St",
      soldPrice: 1575e3,
      soldDate: "2025-03-28",
      daysOnMarket: 15,
      url: "#",
      latitude: null,
      longitude: null
    }
  ];
  const salesData = comparableSales || defaultComparableSales;
  const formatPrice = (price) => {
    if (typeof price === "string" && price.startsWith("$")) {
      return price;
    }
    return "$" + Number(price).toLocaleString();
  };
  const formatDate = (date) => {
    if (!date) return "";
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
      return date;
    }
    const dateObj = new Date(date);
    const day = dateObj.getDate().toString().padStart(2, "0");
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-[1280px] mx-auto font-work-sans my-8", children: [
    /* @__PURE__ */ jsx("div", { className: "mb-5", children: /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-gray-900 mb-0", children: "Comparable Sales" }) }),
    /* @__PURE__ */ jsxs("div", { className: "w-full h-48 md:h-52 my-4 text-center bg-gray-50 rounded-lg overflow-hidden relative flex items-center justify-center", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: "/assets/svgs/map.svg",
          alt: "Comparable Sales Map",
          className: "w-full h-full object-cover rounded-lg shadow-sm",
          onError: (e) => {
            e.target.style.display = "none";
            const fallbackDiv = e.target.parentElement.querySelector(".fallback-svg");
            if (fallbackDiv) fallbackDiv.style.display = "block";
          }
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "fallback-svg w-full h-full", style: { display: "none" }, children: /* @__PURE__ */ jsxs(
        "svg",
        {
          className: "w-full h-full",
          viewBox: "0 0 400 200",
          fill: "none",
          xmlns: "http://www.w3.org/2000/svg",
          children: [
            /* @__PURE__ */ jsx("rect", { width: "400", height: "200", fill: "#f3f4f6" }),
            /* @__PURE__ */ jsx("path", { d: "M50 50 L350 50", stroke: "#d1d5db", strokeWidth: "2" }),
            /* @__PURE__ */ jsx("path", { d: "M50 100 L350 100", stroke: "#d1d5db", strokeWidth: "2" }),
            /* @__PURE__ */ jsx("path", { d: "M50 150 L350 150", stroke: "#d1d5db", strokeWidth: "2" }),
            /* @__PURE__ */ jsx("path", { d: "M100 20 L100 180", stroke: "#d1d5db", strokeWidth: "2" }),
            /* @__PURE__ */ jsx("path", { d: "M200 20 L200 180", stroke: "#d1d5db", strokeWidth: "2" }),
            /* @__PURE__ */ jsx("path", { d: "M300 20 L300 180", stroke: "#d1d5db", strokeWidth: "2" }),
            /* @__PURE__ */ jsx("circle", { cx: "150", cy: "75", r: "6", fill: "#dc2626", stroke: "#ffffff", strokeWidth: "2" }),
            /* @__PURE__ */ jsx("circle", { cx: "250", cy: "125", r: "6", fill: "#dc2626", stroke: "#ffffff", strokeWidth: "2" }),
            /* @__PURE__ */ jsx("circle", { cx: "180", cy: "60", r: "6", fill: "#dc2626", stroke: "#ffffff", strokeWidth: "2" }),
            /* @__PURE__ */ jsx("circle", { cx: "280", cy: "90", r: "6", fill: "#dc2626", stroke: "#ffffff", strokeWidth: "2" }),
            /* @__PURE__ */ jsx("circle", { cx: "200", cy: "100", r: "8", fill: "#2563eb", stroke: "#ffffff", strokeWidth: "3" }),
            /* @__PURE__ */ jsx("text", { x: "200", y: "190", textAnchor: "middle", className: "fill-gray-600 text-xs font-medium", children: "Comparable Sales Area" })
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-6 overflow-x-auto", children: /* @__PURE__ */ jsx("div", { className: "inline-block min-w-full align-middle", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx(
          "th",
          {
            scope: "col",
            className: "px-4 py-3 text-left font-semibold text-gray-700 border-b border-gray-200",
            children: "Address"
          }
        ),
        /* @__PURE__ */ jsx(
          "th",
          {
            scope: "col",
            className: "px-4 py-3 text-left font-semibold text-gray-700 border-b border-gray-200",
            children: "Sold Price"
          }
        ),
        /* @__PURE__ */ jsx(
          "th",
          {
            scope: "col",
            className: "px-4 py-3 text-left font-semibold text-gray-700 border-b border-gray-200",
            children: "Sold Date"
          }
        ),
        /* @__PURE__ */ jsx(
          "th",
          {
            scope: "col",
            className: "px-4 py-3 text-left font-semibold text-gray-700 border-b border-gray-200",
            children: "Days On Market"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: salesData && salesData.length > 0 ? salesData.map((sale, index) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100 last:border-b-0", children: [
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx(
          "a",
          {
            href: sale.url || "#",
            className: "text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200",
            children: sale.address
          }
        ) }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-gray-900", children: formatPrice(sale.soldPrice) }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-gray-900", children: formatDate(sale.soldDate) }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-gray-900", children: sale.daysOnMarket })
      ] }, sale.id || index)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx(
        "td",
        {
          colSpan: "4",
          className: "px-4 py-6 text-center text-gray-500 italic",
          children: "No comparable sales available"
        }
      ) }) })
    ] }) }) })
  ] });
};
export {
  ComparableSales as default
};
