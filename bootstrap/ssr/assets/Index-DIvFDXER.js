import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { A as AdminLayout } from "./AdminLayout-DaZm4wHn.js";
import { Head, router } from "@inertiajs/react";
function TourRequestsIndex({ auth, tourRequests: initialTourRequests, filters }) {
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState(filters?.status || "all");
  const [typeFilter, setTypeFilter] = useState(filters?.property_type || "all");
  const handleFilterChange = (filterType, value) => {
    setLoading(true);
    const newFilters = {
      status: filterType === "status" ? value : statusFilter,
      property_type: filterType === "type" ? value : typeFilter,
      page: 1
    };
    if (filterType === "status") setStatusFilter(value);
    if (filterType === "type") setTypeFilter(value);
    router.get(route("admin.tour-requests.index"), newFilters, {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => setLoading(false)
    });
  };
  const handlePageChange = (page) => {
    setLoading(true);
    router.get(route("admin.tour-requests.index"), {
      status: statusFilter,
      property_type: typeFilter,
      page
    }, {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => setLoading(false)
    });
  };
  const updateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`/api/tour-requests/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error("Failed to update status");
      const result = await response.json();
      if (result.success) {
        router.reload({ only: ["tourRequests"] });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };
  const getStatusBadge = (status) => {
    const colors = {
      pending: "bg-[#fefce8] text-[#ca8a04]",
      contacted: "bg-[#eff6ff] text-[#1e40af]",
      completed: "bg-[#f0fdf4] text-[#16a34a]",
      cancelled: "bg-[#fef2f2] text-[#dc2626]"
    };
    return colors[status] || "bg-[#f1f5f9] text-[#64748b]";
  };
  const getPropertyTypeBadge = (type) => {
    const colors = {
      property: "bg-[#f5f3ff] text-[#7c3aed]",
      building: "bg-[#ecfeff] text-[#0891b2]"
    };
    return colors[type] || "bg-[#f1f5f9] text-[#64748b]";
  };
  const tourRequests = initialTourRequests?.data || [];
  const currentPage = initialTourRequests?.current_page || 1;
  const totalPages = initialTourRequests?.last_page || 1;
  const totalRequests = initialTourRequests?.total || tourRequests.length;
  const pendingRequests = tourRequests.filter((r) => r.status === "pending").length;
  return /* @__PURE__ */ jsxs(AdminLayout, { title: "Tour Requests", children: [
    /* @__PURE__ */ jsx(Head, { title: "Tour Requests" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold text-[#0f172a]", children: "Tour Requests" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b] mt-1", children: "Manage property and building tour submissions" })
        ] }),
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: route("admin.tour-requests.export", {
              status: statusFilter !== "all" ? statusFilter : void 0,
              property_type: typeFilter !== "all" ? typeFilter : void 0
            }),
            className: "inline-flex items-center px-4 py-2.5 bg-[#0f172a] text-white text-sm font-medium rounded-lg hover:bg-[#1e293b] transition-colors",
            children: [
              /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }) }),
              "Export CSV"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg border border-[#e2e8f0] p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#64748b]", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" }) }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold text-[#0f172a]", children: totalRequests }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b]", children: "Total Requests" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg border border-[#e2e8f0] p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-[#fefce8] flex items-center justify-center text-[#ca8a04]", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold text-[#0f172a]", children: pendingRequests }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b]", children: "Pending" })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg border border-[#e2e8f0] p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-[#64748b] mb-1.5", children: "Status" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: statusFilter,
              onChange: (e) => handleFilterChange("status", e.target.value),
              className: "px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all",
              children: [
                /* @__PURE__ */ jsx("option", { value: "all", children: "All Status" }),
                /* @__PURE__ */ jsx("option", { value: "pending", children: "Pending" }),
                /* @__PURE__ */ jsx("option", { value: "contacted", children: "Contacted" }),
                /* @__PURE__ */ jsx("option", { value: "completed", children: "Completed" }),
                /* @__PURE__ */ jsx("option", { value: "cancelled", children: "Cancelled" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-[#64748b] mb-1.5", children: "Type" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: typeFilter,
              onChange: (e) => handleFilterChange("type", e.target.value),
              className: "px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all",
              children: [
                /* @__PURE__ */ jsx("option", { value: "all", children: "All Types" }),
                /* @__PURE__ */ jsx("option", { value: "property", children: "Properties" }),
                /* @__PURE__ */ jsx("option", { value: "building", children: "Buildings" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-end", children: /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => router.reload(),
            className: "px-4 py-2 text-sm font-medium text-[#64748b] bg-[#f1f5f9] rounded-lg hover:bg-[#e2e8f0] transition-colors",
            children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" }) })
          }
        ) })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg border border-[#e2e8f0]", children: [
        loading ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
          /* @__PURE__ */ jsx("div", { className: "inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f172a]" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-[#64748b]", children: "Loading..." })
        ] }) : tourRequests.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
          /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-lg bg-[#f1f5f9] flex items-center justify-center mx-auto mb-3", children: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6 text-[#94a3b8]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" }) }) }),
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-[#0f172a]", children: "No tour requests" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-[#94a3b8] mt-1", children: "No submissions found" })
        ] }) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-[#e2e8f0]", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-[#f8fafc]", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Date/Time" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Contact" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Property" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Type" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Status" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "bg-white divide-y divide-[#e2e8f0]", children: tourRequests.map((request) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-[#f8fafc] transition-colors", children: [
            /* @__PURE__ */ jsx("td", { className: "px-4 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-[#0f172a]", children: request.selected_date || "Not specified" }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-[#64748b]", children: request.selected_time || "Any time" }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-[#94a3b8]", children: new Date(request.created_at).toLocaleDateString() })
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-[#0f172a]", children: request.full_name }),
              /* @__PURE__ */ jsx("a", { href: `mailto:${request.email}`, className: "text-xs text-[#3b82f6] hover:underline", children: request.email }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-[#64748b]", children: /* @__PURE__ */ jsx("a", { href: `tel:${request.phone}`, className: "hover:underline", children: request.phone }) })
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-xs", children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm text-[#0f172a] truncate", children: request.property_address || "Not specified" }),
              request.property_id && /* @__PURE__ */ jsxs("div", { className: "text-xs text-[#94a3b8]", children: [
                "ID: ",
                request.property_id
              ] })
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPropertyTypeBadge(request.property_type)}`, children: request.property_type || "Unknown" }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(request.status)}`, children: request.status }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxs(
              "select",
              {
                value: request.status,
                onChange: (e) => updateStatus(request.id, e.target.value),
                className: "px-2 py-1.5 text-xs border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "pending", children: "Pending" }),
                  /* @__PURE__ */ jsx("option", { value: "contacted", children: "Contacted" }),
                  /* @__PURE__ */ jsx("option", { value: "completed", children: "Completed" }),
                  /* @__PURE__ */ jsx("option", { value: "cancelled", children: "Cancelled" })
                ]
              }
            ) })
          ] }, request.id)) })
        ] }) }),
        totalPages > 1 && /* @__PURE__ */ jsxs("div", { className: "px-4 py-4 border-t border-[#e2e8f0] flex items-center justify-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handlePageChange(Math.max(1, currentPage - 1)),
              disabled: currentPage === 1,
              className: "px-3 py-1.5 text-sm font-medium text-[#64748b] bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f1f5f9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              children: "Previous"
            }
          ),
          /* @__PURE__ */ jsxs("span", { className: "px-3 py-1.5 text-sm text-[#64748b]", children: [
            "Page ",
            currentPage,
            " of ",
            totalPages
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handlePageChange(Math.min(totalPages, currentPage + 1)),
              disabled: currentPage === totalPages,
              className: "px-3 py-1.5 text-sm font-medium text-[#64748b] bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f1f5f9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              children: "Next"
            }
          )
        ] })
      ] })
    ] })
  ] });
}
export {
  TourRequestsIndex as default
};
