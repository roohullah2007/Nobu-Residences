import { jsxs, jsx } from "react/jsx-runtime";
import { useEffect } from "react";
import PropertyCarousel from "./PropertyCarousel-xQqZk_Vh.js";
import "@inertiajs/react";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import FAQ from "./FAQ-DwtK7V0z.js";
import MoreBuildings from "./MoreBuildings-Bos5U-wr.js";
import ComparableSales from "./ComparableSales-Lf3jIiXM.js";
import PriceHistory from "./PriceHistory-buOHFSI4.js";
import MerchandiseLofts from "./MerchandiseLofts-DFD0Il40.js";
import PropertyDetailsSections from "./PropertyDetailsSections-BrQfNakg.js";
import MarketData from "./MarketData-BYVe1y79.js";
import "./PropertyCard-BWgqbSLf.js";
import "axios";
import "./PropertyCardV5-CEcGAClp.js";
import "./propertyUrl-B4IVbEgn.js";
import "./slug-BdTdDGUL.js";
import "./propertyFormatters-B0QibXFa.js";
import "./MortgageCalculator-Oo7_FBQb.js";
import "./NearbySchools-B1yt2xDw.js";
import "./Amenities-D8UjScBp.js";
function PropertySections({
  propertyData,
  propertyImages,
  auth,
  buildingData,
  aiDescription,
  onLoginClick,
  onSignupClick
}) {
  useEffect(() => {
    if (aiDescription) {
      if (aiDescription.overview || aiDescription.detailed) {
        console.log("✅ AI description displayed");
      }
      if (aiDescription.faqs && aiDescription.faqs.length > 0) {
        console.log(`✅ AI FAQs displayed (${aiDescription.faqs.length} questions)`);
      }
    }
  }, [aiDescription]);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col gap-4 font-work-sans overflow-x-hidden", children: [
    /* @__PURE__ */ jsx(PropertyDetailsSections, { property: propertyData, buildingData }),
    /* @__PURE__ */ jsx(
      PriceHistory,
      {
        propertyData,
        propertyImages,
        auth,
        building: buildingData,
        onLoginClick
      }
    ),
    /* @__PURE__ */ jsx(MarketData, { propertyData, buildingData, auth, onLoginClick }),
    /* @__PURE__ */ jsx(MerchandiseLofts, { propertyData }),
    propertyData.details?.type?.toLowerCase().includes("condo") && /* @__PURE__ */ jsx("section", { className: "py-4", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-[1280px]", children: /* @__PURE__ */ jsx(
      PropertyCarousel,
      {
        properties: propertyData.buildingCondoApartments || [
          // Sample condo apartments for demonstration
          {
            id: 1,
            listingKey: "C5234419",
            imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&auto=format&q=80",
            price: 65e4,
            propertyType: "Condo Apartment",
            transactionType: "For Sale",
            bedrooms: 2,
            bathrooms: 2,
            address: "Unit 1205, Same Building",
            isRental: false
          },
          {
            id: 2,
            listingKey: "C1209765",
            imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop&auto=format&q=80",
            price: 899e3,
            propertyType: "Condo Apartment",
            transactionType: "For Sale",
            bedrooms: 3,
            bathrooms: 2,
            address: "Unit 2104, Same Building",
            isRental: false
          }
        ],
        title: "Condo Apartments in This Building",
        type: "sale",
        viewAllLink: `/properties?propertyType=Condo+Apartment&buildingId=${propertyData.buildingId}`
      }
    ) }) }),
    /* @__PURE__ */ jsx(
      MoreBuildings,
      {
        title: propertyData.details?.type?.toLowerCase().includes("condo") ? "More Buildings By Agent" : "Nearby Listings",
        propertyData,
        onLoginRequired: onLoginClick,
        onSignupRequired: onSignupClick
      }
    ),
    /* @__PURE__ */ jsx(
      ComparableSales,
      {
        title: "Comparable Sales",
        propertyData,
        onLoginRequired: onLoginClick,
        onSignupRequired: onSignupClick
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "faq-section", children: /* @__PURE__ */ jsx(
      FAQ,
      {
        faqItems: aiDescription?.faqs ? aiDescription.faqs.map((faq, index) => ({
          id: faq.id || index + 1,
          question: faq.question,
          answer: faq.answer
        })) : null,
        isAiGenerated: !!aiDescription?.faqs && aiDescription.faqs.length > 0,
        isAdmin: auth?.user?.role === "admin"
      }
    ) })
  ] });
}
export {
  PropertySections as default
};
