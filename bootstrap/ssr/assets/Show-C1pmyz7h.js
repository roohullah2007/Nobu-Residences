import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { A as AdminLayout } from "./AdminLayout-DVgDNs4A.js";
import { Link } from "@inertiajs/react";
function MLSShow({ property }) {
  const [selectedImage, setSelectedImage] = useState(0);
  return /* @__PURE__ */ jsx(AdminLayout, { title: `Property Details - ${property.mls_number}`, children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(
      Link,
      {
        href: route("admin.mls.index"),
        className: "inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700 font-medium",
        children: [
          /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 mr-1", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }),
          "Back to Properties"
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900", children: property.address }),
        /* @__PURE__ */ jsxs("p", { className: "text-lg text-gray-600 mt-1", children: [
          property.city,
          ", ",
          property.province,
          " ",
          property.postal_code
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500 mt-2", children: [
          "MLS #: ",
          property.mls_number
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-3xl font-bold text-indigo-600", children: [
          "$",
          property.price ? property.price.toLocaleString() : "N/A"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mt-1", children: property.property_type }),
        /* @__PURE__ */ jsx("span", { className: `mt-2 inline-block px-3 py-1 text-sm font-semibold rounded-full ${property.status === "active" ? "bg-green-100 text-green-800" : property.status === "sold" ? "bg-blue-100 text-blue-800" : property.status === "leased" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"}`, children: property.status })
      ] })
    ] }) }),
    property.image_urls && property.image_urls.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-xl font-semibold text-gray-900 mb-4", children: [
        "Property Images (",
        property.image_urls.length,
        ")"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx(
        "img",
        {
          src: property.image_urls[selectedImage],
          alt: `${property.address} - Image ${selectedImage + 1}`,
          className: "w-full h-96 object-cover rounded-lg"
        }
      ) }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-6 gap-2", children: property.image_urls.map((url, index) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setSelectedImage(index),
          className: `relative aspect-square rounded-lg overflow-hidden ${selectedImage === index ? "ring-2 ring-indigo-600" : ""}`,
          children: /* @__PURE__ */ jsx(
            "img",
            {
              src: url,
              alt: `Thumbnail ${index + 1}`,
              className: "w-full h-full object-cover hover:opacity-75 transition-opacity"
            }
          )
        },
        index
      )) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-4", children: "Key Details" }),
        /* @__PURE__ */ jsxs("dl", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-600", children: "Property Type" }),
            /* @__PURE__ */ jsx("dd", { className: "text-sm text-gray-900", children: property.property_sub_type || "N/A" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-600", children: "Bedrooms" }),
            /* @__PURE__ */ jsx("dd", { className: "text-sm text-gray-900", children: property.bedrooms || 0 })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-600", children: "Bathrooms" }),
            /* @__PURE__ */ jsx("dd", { className: "text-sm text-gray-900", children: property.bathrooms || 0 })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-600", children: "Parking Spaces" }),
            /* @__PURE__ */ jsx("dd", { className: "text-sm text-gray-900", children: property.parking_spaces || 0 })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-600", children: "Square Footage" }),
            /* @__PURE__ */ jsx("dd", { className: "text-sm text-gray-900", children: property.square_footage ? property.square_footage.toLocaleString() + " sq ft" : "N/A" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-600", children: "Lot Size" }),
            /* @__PURE__ */ jsx("dd", { className: "text-sm text-gray-900", children: property.lot_size ? property.lot_size.toLocaleString() + " sq ft" : "N/A" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-4", children: "Sync Information" }),
        /* @__PURE__ */ jsxs("dl", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-600", children: "MLS ID" }),
            /* @__PURE__ */ jsx("dd", { className: "text-sm text-gray-900 font-mono", children: property.mls_id })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-600", children: "Last Synced" }),
            /* @__PURE__ */ jsx("dd", { className: "text-sm text-gray-900", children: property.last_synced_at ? new Date(property.last_synced_at).toLocaleString() : "Never" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-600", children: "Listed Date" }),
            /* @__PURE__ */ jsx("dd", { className: "text-sm text-gray-900", children: property.listed_date ? new Date(property.listed_date).toLocaleDateString() : "N/A" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-600", children: "Updated Date" }),
            /* @__PURE__ */ jsx("dd", { className: "text-sm text-gray-900", children: property.updated_date ? new Date(property.updated_date).toLocaleDateString() : "N/A" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-600", children: "Active Status" }),
            /* @__PURE__ */ jsx("dd", { className: "text-sm", children: /* @__PURE__ */ jsx("span", { className: `px-2 py-1 text-xs font-semibold rounded-full ${property.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`, children: property.is_active ? "Active" : "Inactive" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2 border-b border-gray-100", children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-600", children: "Sync Status" }),
            /* @__PURE__ */ jsx("dd", { className: "text-sm", children: /* @__PURE__ */ jsx("span", { className: `px-2 py-1 text-xs font-semibold rounded-full ${property.sync_failed ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`, children: property.sync_failed ? "Failed" : "Success" }) })
          ] }),
          property.sync_error && /* @__PURE__ */ jsxs("div", { className: "py-2", children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-600 mb-1", children: "Sync Error" }),
            /* @__PURE__ */ jsx("dd", { className: "text-sm text-red-600 bg-red-50 p-2 rounded", children: property.sync_error })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-4", children: "Location" }),
      /* @__PURE__ */ jsxs("dl", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-600", children: "Full Address" }),
          /* @__PURE__ */ jsx("dd", { className: "text-sm text-gray-900 mt-1", children: property.address })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-600", children: "City" }),
          /* @__PURE__ */ jsx("dd", { className: "text-sm text-gray-900 mt-1", children: property.city })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-600", children: "Province" }),
          /* @__PURE__ */ jsx("dd", { className: "text-sm text-gray-900 mt-1", children: property.province })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-600", children: "Postal Code" }),
          /* @__PURE__ */ jsx("dd", { className: "text-sm text-gray-900 mt-1", children: property.postal_code })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-600", children: "Latitude" }),
          /* @__PURE__ */ jsx("dd", { className: "text-sm text-gray-900 mt-1 font-mono", children: property.latitude || "N/A" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-600", children: "Longitude" }),
          /* @__PURE__ */ jsx("dd", { className: "text-sm text-gray-900 mt-1 font-mono", children: property.longitude || "N/A" })
        ] })
      ] })
    ] }),
    property.mls_data && /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-4", children: "Raw MLS Data" }),
      /* @__PURE__ */ jsx("div", { className: "bg-gray-50 p-4 rounded-lg overflow-x-auto", children: /* @__PURE__ */ jsx("pre", { className: "text-xs text-gray-700 whitespace-pre-wrap", children: JSON.stringify(property.mls_data, null, 2) }) })
    ] })
  ] }) });
}
export {
  MLSShow as default
};
