import { jsx, jsxs } from "react/jsx-runtime";
import { A as AdminLayout } from "./AdminLayout-l5p_UGn9.js";
import "@inertiajs/react";
import "react";
function Websites({ title, websites }) {
  return /* @__PURE__ */ jsx(AdminLayout, { title, children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Website Management" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-600", children: "Manage and configure your real estate websites" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
            children: "Duplicate Website"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
            children: "Add Website"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-white shadow rounded-lg border border-gray-200", children: /* @__PURE__ */ jsx("div", { className: "px-4 py-5 sm:p-6", children: /* @__PURE__ */ jsx("div", { className: "overflow-hidden", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Website" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Properties" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Last Updated" }),
        /* @__PURE__ */ jsx("th", { className: "relative px-6 py-3", children: /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Actions" }) })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-200", children: /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50", children: [
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
          /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 h-8 w-8", children: /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "h-4 w-4 rounded bg-indigo-600" }) }) }),
          /* @__PURE__ */ jsxs("div", { className: "ml-4", children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-gray-900", children: "Nobu Residences" }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500", children: "Default Website" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx("span", { className: "inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800", children: "Active" }) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: "0 properties" }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: "Today" }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end space-x-2", children: [
          /* @__PURE__ */ jsx("button", { className: "text-indigo-600 hover:text-indigo-900 text-sm font-medium", children: "Edit" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-300", children: "|" }),
          /* @__PURE__ */ jsx("button", { className: "text-indigo-600 hover:text-indigo-900 text-sm font-medium", children: "Settings" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-300", children: "|" }),
          /* @__PURE__ */ jsx("button", { className: "text-indigo-600 hover:text-indigo-900 text-sm font-medium", children: "View" })
        ] }) })
      ] }) })
    ] }) }) }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-5 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsx("div", { className: "bg-white overflow-hidden shadow rounded-lg border border-gray-200", children: /* @__PURE__ */ jsx("div", { className: "p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
        /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx("div", { className: "w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "w-4 h-4 rounded bg-indigo-600" }) }) }),
        /* @__PURE__ */ jsx("div", { className: "ml-5 w-0 flex-1", children: /* @__PURE__ */ jsxs("dl", { children: [
          /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500 truncate", children: "Total Websites" }),
          /* @__PURE__ */ jsx("dd", { children: /* @__PURE__ */ jsx("div", { className: "text-lg font-medium text-gray-900", children: "1" }) })
        ] }) })
      ] }) }) }),
      /* @__PURE__ */ jsx("div", { className: "bg-white overflow-hidden shadow rounded-lg border border-gray-200", children: /* @__PURE__ */ jsx("div", { className: "p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
        /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx("div", { className: "w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "w-4 h-4 rounded bg-green-600" }) }) }),
        /* @__PURE__ */ jsx("div", { className: "ml-5 w-0 flex-1", children: /* @__PURE__ */ jsxs("dl", { children: [
          /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500 truncate", children: "Active Sites" }),
          /* @__PURE__ */ jsx("dd", { children: /* @__PURE__ */ jsx("div", { className: "text-lg font-medium text-gray-900", children: "1" }) })
        ] }) })
      ] }) }) }),
      /* @__PURE__ */ jsx("div", { className: "bg-white overflow-hidden shadow rounded-lg border border-gray-200", children: /* @__PURE__ */ jsx("div", { className: "p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
        /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx("div", { className: "w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "w-4 h-4 rounded bg-yellow-600" }) }) }),
        /* @__PURE__ */ jsx("div", { className: "ml-5 w-0 flex-1", children: /* @__PURE__ */ jsxs("dl", { children: [
          /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500 truncate", children: "In Development" }),
          /* @__PURE__ */ jsx("dd", { children: /* @__PURE__ */ jsx("div", { className: "text-lg font-medium text-gray-900", children: "0" }) })
        ] }) })
      ] }) }) })
    ] })
  ] }) });
}
export {
  Websites as default
};
