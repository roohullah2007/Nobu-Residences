import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useForm, Head, Link, router } from "@inertiajs/react";
import { A as AdminLayout } from "./AdminLayout-CaxbTFCB.js";
import { C as ConfirmDialog } from "./ConfirmDialog-CoY5VzLe.js";
import { D as DeveloperApiSearch, i as importDeveloperFromApi } from "./DeveloperApiSearch-CdxwE2Dz.js";
function DeveloperLogo({ logo, name }) {
  const [hasFailed, setHasFailed] = useState(false);
  if (!logo || hasFailed) {
    return /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-[#0f172a] flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-white", children: name.charAt(0).toUpperCase() }) });
  }
  return /* @__PURE__ */ jsx(
    "img",
    {
      src: `/storage/${logo}`,
      alt: name,
      onError: () => setHasFailed(true),
      className: "w-10 h-10 rounded-lg object-cover"
    }
  );
}
const emptyForm = {
  name: "",
  type: "developer",
  email: "",
  phone: "",
  logo: null,
  website: "",
  established_year: "",
  description: ""
};
function DevelopersIndex({ developers }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDeveloper, setEditingDeveloper] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [logoPreview, setLogoPreview] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [apiImportError, setApiImportError] = useState("");
  const [isImportingFromApi, setIsImportingFromApi] = useState(false);
  const { data, setData, processing, errors, reset } = useForm({ ...emptyForm });
  const handleApiSelect = async (apiDeveloper) => {
    if (isImportingFromApi) return;
    setIsImportingFromApi(true);
    setApiImportError("");
    try {
      await importDeveloperFromApi(apiDeveloper.slug);
      setShowCreateModal(false);
      reset();
      setLogoPreview(null);
      router.reload({ only: ["developers"] });
    } catch (err) {
      setApiImportError(err.message ?? "Failed to load developer from the directory.");
    } finally {
      setIsImportingFromApi(false);
    }
  };
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData("logo", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const buildFormData = (extra = {}) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("type", data.type);
    formData.append("email", data.email || "");
    formData.append("phone", data.phone || "");
    formData.append("website", data.website || "");
    formData.append("established_year", data.established_year || "");
    formData.append("description", data.description || "");
    if (data.logo) {
      formData.append("logo", data.logo);
    }
    Object.entries(extra).forEach(([k, v]) => formData.append(k, v));
    return formData;
  };
  const handleCreate = (e) => {
    e.preventDefault();
    router.post(route("admin.developers.store"), buildFormData(), {
      forceFormData: true,
      onSuccess: () => {
        reset();
        setShowCreateModal(false);
        setLogoPreview(null);
      }
    });
  };
  const handleEdit = (e) => {
    e.preventDefault();
    router.post(route("admin.developers.update", editingDeveloper.id), buildFormData({ _method: "PUT" }), {
      forceFormData: true,
      onSuccess: () => {
        reset();
        setShowEditModal(false);
        setEditingDeveloper(null);
        setLogoPreview(null);
      }
    });
  };
  const confirmDelete = () => {
    if (!pendingDelete) return;
    router.delete(route("admin.developers.destroy", pendingDelete.id), {
      preserveScroll: true,
      onFinish: () => setPendingDelete(null)
    });
  };
  const openEditModal = (developer) => {
    setEditingDeveloper(developer);
    setData({
      ...emptyForm,
      name: developer.name,
      type: developer.type,
      email: developer.email || "",
      phone: developer.phone || "",
      logo: null,
      website: developer.website || "",
      established_year: developer.established_year || "",
      description: developer.description || ""
    });
    setLogoPreview(developer.logo ? `/storage/${developer.logo}` : null);
    setShowEditModal(true);
  };
  const openCreateModal = () => {
    reset();
    setLogoPreview(null);
    setShowCreateModal(true);
  };
  const developersList = developers.data || developers;
  const filteredDevelopers = developersList.filter(
    (dev) => dev.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const getTypeBadge = (type) => {
    const types = {
      builder: { label: "Builder", class: "bg-[#dbeafe] text-[#1e40af]" },
      developer: { label: "Developer", class: "bg-[#f0fdf4] text-[#16a34a]" },
      builder_developer: { label: "Builder & Developer", class: "bg-[#fef3c7] text-[#92400e]" }
    };
    const config = types[type] || types.developer;
    return /* @__PURE__ */ jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.class}`, children: config.label });
  };
  const renderFormFields = () => /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
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
        errors.name && /* @__PURE__ */ jsx("p", { className: "text-xs text-[#dc2626] mt-1", children: errors.name })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium text-[#0f172a] mb-1.5", children: [
          "Type ",
          /* @__PURE__ */ jsx("span", { className: "text-[#dc2626]", children: "*" })
        ] }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            className: "w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]",
            value: data.type,
            onChange: (e) => setData("type", e.target.value),
            required: true,
            children: [
              /* @__PURE__ */ jsx("option", { value: "developer", children: "Developer" }),
              /* @__PURE__ */ jsx("option", { value: "builder", children: "Builder" }),
              /* @__PURE__ */ jsx("option", { value: "builder_developer", children: "Builder & Developer" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-[#0f172a] mb-1.5", children: "Email" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "email",
            className: "w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]",
            value: data.email,
            onChange: (e) => setData("email", e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-[#0f172a] mb-1.5", children: "Phone" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            className: "w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]",
            value: data.phone,
            onChange: (e) => setData("phone", e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-[#0f172a] mb-1.5", children: "Website" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "https://example.com",
            className: "w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]",
            value: data.website,
            onChange: (e) => setData("website", e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-[#0f172a] mb-1.5", children: "Established Year" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            min: "1800",
            max: (/* @__PURE__ */ new Date()).getFullYear(),
            placeholder: "e.g. 1985",
            className: "w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]",
            value: data.established_year,
            onChange: (e) => setData("established_year", e.target.value)
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-[#0f172a] mb-1.5", children: "Description" }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          rows: 5,
          placeholder: "Company profile shown on the public developer page...",
          className: "w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]",
          value: data.description,
          onChange: (e) => setData("description", e.target.value)
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-[#0f172a] mb-1.5", children: "Logo" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "file",
          className: "w-full text-sm text-[#64748b] border border-[#e2e8f0] rounded-lg cursor-pointer file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-[#f1f5f9] file:text-[#0f172a] file:font-medium hover:file:bg-[#e2e8f0]",
          accept: "image/*",
          onChange: handleLogoChange
        }
      ),
      logoPreview && /* @__PURE__ */ jsxs("div", { className: "mt-3 p-3 bg-[#f8fafc] rounded-lg", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-[#64748b] mb-2", children: "Current/Preview:" }),
        /* @__PURE__ */ jsx("img", { src: logoPreview, alt: "Logo preview", className: "w-16 h-16 object-contain" })
      ] })
    ] })
  ] });
  return /* @__PURE__ */ jsxs(AdminLayout, { title: "Developers", children: [
    /* @__PURE__ */ jsx(Head, { title: "Developers" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold text-[#0f172a]", children: "Developers" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b] mt-1", children: "Manage building developers and builders" })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: openCreateModal,
            className: "inline-flex items-center px-4 py-2.5 bg-[#0f172a] text-white text-sm font-medium rounded-lg hover:bg-[#1e293b] transition-colors",
            children: [
              /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 6v6m0 0v6m0-6h6m-6 0H6" }) }),
              "Add Developer"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg border border-[#e2e8f0] p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#64748b]", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" }) }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold text-[#0f172a]", children: developersList.length }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b]", children: "Total" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg border border-[#e2e8f0] p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-[#f0fdf4] flex items-center justify-center text-[#16a34a]", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold text-[#0f172a]", children: developersList.filter((d) => d.type === "developer").length }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b]", children: "Developers" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg border border-[#e2e8f0] p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-[#dbeafe] flex items-center justify-center text-[#1e40af]", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" }) }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold text-[#0f172a]", children: developersList.filter((d) => d.type === "builder" || d.type === "builder_developer").length }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b]", children: "Builders" })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg border border-[#e2e8f0] p-4", children: /* @__PURE__ */ jsxs("div", { className: "relative max-w-md", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: /* @__PURE__ */ jsx("svg", { className: "h-4 w-4 text-[#94a3b8]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }) }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "Search developers...",
            className: "w-full pl-9 pr-4 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all",
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value)
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg border border-[#e2e8f0]", children: [
        filteredDevelopers.length > 0 ? /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-[#e2e8f0]", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-[#f8fafc]", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Developer" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Type" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Contact" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Content" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "bg-white divide-y divide-[#e2e8f0]", children: filteredDevelopers.map((developer) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-[#f8fafc] transition-colors", children: [
            /* @__PURE__ */ jsx("td", { className: "px-4 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx(DeveloperLogo, { logo: developer.logo, name: developer.name }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-[#0f172a] block", children: developer.name }),
                /* @__PURE__ */ jsxs(
                  "a",
                  {
                    href: `/developer/${developer.slug}`,
                    target: "_blank",
                    rel: "noopener",
                    className: "text-xs text-[#3b82f6] hover:underline",
                    children: [
                      "/developer/",
                      developer.slug
                    ]
                  }
                )
              ] })
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-4 whitespace-nowrap", children: getTypeBadge(developer.type) }),
            /* @__PURE__ */ jsxs("td", { className: "px-4 py-4 whitespace-nowrap", children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm text-[#0f172a]", children: developer.email || "-" }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-[#94a3b8]", children: developer.phone || "-" })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx("span", { className: `inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${developer.description ? "bg-[#f0fdf4] text-[#16a34a]" : "bg-[#fef2f2] text-[#dc2626]"}`, children: developer.description ? "Has content" : "No content" }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-4 whitespace-nowrap text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => openEditModal(developer),
                  className: "px-3 py-1.5 text-xs font-medium text-[#64748b] bg-[#f1f5f9] rounded-md hover:bg-[#e2e8f0] transition-colors",
                  children: "Edit"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setPendingDelete(developer),
                  className: "px-3 py-1.5 text-xs font-medium text-[#dc2626] bg-[#fef2f2] rounded-md hover:bg-[#fee2e2] transition-colors",
                  children: "Delete"
                }
              )
            ] }) })
          ] }, developer.id)) })
        ] }) }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
          /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-lg bg-[#f1f5f9] flex items-center justify-center mx-auto mb-3", children: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6 text-[#94a3b8]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" }) }) }),
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-[#0f172a]", children: "No developers found" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-[#94a3b8] mt-1", children: "Add your first developer to get started" })
        ] }),
        developers.links && developers.last_page > 1 && /* @__PURE__ */ jsxs("div", { className: "px-4 py-4 border-t border-[#e2e8f0] flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-[#64748b]", children: [
            "Showing ",
            developers.from || 0,
            " to ",
            developers.to || 0,
            " of ",
            developers.total || 0
          ] }),
          /* @__PURE__ */ jsx("nav", { className: "flex items-center gap-1", children: developers.links.map((link, index) => /* @__PURE__ */ jsx(
            Link,
            {
              href: link.url || "#",
              className: `px-3 py-1.5 text-sm rounded-md transition-colors ${link.active ? "bg-[#0f172a] text-white" : link.url ? "text-[#64748b] hover:bg-[#f1f5f9]" : "text-[#cbd5e1] cursor-not-allowed"}`,
              dangerouslySetInnerHTML: { __html: link.label }
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
        title: "Delete developer?",
        message: pendingDelete ? `"${pendingDelete.name}" will be permanently deleted. This can't be undone.` : "",
        confirmLabel: "Delete",
        onConfirm: confirmDelete,
        onCancel: () => setPendingDelete(null)
      }
    ),
    showCreateModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-[#0f172a] mb-4", children: "Add Developer" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3", children: [
        /* @__PURE__ */ jsx(
          DeveloperApiSearch,
          {
            label: "Search the developer directory (condos.ca)",
            onSelect: handleApiSelect
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-[#64748b]", children: isImportingFromApi ? "Importing developer..." : "Picking a result loads the developer (name, website, logo) into the database instantly — or enter the details manually below." }),
        apiImportError && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-[#dc2626]", children: apiImportError })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleCreate, children: [
        renderFormFields(),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 flex gap-3 justify-end", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                setShowCreateModal(false);
                setLogoPreview(null);
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
    showEditModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-[#0f172a] mb-4", children: "Edit Developer" }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleEdit, children: [
        renderFormFields(),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 flex gap-3 justify-end", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                setShowEditModal(false);
                setEditingDeveloper(null);
                setLogoPreview(null);
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
  DevelopersIndex as default
};
