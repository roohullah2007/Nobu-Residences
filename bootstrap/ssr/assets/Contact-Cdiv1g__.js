import { jsxs, jsx } from "react/jsx-runtime";
import "react";
import { Head } from "@inertiajs/react";
import MainLayout from "./MainLayout-B3DCp-WI.js";
import ContactForm from "./ContactForm-BFqsQZVE.js";
import ContactInfo from "./ContactInfo-BBXSiwAy.js";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import FAQ from "./FAQ-zFddXG5C.js";
import "./Footer-BjazYOa4.js";
import "./ContactAgentModal-Bc8CTpfm.js";
import "./Navbar-Cf7RY0yN.js";
import "./LoginModal-C-0W-anf.js";
import "./GoogleLoginButton-wrwag0eM.js";
import "./PropertyDetailIcons-3huqvWqW.js";
import "@headlessui/react";
function Contact({ auth, siteName, siteUrl, year, website, faqs = [] }) {
  return /* @__PURE__ */ jsxs(MainLayout, { siteName, siteUrl, year, website, auth, blueHeader: true, children: [
    /* @__PURE__ */ jsx(Head, { title: `Contact Us - ${siteName}` }),
    /* @__PURE__ */ jsx("div", { className: "idx mx-auto overflow-hidden bg-primary", children: /* @__PURE__ */ jsxs("div", { className: "px-4 md:px-0 max-w-[1280px] mx-auto", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-10 py-8", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("h1", { className: "font-space-grotesk font-bold text-3xl md:text-5xl leading-tight tracking-[-0.03em] text-[#293056] mb-4", children: "Contact Us" }),
        /* @__PURE__ */ jsx("p", { className: "font-work-sans font-normal text-lg leading-7 tracking-[-0.03em] text-gray-600 max-w-2xl mx-auto", children: "Get in touch with our team for any questions about properties, viewings, or general inquiries." })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex md:flex-row flex-col gap-8 w-full mb-12", children: [
        /* @__PURE__ */ jsx("div", { className: "md:w-2/3", children: /* @__PURE__ */ jsx(ContactForm, { website }) }),
        /* @__PURE__ */ jsx("div", { className: "md:w-1/3", children: /* @__PURE__ */ jsx(ContactInfo, { website }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "faq-section mb-12", children: /* @__PURE__ */ jsx(FAQ, { faqItems: faqs }) })
    ] }) })
  ] });
}
export {
  Contact as default
};
