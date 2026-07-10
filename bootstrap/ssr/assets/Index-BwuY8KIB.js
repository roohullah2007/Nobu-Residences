import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { A as AdminLayout } from "./AdminLayout-B_5R_DFk.js";
import { P as PrimaryButton } from "./PrimaryButton-DDF1xnxF.js";
const FREQUENCY_LABELS = { 1: "Daily", 7: "Weekly", 30: "Monthly" };
const StatCard = ({ label, value }) => /* @__PURE__ */ jsxs("div", { className: "bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl px-5 py-4", children: [
  /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500", children: label }),
  /* @__PURE__ */ jsx("div", { className: "mt-1 text-2xl font-bold text-gray-900", children: value })
] });
function SavedSearchesIndex({ auth, savedSearches, stats, filters = {} }) {
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const handleSearch = (e) => {
    e.preventDefault();
    router.get(
      route("admin.saved-searches.index"),
      { search: searchTerm },
      { preserveState: true, preserveScroll: true }
    );
  };
  return /* @__PURE__ */ jsxs(
    AdminLayout,
    {
      user: auth.user,
      header: /* @__PURE__ */ jsx("h2", { className: "font-semibold text-xl text-gray-800 leading-tight", children: "Saved Searches & Email Alerts" }),
      children: [
        /* @__PURE__ */ jsx(Head, { title: "Saved Searches" }),
        /* @__PURE__ */ jsx("div", { className: "py-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-4", children: [
            /* @__PURE__ */ jsx(StatCard, { label: "Total Saved Searches", value: stats.total_saved_searches }),
            /* @__PURE__ */ jsx(StatCard, { label: "Alerts Enabled", value: stats.alerts_enabled }),
            /* @__PURE__ */ jsx(StatCard, { label: "Daily / Weekly / Monthly", value: `${stats.frequency_breakdown.daily} / ${stats.frequency_breakdown.weekly} / ${stats.frequency_breakdown.monthly}` }),
            /* @__PURE__ */ jsx(StatCard, { label: "Alerts Sent (7 days)", value: stats.alerts_sent_last_7_days }),
            /* @__PURE__ */ jsx(StatCard, { label: "Alerts Disabled", value: stats.alerts_disabled })
          ] }),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleSearch, className: "flex gap-3", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: searchTerm,
                onChange: (e) => setSearchTerm(e.target.value),
                placeholder: "Search by name, user, or email...",
                className: "flex-1 max-w-md rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              }
            ),
            /* @__PURE__ */ jsx(PrimaryButton, { type: "submit", children: "Search" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl overflow-hidden", children: [
            /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [
              /* @__PURE__ */ jsx("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxs("tr", { children: [
                /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "User" }),
                /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Search" }),
                /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Criteria" }),
                /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Alerts" }),
                /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Frequency" }),
                /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Last Alert" }),
                /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Sent" })
              ] }) }),
              /* @__PURE__ */ jsxs("tbody", { className: "divide-y divide-gray-200", children: [
                savedSearches.data.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 7, className: "px-4 py-8 text-center text-sm text-gray-500", children: "No saved searches yet." }) }),
                savedSearches.data.map((search) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50", children: [
                  /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 text-sm", children: [
                    /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-900", children: search.user?.name || "—" }),
                    /* @__PURE__ */ jsx("div", { className: "text-gray-500", children: search.user?.email })
                  ] }),
                  /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm font-medium text-gray-900", children: search.name }),
                  /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-gray-600 max-w-xs truncate", title: search.formatted_criteria, children: search.formatted_criteria }),
                  /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm", children: /* @__PURE__ */ jsx("span", { className: `inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${search.email_alerts ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`, children: search.email_alerts ? "On" : "Off" }) }),
                  /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-gray-600", children: FREQUENCY_LABELS[search.frequency] || "—" }),
                  /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-gray-600", children: search.last_alert_sent || "Never" }),
                  /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-gray-600", children: search.total_alerts_sent ?? 0 })
                ] }, search.id))
              ] })
            ] }) }),
            savedSearches.links && savedSearches.links.length > 3 && /* @__PURE__ */ jsx("div", { className: "px-4 py-3 border-t border-gray-200 flex flex-wrap gap-1", children: savedSearches.links.map((link, i) => /* @__PURE__ */ jsx(
              "button",
              {
                disabled: !link.url,
                onClick: () => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true }),
                dangerouslySetInnerHTML: { __html: link.label },
                className: `px-3 py-1.5 rounded text-sm ${link.active ? "bg-gray-900 text-white" : link.url ? "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200" : "text-gray-400"}`
              },
              i
            )) })
          ] })
        ] }) })
      ]
    }
  );
}
export {
  SavedSearchesIndex as default
};
