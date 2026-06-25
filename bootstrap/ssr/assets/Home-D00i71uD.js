import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, Head } from "@inertiajs/react";
import { useState, useEffect } from "react";
import axios from "axios";
import MainLayout from "./MainLayout-DZ-6ZPt1.js";
import HomeHeader from "./HomeHeader-zGRsWRD4.js";
import HeroSection from "./HeroSection-C5uMv04F.js";
import MarketSnapshot from "./MarketSnapshot-Bu1CZZ5j.js";
import ListingCarousel from "./ListingCarousel-BS_dOQ1e.js";
import BuildingInfo from "./BuildingInfo-CjaUYz4P.js";
import UnitTypesTable from "./UnitTypesTable-BwH9Y74f.js";
import AmenitiesSection from "./AmenitiesSection-CLlDw1vA.js";
import LocationSection from "./LocationSection-DYly92Rt.js";
import OwnershipCosts from "./OwnershipCosts-C0xFxvm0.js";
import HistoryTimeline from "./HistoryTimeline-CV9hjCgc.js";
import FAQSection from "./FAQSection-DfDIyzlY.js";
import ContactSection from "./ContactSection-DWefXUTZ.js";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import ViewingRequestModal from "./ViewingRequestModal-Dmz9BeSZ.js";
import { p as priceStats, n as normalizeListing } from "./iceData-C26SR6UI.js";
import "./Footer-BjazYOa4.js";
import "./ContactAgentModal-Bc8CTpfm.js";
import "./Navbar-DVqP4Fqr.js";
import "./LoginModal-C-0W-anf.js";
import "./GoogleLoginButton-wrwag0eM.js";
import "./PropertyDetailIcons-3huqvWqW.js";
import "@headlessui/react";
function Home({ auth, laravelVersion, phpVersion, website, siteName, siteUrl, year, pageContent, availableIcons, buildingData, ...props }) {
  const building = buildingData || {};
  const { globalWebsite } = usePage().props;
  const pageTitle = globalWebsite?.meta_title || `${siteName} - Luxury Condominiums at Nobu Residences`;
  const [viewingModal, setViewingModal] = useState({ isOpen: false, property: null });
  const [forSale, setForSale] = useState([]);
  const [forRent, setForRent] = useState([]);
  const [listingsLoaded, setListingsLoaded] = useState(false);
  useEffect(() => {
    window.openViewingModal = (property) => {
      setViewingModal({ isOpen: true, property });
    };
    return () => {
      delete window.openViewingModal;
    };
  }, []);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [saleRes, rentRes] = await Promise.all([
          axios.get("/api/homepage-properties", { params: { type: "sale" } }),
          axios.get("/api/homepage-properties", { params: { type: "rent" } })
        ]);
        if (cancelled) return;
        const saleRaw = saleRes?.data?.success ? saleRes.data.data.forSale || [] : [];
        const rentRaw = rentRes?.data?.success ? rentRes.data.data.forRent || [] : [];
        setForSale(saleRaw.map((p) => normalizeListing(p, { isRental: false })).filter(Boolean));
        setForRent(rentRaw.map((p) => normalizeListing(p, { isRental: true })).filter(Boolean));
        setListingsLoaded(true);
      } catch (error) {
        console.error("Error fetching homepage listings:", error);
        if (!cancelled) setListingsLoaded(true);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);
  const handleCloseViewingModal = () => setViewingModal({ isOpen: false, property: null });
  const startingFromPrice = priceStats(forSale).min;
  return /* @__PURE__ */ jsxs(MainLayout, { siteName, siteUrl, year, website, pageContent, auth, hideHeader: true, children: [
    /* @__PURE__ */ jsx(Head, { title: pageTitle }),
    /* @__PURE__ */ jsxs("div", { className: "overflow-x-hidden bg-neutral-950", children: [
      /* @__PURE__ */ jsx(HomeHeader, { auth, website }),
      /* @__PURE__ */ jsx(
        HeroSection,
        {
          auth,
          siteName,
          website,
          pageContent,
          building,
          startingFromPrice,
          forSaleCount: forSale.length,
          forRentCount: forRent.length,
          countsReady: listingsLoaded
        }
      ),
      /* @__PURE__ */ jsx(MarketSnapshot, { forSale, forRent, building }),
      /* @__PURE__ */ jsx(
        ListingCarousel,
        {
          id: "for-sale",
          eyebrow: "Available Now",
          title: `For Sale at ${building.name || siteName || "Nobu Residences"}`,
          listings: forSale,
          viewMoreHref: "/search",
          auth,
          building: buildingData
        }
      ),
      /* @__PURE__ */ jsx(
        ListingCarousel,
        {
          id: "for-rent",
          eyebrow: "Available Now",
          title: `For Rent at ${building.name || siteName || "Nobu Residences"}`,
          listings: forRent,
          viewMoreHref: "/search",
          auth,
          building: buildingData
        }
      ),
      /* @__PURE__ */ jsx(BuildingInfo, { pageContent, building }),
      /* @__PURE__ */ jsx(UnitTypesTable, { forSale, forRent, building }),
      /* @__PURE__ */ jsx(AmenitiesSection, { pageContent, availableIcons, building }),
      /* @__PURE__ */ jsx(LocationSection, { pageContent, building }),
      /* @__PURE__ */ jsx(OwnershipCosts, { building }),
      /* @__PURE__ */ jsx(HistoryTimeline, { pageContent, building }),
      /* @__PURE__ */ jsx(FAQSection, { website, pageContent, building }),
      /* @__PURE__ */ jsx(ContactSection, { website, pageContent, building })
    ] }),
    /* @__PURE__ */ jsx(
      ViewingRequestModal,
      {
        isOpen: viewingModal.isOpen,
        onClose: handleCloseViewingModal,
        property: viewingModal.property
      }
    )
  ] });
}
export {
  Home as default
};
