import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState } from "react";
import PropertyCard from "./PropertyCard-BWgqbSLf.js";
import PropertyAiDescription from "./PropertyAiDescription-CDPWzArd.js";
import "@inertiajs/react";
import "axios";
import "./usePropertyAiDescription-C5QLpmY7.js";
const PropertyCardWithAI = ({ property }) => {
  const [showAiModal, setShowAiModal] = useState(false);
  const mlsId = property.ListingKey || property.listingKey || property.MLS_NUMBER || property.mls_number || "";
  const handleAiClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAiModal(true);
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx(PropertyCard, { property }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: handleAiClick,
          className: "absolute bottom-4 right-4 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2 text-sm font-medium",
          title: "Generate AI Description",
          children: [
            /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 10V3L4 14h7v7l9-11h-7z" }) }),
            /* @__PURE__ */ jsx("span", { children: "AI Description" })
          ]
        }
      )
    ] }),
    showAiModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-xl font-bold flex items-center", children: [
          /* @__PURE__ */ jsx("svg", { className: "w-6 h-6 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 10V3L4 14h7v7l9-11h-7z" }) }),
          "AI-Generated Property Information"
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setShowAiModal(false),
            className: "p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200",
            children: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-6 overflow-y-auto max-h-[calc(90vh-80px)]", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-6 pb-4 border-b border-gray-200", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: property.UnparsedAddress || property.address || "Property Address" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-sm text-gray-600", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              "MLS# ",
              mlsId
            ] }),
            /* @__PURE__ */ jsx("span", { children: "•" }),
            /* @__PURE__ */ jsx("span", { children: property.PropertySubType || property.propertyType || "Property" }),
            /* @__PURE__ */ jsx("span", { children: "•" }),
            /* @__PURE__ */ jsxs("span", { className: "font-semibold text-blue-600", children: [
              "$",
              (property.ListPrice || property.price || 0).toLocaleString()
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          PropertyAiDescription,
          {
            mlsId,
            showFaqs: true,
            className: "space-y-6"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500", children: "Powered by Gemini AI" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setShowAiModal(false),
            className: "px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200",
            children: "Close"
          }
        )
      ] })
    ] }) })
  ] });
};
export {
  PropertyCardWithAI as default
};
