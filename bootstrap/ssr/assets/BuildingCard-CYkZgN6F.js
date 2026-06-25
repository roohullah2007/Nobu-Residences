import { jsx, jsxs } from "react/jsx-runtime";
import "react";
import { a as createSEOBuildingUrl } from "./slug-BdTdDGUL.js";
const BuildingCard = ({ building, size = "default", className = "" }) => {
  if (!building) {
    return null;
  }
  const {
    id,
    name,
    address,
    city,
    province,
    building_type,
    total_units,
    year_built,
    developer,
    available_units_count,
    price_range,
    main_image
  } = building;
  const developer_name = developer?.name || null;
  const cardClasses = {
    default: "w-full max-w-sm",
    large: "w-full max-w-lg"
  };
  return /* @__PURE__ */ jsx("div", { className: `${cardClasses[size]} ${className}`, children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative h-48 bg-gray-200", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: main_image || "/images/no-image-placeholder.jpg",
          alt: name,
          className: "w-full h-full object-cover",
          onError: (e) => {
            e.target.src = "/images/no-image-placeholder.jpg";
          }
        }
      ),
      building_type && /* @__PURE__ */ jsx("div", { className: "absolute top-2 left-2 bg-white px-2 py-1 rounded text-xs font-semibold text-gray-700", children: building_type }),
      year_built && /* @__PURE__ */ jsxs("div", { className: "absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs", children: [
        "Built ",
        year_built
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
      /* @__PURE__ */ jsx(
        "h3",
        {
          className: "font-bold text-lg text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-gray-700 transition-colors duration-200",
          onClick: () => window.location.href = createSEOBuildingUrl(building),
          children: name
        }
      ),
      /* @__PURE__ */ jsxs("p", { className: "text-gray-600 text-sm mb-3 line-clamp-1", children: [
        address,
        ", ",
        city,
        ", ",
        province
      ] }),
      developer_name && /* @__PURE__ */ jsxs("p", { className: "text-gray-500 text-xs mb-3", children: [
        "By ",
        developer_name
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 mb-4", children: [
        total_units && /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-lg font-bold text-gray-900", children: total_units }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500", children: "Total Units" })
        ] }),
        available_units_count !== void 0 && /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-lg font-bold text-green-600", children: available_units_count }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500", children: "Available" })
        ] })
      ] }),
      price_range && /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xl font-bold text-gray-900", children: price_range }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500", children: "Price Range" })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => window.location.href = createSEOBuildingUrl(building),
          className: "w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded transition-colors duration-200",
          children: "View Building"
        }
      )
    ] })
  ] }) });
};
export {
  BuildingCard as default
};
