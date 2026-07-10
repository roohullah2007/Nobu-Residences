import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { useForm, router, Head, Link } from "@inertiajs/react";
import { A as AdminLayout } from "./AdminLayout-CaxbTFCB.js";
import { C as ConfirmDialog } from "./ConfirmDialog-CoY5VzLe.js";
import { I as InputError } from "./InputError-CBvD_6aD.js";
const SEARCH_DEBOUNCE_MS = 300;
const ICON_ACCEPT = "image/svg+xml,image/png,image/jpeg,image/jpg,image/webp,.svg";
function MaintenanceFeeAmenitiesIndex({ auth, amenities, categories, filters = {} }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState(null);
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [iconPreview, setIconPreview] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const isFirstRender = useRef(true);
  const { data, setData, post, processing, errors, reset, transform } = useForm({
    name: "",
    icon: null,
    category: "",
    sort_order: 0,
    is_active: true
  });
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const t = setTimeout(() => {
      router.get(
        route("admin.maintenance-fee-amenities.index"),
        searchTerm ? { search: searchTerm } : {},
        { preserveState: true, preserveScroll: true, replace: true }
      );
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchTerm]);
  const clearIconPreview = () => {
    if (iconPreview) {
      URL.revokeObjectURL(iconPreview);
      setIconPreview(null);
    }
  };
  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData("icon", file);
      clearIconPreview();
      setIconPreview(URL.createObjectURL(file));
    }
  };
  const handleCreate = (e) => {
    e.preventDefault();
    transform((formData) => formData);
    post(route("admin.maintenance-fee-amenities.store"), {
      forceFormData: true,
      onSuccess: () => {
        reset();
        setShowCreateModal(false);
        clearIconPreview();
      }
    });
  };
  const handleEdit = (e) => {
    e.preventDefault();
    transform((formData) => ({ ...formData, _method: "PUT" }));
    post(route("admin.maintenance-fee-amenities.update", editingAmenity.id), {
      forceFormData: true,
      onSuccess: () => {
        reset();
        setShowEditModal(false);
        setEditingAmenity(null);
        clearIconPreview();
      }
    });
  };
  const confirmDelete = () => {
    if (!pendingDelete) return;
    router.delete(route("admin.maintenance-fee-amenities.destroy", pendingDelete.id), {
      preserveScroll: true,
      onFinish: () => setPendingDelete(null)
    });
  };
  const openEditModal = (amenity) => {
    setEditingAmenity(amenity);
    setData({
      name: amenity.name,
      icon: null,
      category: amenity.category || "",
      sort_order: amenity.sort_order || 0,
      is_active: amenity.is_active
    });
    clearIconPreview();
    setShowEditModal(true);
  };
  const openCreateModal = () => {
    reset();
    clearIconPreview();
    setShowCreateModal(true);
  };
  const rows = amenities.data || [];
  const totalCount = amenities.total ?? rows.length;
  const activeCount = rows.filter((a) => a.is_active).length;
  const categoryOptions = ["Utilities", "Services", "Facilities", ...(categories || []).filter(
    (cat) => !["Utilities", "Services", "Facilities"].includes(cat)
  )];
  const formFields = /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
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
          placeholder: "e.g., Water, Heat, Building Insurance",
          required: true
        }
      ),
      /* @__PURE__ */ jsx(InputError, { message: errors.name, className: "mt-1" })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-[#0f172a] mb-1.5", children: "Category" }),
      /* @__PURE__ */ jsxs(
        "select",
        {
          className: "w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]",
          value: data.category,
          onChange: (e) => setData("category", e.target.value),
          children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Select Category" }),
            categoryOptions.map((cat) => /* @__PURE__ */ jsx("option", { value: cat, children: cat }, cat))
          ]
        }
      ),
      /* @__PURE__ */ jsx(InputError, { message: errors.category, className: "mt-1" })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-[#0f172a] mb-1.5", children: "Icon (SVG, PNG, JPG, WebP)" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "file",
          className: "w-full text-sm text-[#64748b] border border-[#e2e8f0] rounded-lg cursor-pointer file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-[#f1f5f9] file:text-[#0f172a] file:font-medium hover:file:bg-[#e2e8f0]",
          accept: ICON_ACCEPT,
          onChange: handleIconChange
        }
      ),
      (iconPreview || editingAmenity?.icon) && /* @__PURE__ */ jsxs("div", { className: "mt-3 p-3 bg-[#f8fafc] rounded-lg", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-[#64748b] mb-2", children: iconPreview ? "Preview:" : "Current icon (upload to replace):" }),
        /* @__PURE__ */ jsx(
          "img",
          {
            src: iconPreview || editingAmenity?.icon,
            alt: "Icon preview",
            className: "w-12 h-12 object-contain"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(InputError, { message: errors.icon, className: "mt-1" })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-[#0f172a] mb-1.5", children: "Sort Order" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "number",
          className: "w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]",
          value: data.sort_order,
          onChange: (e) => setData("sort_order", parseInt(e.target.value) || 0)
        }
      ),
      /* @__PURE__ */ jsx(InputError, { message: errors.sort_order, className: "mt-1" })
    ] }),
    /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "checkbox",
          className: "h-4 w-4 rounded border-[#e2e8f0] text-[#0f172a] focus:ring-[#3b82f6]",
          checked: data.is_active,
          onChange: (e) => setData("is_active", e.target.checked)
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "text-sm text-[#0f172a]", children: "Active" })
    ] })
  ] });
  return /* @__PURE__ */ jsxs(AdminLayout, { title: "Maintenance Fees", children: [
    /* @__PURE__ */ jsx(Head, { title: "Maintenance Fees" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold text-[#0f172a]", children: "Maintenance Fees" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b] mt-1", children: "Manage what building maintenance fees can include (water, heat, insurance, ...)" })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: openCreateModal,
            className: "inline-flex items-center px-4 py-2.5 bg-[#0f172a] text-white text-sm font-medium rounded-lg hover:bg-[#1e293b] transition-colors",
            children: [
              /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 6v6m0 0v6m0-6h6m-6 0H6" }) }),
              "Add Maintenance Fee"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg border border-[#e2e8f0] p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#64748b]", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15" }) }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold text-[#0f172a]", children: totalCount }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b]", children: filters.search ? `Matching "${filters.search}"` : "Total Maintenance Fees" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg border border-[#e2e8f0] p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-[#f0fdf4] flex items-center justify-center text-[#16a34a]", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold text-[#0f172a]", children: activeCount }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b]", children: "Active (this page)" })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg border border-[#e2e8f0]", children: [
        /* @__PURE__ */ jsx("div", { className: "p-4 border-b border-[#e2e8f0]", children: /* @__PURE__ */ jsxs("div", { className: "relative max-w-md", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: /* @__PURE__ */ jsx("svg", { className: "h-4 w-4 text-[#94a3b8]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }) }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              placeholder: "Search maintenance fees...",
              "aria-label": "Search maintenance fees",
              className: "w-full pl-9 pr-4 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all",
              value: searchTerm,
              onChange: (e) => setSearchTerm(e.target.value)
            }
          )
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-[#e2e8f0]", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-[#f8fafc]", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Name" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider hidden md:table-cell", children: "Category" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider hidden md:table-cell", children: "Sort Order" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Status" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-right text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "bg-white divide-y divide-[#e2e8f0]", children: rows.length > 0 ? rows.map((amenity) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-[#f8fafc] transition-colors", children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              amenity.icon ? /* @__PURE__ */ jsx(
                "img",
                {
                  src: amenity.icon,
                  alt: "",
                  "aria-hidden": "true",
                  className: "w-8 h-8 object-contain"
                }
              ) : /* @__PURE__ */ jsx("div", { className: "w-8 h-8 bg-[#f1f5f9] rounded flex items-center justify-center", children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-[#94a3b8]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15" }) }) }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-[#0f172a]", children: amenity.name })
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap hidden md:table-cell", children: amenity.category ? /* @__PURE__ */ jsx("span", { className: "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[#f1f5f9] text-[#475569]", children: amenity.category }) : /* @__PURE__ */ jsx("span", { className: "text-[#cbd5e1]", children: "—" }) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-[#64748b] hidden md:table-cell", children: amenity.sort_order }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx("span", { className: `inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${amenity.is_active ? "bg-[#f0fdf4] text-[#16a34a]" : "bg-[#f1f5f9] text-[#64748b]"}`, children: amenity.is_active ? "Active" : "Inactive" }) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-right", children: /* @__PURE__ */ jsxs("div", { className: "inline-flex gap-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => openEditModal(amenity),
                  className: "px-3 py-1.5 text-xs font-medium text-[#64748b] bg-[#f1f5f9] rounded-md hover:bg-[#e2e8f0] transition-colors",
                  children: "Edit"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setPendingDelete(amenity),
                  className: "px-3 py-1.5 text-xs font-medium text-[#dc2626] bg-[#fef2f2] rounded-md hover:bg-[#fee2e2] transition-colors",
                  children: "Delete"
                }
              )
            ] }) })
          ] }, amenity.id)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: "5", className: "px-6 py-12 text-center", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
            /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-lg bg-[#f1f5f9] flex items-center justify-center mb-3", children: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6 text-[#94a3b8]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15" }) }) }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-[#0f172a]", children: "No maintenance fees found" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-[#94a3b8] mt-1", children: filters.search ? "Try a different search term" : "Add your first maintenance fee to get started" })
          ] }) }) }) })
        ] }) }),
        amenities.links && amenities.links.length > 3 && /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 border-t border-[#e2e8f0] flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-[#64748b]", children: [
            "Showing ",
            amenities.from || 0,
            " to ",
            amenities.to || 0,
            " of ",
            amenities.total || 0,
            " results"
          ] }),
          /* @__PURE__ */ jsx("nav", { className: "flex items-center gap-1", children: amenities.links.map((link, index) => /* @__PURE__ */ jsx(
            Link,
            {
              href: link.url || "#",
              className: `px-3 py-1.5 text-sm rounded-md transition-colors ${link.active ? "bg-[#0f172a] text-white" : link.url ? "text-[#64748b] hover:bg-[#f1f5f9]" : "text-[#cbd5e1] cursor-not-allowed"}`,
              dangerouslySetInnerHTML: { __html: link.label },
              preserveScroll: true
            },
            index
          )) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      ConfirmDialog,
      {
        open: Boolean(pendingDelete),
        title: "Delete maintenance fee?",
        message: pendingDelete ? `"${pendingDelete.name}" will be permanently deleted. This can't be undone.` : "",
        confirmLabel: "Delete",
        onConfirm: confirmDelete,
        onCancel: () => setPendingDelete(null)
      }
    ),
    showCreateModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-[#0f172a] mb-4", children: "Add Maintenance Fee" }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleCreate, children: [
        formFields,
        /* @__PURE__ */ jsxs("div", { className: "mt-6 flex gap-3 justify-end", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                setShowCreateModal(false);
                clearIconPreview();
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
    showEditModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-[#0f172a] mb-4", children: "Edit Maintenance Fee" }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleEdit, children: [
        formFields,
        /* @__PURE__ */ jsxs("div", { className: "mt-6 flex gap-3 justify-end", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                setShowEditModal(false);
                setEditingAmenity(null);
                clearIconPreview();
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
  MaintenanceFeeAmenitiesIndex as default
};
