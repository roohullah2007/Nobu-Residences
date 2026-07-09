import { jsx, jsxs } from "react/jsx-runtime";
import { A as AdminLayout } from "./AdminLayout-DaZm4wHn.js";
import { Link } from "@inertiajs/react";
import "react";
function Dashboard({ title, stats, websites }) {
  const statCards = [
    {
      title: "Total Properties",
      value: stats.total_properties,
      change: "+12%",
      changeType: "increase",
      icon: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" }) })
    },
    {
      title: "Active Listings",
      value: stats.active_listings,
      change: "+8%",
      changeType: "increase",
      icon: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) })
    },
    {
      title: "Pending Review",
      value: stats.pending_listings,
      change: "-3%",
      changeType: "decrease",
      icon: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }) })
    },
    {
      title: "Total Users",
      value: stats.total_users,
      change: "+5%",
      changeType: "increase",
      icon: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" }) })
    }
  ];
  const quickActions = [
    {
      name: "Add Building",
      description: "Create a new building listing",
      href: route("admin.buildings.create"),
      icon: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M12 6v6m0 0v6m0-6h6m-6 0H6" }) })
    },
    {
      name: "Blog Post",
      description: "Write a new article",
      href: route("admin.blog.create"),
      icon: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" }) })
    },
    {
      name: "Contacts",
      description: "View inquiries",
      href: route("admin.contacts.index"),
      icon: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" }) })
    }
  ];
  return /* @__PURE__ */ jsx(AdminLayout, { title, children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", children: statCards.map((stat, index) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "bg-white rounded-lg border border-[#e2e8f0] p-5",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#64748b]", children: stat.icon }),
            /* @__PURE__ */ jsx("span", { className: `text-xs font-medium px-2 py-1 rounded ${stat.changeType === "increase" ? "text-[#16a34a] bg-[#f0fdf4]" : "text-[#dc2626] bg-[#fef2f2]"}`, children: stat.change })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold text-[#0f172a]", children: (stat.value ?? 0).toLocaleString() }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b] mt-1", children: stat.title })
          ] })
        ]
      },
      index
    )) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg border border-[#e2e8f0]", children: [
        /* @__PURE__ */ jsxs("div", { className: "px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold text-[#0f172a]", children: "Websites" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b] mt-0.5", children: "Manage your property websites" })
          ] }),
          /* @__PURE__ */ jsx(
            Link,
            {
              href: route("admin.websites.index"),
              className: "text-sm font-medium text-[#0f172a] hover:text-[#3b82f6] transition-colors",
              children: "View all"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "divide-y divide-[#e2e8f0]", children: websites.map((website) => /* @__PURE__ */ jsx("div", { className: "px-5 py-4 hover:bg-[#f8fafc] transition-colors", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-[#0f172a] flex items-center justify-center", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" }) }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-[#0f172a]", children: website.name }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-[#64748b] mt-0.5", children: website.domain })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-[#0f172a]", children: website.properties }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-[#64748b]", children: "properties" })
            ] }),
            /* @__PURE__ */ jsx("span", { className: `text-xs font-medium px-2.5 py-1 rounded-full ${website.status === "active" ? "bg-[#f0fdf4] text-[#16a34a]" : "bg-[#fefce8] text-[#ca8a04]"}`, children: website.status })
          ] })
        ] }) }, website.id)) })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg border border-[#e2e8f0]", children: [
          /* @__PURE__ */ jsx("div", { className: "px-5 py-4 border-b border-[#e2e8f0]", children: /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold text-[#0f172a]", children: "Quick Actions" }) }),
          /* @__PURE__ */ jsx("div", { className: "p-3", children: /* @__PURE__ */ jsx("div", { className: "space-y-1", children: quickActions.map((action) => /* @__PURE__ */ jsxs(
            Link,
            {
              href: action.href,
              className: "flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#f8fafc] transition-colors group",
              children: [
                /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-lg bg-[#f1f5f9] group-hover:bg-[#e2e8f0] flex items-center justify-center text-[#64748b] transition-colors", children: action.icon }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-[#0f172a]", children: action.name }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-[#64748b]", children: action.description })
                ] })
              ]
            },
            action.name
          )) }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg border border-[#e2e8f0] mt-4", children: [
          /* @__PURE__ */ jsx("div", { className: "px-5 py-4 border-b border-[#e2e8f0]", children: /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold text-[#0f172a]", children: "Recent Activity" }) }),
          /* @__PURE__ */ jsx("div", { className: "p-5", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full bg-[#3b82f6] mt-2" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm text-[#0f172a]", children: "New property listing added" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-[#64748b] mt-0.5", children: "2 hours ago" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full bg-[#f59e0b] mt-2" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm text-[#0f172a]", children: "New contact inquiry" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-[#64748b] mt-0.5", children: "Yesterday" })
              ] })
            ] })
          ] }) })
        ] })
      ] })
    ] })
  ] }) });
}
export {
  Dashboard as default
};
