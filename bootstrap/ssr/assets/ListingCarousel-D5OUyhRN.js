import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link } from "@inertiajs/react";
import { useRef, useEffect } from "react";
import { a as formatMoney, b as formatMaint } from "./iceData-C26SR6UI.js";
const CARD_GAP = 16;
function LockIcon({ className = "" }) {
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      className,
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true",
      children: [
        /* @__PURE__ */ jsx("rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2" }),
        /* @__PURE__ */ jsx("path", { d: "M7 11V7a5 5 0 0 1 10 0v4" })
      ]
    }
  );
}
function SparklesIcon({ className = "" }) {
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      className,
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true",
      children: [
        /* @__PURE__ */ jsx("path", { d: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" }),
        /* @__PURE__ */ jsx("path", { d: "M20 3v4" }),
        /* @__PURE__ */ jsx("path", { d: "M22 5h-4" }),
        /* @__PURE__ */ jsx("path", { d: "M4 17v2" }),
        /* @__PURE__ */ jsx("path", { d: "M5 18H3" })
      ]
    }
  );
}
function bedroomLabelFor(listing) {
  if (!listing.bedrooms || listing.bedrooms <= 0) return "Studio";
  return `${listing.bedrooms} BD${listing.den ? " + Den" : ""}`;
}
function RealListingCard({ listing }) {
  const isRental = !!listing.isRental;
  const price = formatMoney(listing.price);
  const maint = !isRental ? formatMaint(listing.maintenance) : "";
  return /* @__PURE__ */ jsx(
    Link,
    {
      href: listing.url,
      "data-card": true,
      className: "flex-shrink-0 w-[320px] sm:w-[360px] md:w-[380px] snap-start group",
      children: /* @__PURE__ */ jsxs("div", { className: "relative aspect-[3/4] overflow-hidden rounded-xl bg-neutral-200", children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: listing.imageUrl,
            alt: listing.addressLine,
            loading: "lazy",
            className: "w-full h-full object-cover transition-transform duration-700 group-hover:scale-105",
            onError: (e) => {
              e.currentTarget.src = "/images/no-image-placeholder.jpg";
            }
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" }),
        listing.buildingName && /* @__PURE__ */ jsx("span", { className: "absolute top-3 right-3 px-3 py-1.5 bg-black/40 backdrop-blur-sm text-white text-[10px] tracking-[0.1em] uppercase font-medium rounded-md", children: listing.buildingName }),
        /* @__PURE__ */ jsxs("div", { className: "absolute bottom-0 left-0 right-0 p-5", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-white/80 text-[13px] mb-1.5 line-clamp-1", children: [
            listing.addressLine,
            ", ",
            listing.city
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-white text-2xl font-bold mb-2", children: [
            price,
            isRental && /* @__PURE__ */ jsx("span", { className: "text-base font-normal text-white/60", children: "/MO" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-white/70 text-[12px] font-medium tracking-wide uppercase mb-3", children: [
            /* @__PURE__ */ jsx("span", { children: bedroomLabelFor(listing) }),
            /* @__PURE__ */ jsx("span", { className: "text-white/30", children: "|" }),
            /* @__PURE__ */ jsxs("span", { children: [
              listing.bathrooms,
              " BA"
            ] }),
            listing.sqft && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { className: "text-white/30", children: "|" }),
              /* @__PURE__ */ jsx("span", { children: listing.sqft })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-[11px] text-white/70 font-medium", children: [
              !isRental && maint && /* @__PURE__ */ jsxs("span", { children: [
                "Maint: ",
                maint
              ] }),
              listing.daysOnMarket != null && /* @__PURE__ */ jsxs("span", { children: [
                listing.daysOnMarket,
                "d on market"
              ] })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-[11px] text-white/40 font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity", children: "View Details" })
          ] }),
          listing.broker && /* @__PURE__ */ jsx("p", { className: "text-white/50 text-[10px] uppercase tracking-wider mt-2 line-clamp-1", children: listing.broker })
        ] })
      ] })
    }
  );
}
function LockedCard({ building, isRental }) {
  const image = building?.main_image || "/assets/nobu-building.jpg";
  const buildingName = building?.name || "Nobu Residences";
  return /* @__PURE__ */ jsx("div", { "data-card": true, className: "flex-shrink-0 w-[320px] sm:w-[360px] md:w-[380px] snap-start", children: /* @__PURE__ */ jsxs("div", { className: "relative aspect-[3/4] overflow-hidden rounded-xl bg-neutral-200 cursor-pointer group", children: [
    /* @__PURE__ */ jsx(
      "img",
      {
        src: image,
        alt: "Off-market listing",
        className: "w-full h-full object-cover blur-lg scale-110 brightness-50"
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 z-10", children: /* @__PURE__ */ jsxs("div", { className: "bg-gold-500 text-white px-4 py-2 text-[10px] tracking-[0.15em] uppercase font-bold rounded-bl-xl rounded-tr-xl flex items-center gap-1.5 shadow-lg", children: [
      /* @__PURE__ */ jsx(LockIcon, {}),
      "Off-Market"
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center z-10", children: [
      /* @__PURE__ */ jsx("div", { className: "w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsx(LockIcon, { className: "text-white/80" }) }),
      /* @__PURE__ */ jsx("h3", { className: "text-white text-lg font-semibold mb-1", children: "Off-Market Listing" }),
      /* @__PURE__ */ jsx("p", { className: "text-white/50 text-[13px] mb-4", children: "Register to view exclusive details" }),
      /* @__PURE__ */ jsxs(
        "a",
        {
          href: "/login",
          className: "inline-flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-white text-[11px] tracking-[0.15em] uppercase font-bold rounded-lg transition-colors shadow-lg shadow-gold-500/20",
          children: [
            /* @__PURE__ */ jsx(SparklesIcon, {}),
            "Register to View"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "absolute bottom-0 left-0 right-0 p-5 z-10", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-white/40 text-[13px] mb-1.5", children: [
        "Exclusive ",
        isRental ? "Rental" : "Sale",
        " · ",
        buildingName
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-white/50 text-xl font-bold mb-2 blur-[3px]", children: "$•••,•••" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-white/30 text-[12px] font-medium tracking-wide uppercase", children: [
        /* @__PURE__ */ jsx("span", { children: "1 BD + Den" }),
        /* @__PURE__ */ jsx("span", { className: "text-white/15", children: "|" }),
        /* @__PURE__ */ jsx("span", { children: "1 BA" })
      ] })
    ] })
  ] }) });
}
function ListingCarousel({
  id,
  eyebrow,
  title,
  listings = [],
  viewMoreHref = "/search",
  auth,
  building
}) {
  const scrollerRef = useRef(null);
  const pausedRef = useRef(false);
  const isLoggedIn = !!auth?.user;
  const isRentalSection = (title || "").includes("Rent");
  const items = [];
  listings.forEach((listing, i) => {
    items.push({ type: "real", listing, key: listing.listingKey || `real-${i}` });
    if (!isLoggedIn && (i + 1) % 4 === 0) {
      items.push({ type: "locked", key: `locked-${i}` });
    }
  });
  const scrollByCard = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const firstCard = el.querySelector("[data-card]");
    const step = firstCard ? firstCard.offsetWidth + CARD_GAP : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };
  const handleArrow = (dir) => {
    pausedRef.current = true;
    scrollByCard(dir);
  };
  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = scrollerRef.current;
    if (!el) return;
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const interval = setInterval(() => {
      const node = scrollerRef.current;
      if (!node || pausedRef.current) return;
      if (node.scrollWidth <= node.clientWidth + 8) return;
      const firstCard = node.querySelector("[data-card]");
      const step = firstCard ? firstCard.offsetWidth + CARD_GAP : node.clientWidth * 0.8;
      if (node.scrollLeft + node.clientWidth >= node.scrollWidth - 8) {
        node.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        node.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 4e3);
    return () => clearInterval(interval);
  }, [items.length]);
  if (!listings.length) return null;
  const subtitle = `${listings.length} units available · Live MLS® data`;
  return /* @__PURE__ */ jsxs("section", { id, className: "py-14 md:py-20 bg-white", children: [
    /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        eyebrow && /* @__PURE__ */ jsx("p", { className: "font-work-sans text-xs uppercase tracking-[0.3em] text-gold-500 mb-2", children: eyebrow }),
        /* @__PURE__ */ jsx("h2", { className: "font-playfair text-3xl md:text-4xl text-neutral-900", children: title }),
        /* @__PURE__ */ jsx("p", { className: "text-neutral-400 text-sm mt-1", children: subtitle })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "hidden md:flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => handleArrow(-1),
            "aria-label": "Scroll left",
            className: "w-11 h-11 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-400 hover:border-neutral-500 hover:text-neutral-800 transition-colors",
            children: /* @__PURE__ */ jsx("svg", { width: "20", height: "20", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", d: "M15 19l-7-7 7-7" }) })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => handleArrow(1),
            "aria-label": "Scroll right",
            className: "w-11 h-11 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-400 hover:border-neutral-500 hover:text-neutral-800 transition-colors",
            children: /* @__PURE__ */ jsx("svg", { width: "20", height: "20", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", d: "M9 5l7 7-7 7" }) })
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(
      "div",
      {
        ref: scrollerRef,
        className: "carousel-scroll scrollbar-hide flex gap-4 overflow-x-auto px-6 lg:px-10 pb-4 snap-x snap-mandatory",
        style: { scrollPaddingLeft: "1.5rem" },
        onMouseEnter: () => {
          pausedRef.current = true;
        },
        onMouseLeave: () => {
          pausedRef.current = false;
        },
        onFocusCapture: () => {
          pausedRef.current = true;
        },
        onBlurCapture: () => {
          pausedRef.current = false;
        },
        children: items.map((item) => item.type === "real" ? /* @__PURE__ */ jsx(RealListingCard, { listing: item.listing }, item.key) : /* @__PURE__ */ jsx(LockedCard, { building, isRental: isRentalSection }, item.key))
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto px-6 lg:px-10 mt-6 text-right", children: /* @__PURE__ */ jsxs(
      Link,
      {
        href: viewMoreHref,
        className: "inline-flex items-center gap-2 text-[14px] text-neutral-600 hover:text-neutral-900 font-medium",
        children: [
          "View More Properties",
          /* @__PURE__ */ jsx("svg", { width: "16", height: "16", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", d: "M9 5l7 7-7 7" }) })
        ]
      }
    ) })
  ] });
}
export {
  ListingCarousel as default
};
