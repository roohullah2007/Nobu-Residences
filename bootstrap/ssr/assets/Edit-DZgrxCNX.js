import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { usePage, useForm, Head, Link, router } from "@inertiajs/react";
import { A as AdminLayout } from "./AdminLayout-CaxbTFCB.js";
import { C as ConfirmDialog } from "./ConfirmDialog-CoY5VzLe.js";
import { P as PhoneInput } from "./PhoneInput-BOSF9o14.js";
import React, { useState, useEffect } from "react";
function Edit({ auth }) {
  const { website, title, buildings, flash, serverIp } = usePage().props;
  const dnsServerIp = serverIp || "157.180.26.95";
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showConnectDomainConfirm, setShowConnectDomainConfirm] = useState(false);
  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
      }, 3e3);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);
  const agentInfo = website?.agent_info || website?.agentInfo;
  let initialAgentImage = agentInfo?.profile_image || "";
  if (initialAgentImage && !initialAgentImage.startsWith("http") && !initialAgentImage.startsWith("/")) {
    initialAgentImage = `/storage/${initialAgentImage}`;
  }
  const [logoPreview, setLogoPreview] = React.useState(website?.logo || website?.logo_url || "");
  const [faviconPreview, setFaviconPreview] = React.useState(website?.favicon_url || "");
  const [agentImagePreview, setAgentImagePreview] = React.useState(initialAgentImage);
  const { data, setData, post, processing, errors, reset, transform } = useForm({
    name: website?.name || "",
    slug: website?.slug || "",
    domain: website?.domain || "",
    is_default: website?.is_default || false,
    is_active: website?.is_active || true,
    homepage_building_id: website?.homepage_building_id || null,
    use_building_as_homepage: website?.use_building_as_homepage || false,
    logo_url: website?.logo_url || "",
    logo_file: null,
    // For logo file upload
    favicon_url: website?.favicon_url || "",
    favicon_file: null,
    // For favicon file upload
    meta_title: website?.meta_title || "",
    meta_description: website?.meta_description || "",
    meta_keywords: website?.meta_keywords || "",
    description: website?.description || "",
    timezone: website?.timezone || "America/Toronto",
    tracking_scripts: website?.tracking_scripts || "",
    // Brand colors - Core
    "brand_colors.primary": website?.brand_colors?.primary || "#912018",
    "brand_colors.accent": website?.brand_colors?.accent || "#F5F8FF",
    "brand_colors.text": website?.brand_colors?.text || "#000000",
    "brand_colors.background": website?.brand_colors?.background || "#FFFFFF",
    // Button colors - Primary (Blue buttons - Available Building, Sign Up/Log In)
    "brand_colors.button_primary_bg": website?.brand_colors?.button_primary_bg || "#293056",
    "brand_colors.button_primary_text": website?.brand_colors?.button_primary_text || "#FFFFFF",
    // Button colors - Secondary (Red/Brown buttons - Contact Agent, Show All Listings)
    "brand_colors.button_secondary_bg": website?.brand_colors?.button_secondary_bg || "#912018",
    "brand_colors.button_secondary_text": website?.brand_colors?.button_secondary_text || "#FFFFFF",
    // Button colors - Tertiary (Black buttons - Request Building Tour)
    "brand_colors.button_tertiary_bg": website?.brand_colors?.button_tertiary_bg || "#000000",
    "brand_colors.button_tertiary_text": website?.brand_colors?.button_tertiary_text || "#FFFFFF",
    // Button colors - Quaternary (White/Light buttons - outline buttons)
    "brand_colors.button_quaternary_bg": website?.brand_colors?.button_quaternary_bg || "#FFFFFF",
    "brand_colors.button_quaternary_text": website?.brand_colors?.button_quaternary_text || "#293056",
    // Footer colors
    "brand_colors.footer_bg": website?.brand_colors?.footer_bg || "#1a1a2e",
    "brand_colors.footer_text": website?.brand_colors?.footer_text || "#FFFFFF",
    // Link colors
    "brand_colors.link_color": website?.brand_colors?.link_color || "#912018",
    "brand_colors.link_hover": website?.brand_colors?.link_hover || "#6d1812",
    // Contact info
    "contact_info.phone": website?.contact_info?.phone || "",
    "contact_info.email": website?.contact_info?.email || "",
    "contact_info.address": website?.contact_info?.address || "",
    // Agent Information (from agent_info table)
    agent_name: agentInfo?.agent_name || "",
    agent_title: agentInfo?.agent_title || "",
    agent_phone: agentInfo?.agent_phone || "",
    brokerage: agentInfo?.brokerage || "",
    agent_profile_image: null,
    // Social media
    "social_media.facebook": website?.social_media?.facebook || "",
    "social_media.instagram": website?.social_media?.instagram || "",
    "social_media.twitter": website?.social_media?.twitter || "",
    "social_media.linkedin": website?.social_media?.linkedin || ""
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    transform((formData) => ({
      ...formData,
      _method: "PUT"
    }));
    post(route("admin.websites.update", website.id), {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        setData("logo_file", null);
        setData("agent_profile_image", null);
        setData("favicon_file", null);
        setSuccessMessage("Website settings saved successfully!");
        setShowSuccessToast(true);
      }
    });
  };
  if (!website) {
    return /* @__PURE__ */ jsxs(AdminLayout, { title, children: [
      /* @__PURE__ */ jsx(Head, { title }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-center items-center h-64", children: [
        /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" }),
        /* @__PURE__ */ jsx("span", { className: "ml-3 text-gray-500", children: "Loading website..." })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs(AdminLayout, { title, children: [
    /* @__PURE__ */ jsx(Head, { title }),
    showSuccessToast && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("style", { children: `
                    @keyframes fadeInSlide {
                        from { opacity: 0; transform: translateX(20px); }
                        to { opacity: 1; transform: translateX(0); }
                    }
                ` }),
      /* @__PURE__ */ jsx("div", { className: "fixed top-4 right-4 z-50", style: { animation: "fadeInSlide 0.3s ease-out" }, children: /* @__PURE__ */ jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 flex items-center space-x-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx("svg", { className: "h-6 w-6 text-green-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }),
        /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-green-800", children: successMessage }) }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setShowSuccessToast(false),
            className: "flex-shrink-0 text-green-500 hover:text-green-700",
            children: /* @__PURE__ */ jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M6 18L18 6M6 6l12 12" }) })
          }
        )
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Edit Website" }),
          /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-gray-600", children: [
            "Update settings and configuration for ",
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: website?.name })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center space-x-3", children: /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("admin.websites.show", website.id),
            className: "inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
            children: [
              /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M10 19l-7-7m0 0l7-7m-7 7h18" }) }),
              "Back to Website"
            ]
          }
        ) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-white shadow rounded-lg border border-gray-200 mb-6", children: /* @__PURE__ */ jsxs("div", { className: "px-4 py-5 sm:p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4 mb-4", children: [
          /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx("svg", { className: "h-5 w-5 text-emerald-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" }) }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Domain & Hosting" }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500", children: [
              "Add the custom domain to Ploi as a site alias and request a Let's Encrypt SSL certificate. The DNS A record must point to the server IP",
              " ",
              /* @__PURE__ */ jsx("code", { className: "font-mono font-semibold text-gray-700", children: dnsServerIp }),
              " first."
            ] })
          ] })
        ] }),
        website?.domain ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-gray-50 rounded-lg", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wide text-gray-500 font-semibold", children: "Current domain" }),
            /* @__PURE__ */ jsx("div", { className: "font-mono text-gray-900 truncate", children: website.domain })
          ] }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => setShowConnectDomainConfirm(true),
              className: "inline-flex items-center justify-center px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700",
              children: [
                /* @__PURE__ */ jsx("svg", { className: "h-4 w-4 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M13 10V3L4 14h7v7l9-11h-7z" }) }),
                "Connect domain to Ploi"
              ]
            }
          )
        ] }) : /* @__PURE__ */ jsx("div", { className: "p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-900", children: "No custom domain set on this website yet. Add one in the Basic Information section below and save, then come back to connect it to Ploi." })
      ] }) }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-white shadow rounded-lg border border-gray-200", children: /* @__PURE__ */ jsxs("div", { className: "px-4 py-5 sm:p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center mb-4", children: [
            /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center", children: /* @__PURE__ */ jsx("svg", { className: "h-5 w-5 text-indigo-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" }) }) }) }),
            /* @__PURE__ */ jsxs("div", { className: "ml-3", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Basic Information" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Essential website details and configuration" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Website Name" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: data.name,
                  onChange: (e) => setData("name", e.target.value),
                  className: "block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
                  required: true
                }
              ),
              errors.name && /* @__PURE__ */ jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.name })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Slug" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: data.slug,
                  onChange: (e) => setData("slug", e.target.value),
                  className: "block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
                  required: true
                }
              ),
              errors.slug && /* @__PURE__ */ jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.slug })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Custom Domain" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: data.domain,
                  onChange: (e) => setData("domain", e.target.value),
                  className: "block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
                  placeholder: "yourdomain.com"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Enter your custom domain (without http/https). DNS must be configured to point to this server." }),
              data.slug && /* @__PURE__ */ jsxs("div", { className: "mt-2 p-2 bg-blue-50 rounded-md", children: [
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-blue-700", children: [
                  /* @__PURE__ */ jsx("strong", { children: "Preview URL:" }),
                  " ",
                  /* @__PURE__ */ jsxs("code", { className: "bg-blue-100 px-1 rounded", children: [
                    "?website=",
                    data.slug
                  ] })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-blue-600 mt-1", children: "Use this query parameter to preview this website without connecting a domain." })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Timezone" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: data.timezone,
                  onChange: (e) => setData("timezone", e.target.value),
                  className: "block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "America/Toronto", children: "America/Toronto" }),
                    /* @__PURE__ */ jsx("option", { value: "America/New_York", children: "America/New_York" }),
                    /* @__PURE__ */ jsx("option", { value: "America/Los_Angeles", children: "America/Los_Angeles" }),
                    /* @__PURE__ */ jsx("option", { value: "America/Chicago", children: "America/Chicago" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Description" }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  value: data.description,
                  onChange: (e) => setData("description", e.target.value),
                  rows: "3",
                  className: "block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
                  placeholder: "Brief description of this website..."
                }
              )
            ] }),
            /* @__PURE__ */ jsx("div", { className: "md:col-span-2", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start space-x-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center h-5", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    id: "is_default",
                    type: "checkbox",
                    checked: data.is_default,
                    onChange: (e) => setData("is_default", e.target.checked),
                    className: "focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "ml-3 text-sm", children: [
                  /* @__PURE__ */ jsx("label", { htmlFor: "is_default", className: "font-medium text-gray-700", children: "Default Website" }),
                  /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "This will be the main website for your domain" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center h-5", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    id: "is_active",
                    type: "checkbox",
                    checked: data.is_active,
                    onChange: (e) => setData("is_active", e.target.checked),
                    className: "focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "ml-3 text-sm", children: [
                  /* @__PURE__ */ jsx("label", { htmlFor: "is_active", className: "font-medium text-gray-700", children: "Active" }),
                  /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "Website is publicly accessible" })
                ] })
              ] })
            ] }) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "bg-white shadow rounded-lg border border-gray-200", children: /* @__PURE__ */ jsxs("div", { className: "px-4 py-5 sm:p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center mb-4", children: [
            /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center", children: /* @__PURE__ */ jsx("svg", { className: "h-5 w-5 text-blue-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" }) }) }) }),
            /* @__PURE__ */ jsxs("div", { className: "ml-3", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Homepage Settings" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Configure what shows as your homepage" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start", children: [
              /* @__PURE__ */ jsx("div", { className: "flex items-center h-5", children: /* @__PURE__ */ jsx(
                "input",
                {
                  id: "use_building_as_homepage",
                  type: "checkbox",
                  checked: data.use_building_as_homepage,
                  onChange: (e) => setData("use_building_as_homepage", e.target.checked),
                  className: "focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                }
              ) }),
              /* @__PURE__ */ jsxs("div", { className: "ml-3 text-sm", children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "use_building_as_homepage", className: "font-medium text-gray-700", children: "Use Building Page as Homepage" }),
                /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "Display a building details page as the homepage instead of the default homepage" })
              ] })
            ] }),
            data.use_building_as_homepage && /* @__PURE__ */ jsxs("div", { className: "ml-7", children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "homepage_building_id", className: "block text-sm font-medium text-gray-700 mb-1", children: "Select Building" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  id: "homepage_building_id",
                  value: data.homepage_building_id || "",
                  onChange: (e) => setData("homepage_building_id", e.target.value || null),
                  className: "mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "-- Select a Building --" }),
                    buildings?.map((building) => /* @__PURE__ */ jsxs("option", { value: building.id, children: [
                      building.name,
                      " ",
                      building.address && `- ${building.address}`
                    ] }, building.id))
                  ]
                }
              ),
              errors.homepage_building_id && /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-red-600", children: errors.homepage_building_id }),
              data.homepage_building_id && /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-500", children: "When users visit your homepage, they will see the details page for the selected building." })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "bg-white shadow rounded-lg border border-gray-200", children: /* @__PURE__ */ jsxs("div", { className: "px-4 py-5 sm:p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center mb-4", children: [
            /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center", children: /* @__PURE__ */ jsx("svg", { className: "h-5 w-5 text-purple-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" }) }) }) }),
            /* @__PURE__ */ jsxs("div", { className: "ml-3", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Logo & Branding" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Upload your logo and customize brand colors" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-3", children: "Logo" }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
                /* @__PURE__ */ jsx("div", { children: (logoPreview || data.logo_url) && /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mb-2", children: data.logo_file ? "New Logo Preview:" : "Current Logo:" }),
                  /* @__PURE__ */ jsx("div", { className: "border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50", children: /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: logoPreview || data.logo_url,
                      alt: data.logo_file ? "New Logo Preview" : "Current Logo",
                      className: "h-16 w-auto mx-auto object-contain",
                      onError: (e) => {
                        e.target.style.display = "none";
                      }
                    }
                  ) })
                ] }) }),
                /* @__PURE__ */ jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Upload New Logo" }),
                  data.logo_file && /* @__PURE__ */ jsx("div", { className: "mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md", children: /* @__PURE__ */ jsxs("div", { className: "flex", children: [
                    /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx("svg", { className: "h-5 w-5 text-yellow-400", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) }) }),
                    /* @__PURE__ */ jsx("div", { className: "ml-3", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-yellow-800", children: [
                      /* @__PURE__ */ jsx("strong", { children: "Note:" }),
                      " Uploading a new logo will replace the current logo."
                    ] }) })
                  ] }) }),
                  /* @__PURE__ */ jsx("div", { className: "flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors", children: /* @__PURE__ */ jsxs("div", { className: "space-y-1 text-center", children: [
                    /* @__PURE__ */ jsx("svg", { className: "mx-auto h-12 w-12 text-gray-400", stroke: "currentColor", fill: "none", viewBox: "0 0 48 48", children: /* @__PURE__ */ jsx("path", { d: "M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) }),
                    /* @__PURE__ */ jsxs("div", { className: "flex text-sm text-gray-600", children: [
                      /* @__PURE__ */ jsxs("label", { htmlFor: "logo-upload", className: "relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500", children: [
                        /* @__PURE__ */ jsx("span", { children: "Upload a file" }),
                        /* @__PURE__ */ jsx(
                          "input",
                          {
                            id: "logo-upload",
                            type: "file",
                            accept: "image/*",
                            className: "sr-only",
                            onChange: (e) => {
                              const file = e.target.files[0];
                              console.log("Logo file selected:", file);
                              if (file) {
                                setData("logo_file", file);
                                console.log("Logo file set in data");
                                const reader = new FileReader();
                                reader.onload = (e2) => {
                                  setLogoPreview(e2.target.result);
                                };
                                reader.readAsDataURL(file);
                              }
                            }
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsx("p", { className: "pl-1", children: "or drag and drop" })
                    ] }),
                    /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "PNG, JPG, JPEG, SVG up to 2MB" })
                  ] }) }),
                  errors.logo_file && /* @__PURE__ */ jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.logo_file })
                ] }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "border-b border-gray-200 pb-6", children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-3", children: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" }) }),
                "Core Brand Colors"
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
                { key: "brand_colors.primary", label: "Primary", desc: "Main brand color" },
                { key: "brand_colors.accent", label: "Accent", desc: "Highlight color" },
                { key: "brand_colors.text", label: "Text", desc: "Text color" },
                { key: "brand_colors.background", label: "Background", desc: "Page background" }
              ].map((color) => /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: color.label }),
                /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "color",
                      value: data[color.key],
                      onChange: (e) => setData(color.key, e.target.value),
                      className: "h-12 w-full rounded-md border border-gray-300 cursor-pointer"
                    }
                  ),
                  /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-gray-500 text-center", children: data[color.key] })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 mt-1", children: color.desc })
              ] }, color.key)) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "border-b border-gray-200 pb-6 pt-4", children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-3", children: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" }) }),
                "Button Colors"
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
                { key: "brand_colors.button_primary_bg", label: "Primary BG", desc: "Available Building, Sign Up buttons" },
                { key: "brand_colors.button_primary_text", label: "Primary Text", desc: "Primary text" },
                { key: "brand_colors.button_secondary_bg", label: "Secondary BG", desc: "Contact Agent, Show All Listings" },
                { key: "brand_colors.button_secondary_text", label: "Secondary Text", desc: "Secondary text" },
                { key: "brand_colors.button_tertiary_bg", label: "Tertiary BG", desc: "Request Tour buttons" },
                { key: "brand_colors.button_tertiary_text", label: "Tertiary Text", desc: "Tertiary text" },
                { key: "brand_colors.button_quaternary_bg", label: "Quaternary BG", desc: "Outline buttons (View Details)" },
                { key: "brand_colors.button_quaternary_text", label: "Quaternary Text", desc: "Quaternary text" }
              ].map((color) => /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: color.label }),
                /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "color",
                      value: data[color.key],
                      onChange: (e) => setData(color.key, e.target.value),
                      className: "h-12 w-full rounded-md border border-gray-300 cursor-pointer"
                    }
                  ),
                  /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-gray-500 text-center", children: data[color.key] })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 mt-1", children: color.desc })
              ] }, color.key)) }),
              /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-wrap gap-3", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    className: "px-5 py-2 rounded-lg font-medium transition-opacity hover:opacity-80 text-sm",
                    style: {
                      backgroundColor: data["brand_colors.button_primary_bg"],
                      color: data["brand_colors.button_primary_text"]
                    },
                    children: "Available Building"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    className: "px-5 py-2 rounded-lg font-medium transition-opacity hover:opacity-80 text-sm",
                    style: {
                      backgroundColor: data["brand_colors.button_secondary_bg"],
                      color: data["brand_colors.button_secondary_text"]
                    },
                    children: "Contact Agent"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    className: "px-5 py-2 rounded-lg font-medium transition-opacity hover:opacity-80 text-sm",
                    style: {
                      backgroundColor: data["brand_colors.button_tertiary_bg"],
                      color: data["brand_colors.button_tertiary_text"]
                    },
                    children: "Request Tour"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    className: "px-5 py-2 rounded-lg font-medium transition-opacity hover:opacity-80 text-sm border",
                    style: {
                      backgroundColor: data["brand_colors.button_quaternary_bg"],
                      color: data["brand_colors.button_quaternary_text"],
                      borderColor: data["brand_colors.button_quaternary_text"]
                    },
                    children: "View Details"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "border-b border-gray-200 pb-6 pt-4", children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-3", children: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" }) }),
                "Footer Colors"
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
                { key: "brand_colors.footer_bg", label: "Footer Background", desc: "Footer section background" },
                { key: "brand_colors.footer_text", label: "Footer Text", desc: "Footer text color" }
              ].map((color) => /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: color.label }),
                /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "color",
                      value: data[color.key],
                      onChange: (e) => setData(color.key, e.target.value),
                      className: "h-12 w-full rounded-md border border-gray-300 cursor-pointer"
                    }
                  ),
                  /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-gray-500 text-center", children: data[color.key] })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 mt-1", children: color.desc })
              ] }, color.key)) }),
              /* @__PURE__ */ jsx("div", { className: "mt-4 p-4 rounded-lg", style: { backgroundColor: data["brand_colors.footer_bg"] }, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium", style: { color: data["brand_colors.footer_text"] }, children: "Footer Preview" }),
                /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
                  /* @__PURE__ */ jsx("span", { style: { color: data["brand_colors.footer_text"] }, children: "Privacy" }),
                  /* @__PURE__ */ jsx("span", { style: { color: data["brand_colors.footer_text"] }, children: "Terms" }),
                  /* @__PURE__ */ jsx("span", { style: { color: data["brand_colors.footer_text"] }, children: "Contact" })
                ] })
              ] }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "pt-4", children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-3", children: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" }) }),
                "Link Colors"
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
                { key: "brand_colors.link_color", label: "Link Color", desc: "Default link color" },
                { key: "brand_colors.link_hover", label: "Link Hover", desc: "Link hover color" }
              ].map((color) => /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: color.label }),
                /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "color",
                      value: data[color.key],
                      onChange: (e) => setData(color.key, e.target.value),
                      className: "h-12 w-full rounded-md border border-gray-300 cursor-pointer"
                    }
                  ),
                  /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-gray-500 text-center", children: data[color.key] })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 mt-1", children: color.desc })
              ] }, color.key)) }),
              /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
                /* @__PURE__ */ jsx("span", { className: "mr-2", children: "Preview:" }),
                /* @__PURE__ */ jsx(
                  "a",
                  {
                    href: "#",
                    onClick: (e) => e.preventDefault(),
                    className: "underline transition-colors",
                    style: { color: data["brand_colors.link_color"] },
                    onMouseEnter: (e) => e.target.style.color = data["brand_colors.link_hover"],
                    onMouseLeave: (e) => e.target.style.color = data["brand_colors.link_color"],
                    children: "Sample Link (hover me)"
                  }
                )
              ] })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "bg-white shadow rounded-lg border border-gray-200", children: /* @__PURE__ */ jsxs("div", { className: "px-4 py-5 sm:p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center mb-4", children: [
            /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center", children: /* @__PURE__ */ jsx("svg", { className: "h-5 w-5 text-green-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }) }) }),
            /* @__PURE__ */ jsxs("div", { className: "ml-3", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900", children: "SEO Settings" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Optimize your website for search engines" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-6", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Meta Title" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: data.meta_title,
                  onChange: (e) => setData("meta_title", e.target.value),
                  className: "block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
                  placeholder: "Your Website Title - Brand Name"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Recommended: 50-60 characters" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Meta Description" }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  value: data.meta_description,
                  onChange: (e) => setData("meta_description", e.target.value),
                  rows: "3",
                  className: "block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
                  placeholder: "A brief description of your website that appears in search results..."
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Recommended: 150-160 characters" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Meta Keywords" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: data.meta_keywords,
                  onChange: (e) => setData("meta_keywords", e.target.value),
                  className: "block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
                  placeholder: "keyword1, keyword2, keyword3"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Separate keywords with commas" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Tracking & Integrations" }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  value: data.tracking_scripts,
                  onChange: (e) => setData("tracking_scripts", e.target.value),
                  rows: "6",
                  className: "block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono",
                  placeholder: "<script>\n  // e.g. Follow Up Boss widget tracker snippet\n<\/script>"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Paste third-party tracking snippets (e.g. the Follow Up Boss pixel / widget tracker). Rendered verbatim in the site <head> on public pages only — never on admin pages." })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Favicon" }),
              /* @__PURE__ */ jsx("div", { className: "space-y-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                (faviconPreview || data.favicon_url) && /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: faviconPreview || data.favicon_url,
                    alt: "Favicon preview",
                    className: "h-10 w-10 object-contain border border-gray-200 rounded p-1 bg-white",
                    onError: (e) => {
                      e.target.style.display = "none";
                    }
                  }
                ) }),
                /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsx("div", { className: "flex justify-center px-4 py-3 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                  /* @__PURE__ */ jsxs("label", { htmlFor: "favicon-upload", className: "relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500", children: [
                    /* @__PURE__ */ jsx("span", { children: faviconPreview || data.favicon_url ? "Change Favicon" : "Upload Favicon" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        id: "favicon-upload",
                        type: "file",
                        accept: "image/png,image/jpeg,image/x-icon,image/ico,image/svg+xml",
                        className: "sr-only",
                        onChange: (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setData("favicon_file", file);
                            const reader = new FileReader();
                            reader.onload = (e2) => {
                              setFaviconPreview(e2.target.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "ICO, PNG, SVG up to 1MB" })
                ] }) }) }),
                (faviconPreview || data.favicon_url) && /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      setFaviconPreview("");
                      setData("favicon_url", "");
                      setData("favicon_file", null);
                    },
                    className: "text-red-500 hover:text-red-700",
                    title: "Remove favicon",
                    children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) })
                  }
                )
              ] }) }),
              errors.favicon_file && /* @__PURE__ */ jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.favicon_file })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "bg-white shadow rounded-lg border border-gray-200", children: /* @__PURE__ */ jsxs("div", { className: "px-4 py-5 sm:p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center mb-4", children: [
            /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center", children: /* @__PURE__ */ jsx("svg", { className: "h-5 w-5 text-blue-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" }) }) }) }),
            /* @__PURE__ */ jsxs("div", { className: "ml-3", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Contact Information" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Business contact details and agent information" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Phone" }),
              /* @__PURE__ */ jsx(
                PhoneInput,
                {
                  value: data["contact_info.phone"],
                  onChange: (e) => setData("contact_info.phone", e.target.value),
                  className: "block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "email",
                  value: data["contact_info.email"],
                  onChange: (e) => setData("contact_info.email", e.target.value),
                  className: "block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
                  placeholder: "info@example.com"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Address" }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  value: data["contact_info.address"],
                  onChange: (e) => setData("contact_info.address", e.target.value),
                  rows: "2",
                  className: "block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
                  placeholder: "123 Main Street, City, State ZIP"
                }
              )
            ] }),
            /* @__PURE__ */ jsx("div", { className: "md:col-span-2 border-t pt-4 mt-4", children: /* @__PURE__ */ jsx("h4", { className: "text-md font-semibold text-gray-800 mb-4", children: "Agent Information" }) }),
            /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Agent Profile Image" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-start space-x-6", children: [
                agentImagePreview && /* @__PURE__ */ jsxs("div", { className: "flex-shrink-0 relative", children: [
                  /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                    /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: agentImagePreview,
                        alt: "Agent Profile",
                        className: "h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => {
                          setData("agent_profile_image", null);
                          setAgentImagePreview("");
                        },
                        className: "absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md",
                        title: "Remove image",
                        children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M6 18L18 6M6 6l12 12" }) })
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-2 text-center", children: data.agent_profile_image ? "New Image" : "Current Image" })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsx("div", { className: `flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-all ${agentImagePreview ? "border-green-300 bg-green-50 hover:border-green-400" : "border-gray-300 hover:border-gray-400"}`, children: /* @__PURE__ */ jsxs("div", { className: "space-y-1 text-center", children: [
                  !agentImagePreview ? /* @__PURE__ */ jsx("svg", { className: "mx-auto h-12 w-12 text-gray-400", stroke: "currentColor", fill: "none", viewBox: "0 0 48 48", children: /* @__PURE__ */ jsx("path", { d: "M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) }) : /* @__PURE__ */ jsx("svg", { className: "mx-auto h-12 w-12 text-green-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
                  /* @__PURE__ */ jsxs("div", { className: "flex text-sm text-gray-600", children: [
                    /* @__PURE__ */ jsxs("label", { htmlFor: "agent-image-upload", className: "relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500", children: [
                      /* @__PURE__ */ jsx("span", { children: agentImagePreview ? "Change photo" : "Upload agent photo" }),
                      /* @__PURE__ */ jsx(
                        "input",
                        {
                          id: "agent-image-upload",
                          type: "file",
                          accept: "image/*",
                          className: "sr-only",
                          onChange: (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setData("agent_profile_image", file);
                              const reader = new FileReader();
                              reader.onload = (e2) => {
                                setAgentImagePreview(e2.target.result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsx("p", { className: "pl-1", children: "or drag and drop" })
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "PNG, JPG, JPEG up to 2MB" })
                ] }) }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Agent Name" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: data.agent_name,
                  onChange: (e) => setData("agent_name", e.target.value),
                  className: "block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
                  placeholder: "John Doe"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Agent Title" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: data.agent_title,
                  onChange: (e) => setData("agent_title", e.target.value),
                  className: "block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
                  placeholder: "Senior Real Estate Agent"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Agent Phone" }),
              /* @__PURE__ */ jsx(
                PhoneInput,
                {
                  value: data.agent_phone,
                  onChange: (e) => setData("agent_phone", e.target.value),
                  className: "block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Brokerage" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: data.brokerage,
                  onChange: (e) => setData("brokerage", e.target.value),
                  className: "block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
                  placeholder: "Keller Williams Realty"
                }
              )
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "bg-white shadow rounded-lg border border-gray-200", children: /* @__PURE__ */ jsxs("div", { className: "px-4 py-5 sm:p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center mb-4", children: [
            /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-lg bg-pink-100 flex items-center justify-center", children: /* @__PURE__ */ jsx("svg", { className: "h-5 w-5 text-pink-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4l-2 14h14l-2-14M8 8v4m4-4v4m4-4v4" }) }) }) }),
            /* @__PURE__ */ jsxs("div", { className: "ml-3", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Social Media" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Connect your social media profiles" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Facebook" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "url",
                  value: data["social_media.facebook"],
                  onChange: (e) => setData("social_media.facebook", e.target.value),
                  className: "block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
                  placeholder: "https://facebook.com/yourpage"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Instagram" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "url",
                  value: data["social_media.instagram"],
                  onChange: (e) => setData("social_media.instagram", e.target.value),
                  className: "block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
                  placeholder: "https://instagram.com/youraccount"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Twitter" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "url",
                  value: data["social_media.twitter"],
                  onChange: (e) => setData("social_media.twitter", e.target.value),
                  className: "block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
                  placeholder: "https://twitter.com/youraccount"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "LinkedIn" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "url",
                  value: data["social_media.linkedin"],
                  onChange: (e) => setData("social_media.linkedin", e.target.value),
                  className: "block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
                  placeholder: "https://linkedin.com/company/yourcompany"
                }
              )
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end space-x-4 py-4", children: [
          /* @__PURE__ */ jsx(
            Link,
            {
              href: route("admin.websites.show", website.id),
              className: "inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: processing,
              className: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed",
              children: processing ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsxs("svg", { className: "animate-spin -ml-1 mr-3 h-4 w-4 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [
                  /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                  /* @__PURE__ */ jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
                ] }),
                "Saving..."
              ] }) : "Save Changes"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      ConfirmDialog,
      {
        open: showConnectDomainConfirm,
        title: "Connect domain to Ploi?",
        message: `"${website?.domain}" will be added to Ploi as a site alias and a Let's Encrypt SSL certificate will be requested.

Make sure the domain's DNS A record already points to the server IP ${dnsServerIp} (apex "@" and "www" both), otherwise SSL issuance will fail.`,
        confirmLabel: "Connect",
        variant: "neutral",
        onConfirm: () => {
          setShowConnectDomainConfirm(false);
          router.post(route("admin.websites.retry-ploi", website.id));
        },
        onCancel: () => setShowConnectDomainConfirm(false)
      }
    )
  ] });
}
export {
  Edit as default
};
