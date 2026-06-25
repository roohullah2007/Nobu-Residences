import { jsxs, jsx } from "react/jsx-runtime";
import "react";
import PluginStyleImageLoader from "./PluginStyleImageLoader-Rq93vDmq.js";
const PropertyCardV3 = ({
  image,
  title,
  address,
  units,
  priceRange,
  onClick,
  listingKey
}) => {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "bg-white shadow-lg mb-1 border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer",
      onClick,
      children: [
        /* @__PURE__ */ jsx("div", { className: "relative bg-gray-100 h-[200px] overflow-hidden", children: /* @__PURE__ */ jsx(
          PluginStyleImageLoader,
          {
            src: image,
            alt: `${title} - ${address}`,
            className: "w-full h-full",
            enableLazyLoading: true,
            rootMargin: "200px",
            threshold: 0.01,
            enableBlurEffect: true,
            priority: "normal",
            "data-listing-key": listingKey
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-[18px] font-semibold text-[#263238] mb-2 leading-tight", children: title }),
          /* @__PURE__ */ jsx("p", { className: "text-[14px] text-gray-600 mb-3 leading-relaxed", children: address }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[14px] text-gray-500", children: units }),
            /* @__PURE__ */ jsx("span", { className: "text-[16px] font-bold text-[#263238]", children: priceRange })
          ] })
        ] })
      ]
    }
  );
};
export {
  PropertyCardV3 as default
};
