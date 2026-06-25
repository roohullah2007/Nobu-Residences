import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState } from "react";
const PriceHistory = ({
  propertyData = null,
  propertyImages = null,
  showAll = false,
  building = null,
  // `auth` and `onLoginClick` are accepted for backwards-compatibility with
  // existing callers but are no longer used internally.
  auth: _auth = null,
  onLoginClick: _onLoginClick = null
}) => {
  const [expanded, setExpanded] = useState(false);
  const pickFromImageList = (list) => {
    if (!Array.isArray(list) || list.length === 0) return null;
    const first = list[0];
    if (typeof first === "string") return first;
    if (first?.MediaURL) return first.MediaURL;
    if (first?.url) return first.url;
    return null;
  };
  const getPropertyImage = () => {
    return pickFromImageList(propertyImages) || pickFromImageList(propertyData?.Images) || pickFromImageList(propertyData?.ImageObjects) || pickFromImageList(propertyData?.images) || propertyData?.MediaURL || propertyData?.imageUrl || propertyData?.image || null;
  };
  const propertyImage = getPropertyImage();
  const rawHistory = propertyData?.priceHistory || propertyData?.PriceHistory || propertyData?.history || [];
  const history = (Array.isArray(rawHistory) ? rawHistory : []).map((h) => ({
    mlsNumber: h.mlsNumber || h.MlsNumber || h.listingKey || "",
    listPrice: parseFloat(h.listPrice || h.ListPrice || 0) || 0,
    listDate: h.listDate || h.ListDate || h.listingContractDate || null,
    soldPrice: parseFloat(h.soldPrice || h.SoldPrice || h.closePrice || 0) || 0,
    soldDate: h.soldDate || h.SoldDate || h.closeDate || null,
    lastStatus: h.lastStatus || h.LastStatus || h.status || "",
    daysOnMarket: parseInt(h.daysOnMarket || h.DaysOnMarket || h.simpleDaysOnMarket || 0, 10) || null,
    type: h.type || h.Type || "",
    // Per-entry address + image — present in building-level history
    // (each entry is a different unit in the building).
    address: h.address || null,
    unitNumber: h.unitNumber || null,
    image: h.image || null
  })).filter((h) => h.listDate || h.soldDate || h.listPrice || h.soldPrice);
  history.sort((a, b) => {
    const da = new Date(a.soldDate || a.listDate || 0).getTime();
    const db = new Date(b.soldDate || b.listDate || 0).getTime();
    return db - da;
  });
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
    if (["sus", "suspended"].includes(code)) return { label: "Suspended", cls: "text-amber-600" };
    if (["pc", "price change"].includes(code)) return { label: "Price Change", cls: "text-blue-600" };
    if (["new", "a", "active"].includes(code)) return { label: "Listed", cls: "text-[#293056]" };
    return { label: s || "Listed", cls: "text-[#293056]" };
  };
  const PREVIEW_LIMIT = 5;
  const previewCount = showAll || expanded ? history.length : Math.min(history.length, PREVIEW_LIMIT);
  const visibleHistory = history.slice(0, previewCount);
  const subtitleAddress = (() => {
    const unit = propertyData?.UnitNumber || propertyData?.unitNumber || "";
    const sn = propertyData?.StreetNumber || propertyData?.streetNumber || "";
    const stName = propertyData?.StreetName || propertyData?.streetName || "";
    const stSuf = propertyData?.StreetSuffix || propertyData?.streetSuffix || "";
    const street = [sn, stName, stSuf].filter(Boolean).join(" ");
    return unit ? `${unit} - ${street}` : street || propertyData?.address || "";
  })();
  return /* @__PURE__ */ jsxs("div", { className: "w-full p-6 rounded-2xl border border-gray-200 shadow-sm bg-white max-w-[1280px] mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-5", children: [
      /* @__PURE__ */ jsx(
        "h2",
        {
          className: "text-[28px] font-bold mb-1 font-space-grotesk",
          style: { color: "#293056" },
          children: "Price History"
        }
      ),
      /* @__PURE__ */ jsxs("p", { className: "text-gray-500 text-sm", children: [
        "Discover the price history for ",
        subtitleAddress || "this listing"
      ] })
    ] }),
    history.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500 py-6 text-center bg-gray-50 rounded-xl", children: "No price history available for this listing." }) : /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3", children: [
      visibleHistory.map((entry, idx) => {
        const status = statusDisplay(entry.lastStatus);
        const wasSold = ["Sold", "Leased"].includes(status.label);
        const displayPrice = wasSold ? entry.soldPrice : entry.listPrice;
        const displayDate = entry.listDate || entry.soldDate;
        const eventDate = entry.soldDate || entry.listDate;
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex items-center gap-4 bg-[#F8F8F8] rounded-xl p-3 md:p-4",
            children: [
              /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: entry.image || propertyImage ? /* @__PURE__ */ jsx(
                "img",
                {
                  src: entry.image || propertyImage,
                  alt: "Property",
                  className: "w-[72px] h-[60px] md:w-[80px] md:h-[68px] object-cover rounded-lg",
                  onError: (e) => {
                    e.target.style.display = "none";
                  }
                }
              ) : /* @__PURE__ */ jsx("div", { className: "w-[72px] h-[60px] md:w-[80px] md:h-[68px] bg-gray-200 rounded-lg flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-gray-400 text-[10px] text-center px-1", children: "No image" }) }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col min-w-[110px]", children: [
                /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-[#293056]", children: formatDate(eventDate) || "—" }),
                /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 mt-0.5", children: relativeTime(eventDate) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col min-w-0", children: [
                /* @__PURE__ */ jsx("div", { className: `font-bold text-sm ${status.cls}`, children: status.label }),
                /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-600 mt-0.5", children: [
                  wasSold ? "Sold for " : "Listed for ",
                  /* @__PURE__ */ jsxs("span", { className: "font-semibold text-[#293056]", children: [
                    " ",
                    formatPrice(displayPrice) || "N/A"
                  ] }),
                  displayDate && /* @__PURE__ */ jsxs(Fragment, { children: [
                    " ",
                    "on",
                    " ",
                    /* @__PURE__ */ jsx("span", { children: formatDate(displayDate) })
                  ] })
                ] }),
                entry.address && /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 mt-0.5 truncate", children: entry.address })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "hidden md:flex items-center gap-4 flex-shrink-0", children: [
                /* @__PURE__ */ jsx("div", { className: "h-10 w-px bg-gray-300" }),
                /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-700 whitespace-nowrap", children: entry.daysOnMarket ? `${entry.daysOnMarket} days on market` : "Not Available" })
              ] })
            ]
          },
          `${entry.mlsNumber || "h"}-${idx}`
        );
      }),
      !showAll && (() => {
        const slugify = (s) => (s || "").toString().toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
        const looksLikeBuilding = !!propertyData?.slug && !!propertyData?.name && !propertyData?.listingKey && !propertyData?.ListingKey;
        const buildingSource = looksLikeBuilding ? propertyData : building;
        let href = null;
        if (buildingSource && (buildingSource.slug || buildingSource.name)) {
          const cityForUrl = buildingSource.city || "Toronto";
          const slugParts = [];
          if (buildingSource.name) slugParts.push(slugify(buildingSource.name));
          if (buildingSource.street_address_1) slugParts.push(slugify(buildingSource.street_address_1));
          if (buildingSource.street_address_2) slugParts.push(slugify(buildingSource.street_address_2));
          if (slugParts.length === 1 && buildingSource.address) {
            buildingSource.address.split(/\s*[,&]\s*/).filter(Boolean).forEach((p) => slugParts.push(slugify(p)));
          }
          href = `/${slugify(cityForUrl)}/${slugParts.filter(Boolean).join("-")}/price-history`;
        } else {
          const listingKey = propertyData?.listingKey || propertyData?.ListingKey || propertyData?.mlsNumber || propertyData?.MlsNumber || null;
          if (listingKey) {
            href = `/price-history/${listingKey}`;
          }
        }
        if (href) {
          return /* @__PURE__ */ jsx(
            "a",
            {
              href,
              className: "block w-full text-center border border-gray-200 text-[#263238] py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors mt-1",
              children: "View full price history"
            }
          );
        }
        return /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setExpanded((v) => !v),
            className: "w-full border border-gray-200 text-[#263238] py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors mt-1",
            children: expanded ? "Hide full listing history" : "View full listing history"
          }
        );
      })()
    ] })
  ] });
};
export {
  PriceHistory as default
};
