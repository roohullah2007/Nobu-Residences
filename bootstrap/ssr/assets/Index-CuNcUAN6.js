import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useForm, Head, Link, router } from "@inertiajs/react";
import { A as AdminLayout } from "./AdminLayout-B_5R_DFk.js";
function NeighbourhoodsIndex({ neighbourhoods, cities, filters }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingNeighbourhood, setEditingNeighbourhood] = useState(null);
  const [searchTerm, setSearchTerm] = useState(filters?.search || "");
  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: "",
    city: "",
    description: "",
    is_active: true,
    sort_order: 0
  });
  const handleSearch = (value) => {
    setSearchTerm(value);
    router.get(route("admin.neighbourhoods.index"), { search: value }, {
      preserveState: true,
      replace: true
    });
  };
  const handleCreate = (e) => {
    e.preventDefault();
    post(route("admin.neighbourhoods.store"), {
      onSuccess: () => {
        reset();
        setShowCreateModal(false);
      }
    });
  };
  const handleUpdate = (e) => {
    e.preventDefault();
    put(route("admin.neighbourhoods.update", editingNeighbourhood.id), {
      onSuccess: () => {
        reset();
        setShowEditModal(false);
        setEditingNeighbourhood(null);
      }
    });
  };
  const handleDelete = (id, name) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      router.delete(route("admin.neighbourhoods.destroy", id));
    }
  };
  const openEditModal = (neighbourhood) => {
    setEditingNeighbourhood(neighbourhood);
    setData({
      name: neighbourhood.name,
      city: neighbourhood.city || "",
      description: neighbourhood.description || "",
      is_active: neighbourhood.is_active,
      sort_order: neighbourhood.sort_order
    });
    setShowEditModal(true);
  };
  const openCreateModal = () => {
    reset();
    setShowCreateModal(true);
  };
  return /* @__PURE__ */ jsxs(AdminLayout, { title: "Neighbourhoods", children: [
    /* @__PURE__ */ jsx(Head, { title: "Neighbourhoods" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold text-[#0f172a]", children: "Neighbourhoods" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b] mt-1", children: "Manage neighbourhood taxonomies for buildings" })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: openCreateModal,
            className: "inline-flex items-center px-4 py-2.5 bg-[#0f172a] text-white text-sm font-medium rounded-lg hover:bg-[#1e293b] transition-colors",
            children: [
              /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 6v6m0 0v6m0-6h6m-6 0H6" }) }),
              "Add Neighbourhood"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg border border-[#e2e8f0] p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#64748b]", children: /* @__PURE__ */ jsxs("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [
          /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" }),
          /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M15 11a3 3 0 11-6 0 3 3 0 016 0z" })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold text-[#0f172a]", children: neighbourhoods.total || neighbourhoods.data?.length || 0 }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b]", children: "Total Neighbourhoods" })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg border border-[#e2e8f0] p-4", children: /* @__PURE__ */ jsxs("div", { className: "relative max-w-md", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: /* @__PURE__ */ jsx("svg", { className: "h-4 w-4 text-[#94a3b8]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }) }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "Search neighbourhoods...",
            className: "w-full pl-9 pr-4 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all",
            value: searchTerm,
            onChange: (e) => handleSearch(e.target.value)
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg border border-[#e2e8f0]", children: [
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-[#f8fafc] border-b border-[#e2e8f0]", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Name" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "City" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Sub-neighbourhoods" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Buildings" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Status" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsxs("tbody", { className: "divide-y divide-[#e2e8f0]", children: [
            (neighbourhoods.data || []).map((neighbourhood) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-[#f8fafc]", children: [
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm font-medium text-[#0f172a]", children: neighbourhood.name }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-[#64748b]", children: neighbourhood.city || "-" }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-[#64748b]", children: neighbourhood.sub_neighbourhoods_count || 0 }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-[#64748b]", children: neighbourhood.buildings_count || 0 }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${neighbourhood.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`, children: neighbourhood.is_active ? "Active" : "Inactive" }) }),
              /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 text-right", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => openEditModal(neighbourhood),
                    className: "text-[#3b82f6] hover:text-[#2563eb] text-sm font-medium mr-3",
                    children: "Edit"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => handleDelete(neighbourhood.id, neighbourhood.name),
                    className: "text-[#dc2626] hover:text-[#b91c1c] text-sm font-medium",
                    children: "Delete"
                  }
                )
              ] })
            ] }, neighbourhood.id)),
            (!neighbourhoods.data || neighbourhoods.data.length === 0) && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: "6", className: "px-4 py-8 text-center text-sm text-[#64748b]", children: "No neighbourhoods found. Create your first one!" }) })
          ] })
        ] }) }),
        neighbourhoods.links && neighbourhoods.links.length > 3 && /* @__PURE__ */ jsxs("div", { className: "px-4 py-3 border-t border-[#e2e8f0] flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-[#64748b]", children: [
            "Showing ",
            neighbourhoods.from,
            " to ",
            neighbourhoods.to,
            " of ",
            neighbourhoods.total,
            " results"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: neighbourhoods.links.map((link, index) => /* @__PURE__ */ jsx(
            Link,
            {
              href: link.url || "#",
              className: `px-3 py-1 text-sm rounded ${link.active ? "bg-[#0f172a] text-white" : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"} ${!link.url ? "opacity-50 cursor-not-allowed" : ""}`,
              dangerouslySetInnerHTML: { __html: link.label }
            },
            index
          )) })
        ] })
      ] })
    ] }),
    showCreateModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-[#0f172a] mb-4", children: "Create Neighbourhood" }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleCreate, children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium text-[#0f172a] mb-1.5", children: [
              "Name ",
              /* @__PURE__ */ jsx("span", { className: "text-[#dc2626]", children: "*" })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                className: "w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]",
                value: data.name,
                onChange: (e) => setData("name", e.target.value),
                placeholder: "e.g., Downtown",
                required: true
              }
            ),
            errors.name && /* @__PURE__ */ jsx("p", { className: "text-xs text-[#dc2626] mt-1", children: errors.name })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-[#0f172a] mb-1.5", children: "City" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                className: "w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]",
                value: data.city,
                onChange: (e) => setData("city", e.target.value),
                placeholder: "e.g., Toronto",
                list: "cities-list"
              }
            ),
            /* @__PURE__ */ jsx("datalist", { id: "cities-list", children: cities.map((city) => /* @__PURE__ */ jsx("option", { value: city }, city)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-[#0f172a] mb-1.5", children: "Description" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                className: "w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]",
                value: data.description,
                onChange: (e) => setData("description", e.target.value),
                rows: 3
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                id: "is_active",
                checked: data.is_active,
                onChange: (e) => setData("is_active", e.target.checked),
                className: "w-4 h-4 text-[#3b82f6] border-[#e2e8f0] rounded focus:ring-[#3b82f6]"
              }
            ),
            /* @__PURE__ */ jsx("label", { htmlFor: "is_active", className: "text-sm text-[#0f172a]", children: "Active" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 flex gap-3 justify-end", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                setShowCreateModal(false);
                reset();
              },
              className: "px-4 py-2 text-sm font-medium text-[#64748b] bg-[#f1f5f9] rounded-lg hover:bg-[#e2e8f0] transition-colors",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: processing,
              className: "px-4 py-2 text-sm font-medium text-white bg-[#0f172a] rounded-lg hover:bg-[#1e293b] transition-colors disabled:opacity-50",
              children: processing ? "Creating..." : "Create"
            }
          )
        ] })
      ] })
    ] }) }),
    showEditModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-[#0f172a] mb-4", children: "Edit Neighbourhood" }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleUpdate, children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium text-[#0f172a] mb-1.5", children: [
              "Name ",
              /* @__PURE__ */ jsx("span", { className: "text-[#dc2626]", children: "*" })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                className: "w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]",
                value: data.name,
                onChange: (e) => setData("name", e.target.value),
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-[#0f172a] mb-1.5", children: "City" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                className: "w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]",
                value: data.city,
                onChange: (e) => setData("city", e.target.value),
                list: "cities-list-edit"
              }
            ),
            /* @__PURE__ */ jsx("datalist", { id: "cities-list-edit", children: cities.map((city) => /* @__PURE__ */ jsx("option", { value: city }, city)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-[#0f172a] mb-1.5", children: "Description" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                className: "w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]",
                value: data.description,
                onChange: (e) => setData("description", e.target.value),
                rows: 3
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                id: "is_active_edit",
                checked: data.is_active,
                onChange: (e) => setData("is_active", e.target.checked),
                className: "w-4 h-4 text-[#3b82f6] border-[#e2e8f0] rounded focus:ring-[#3b82f6]"
              }
            ),
            /* @__PURE__ */ jsx("label", { htmlFor: "is_active_edit", className: "text-sm text-[#0f172a]", children: "Active" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 flex gap-3 justify-end", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                setShowEditModal(false);
                setEditingNeighbourhood(null);
                reset();
              },
              className: "px-4 py-2 text-sm font-medium text-[#64748b] bg-[#f1f5f9] rounded-lg hover:bg-[#e2e8f0] transition-colors",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: processing,
              className: "px-4 py-2 text-sm font-medium text-white bg-[#0f172a] rounded-lg hover:bg-[#1e293b] transition-colors disabled:opacity-50",
              children: processing ? "Saving..." : "Save"
            }
          )
        ] })
      ] })
    ] }) })
  ] });
}
export {
  NeighbourhoodsIndex as default
};
