import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { A as AdminLayout } from "./AdminLayout-DaZm4wHn.js";
function Index({ title, contacts, stats, filters, categories }) {
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const [processing, setProcessing] = useState(false);
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedContacts(contacts.data.map((contact) => contact.id));
    } else {
      setSelectedContacts([]);
    }
  };
  const handleSelectContact = (contactId) => {
    setSelectedContacts((prev) => {
      if (prev.includes(contactId)) {
        return prev.filter((id) => id !== contactId);
      } else {
        return [...prev, contactId];
      }
    });
  };
  const handleBulkAction = async () => {
    if (!bulkAction || selectedContacts.length === 0) return;
    setProcessing(true);
    try {
      await router.post("/admin/contacts/bulk-actions", {
        action: bulkAction,
        contacts: selectedContacts
      }, {
        preserveState: true,
        onSuccess: () => {
          setSelectedContacts([]);
          setBulkAction("");
        }
      });
    } finally {
      setProcessing(false);
    }
  };
  const handleFilter = (key, value) => {
    router.get("/admin/contacts", {
      ...filters,
      [key]: value
    }, {
      preserveState: true,
      replace: true
    });
  };
  const getStatusBadge = (isRead) => {
    if (isRead) {
      return /* @__PURE__ */ jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#f0fdf4] text-[#16a34a]", children: "Read" });
    } else {
      return /* @__PURE__ */ jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#fef2f2] text-[#dc2626]", children: "Unread" });
    }
  };
  const getCategoryBadges = (categoriesArray) => {
    return categoriesArray.map((category, index) => /* @__PURE__ */ jsx(
      "span",
      {
        className: "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#f1f5f9] text-[#475569] mr-1",
        children: category.charAt(0).toUpperCase() + category.slice(1)
      },
      index
    ));
  };
  return /* @__PURE__ */ jsxs(AdminLayout, { title: "Contacts", children: [
    /* @__PURE__ */ jsx(Head, { title }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold text-[#0f172a]", children: "Contacts" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b] mt-1", children: "Manage contact form submissions from visitors" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg border border-[#e2e8f0] p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#64748b]", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", d: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1.586l-4 4z" }) }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold text-[#0f172a]", children: stats?.total || 0 }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b]", children: "Total" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg border border-[#e2e8f0] p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-[#fef2f2] flex items-center justify-center text-[#dc2626]", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" }) }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold text-[#0f172a]", children: stats?.unread || 0 }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b]", children: "Unread" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg border border-[#e2e8f0] p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-[#f0fdf4] flex items-center justify-center text-[#16a34a]", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" }) }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold text-[#0f172a]", children: stats?.today || 0 }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b]", children: "Today" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg border border-[#e2e8f0] p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-[#f5f3ff] flex items-center justify-center text-[#7c3aed]", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" }) }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold text-[#0f172a]", children: stats?.this_week || 0 }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b]", children: "This Week" })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg border border-[#e2e8f0] p-4", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-[#64748b] mb-1.5", children: "Status" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: filters?.status || "all",
              onChange: (e) => handleFilter("status", e.target.value),
              className: "block w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all",
              children: [
                /* @__PURE__ */ jsx("option", { value: "all", children: "All Status" }),
                /* @__PURE__ */ jsx("option", { value: "unread", children: "Unread" }),
                /* @__PURE__ */ jsx("option", { value: "read", children: "Read" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-[#64748b] mb-1.5", children: "Category" }),
          /* @__PURE__ */ jsx(
            "select",
            {
              value: filters?.category || "all",
              onChange: (e) => handleFilter("category", e.target.value),
              className: "block w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all",
              children: categories && Object.entries(categories).map(([value, label]) => /* @__PURE__ */ jsx("option", { value, children: label }, value))
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-[#64748b] mb-1.5", children: "Search" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: /* @__PURE__ */ jsx("svg", { className: "h-4 w-4 text-[#94a3b8]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }) }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: filters?.search || "",
                onChange: (e) => handleFilter("search", e.target.value),
                placeholder: "Search by name, email, or message...",
                className: "block w-full pl-9 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all"
              }
            )
          ] })
        ] })
      ] }) }),
      selectedContacts.length > 0 && /* @__PURE__ */ jsx("div", { className: "bg-[#eff6ff] border border-[#bfdbfe] rounded-lg p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between flex-wrap gap-3", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-sm font-medium text-[#1e40af]", children: [
          selectedContacts.length,
          " contact(s) selected"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: bulkAction,
              onChange: (e) => setBulkAction(e.target.value),
              className: "px-3 py-2 text-sm border border-[#bfdbfe] rounded-lg bg-white focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Select action..." }),
                /* @__PURE__ */ jsx("option", { value: "mark_read", children: "Mark as Read" }),
                /* @__PURE__ */ jsx("option", { value: "mark_unread", children: "Mark as Unread" }),
                /* @__PURE__ */ jsx("option", { value: "delete", children: "Delete" })
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleBulkAction,
              disabled: !bulkAction || processing,
              className: "px-4 py-2 text-sm font-medium text-white bg-[#0f172a] rounded-lg hover:bg-[#1e293b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              children: processing ? "Processing..." : "Apply"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setSelectedContacts([]),
              className: "px-4 py-2 text-sm font-medium text-[#64748b] bg-white rounded-lg hover:bg-[#f1f5f9] transition-colors border border-[#e2e8f0]",
              children: "Clear"
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg border border-[#e2e8f0]", children: [
        contacts.data.length > 0 ? /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-[#e2e8f0]", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-[#f8fafc]", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { scope: "col", className: "px-4 py-3 text-left", children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                onChange: handleSelectAll,
                checked: selectedContacts.length === contacts.data.length,
                className: "h-4 w-4 text-[#0f172a] focus:ring-[#3b82f6] border-[#d1d5db] rounded"
              }
            ) }),
            /* @__PURE__ */ jsx("th", { scope: "col", className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Contact" }),
            /* @__PURE__ */ jsx("th", { scope: "col", className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Categories" }),
            /* @__PURE__ */ jsx("th", { scope: "col", className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Status" }),
            /* @__PURE__ */ jsx("th", { scope: "col", className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Submitted" }),
            /* @__PURE__ */ jsx("th", { scope: "col", className: "px-4 py-3 text-right text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "bg-white divide-y divide-[#e2e8f0]", children: contacts.data.map((contact) => /* @__PURE__ */ jsxs("tr", { className: `${!contact.is_read ? "bg-[#fafbff]" : ""} hover:bg-[#f8fafc] transition-colors`, children: [
            /* @__PURE__ */ jsx("td", { className: "px-4 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: selectedContacts.includes(contact.id),
                onChange: () => handleSelectContact(contact.id),
                className: "h-4 w-4 text-[#0f172a] focus:ring-[#3b82f6] border-[#d1d5db] rounded"
              }
            ) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
              /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 h-10 w-10", children: /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-lg bg-[#0f172a] flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-white", children: contact.name.charAt(0).toUpperCase() }) }) }),
              /* @__PURE__ */ jsxs("div", { className: "ml-3", children: [
                /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-[#0f172a]", children: contact.name }),
                /* @__PURE__ */ jsx("div", { className: "text-xs text-[#64748b]", children: contact.email }),
                contact.phone && /* @__PURE__ */ jsx("div", { className: "text-xs text-[#94a3b8]", children: contact.phone })
              ] })
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1", children: getCategoryBadges(contact.categories_array || []) }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-4 whitespace-nowrap", children: getStatusBadge(contact.is_read) }),
            /* @__PURE__ */ jsxs("td", { className: "px-4 py-4 whitespace-nowrap", children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm text-[#0f172a]", children: contact.time_ago }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-[#94a3b8]", children: new Date(contact.created_at).toLocaleDateString() })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-4 whitespace-nowrap text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
              /* @__PURE__ */ jsxs(
                Link,
                {
                  href: `/admin/contacts/${contact.id}`,
                  className: "inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-[#3b82f6] bg-[#eff6ff] rounded-md hover:bg-[#dbeafe] transition-colors",
                  children: [
                    /* @__PURE__ */ jsxs("svg", { className: "w-3.5 h-3.5 mr-1", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [
                      /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" }),
                      /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" })
                    ] }),
                    "View"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => {
                    if (confirm("Delete this contact?")) {
                      router.delete(`/admin/contacts/${contact.id}`);
                    }
                  },
                  className: "inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-[#dc2626] bg-[#fef2f2] rounded-md hover:bg-[#fee2e2] transition-colors",
                  children: [
                    /* @__PURE__ */ jsx("svg", { className: "w-3.5 h-3.5 mr-1", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) }),
                    "Delete"
                  ]
                }
              )
            ] }) })
          ] }, contact.id)) })
        ] }) }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
          /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-lg bg-[#f1f5f9] flex items-center justify-center mx-auto mb-3", children: /* @__PURE__ */ jsx("svg", { className: "h-6 w-6 text-[#94a3b8]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", d: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1.586l-4 4z" }) }) }),
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-[#0f172a]", children: "No contacts" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-[#94a3b8] mt-1", children: "No contact form submissions found" })
        ] }),
        contacts.links && contacts.last_page > 1 && /* @__PURE__ */ jsxs("div", { className: "px-4 py-4 border-t border-[#e2e8f0] flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-[#64748b]", children: [
            "Showing ",
            contacts.from || 0,
            " to ",
            contacts.to || 0,
            " of ",
            contacts.total || 0,
            " results"
          ] }),
          /* @__PURE__ */ jsx("nav", { className: "flex items-center gap-1", children: contacts.links.map((link, index) => /* @__PURE__ */ jsx(
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
    ] })
  ] });
}
export {
  Index as default
};
