import { jsxs, jsx } from "react/jsx-runtime";
import React, { useState, useMemo } from "react";
import { Head, Link } from "@inertiajs/react";
import MainLayout from "./MainLayout-D9byyRJC.js";
import "./Footer-CZ46SECc.js";
import "./ContactAgentModal-Bc8CTpfm.js";
import "./imageUrl-B-Y_O6wE.js";
import "./Navbar-CZkePEXz.js";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import "./LoginModal-BIklH_00.js";
import "./GoogleLoginButton-wrwag0eM.js";
import "./PropertyDetailIcons-3huqvWqW.js";
import "@headlessui/react";
function BuildingPriceHistory({
  auth,
  siteName,
  siteUrl,
  year,
  building,
  priceHistory = [],
  website
}) {
  const [search, setSearch] = useState("");
  const [bedFilter, setBedFilter] = useState("all");
  const [statusTab, setStatusTab] = useState("all");
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;
  React.useEffect(() => {
    setPage(1);
  }, [search, bedFilter, statusTab]);
  const slugify = (s) => (s || "").toString().toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
  const citySlug = slugify(building?.city || "toronto");
  const buildingSlugParts = [slugify(building?.name || "")];
  if (building?.street_address_1) buildingSlugParts.push(slugify(building.street_address_1));
  if (building?.street_address_2) buildingSlugParts.push(slugify(building.street_address_2));
  const buildingHref = `/${citySlug}/${buildingSlugParts.filter(Boolean).join("-")}`;
  const displayName = (() => {
    const n = building?.name || "";
    const c = building?.city || "";
    if (c) return n.replace(new RegExp(`\\s+${c}$`, "i"), "").trim();
    return n;
  })();
  const fullAddress = (() => {
    const parts = [];
    if (building?.street_address_1) parts.push(building.street_address_1);
    if (building?.street_address_2) parts.push(building.street_address_2);
    const street = parts.length ? parts.join(" & ") : building?.address || "";
    return [street, building?.city, "ON"].filter(Boolean).join(", ");
  })();
  const formatDate = (d) => {
    if (!d) return "";
    const date = new Date(d);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric"
    });
  };
  const formatPrice = (n) => n ? `$${Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "";
  const relativeTime = (d) => {
    if (!d) return "";
    const then = new Date(d).getTime();
    if (isNaN(then)) return "";
    const days = Math.floor((Date.now() - then) / (1e3 * 60 * 60 * 24));
    if (days <= 0) return "today";
    if (days === 1) return "1 day ago";
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return months === 1 ? "1 month ago" : `${months} months ago`;
    const years = Math.floor(days / 365);
    return years === 1 ? "1 year ago" : `${years} years ago`;
  };
  const statusDisplay = (s) => {
    const code = (s || "").toString().toLowerCase();
    if (["sld", "sold"].includes(code)) return { label: "Sold", cls: "text-emerald-600" };
    if (["lsd", "leased"].includes(code)) return { label: "Leased", cls: "text-emerald-600" };
    if (["exp", "expired"].includes(code)) return { label: "Expired", cls: "text-rose-600" };
    if (["ter", "terminated"].includes(code)) return { label: "Terminated", cls: "text-rose-600" };
    if (["lc"].includes(code)) return { label: "Lease Cancelled", cls: "text-rose-600" };
    if (["sus", "suspended"].includes(code)) return { label: "Suspended", cls: "text-amber-600" };
    if (["pc", "price change"].includes(code)) return { label: "Price Change", cls: "text-blue-600" };
    return { label: s || "Listed", cls: "text-[#293056]" };
  };
  const filtered = useMemo(() => {
    return priceHistory.filter((h) => {
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = `${h.unitNumber || ""} ${h.address || ""} ${h.mlsNumber || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (bedFilter !== "all") {
        const beds = Number(h.bedrooms || h.numBedrooms || 0);
        if (bedFilter === "4+") {
          if (beds < 4) return false;
        } else if (Number(bedFilter) !== beds) {
          return false;
        }
      }
      if (statusTab !== "all") {
        const code = (h.lastStatus || "").toString().toLowerCase();
        if (statusTab === "sold" && !["sld", "sold"].includes(code)) return false;
        if (statusTab === "rented" && !["lsd", "leased", "lc"].includes(code)) return false;
      }
      return true;
    }).sort((a, b) => {
      const da = new Date(a.soldDate || a.listDate || 0).getTime();
      const db = new Date(b.soldDate || b.listDate || 0).getTime();
      return db - da;
    });
  }, [priceHistory, search, bedFilter, statusTab]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pagedEntries = useMemo(
    () => filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE),
    [filtered, safePage]
  );
  const grouped = useMemo(() => {
    const groups = /* @__PURE__ */ new Map();
    pagedEntries.forEach((h) => {
      const d = new Date(h.soldDate || h.listDate || 0);
      if (isNaN(d.getTime())) return;
      const key = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(h);
    });
    return Array.from(groups.entries());
  }, [pagedEntries]);
  const monthCounts = (entries) => {
    let listed = 0;
    let sold = 0;
    entries.forEach((h) => {
      const code = (h.lastStatus || "").toString().toLowerCase();
      if (["sld", "sold", "lsd", "leased"].includes(code)) sold++;
      else listed++;
    });
    return { listed, sold };
  };
  return /* @__PURE__ */ jsxs(MainLayout, { siteName, siteUrl, year, website, auth, blueHeader: true, noPadding: true, children: [
    /* @__PURE__ */ jsx(Head, { title: `Listing History — ${displayName || "Building"}` }),
    /* @__PURE__ */ jsx("div", { className: "bg-white min-h-screen", children: /* @__PURE__ */ jsxs("div", { className: "max-w-[1280px] mx-auto px-4 py-8", children: [
      /* @__PURE__ */ jsxs("h1", { className: "text-2xl md:text-3xl font-bold text-[#293056] font-space-grotesk mb-1", children: [
        /* @__PURE__ */ jsx(Link, { href: buildingHref, className: "text-[#293056] underline hover:opacity-80", children: displayName || "Building" }),
        " ",
        "Listing History"
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-600 mb-6", children: [
        "View previously sold or rented units at ",
        fullAddress,
        displayName ? ` (${displayName})` : ""
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-[#F5F5F5] p-4 rounded-2xl mb-6", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row gap-3 lg:items-center", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1 bg-white rounded-xl flex items-center gap-2 px-4 py-3 min-h-[48px]", children: [
          /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-[#293056] flex-shrink-0", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" }) }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: search,
              onChange: (e) => setSearch(e.target.value),
              placeholder: "Search unit, address, MLS…",
              className: "flex-1 border-0 outline-none focus:ring-0 focus:border-0 text-sm font-work-sans font-bold text-[#293056] bg-transparent placeholder:font-bold placeholder:text-[#293056]/60"
            }
          ),
          search && /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setSearch(""),
              className: "text-[#293056] hover:text-[#037888] text-lg leading-none px-1",
              "aria-label": "Clear search",
              children: "×"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "bg-white rounded-xl px-4 py-3 min-h-[48px] flex items-center min-w-[160px]", children: /* @__PURE__ */ jsxs(
          "select",
          {
            value: bedFilter,
            onChange: (e) => setBedFilter(e.target.value),
            className: "w-full bg-transparent border-none outline-none text-sm font-work-sans font-bold text-[#293056] appearance-none cursor-pointer pr-6",
            style: {
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23293056' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0 center",
              backgroundSize: "14px"
            },
            children: [
              /* @__PURE__ */ jsx("option", { value: "all", children: "Beds & Baths" }),
              /* @__PURE__ */ jsx("option", { value: "1", children: "1 bedroom" }),
              /* @__PURE__ */ jsx("option", { value: "2", children: "2 bedrooms" }),
              /* @__PURE__ */ jsx("option", { value: "3", children: "3 bedrooms" }),
              /* @__PURE__ */ jsx("option", { value: "4+", children: "4+ bedrooms" })
            ]
          }
        ) }),
        /* @__PURE__ */ jsx("div", { className: "bg-white rounded-xl p-1 flex gap-1 min-h-[48px] items-center", children: [
          { key: "sold", label: "Sold" },
          { key: "rented", label: "Rented" },
          { key: "all", label: "All" }
        ].map((tab) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setStatusTab(tab.key),
            className: `px-4 py-2 rounded-lg text-sm font-work-sans font-bold transition-colors ${statusTab === tab.key ? "bg-[#293056] text-white" : "text-[#293056] hover:bg-gray-100"}`,
            children: tab.label
          },
          tab.key
        )) })
      ] }) }),
      filtered.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-center text-gray-500 py-16 bg-gray-50 rounded-xl", children: "No matching history records found." }),
      filtered.length > 0 && /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-500 mb-3", children: [
        "Showing ",
        (safePage - 1) * PER_PAGE + 1,
        "–",
        Math.min(safePage * PER_PAGE, filtered.length),
        " of ",
        filtered.length
      ] }),
      grouped.map(([month, entries]) => {
        const { listed, sold } = monthCounts(entries);
        return /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-sm mb-2", children: [
            /* @__PURE__ */ jsx("span", { className: "font-bold text-[#293056]", children: month }),
            " ",
            /* @__PURE__ */ jsxs("span", { className: "text-gray-500", children: [
              "- ",
              listed,
              " Listed"
            ] }),
            " ",
            /* @__PURE__ */ jsx("span", { className: "text-gray-300", children: "|" }),
            " ",
            /* @__PURE__ */ jsxs("span", { className: "text-gray-500", children: [
              sold,
              " Sold"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-3", children: entries.map((entry, idx) => {
            const status = statusDisplay(entry.lastStatus);
            const wasSold = ["Sold", "Leased"].includes(status.label);
            const displayPrice = wasSold ? entry.soldPrice : entry.listPrice;
            const eventDate = entry.soldDate || entry.listDate;
            return /* @__PURE__ */ jsxs(
              "div",
              {
                className: "flex items-center gap-4 bg-[#F8F8F8] rounded-xl p-3 md:p-4",
                children: [
                  /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: entry.image ? /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: entry.image,
                      alt: entry.address || "Unit",
                      className: "w-[88px] h-[72px] object-cover rounded-lg",
                      onError: (e) => e.target.style.display = "none"
                    }
                  ) : /* @__PURE__ */ jsx("div", { className: "w-[88px] h-[72px] bg-gray-200 rounded-lg flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-gray-400 text-[10px] text-center px-1", children: "No image" }) }) }),
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-col min-w-[160px]", children: [
                    /* @__PURE__ */ jsx("div", { className: "text-sm font-bold text-[#293056]", children: entry.unitNumber ? `Unit ${entry.unitNumber}` : entry.address || "—" }),
                    /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 mt-0.5 flex items-center gap-2", children: [
                      entry.bedrooms != null && /* @__PURE__ */ jsxs("span", { children: [
                        entry.bedrooms,
                        entry.bedroomsPlus ? `+${entry.bedroomsPlus}` : "",
                        " beds"
                      ] }),
                      entry.bathrooms != null && /* @__PURE__ */ jsxs("span", { children: [
                        entry.bathrooms,
                        " bath"
                      ] })
                    ] }),
                    entry.sqft && /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 mt-0.5", children: [
                      entry.sqft,
                      " sqft"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-col min-w-[110px]", children: [
                    /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-[#293056]", children: formatDate(eventDate) || "—" }),
                    /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 mt-0.5", children: relativeTime(eventDate) })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col min-w-0", children: [
                    /* @__PURE__ */ jsx("div", { className: `font-bold text-sm ${status.cls}`, children: status.label }),
                    /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-600 mt-0.5 truncate", children: [
                      wasSold ? "Sold for " : "Listed for ",
                      /* @__PURE__ */ jsxs("span", { className: "font-semibold text-[#293056]", children: [
                        " ",
                        formatPrice(displayPrice) || "N/A"
                      ] }),
                      " ",
                      "on",
                      " ",
                      formatDate(entry.listDate || entry.soldDate)
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "hidden md:flex items-center gap-4 flex-shrink-0", children: [
                    /* @__PURE__ */ jsx("div", { className: "h-10 w-px bg-gray-300" }),
                    /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-700 whitespace-nowrap", children: entry.daysOnMarket ? `${entry.daysOnMarket} days on market` : "Not Available" })
                  ] })
                ]
              },
              `${entry.mlsNumber || "h"}-${idx}`
            );
          }) })
        ] }, month);
      }),
      totalPages > 1 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-1 mt-6", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setPage((p) => Math.max(1, p - 1)),
            disabled: safePage === 1,
            className: "px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-[#293056] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed",
            children: "Prev"
          }
        ),
        Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => {
          return p === 1 || p === totalPages || Math.abs(p - safePage) <= 2;
        }).reduce((acc, p, idx, arr) => {
          if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
          acc.push(p);
          return acc;
        }, []).map(
          (p, idx) => p === "…" ? /* @__PURE__ */ jsx("span", { className: "px-2 text-gray-400 text-sm", children: "…" }, `e${idx}`) : /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setPage(p),
              className: `min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium border ${p === safePage ? "bg-[#293056] text-white border-[#293056]" : "border-gray-300 text-[#293056] hover:bg-gray-50"}`,
              children: p
            },
            p
          )
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setPage((p) => Math.min(totalPages, p + 1)),
            disabled: safePage === totalPages,
            className: "px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-[#293056] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed",
            children: "Next"
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  BuildingPriceHistory as default
};
