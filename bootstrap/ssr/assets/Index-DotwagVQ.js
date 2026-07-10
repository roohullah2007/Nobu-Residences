import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { usePage, Head, Link, router } from "@inertiajs/react";
import { A as AdminLayout } from "./AdminLayout-B_5R_DFk.js";
function BlogIndex() {
  const { blogs, categories, filters } = usePage().props;
  const [selectedItems, setSelectedItems] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const search = formData.get("search");
    const category = formData.get("category");
    const status = formData.get("status");
    router.get(route("admin.blog.index"), { search, category, status }, {
      preserveState: true,
      replace: true
    });
  };
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(blogs.data.map((blog) => blog.id));
    } else {
      setSelectedItems([]);
    }
  };
  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((item) => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };
  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return;
    router.post(route("admin.blog.bulk-delete"), { ids: selectedItems }, {
      onSuccess: () => {
        setSelectedItems([]);
        setShowDeleteModal(false);
      }
    });
  };
  const getStatusBadge = (status) => {
    const badges = {
      published: "bg-[#f0fdf4] text-[#16a34a]",
      draft: "bg-[#fefce8] text-[#ca8a04]"
    };
    return badges[status] || "bg-[#f1f5f9] text-[#64748b]";
  };
  const formatDate = (dateString) => {
    if (!dateString) return "Not published";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };
  const totalPosts = blogs.total || blogs.data?.length || 0;
  const publishedPosts = blogs.data?.filter((b) => b.status === "published").length || 0;
  const draftPosts = blogs.data?.filter((b) => b.status === "draft").length || 0;
  return /* @__PURE__ */ jsxs(AdminLayout, { title: "Blog", children: [
    /* @__PURE__ */ jsx(Head, { title: "Blog" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold text-[#0f172a]", children: "Blog Posts" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b] mt-1", children: "Create and manage your blog content" })
        ] }),
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("admin.blog.create"),
            className: "inline-flex items-center px-4 py-2.5 bg-[#0f172a] text-white text-sm font-medium rounded-lg hover:bg-[#1e293b] transition-colors",
            children: [
              /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 4v16m8-8H4" }) }),
              "New Post"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg border border-[#e2e8f0] p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#64748b]", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" }) }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold text-[#0f172a]", children: totalPosts }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b]", children: "Total Posts" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg border border-[#e2e8f0] p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-[#f0fdf4] flex items-center justify-center text-[#16a34a]", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold text-[#0f172a]", children: publishedPosts }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b]", children: "Published" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg border border-[#e2e8f0] p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-[#fefce8] flex items-center justify-center text-[#ca8a04]", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" }) }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold text-[#0f172a]", children: draftPosts }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b]", children: "Drafts" })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg border border-[#e2e8f0] p-4", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSearch, className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "search", className: "block text-xs font-medium text-[#64748b] mb-1.5", children: "Search" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: /* @__PURE__ */ jsx("svg", { className: "h-4 w-4 text-[#94a3b8]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }) }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                name: "search",
                id: "search",
                defaultValue: filters?.search || "",
                placeholder: "Search posts...",
                className: "block w-full pl-9 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "category", className: "block text-xs font-medium text-[#64748b] mb-1.5", children: "Category" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              name: "category",
              id: "category",
              defaultValue: filters?.category || "",
              className: "block w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "All Categories" }),
                categories?.map((category) => /* @__PURE__ */ jsx("option", { value: category, children: category }, category))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "status", className: "block text-xs font-medium text-[#64748b] mb-1.5", children: "Status" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              name: "status",
              id: "status",
              defaultValue: filters?.status || "",
              className: "block w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "All Status" }),
                /* @__PURE__ */ jsx("option", { value: "published", children: "Published" }),
                /* @__PURE__ */ jsx("option", { value: "draft", children: "Draft" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-end", children: /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            className: "w-full px-4 py-2 bg-[#f1f5f9] text-[#475569] text-sm font-medium rounded-lg hover:bg-[#e2e8f0] transition-colors",
            children: "Apply Filters"
          }
        ) })
      ] }) }),
      selectedItems.length > 0 && /* @__PURE__ */ jsx("div", { className: "bg-[#eff6ff] border border-[#bfdbfe] rounded-lg p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-sm font-medium text-[#1e40af]", children: [
          selectedItems.length,
          " item(s) selected"
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setShowDeleteModal(true),
            className: "inline-flex items-center px-3 py-1.5 text-sm font-medium text-[#dc2626] bg-[#fef2f2] rounded-md hover:bg-[#fee2e2] transition-colors",
            children: [
              /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 mr-1.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) }),
              "Delete Selected"
            ]
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg border border-[#e2e8f0]", children: [
        blogs.data && blogs.data.length > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "px-4 py-3 border-b border-[#e2e8f0] bg-[#f8fafc]", children: /* @__PURE__ */ jsxs("label", { className: "flex items-center cursor-pointer", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: selectedItems.length === blogs.data.length,
                onChange: handleSelectAll,
                className: "h-4 w-4 text-[#0f172a] focus:ring-[#3b82f6] border-[#d1d5db] rounded"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "ml-3 text-sm font-medium text-[#64748b]", children: "Select All" })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "divide-y divide-[#e2e8f0]", children: blogs.data.map((blog) => /* @__PURE__ */ jsx("div", { className: "px-4 py-4 hover:bg-[#f8fafc] transition-colors", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: selectedItems.includes(blog.id),
                onChange: () => handleSelectItem(blog.id),
                className: "mt-1 h-4 w-4 text-[#0f172a] focus:ring-[#3b82f6] border-[#d1d5db] rounded"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: blog.image ? /* @__PURE__ */ jsx(
              "img",
              {
                src: blog.image,
                alt: blog.title,
                className: "h-16 w-16 object-cover rounded-lg"
              }
            ) : /* @__PURE__ */ jsx("div", { className: "h-16 w-16 bg-[#f1f5f9] rounded-lg flex items-center justify-center", children: /* @__PURE__ */ jsx("svg", { className: "h-6 w-6 text-[#94a3b8]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" }) }) }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-[#0f172a] truncate", children: blog.title }),
                /* @__PURE__ */ jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(blog.status)}`, children: blog.status }),
                blog.category && /* @__PURE__ */ jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#f1f5f9] text-[#475569]", children: blog.category })
              ] }),
              blog.excerpt && /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b] line-clamp-1 mb-2", children: blog.excerpt }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-xs text-[#94a3b8]", children: [
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx("svg", { className: "w-3.5 h-3.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" }) }),
                  blog.author || "Admin"
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx("svg", { className: "w-3.5 h-3.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" }) }),
                  formatDate(blog.published_at)
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxs(
                Link,
                {
                  href: route("admin.blog.edit", blog.id),
                  className: "inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-[#64748b] bg-[#f1f5f9] rounded-md hover:bg-[#e2e8f0] transition-colors",
                  children: [
                    /* @__PURE__ */ jsx("svg", { className: "w-3.5 h-3.5 mr-1", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" }) }),
                    "Edit"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                Link,
                {
                  href: route("blog.detail", blog.slug || blog.id),
                  target: "_blank",
                  className: "inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-[#3b82f6] bg-[#eff6ff] rounded-md hover:bg-[#dbeafe] transition-colors",
                  children: [
                    /* @__PURE__ */ jsx("svg", { className: "w-3.5 h-3.5 mr-1", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" }) }),
                    "View"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                Link,
                {
                  href: route("admin.blog.destroy", blog.id),
                  method: "delete",
                  as: "button",
                  className: "inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-[#dc2626] bg-[#fef2f2] rounded-md hover:bg-[#fee2e2] transition-colors",
                  onBefore: () => confirm("Delete this post?"),
                  children: [
                    /* @__PURE__ */ jsx("svg", { className: "w-3.5 h-3.5 mr-1", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) }),
                    "Delete"
                  ]
                }
              )
            ] })
          ] }) }, blog.id)) })
        ] }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
          /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-lg bg-[#f1f5f9] flex items-center justify-center mx-auto mb-3", children: /* @__PURE__ */ jsx("svg", { className: "h-6 w-6 text-[#94a3b8]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" }) }) }),
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-[#0f172a]", children: "No blog posts" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-[#94a3b8] mt-1 mb-4", children: "Get started by creating your first post" }),
          /* @__PURE__ */ jsxs(
            Link,
            {
              href: route("admin.blog.create"),
              className: "inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#0f172a] rounded-lg hover:bg-[#1e293b] transition-colors",
              children: [
                /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 4v16m8-8H4" }) }),
                "New Post"
              ]
            }
          )
        ] }),
        blogs.links && blogs.last_page > 1 && /* @__PURE__ */ jsxs("div", { className: "px-4 py-4 border-t border-[#e2e8f0] flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-[#64748b]", children: [
            "Showing ",
            blogs.from || 0,
            " to ",
            blogs.to || 0,
            " of ",
            blogs.total || 0,
            " posts"
          ] }),
          /* @__PURE__ */ jsx("nav", { className: "flex items-center gap-1", children: blogs.links.map((link, index) => /* @__PURE__ */ jsx(
            Link,
            {
              href: link.url || "#",
              className: `px-3 py-1.5 text-sm rounded-md transition-colors ${link.active ? "bg-[#0f172a] text-white" : link.url ? "text-[#64748b] hover:bg-[#f1f5f9]" : "text-[#cbd5e1] cursor-not-allowed"}`,
              dangerouslySetInnerHTML: { __html: link.label },
              preserveState: true
            },
            index
          )) })
        ] })
      ] })
    ] }),
    showDeleteModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 p-6", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-12 h-12 rounded-full bg-[#fef2f2] mx-auto mb-4", children: /* @__PURE__ */ jsx("svg", { className: "h-6 w-6 text-[#dc2626]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" }) }) }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-[#0f172a] text-center mb-2", children: "Delete Posts" }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-[#64748b] text-center mb-6", children: [
        "Are you sure you want to delete ",
        selectedItems.length,
        " post(s)? This cannot be undone."
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setShowDeleteModal(false),
            className: "flex-1 px-4 py-2 text-sm font-medium text-[#64748b] bg-[#f1f5f9] rounded-lg hover:bg-[#e2e8f0] transition-colors",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleBulkDelete,
            className: "flex-1 px-4 py-2 text-sm font-medium text-white bg-[#dc2626] rounded-lg hover:bg-[#b91c1c] transition-colors",
            children: "Delete"
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  BlogIndex as default
};
