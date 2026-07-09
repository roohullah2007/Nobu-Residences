import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { usePage, Head, router } from "@inertiajs/react";
import MainLayout from "./MainLayout-CuFObsz2.js";
import UserFavouritesTab from "./UserFavouritesTab-a9JKK9Tt.js";
import SavedSearchesTab from "./SavedSearchesTab-BLqFxI4T.js";
import "./Footer-BjazYOa4.js";
import "./ContactAgentModal-Bc8CTpfm.js";
import "./Navbar-Cpn1c-fk.js";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import "./LoginModal-C-0W-anf.js";
import "./GoogleLoginButton-wrwag0eM.js";
import "./PropertyDetailIcons-3huqvWqW.js";
import "@headlessui/react";
import "./PropertyCardV5-BLJPzawm.js";
import "./propertyUrl-B4IVbEgn.js";
import "./slug-BdTdDGUL.js";
import "./propertyFormatters-B0QibXFa.js";
function UserDashboard({ auth, siteName, siteUrl, year }) {
  const [activeTab, setActiveTab] = useState("saved");
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [savedSearchesCount, setSavedSearchesCount] = useState(0);
  const { globalWebsite, website } = usePage().props;
  const currentWebsite = website || globalWebsite || {};
  const brandColors = currentWebsite?.brand_colors || {};
  const buttonPrimaryBg = brandColors.button_primary_bg || "#293056";
  const buttonPrimaryText = brandColors.button_primary_text || "#FFFFFF";
  useEffect(() => {
    fetch("/api/favourites/properties", {
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
      }
    }).then((response) => response.json()).then((data) => {
      if (data.success && data.favourites) {
        setFavoritesCount(data.favourites.length);
      }
    }).catch((error) => console.error("Error fetching favorites count:", error));
    fetch("/api/saved-searches", {
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
      }
    }).then((response) => response.json()).then((data) => {
      if (data.data && Array.isArray(data.data)) {
        setSavedSearchesCount(data.data.length);
      }
    }).catch((error) => console.error("Error fetching saved searches count:", error));
  }, []);
  const alerts = [
    {
      id: 1,
      title: "New listings in King West",
      description: "3 new properties match your saved search for 2+ bedroom condos",
      time: "2 hours ago",
      type: "new_listings"
    },
    {
      id: 2,
      title: "Price drop alert",
      description: "408 - 155 Dalhousie Street reduced price by $39,000",
      time: "1 day ago",
      type: "price_drop"
    },
    {
      id: 3,
      title: "Market update",
      description: "Downtown Toronto market report for December 2024 is now available",
      time: "3 days ago",
      type: "market_update"
    }
  ];
  const handleLogout = () => {
    router.post("/logout", {}, {
      onSuccess: () => {
        router.get("/");
      }
    });
  };
  const tabs = [
    { id: "saved", label: "Saved Properties", count: favoritesCount },
    { id: "searches", label: "Recent Searches", count: savedSearchesCount },
    { id: "alerts", label: "Alerts", count: alerts.length },
    { id: "profile", label: "Profile", count: null }
  ];
  return /* @__PURE__ */ jsxs(MainLayout, { siteName, siteUrl, year, auth, children: [
    /* @__PURE__ */ jsx(Head, { title: `My Account - ${siteName}` }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-[1280px] mx-auto px-4 md:px-0 py-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between mb-8", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h1", { className: "text-3xl font-space-grotesk font-bold text-[#293056] mb-2", children: [
            "Welcome back, ",
            auth.user.name
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "Manage your saved properties, searches, and account preferences" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 md:mt-0", children: /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleLogout,
            className: "px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors",
            children: "Sign Out"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "border-b border-gray-200 mb-8", children: /* @__PURE__ */ jsx("nav", { className: "flex space-x-8 overflow-x-auto", children: tabs.map((tab) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setActiveTab(tab.id),
          className: `py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id ? "border-[#293056] text-[#293056]" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} transition-colors`,
          children: [
            tab.label,
            tab.count !== null && tab.count > 0 && /* @__PURE__ */ jsx("span", { className: "ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs", children: tab.count })
          ]
        },
        tab.id
      )) }) }),
      /* @__PURE__ */ jsxs("div", { className: "min-h-[400px]", children: [
        activeTab === "saved" && /* @__PURE__ */ jsx(UserFavouritesTab, { onCountUpdate: setFavoritesCount }),
        activeTab === "searches" && /* @__PURE__ */ jsx(SavedSearchesTab, { onCountUpdate: setSavedSearchesCount }),
        activeTab === "alerts" && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-space-grotesk font-bold text-[#293056] mb-6", children: "Alerts & Notifications" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-4", children: alerts.map((alert) => /* @__PURE__ */ jsx("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-shrink-0", children: [
              alert.type === "new_listings" && /* @__PURE__ */ jsx("div", { className: "w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "#3B82F6", strokeWidth: "2", children: /* @__PURE__ */ jsx("path", { d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }) }) }),
              alert.type === "price_drop" && /* @__PURE__ */ jsx("div", { className: "w-8 h-8 bg-green-100 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "#10B981", strokeWidth: "2", children: /* @__PURE__ */ jsx("path", { d: "M7 13l3 3 7-7" }) }) }),
              alert.type === "market_update" && /* @__PURE__ */ jsx("div", { className: "w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "#8B5CF6", strokeWidth: "2", children: /* @__PURE__ */ jsx("path", { d: "M9 19c-5 0-8-3-8-8s4-8 9-8 8 3 8 8-4 8-8 8z" }) }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "ml-4 flex-1", children: [
              /* @__PURE__ */ jsx("h3", { className: "font-medium text-gray-900 mb-1", children: alert.title }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mb-2", children: alert.description }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: alert.time })
            ] })
          ] }) }, alert.id)) })
        ] }),
        activeTab === "profile" && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-space-grotesk font-bold text-[#293056] mb-6", children: "Profile Settings" }),
          /* @__PURE__ */ jsxs("div", { className: "max-w-2xl", children: [
            /* @__PURE__ */ jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-6 mb-6", children: [
              /* @__PURE__ */ jsx("h3", { className: "font-medium text-gray-900 mb-4", children: "Personal Information" }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Full Name" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      value: auth.user.name,
                      className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#293056] focus:border-transparent",
                      readOnly: true
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email Address" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "email",
                      value: auth.user.email,
                      className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#293056] focus:border-transparent",
                      readOnly: true
                    }
                  )
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-6 mb-6", children: [
              /* @__PURE__ */ jsx("h3", { className: "font-medium text-gray-900 mb-4", children: "Notification Preferences" }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsxs("label", { className: "flex items-center", children: [
                  /* @__PURE__ */ jsx("input", { type: "checkbox", defaultChecked: true, className: "rounded border-gray-300 text-[#293056] focus:ring-[#293056]" }),
                  /* @__PURE__ */ jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Email alerts for new listings" })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "flex items-center", children: [
                  /* @__PURE__ */ jsx("input", { type: "checkbox", defaultChecked: true, className: "rounded border-gray-300 text-[#293056] focus:ring-[#293056]" }),
                  /* @__PURE__ */ jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Price drop notifications" })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "flex items-center", children: [
                  /* @__PURE__ */ jsx("input", { type: "checkbox", className: "rounded border-gray-300 text-[#293056] focus:ring-[#293056]" }),
                  /* @__PURE__ */ jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Weekly market reports" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex space-x-4", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: "px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-colors",
                  style: { backgroundColor: buttonPrimaryBg, color: buttonPrimaryText },
                  children: "Save Changes"
                }
              ),
              /* @__PURE__ */ jsx("button", { className: "px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors", children: "Cancel" })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  UserDashboard as default
};
