import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { A as AdminLayout } from "./AdminLayout-CfYoZrH6.js";
import { usePage, useForm, Link, router } from "@inertiajs/react";
function MLSIndex({ properties, stats, recentSyncs, cities, filters }) {
  const { flash } = usePage().props;
  const [syncingFull, setSyncingFull] = useState(false);
  const [syncingIncremental, setSyncingIncremental] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncLimit, setSyncLimit] = useState(2500);
  const { data, setData, post, processing } = useForm({
    mls_id: ""
  });
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [statusFilter, setStatusFilter] = useState(filters.status || "");
  const [cityFilter, setCityFilter] = useState(filters.city || "");
  const handleFullSync = () => {
    setSyncingFull(true);
    router.post(route("admin.mls.sync-full"), { limit: syncLimit }, {
      onFinish: () => {
        setSyncingFull(false);
        setShowSyncModal(false);
      }
    });
  };
  const handleIncrementalSync = () => {
    setSyncingIncremental(true);
    router.post(route("admin.mls.sync-incremental"), {}, {
      onFinish: () => setSyncingIncremental(false)
    });
  };
  const handleSyncProperty = (e) => {
    e.preventDefault();
    post(route("admin.mls.sync-property"), {
      preserveScroll: true,
      onSuccess: () => setData("mls_id", "")
    });
  };
  const handleSearch = () => {
    router.get(route("admin.mls.index"), {
      search: searchTerm,
      status: statusFilter,
      city: cityFilter,
      per_page: filters.per_page
    }, {
      preserveState: true,
      preserveScroll: true
    });
  };
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setCityFilter("");
    router.get(route("admin.mls.index"));
  };
  const handleBulkDelete = () => {
    if (selectedProperties.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedProperties.length} properties?`)) {
      router.post(route("admin.mls.bulk-delete"), {
        ids: selectedProperties
      }, {
        onSuccess: () => setSelectedProperties([])
      });
    }
  };
  const toggleSelectAll = () => {
    if (selectedProperties.length === properties.data.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(properties.data.map((p) => p.id));
    }
  };
  const statCards = [
    { title: "Total Properties", value: stats.total_properties || 0 },
    { title: "Active", value: stats.active_properties || 0 },
    { title: "For Sale", value: stats.for_sale || 0 },
    { title: "For Rent", value: stats.for_rent || 0 }
  ];
  return /* @__PURE__ */ jsxs(AdminLayout, { title: "MLS Properties", children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      flash?.success && /* @__PURE__ */ jsx("div", { className: "bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] px-4 py-3 rounded-lg text-sm", children: flash.success }),
      flash?.error && /* @__PURE__ */ jsx("div", { className: "bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] px-4 py-3 rounded-lg text-sm", children: flash.error }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: statCards.map((stat, index) => /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg border border-[#e2e8f0] p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b]", children: stat.title }),
        /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold text-[#0f172a] mt-1", children: stat.value.toLocaleString() })
      ] }, index)) }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg border border-[#e2e8f0]", children: [
        /* @__PURE__ */ jsx("div", { className: "px-5 py-4 border-b border-[#e2e8f0]", children: /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold text-[#0f172a]", children: "Sync Controls" }) }),
        /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setShowSyncModal(true),
                  disabled: syncingFull,
                  className: "w-full px-4 py-2.5 bg-[#0f172a] text-white rounded-lg hover:bg-[#1e293b] disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors",
                  children: syncingFull ? "Syncing..." : "Full Sync"
                }
              ),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-[#64748b] mt-2", children: [
                "Last: ",
                stats.last_sync ? new Date(stats.last_sync).toLocaleString() : "Never"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: handleIncrementalSync,
                  disabled: syncingIncremental,
                  className: "w-full px-4 py-2.5 bg-[#16a34a] text-white rounded-lg hover:bg-[#15803d] disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors",
                  children: syncingIncremental ? "Syncing..." : "Incremental Sync"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-[#64748b] mt-2", children: "Only changed properties" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("form", { onSubmit: handleSyncProperty, className: "flex gap-2", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: data.mls_id,
                    onChange: (e) => setData("mls_id", e.target.value),
                    placeholder: "MLS ID",
                    className: "flex-1 px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:border-transparent"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "submit",
                    disabled: processing || !data.mls_id,
                    className: "px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors",
                    children: "Sync"
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-[#64748b] mt-2", children: "Sync specific property" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-5 p-4 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-[#0f172a] mb-2", children: "Auto-Sync Schedule" }),
            /* @__PURE__ */ jsxs("div", { className: "text-xs text-[#64748b] space-y-1", children: [
              /* @__PURE__ */ jsx("p", { children: "Full Sync: Every 4 hours (2AM, 6AM, 10AM, 2PM, 6PM, 10PM)" }),
              /* @__PURE__ */ jsx("p", { children: "Incremental: Every 2 hours" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg border border-[#e2e8f0]", children: [
        /* @__PURE__ */ jsx("div", { className: "px-5 py-4 border-b border-[#e2e8f0]", children: /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold text-[#0f172a]", children: "Filters" }) }),
        /* @__PURE__ */ jsx("div", { className: "p-5", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: searchTerm,
              onChange: (e) => setSearchTerm(e.target.value),
              placeholder: "Search address, MLS ID...",
              className: "px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:border-transparent"
            }
          ),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: statusFilter,
              onChange: (e) => setStatusFilter(e.target.value),
              className: "px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:border-transparent bg-white",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "All Statuses" }),
                /* @__PURE__ */ jsx("option", { value: "active", children: "Active" }),
                /* @__PURE__ */ jsx("option", { value: "sold", children: "Sold" }),
                /* @__PURE__ */ jsx("option", { value: "leased", children: "Leased" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: cityFilter,
              onChange: (e) => setCityFilter(e.target.value),
              className: "px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:border-transparent bg-white",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "All Cities" }),
                cities.map((city) => /* @__PURE__ */ jsx("option", { value: city, children: city }, city))
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleSearch,
                className: "flex-1 px-4 py-2 bg-[#0f172a] text-white rounded-lg hover:bg-[#1e293b] text-sm font-medium transition-colors",
                children: "Apply"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleClearFilters,
                className: "px-4 py-2 border border-[#e2e8f0] text-[#64748b] rounded-lg hover:bg-[#f8fafc] text-sm font-medium transition-colors",
                children: "Clear"
              }
            )
          ] })
        ] }) })
      ] }),
      selectedProperties.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-[#eff6ff] border border-[#bfdbfe] rounded-lg px-5 py-3 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-[#1e40af]", children: [
          selectedProperties.length,
          " properties selected"
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleBulkDelete,
            className: "px-3 py-1.5 bg-[#dc2626] text-white rounded-lg hover:bg-[#b91c1c] text-sm font-medium transition-colors",
            children: "Delete Selected"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg border border-[#e2e8f0] overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-[#f8fafc] border-b border-[#e2e8f0]", children: [
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: selectedProperties.length === properties.data.length && properties.data.length > 0,
                onChange: toggleSelectAll,
                className: "rounded border-[#cbd5e1] text-[#0f172a] focus:ring-[#0f172a]"
              }
            ) }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase", children: "Image" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase", children: "Property" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase", children: "Details" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase", children: "Price" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase", children: "Status" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase", children: "Images" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase", children: "Synced" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase", children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-[#e2e8f0]", children: properties.data.map((property) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-[#f8fafc] transition-colors", children: [
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: selectedProperties.includes(property.id),
                onChange: (e) => {
                  if (e.target.checked) {
                    setSelectedProperties([...selectedProperties, property.id]);
                  } else {
                    setSelectedProperties(selectedProperties.filter((id) => id !== property.id));
                  }
                },
                className: "rounded border-[#cbd5e1] text-[#0f172a] focus:ring-[#0f172a]"
              }
            ) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: property.image_urls && property.image_urls.length > 0 ? /* @__PURE__ */ jsx(
              "img",
              {
                src: property.image_urls[0],
                alt: property.address,
                className: "w-12 h-12 object-cover rounded-lg"
              }
            ) : /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-[#f1f5f9] rounded-lg flex items-center justify-center", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 text-[#94a3b8]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" }) }) }) }),
            /* @__PURE__ */ jsxs("td", { className: "px-4 py-3", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-[#0f172a]", children: property.address }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-[#64748b]", children: property.city }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-[#94a3b8]", children: [
                "MLS: ",
                property.mls_number
              ] })
            ] }),
            /* @__PURE__ */ jsxs("td", { className: "px-4 py-3", children: [
              /* @__PURE__ */ jsxs("p", { className: "text-sm text-[#0f172a]", children: [
                property.bedrooms,
                " bed / ",
                property.bathrooms,
                " bath"
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-[#64748b]", children: property.property_sub_type })
            ] }),
            /* @__PURE__ */ jsxs("td", { className: "px-4 py-3", children: [
              /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium text-[#0f172a]", children: [
                "$",
                property.price ? property.price.toLocaleString() : "N/A"
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-[#64748b]", children: property.property_type })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx("span", { className: `inline-flex px-2 py-1 text-xs font-medium rounded-full ${property.status === "active" ? "bg-[#f0fdf4] text-[#16a34a]" : property.status === "sold" ? "bg-[#eff6ff] text-[#2563eb]" : property.status === "leased" ? "bg-[#faf5ff] text-[#9333ea]" : "bg-[#f1f5f9] text-[#64748b]"}`, children: property.status }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-[#64748b]", children: property.image_urls ? property.image_urls.length : 0 }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-xs text-[#64748b]", children: property.last_synced_at ? new Date(property.last_synced_at).toLocaleDateString() : "Never" }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(
                Link,
                {
                  href: route("admin.mls.show", property.id),
                  className: "text-sm text-[#0f172a] hover:text-[#3b82f6] font-medium",
                  children: "View"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => {
                    if (confirm("Delete this property?")) {
                      router.delete(route("admin.mls.destroy", property.id));
                    }
                  },
                  className: "text-sm text-[#dc2626] hover:text-[#b91c1c] font-medium",
                  children: "Delete"
                }
              )
            ] }) })
          ] }, property.id)) })
        ] }) }),
        properties.links && properties.links.length > 3 && /* @__PURE__ */ jsxs("div", { className: "px-5 py-4 border-t border-[#e2e8f0] flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-[#64748b]", children: [
            "Showing ",
            properties.from,
            " to ",
            properties.to,
            " of ",
            properties.total
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: properties.links.map((link, index) => /* @__PURE__ */ jsx(
            Link,
            {
              href: link.url || "#",
              preserveState: true,
              preserveScroll: true,
              className: `px-3 py-1.5 text-sm rounded-lg ${link.active ? "bg-[#0f172a] text-white" : "text-[#64748b] hover:bg-[#f8fafc]"} ${!link.url ? "opacity-50 cursor-not-allowed" : ""}`,
              dangerouslySetInnerHTML: { __html: link.label }
            },
            index
          )) })
        ] })
      ] })
    ] }),
    showSyncModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg p-6 max-w-md w-full mx-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-[#0f172a] mb-4", children: "Full Sync Configuration" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-5", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-[#0f172a] mb-2", children: "Number of properties to sync" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            value: syncLimit,
            onChange: (e) => setSyncLimit(parseInt(e.target.value)),
            min: "100",
            max: "10000",
            step: "100",
            className: "w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:border-transparent"
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-[#64748b] mt-2", children: "Recommended: 2500 properties" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleFullSync,
            disabled: syncingFull,
            className: "flex-1 px-4 py-2 bg-[#0f172a] text-white rounded-lg hover:bg-[#1e293b] disabled:opacity-50 text-sm font-medium transition-colors",
            children: syncingFull ? "Starting..." : "Start Sync"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setShowSyncModal(false),
            className: "flex-1 px-4 py-2 border border-[#e2e8f0] text-[#64748b] rounded-lg hover:bg-[#f8fafc] text-sm font-medium transition-colors",
            children: "Cancel"
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  MLSIndex as default
};
