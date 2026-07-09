import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useForm, Head, Link, router } from "@inertiajs/react";
import { A as AdminLayout } from "./AdminLayout-CfYoZrH6.js";
import { P as PrimaryButton } from "./PrimaryButton-DDF1xnxF.js";
import { S as SecondaryButton } from "./SecondaryButton-D0HLp6wy.js";
import { I as InputLabel } from "./InputLabel-DE424DvN.js";
import { T as TextInput } from "./TextInput-D0qTZeQv.js";
import { I as InputError } from "./InputError-CBvD_6aD.js";
function MaintenanceFeeAmenitiesIndex({ auth, amenities, categories, filters = {} }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState(null);
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [iconPreview, setIconPreview] = useState(null);
  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: "",
    icon: null,
    category: "",
    sort_order: 0,
    is_active: true
  });
  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData("icon", file);
      const previewUrl = URL.createObjectURL(file);
      setIconPreview(previewUrl);
    }
  };
  const handleCreate = (e) => {
    e.preventDefault();
    post(route("admin.maintenance-fee-amenities.store"), {
      forceFormData: true,
      onSuccess: () => {
        reset();
        setShowCreateModal(false);
        if (iconPreview) {
          URL.revokeObjectURL(iconPreview);
          setIconPreview(null);
        }
      }
    });
  };
  const handleEdit = (e) => {
    e.preventDefault();
    router.post(route("admin.maintenance-fee-amenities.update", editingAmenity.id), {
      ...data,
      _method: "PUT"
    }, {
      forceFormData: true,
      onSuccess: () => {
        reset();
        setShowEditModal(false);
        setEditingAmenity(null);
        if (iconPreview) {
          URL.revokeObjectURL(iconPreview);
          setIconPreview(null);
        }
      }
    });
  };
  const handleDelete = (id, name) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      router.delete(route("admin.maintenance-fee-amenities.destroy", id));
    }
  };
  const handleSearch = (e) => {
    e.preventDefault();
    router.get(
      route("admin.maintenance-fee-amenities.index"),
      { search: searchTerm },
      { preserveState: true, preserveScroll: true }
    );
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
    setIconPreview(null);
    setShowEditModal(true);
  };
  return /* @__PURE__ */ jsxs(
    AdminLayout,
    {
      user: auth.user,
      header: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-semibold text-xl text-gray-800 leading-tight", children: "Maintenance Fee Amenities" }),
        /* @__PURE__ */ jsx(PrimaryButton, { onClick: () => setShowCreateModal(true), children: "Add New Amenity" })
      ] }),
      children: [
        /* @__PURE__ */ jsx(Head, { title: "Maintenance Fee Amenities" }),
        /* @__PURE__ */ jsx("div", { className: "py-12", children: /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto sm:px-6 lg:px-8", children: /* @__PURE__ */ jsx("div", { className: "bg-white overflow-hidden shadow-sm sm:rounded-lg", children: /* @__PURE__ */ jsxs("div", { className: "p-6 text-gray-900", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-6", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-800", children: "Manage Amenities" }),
            /* @__PURE__ */ jsx(PrimaryButton, { onClick: () => setShowCreateModal(true), children: "+ Create New Amenity" })
          ] }),
          /* @__PURE__ */ jsx("form", { onSubmit: handleSearch, className: "mb-6", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
            /* @__PURE__ */ jsx(
              TextInput,
              {
                type: "text",
                className: "flex-1",
                placeholder: "Search amenities...",
                value: searchTerm,
                onChange: (e) => setSearchTerm(e.target.value)
              }
            ),
            /* @__PURE__ */ jsx(PrimaryButton, { type: "submit", children: "Search" })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [
            /* @__PURE__ */ jsx("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Name" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Category" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Icon" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Sort Order" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Status" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: amenities.data && amenities.data.map((amenity) => /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900", children: amenity.name }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: amenity.category || "-" }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: amenity.icon ? /* @__PURE__ */ jsx("img", { src: amenity.icon, alt: amenity.name, className: "h-6 w-6" }) : "-" }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: amenity.sort_order }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx("span", { className: `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${amenity.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`, children: amenity.is_active ? "Active" : "Inactive" }) }),
              /* @__PURE__ */ jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => openEditModal(amenity),
                    className: "text-indigo-600 hover:text-indigo-900 mr-3",
                    children: "Edit"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => handleDelete(amenity.id, amenity.name),
                    className: "text-red-600 hover:text-red-900",
                    children: "Delete"
                  }
                )
              ] })
            ] }, amenity.id)) })
          ] }) }),
          amenities.links && amenities.links.length > 3 && /* @__PURE__ */ jsx("div", { className: "mt-4 flex justify-center", children: amenities.links.map((link, index) => /* @__PURE__ */ jsx(
            Link,
            {
              href: link.url || "#",
              className: `px-3 py-1 mx-1 rounded ${link.active ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"} ${!link.url ? "opacity-50 cursor-not-allowed" : ""}`,
              dangerouslySetInnerHTML: { __html: link.label }
            },
            index
          )) })
        ] }) }) }) }),
        showCreateModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-gray-500 bg-opacity-75 overflow-y-auto h-full w-full z-50", children: /* @__PURE__ */ jsxs("div", { className: "relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-gray-900 mb-4", children: "Add New Maintenance Fee Amenity" }),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleCreate, children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "name", value: "Name" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "name",
                  type: "text",
                  className: "mt-1 block w-full",
                  value: data.name,
                  onChange: (e) => setData("name", e.target.value),
                  required: true
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.name, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "category", value: "Category" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  id: "category",
                  className: "mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm",
                  value: data.category,
                  onChange: (e) => setData("category", e.target.value),
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "Select Category" }),
                    /* @__PURE__ */ jsx("option", { value: "Utilities", children: "Utilities" }),
                    /* @__PURE__ */ jsx("option", { value: "Services", children: "Services" }),
                    /* @__PURE__ */ jsx("option", { value: "Facilities", children: "Facilities" }),
                    categories && categories.filter((cat) => !["Utilities", "Services", "Facilities"].includes(cat)).map((cat) => /* @__PURE__ */ jsx("option", { value: cat, children: cat }, cat))
                  ]
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.category, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "icon", value: "Icon (SVG file)" }),
              iconPreview && /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("img", { src: iconPreview, alt: "Preview", className: "h-8 w-8" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600", children: "Preview" })
              ] }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  id: "icon",
                  type: "file",
                  accept: ".svg",
                  className: "mt-1 block w-full text-sm text-gray-500\n                                        file:mr-4 file:py-2 file:px-4\n                                        file:rounded-md file:border-0\n                                        file:text-sm file:font-semibold\n                                        file:bg-indigo-50 file:text-indigo-700\n                                        hover:file:bg-indigo-100",
                  onChange: handleIconChange
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.icon, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "sort_order", value: "Sort Order" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "sort_order",
                  type: "number",
                  className: "mt-1 block w-full",
                  value: data.sort_order,
                  onChange: (e) => setData("sort_order", parseInt(e.target.value) || 0)
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.sort_order, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxs("label", { className: "flex items-center", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  className: "rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500",
                  checked: data.is_active,
                  onChange: (e) => setData("is_active", e.target.checked)
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "ml-2 text-sm text-gray-600", children: "Active" })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
              /* @__PURE__ */ jsx(PrimaryButton, { type: "submit", disabled: processing, children: "Create" }),
              /* @__PURE__ */ jsx(SecondaryButton, { type: "button", onClick: () => {
                setShowCreateModal(false);
                if (iconPreview) {
                  URL.revokeObjectURL(iconPreview);
                  setIconPreview(null);
                }
              }, children: "Cancel" })
            ] })
          ] })
        ] }) }),
        showEditModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-gray-500 bg-opacity-75 overflow-y-auto h-full w-full z-50", children: /* @__PURE__ */ jsxs("div", { className: "relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-gray-900 mb-4", children: "Edit Maintenance Fee Amenity" }),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleEdit, children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "edit-name", value: "Name" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "edit-name",
                  type: "text",
                  className: "mt-1 block w-full",
                  value: data.name,
                  onChange: (e) => setData("name", e.target.value),
                  required: true
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.name, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "edit-category", value: "Category" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  id: "edit-category",
                  className: "mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm",
                  value: data.category,
                  onChange: (e) => setData("category", e.target.value),
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "Select Category" }),
                    /* @__PURE__ */ jsx("option", { value: "Utilities", children: "Utilities" }),
                    /* @__PURE__ */ jsx("option", { value: "Services", children: "Services" }),
                    /* @__PURE__ */ jsx("option", { value: "Facilities", children: "Facilities" }),
                    categories && categories.filter((cat) => !["Utilities", "Services", "Facilities"].includes(cat)).map((cat) => /* @__PURE__ */ jsx("option", { value: cat, children: cat }, cat))
                  ]
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.category, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "edit-icon", value: "Icon (SVG file)" }),
              iconPreview ? /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("img", { src: iconPreview, alt: "New icon preview", className: "h-8 w-8" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600", children: "New icon preview" })
              ] }) : editingAmenity?.icon && /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("img", { src: editingAmenity.icon, alt: "Current icon", className: "h-8 w-8" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600", children: "Current icon" })
              ] }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  id: "edit-icon",
                  type: "file",
                  accept: ".svg",
                  className: "mt-1 block w-full text-sm text-gray-500\n                                        file:mr-4 file:py-2 file:px-4\n                                        file:rounded-md file:border-0\n                                        file:text-sm file:font-semibold\n                                        file:bg-indigo-50 file:text-indigo-700\n                                        hover:file:bg-indigo-100",
                  onChange: handleIconChange
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Leave empty to keep current icon" }),
              /* @__PURE__ */ jsx(InputError, { message: errors.icon, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "edit-sort_order", value: "Sort Order" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "edit-sort_order",
                  type: "number",
                  className: "mt-1 block w-full",
                  value: data.sort_order,
                  onChange: (e) => setData("sort_order", parseInt(e.target.value) || 0)
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.sort_order, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxs("label", { className: "flex items-center", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  className: "rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500",
                  checked: data.is_active,
                  onChange: (e) => setData("is_active", e.target.checked)
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "ml-2 text-sm text-gray-600", children: "Active" })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
              /* @__PURE__ */ jsx(PrimaryButton, { type: "submit", disabled: processing, children: "Update" }),
              /* @__PURE__ */ jsx(SecondaryButton, { type: "button", onClick: () => {
                setShowEditModal(false);
                if (iconPreview) {
                  URL.revokeObjectURL(iconPreview);
                  setIconPreview(null);
                }
              }, children: "Cancel" })
            ] })
          ] })
        ] }) })
      ]
    }
  );
}
export {
  MaintenanceFeeAmenitiesIndex as default
};
