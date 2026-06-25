import { jsxs, jsx } from "react/jsx-runtime";
import "react";
import { Head } from "@inertiajs/react";
import MainLayout from "./MainLayout-DZ-6ZPt1.js";
import PriceHistory from "./PriceHistory-buOHFSI4.js";
import PriceHistorySearchInput from "./PriceHistorySearchInput-BEEykS6N.js";
import "./Footer-BjazYOa4.js";
import "./ContactAgentModal-Bc8CTpfm.js";
import "./Navbar-DVqP4Fqr.js";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import "./LoginModal-C-0W-anf.js";
import "./GoogleLoginButton-wrwag0eM.js";
import "./PropertyDetailIcons-3huqvWqW.js";
import "@headlessui/react";
function PropertyPriceHistory({
  auth,
  siteName,
  siteUrl,
  year,
  property,
  priceHistory = [],
  website
}) {
  const subtitleAddress = (() => {
    const unit = property?.unitNumber || "";
    const street = [property?.streetNumber, property?.streetName, property?.streetSuffix].filter(Boolean).join(" ");
    const composed = unit ? `${unit} - ${street}` : street;
    return composed || property?.address || "";
  })();
  const prefillQuery = (() => {
    const street = [property?.streetNumber, property?.streetName, property?.streetSuffix].filter(Boolean).join(" ");
    return street || property?.address || "";
  })();
  const propertyData = {
    listingKey: property?.listingKey,
    UnitNumber: property?.unitNumber,
    StreetNumber: property?.streetNumber,
    StreetName: property?.streetName,
    StreetSuffix: property?.streetSuffix,
    address: property?.address,
    priceHistory
  };
  return /* @__PURE__ */ jsxs(
    MainLayout,
    {
      siteName,
      siteUrl,
      year,
      website,
      auth,
      blueHeader: true,
      noPadding: true,
      children: [
        /* @__PURE__ */ jsx(Head, { title: `Price History — ${subtitleAddress || "Listing"}` }),
        /* @__PURE__ */ jsx("div", { className: "bg-white min-h-screen", children: /* @__PURE__ */ jsxs("div", { className: "max-w-[1280px] mx-auto px-4 py-8", children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl md:text-3xl font-bold text-[#293056] font-space-grotesk mb-1", children: "Listing History" }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-600 mb-6", children: [
            "Full price history for ",
            subtitleAddress || "this listing"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mb-8", children: /* @__PURE__ */ jsx(PriceHistorySearchInput, { initialQuery: prefillQuery }) }),
          /* @__PURE__ */ jsx(
            PriceHistory,
            {
              propertyData,
              propertyImages: property?.images || (property?.imageUrl ? [property.imageUrl] : []),
              showAll: true
            }
          )
        ] }) })
      ]
    }
  );
}
export {
  PropertyPriceHistory as default
};
