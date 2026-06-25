import { jsx, jsxs } from "react/jsx-runtime";
import "react";
import { usePage } from "@inertiajs/react";
const TourSection = () => {
  const { globalWebsite, website } = usePage().props;
  const currentWebsite = website || globalWebsite;
  const brandColors = currentWebsite?.brand_colors || {};
  const buttonTertiaryBg = brandColors.button_tertiary_bg || "#000000";
  const buttonTertiaryText = brandColors.button_tertiary_text || "#FFFFFF";
  return /* @__PURE__ */ jsx("section", { className: "py-8 bg-white", children: /* @__PURE__ */ jsxs("div", { className: "max-w-[1280px] mx-auto px-4", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-6 font-space-grotesk", children: "Schedule a Tour" }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 rounded-lg p-6", children: [
      /* @__PURE__ */ jsx("p", { className: "text-gray-700 mb-4", children: "Interested in seeing this property? Schedule a virtual or in-person tour." }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "flex-1 py-3 px-6 rounded-lg font-semibold transition-opacity hover:opacity-90",
            style: { backgroundColor: buttonTertiaryBg, color: buttonTertiaryText },
            children: "Schedule Virtual Tour"
          }
        ),
        /* @__PURE__ */ jsx("button", { className: "flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors", children: "Request In-Person Visit" })
      ] })
    ] })
  ] }) });
};
export {
  TourSection as default
};
