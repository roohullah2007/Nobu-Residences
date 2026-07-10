import { jsxs, jsx } from "react/jsx-runtime";
import "react";
import { Head, Link } from "@inertiajs/react";
import { A as AdminLayout } from "./AdminLayout-CaxbTFCB.js";
import { P as PrimaryButton } from "./PrimaryButton-DDF1xnxF.js";
import { S as SecondaryButton } from "./SecondaryButton-D0HLp6wy.js";
const createBuildingSlug = (name, id) => {
  if (!name) return id;
  const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
  return `${slug}-${id}`;
};
function BuildingsShow({ auth, building }) {
  const getStatusBadge = (status) => {
    if (!status) {
      status = "pending";
    }
    const statusColors = {
      "active": "bg-green-100 text-green-800",
      "inactive": "bg-gray-100 text-gray-800",
      "pending": "bg-yellow-100 text-yellow-800"
    };
    return /* @__PURE__ */ jsx("span", { className: `inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || statusColors["pending"]}`, children: status.charAt(0).toUpperCase() + status.slice(1) });
  };
  const getBuildingTypeLabel = (type) => {
    const types = {
      "condominium": "Condominium",
      "apartment": "Apartment",
      "townhouse": "Townhouse",
      "commercial": "Commercial",
      "mixed_use": "Mixed Use"
    };
    return types[type] || type;
  };
  const getDevelopmentStatusLabel = (developmentStatus) => {
    const labels = {
      "pre_construction": "Pre Construction",
      "under_construction": "Under Construction",
      "completed": "Completed",
      "sold_out": "Sold Out"
    };
    return labels[developmentStatus] || developmentStatus;
  };
  return /* @__PURE__ */ jsxs(AdminLayout, { title: `Building: ${building.name}`, children: [
    /* @__PURE__ */ jsx(Head, { title: `Building: ${building.name}` }),
    /* @__PURE__ */ jsxs("div", { className: "sm:flex sm:items-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "sm:flex-auto", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900", children: building.name }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center space-x-4", children: [
          getStatusBadge(building.status),
          building.is_featured && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center text-yellow-500", children: [
            /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 mr-1", fill: "currentColor", viewBox: "0 0 20 20", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" }) }),
            "Featured Building"
          ] }),
          building.development_status && /* @__PURE__ */ jsx("span", { className: "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800", children: getDevelopmentStatusLabel(building.development_status) }),
          /* @__PURE__ */ jsxs("span", { className: "text-sm text-gray-500", children: [
            "Views: ",
            building.view_count || 0
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 sm:ml-16 sm:mt-0 sm:flex-none space-x-2", children: [
        /* @__PURE__ */ jsx(Link, { href: route("admin.buildings.index"), className: "inline-block", children: /* @__PURE__ */ jsx(SecondaryButton, { children: "Back to List" }) }),
        /* @__PURE__ */ jsx(Link, { href: route("admin.buildings.edit", createBuildingSlug(building.name, building.id)), className: "inline-block", children: /* @__PURE__ */ jsx(PrimaryButton, { children: "Edit Building" }) })
      ] })
    ] }),
    building.images && building.images.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-8", children: /* @__PURE__ */ jsxs("div", { className: "bg-white shadow rounded-lg p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Building Images" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: building.images.map((image, index) => /* @__PURE__ */ jsx(
        "img",
        {
          src: image,
          alt: `${building.name} - Image ${index + 1}`,
          className: "w-full h-48 object-cover rounded-lg shadow-sm"
        },
        index
      )) })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white shadow rounded-lg", children: [
          /* @__PURE__ */ jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Basic Information" }) }),
          /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
            /* @__PURE__ */ jsxs("dl", { className: "grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Building Type" }),
                /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900", children: getBuildingTypeLabel(building.building_type) })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Total Units" }),
                /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900", children: building.total_units || "N/A" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Total Floors" }),
                /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900", children: building.floors || "N/A" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Available Units" }),
                /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900", children: building.available_units_count || 0 })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Year Built" }),
                /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900", children: building.year_built || "N/A" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Year Renovated" }),
                /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900", children: building.year_renovated || "N/A" })
              ] })
            ] }),
            building.description && /* @__PURE__ */ jsxs("div", { className: "mt-6", children: [
              /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Description" }),
              /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900", children: building.description })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white shadow rounded-lg", children: [
          /* @__PURE__ */ jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Location Details" }) }),
          /* @__PURE__ */ jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxs("dl", { className: "grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
              /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Full Address" }),
              /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900", children: building.full_address })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Street Address" }),
              /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900", children: building.address })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500", children: "City" }),
              /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900", children: building.city })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Province" }),
              /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900", children: building.province })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Postal Code" }),
              /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900", children: building.postal_code || "N/A" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Country" }),
              /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900", children: building.country || "Canada" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Coordinates" }),
              /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900", children: building.latitude && building.longitude ? `${building.latitude}, ${building.longitude}` : "Not set" })
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white shadow rounded-lg", children: [
          /* @__PURE__ */ jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Developer & Management" }) }),
          /* @__PURE__ */ jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxs("dl", { className: "grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Developer" }),
              /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900", children: building.developer?.name || "N/A" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Management Company" }),
              /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900", children: building.management_company || "N/A" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Architect" }),
              /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900", children: building.architect || "N/A" })
            ] })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white shadow rounded-lg", children: [
          /* @__PURE__ */ jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Financial Details" }) }),
          /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Maintenance Fee Range" }),
              /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900", children: building.maintenance_fee_range_min && building.maintenance_fee_range_max ? `$${Number(building.maintenance_fee_range_min).toLocaleString()} - $${Number(building.maintenance_fee_range_max).toLocaleString()}` : "N/A" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Property Tax Range" }),
              /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900", children: building.property_tax_range_min && building.property_tax_range_max ? `$${Number(building.property_tax_range_min).toLocaleString()} - $${Number(building.property_tax_range_max).toLocaleString()}` : "N/A" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Price Range (Available Units)" }),
              /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900", children: building.price_range || "N/A" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white shadow rounded-lg", children: [
          /* @__PURE__ */ jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Amenities" }) }),
          /* @__PURE__ */ jsx("div", { className: "p-6", children: building.amenities && building.amenities.length > 0 ? /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: building.amenities.map((amenity) => /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800", children: [
            /* @__PURE__ */ jsx("span", { children: amenity.icon || "✨" }),
            amenity.name
          ] }, amenity.id)) }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "No amenities listed" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white shadow rounded-lg", children: [
          /* @__PURE__ */ jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Features" }) }),
          /* @__PURE__ */ jsx("div", { className: "p-6", children: building.features && building.features.length > 0 ? /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: building.features.map((feature, index) => /* @__PURE__ */ jsx("span", { className: "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800", children: feature }, index)) }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "No features listed" }) })
        ] }),
        building.virtual_tour_url && /* @__PURE__ */ jsxs("div", { className: "bg-white shadow rounded-lg", children: [
          /* @__PURE__ */ jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Virtual Tour" }) }),
          /* @__PURE__ */ jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxs(
            "a",
            {
              href: building.virtual_tour_url,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors",
              children: [
                /* @__PURE__ */ jsx("span", { className: "mr-2", children: "🎥" }),
                "View Virtual Tour"
              ]
            }
          ) })
        ] }),
        building.mls_building_id && /* @__PURE__ */ jsxs("div", { className: "bg-white shadow rounded-lg", children: [
          /* @__PURE__ */ jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900", children: "MLS Information" }) }),
          /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500", children: "MLS Building ID" }),
              /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900", children: building.mls_building_id })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Last MLS Sync" }),
              /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900", children: building.mls_last_sync ? new Date(building.mls_last_sync).toLocaleString() : "Never synced" })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  BuildingsShow as default
};
