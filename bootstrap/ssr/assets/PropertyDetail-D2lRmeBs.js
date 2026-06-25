import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { usePage, Head } from "@inertiajs/react";
import MainLayout from "./MainLayout-BFh5qQm3.js";
import { f as formatCardAddress, a as formatArea } from "./propertyFormatters-B0QibXFa.js";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import ViewingRequestModal from "./ViewingRequestModal-Dmz9BeSZ.js";
import LoginModal from "./LoginModal-C-0W-anf.js";
import PropertyHeader from "./PropertyHeader-C_YVi2W-.js";
import PropertyGallery from "./PropertyGallery-hDGsoYFl.js";
import MobileBottomBar from "./MobileBottomBar-CJ5wHqSd.js";
import PropertySections from "./PropertySections-B9T-H1z8.js";
import "./Dropdown-CDFef2yc.js";
import "./TextInput-BjeU_XkG.js";
import TourSchedulingComponent from "./TourScheduling-UY9B6IS4.js";
import MarketSentiment from "./MarketSentiment-BaRYsnC0.js";
import RealEstateLinksSection from "./RealEstateLinksSection-rgnwZUht.js";
import "./Footer-BjazYOa4.js";
import "./ContactAgentModal-Bc8CTpfm.js";
import "./Navbar-BOM1Kycz.js";
import "./PropertyDetailIcons-3huqvWqW.js";
import "@headlessui/react";
import "./GoogleLoginButton-wrwag0eM.js";
import "./PropertyEnquiryModal-CGQPgsDx.js";
import "./PropertyCarousel-xQqZk_Vh.js";
import "./PropertyCard-BWgqbSLf.js";
import "axios";
import "./FAQ-DwtK7V0z.js";
import "./MoreBuildings-Bos5U-wr.js";
import "./PropertyCardV5-CEcGAClp.js";
import "./propertyUrl-B4IVbEgn.js";
import "./slug-BdTdDGUL.js";
import "./ComparableSales-Lf3jIiXM.js";
import "./PriceHistory-buOHFSI4.js";
import "./MerchandiseLofts-DFD0Il40.js";
import "./PropertyDetailsSections-BrQfNakg.js";
import "./MortgageCalculator-Oo7_FBQb.js";
import "./NearbySchools-B1yt2xDw.js";
import "./Amenities-D8UjScBp.js";
import "./MarketData-BYVe1y79.js";
function PropertyDetail({ auth, siteName, siteUrl, year, listingKey, propertyData: initialPropertyData, propertyImages: initialImages, website, buildingData: initialBuildingData, aiDescription: initialAiDescription }) {
  const { globalWebsite } = usePage().props;
  const effectiveWebsite = website || globalWebsite;
  const brandColors = effectiveWebsite?.brand_colors || {
    button_primary_bg: "#293056",
    button_primary_text: "#FFFFFF"
  };
  const buttonPrimaryBg = brandColors.button_primary_bg || "#293056";
  const buttonPrimaryText = brandColors.button_primary_text || "#FFFFFF";
  const [propertyData, setPropertyData] = useState(initialPropertyData);
  const [buildingData, setBuildingData] = useState(initialBuildingData);
  const [aiDescription, setAiDescription] = useState(initialAiDescription);
  const [propertyImages, setPropertyImages] = useState(() => {
    if (initialImages && Array.isArray(initialImages) && initialImages.length > 0) {
      return initialImages;
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(!initialPropertyData);
  const [viewingModal, setViewingModal] = useState({
    isOpen: false,
    property: null
  });
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginInitialTab, setLoginInitialTab] = useState("login");
  const openLoginModal = (tab = "login") => {
    setLoginInitialTab(tab);
    setLoginModalOpen(true);
  };
  useEffect(() => {
    console.log("🤖 === AI Description from Backend ===");
    console.log("🤖 Initial AI description:", initialAiDescription);
    if (initialAiDescription) {
      console.log("✅ 🤖 AI description received from backend!", {
        hasOverview: !!initialAiDescription.overview,
        hasDetailed: !!initialAiDescription.detailed,
        generatedAt: initialAiDescription.generated_at,
        exists: initialAiDescription.exists
      });
    } else {
      console.log("ℹ️ 🤖 No AI description from backend - will generate on frontend");
    }
    window.openViewingModal = (property) => {
      setViewingModal({
        isOpen: true,
        property
      });
    };
    return () => {
      delete window.openViewingModal;
    };
  }, [initialBuildingData, buildingData, initialPropertyData]);
  const handleCloseViewingModal = () => {
    setViewingModal({
      isOpen: false,
      property: null
    });
  };
  useEffect(() => {
    if (listingKey && !initialPropertyData) {
      fetchPropertyData();
    }
  }, [listingKey]);
  const fetchPropertyData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/property-detail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: JSON.stringify({ listingKey })
      });
      if (response.ok) {
        const data = await response.json();
        const formattedData = formatPropertyDataForDisplay(data.property);
        setPropertyData(formattedData);
        if (data.buildingData) {
          setBuildingData(data.buildingData);
        }
        if (data.images && data.images.length > 0) {
          const imageUrls = data.images.map((img) => {
            const url = img.url || img.MediaURL || img.URL || img;
            return url;
          });
          setPropertyImages(imageUrls);
        } else if (data.property && data.property.Images) {
          const imageUrls = data.property.Images.map((img) => img.MediaURL || img.URL || img.url || img);
          setPropertyImages(imageUrls);
        }
      } else {
        setPropertyData(getSamplePropertyData());
      }
    } catch (error) {
      setPropertyData(getSamplePropertyData());
    } finally {
      setIsLoading(false);
    }
  };
  const formatPropertyDataForDisplay = (property) => {
    const formatPrice = (price) => {
      if (!price) return "";
      return new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: "CAD",
        maximumFractionDigits: 0
      }).format(price);
    };
    const unitNumber = property.unitNumber || property.UnitNumber || property.ApartmentNumber || property.LegalApartmentNumber;
    const streetNumber = property.streetNumber || property.StreetNumber;
    const streetName = property.streetName || property.StreetName;
    const streetSuffix = property.streetSuffix || property.StreetSuffix || "";
    const city = property.city || property.City;
    const province = property.province || property.StateOrProvince;
    const propertySubType = property.propertySubType || property.PropertySubType;
    const propertyType = property.propertyType || property.PropertyType;
    const bedroomsTotal = property.bedroomsTotal || property.BedroomsTotal || 0;
    const bathroomsTotal = property.bathroomsTotal || property.BathroomsTotalInteger || 0;
    const livingArea = property.livingArea || property.LivingAreaRange;
    const parkingTotal = property.parkingTotal || property.ParkingTotal || 0;
    const garageSpaces = property.garageSpaces || property.GarageSpaces || 0;
    const associationFee = property.associationFee || property.AssociationFee;
    const taxAnnualAmount = property.taxAnnualAmount || property.TaxAnnualAmount;
    const yearBuilt = property.yearBuilt || property.YearBuilt;
    const listPrice = property.listPrice || property.ListPrice;
    const closePrice = property.closePrice || property.ClosePrice;
    const publicRemarks = property.publicRemarks || property.PublicRemarks;
    const standardStatus = property.standardStatus || property.StandardStatus;
    const mlsStatus = property.mlsStatus || property.MlsStatus;
    const listingId = property.listingId || property.ListingId || property.ListingKey;
    const listOfficeName = property.listOfficeName || property.ListOfficeName;
    const listAgentFullName = property.listAgentFullName || property.ListAgentFullName;
    const virtualTourURLUnbranded = property.virtualTourURLUnbranded || property.VirtualTourURLUnbranded;
    const exposure = property.exposure || property.Exposure;
    const locker = property.locker || property.Locker;
    const crossStreet = property.crossStreet || property.CrossStreet;
    const formattedAddress = formatCardAddress(property);
    const formattedArea = formatArea(property);
    return {
      // Raw fields for formatCardAddress function
      UnitNumber: unitNumber,
      unitNumber,
      StreetNumber: streetNumber,
      streetNumber,
      StreetName: streetName,
      streetName,
      StreetSuffix: streetSuffix,
      streetSuffix,
      // Formatted fields
      address: formattedAddress,
      subtitle: `${propertySubType || propertyType} in ${city}, ${province}`,
      soldFor: closePrice ? formatPrice(closePrice) : null,
      listedFor: listPrice ? `Listed for ${formatPrice(listPrice)}` : null,
      listPrice,
      mlsNumber: listingId,
      details: {
        type: propertySubType || propertyType || "Residential",
        beds: `${bedroomsTotal}${property.BedroomsBelowGrade || property.bedroomsBelowGrade ? "+1" : ""}`,
        bathrooms: bathroomsTotal,
        area: formattedArea || "N/A",
        parking: parkingTotal,
        garageSpaces,
        maintenanceFees: associationFee ? formatPrice(associationFee) : "N/A",
        propertyTaxes: taxAnnualAmount ? formatPrice(taxAnnualAmount) : "N/A",
        yearBuilt: yearBuilt || "New",
        exposure: exposure || "N/A",
        locker: locker || "N/A",
        crossStreet: crossStreet || "N/A",
        status: standardStatus || mlsStatus || "Active"
      },
      description: publicRemarks || "",
      publicRemarks: publicRemarks || "",
      PublicRemarks: publicRemarks || "",
      // Keep raw property fields for child components
      ListPrice: listPrice,
      BedroomsTotal: bedroomsTotal,
      BathroomsTotalInteger: bathroomsTotal,
      bathroomsTotal,
      bedroomsTotal,
      PropertySubType: propertySubType,
      propertySubType,
      propertyType,
      LivingArea: livingArea,
      livingArea,
      LivingAreaRange: livingArea,
      City: city,
      city,
      Exposure: exposure,
      exposure,
      // Date/time fields for days on market calculation
      DaysOnMarket: property.daysOnMarket || property.DaysOnMarket || null,
      daysOnMarket: property.daysOnMarket || property.DaysOnMarket || null,
      ListingContractDate: property.listingContractDate || property.ListingContractDate || property.listDate || property.listingDate || null,
      listingContractDate: property.listingContractDate || property.ListingContractDate || property.listDate || property.listingDate || null,
      StandardStatus: property.standardStatus || property.StandardStatus || property.status || "Active",
      MlsStatus: property.mlsStatus || property.MlsStatus || "",
      TransactionType: property.transactionType || property.TransactionType || "For Sale",
      features: [
        ...property.features || property.Features || [],
        ...property.appliances || property.Appliances || [],
        ...property.interiorFeatures || property.InteriorFeatures || [],
        ...property.exteriorFeatures || property.ExteriorFeatures || []
      ],
      heating: property.heating || property.Heating || property.HeatType ? [property.HeatType] : [],
      cooling: property.cooling || property.Cooling || [],
      flooring: property.flooring || property.Flooring || [],
      parkingFeatures: property.parkingFeatures || property.ParkingFeatures || [],
      latitude: property.latitude || property.Latitude,
      longitude: property.longitude || property.Longitude,
      virtualTourUrl: virtualTourURLUnbranded || "",
      listOfficeName: listOfficeName || "",
      listAgentName: listAgentFullName || "",
      listAgentPhone: property.listAgentDirectPhone || property.ListAgentDirectPhone || "",
      listAgentEmail: property.listAgentEmail || property.ListAgentEmail || "",
      // Set images - keep as simple URL array for PropertyGallery component
      Images: propertyImages || [],
      ImageObjects: propertyImages ? propertyImages.map((img) => typeof img === "string" ? { MediaURL: img } : img) : [],
      Rooms: property.rooms || property.Rooms || [],
      // Location + raw Repliers sub-objects for breadcrumb + detail cards
      neighborhood: property.neighborhood || property.Neighborhood || "",
      area: property.area || property.Area || "",
      repliers: property.repliers || null
    };
  };
  const getSamplePropertyData = () => ({
    address: "Loading...",
    subtitle: "Loading property details...",
    soldFor: null,
    listedFor: null,
    Images: [],
    details: {
      type: "Loading...",
      beds: "0",
      bathrooms: "0",
      area: "N/A",
      parking: "0",
      maintenanceFees: "N/A",
      propertyTaxes: "N/A",
      exposure: "N/A"
    },
    Rooms: []
  });
  const displayData = {
    ...propertyData || getSamplePropertyData(),
    building: buildingData
    // Include building data for PropertyHeader location breadcrumb
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxs(MainLayout, { siteName, siteUrl, year, auth, website, blueHeader: true, children: [
      /* @__PURE__ */ jsx(Head, { title: `Loading Property... - ${siteName}` }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-[60vh]", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "inline-block w-16 h-16 border-4 border-[#293056] border-t-transparent rounded-full animate-spin mb-4" }),
        /* @__PURE__ */ jsx("div", { className: "text-[#293056] text-xl font-medium", children: "Loading property details..." })
      ] }) })
    ] });
  }
  return /* @__PURE__ */ jsxs(MainLayout, { siteName, siteUrl, year, auth, website, blueHeader: true, children: [
    /* @__PURE__ */ jsx(Head, { title: `${displayData.address} - Property Details - ${siteName}` }),
    /* @__PURE__ */ jsx("div", { className: "idx mx-auto overflow-hidden bg-primary pb-24 md:pb-0", children: /* @__PURE__ */ jsxs("div", { className: "px-4 md:px-0 max-w-[1280px] mx-auto pt-8 md:pt-12", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-5", children: /* @__PURE__ */ jsx(
        PropertyHeader,
        {
          data: displayData,
          auth,
          type: "property",
          buildingData
        }
      ) }),
      /* @__PURE__ */ jsx("div", { className: "mb-7", children: /* @__PURE__ */ jsx(
        PropertyGallery,
        {
          propertyImages,
          propertyData: displayData,
          auth,
          onLoginClick: () => openLoginModal("login")
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "flex md:flex-row sm:flex-col flex-col gap-6 w-full", children: [
        /* @__PURE__ */ jsx("div", { className: "md:w-[950px]", children: /* @__PURE__ */ jsx(
          PropertySections,
          {
            propertyData: displayData,
            propertyImages,
            auth,
            website,
            buildingData,
            aiDescription,
            onLoginClick: () => openLoginModal("login"),
            onSignupClick: () => openLoginModal("register")
          }
        ) }),
        /* @__PURE__ */ jsx("div", { className: "max-w-[309px] md:flex hidden w-full", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6 w-full", children: [
          !auth?.user && /* @__PURE__ */ jsx("div", { className: "bg-white border border-gray-200 rounded-xl p-6 shadow-sm", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-[#293056] mb-2 font-space-grotesk", children: "Get More Details" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-sm mb-4", children: "Create a free account to save properties and get exclusive access to property details" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => openLoginModal("login"),
                className: "w-full py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-all",
                style: { backgroundColor: buttonPrimaryBg, color: buttonPrimaryText },
                children: "Sign Up / Log In"
              }
            )
          ] }) }),
          /* @__PURE__ */ jsx(MarketSentiment, { propertyData: displayData, buildingData }),
          /* @__PURE__ */ jsx(TourSchedulingComponent, { website, propertyData: displayData })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "description", children: /* @__PURE__ */ jsx(RealEstateLinksSection, { propertyData: displayData }) })
    ] }) }),
    /* @__PURE__ */ jsx(MobileBottomBar, {}),
    /* @__PURE__ */ jsx(
      ViewingRequestModal,
      {
        isOpen: viewingModal.isOpen,
        onClose: handleCloseViewingModal,
        property: viewingModal.property
      }
    ),
    /* @__PURE__ */ jsx(
      LoginModal,
      {
        isOpen: loginModalOpen,
        onClose: () => setLoginModalOpen(false),
        initialTab: loginInitialTab
      }
    )
  ] });
}
export {
  PropertyDetail as default
};
