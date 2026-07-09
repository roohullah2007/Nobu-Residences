import { jsxs, jsx } from "react/jsx-runtime";
import "react";
import { Head } from "@inertiajs/react";
import MainLayout from "./MainLayout-B3DCp-WI.js";
import PolicyContent from "./PolicyContent-DWulWG5n.js";
import "./Footer-BjazYOa4.js";
import "./ContactAgentModal-Bc8CTpfm.js";
import "./Navbar-Cf7RY0yN.js";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import "./LoginModal-C-0W-anf.js";
import "./GoogleLoginButton-wrwag0eM.js";
import "./PropertyDetailIcons-3huqvWqW.js";
import "@headlessui/react";
function Privacy({ auth, siteName, siteUrl, year, website }) {
  return /* @__PURE__ */ jsxs(MainLayout, { siteName, siteUrl, year, website, auth, blueHeader: true, children: [
    /* @__PURE__ */ jsx(Head, { title: `Privacy Policy - ${siteName}` }),
    /* @__PURE__ */ jsx("div", { className: "idx mx-auto overflow-hidden bg-primary", children: /* @__PURE__ */ jsxs("div", { className: "px-4 md:px-0 max-w-[1024px] mx-auto pt-12 md:pt-16", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-10", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("h1", { className: "font-space-grotesk font-bold text-3xl md:text-5xl leading-tight tracking-[-0.03em] text-[#293056] mb-4", children: "Privacy Policy" }),
        /* @__PURE__ */ jsx("p", { className: "font-work-sans font-normal text-lg leading-7 tracking-[-0.03em] text-gray-600 max-w-2xl mx-auto", children: "Your privacy is important to us. This policy explains how we collect, use, and protect your information." }),
        /* @__PURE__ */ jsxs("p", { className: "font-work-sans font-normal text-sm text-gray-500 mt-4", children: [
          "Last updated: ",
          (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "mb-12", children: /* @__PURE__ */ jsx(PolicyContent, { website, siteName }) })
    ] }) })
  ] });
}
export {
  Privacy as default
};
