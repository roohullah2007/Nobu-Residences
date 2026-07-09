import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import MainLayout from "./MainLayout-CodT0wEB.js";
import { Head, Link } from "@inertiajs/react";
import { useState, useEffect } from "react";
import "./Footer-COZ0Sr-M.js";
import "./ContactAgentModal-BZyWhDPm.js";
import "./PhoneInput-BOSF9o14.js";
import "./imageUrl-B-Y_O6wE.js";
import "./Navbar-BcUYeBAy.js";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import "./LoginModal-CkvRiYR7.js";
import "./GoogleLoginButton-wrwag0eM.js";
import "./PropertyDetailIcons-3huqvWqW.js";
import "@headlessui/react";
function UserAlerts({ auth, website }) {
  const [alerts, setAlerts] = useState([]);
  const [alertStats, setAlertStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [alertDetails, setAlertDetails] = useState(null);
  const brandColors = website?.brand_colors || {
    primary: "#912018"
  };
  useEffect(() => {
    fetchAlerts();
  }, []);
  const fetchAlerts = async () => {
    try {
      const response = await fetch("/api/alerts", {
        headers: {
          "Accept": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.data || []);
        setAlertStats(data.stats || null);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchAlertDetails = async (alertId) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        headers: {
          "Accept": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAlertDetails(data.data);
      }
    } catch (error) {
      console.error("Error fetching alert details:", error);
    }
  };
  return /* @__PURE__ */ jsxs(MainLayout, { auth, website, blueHeader: true, children: [
    /* @__PURE__ */ jsx(Head, { title: "My Alerts" }),
    /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gray-50", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
            /* @__PURE__ */ jsx(
              Link,
              {
                href: "/dashboard",
                className: "text-gray-400 hover:text-gray-600 transition-colors",
                children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) })
              }
            ),
            /* @__PURE__ */ jsx("h1", { className: "text-2xl md:text-3xl font-bold text-gray-900 font-space-grotesk", children: "My Alerts" }),
            /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 text-blue-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" }) }) })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-600 font-work-sans", children: alerts.length > 0 ? `You have ${alerts.length} email ${alerts.length === 1 ? "alert" : "alerts"}` : "View notifications from your saved searches" })
        ] }),
        alertStats && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "px-3 py-1.5 bg-blue-50 rounded-lg", children: [
            /* @__PURE__ */ jsx("span", { className: "text-blue-700 font-medium", children: alertStats.alerts_this_week }),
            /* @__PURE__ */ jsx("span", { className: "text-blue-600 ml-1", children: "this week" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "px-3 py-1.5 bg-green-50 rounded-lg", children: [
            /* @__PURE__ */ jsx("span", { className: "text-green-700 font-medium", children: alertStats.total_listings_found }),
            /* @__PURE__ */ jsx("span", { className: "text-green-600 ml-1", children: "listings found" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "px-6 py-5 border-b border-gray-100", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-gray-900 font-space-grotesk", children: "Email Notifications" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-500 font-work-sans text-sm mt-1", children: "Recent notifications about new listings matching your saved searches" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "p-6", children: isLoading ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-12", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin" }),
          /* @__PURE__ */ jsx("p", { className: "mt-4 text-gray-500 font-work-sans", children: "Loading alerts..." })
        ] }) : alerts.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-12", children: [
          /* @__PURE__ */ jsx("div", { className: "w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx("svg", { className: "w-10 h-10 text-blue-300", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" }) }) }),
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 font-space-grotesk mb-2", children: "No alerts yet" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-500 font-work-sans text-center max-w-sm mb-6", children: "Enable email alerts on your saved searches to receive notifications when new properties match your criteria." }),
          /* @__PURE__ */ jsxs(
            Link,
            {
              href: "/dashboard",
              className: "inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-work-sans font-medium hover:opacity-90 transition-opacity",
              style: { backgroundColor: brandColors.primary },
              children: [
                /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }),
                "Manage Saved Searches"
              ]
            }
          )
        ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: alerts.map((alert) => /* @__PURE__ */ jsx(
          "div",
          {
            className: "group bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-100 rounded-xl p-4 transition-all duration-200 cursor-pointer",
            onClick: () => {
              setSelectedAlert(alert);
              fetchAlertDetails(alert.id);
            },
            children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm", children: /* @__PURE__ */ jsx("span", { className: "text-xl font-bold text-blue-600", children: alert.listings_count }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                  /* @__PURE__ */ jsx("h4", { className: "font-semibold text-gray-900 font-space-grotesk truncate", children: alert.search_name }),
                  /* @__PURE__ */ jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700", children: alert.frequency })
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500 font-work-sans", children: [
                  alert.listings_count,
                  " new ",
                  alert.listings_count === 1 ? "listing" : "listings",
                  " found"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex-shrink-0 text-right", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400 font-work-sans", children: alert.sent_at_human }),
                /* @__PURE__ */ jsx("span", { className: `inline-flex items-center gap-1 text-xs font-medium ${alert.status === "sent" ? "text-green-600" : "text-red-600"}`, children: alert.status === "sent" ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx("svg", { className: "w-3 h-3", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z", clipRule: "evenodd" }) }),
                  "Sent"
                ] }) : "Failed" })
              ] })
            ] })
          },
          alert.id
        )) }) })
      ] })
    ] }) }),
    selectedAlert && alertDetails && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4", onClick: () => setSelectedAlert(null), children: /* @__PURE__ */ jsxs(
      "div",
      {
        className: "bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden",
        onClick: (e) => e.stopPropagation(),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 border-b border-gray-100 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-gray-900 font-space-grotesk", children: alertDetails.search_name }),
              /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500 font-work-sans", children: [
                alertDetails.sent_at_human,
                " - ",
                alertDetails.listings_count,
                " listings"
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setSelectedAlert(null),
                className: "p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors",
                children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-6 overflow-y-auto max-h-[60vh]", children: [
            alertDetails.search_criteria && /* @__PURE__ */ jsx("div", { className: "mb-6 p-4 bg-gray-50 rounded-xl", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-600 font-work-sans", children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Search Criteria:" }),
              " ",
              alertDetails.search_criteria
            ] }) }),
            /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold text-gray-700 mb-4 font-space-grotesk", children: "Properties in this alert:" }),
            alertDetails.properties && alertDetails.properties.length > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-3", children: alertDetails.properties.map((property, index) => /* @__PURE__ */ jsxs(
              Link,
              {
                href: property.url,
                className: "flex items-center gap-4 p-3 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors",
                children: [
                  property.image_url ? /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: property.image_url,
                      alt: property.address,
                      className: "w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    }
                  ) : /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" }) }) }),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                    /* @__PURE__ */ jsx("p", { className: "font-semibold text-gray-900 font-space-grotesk", children: property.formatted_price }),
                    /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-600 truncate font-work-sans", children: [
                      property.address,
                      ", ",
                      property.city
                    ] }),
                    /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-400 font-work-sans", children: [
                      property.bedrooms,
                      " bed | ",
                      property.bathrooms,
                      " bath"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })
                ]
              },
              index
            )) }) : /* @__PURE__ */ jsx("p", { className: "text-center text-gray-500 py-8 font-work-sans", children: "Property details no longer available" })
          ] })
        ]
      }
    ) })
  ] });
}
export {
  UserAlerts as default
};
