import { jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import Navbar from "./Navbar-DVqP4Fqr.js";
import "@inertiajs/react";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import "./LoginModal-C-0W-anf.js";
import "./GoogleLoginButton-wrwag0eM.js";
import "./PropertyDetailIcons-3huqvWqW.js";
import "@headlessui/react";
function HomeHeader({ auth, website }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleScroll = () => {
      setScrolled(window.scrollY > 32);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const navy = website?.brand_colors?.header_bg || website?.brand_colors?.secondary || "#041B52";
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "fixed top-0 left-0 right-0 z-50 w-full flex items-center transition-all duration-300",
      style: {
        height: "82px",
        backgroundColor: scrolled ? navy : "transparent",
        boxShadow: scrolled ? "0 4px 20px rgba(0, 0, 0, 0.25)" : "none"
      },
      children: /* @__PURE__ */ jsx(Navbar, { auth, website, onDarkBg: true })
    }
  );
}
export {
  HomeHeader as default
};
