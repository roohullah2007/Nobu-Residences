import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { u as usePropertyAiDescription } from "./usePropertyAiDescription-C5QLpmY7.js";
import "axios";
const PropertyAiDescription = ({ mlsId, showFaqs = false, className = "" }) => {
  const {
    loading,
    description,
    faqs,
    error,
    generateDescription,
    generateFaqs,
    getAllContent
  } = usePropertyAiDescription();
  const [showDetails, setShowDetails] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  useEffect(() => {
    if (mlsId && !isGenerated) {
      getAllContent(mlsId);
    }
  }, [mlsId]);
  const handleGenerateDescription = async () => {
    if (mlsId) {
      const result = await generateDescription(mlsId, !description);
      if (result) {
        setIsGenerated(true);
        setShowDetails(true);
      }
    }
  };
  const handleGenerateFaqs = async () => {
    if (mlsId) {
      const result = await generateFaqs(mlsId, !faqs);
      if (result) {
        setIsGenerated(true);
      }
    }
  };
  if (!mlsId) {
    return null;
  }
  return /* @__PURE__ */ jsxs("div", { className: `property-ai-description ${className}`, children: [
    !description && !loading && /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: handleGenerateDescription,
        className: "inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200",
        children: [
          /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 10V3L4 14h7v7l9-11h-7z" }) }),
          "Generate AI Description"
        ]
      }
    ),
    loading && /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" }),
      /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600", children: "Generating AI content..." })
    ] }) }),
    error && /* @__PURE__ */ jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
      /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
      /* @__PURE__ */ jsx("span", { children: error })
    ] }) }),
    description && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-3", children: [
          /* @__PURE__ */ jsxs("h3", { className: "text-lg font-semibold text-gray-900 flex items-center", children: [
            /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 mr-2 text-blue-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
            "AI-Generated Overview"
          ] }),
          description.cached && /* @__PURE__ */ jsx("span", { className: "text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full", children: "Cached" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-700 leading-relaxed", children: description.overview })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg border border-gray-200 overflow-hidden", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setShowDetails(!showDetails),
            className: "w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200",
            children: [
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Detailed Description" }),
              /* @__PURE__ */ jsx(
                "svg",
                {
                  className: `w-5 h-5 text-gray-400 transform transition-transform duration-200 ${showDetails ? "rotate-180" : ""}`,
                  fill: "none",
                  stroke: "currentColor",
                  viewBox: "0 0 24 24",
                  children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" })
                }
              )
            ]
          }
        ),
        showDetails && /* @__PURE__ */ jsx("div", { className: "px-6 pb-6 pt-2", children: /* @__PURE__ */ jsx("p", { className: "text-gray-700 leading-relaxed whitespace-pre-line", children: description.detailed }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleGenerateDescription,
            className: "inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm",
            children: [
              /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 mr-1.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" }) }),
              "Regenerate"
            ]
          }
        ),
        description.generated_at && /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-500", children: [
          "Generated: ",
          new Date(description.generated_at).toLocaleDateString()
        ] })
      ] })
    ] }),
    showFaqs && /* @__PURE__ */ jsxs("div", { className: "mt-6", children: [
      !faqs && !loading && /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: handleGenerateFaqs,
          className: "inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200",
          children: [
            /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
            "Generate FAQs"
          ]
        }
      ),
      faqs && faqs.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg border border-gray-200 overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "px-6 py-4 bg-gray-50 border-b border-gray-200", children: /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Frequently Asked Questions" }) }),
        /* @__PURE__ */ jsx("div", { className: "divide-y divide-gray-200", children: faqs.map((faq, index) => /* @__PURE__ */ jsxs("details", { className: "group", children: [
          /* @__PURE__ */ jsxs("summary", { className: "px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors duration-200", children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-900 pr-4", children: faq.question }),
            /* @__PURE__ */ jsx(
              "svg",
              {
                className: "w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform duration-200",
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
                children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" })
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "px-6 pb-4 pt-2", children: /* @__PURE__ */ jsx("p", { className: "text-gray-700 leading-relaxed", children: faq.answer }) })
        ] }, index)) })
      ] })
    ] })
  ] });
};
export {
  PropertyAiDescription as default
};
