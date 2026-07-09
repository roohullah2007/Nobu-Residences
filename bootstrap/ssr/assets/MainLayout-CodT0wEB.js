import { jsxs, jsx } from "react/jsx-runtime";
import Footer from "./Footer-COZ0Sr-M.js";
import Navbar from "./Navbar-BcUYeBAy.js";
import "react";
import "@inertiajs/react";
import "./ContactAgentModal-BZyWhDPm.js";
import "./PhoneInput-BOSF9o14.js";
import "./imageUrl-B-Y_O6wE.js";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import "./LoginModal-CkvRiYR7.js";
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
