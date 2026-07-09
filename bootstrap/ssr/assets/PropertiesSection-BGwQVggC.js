import { jsx, jsxs } from "react/jsx-runtime";
import PropertiesForSale from "./PropertiesForSale-Bi72E2vl.js";
import PropertiesForRent from "./PropertiesForRent-DWWaU5Y8.js";
import "react";
import "./PropertyCarousel-xQqZk_Vh.js";
import "./PropertyCard-BWgqbSLf.js";
import "@inertiajs/react";
import "axios";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import "./PhoneInput-BOSF9o14.js";
function PropertiesSection({ auth, website, pageContent }) {
  return /* @__PURE__ */ jsx("section", { className: "py-4 md:py-16 bg-gray-50", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto px-4 md:px-0 max-w-screen-[1280px]", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsx("div", { className: "flex flex-row items-start gap-2 w-[103px] h-8 bg-[#F5F5F5] rounded-[100px] flex-none mx-auto mb-4", children: /* @__PURE__ */ jsx("div", { className: "flex flex-row justify-center items-center py-1.5 px-4 gap-2 w-[103px] h-8 flex-none", children: /* @__PURE__ */ jsx("span", { className: "w-[71px] h-6 font-work-sans font-medium text-sm leading-6 flex items-center text-center text-[#293056] flex-none", children: "Properties" }) }) }),
      /* @__PURE__ */ jsx("h2", { className: "font-space-grotesk font-bold text-[40px] leading-[50px] tracking-[-0.03em] text-center text-gray-900 mb-4", children: "What you are looking for?" }),
      /* @__PURE__ */ jsx("p", { className: "font-work-sans font-normal text-lg leading-[27px] tracking-[-0.03em] text-center text-gray-600 max-w-2xl mx-auto", children: "Whether you're planning to move in temporarily or find a forever home, our listings are tailored to your needs." })
    ] }),
    /* @__PURE__ */ jsx(
      PropertiesForSale,
      {
        auth,
        carouselSettings: pageContent?.carousel_settings?.for_sale,
        mlsSettings: pageContent?.mls_settings
      }
    ),
    /* @__PURE__ */ jsx(
      PropertiesForRent,
      {
        auth,
        carouselSettings: pageContent?.carousel_settings?.for_rent,
        mlsSettings: pageContent?.mls_settings
      }
    )
  ] }) });
}
export {
  PropertiesSection as default
};
