import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { usePage, Head } from "@inertiajs/react";
import MainLayout from "./MainLayout-CuFObsz2.js";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import ViewingRequestModal from "./ViewingRequestModal-Dmz9BeSZ.js";
import LoginModal from "./LoginModal-C-0W-anf.js";
import PropertyHeader from "./PropertyHeader-C_YVi2W-.js";
import "./Navbar-Cpn1c-fk.js";
import MobileBottomBar from "./MobileBottomBar-CJ5wHqSd.js";
import BuildingTourScheduling from "./BuildingTourScheduling-CMp6BYuN.js";
import RealEstateLinksSection from "./RealEstateLinksSection-rgnwZUht.js";
import BuildingGallery from "./BuildingGallery-Bse3x4EW.js";
import BuildingSections from "./BuildingSections-Dk7lFVPE.js";
import "./Footer-BjazYOa4.js";
import "./ContactAgentModal-Bc8CTpfm.js";
import "./GoogleLoginButton-wrwag0eM.js";
import "./PropertyDetailIcons-3huqvWqW.js";
import "@headlessui/react";
import "./FAQ-DwtK7V0z.js";
import "./MoreBuildings-DDQaSb-Y.js";
import "./PropertyCardV5-CX7Swo2f.js";
import "./propertyUrl-B4IVbEgn.js";
import "./slug-BdTdDGUL.js";
import "./propertyFormatters-B0QibXFa.js";
import "./BuildingStatusTabs-D5QGwG0n.js";
import "./NearbySchools-B1yt2xDw.js";
import "./Amenities-D8UjScBp.js";
import "./MortgageCalculator-Oo7_FBQb.js";
import "./DeveloperBuildings-DMwmRO0O.js";
function BuildingDetail({ auth, siteName, siteUrl, year, buildingId, buildingData, website }) {
  const { globalWebsite } = usePage().props;
  const effectiveWebsite = website || globalWebsite;
  const brandColors = effectiveWebsite?.brand_colors || {
    button_primary_bg: "#293056",
    button_primary_text: "#FFFFFF"
  };
  const buttonPrimaryBg = brandColors.button_primary_bg || "#293056";
  const buttonPrimaryText = brandColors.button_primary_text || "#FFFFFF";
  const [isFavorited, setIsFavorited] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  console.log("[BuildingDetail] ========= BUILD v2 =========");
  console.log("[BuildingDetail] buildingId:", buildingId);
  console.log("[BuildingDetail] buildingData:", buildingData);
  console.log("[BuildingDetail] buildingData?.name:", buildingData?.name);
  console.log("[BuildingDetail] mls_properties_for_sale:", buildingData?.mls_properties_for_sale);
  console.log("[BuildingDetail] mls_properties_for_rent:", buildingData?.mls_properties_for_rent);
  console.log("[BuildingDetail] mls_properties_for_sale count:", buildingData?.mls_properties_for_sale?.length || 0);
  console.log("[BuildingDetail] mls_properties_for_rent count:", buildingData?.mls_properties_for_rent?.length || 0);
  console.log("[BuildingDetail] ========================================");
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
    window.openViewingModal = (property) => {
      setViewingModal({
        isOpen: true,
        property
      });
    };
    const handleScroll = () => {
      const faqSection = document.querySelector(".description");
      const footer = document.querySelector("footer");
      if (faqSection) {
        const faqRect = faqSection.getBoundingClientRect();
        const footerRect = footer?.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const faqInView = faqRect.top <= windowHeight * 0.8;
        const footerInView = footerRect && footerRect.top <= windowHeight;
        if (faqInView || footerInView) {
          setSidebarVisible(false);
        } else {
          setSidebarVisible(true);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      delete window.openViewingModal;
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  const handleCloseViewingModal = () => {
    setViewingModal({
      isOpen: false,
      property: null
    });
  };
  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };
  const sampleSaleProperties = [
    {
      id: 1,
      listingKey: "C5234419",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&auto=format&q=80",
      imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&auto=format&q=80",
      price: 65e4,
      propertyType: "Condo Apartment",
      transactionType: "For Sale",
      bedrooms: 2,
      bathrooms: 2,
      address: "Unit 1205, 8 Hillcrest Ave, North York, ON M2N 6Y6",
      isRental: false
    },
    {
      id: 2,
      listingKey: "C1209765",
      image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop&auto=format&q=80",
      imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop&auto=format&q=80",
      price: 899e3,
      propertyType: "Condo Apartment",
      transactionType: "For Sale",
      bedrooms: 3,
      bathrooms: 2,
      address: "Unit 2104, 8 Hillcrest Ave, North York, ON M2N 6Y6",
      isRental: false
    },
    {
      id: 3,
      listingKey: "C11947982",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&auto=format&q=80",
      imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&auto=format&q=80",
      price: 12e5,
      propertyType: "Condo Apartment",
      transactionType: "For Sale",
      bedrooms: 3,
      bathrooms: 3,
      address: "PH01, 8 Hillcrest Ave, North York, ON M2N 6Y6",
      isRental: false
    }
  ];
  const sampleRentProperties = [
    {
      id: 1,
      listingKey: "R11930665",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80",
      imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80",
      price: 2500,
      propertyType: "Condo Apartment",
      transactionType: "For Rent",
      bedrooms: 2,
      bathrooms: 1,
      address: "Unit 805, 8 Hillcrest Ave, North York, ON M2N 6Y6",
      isRental: true
    },
    {
      id: 2,
      listingKey: "R11884737",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&auto=format&q=80",
      imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&auto=format&q=80",
      price: 3200,
      propertyType: "Condo Apartment",
      transactionType: "For Rent",
      bedrooms: 2,
      bathrooms: 2,
      address: "Unit 1507, 8 Hillcrest Ave, North York, ON M2N 6Y6",
      isRental: true
    },
    {
      id: 3,
      listingKey: "R12009946",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80",
      imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80",
      price: 4500,
      propertyType: "Condo Apartment",
      transactionType: "For Rent",
      bedrooms: 3,
      bathrooms: 2,
      address: "Unit 2205, 8 Hillcrest Ave, North York, ON M2N 6Y6",
      isRental: true
    }
  ];
  const effectiveBuildingData = buildingData || {
    id: "sample-1",
    name: "8 Hillcrest Ave, North York (FALLBACK)",
    subtitle: "Modern downtown living",
    description: "Experience luxury living in the heart of downtown.",
    address: "8 Hillcrest Ave",
    city: "North York",
    province: "ON",
    building_type: "Residential",
    main_image: null,
    images: [],
    details: {
      type: "Residential Building",
      floors: "42",
      units: "387",
      yearBuilt: "2018",
      amenities: "Gym, Pool, Concierge",
      parking: "Underground",
      exposure: "All Directions"
    },
    Rooms: [
      {
        RoomType: "Lobby",
        RoomLength: "50.0",
        RoomWidth: "30.0",
        RoomLengthWidthUnits: "feet",
        RoomFeature1: "Marble Floors",
        RoomFeature2: "24/7 Concierge",
        RoomFeature3: "Modern Design"
      },
      {
        RoomType: "Amenity Floor",
        RoomLength: "40.0",
        RoomWidth: "25.0",
        RoomLengthWidthUnits: "feet",
        RoomFeature1: "Fitness Center",
        RoomFeature2: "Swimming Pool",
        RoomFeature3: "Lounge Area"
      }
    ]
  };
  console.log("[BuildingDetail] effectiveBuildingData:", effectiveBuildingData);
  console.log("[BuildingDetail] effectiveBuildingData.name:", effectiveBuildingData?.name);
  console.log("[BuildingDetail] effectiveBuildingData.mls_properties_for_sale:", effectiveBuildingData?.mls_properties_for_sale);
  console.log("[BuildingDetail] effectiveBuildingData.mls_properties_for_rent:", effectiveBuildingData?.mls_properties_for_rent);
  const buildingImages = [];
  if (effectiveBuildingData?.main_image) {
    buildingImages.push(effectiveBuildingData.main_image);
  }
  if (effectiveBuildingData?.images && Array.isArray(effectiveBuildingData.images)) {
    buildingImages.push(...effectiveBuildingData.images);
  }
  return /* @__PURE__ */ jsxs(MainLayout, { siteName, siteUrl, year, website, auth, blueHeader: true, children: [
    /* @__PURE__ */ jsx(Head, { title: `${effectiveBuildingData.name} - Building Details - ${siteName}` }),
    /* @__PURE__ */ jsx("div", { className: "idx mx-auto overflow-hidden bg-primary pb-24 md:pb-0", children: /* @__PURE__ */ jsxs("div", { className: "px-4 md:px-0 max-w-[1280px] mx-auto", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-4 md:mb-7", children: /* @__PURE__ */ jsx(
        PropertyHeader,
        {
          data: effectiveBuildingData,
          isFavorited,
          onToggleFavorite: handleToggleFavorite,
          type: "building",
          auth
        }
      ) }),
      /* @__PURE__ */ jsx("div", { className: "mb-4 md:mb-7", children: /* @__PURE__ */ jsx(
        BuildingGallery,
        {
          buildingImages,
          buildingData: effectiveBuildingData,
          website,
          isFavorited,
          onToggleFavorite: handleToggleFavorite,
          auth
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "flex md:flex-row sm:flex-col flex-col gap-6 w-full", children: [
        /* @__PURE__ */ jsxs("div", { className: "md:w-[950px]", children: [
          /* @__PURE__ */ jsx(
            BuildingSections,
            {
              buildingData: effectiveBuildingData,
              sampleSaleProperties,
              sampleRentProperties,
              auth,
              onLoginClick: () => openLoginModal("login"),
              onSignupClick: () => openLoginModal("register")
            }
          ),
          /* @__PURE__ */ jsx(
            ViewingRequestModal,
            {
              isOpen: viewingModal.isOpen,
              onClose: handleCloseViewingModal,
              property: viewingModal.property
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: `max-w-[309px] md:flex hidden w-full transition-opacity duration-300 ${sidebarVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`, children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          !auth?.user && /* @__PURE__ */ jsx("div", { className: "bg-white border border-gray-200 rounded-xl p-6 shadow-sm", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-[#293056] mb-2 font-space-grotesk", children: "Get Building Details" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-sm mb-4", children: "Create a free account to save buildings and get exclusive access to property details" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => openLoginModal("login"),
                className: "w-full py-3 px-4 rounded-xl font-medium hover:opacity-90 transition-all",
                style: { backgroundColor: buttonPrimaryBg, color: buttonPrimaryText },
                children: "Sign Up / Log In"
              }
            )
          ] }) }),
          /* @__PURE__ */ jsx(BuildingTourScheduling, { website, buildingData: effectiveBuildingData })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "description", children: /* @__PURE__ */ jsx(RealEstateLinksSection, { propertyData: buildingData }) })
    ] }) }),
    /* @__PURE__ */ jsx(MobileBottomBar, {}),
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
  BuildingDetail as default
};
