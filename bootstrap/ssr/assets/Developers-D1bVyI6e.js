import { jsxs, jsx } from "react/jsx-runtime";
import { Head } from "@inertiajs/react";
import { A as AdminLayout } from "./AdminLayout-l5p_UGn9.js";
import { P as PrimaryButton } from "./PrimaryButton-DDF1xnxF.js";
import "react";
function Developers({ auth, developers, title }) {
  return /* @__PURE__ */ jsxs(AdminLayout, { title, children: [
    /* @__PURE__ */ jsx(Head, { title }),
    /* @__PURE__ */ jsxs("div", { className: "sm:flex sm:items-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "sm:flex-auto", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-base font-semibold leading-6 text-gray-900", children: "Developers" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-700", children: "Manage real estate developers, their projects, and company information." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 sm:ml-16 sm:mt-0 sm:flex-none", children: /* @__PURE__ */ jsx(PrimaryButton, { children: "Add New Developer" }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-8", children: /* @__PURE__ */ jsx("div", { className: "bg-white shadow rounded-lg", children: /* @__PURE__ */ jsxs("div", { className: "px-6 py-8 text-center", children: [
      /* @__PURE__ */ jsx(
        "svg",
        {
          className: "mx-auto h-12 w-12 text-gray-400",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          "aria-hidden": "true",
          children: /* @__PURE__ */ jsx(
            "path",
            {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            }
          )
        }
      ),
      /* @__PURE__ */ jsx("h3", { className: "mt-2 text-sm font-semibold text-gray-900", children: "No developers" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500", children: "Get started by adding a real estate developer." }),
      /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(PrimaryButton, { children: "Add Developer" }) })
    ] }) }) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsx("div", { className: "bg-white shadow rounded-lg p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
        /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx("div", { className: "h-8 w-8 bg-purple-100 rounded-md flex items-center justify-center", children: /* @__PURE__ */ jsx("svg", { className: "h-5 w-5 text-purple-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" }) }) }) }),
        /* @__PURE__ */ jsx("div", { className: "ml-5 w-0 flex-1", children: /* @__PURE__ */ jsxs("dl", { children: [
          /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500 truncate", children: "Total Developers" }),
          /* @__PURE__ */ jsx("dd", { className: "text-lg font-medium text-gray-900", children: "0" })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "bg-white shadow rounded-lg p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
        /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx("div", { className: "h-8 w-8 bg-blue-100 rounded-md flex items-center justify-center", children: /* @__PURE__ */ jsx("svg", { className: "h-5 w-5 text-blue-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }) }) }) }),
        /* @__PURE__ */ jsx("div", { className: "ml-5 w-0 flex-1", children: /* @__PURE__ */ jsxs("dl", { children: [
          /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500 truncate", children: "Active Projects" }),
          /* @__PURE__ */ jsx("dd", { className: "text-lg font-medium text-gray-900", children: "0" })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "bg-white shadow rounded-lg p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
        /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx("div", { className: "h-8 w-8 bg-green-100 rounded-md flex items-center justify-center", children: /* @__PURE__ */ jsx("svg", { className: "h-5 w-5 text-green-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }) }),
        /* @__PURE__ */ jsx("div", { className: "ml-5 w-0 flex-1", children: /* @__PURE__ */ jsxs("dl", { children: [
          /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500 truncate", children: "Completed Projects" }),
          /* @__PURE__ */ jsx("dd", { className: "text-lg font-medium text-gray-900", children: "0" })
        ] }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-8 bg-purple-50 border border-purple-200 rounded-lg p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex", children: [
      /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx("svg", { className: "h-5 w-5 text-purple-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }),
      /* @__PURE__ */ jsxs("div", { className: "ml-3", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-purple-800", children: "Developer Management Coming Soon" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 text-sm text-purple-700", children: [
          /* @__PURE__ */ jsx("p", { children: "Full developer management functionality will be added here, including:" }),
          /* @__PURE__ */ jsxs("ul", { className: "list-disc list-inside mt-2 space-y-1", children: [
            /* @__PURE__ */ jsx("li", { children: "Developer company profiles and contact information" }),
            /* @__PURE__ */ jsx("li", { children: "Project portfolio and development history" }),
            /* @__PURE__ */ jsx("li", { children: "Integration with building and property data" }),
            /* @__PURE__ */ jsx("li", { children: "Performance metrics and ratings" }),
            /* @__PURE__ */ jsx("li", { children: "Document management and certifications" })
          ] })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  Developers as default
};
