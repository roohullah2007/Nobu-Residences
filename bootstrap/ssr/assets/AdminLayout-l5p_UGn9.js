import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { usePage, Head, Link } from "@inertiajs/react";
function AdminLayout({ children, title = "Admin" }) {
  const { auth } = usePage().props;
  const { url } = usePage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [realEstateOpen, setRealEstateOpen] = useState(url?.startsWith("/admin/real-estate") || url?.startsWith("/admin/buildings") || url?.startsWith("/admin/amenities") || url?.startsWith("/admin/maintenance-fee-amenities") || url?.startsWith("/admin/neighbourhoods") || url?.startsWith("/admin/sub-neighbourhoods") || url?.startsWith("/admin/developers") || false);
  const navigation = [
    {
      name: "Dashboard",
      href: route("admin.dashboard"),
      icon: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" }) }),
      current: url === "/admin" || url === "/admin/dashboard"
    },
    {
      name: "Websites",
      href: route("admin.websites.index"),
      icon: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" }) }),
      current: url?.startsWith("/admin/websites") || false
    },
    {
      name: "Real Estate",
      href: "#",
      icon: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" }) }),
      current: url?.startsWith("/admin/real-estate") || url?.startsWith("/admin/buildings") || url?.startsWith("/admin/amenities") || url?.startsWith("/admin/maintenance-fee-amenities") || url?.startsWith("/admin/neighbourhoods") || url?.startsWith("/admin/sub-neighbourhoods") || url?.startsWith("/admin/developers") || false,
      hasSubmenu: true,
      submenu: [
        {
          name: "Buildings",
          href: route("admin.buildings.index"),
          current: url?.startsWith("/admin/buildings") || false
        },
        {
          name: "Developers",
          href: route("admin.developers.index"),
          current: url?.startsWith("/admin/developers") || url?.startsWith("/admin/real-estate/developers") || false
        },
        {
          name: "Amenities",
          href: route("admin.amenities.index"),
          current: url?.startsWith("/admin/amenities") || false
        },
        {
          name: "Maintenance Fees",
          href: route("admin.maintenance-fee-amenities.index"),
          current: url?.startsWith("/admin/maintenance-fee-amenities") || false
        },
        {
          name: "Neighbourhoods",
          href: route("admin.neighbourhoods.index"),
          current: url?.startsWith("/admin/neighbourhoods") || false
        },
        {
          name: "Sub-Neighbourhoods",
          href: route("admin.sub-neighbourhoods.index"),
          current: url?.startsWith("/admin/sub-neighbourhoods") || false
        }
      ]
    },
    {
      name: "Tour Requests",
      href: route("admin.tour-requests.index"),
      icon: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" }) }),
      current: url?.startsWith("/admin/tour-requests") || false
    },
    {
      name: "Saved Searches",
      href: route("admin.saved-searches.index"),
      icon: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" }) }),
      current: url?.startsWith("/admin/saved-searches") || false
    },
    {
      name: "Property Questions",
      href: route("admin.property-questions.index"),
      icon: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
      current: url?.startsWith("/admin/property-questions") || false
    },
    {
      name: "Contacts",
      href: route("admin.contacts.index"),
      icon: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" }) }),
      current: url?.startsWith("/admin/contacts") || false
    },
    {
      name: "Blog Posts",
      href: route("admin.blog.index"),
      icon: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" }) }),
      current: url?.startsWith("/admin/blog") && !url?.startsWith("/admin/blog-categories") || false
    },
    {
      name: "Blog Categories",
      href: route("admin.blog-categories.index"),
      icon: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" }) }),
      current: url?.startsWith("/admin/blog-categories") || false
    },
    {
      name: "Users",
      href: route("admin.users.index"),
      icon: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-5.13a4 4 0 11-8 0 4 4 0 018 0zm6 4a3 3 0 11-6 0 3 3 0 016 0z" }) }),
      current: url?.startsWith("/admin/users") || false
    },
    {
      name: "Settings",
      href: route("admin.settings.index"),
      icon: /* @__PURE__ */ jsxs("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [
        /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" }),
        /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" })
      ] }),
      current: url?.startsWith("/admin/settings") || false
    }
  ];
  const NavItem = ({ item, mobile = false }) => {
    if (item.hasSubmenu) {
      return /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setRealEstateOpen(!realEstateOpen),
            className: `w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${item.current ? "bg-[#1e293b] text-white" : "text-[#94a3b8] hover:text-white hover:bg-[#1e293b]"}`,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("span", { className: item.current ? "text-white" : "text-[#64748b]", children: item.icon }),
                /* @__PURE__ */ jsx("span", { children: item.name })
              ] }),
              /* @__PURE__ */ jsx(
                "svg",
                {
                  className: `w-4 h-4 transition-transform ${realEstateOpen ? "rotate-180" : ""}`,
                  fill: "none",
                  stroke: "currentColor",
                  viewBox: "0 0 24 24",
                  children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" })
                }
              )
            ]
          }
        ),
        realEstateOpen && /* @__PURE__ */ jsx("div", { className: "mt-1 ml-4 pl-4 border-l border-[#334155] space-y-1", children: item.submenu.map((subItem) => /* @__PURE__ */ jsx(
          Link,
          {
            href: subItem.href,
            className: `block px-3 py-2 text-sm rounded-lg transition-colors ${subItem.current ? "text-white bg-[#1e293b]" : "text-[#94a3b8] hover:text-white hover:bg-[#1e293b]"}`,
            children: subItem.name
          },
          subItem.name
        )) })
      ] });
    }
    return /* @__PURE__ */ jsxs(
      Link,
      {
        href: item.href,
        className: `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${item.current ? "bg-[#1e293b] text-white" : "text-[#94a3b8] hover:text-white hover:bg-[#1e293b]"}`,
        children: [
          /* @__PURE__ */ jsx("span", { className: item.current ? "text-white" : "text-[#64748b]", children: item.icon }),
          /* @__PURE__ */ jsx("span", { children: item.name })
        ]
      }
    );
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#f8fafc]", children: [
    /* @__PURE__ */ jsx(Head, { title }),
    sidebarOpen && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 lg:hidden", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "fixed inset-0 bg-black/50",
          onClick: () => setSidebarOpen(false)
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "fixed inset-y-0 left-0 w-[85vw] max-w-72 bg-[#0f172a] overflow-y-auto", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between h-16 px-6 border-b border-[#1e293b]", children: [
          /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold text-white", children: "Nobu Admin" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setSidebarOpen(false),
              "aria-label": "Close navigation menu",
              className: "p-1 text-[#94a3b8] hover:text-white",
              children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
            }
          )
        ] }),
        /* @__PURE__ */ jsx("nav", { className: "px-4 py-6 space-y-1", children: navigation.map((item) => /* @__PURE__ */ jsx(NavItem, { item, mobile: true }, item.name)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("aside", { className: "fixed inset-y-0 left-0 z-40 hidden w-64 bg-[#0f172a] lg:block", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center h-16 px-6 border-b border-[#1e293b]", children: /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold text-white", children: "Nobu Admin" }) }),
      /* @__PURE__ */ jsx("nav", { className: "px-4 py-6 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]", children: navigation.map((item) => /* @__PURE__ */ jsx(NavItem, { item }, item.name)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "lg:pl-64", children: [
      /* @__PURE__ */ jsx("header", { className: "sticky top-0 z-30 h-16 bg-white border-b border-[#e2e8f0]", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between h-full px-4 sm:px-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setSidebarOpen(true),
              "aria-label": "Open navigation menu",
              "aria-expanded": sidebarOpen,
              className: "p-2 -ml-2 text-[#64748b] hover:text-[#0f172a] lg:hidden",
              children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 6h16M4 12h16M4 18h16" }) })
            }
          ),
          /* @__PURE__ */ jsx("h1", { className: "text-lg font-semibold text-[#0f172a]", children: title })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: "/",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-[#64748b] hover:text-[#0f172a] border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] transition-colors",
              children: [
                /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" }) }),
                "View Site"
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 pl-3 border-l border-[#e2e8f0]", children: [
            /* @__PURE__ */ jsxs(
              Link,
              {
                href: route("profile.edit"),
                "aria-label": `Profile: ${auth?.user?.name || "User"}`,
                className: "flex items-center gap-2 text-sm text-[#64748b] hover:text-[#0f172a]",
                children: [
                  /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-[#0f172a] flex items-center justify-center", "aria-hidden": "true", children: /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-white", children: auth?.user?.name?.charAt(0)?.toUpperCase() || "U" }) }),
                  /* @__PURE__ */ jsx("span", { className: "hidden sm:inline font-medium", children: auth?.user?.name || "User" })
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              Link,
              {
                href: route("logout"),
                method: "post",
                as: "button",
                "aria-label": "Log out",
                className: "p-2 text-[#64748b] hover:text-[#dc2626] rounded-lg hover:bg-[#fef2f2] transition-colors",
                title: "Log out",
                children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" }) })
              }
            )
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("main", { className: "p-4 sm:p-6", children })
    ] })
  ] });
}
export {
  AdminLayout as A
};
