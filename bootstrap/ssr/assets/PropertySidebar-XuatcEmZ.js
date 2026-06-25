import { jsxs, jsx } from "react/jsx-runtime";
import "react";
import { usePage } from "@inertiajs/react";
import TourSchedulingComponent from "./TourScheduling-UY9B6IS4.js";
const PropertySidebar = ({ propertyData, agentInfo }) => {
  const { globalWebsite, website } = usePage().props;
  const currentWebsite = website || globalWebsite;
  const brandColors = currentWebsite?.brand_colors || {};
  const buttonTertiaryBg = brandColors.button_tertiary_bg || "#000000";
  const buttonTertiaryText = brandColors.button_tertiary_text || "#FFFFFF";
  return /* @__PURE__ */ jsxs("div", { className: "w-full space-y-2", children: [
    /* @__PURE__ */ jsx("div", { className: "bg-white border border-gray-200 rounded-xl", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-between p-6 h-full", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 items-center", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 items-center justify-center w-full", children: [
            /* @__PURE__ */ jsx("span", { className: "font-space-grotesk font-bold text-2xl leading-[34px] uppercase text-[#93370D]", children: "SOLD FOR" }),
            /* @__PURE__ */ jsx("span", { className: "font-space-grotesk font-bold text-2xl leading-[34px] uppercase text-[#93370D]", children: propertyData.soldFor })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "font-work-sans font-medium text-sm text-[#535862] text-center", children: propertyData.listedFor }),
          /* @__PURE__ */ jsx("div", { className: "w-full h-px border-t border-[#D5D7DA]" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-red-hat font-bold text-xl text-[#252B37]", children: "Properties detail" }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-6", children: Object.entries(propertyData.details).map(([key, value]) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center gap-3 w-full", children: [
            /* @__PURE__ */ jsx("span", { className: "font-work-sans font-normal text-base leading-[25px] text-[#252B37] tracking-tight capitalize break-words", children: key === "maintenanceFees" ? "Maintenance Fees" : key === "propertyTaxes" ? "Property Taxes" : key === "area" ? "Square Feet" : key }),
            /* @__PURE__ */ jsx("span", { className: "font-work-sans font-normal text-base leading-[25px] text-[#252B37] tracking-tight text-right break-words", children: value })
          ] }, key)) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "rounded-full h-14 flex items-center justify-center w-full mt-6 transition-opacity hover:opacity-90", style: { backgroundColor: buttonTertiaryBg }, children: /* @__PURE__ */ jsx("button", { className: "w-full h-full flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "font-work-sans font-extrabold text-base", style: { color: buttonTertiaryText }, children: "Call us" }) }) })
    ] }) }),
    /* @__PURE__ */ jsx(
      TourSchedulingComponent,
      {
        propertyData,
        agentInfo
      }
    )
  ] });
};
export {
  PropertySidebar as default
};
