import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { usePage, Head } from "@inertiajs/react";
import Navbar from "./Navbar-Cpn1c-fk.js";
import Footer from "./Footer-BjazYOa4.js";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import FAQ from "./FAQ-zFddXG5C.js";
import ViewingRequestModal from "./ViewingRequestModal-Dmz9BeSZ.js";
import RealEstateLinksSection from "./RealEstateLinksSection-BwRekZ9s.js";
import PropertiesForSale from "./PropertiesForSale-ByM-ehDn.js";
import PropertiesForRent from "./PropertiesForRent-Bhi1sKRC.js";
import ContactAgentModal from "./ContactAgentModal-Bc8CTpfm.js";
import "./LoginModal-C-0W-anf.js";
import "./GoogleLoginButton-wrwag0eM.js";
import "./PropertyDetailIcons-3huqvWqW.js";
import "@headlessui/react";
import "./PropertyCarousel-xQqZk_Vh.js";
import "./PropertyCard-BWgqbSLf.js";
import "axios";
function SchoolDetail({
  auth,
  website,
  siteName,
  siteUrl,
  year,
  schoolId,
  schoolSlug,
  schoolData: initialSchoolData,
  faqs = []
}) {
  const [schoolData, setSchoolData] = useState(initialSchoolData);
  const [isLoading, setIsLoading] = useState(!initialSchoolData);
  const [showContactModal, setShowContactModal] = useState(false);
  const [viewingModal, setViewingModal] = useState({
    isOpen: false,
    property: null
  });
  const { globalWebsite } = usePage().props;
  const currentWebsite = globalWebsite || website || {};
  const brandColors = currentWebsite?.brand_colors || {
    button_secondary_bg: "#912018",
    button_secondary_text: "#FFFFFF"
  };
  const buttonSecondaryBg = brandColors.button_secondary_bg || "#912018";
  const buttonSecondaryText = brandColors.button_secondary_text || "#FFFFFF";
  useEffect(() => {
    window.openViewingModal = (property) => {
      setViewingModal({
        isOpen: true,
        property
      });
    };
    return () => {
      delete window.openViewingModal;
    };
  }, []);
  const handleCloseViewingModal = () => {
    setViewingModal({
      isOpen: false,
      property: null
    });
  };
  useEffect(() => {
    if (!initialSchoolData && (schoolId || schoolSlug)) {
      fetchSchoolData();
    }
  }, [schoolId, schoolSlug]);
  const fetchSchoolData = async () => {
    setIsLoading(true);
    try {
      const endpoint = schoolSlug ? `/api/schools/slug/${schoolSlug}` : `/api/schools/${schoolId}`;
      const response = await fetch(endpoint);
      const result = await response.json();
      if (result.success) {
        setSchoolData(result.data);
      } else {
        console.error("Failed to fetch school data:", result.message);
      }
    } catch (error) {
      console.error("Error fetching school data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const getSchoolType = () => {
    if (schoolData?.school_type_label) {
      return schoolData.school_type_label;
    }
    if (schoolData?.types) {
      if (schoolData.types.includes("primary_school")) return "Public";
      if (schoolData.types.includes("secondary_school")) return "Public";
      if (schoolData.types.includes("school")) return "Public";
    }
    return "Public";
  };
  const getGradeLevel = () => {
    if (schoolData?.grade_level_label) {
      return schoolData.grade_level_label;
    }
    if (schoolData?.types) {
      if (schoolData.types.includes("primary_school")) return "Elementary";
      if (schoolData.types.includes("secondary_school")) return "High School";
    }
    return "Elementary";
  };
  const parseAddress = () => {
    const address = schoolData?.address || schoolData?.formatted_address || "";
    const parts = address.split(",").map((s) => s.trim());
    const city2 = parts.length > 1 ? parts[parts.length - 2] : "Toronto";
    const province2 = parts.length > 2 && parts[parts.length - 1].includes("ON") ? "ON" : "ON";
    return { city: city2, province: province2, full: address };
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Head, { title: `Loading School... - ${siteName}` }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-screen", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "inline-block w-16 h-16 border-4 border-[#293056] border-t-transparent rounded-full animate-spin mb-4" }),
        /* @__PURE__ */ jsx("div", { className: "text-[#293056] text-xl font-medium", children: "Loading school details..." })
      ] }) })
    ] });
  }
  if (!schoolData) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Head, { title: `School Not Found - ${siteName}` }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-screen", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[#293056] text-xl font-medium mb-4", children: "School not found" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => window.history.back(),
            className: "px-6 py-2 rounded-lg hover:opacity-90 transition-colors",
            style: { backgroundColor: buttonSecondaryBg, color: buttonSecondaryText },
            children: "Go Back"
          }
        )
      ] }) })
    ] });
  }
  const { city, province, full: fullAddress } = parseAddress();
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: `${schoolData.name} - School Details - ${siteName}` }),
    /* @__PURE__ */ jsxs("div", { className: "relative bg-cover bg-center bg-no-repeat font-work-sans min-h-screen md:h-[895px]", style: {
      backgroundImage: `url('/assets/school/school-bg.jpg')`
    }, children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" }),
      /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-0 right-0 z-20 h-[82px] flex items-center", children: /* @__PURE__ */ jsx(Navbar, { auth, website, onDarkBg: true }) }),
      /* @__PURE__ */ jsx("main", { className: "relative px-4 md:px-0 z-10 flex max-w-[1280px] mx-auto flex-col items-center justify-center md:h-[calc(895px-140px)] pt-36 md:pt-60 py-8 md:py-0", children: /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex w-full flex-col md:flex-row justify-between items-start mb-16 md:mb-16 space-y-6 md:space-y-0 md:space-x-6", children: [
          /* @__PURE__ */ jsx("div", { className: "w-full md:max-w-[593px]", children: /* @__PURE__ */ jsx("div", { className: "flex flex-col justify-center items-center p-4 sm:p-6 gap-2 w-full bg-white/10 backdrop-blur-xl rounded-xl", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-center items-center p-0 gap-4 sm:gap-6 w-full", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center p-0 gap-2 sm:gap-3.5 w-full", children: [
              /* @__PURE__ */ jsxs("div", { className: "w-full sm:flex-1 font-work-sans text-base sm:text-lg leading-6 sm:leading-7 flex items-center tracking-wider text-white", children: [
                /* @__PURE__ */ jsx("span", { className: "font-bold", children: "Type:" }),
                /* @__PURE__ */ jsx("span", { className: "font-normal ml-1", style: { fontWeight: 400 }, children: getSchoolType() })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "w-full sm:flex-1 font-work-sans text-base sm:text-lg leading-6 sm:leading-7 flex items-center tracking-wider text-white", children: [
                /* @__PURE__ */ jsx("span", { className: "font-bold", children: "Language:" }),
                /* @__PURE__ */ jsx("span", { className: "font-normal ml-1", style: { fontWeight: 400 }, children: schoolData.languages?.join(", ") || "English" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start p-0 gap-2 sm:gap-3.5 w-full", children: [
              /* @__PURE__ */ jsx("div", { className: "w-full sm:flex-1 font-work-sans text-base sm:text-lg leading-6 sm:leading-7 flex items-start tracking-wider text-white", children: /* @__PURE__ */ jsxs("div", { className: "break-words", children: [
                /* @__PURE__ */ jsx("span", { className: "font-bold", children: "Board:" }),
                /* @__PURE__ */ jsx("span", { className: "font-normal ml-1", style: { fontWeight: 400 }, children: schoolData.school_board || "Toronto District School Board" })
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "w-full sm:flex-1 font-work-sans text-base sm:text-lg leading-6 sm:leading-7 flex items-start tracking-wider text-white", children: /* @__PURE__ */ jsxs("div", { className: "break-all", children: [
                /* @__PURE__ */ jsx("span", { className: "font-bold", children: "Website:" }),
                schoolData.website_url ? /* @__PURE__ */ jsx(
                  "a",
                  {
                    href: schoolData.website_url,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "font-normal ml-1 underline hover:no-underline",
                    style: { fontWeight: 400 },
                    children: schoolData.website_url
                  }
                ) : /* @__PURE__ */ jsx("span", { className: "font-normal ml-1", style: { fontWeight: 400 }, children: "Not available" })
              ] }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center p-0 gap-2 sm:gap-3.5 w-full", children: [
              /* @__PURE__ */ jsxs("div", { className: "w-full sm:flex-1 font-work-sans text-base sm:text-lg leading-6 sm:leading-7 flex items-center tracking-wider text-white", children: [
                /* @__PURE__ */ jsx("span", { className: "font-bold", children: "Level:" }),
                /* @__PURE__ */ jsx("span", { className: "font-normal ml-1", style: { fontWeight: 400 }, children: getGradeLevel() })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "w-full sm:flex-1 font-work-sans text-base sm:text-lg leading-6 sm:leading-7 flex items-center tracking-wider text-white", children: [
                /* @__PURE__ */ jsx("span", { className: "font-bold", children: "Phone:" }),
                schoolData.phone ? /* @__PURE__ */ jsx(
                  "a",
                  {
                    href: `tel:${schoolData.phone}`,
                    className: "font-normal ml-1 underline hover:no-underline",
                    style: { fontWeight: 400 },
                    children: schoolData.phone
                  }
                ) : /* @__PURE__ */ jsx("span", { className: "font-normal ml-1", style: { fontWeight: 400 }, children: "Not available" })
              ] })
            ] })
          ] }) }) }),
          /* @__PURE__ */ jsx("div", { className: "w-full md:max-w-[448px]", children: /* @__PURE__ */ jsx("div", { className: "flex flex-col items-start p-4 sm:p-[18px_27px] gap-2.5 w-full bg-white/10 backdrop-blur-xl rounded-tl-3xl rounded-br-3xl rounded-3xl", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start p-0 gap-4 sm:gap-6 w-full", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-row items-center p-0 gap-3 sm:gap-4 w-full", children: [
              (website?.agent_info?.profile_image || website?.contact_info?.agent?.image) && /* @__PURE__ */ jsx(
                "div",
                {
                  className: "w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 border-2 border-[#293056] rounded-full bg-cover bg-center",
                  style: {
                    backgroundImage: `url('${website?.agent_info?.profile_image || website?.contact_info?.agent?.image}')`
                  }
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start p-0 flex-1 min-w-0", children: [
                (website?.agent_info?.agent_name || website?.contact_info?.agent?.name) && /* @__PURE__ */ jsx("div", { className: "w-full font-space-grotesk font-bold text-sm sm:text-base leading-5 sm:leading-[26px] flex items-center tracking-wider uppercase text-[#293056] truncate", children: (website?.agent_info?.agent_name || website?.contact_info?.agent?.name).toUpperCase() }),
                (website?.agent_info?.agent_title || website?.contact_info?.agent?.title) && /* @__PURE__ */ jsx("div", { className: "w-full font-work-sans font-bold text-xs sm:text-sm leading-5 sm:leading-6 flex items-center tracking-wider text-[#7E2410] truncate", children: website?.agent_info?.agent_title || website?.contact_info?.agent?.title }),
                (website?.agent_info?.brokerage || website?.contact_info?.agent?.brokerage) && /* @__PURE__ */ jsx("div", { className: "w-full font-work-sans font-medium text-sm sm:text-base leading-5 sm:leading-[25px] flex items-center tracking-wider text-[#293056] truncate", children: website?.agent_info?.brokerage || website?.contact_info?.agent?.brokerage }),
                (website?.agent_info?.agent_phone || website?.contact_info?.agent?.phone) && /* @__PURE__ */ jsx("div", { className: "w-full font-work-sans font-bold text-sm sm:text-base leading-5 sm:leading-[25px] flex items-center tracking-wider text-[#293056]", children: website?.agent_info?.agent_phone || website?.contact_info?.agent?.phone })
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setShowContactModal(true),
                className: "flex justify-center items-center w-full h-10 sm:h-12 rounded-full hover:opacity-90 transition-opacity duration-200",
                style: { backgroundColor: buttonSecondaryBg, color: buttonSecondaryText },
                children: /* @__PURE__ */ jsx("span", { className: "font-work-sans font-bold text-sm sm:text-base leading-5 sm:leading-6 tracking-wider whitespace-nowrap", children: "Contact agent" })
              }
            )
          ] }) }) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "w-full", children: /* @__PURE__ */ jsxs("div", { className: "flex-1 max-w-full md:max-w-2xl", children: [
          /* @__PURE__ */ jsx("h1", { className: "text-white font-bold mb-4 sm:mb-6 font-space-grotesk text-2xl sm:text-3xl md:text-4xl md:text-5xl xl:text-[65px] leading-tight tracking-wider", children: schoolData.name }),
          /* @__PURE__ */ jsx("p", { className: "text-white mb-3 sm:mb-4 font-work-sans text-base sm:text-lg font-bold tracking-wider", children: fullAddress || `${city}, ${province}` }),
          /* @__PURE__ */ jsxs("p", { className: "text-white mb-6 sm:mb-8 font-work-sans text-base sm:text-lg font-medium tracking-wider", children: [
            getSchoolType(),
            " ",
            getGradeLevel(),
            " School in ",
            city,
            ", ",
            province
          ] }),
          schoolData.rating && /* @__PURE__ */ jsx("button", { className: "flex justify-center items-center w-full sm:w-[203px] h-12 sm:h-16 rounded-full hover:opacity-90 transition-opacity duration-200", style: { backgroundColor: buttonSecondaryBg, color: buttonSecondaryText }, children: /* @__PURE__ */ jsxs("span", { className: "font-work-sans font-bold text-base sm:text-lg leading-6 sm:leading-7 tracking-wider whitespace-nowrap", children: [
            "Rating: ",
            schoolData.rating,
            "/10"
          ] }) })
        ] }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "overflow-x-hidden px-4 md:px-0", children: [
      /* @__PURE__ */ jsx("section", { className: "py-4 md:py-8 bg-white relative z-10", children: /* @__PURE__ */ jsxs("div", { className: "max-w-[1280px] mx-auto", children: [
        schoolData.description ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("h2", { className: "font-space-grotesk font-bold text-2xl text-[#293056] mb-4", children: [
            "About ",
            schoolData.name
          ] }),
          /* @__PURE__ */ jsx("p", { className: "font-work-sans text-gray-700 leading-relaxed mb-4 md:mb-8", children: schoolData.description })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("h2", { className: "font-space-grotesk font-bold text-2xl text-[#293056] mb-4", children: [
            "About ",
            schoolData.name
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "font-work-sans text-gray-700 leading-relaxed mb-4 md:mb-8", children: [
            schoolData.name,
            " is a ",
            getSchoolType().toLowerCase(),
            " ",
            getGradeLevel().toLowerCase(),
            " school located in ",
            city,
            ", ",
            province,
            ". The school serves the local community with quality education and various programs designed to help students reach their full potential."
          ] })
        ] }),
        schoolData.opening_hours && schoolData.opening_hours.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-space-grotesk font-bold text-2xl text-[#293056] mb-4", children: "Opening Hours" }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-2", children: schoolData.opening_hours.map((hours, index) => /* @__PURE__ */ jsx("div", { className: "font-work-sans text-gray-700", children: hours }, index)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: [
          schoolData.programs && schoolData.programs.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 p-6 rounded-xl", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-space-grotesk font-bold text-xl text-[#293056] mb-4", children: "Programs Offered" }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: schoolData.programs.map((program, index) => /* @__PURE__ */ jsx(
              "span",
              {
                className: "px-3 py-1 rounded text-sm",
                style: { backgroundColor: buttonSecondaryBg, color: buttonSecondaryText },
                children: program
              },
              index
            )) })
          ] }),
          schoolData.facilities && schoolData.facilities.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 p-6 rounded-xl", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-space-grotesk font-bold text-xl text-[#293056] mb-4", children: "Facilities" }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: schoolData.facilities.map((facility, index) => /* @__PURE__ */ jsx(
              "span",
              {
                className: "bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm",
                children: facility
              },
              index
            )) })
          ] }),
          (schoolData.principal_name || schoolData.student_capacity) && /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 p-6 rounded-xl", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-space-grotesk font-bold text-xl text-[#293056] mb-4", children: "School Information" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              schoolData.principal_name && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "font-work-sans font-medium text-gray-700", children: "Principal:" }),
                /* @__PURE__ */ jsx("p", { className: "font-work-sans text-gray-600", children: schoolData.principal_name })
              ] }),
              schoolData.student_capacity && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "font-work-sans font-medium text-gray-700", children: "Capacity:" }),
                /* @__PURE__ */ jsxs("p", { className: "font-work-sans text-gray-600", children: [
                  schoolData.student_capacity,
                  " students"
                ] })
              ] }),
              schoolData.established_year && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "font-work-sans font-medium text-gray-700", children: "Established:" }),
                /* @__PURE__ */ jsx("p", { className: "font-work-sans text-gray-600", children: schoolData.established_year })
              ] })
            ] })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("section", { className: "py-8 bg-gray-50 relative z-10", style: { minHeight: "500px" }, children: /* @__PURE__ */ jsxs("div", { className: "mx-auto space-y-10 md:px-0 max-w-[1280px]", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
          /* @__PURE__ */ jsxs("h2", { className: "font-space-grotesk font-bold text-3xl text-[#293056] mb-4", children: [
            "Properties Near ",
            schoolData.name
          ] }),
          /* @__PURE__ */ jsx("p", { className: "font-work-sans text-gray-600 max-w-2xl mx-auto", children: "Discover homes and condos in the area close to this school. Perfect for families looking for educational convenience." })
        ] }),
        /* @__PURE__ */ jsx(
          PropertiesForSale,
          {
            schoolAddress: fullAddress,
            auth
          }
        ),
        /* @__PURE__ */ jsx(
          PropertiesForRent,
          {
            schoolAddress: fullAddress,
            auth
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx(
        FAQ,
        {
          faqItems: faqs,
          title: "School Information FAQs",
          containerClassName: "py-4 md:py-16 bg-white",
          showContainer: true
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "max-w-[1280px] mx-auto", children: /* @__PURE__ */ jsx(RealEstateLinksSection, {}) })
    ] }),
    /* @__PURE__ */ jsx(
      ViewingRequestModal,
      {
        isOpen: viewingModal.isOpen,
        onClose: handleCloseViewingModal,
        property: viewingModal.property
      }
    ),
    /* @__PURE__ */ jsx(
      ContactAgentModal,
      {
        isOpen: showContactModal,
        onClose: () => setShowContactModal(false),
        agentData: {
          name: website?.agent_info?.agent_name || website?.contact_info?.agent?.name,
          title: website?.agent_info?.agent_title || website?.contact_info?.agent?.title,
          phone: website?.agent_info?.agent_phone || website?.contact_info?.agent?.phone,
          brokerage: website?.agent_info?.brokerage || website?.contact_info?.agent?.brokerage,
          image: website?.agent_info?.profile_image || website?.contact_info?.agent?.image
        },
        propertyData: {
          BuildingName: schoolData?.name || "School Property"
        },
        auth,
        websiteSettings: { website }
      }
    ),
    /* @__PURE__ */ jsx(
      Footer,
      {
        siteName,
        siteUrl,
        year,
        website,
        auth
      }
    )
  ] });
}
export {
  SchoolDetail as default
};
