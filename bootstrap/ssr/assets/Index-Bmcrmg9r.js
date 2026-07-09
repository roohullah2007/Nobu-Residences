import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useForm, Head, Link, router } from "@inertiajs/react";
import { A as AdminLayout } from "./AdminLayout-CfYoZrH6.js";
const PAGE_TYPE_LABELS = {
  global: "Global (all pages)",
  home: "Home",
  search: "Search Results",
  buildings: "Buildings Listing",
  building_detail: "Building Detail",
  developers: "Developers Listing",
  developer_detail: "Developer Detail",
  blog: "Blog",
  contact: "Contact",
  compare: "Compare",
  schools: "Schools"
};
function FaqsIndex({ faqs, pageTypes = [], filters = {} }) {
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [pageTypeFilter, setPageTypeFilter] = useState(filters.page_type || "");
  const { data, setData, post, put, processing, errors, reset } = useForm({
    question: "",
    answer: "",
    page_type: "global",
    sort_order: 0,
    is_active: true
  });
  const openCreateModal = () => {
    reset();
    setEditingFaq(null);
    setShowModal(true);
  };
  const openEditModal = (faq) => {
    setEditingFaq(faq);
    setData({
      question: faq.question,
      answer: faq.answer,
      page_type: faq.page_type,
      sort_order: faq.sort_order || 0,
      is_active: !!faq.is_active
    });
    setShowModal(true);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const options = {
      onSuccess: () => {
        reset();
        setShowModal(false);
        setEditingFaq(null);
      }
    };
    if (editingFaq) {
      put(route("admin.faqs.update", editingFaq.id), options);
    } else {
      post(route("admin.faqs.store"), options);
    }
  };
  const handleDelete = (faq) => {
    if (confirm(`Delete this FAQ?

"${faq.question}"`)) {
      router.delete(route("admin.faqs.destroy", faq.id));
    }
  };
  const applyFilters = (e) => {
    e?.preventDefault();
    router.get(
      route("admin.faqs.index"),
      { search: searchTerm, page_type: pageTypeFilter },
      { preserveState: true, preserveScroll: true }
    );
  };
  return /* @__PURE__ */ jsxs(AdminLayout, { title: "FAQs", children: [
    /* @__PURE__ */ jsx(Head, { title: "FAQs" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold text-[#0f172a]", children: "FAQs" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b] mt-1", children: "Site-wide FAQs shown on public pages (with FAQ schema markup for SEO)" })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: openCreateModal,
            className: "inline-flex items-center px-4 py-2.5 bg-[#0f172a] text-white text-sm font-medium rounded-lg hover:bg-[#1e293b] transition-colors",
            children: [
              /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 6v6m0 0v6m0-6h6m-6 0H6" }) }),
              "Add FAQ"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg border border-[#e2e8f0] p-4", children: /* @__PURE__ */ jsxs("form", { onSubmit: applyFilters, className: "flex flex-wrap gap-3 items-center", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "Search questions...",
            className: "flex-1 min-w-[200px] max-w-md px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]",
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value)
          }
        ),
        /* @__PURE__ */ jsxs(
          "select",
          {
            className: "px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg",
            value: pageTypeFilter,
            onChange: (e) => setPageTypeFilter(e.target.value),
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "All pages" }),
              pageTypes.map((type) => /* @__PURE__ */ jsx("option", { value: type, children: PAGE_TYPE_LABELS[type] || type }, type))
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            className: "px-4 py-2 text-sm font-medium text-white bg-[#0f172a] rounded-lg hover:bg-[#1e293b]",
            children: "Filter"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg border border-[#e2e8f0]", children: [
        faqs.data.length > 0 ? /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-[#e2e8f0]", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-[#f8fafc]", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Question" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Page" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Order" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Status" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "bg-white divide-y divide-[#e2e8f0]", children: faqs.data.map((faq) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-[#f8fafc] transition-colors", children: [
            /* @__PURE__ */ jsxs("td", { className: "px-4 py-4", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-[#0f172a]", children: faq.question }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-[#94a3b8] mt-1 line-clamp-2", children: faq.answer })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#f1f5f9] text-[#334155]", children: PAGE_TYPE_LABELS[faq.page_type] || faq.page_type }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-4 whitespace-nowrap text-sm text-[#64748b]", children: faq.sort_order }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx("span", { className: `inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${faq.is_active ? "bg-[#f0fdf4] text-[#16a34a]" : "bg-[#fef2f2] text-[#dc2626]"}`, children: faq.is_active ? "Active" : "Inactive" }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-4 whitespace-nowrap text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => openEditModal(faq),
                  className: "px-3 py-1.5 text-xs font-medium text-[#64748b] bg-[#f1f5f9] rounded-md hover:bg-[#e2e8f0] transition-colors",
                  children: "Edit"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleDelete(faq),
                  className: "px-3 py-1.5 text-xs font-medium text-[#dc2626] bg-[#fef2f2] rounded-md hover:bg-[#fee2e2] transition-colors",
                  children: "Delete"
                }
              )
            ] }) })
          ] }, faq.id)) })
        ] }) }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-[#0f172a]", children: "No FAQs found" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-[#94a3b8] mt-1", children: "Add your first FAQ — it will appear on the selected public page" })
        ] }),
        faqs.links && faqs.last_page > 1 && /* @__PURE__ */ jsxs("div", { className: "px-4 py-4 border-t border-[#e2e8f0] flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-[#64748b]", children: [
            "Showing ",
            faqs.from || 0,
            " to ",
            faqs.to || 0,
            " of ",
            faqs.total || 0
          ] }),
          /* @__PURE__ */ jsx("nav", { className: "flex items-center gap-1", children: faqs.links.map((link, index) => /* @__PURE__ */ jsx(
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
    showModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-[#0f172a] mb-4", children: editingFaq ? "Edit FAQ" : "Add FAQ" }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium text-[#0f172a] mb-1.5", children: [
              "Question ",
              /* @__PURE__ */ jsx("span", { className: "text-[#dc2626]", children: "*" })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                maxLength: 500,
                className: "w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]",
                value: data.question,
                onChange: (e) => setData("question", e.target.value),
                required: true
              }
            ),
            errors.question && /* @__PURE__ */ jsx("p", { className: "text-xs text-[#dc2626] mt-1", children: errors.question })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium text-[#0f172a] mb-1.5", children: [
              "Answer ",
              /* @__PURE__ */ jsx("span", { className: "text-[#dc2626]", children: "*" })
            ] }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                rows: 5,
                className: "w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]",
                value: data.answer,
                onChange: (e) => setData("answer", e.target.value),
                required: true
              }
            ),
            errors.answer && /* @__PURE__ */ jsx("p", { className: "text-xs text-[#dc2626] mt-1", children: errors.answer })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium text-[#0f172a] mb-1.5", children: [
                "Show on page ",
                /* @__PURE__ */ jsx("span", { className: "text-[#dc2626]", children: "*" })
              ] }),
              /* @__PURE__ */ jsx(
                "select",
                {
                  className: "w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg",
                  value: data.page_type,
                  onChange: (e) => setData("page_type", e.target.value),
                  required: true,
                  children: pageTypes.map((type) => /* @__PURE__ */ jsx("option", { value: type, children: PAGE_TYPE_LABELS[type] || type }, type))
                }
              ),
              errors.page_type && /* @__PURE__ */ jsx("p", { className: "text-xs text-[#dc2626] mt-1", children: errors.page_type })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-[#0f172a] mb-1.5", children: "Sort Order" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  className: "w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg",
                  value: data.sort_order,
                  onChange: (e) => setData("sort_order", e.target.value)
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: data.is_active,
                onChange: (e) => setData("is_active", e.target.checked),
                className: "rounded border-gray-300"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-sm text-[#0f172a]", children: "Active" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 flex gap-3 justify-end", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                setShowModal(false);
                setEditingFaq(null);
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
              children: processing ? "Saving..." : editingFaq ? "Save" : "Create"
            }
          )
        ] })
      ] })
    ] }) })
  ] });
}
export {
  FaqsIndex as default
};
