import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useForm, Head, router } from "@inertiajs/react";
import { A as AdminLayout } from "./AdminLayout-B_5R_DFk.js";
function AmenitiesIndex({ auth, amenities }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [iconPreview, setIconPreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const { data, setData, post, processing, errors, reset } = useForm({
    name: "",
    icon_file: null
  });
  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData("icon_file", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleCreate = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", data.name);
    if (data.icon_file) {
      formData.append("icon_file", data.icon_file);
    }
    router.post(route("admin.amenities.store"), formData, {
      forceFormData: true,
      onSuccess: () => {
        reset();
        setShowCreateModal(false);
        setIconPreview(null);
      },
      onError: (errors2) => {
        setFormErrors(errors2);
      }
    });
  };
  const handleEdit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("_method", "PUT");
    if (data.icon_file) {
      formData.append("icon_file", data.icon_file);
    }
    router.post(route("admin.amenities.update", editingAmenity.id), formData, {
      forceFormData: true,
      onSuccess: () => {
        reset();
        setShowEditModal(false);
        setEditingAmenity(null);
        setIconPreview(null);
      },
      onError: (errors2) => {
        setFormErrors(errors2);
      }
    });
  };
  const handleDelete = (id, name) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      router.delete(route("admin.amenities.destroy", id));
    }
  };
  const openEditModal = (amenity) => {
    setEditingAmenity(amenity);
    setData({
      name: amenity.name,
      icon_file: null
    });
    setIconPreview(amenity.icon);
    setShowEditModal(true);
  };
  const openCreateModal = () => {
    reset();
    setIconPreview(null);
    setFormErrors({});
    setShowCreateModal(true);
  };
  const filteredAmenities = (amenities.data || amenities).filter((amenity) => {
    return amenity.name.toLowerCase().includes(searchTerm.toLowerCase());
  });
  const totalAmenities = (amenities.data || amenities).length;
  return /* @__PURE__ */ jsxs(AdminLayout, { title: "Amenities", children: [
    /* @__PURE__ */ jsx(Head, { title: "Amenities" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold text-[#0f172a]", children: "Amenities" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b] mt-1", children: "Manage building amenities and icons" })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: openCreateModal,
            className: "inline-flex items-center px-4 py-2.5 bg-[#0f172a] text-white text-sm font-medium rounded-lg hover:bg-[#1e293b] transition-colors",
            children: [
              /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 6v6m0 0v6m0-6h6m-6 0H6" }) }),
              "Add Amenity"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg border border-[#e2e8f0] p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#64748b]", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" }) }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold text-[#0f172a]", children: totalAmenities }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b]", children: "Total Amenities" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg border border-[#e2e8f0] p-4", children: /* @__PURE__ */ jsxs("div", { className: "relative max-w-md", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: /* @__PURE__ */ jsx("svg", { className: "h-4 w-4 text-[#94a3b8]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }) }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "Search amenities...",
            className: "w-full pl-9 pr-4 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all",
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value)
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg border border-[#e2e8f0]", children: /* @__PURE__ */ jsx("div", { className: "p-4", children: filteredAmenities.length > 0 ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4", children: filteredAmenities.map((amenity) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "border border-[#e2e8f0] rounded-lg p-4 hover:bg-[#f8fafc] transition-colors",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
              amenity.icon ? /* @__PURE__ */ jsx(
                "img",
                {
                  src: amenity.icon,
                  alt: amenity.name,
                  className: "w-8 h-8 object-contain"
                }
              ) : /* @__PURE__ */ jsx("div", { className: "w-8 h-8 bg-[#f1f5f9] rounded flex items-center justify-center", children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-[#94a3b8]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" }) }) }),
              /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-[#0f172a]", children: amenity.name })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => openEditModal(amenity),
                  className: "flex-1 px-3 py-1.5 text-xs font-medium text-[#64748b] bg-[#f1f5f9] rounded-md hover:bg-[#e2e8f0] transition-colors",
                  children: "Edit"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleDelete(amenity.id, amenity.name),
                  className: "flex-1 px-3 py-1.5 text-xs font-medium text-[#dc2626] bg-[#fef2f2] rounded-md hover:bg-[#fee2e2] transition-colors",
                  children: "Delete"
                }
              )
            ] })
          ]
        },
        amenity.id
      )) }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
        /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-lg bg-[#f1f5f9] flex items-center justify-center mx-auto mb-3", children: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6 text-[#94a3b8]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" }) }) }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-[#0f172a]", children: "No amenities found" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-[#94a3b8] mt-1", children: "Add your first amenity to get started" })
      ] }) }) })
    ] }),
    showCreateModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-[#0f172a] mb-4", children: "Create Amenity" }),
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
                required: true
              }
            ),
            (errors.name || formErrors.name) && /* @__PURE__ */ jsx("p", { className: "text-xs text-[#dc2626] mt-1", children: errors.name || formErrors.name })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-[#0f172a] mb-1.5", children: "Icon (SVG, PNG, JPG)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "file",
                className: "w-full text-sm text-[#64748b] border border-[#e2e8f0] rounded-lg cursor-pointer file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-[#f1f5f9] file:text-[#0f172a] file:font-medium hover:file:bg-[#e2e8f0]",
                accept: "image/svg+xml,image/png,image/jpeg,image/jpg,image/webp,.svg",
                onChange: handleIconChange
              }
            ),
            iconPreview && /* @__PURE__ */ jsxs("div", { className: "mt-3 p-3 bg-[#f8fafc] rounded-lg", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-[#64748b] mb-2", children: "Preview:" }),
              /* @__PURE__ */ jsx(
                "img",
                {
                  src: iconPreview,
                  alt: "Icon preview",
                  className: "w-12 h-12 object-contain"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 flex gap-3 justify-end", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                setShowCreateModal(false);
                setIconPreview(null);
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
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-[#0f172a] mb-4", children: "Edit Amenity" }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleEdit, children: [
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
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-[#0f172a] mb-1.5", children: "Icon (SVG, PNG, JPG)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "file",
                className: "w-full text-sm text-[#64748b] border border-[#e2e8f0] rounded-lg cursor-pointer file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-[#f1f5f9] file:text-[#0f172a] file:font-medium hover:file:bg-[#e2e8f0]",
                accept: "image/svg+xml,image/png,image/jpeg,image/jpg,image/webp,.svg",
                onChange: handleIconChange
              }
            ),
            iconPreview && /* @__PURE__ */ jsxs("div", { className: "mt-3 p-3 bg-[#f8fafc] rounded-lg", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-[#64748b] mb-2", children: "Current/Preview:" }),
              /* @__PURE__ */ jsx(
                "img",
                {
                  src: iconPreview,
                  alt: "Icon preview",
                  className: "w-12 h-12 object-contain"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 flex gap-3 justify-end", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                setShowEditModal(false);
                setEditingAmenity(null);
                setIconPreview(null);
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
  AmenitiesIndex as default
};
