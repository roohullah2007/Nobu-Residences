import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, Head, Link } from "@inertiajs/react";
import { A as AdminLayout } from "./AdminLayout-CaxbTFCB.js";
import "react";
const BRAND_COLOR_LABELS = {
  primary: { label: "Primary", desc: "Main brand color" },
  secondary: { label: "Secondary", desc: "Secondary brand color" },
  accent: { label: "Accent", desc: "Highlight color" },
  text: { label: "Text", desc: "Text color" },
  background: { label: "Background", desc: "Page background" },
  button_primary_bg: { label: "Primary Button", desc: "Blue buttons" },
  button_primary_text: { label: "Primary Button Text", desc: "Primary button text" },
  button_secondary_bg: { label: "Secondary Button", desc: "Red/Brown buttons" },
  button_secondary_text: { label: "Secondary Button Text", desc: "Secondary button text" },
  button_tertiary_bg: { label: "Tertiary Button", desc: "Black buttons" },
  button_tertiary_text: { label: "Tertiary Button Text", desc: "Tertiary button text" },
  button_quaternary_bg: { label: "Outline Button", desc: "White/outline buttons" },
  button_quaternary_text: { label: "Outline Button Text", desc: "Outline button text" },
  footer_bg: { label: "Footer Background", desc: "Footer section background" },
  footer_text: { label: "Footer Text", desc: "Footer text color" },
  link_color: { label: "Link", desc: "Link color" },
  link_hover: { label: "Link Hover", desc: "Link hover color" }
};
function brandColorLabel(key) {
  if (BRAND_COLOR_LABELS[key]) return BRAND_COLOR_LABELS[key].label;
  return key.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}
const CHECKERBOARD_STYLE = {
  backgroundImage: "linear-gradient(45deg, #d1d5db 25%, transparent 25%), linear-gradient(-45deg, #d1d5db 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d1d5db 75%), linear-gradient(-45deg, transparent 75%, #d1d5db 75%)",
  backgroundSize: "12px 12px",
  backgroundPosition: "0 0, 0 6px, 6px -6px, -6px 0"
};
function Show({ auth }) {
  const { website, title } = usePage().props;
  return /* @__PURE__ */ jsxs(AdminLayout, { title, children: [
    /* @__PURE__ */ jsx(Head, { title }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
          /* @__PURE__ */ jsx(
            Link,
            {
              href: route("admin.websites.index"),
              className: "text-gray-500 hover:text-gray-700 mr-4",
              children: "← Back"
            }
          ),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-bold text-gray-900 flex items-center", children: [
              website.name,
              website.is_default && /* @__PURE__ */ jsx("span", { className: "ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800", children: "Default" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mt-1", children: website.slug })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
          /* @__PURE__ */ jsx(
            "a",
            {
              href: "/",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50",
              children: "View Live Site"
            }
          ),
          /* @__PURE__ */ jsx(
            Link,
            {
              href: route("admin.websites.edit", website.id),
              className: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700",
              children: "Edit Website"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-white shadow rounded-lg border border-gray-200 p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-gray-900", children: "Website Status" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Current operational status" })
        ] }),
        /* @__PURE__ */ jsx("span", { className: `inline-flex px-3 py-1 text-sm font-semibold rounded-full ${website.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`, children: website.is_active ? "Active" : "Inactive" })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white shadow rounded-lg border border-gray-200 p-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-gray-900 mb-4", children: "Website Information" }),
          /* @__PURE__ */ jsxs("dl", { className: "space-y-4", children: [
            (website.logo || website.logo_url) && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Logo" }),
              /* @__PURE__ */ jsx("dd", { className: "mt-1", children: /* @__PURE__ */ jsx(
                "div",
                {
                  className: "inline-block rounded-lg border border-gray-200 p-3",
                  style: CHECKERBOARD_STYLE,
                  children: /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: website.logo || website.logo_url,
                      alt: `${website.name} logo`,
                      className: "h-16 object-contain"
                    }
                  )
                }
              ) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Domain" }),
              /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900", children: website.domain || "Default Domain" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Description" }),
              /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900", children: website.description || "No description provided" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Timezone" }),
              /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900", children: website.timezone || "America/Toronto" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white shadow rounded-lg border border-gray-200 p-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-gray-900 mb-4", children: "Contact Information" }),
          website.contact_info ? /* @__PURE__ */ jsxs("dl", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Phone" }),
              /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900", children: website.contact_info.phone || "Not provided" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Email" }),
              /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900", children: website.contact_info.email || "Not provided" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Address" }),
              /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900", children: website.contact_info.address || "Not provided" })
            ] })
          ] }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "No contact information provided" })
        ] })
      ] }),
      website.brand_colors && /* @__PURE__ */ jsxs("div", { className: "bg-white shadow rounded-lg border border-gray-200 p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-gray-900 mb-4", children: "Brand Colors" }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: Object.entries(website.brand_colors).map(([name, color]) => /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "w-8 h-8 rounded-lg border border-gray-300 shadow-sm shrink-0 p-0.5",
              style: CHECKERBOARD_STYLE,
              role: "img",
              "aria-label": `${brandColorLabel(name)}: ${color}`,
              title: color,
              children: /* @__PURE__ */ jsx(
                "div",
                {
                  className: "w-full h-full rounded-md",
                  style: { backgroundColor: color }
                }
              )
            }
          ),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-gray-900", children: brandColorLabel(name) }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500", children: color })
          ] })
        ] }, name)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white shadow rounded-lg border border-gray-200", children: [
        /* @__PURE__ */ jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-gray-900", children: "Website Pages" }) }),
        /* @__PURE__ */ jsx("div", { className: "divide-y divide-gray-200", children: website.pages && website.pages.length > 0 ? website.pages.map((page) => /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 flex items-center justify-between hover:bg-gray-50", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium text-gray-900 capitalize", children: [
              page.page_type.replace("_", " "),
              " Page"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: page.title })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
            /* @__PURE__ */ jsx("span", { className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${page.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`, children: page.is_active ? "Active" : "Inactive" }),
            page.page_type === "home" && /* @__PURE__ */ jsx(
              Link,
              {
                href: route("admin.websites.edit-home-page", website.id),
                className: "text-indigo-600 hover:text-indigo-900 text-sm font-medium",
                children: "Edit Content"
              }
            )
          ] })
        ] }, page.id)) : /* @__PURE__ */ jsx("div", { className: "px-6 py-8 text-center", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "No pages found" }) }) })
      ] }),
      website.social_media && Object.keys(website.social_media).length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-white shadow rounded-lg border border-gray-200 p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-gray-900 mb-4", children: "Social Media Links" }),
        /* @__PURE__ */ jsx("dl", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: Object.entries(website.social_media).map(([platform, url]) => /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500 capitalize", children: platform }),
          /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900", children: url ? /* @__PURE__ */ jsx("a", { href: url, target: "_blank", rel: "noopener noreferrer", className: "text-indigo-600 hover:text-indigo-800", children: url }) : /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: "Not provided" }) })
        ] }, platform)) })
      ] })
    ] })
  ] });
}
export {
  Show as default
};
