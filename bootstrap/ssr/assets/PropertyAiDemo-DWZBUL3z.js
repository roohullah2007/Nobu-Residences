import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import MainLayout from "./MainLayout-BFh5qQm3.js";
import PropertyAiDescription from "./PropertyAiDescription-CDPWzArd.js";
import "./Footer-BjazYOa4.js";
import "@inertiajs/react";
import "./ContactAgentModal-Bc8CTpfm.js";
import "./Navbar-BOM1Kycz.js";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import "./LoginModal-C-0W-anf.js";
import "./GoogleLoginButton-wrwag0eM.js";
import "./PropertyDetailIcons-3huqvWqW.js";
import "@headlessui/react";
import "./usePropertyAiDescription-C5QLpmY7.js";
import "axios";
const PropertyAiDemo = () => {
  const [mlsId, setMlsId] = useState("");
  const [submittedMlsId, setSubmittedMlsId] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (mlsId.trim()) {
      setSubmittedMlsId(mlsId.trim());
    }
  };
  return /* @__PURE__ */ jsx(MainLayout, { children: /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto px-4 py-8", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-xl overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-6", children: [
      /* @__PURE__ */ jsxs("h1", { className: "text-3xl font-bold mb-2 flex items-center", children: [
        /* @__PURE__ */ jsx("svg", { className: "w-8 h-8 mr-3", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 10V3L4 14h7v7l9-11h-7z" }) }),
        "Property AI Description Generator"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-blue-100", children: "Generate AI-powered property descriptions and FAQs using Gemini AI" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-8", children: [
      /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, className: "mb-8", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "mlsId", className: "block text-sm font-medium text-gray-700 mb-2", children: "Enter MLS ID or Property Key" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              id: "mlsId",
              value: mlsId,
              onChange: (e) => setMlsId(e.target.value),
              placeholder: "e.g., C9425648, W9425649",
              className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-end", children: /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            className: "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium",
            children: "Generate"
          }
        ) })
      ] }) }),
      submittedMlsId && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600", children: "Generating for MLS ID: " }),
            /* @__PURE__ */ jsx("span", { className: "font-semibold text-gray-900", children: submittedMlsId })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                setSubmittedMlsId("");
                setMlsId("");
              },
              className: "text-sm text-gray-500 hover:text-gray-700",
              children: "Clear"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsx(
          PropertyAiDescription,
          {
            mlsId: submittedMlsId,
            showFaqs: true,
            className: "space-y-6"
          }
        )
      ] }),
      !submittedMlsId && /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-blue-900 mb-3", children: "How to Use" }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-blue-800", children: [
          /* @__PURE__ */ jsxs("li", { className: "flex items-start", children: [
            /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 mr-2 mt-0.5 text-blue-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
            /* @__PURE__ */ jsx("span", { children: "Enter a valid MLS ID or property listing key" })
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-start", children: [
            /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 mr-2 mt-0.5 text-blue-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
            /* @__PURE__ */ jsx("span", { children: 'Click "Generate" to create AI-powered descriptions' })
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-start", children: [
            /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 mr-2 mt-0.5 text-blue-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
            /* @__PURE__ */ jsx("span", { children: "The system will generate both overview and detailed descriptions" })
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-start", children: [
            /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 mr-2 mt-0.5 text-blue-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
            /* @__PURE__ */ jsx("span", { children: "You can also generate FAQs for the property" })
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-start", children: [
            /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 mr-2 mt-0.5 text-blue-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
            /* @__PURE__ */ jsx("span", { children: "Generated content is cached for faster retrieval" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-8 grid grid-cols-1 md:grid-cols-3 gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100", children: [
          /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 10V3L4 14h7v7l9-11h-7z" }) }) }),
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "AI-Powered" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: "Uses Google's Gemini AI to generate compelling, SEO-friendly descriptions" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-100", children: [
          /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }),
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "Fast & Cached" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: "Descriptions are cached for instant retrieval on subsequent views" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100", children: [
          /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }),
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "FAQ Generation" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: "Automatically generates relevant FAQs to answer buyer questions" })
        ] })
      ] })
    ] })
  ] }) }) });
};
export {
  PropertyAiDemo as default
};
