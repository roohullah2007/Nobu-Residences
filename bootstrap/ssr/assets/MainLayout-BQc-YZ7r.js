import { jsxs, jsx } from "react/jsx-runtime";
import Footer from "./Footer-BjazYOa4.js";
import Navbar from "./Navbar-DVqP4Fqr.js";
import "react";
import "@inertiajs/react";
import "./ContactAgentModal-Bc8CTpfm.js";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import "./LoginModal-C-0W-anf.js";
import "./GoogleLoginButton-wrwag0eM.js";
import "./PropertyDetailIcons-3huqvWqW.js";
import "@headlessui/react";
function MainLayout({ children, siteName, siteUrl, year, website, pageContent, auth, hideHeader = false, blueHeader = true, noPadding = false }) {
  website?.brand_colors || {};
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen", children: [
    !hideHeader && (blueHeader ? (
      // Full-width sticky navy band, 82px tall, no top/side
      // gutters or border radius. Inner Navbar centres its
      // content within a 1280px max-width container with
      // 32px horizontal padding.
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "sticky top-0 z-30 w-full flex items-center",
          style: {
            height: "82px",
            backgroundColor: "#041B52"
          },
          children: /* @__PURE__ */ jsx(Navbar, { auth, website, onDarkBg: true })
        }
      )
    ) : /* @__PURE__ */ jsx(Navbar, { auth, website })),
    /* @__PURE__ */ jsx("main", { className: "md:px-0", children }),
    /* @__PURE__ */ jsx(Footer, { siteName, siteUrl, year, website, pageContent, auth })
  ] });
}
export {
  MainLayout as default
};
