import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@inertiajs/react";
import { useState, useEffect } from "react";
function Navbar({ auth = {}, website = {} }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return /* @__PURE__ */ jsx("header", { className: "absolute top-0 left-0 right-0 w-full flex items-center justify-center z-20", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto px-4 py-4 md:py-8 w-full max-w-[1280px] sm:px-6 md:px-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex md:hidden justify-between items-center px-4 py-2 bg-white rounded-xl", children: [
      /* @__PURE__ */ jsx(Link, { href: "/", className: "flex items-center", children: website?.logo_url ? /* @__PURE__ */ jsx(
        "img",
        {
          src: website.logo || website.logo_url,
          alt: website?.name || "Site Logo",
          className: "h-8 w-auto object-contain"
        }
      ) : /* @__PURE__ */ jsx("div", { className: "font-space-grotesk font-bold text-black", children: website?.name || "X HOUSES" }) }),
      /* @__PURE__ */ jsx("div", { className: "md:hidden", children: /* @__PURE__ */ jsx(
        "button",
        {
          className: "bg-white rounded-lg p-2 text-gray-900",
          onClick: () => setMobileMenuOpen(!mobileMenuOpen),
          style: { background: "#FFFFFF" },
          children: /* @__PURE__ */ jsx("svg", { width: "24", height: "16", viewBox: "0 0 24 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M0 2.66667V0H24V2.66667H0ZM0 9.33333H24V6.66667H0V9.33333ZM0 16H24V13.3333H0V16Z", fill: "#1C1463" }) })
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "hidden md:flex h-16 bg-white rounded-xl items-center justify-between px-6", children: [
      /* @__PURE__ */ jsx(Link, { href: "/", className: "flex items-center", children: website?.logo_url ? /* @__PURE__ */ jsx(
        "img",
        {
          src: website.logo || website.logo_url,
          alt: website?.name || "Site Logo",
          className: "h-10 w-auto object-contain"
        }
      ) : /* @__PURE__ */ jsx("div", { className: "font-space-grotesk font-bold text-black text-[32px] leading-[36px] tracking-[-0.011em]", children: website?.name || "X HOUSES" }) }),
      /* @__PURE__ */ jsxs("nav", { className: "hidden md:flex items-center", style: { gap: "32px" }, children: [
        /* @__PURE__ */ jsx(
          Link,
          {
            href: "/",
            className: "text-gray-900 hover:text-blue-600 transition-colors font-work-sans",
            style: {
              fontSize: "16px",
              fontWeight: "500"
            },
            children: "Home"
          }
        ),
        /* @__PURE__ */ jsx(
          Link,
          {
            href: "/rent",
            className: "text-gray-900 hover:text-blue-600 transition-colors font-work-sans",
            style: {
              fontSize: "16px",
              fontWeight: "500"
            },
            children: "Rent"
          }
        ),
        /* @__PURE__ */ jsx(
          Link,
          {
            href: "/sale",
            className: "text-gray-900 hover:text-blue-600 transition-colors font-work-sans",
            style: {
              fontSize: "16px",
              fontWeight: "500"
            },
            children: "Sale"
          }
        ),
        /* @__PURE__ */ jsx(
          Link,
          {
            href: "/search",
            className: "text-gray-900 hover:text-blue-600 transition-colors font-work-sans",
            style: {
              fontSize: "16px",
              fontWeight: "500"
            },
            children: "Search All"
          }
        ),
        /* @__PURE__ */ jsx(
          Link,
          {
            href: "/blog",
            className: "text-gray-900 hover:text-blue-600 transition-colors font-work-sans",
            style: {
              fontSize: "16px",
              fontWeight: "500"
            },
            children: "Blog"
          }
        ),
        /* @__PURE__ */ jsx(
          Link,
          {
            href: "/contact",
            className: "text-gray-900 hover:text-blue-600 transition-colors font-work-sans",
            style: {
              fontSize: "16px",
              fontWeight: "500"
            },
            children: "Contact Us"
          }
        ),
        /* @__PURE__ */ jsx(
          Link,
          {
            href: "/property-detail",
            className: "text-gray-900 hover:text-blue-600 transition-colors font-work-sans",
            style: {
              fontSize: "16px",
              fontWeight: "500"
            },
            children: "Property Detail"
          }
        ),
        /* @__PURE__ */ jsx(
          Link,
          {
            href: "/login",
            className: "px-4 py-2 rounded-lg transition-colors font-work-sans",
            style: {
              fontSize: "16px",
              fontWeight: "500"
            },
            children: "Log In"
          }
        )
      ] })
    ] }),
    mobileMenuOpen && /* @__PURE__ */ jsx(
      "div",
      {
        className: "md:hidden absolute bg-white rounded-2xl shadow-lg py-4 px-6 z-50 left-4 right-4 top-20",
        style: {
          maxWidth: "calc(100vw - 32px)",
          minHeight: "auto"
        },
        children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col space-y-4", children: [
          /* @__PURE__ */ jsx(
            Link,
            {
              href: "/",
              className: "text-gray-900 hover:text-blue-600 transition-colors font-work-sans",
              style: { fontSize: "16px", fontWeight: "500" },
              onClick: () => setMobileMenuOpen(false),
              children: "Home"
            }
          ),
          /* @__PURE__ */ jsx(
            Link,
            {
              href: "/rent",
              className: "text-gray-900 hover:text-blue-600 transition-colors font-work-sans",
              style: { fontSize: "16px", fontWeight: "500" },
              onClick: () => setMobileMenuOpen(false),
              children: "Rent"
            }
          ),
          /* @__PURE__ */ jsx(
            Link,
            {
              href: "/sale",
              className: "text-gray-900 hover:text-blue-600 transition-colors font-work-sans",
              style: { fontSize: "16px", fontWeight: "500" },
              onClick: () => setMobileMenuOpen(false),
              children: "Sale"
            }
          ),
          /* @__PURE__ */ jsx(
            Link,
            {
              href: "/search",
              className: "text-gray-900 hover:text-blue-600 transition-colors font-work-sans",
              style: { fontSize: "16px", fontWeight: "500" },
              onClick: () => setMobileMenuOpen(false),
              children: "Search All"
            }
          ),
          /* @__PURE__ */ jsx(
            Link,
            {
              href: "/blog",
              className: "text-gray-900 hover:text-blue-600 transition-colors font-work-sans",
              style: { fontSize: "16px", fontWeight: "500" },
              onClick: () => setMobileMenuOpen(false),
              children: "Blog"
            }
          ),
          /* @__PURE__ */ jsx(
            Link,
            {
              href: "/contact",
              className: "text-gray-900 hover:text-blue-600 transition-colors font-work-sans",
              style: { fontSize: "16px", fontWeight: "500" },
              onClick: () => setMobileMenuOpen(false),
              children: "Contact Us"
            }
          ),
          /* @__PURE__ */ jsx(
            Link,
            {
              href: "/property-detail",
              className: "text-gray-900 hover:text-blue-600 transition-colors font-work-sans",
              style: { fontSize: "16px", fontWeight: "500" },
              onClick: () => setMobileMenuOpen(false),
              children: "Property Detail"
            }
          ),
          auth?.user ? /* @__PURE__ */ jsx(
            Link,
            {
              href: "/dashboard",
              className: "bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-work-sans text-center",
              style: { fontSize: "16px", fontWeight: "500" },
              onClick: () => setMobileMenuOpen(false),
              children: "Dashboard"
            }
          ) : /* @__PURE__ */ jsx(
            Link,
            {
              href: "/login",
              className: "bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-work-sans text-center",
              style: { fontSize: "16px", fontWeight: "500" },
              onClick: () => setMobileMenuOpen(false),
              children: "Log In"
            }
          )
        ] })
      }
    )
  ] }) });
}
export {
  Navbar as default
};
