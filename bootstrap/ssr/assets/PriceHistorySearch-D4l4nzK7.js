import { jsxs, jsx } from "react/jsx-runtime";
import "react";
import { Head } from "@inertiajs/react";
import MainLayout from "./MainLayout-CodT0wEB.js";
import PriceHistorySearchInput from "./PriceHistorySearchInput-BEEykS6N.js";
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
function PriceHistorySearch({
  auth,
  siteName,
  siteUrl,
  year,
  website
}) {
  return /* @__PURE__ */ jsxs(
    MainLayout,
    {
      siteName,
      siteUrl,
      year,
      website,
      auth,
      blueHeader: true,
      noPadding: true,
      children: [
        /* @__PURE__ */ jsx(Head, { title: "Price History Search" }),
        /* @__PURE__ */ jsx("div", { className: "bg-white min-h-screen", children: /* @__PURE__ */ jsxs("div", { className: "max-w-[1280px] mx-auto px-4 py-12", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
            /* @__PURE__ */ jsx("h1", { className: "text-3xl md:text-4xl font-bold text-[#293056] font-space-grotesk mb-3", children: "Search Price History" }),
            /* @__PURE__ */ jsx("p", { className: "text-base text-gray-600 max-w-2xl mx-auto", children: "Find the full listing history of any property — sold, leased, expired, and current listings — by address or MLS number." })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "max-w-2xl mx-auto", children: /* @__PURE__ */ jsx(PriceHistorySearchInput, { autoFocus: true }) }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 text-center mt-6", children: [
            "Tip: paste an MLS number (like ",
            /* @__PURE__ */ jsx("code", { children: "C12345678" }),
            ") to jump straight to that listing's price history."
          ] })
        ] }) })
      ]
    }
  );
}
export {
  PriceHistorySearch as default
};
