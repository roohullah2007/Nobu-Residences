import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { A as AdminLayout } from "./AdminLayout-CaxbTFCB.js";
function BlogCategoriesIndex({ categories, flash }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(categories.data.map((cat) => cat.id));
    } else {
      setSelectedIds([]);
    }
  };
  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };
  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this category?")) {
      router.delete(route("admin.blog-categories.destroy", id));
    }
  };
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      alert("Please select categories to delete");
      return;
    }
    if (confirm(`Are you sure you want to delete ${selectedIds.length} categories?`)) {
      router.post(route("admin.blog-categories.bulk-delete"), {
        ids: selectedIds
      });
    }
  };
  const handleToggleStatus = (category) => {
    router.patch(route("admin.blog-categories.update", category.id), {
      ...category,
      is_active: !category.is_active
    });
  };
  const totalCategories = categories.data?.length || 0;
  const activeCategories = categories.data?.filter((c) => c.is_active).length || 0;
  return /* @__PURE__ */ jsxs(AdminLayout, { title: "Blog Categories", children: [
    /* @__PURE__ */ jsx(Head, { title: "Blog Categories" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold text-[#0f172a]", children: "Blog Categories" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b] mt-1", children: "Organize your blog posts with categories" })
        ] }),
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("admin.blog-categories.create"),
            className: "inline-flex items-center px-4 py-2.5 bg-[#0f172a] text-white text-sm font-medium rounded-lg hover:bg-[#1e293b] transition-colors",
            children: [
              /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 6v6m0 0v6m0-6h6m-6 0H6" }) }),
              "Add Category"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg border border-[#e2e8f0] p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#64748b]", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" }) }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold text-[#0f172a]", children: totalCategories }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b]", children: "Total Categories" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg border border-[#e2e8f0] p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-[#f0fdf4] flex items-center justify-center text-[#16a34a]", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold text-[#0f172a]", children: activeCategories }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b]", children: "Active" })
          ] })
        ] }) })
      ] }),
      selectedIds.length > 0 && /* @__PURE__ */ jsx("div", { className: "bg-[#eff6ff] border border-[#bfdbfe] rounded-lg p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-sm font-medium text-[#1e40af]", children: [
          selectedIds.length,
          " categories selected"
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleBulkDelete,
            className: "inline-flex items-center px-3 py-1.5 text-sm font-medium text-[#dc2626] bg-[#fef2f2] rounded-md hover:bg-[#fee2e2] transition-colors",
            children: [
              /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 mr-1.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) }),
              "Delete Selected"
            ]
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg border border-[#e2e8f0]", children: [
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-[#e2e8f0]", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-[#f8fafc]", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { scope: "col", className: "px-4 py-3 text-left", children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                className: "h-4 w-4 text-[#0f172a] focus:ring-[#3b82f6] border-[#d1d5db] rounded",
                checked: selectedIds.length === categories.data.length && categories.data.length > 0,
                onChange: handleSelectAll
              }
            ) }),
            /* @__PURE__ */ jsx("th", { scope: "col", className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Image" }),
            /* @__PURE__ */ jsx("th", { scope: "col", className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Name" }),
            /* @__PURE__ */ jsx("th", { scope: "col", className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Slug" }),
            /* @__PURE__ */ jsx("th", { scope: "col", className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Posts" }),
            /* @__PURE__ */ jsx("th", { scope: "col", className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Status" }),
            /* @__PURE__ */ jsx("th", { scope: "col", className: "px-4 py-3 text-right text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "bg-white divide-y divide-[#e2e8f0]", children: categories.data.length > 0 ? categories.data.map((category) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-[#f8fafc] transition-colors", children: [
            /* @__PURE__ */ jsx("td", { className: "px-4 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                className: "h-4 w-4 text-[#0f172a] focus:ring-[#3b82f6] border-[#d1d5db] rounded",
                checked: selectedIds.includes(category.id),
                onChange: () => handleSelectOne(category.id)
              }
            ) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-4 whitespace-nowrap", children: category.featured_image ? /* @__PURE__ */ jsx(
              "img",
              {
                src: category.featured_image,
                alt: category.name,
                className: "h-10 w-10 rounded-lg object-cover"
              }
            ) : /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 text-[#94a3b8]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" }) }) }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-[#0f172a]", children: category.name }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx("span", { className: "text-sm text-[#64748b]", children: category.slug }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx("span", { className: "text-sm text-[#64748b]", children: category.blogs_count || 0 }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleToggleStatus(category),
                className: `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${category.is_active ? "bg-[#f0fdf4] text-[#16a34a]" : "bg-[#f1f5f9] text-[#64748b]"}`,
                children: category.is_active ? "Active" : "Inactive"
              }
            ) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-4 whitespace-nowrap text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
              /* @__PURE__ */ jsx(
                Link,
                {
                  href: route("admin.blog-categories.edit", category.id),
                  className: "inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-[#64748b] bg-[#f1f5f9] rounded-md hover:bg-[#e2e8f0] transition-colors",
                  children: "Edit"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleDelete(category.id),
                  disabled: category.blogs_count > 0,
                  className: "inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-[#dc2626] bg-[#fef2f2] rounded-md hover:bg-[#fee2e2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                  title: category.blogs_count > 0 ? "Cannot delete category with posts" : "",
                  children: "Delete"
                }
              )
            ] }) })
          ] }, category.id)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: "7", className: "px-4 py-12 text-center", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
            /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-lg bg-[#f1f5f9] flex items-center justify-center mb-3", children: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6 text-[#94a3b8]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" }) }) }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-[#0f172a]", children: "No categories found" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-[#94a3b8] mt-1", children: "Create your first category" })
          ] }) }) }) })
        ] }) }),
        categories.last_page > 1 && /* @__PURE__ */ jsxs("div", { className: "px-4 py-4 border-t border-[#e2e8f0] flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-[#64748b]", children: [
            "Showing ",
            categories.from,
            " to ",
            categories.to,
            " of ",
            categories.total,
            " results"
          ] }),
          /* @__PURE__ */ jsx("nav", { className: "flex items-center gap-1", children: categories.links.map((link, index) => /* @__PURE__ */ jsx(
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
    ] })
  ] });
}
export {
  BlogCategoriesIndex as default
};
