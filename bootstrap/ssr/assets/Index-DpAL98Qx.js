import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { usePage, Head, Link, router } from "@inertiajs/react";
import { A as AdminLayout } from "./AdminLayout-l5p_UGn9.js";
import { useState } from "react";
function Index({ auth }) {
  const { websites, title } = usePage().props;
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const toggleDropdown = (websiteId) => {
    setOpenDropdownId(openDropdownId === websiteId ? null : websiteId);
  };
  const handleDelete = (website) => {
    const ploiNote = website.domain ? `

This will also remove the domain alias "${website.domain}" from the Ploi site (the SSL certificate will be left alone to avoid breaking other domains).` : "";
    if (confirm(`Are you sure you want to delete "${website.name}"? This action cannot be undone.${ploiNote}`)) {
      router.delete(route("admin.websites.destroy", website.id), {
        preserveScroll: true
      });
    }
  };
  const handleDuplicate = (website) => {
    if (confirm(`Create a duplicate of "${website.name}"?`)) {
      router.post(route("admin.websites.duplicate", website.id), {}, {
        preserveScroll: true
      });
    }
  };
  const getPreviewUrl = (website) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}?website=${website.slug}`;
  };
  const getProductionUrl = (website) => {
    if (website.domain) {
      return `https://${website.domain}`;
    }
    return null;
  };
  const totalWebsites = websites?.length || 0;
  const activeWebsites = websites?.filter((w) => w.is_active).length || 0;
  return /* @__PURE__ */ jsxs(AdminLayout, { title: "Websites", children: [
    /* @__PURE__ */ jsx(Head, { title }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold text-[#0f172a]", children: "Websites" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b] mt-1", children: "Manage and configure your real estate websites" })
        ] }),
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("admin.websites.create"),
            className: "inline-flex items-center px-4 py-2.5 bg-[#0f172a] text-white text-sm font-medium rounded-lg hover:bg-[#1e293b] transition-colors",
            children: [
              /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 6v6m0 0v6m0-6h6m-6 0H6" }) }),
              "Add Website"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg border border-[#e2e8f0] p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#64748b]", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" }) }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold text-[#0f172a]", children: totalWebsites }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b]", children: "Total Websites" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg border border-[#e2e8f0] p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-[#f0fdf4] flex items-center justify-center text-[#16a34a]", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold text-[#0f172a]", children: activeWebsites }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b]", children: "Active" })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg border border-[#e2e8f0]", children: /* @__PURE__ */ jsx("div", { className: "overflow-visible", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-[#e2e8f0]", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-[#f8fafc]", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Website" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Status" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Domain" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Pages" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-right text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "bg-white divide-y divide-[#e2e8f0]", children: websites && websites.length > 0 ? websites.map((website) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-[#f8fafc] transition-colors", children: [
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
            /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 h-10 w-10", children: /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-lg bg-[#0f172a] flex items-center justify-center", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" }) }) }) }),
            /* @__PURE__ */ jsxs("div", { className: "ml-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-[#0f172a]", children: website.name }),
                website.is_default && /* @__PURE__ */ jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#eff6ff] text-[#1e40af]", children: "Default" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-[#94a3b8]", children: website.slug })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${website.is_active ? "bg-[#f0fdf4] text-[#16a34a]" : "bg-[#fef2f2] text-[#dc2626]"}`, children: website.is_active ? "Active" : "Inactive" }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-[#0f172a]", children: website.domain || "Default Domain" }),
          /* @__PURE__ */ jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-[#64748b]", children: [
            website.pages ? website.pages.length : 0,
            " pages"
          ] }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-right", children: /* @__PURE__ */ jsxs("div", { className: "relative inline-block text-left", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => toggleDropdown(website.id),
                className: "inline-flex items-center p-2 text-[#64748b] bg-[#f1f5f9] rounded-lg hover:bg-[#e2e8f0] transition-colors",
                children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx("path", { d: "M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" }) })
              }
            ),
            openDropdownId === website.id && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "fixed inset-0 z-40",
                  onClick: () => setOpenDropdownId(null)
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "absolute right-0 z-50 mt-2 w-56 bg-white border border-[#e2e8f0] rounded-lg shadow-lg", children: /* @__PURE__ */ jsxs("div", { className: "py-1", children: [
                /* @__PURE__ */ jsxs(
                  "a",
                  {
                    href: getPreviewUrl(website),
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "flex items-center px-4 py-2 text-sm text-[#0f172a] hover:bg-[#f8fafc] transition-colors",
                    children: [
                      /* @__PURE__ */ jsxs("svg", { className: "w-4 h-4 mr-3 text-[#64748b]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [
                        /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" }),
                        /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" })
                      ] }),
                      "Preview Website"
                    ]
                  }
                ),
                getProductionUrl(website) && /* @__PURE__ */ jsxs(
                  "a",
                  {
                    href: getProductionUrl(website),
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "flex items-center px-4 py-2 text-sm text-[#0f172a] hover:bg-[#f8fafc] transition-colors",
                    children: [
                      /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 mr-3 text-[#16a34a]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", d: "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" }) }),
                      "Visit Domain"
                    ]
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "border-t border-[#e2e8f0] my-1" }),
                /* @__PURE__ */ jsxs(
                  Link,
                  {
                    href: route("admin.websites.show", website.id),
                    className: "flex items-center px-4 py-2 text-sm text-[#0f172a] hover:bg-[#f8fafc] transition-colors",
                    onClick: () => setOpenDropdownId(null),
                    children: [
                      /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 mr-3 text-[#64748b]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
                      "View Details"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  Link,
                  {
                    href: route("admin.websites.edit", website.id),
                    className: "flex items-center px-4 py-2 text-sm text-[#0f172a] hover:bg-[#f8fafc] transition-colors",
                    onClick: () => setOpenDropdownId(null),
                    children: [
                      /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 mr-3 text-[#64748b]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" }) }),
                      "Edit Settings"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  Link,
                  {
                    href: route("admin.websites.pages", website.id),
                    className: "flex items-center px-4 py-2 text-sm text-[#0f172a] hover:bg-[#f8fafc] transition-colors",
                    onClick: () => setOpenDropdownId(null),
                    children: [
                      /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 mr-3 text-[#64748b]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }) }),
                      "Manage Pages"
                    ]
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "border-t border-[#e2e8f0] my-1" }),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => {
                      setOpenDropdownId(null);
                      handleDuplicate(website);
                    },
                    className: "flex items-center w-full px-4 py-2 text-sm text-[#0f172a] hover:bg-[#f8fafc] transition-colors",
                    children: [
                      /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 mr-3 text-[#64748b]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", d: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" }) }),
                      "Duplicate Website"
                    ]
                  }
                ),
                !website.is_default && /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx("div", { className: "border-t border-[#e2e8f0] my-1" }),
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: () => {
                        setOpenDropdownId(null);
                        handleDelete(website);
                      },
                      className: "flex items-center w-full px-4 py-2 text-sm text-[#dc2626] hover:bg-[#fef2f2] transition-colors",
                      children: [
                        /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 mr-3", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) }),
                        "Delete Website"
                      ]
                    }
                  )
                ] })
              ] }) })
            ] })
          ] }) })
        ] }, website.id)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: "5", className: "px-6 py-12 text-center", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
          /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-lg bg-[#f1f5f9] flex items-center justify-center mb-3", children: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6 text-[#94a3b8]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" }) }) }),
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-[#0f172a]", children: "No websites found" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-[#94a3b8] mt-1 mb-4", children: "Create your first website to get started" }),
          /* @__PURE__ */ jsxs(
            Link,
            {
              href: route("admin.websites.create"),
              className: "inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#0f172a] rounded-lg hover:bg-[#1e293b] transition-colors",
              children: [
                /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 6v6m0 0v6m0-6h6m-6 0H6" }) }),
                "Add Website"
              ]
            }
          )
        ] }) }) }) })
      ] }) }) })
    ] })
  ] });
}
export {
  Index as default
};
