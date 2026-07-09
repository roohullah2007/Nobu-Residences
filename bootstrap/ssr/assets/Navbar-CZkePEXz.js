import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { Link, usePage } from "@inertiajs/react";
import { useState, createContext, useContext, useEffect } from "react";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import LoginModal from "./LoginModal-BIklH_00.js";
import { Heart } from "./PropertyDetailIcons-3huqvWqW.js";
import { Transition } from "@headlessui/react";
import "./GoogleLoginButton-wrwag0eM.js";
const DropDownContext = createContext();
const Dropdown = ({ children }) => {
  const [open, setOpen] = useState(false);
  const toggleOpen = () => {
    setOpen((previousState) => !previousState);
  };
  return /* @__PURE__ */ jsx(DropDownContext.Provider, { value: { open, setOpen, toggleOpen }, children: /* @__PURE__ */ jsx("div", { className: "relative", children }) });
};
const Trigger = ({ children }) => {
  const { open, setOpen, toggleOpen } = useContext(DropDownContext);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { onClick: toggleOpen, children }),
    open && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 z-40",
        onClick: () => setOpen(false)
      }
    )
  ] });
};
const Content = ({
  align = "right",
  width = "48",
  contentClasses = "py-1 bg-white dark:bg-gray-700",
  children
}) => {
  const { open, setOpen } = useContext(DropDownContext);
  let alignmentClasses = "origin-top";
  if (align === "left") {
    alignmentClasses = "ltr:origin-top-left rtl:origin-top-right start-0";
  } else if (align === "right") {
    alignmentClasses = "ltr:origin-top-right rtl:origin-top-left end-0";
  }
  let widthClasses = "";
  if (width === "48") {
    widthClasses = "w-48";
  }
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(
    Transition,
    {
      show: open,
      enter: "transition ease-out duration-200",
      enterFrom: "opacity-0 scale-95",
      enterTo: "opacity-100 scale-100",
      leave: "transition ease-in duration-75",
      leaveFrom: "opacity-100 scale-100",
      leaveTo: "opacity-0 scale-95",
      children: /* @__PURE__ */ jsx(
        "div",
        {
          className: `absolute z-50 mt-2 rounded-md shadow-lg ${alignmentClasses} ${widthClasses}`,
          onClick: () => setOpen(false),
          children: /* @__PURE__ */ jsx(
            "div",
            {
              className: `rounded-md ring-1 ring-black ring-opacity-5 ` + contentClasses,
              children
            }
          )
        }
      )
    }
  ) });
};
const DropdownLink = ({ className = "", children, ...props }) => {
  return /* @__PURE__ */ jsx(
    Link,
    {
      ...props,
      className: "block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-100 focus:outline-none " + className,
      children
    }
  );
};
Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;
function Navbar({ auth = {}, website = {}, simplified = false, onDarkBg = false }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileMenuOpen]);
  const { globalWebsite } = usePage().props;
  const effectiveWebsite = website?.id ? website : globalWebsite;
  const buildUrl = (path) => {
    if (effectiveWebsite?.slug && effectiveWebsite?.id !== 1) {
      let cleanPath = path;
      if (path.includes("?website=") || path.includes("&website=")) {
        cleanPath = path.replace(/[?&]website=[^&]*/g, "").replace(/\?&/, "?").replace(/\?$/, "");
      }
      const separator = cleanPath.includes("?") ? "&" : "?";
      return `${cleanPath}${separator}website=${effectiveWebsite.slug}`;
    }
    return path;
  };
  const defaultNavLinks = [
    { id: 1, text: "Home", url: "/", enabled: true },
    { id: 2, text: "Rent", url: "/toronto/for-rent", enabled: true },
    { id: 3, text: "Sale", url: "/toronto/for-sale", enabled: true },
    { id: 4, text: "Search All", url: "/search", enabled: true },
    { id: 5, text: "Blog", url: "/blogs", enabled: true },
    { id: 6, text: "Developers", url: "/developers", enabled: true },
    { id: 7, text: "Compare", url: "/compare-listings", enabled: true },
    { id: 8, text: "Contact Us", url: "/contact", enabled: true }
  ];
  const getNavLinks = () => {
    const headerLinks = effectiveWebsite?.header_links;
    let links = defaultNavLinks;
    if (headerLinks?.enabled !== false && headerLinks?.links?.length > 0) {
      links = headerLinks.links.filter((link) => link.enabled !== false);
    }
    const hasDevelopersLink = links.some(
      (link) => link.url === "/developers" || link.text?.toLowerCase() === "developers"
    );
    if (!hasDevelopersLink) {
      const contactIndex = links.findIndex(
        (link) => link.text?.toLowerCase() === "contact us" || link.url === "/contact"
      );
      const developersLink = { id: "developers", text: "Developers", url: "/developers", enabled: true };
      if (contactIndex !== -1) {
        links = [
          ...links.slice(0, contactIndex),
          developersLink,
          ...links.slice(contactIndex)
        ];
      } else {
        links = [...links, developersLink];
      }
    }
    const hasCompareLink = links.some(
      (link) => link.url === "/compare-listings" || link.text?.toLowerCase() === "compare"
    );
    if (!hasCompareLink) {
      const contactIndex = links.findIndex(
        (link) => link.text?.toLowerCase() === "contact us" || link.url === "/contact"
      );
      const compareLink = { id: "compare", text: "Compare", url: "/compare-listings", enabled: true };
      if (contactIndex !== -1) {
        links = [
          ...links.slice(0, contactIndex),
          compareLink,
          ...links.slice(contactIndex)
        ];
      } else {
        links = [...links, compareLink];
      }
    }
    return links;
  };
  const navLinks = getNavLinks();
  const getNavUrl = (link) => {
    return buildUrl(link.url);
  };
  const brandColors = website?.brand_colors || {
    primary: "#912018",
    button_primary_bg: "#912018",
    button_primary_text: "#FFFFFF"
  };
  const buttonPrimaryBg = brandColors.button_primary_bg || brandColors.primary;
  const buttonPrimaryText = brandColors.button_primary_text || "#FFFFFF";
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);
  const mobileContainerClass = onDarkBg ? "flex lg:hidden justify-between items-center w-full" : "flex lg:hidden justify-between items-center px-4 py-3 bg-white rounded-xl w-full";
  const linkTextClass = onDarkBg ? "text-white" : "text-gray-900";
  const logoFallbackTextClass = onDarkBg ? "text-white" : "text-gray-900";
  const mobileBurgerClass = onDarkBg ? "rounded-lg p-2 hover:opacity-80 transition-colors bg-transparent text-white" : "rounded-lg p-2 hover:opacity-80 transition-colors bg-white text-gray-900";
  const headerClass = onDarkBg ? "w-full h-full flex items-center justify-center z-20" : "absolute top-0 left-0 right-0 w-full h-[85px] lg:h-auto flex items-center justify-center z-20";
  const innerWrapperClass = onDarkBg ? "mx-auto px-4 sm:px-6 lg:px-0 w-full max-w-[1280px] h-full flex items-center" : "mx-auto px-3 w-full max-w-[1280px] sm:px-6 lg:px-0 flex items-center justify-center py-0 lg:py-8";
  return /* @__PURE__ */ jsxs("header", { className: headerClass, children: [
    /* @__PURE__ */ jsxs("div", { className: innerWrapperClass, children: [
      /* @__PURE__ */ jsxs("div", { className: mobileContainerClass, children: [
        /* @__PURE__ */ jsx(Link, { href: buildUrl("/"), className: "flex items-center cursor-pointer", children: website?.logo_url ? /* @__PURE__ */ jsx(
          "img",
          {
            src: website.logo_url,
            alt: website?.name || "Site Logo",
            className: onDarkBg ? "object-contain object-left w-[160px] h-[55px]" : "object-contain w-[140px] h-[35px] md:w-[200px] md:h-[50px]"
          }
        ) : /* @__PURE__ */ jsx("div", { className: `font-space-grotesk font-bold text-base tracking-tight leading-tight ${logoFallbackTextClass}`, children: website?.name || "X HOUSES" }) }),
        /* @__PURE__ */ jsx("div", { className: "lg:hidden", children: /* @__PURE__ */ jsx(
          "button",
          {
            className: mobileBurgerClass,
            onClick: () => setMobileMenuOpen(!mobileMenuOpen),
            "aria-label": "Toggle mobile menu",
            children: mobileMenuOpen ? (
              // Close icon
              /* @__PURE__ */ jsx("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsx("path", { d: "M18 6L6 18M6 6L18 18", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) })
            ) : (
              // Hamburger icon
              /* @__PURE__ */ jsx("svg", { width: "24", height: "16", viewBox: "0 0 24 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M0 2.66667V0H24V2.66667H0ZM0 9.33333H24V6.66667H0V9.33333ZM0 16H24V13.3333H0V16Z", fill: "currentColor" }) })
            )
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: `hidden lg:flex items-center justify-between w-full ${onDarkBg ? "h-full" : "px-6 h-16 bg-white rounded-xl"}`, children: [
        /* @__PURE__ */ jsx(Link, { href: buildUrl("/"), className: "flex items-center cursor-pointer", children: website?.logo_url ? /* @__PURE__ */ jsx(
          "img",
          {
            src: website.logo_url,
            alt: website?.name || "Site Logo",
            style: onDarkBg ? { width: "220px", height: "60px", maxWidth: "220px" } : { width: "200px", height: "50px", maxWidth: "200px" },
            className: onDarkBg ? "object-contain object-left" : "object-contain"
          }
        ) : /* @__PURE__ */ jsx("div", { className: `font-space-grotesk font-bold text-[32px] leading-[36px] tracking-[-0.011em] ${logoFallbackTextClass}`, children: website?.name || "X HOUSES" }) }),
        /* @__PURE__ */ jsxs("nav", { className: "hidden lg:flex items-center gap-4 xl:gap-8", children: [
          navLinks.map((link) => /* @__PURE__ */ jsx(
            Link,
            {
              href: getNavUrl(link),
              className: `hover:opacity-70 transition-colors font-work-sans whitespace-nowrap text-sm xl:text-base font-medium ${linkTextClass}`,
              children: link.text
            },
            link.id
          )),
          simplified ? /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setLoginModalOpen(true),
              className: `px-4 py-2 rounded-lg transition-colors font-work-sans hover:opacity-80 whitespace-nowrap text-sm xl:text-base font-medium ${linkTextClass}`,
              children: "Log In"
            }
          ) : auth?.user ? /* @__PURE__ */ jsxs(Dropdown, { children: [
            /* @__PURE__ */ jsx(Dropdown.Trigger, { children: /* @__PURE__ */ jsxs("button", { className: "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-work-sans hover:opacity-80", children: [
              auth.user.avatar ? /* @__PURE__ */ jsx(
                "img",
                {
                  src: auth.user.avatar,
                  alt: auth.user.name,
                  className: "w-8 h-8 rounded-full object-cover"
                }
              ) : /* @__PURE__ */ jsx(
                "div",
                {
                  className: "w-8 h-8 text-white rounded-full flex items-center justify-center font-bold text-sm",
                  style: { backgroundColor: buttonPrimaryBg, color: buttonPrimaryText },
                  children: auth.user.name?.charAt(0).toUpperCase() || "U"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: `whitespace-nowrap text-sm xl:text-base font-medium ${linkTextClass}`, children: auth.user.name || "User" }),
              /* @__PURE__ */ jsx("svg", { className: `w-4 h-4 ${linkTextClass}`, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }) })
            ] }) }),
            /* @__PURE__ */ jsxs(Dropdown.Content, { align: "right", width: "56", contentClasses: "py-1 bg-white", children: [
              /* @__PURE__ */ jsx(Dropdown.Link, { href: buildUrl("/user/dashboard"), children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-gray-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" }) }),
                "Dashboard"
              ] }) }),
              /* @__PURE__ */ jsx(Dropdown.Link, { href: buildUrl("/user/favourites"), children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(Heart, { className: "w-4 h-4 text-red-500", filled: true }),
                "My Favourites"
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "border-t border-gray-100 my-1" }),
              /* @__PURE__ */ jsx(Dropdown.Link, { href: buildUrl("/profile"), children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxs("svg", { className: "w-4 h-4 text-gray-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [
                  /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" }),
                  /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" })
                ] }),
                "Profile Settings"
              ] }) }),
              /* @__PURE__ */ jsx(Dropdown.Link, { href: buildUrl("/logout"), method: "post", as: "button", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-gray-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" }) }),
                "Log Out"
              ] }) })
            ] })
          ] }) : /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setLoginModalOpen(true),
              className: `px-4 py-2 rounded-lg transition-colors font-work-sans hover:opacity-80 whitespace-nowrap text-sm xl:text-base font-medium ${linkTextClass}`,
              children: "Log In"
            }
          )
        ] })
      ] })
    ] }),
    mobileMenuOpen && /* @__PURE__ */ jsxs("div", { className: "lg:hidden fixed inset-0 z-[200]", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute inset-0 bg-black/20 backdrop-blur-sm",
          onClick: () => setMobileMenuOpen(false)
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "relative h-full flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200", children: [
        /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center flex-shrink-0", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-space-grotesk font-semibold text-gray-900 text-lg", children: "Navigation" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setMobileMenuOpen(false),
              className: "p-2 hover:bg-gray-200 rounded-lg transition-colors",
              "aria-label": "Close menu",
              children: /* @__PURE__ */ jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsx("path", { d: "M18 6L6 18M6 6L18 18", stroke: "#374151", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) })
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "py-2 flex-1 overflow-y-auto overscroll-contain", children: navLinks.map((link) => /* @__PURE__ */ jsx(
          Link,
          {
            href: getNavUrl(link),
            className: "block px-6 py-3 text-gray-900 hover:bg-blue-50 hover:text-blue-600 transition-colors font-work-sans border-b border-gray-50 last:border-b-0",
            style: { fontSize: "16px", fontWeight: "500" },
            onClick: () => setMobileMenuOpen(false),
            children: link.text
          },
          link.id
        )) }),
        /* @__PURE__ */ jsx("div", { className: "px-6 py-4 border-t border-gray-100 bg-gray-50 flex-shrink-0", children: auth?.user ? /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 pb-3 border-b border-gray-200", children: [
            auth.user.avatar ? /* @__PURE__ */ jsx(
              "img",
              {
                src: auth.user.avatar,
                alt: auth.user.name,
                className: "w-10 h-10 rounded-full object-cover"
              }
            ) : /* @__PURE__ */ jsx(
              "div",
              {
                className: "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                style: { backgroundColor: buttonPrimaryBg, color: buttonPrimaryText },
                children: auth.user.name?.charAt(0).toUpperCase() || "U"
              }
            ),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "font-work-sans font-semibold text-gray-900", children: auth.user.name || "User" }),
              /* @__PURE__ */ jsx("div", { className: "font-work-sans text-sm text-gray-500", children: auth.user.email })
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            Link,
            {
              href: buildUrl("/user/dashboard"),
              className: "block w-full px-4 py-3 rounded-lg hover:opacity-90 transition-colors font-work-sans text-center",
              style: { fontSize: "16px", fontWeight: "600", backgroundColor: buttonPrimaryBg, color: buttonPrimaryText },
              onClick: () => setMobileMenuOpen(false),
              children: "Dashboard"
            }
          ),
          /* @__PURE__ */ jsxs(
            Link,
            {
              href: buildUrl("/user/favourites"),
              className: "flex items-center justify-center gap-2 w-full border border-red-500 text-red-600 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors font-work-sans",
              style: { fontSize: "16px", fontWeight: "600" },
              onClick: () => setMobileMenuOpen(false),
              children: [
                /* @__PURE__ */ jsx(Heart, { className: "w-4 h-4", filled: true }),
                "My Favourites"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            Link,
            {
              href: buildUrl("/profile"),
              className: "flex items-center justify-center gap-2 w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors font-work-sans",
              style: { fontSize: "16px", fontWeight: "600" },
              onClick: () => setMobileMenuOpen(false),
              children: [
                /* @__PURE__ */ jsxs("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [
                  /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" }),
                  /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" })
                ] }),
                "Profile Settings"
              ]
            }
          )
        ] }) : /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              setMobileMenuOpen(false);
              setLoginModalOpen(true);
            },
            className: "block w-full px-4 py-3 rounded-lg hover:opacity-90 transition-colors font-work-sans text-center",
            style: { fontSize: "16px", fontWeight: "600", backgroundColor: buttonPrimaryBg, color: buttonPrimaryText },
            children: "Log In"
          }
        ) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(
      LoginModal,
      {
        isOpen: loginModalOpen,
        onClose: () => setLoginModalOpen(false),
        website
      }
    )
  ] });
}
export {
  Navbar as default
};
