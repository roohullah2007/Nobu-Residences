import { jsxs, jsx } from "react/jsx-runtime";
import { usePage } from "@inertiajs/react";
import { useState } from "react";
import Navbar from "./Navbar-Cf7RY0yN.js";
import ContactAgentModal from "./ContactAgentModal-Bc8CTpfm.js";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import "./LoginModal-C-0W-anf.js";
import "./GoogleLoginButton-wrwag0eM.js";
import "./PropertyDetailIcons-3huqvWqW.js";
import "@headlessui/react";
function SchoolHeroSection({ auth, siteName = "X Houses", website }) {
  const [showContactModal, setShowContactModal] = useState(false);
  const { globalWebsite, website: pageWebsite } = usePage().props;
  const currentWebsite = website || pageWebsite || globalWebsite;
  const brandColors = currentWebsite?.brand_colors || {
    button_secondary_bg: "#912018",
    button_secondary_text: "#FFFFFF"
  };
  const buttonSecondaryBg = brandColors.button_secondary_bg || "#912018";
  const buttonSecondaryText = brandColors.button_secondary_text || "#FFFFFF";
  return /* @__PURE__ */ jsxs("div", { className: "relative bg-cover bg-center bg-no-repeat font-work-sans min-h-screen md:h-[895px]", style: {
    backgroundImage: `url('/assets/school/school-bg.jpg')`
  }, children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" }),
    /* @__PURE__ */ jsx(Navbar, { auth }),
    /* @__PURE__ */ jsx("main", { className: "relative px-4 md:px-0 z-10 flex max-w-[1280px] mx-auto flex-col items-center justify-center min-h-[calc(100vh-80px)] md:h-[calc(895px-80px)] pt-36 md:pt-60 py-8 md:py-0", children: /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex w-full flex-col md:flex-row justify-between items-start mb-16 md:mb-16 space-y-6 md:space-y-0 md:space-x-6", children: [
        /* @__PURE__ */ jsx("div", { className: "w-full md:max-w-[593px]", children: /* @__PURE__ */ jsx("div", { className: "flex flex-col justify-center items-center p-4 sm:p-6 gap-2 w-full bg-white/10 backdrop-blur-xl rounded-xl", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-center items-center p-0 gap-4 sm:gap-6 w-full", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center p-0 gap-2 sm:gap-3.5 w-full", children: [
            /* @__PURE__ */ jsxs("div", { className: "w-full sm:flex-1 font-work-sans text-base sm:text-lg leading-6 sm:leading-7 flex items-center tracking-wider text-white", children: [
              /* @__PURE__ */ jsx("span", { className: "font-bold", children: "Type:" }),
              " ",
              /* @__PURE__ */ jsx("span", { className: "font-normal ml-1", style: { fontWeight: 400 }, children: "Catholic" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "w-full sm:flex-1 font-work-sans text-base sm:text-lg leading-6 sm:leading-7 flex items-center tracking-wider text-white", children: [
              /* @__PURE__ */ jsx("span", { className: "font-bold", children: "Language:" }),
              " ",
              /* @__PURE__ */ jsx("span", { className: "font-normal ml-1", style: { fontWeight: 400 }, children: "English" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start p-0 gap-2 sm:gap-3.5 w-full", children: [
            /* @__PURE__ */ jsx("div", { className: "w-full sm:flex-1 font-work-sans text-base sm:text-lg leading-6 sm:leading-7 flex items-start tracking-wider text-white", children: /* @__PURE__ */ jsxs("div", { className: "break-words", children: [
              /* @__PURE__ */ jsx("span", { className: "font-bold", children: "Board:" }),
              " ",
              /* @__PURE__ */ jsx("span", { className: "font-normal ml-1", style: { fontWeight: 400 }, children: "Toronto Catholic District School Board" })
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "w-full sm:flex-1 font-work-sans text-base sm:text-lg leading-6 sm:leading-7 flex items-start tracking-wider text-white", children: /* @__PURE__ */ jsxs("div", { className: "break-all", children: [
              /* @__PURE__ */ jsx("span", { className: "font-bold", children: "Website:" }),
              " ",
              /* @__PURE__ */ jsx("span", { className: "font-normal ml-1", style: { fontWeight: 400 }, children: "https://clsbe.lisboa.ucp.pt/" })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center p-0 gap-2 sm:gap-3.5 w-full", children: [
            /* @__PURE__ */ jsxs("div", { className: "w-full sm:flex-1 font-work-sans text-base sm:text-lg leading-6 sm:leading-7 flex items-center tracking-wider text-white", children: [
              /* @__PURE__ */ jsx("span", { className: "font-bold", children: "Level:" }),
              " ",
              /* @__PURE__ */ jsx("span", { className: "font-normal ml-1", style: { fontWeight: 400 }, children: "Elementary" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "w-full sm:flex-1 font-work-sans text-base sm:text-lg leading-6 sm:leading-7 flex items-center tracking-wider text-white", children: [
              /* @__PURE__ */ jsx("span", { className: "font-bold", children: "Phone:" }),
              " ",
              /* @__PURE__ */ jsx("span", { className: "font-normal ml-1", style: { fontWeight: 400 }, children: "123-145-458" })
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
              className: "flex justify-center items-center w-full h-10 sm:h-12 rounded-full hover:opacity-90 transition-all duration-200",
              style: { backgroundColor: buttonSecondaryBg, color: buttonSecondaryText },
              children: /* @__PURE__ */ jsx("span", { className: "font-work-sans font-bold text-sm sm:text-base leading-5 sm:leading-6 tracking-wider whitespace-nowrap", children: "Contact agent" })
            }
          )
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "w-full", children: /* @__PURE__ */ jsxs("div", { className: "flex-1 max-w-full md:max-w-2xl", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-white font-bold mb-4 sm:mb-6 font-space-grotesk text-2xl sm:text-3xl md:text-4xl md:text-5xl xl:text-[65px] leading-tight tracking-wider", children: "Holly Name Catholic School" }),
        /* @__PURE__ */ jsx("p", { className: "text-white mb-3 sm:mb-4 font-work-sans text-base sm:text-lg font-bold tracking-wider", children: "690 Carlaw Ave, Toronto, ON" }),
        /* @__PURE__ */ jsx("p", { className: "text-white mb-6 sm:mb-8 font-work-sans text-base sm:text-lg font-medium tracking-wider", children: "NO55 Mercer Condos in King West, Downtown, Toronto" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "flex justify-center items-center w-full sm:w-[203px] h-12 sm:h-16 rounded-full hover:opacity-90 transition-all duration-200",
            style: { backgroundColor: buttonSecondaryBg, color: buttonSecondaryText },
            children: /* @__PURE__ */ jsx("span", { className: "font-work-sans font-bold text-base sm:text-lg leading-6 sm:leading-7 tracking-wider whitespace-nowrap", children: "Rating: 8.5/10" })
          }
        )
      ] }) })
    ] }) }),
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
          BuildingName: "School Property"
        },
        auth,
        websiteSettings: { website }
      }
    )
  ] });
}
export {
  SchoolHeroSection as default
};
