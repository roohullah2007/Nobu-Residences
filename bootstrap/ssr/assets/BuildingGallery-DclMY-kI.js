import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Heart, Close, ChevronLeft, ChevronRight } from "./PropertyDetailIcons-3huqvWqW.js";
import ContactAgentModal from "./ContactAgentModal-BZyWhDPm.js";
import { usePage } from "@inertiajs/react";
import "./PhoneInput-BOSF9o14.js";
const BuildingGallery = ({ buildingImages, buildingData, website, isFavorited, onToggleFavorite, auth }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [propertyCounts, setPropertyCounts] = useState({ for_sale: 0, for_rent: 0 });
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const { globalWebsite } = usePage().props;
  const currentWebsite = globalWebsite || website || {};
  const brandColors = currentWebsite?.brand_colors || {
    button_quaternary_bg: "#FFFFFF",
    button_quaternary_text: "#293056",
    button_secondary_bg: "#912018",
    button_secondary_text: "#FFFFFF"
  };
  const buttonQuaternaryBg = brandColors.button_quaternary_bg || "#FFFFFF";
  const buttonQuaternaryText = brandColors.button_quaternary_text || "#293056";
  const buttonSecondaryBg = brandColors.button_secondary_bg || "#912018";
  const buttonSecondaryText = brandColors.button_secondary_text || "#FFFFFF";
  console.log("BuildingGallery received buildingData:", buildingData);
  const getPrimaryAddress = () => {
    if (buildingData?.street_address_1) {
      return buildingData.street_address_1;
    }
    if (buildingData?.address) {
      const parts = buildingData.address.split(/\s+(?:&|and)\s+/i);
      if (parts[0]) {
        return parts[0].trim();
      }
    }
    return "15-Mercer";
  };
  const primaryAddress = getPrimaryAddress();
  primaryAddress.replace(/\s+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Court|Ct|Place|Pl|Lane|Ln|Way)$/i, "").replace(/[,\.]/g, "").replace(/\s+/g, "-");
  useEffect(() => {
    const saleCount = buildingData?.mls_properties_for_sale?.length || 0;
    const rentCount = buildingData?.mls_properties_for_rent?.length || 0;
    console.log("[BuildingGallery] Using pre-loaded MLS counts:", {
      for_sale: saleCount,
      for_rent: rentCount
    });
    setPropertyCounts({
      for_sale: saleCount,
      for_rent: rentCount
    });
    setIsLoadingCounts(false);
  }, [buildingData]);
  const openModal = (imageIndex = 0) => {
    setModalImageIndex(imageIndex);
    setShowModal(true);
    document.body.style.overflow = "hidden";
  };
  const closeModal = () => {
    setShowModal(false);
    document.body.style.overflow = "unset";
  };
  const nextModalImage = () => {
    setModalImageIndex((prev) => (prev + 1) % buildingImages.length);
  };
  const prevModalImage = () => {
    setModalImageIndex((prev) => (prev - 1 + buildingImages.length) % buildingImages.length);
  };
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (showModal) {
        if (e.key === "ArrowLeft") prevModalImage();
        if (e.key === "ArrowRight") nextModalImage();
        if (e.key === "Escape") closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [showModal]);
  useEffect(() => {
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "max-w-[1280px] mx-auto px-0 py-0", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row gap-4 md:gap-5 lg:gap-6", children: [
      /* @__PURE__ */ jsx("div", { className: "flex-1 order-1 lg:order-none", children: /* @__PURE__ */ jsx("div", { className: "relative w-full h-[300px] md:h-[400px] lg:h-[645px]", children: buildingImages && buildingImages.length > 0 ? /* @__PURE__ */ jsxs(
        "div",
        {
          className: "relative w-full h-full rounded-xl overflow-hidden cursor-pointer group",
          onClick: () => openModal(0),
          children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: buildingImages[0],
                alt: "Building image",
                className: "w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black bg-opacity-10" }),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "text-white text-lg font-work-sans font-semibold", children: "Click to view photos" }) })
          ]
        }
      ) : /* @__PURE__ */ jsx("div", { className: "w-full h-full rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3 text-gray-400", children: [
        /* @__PURE__ */ jsx("div", { className: "w-20 h-20 rounded-lg bg-white shadow-sm flex items-center justify-center", children: /* @__PURE__ */ jsxs("svg", { className: "w-12 h-12", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [
          /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", d: "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" }),
          /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", d: "M15 13a3 3 0 11-6 0 3 3 0 016 0z" })
        ] }) }),
        /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "No Image Available" })
      ] }) }) }) }),
      /* @__PURE__ */ jsx("div", { className: "w-full lg:w-[306px] h-auto lg:h-[645px] bg-gray-50 border border-gray-200 rounded-xl flex-shrink-0 order-2 lg:order-none", children: /* @__PURE__ */ jsx("div", { className: "flex flex-col justify-between p-4 md:p-6 h-full min-h-[500px] lg:min-h-0", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6 md:gap-6 lg:gap-8 mb-[30px] md:mb-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 items-center", children: [
          /* @__PURE__ */ jsx("h2", { className: "font-space-grotesk font-bold text-xl md:text-2xl leading-tight text-[#293056] text-center", style: { textWrap: "balance" }, children: buildingData?.name || "Building Name" }),
          /* @__PURE__ */ jsx("div", { className: "w-full h-px border-t border-[#D5D7DA]" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col mt-10 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start", children: [
            /* @__PURE__ */ jsx("span", { className: "font-work-sans font-semibold text-sm text-[#252B37]", children: "Developer" }),
            /* @__PURE__ */ jsx("span", { className: "font-work-sans text-sm text-[#535862] text-right max-w-[180px]", children: buildingData?.developer_name || buildingData?.developer?.name || "-" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start", children: [
            /* @__PURE__ */ jsx("span", { className: "font-work-sans font-semibold text-sm text-[#252B37]", children: "Address" }),
            /* @__PURE__ */ jsx(
              "span",
              {
                className: "font-work-sans text-sm text-[#535862] text-right max-w-[180px] truncate",
                title: (() => {
                  if (buildingData?.street_address_1 && buildingData?.street_address_2) {
                    return `${buildingData.street_address_1} & ${buildingData.street_address_2}`;
                  }
                  return buildingData?.address || buildingData?.name || "-";
                })(),
                children: (() => {
                  if (buildingData?.street_address_1 && buildingData?.street_address_2) {
                    return `${buildingData.street_address_1} & ${buildingData.street_address_2}`;
                  }
                  return buildingData?.address || buildingData?.name || "-";
                })()
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start", children: [
            /* @__PURE__ */ jsx("span", { className: "font-work-sans font-semibold text-sm text-[#252B37]", children: "Neighbourhood" }),
            /* @__PURE__ */ jsx("span", { className: "font-work-sans text-sm text-[#535862] text-right max-w-[180px]", children: (() => {
              const parts = [];
              if (buildingData?.sub_neighbourhood) parts.push(buildingData.sub_neighbourhood);
              if (buildingData?.neighbourhood && buildingData?.neighbourhood !== buildingData?.sub_neighbourhood) {
                parts.push(buildingData.neighbourhood);
              }
              if (parts.length === 0 && buildingData?.neighborhood_info) {
                parts.push(buildingData.neighborhood_info);
              }
              if (parts.length === 0 && buildingData?.city) {
                parts.push(buildingData.city);
              }
              return parts.length > 0 ? parts.join(", ") : "-";
            })() })
          ] }),
          (buildingData?.suite_size_range || buildingData?.sqft_range || (buildingData?.mls_properties_for_sale?.length > 0 || buildingData?.mls_properties_for_rent?.length > 0)) && /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start", children: [
            /* @__PURE__ */ jsx("span", { className: "font-work-sans font-semibold text-sm text-[#252B37]", children: "Sq Ft Range" }),
            /* @__PURE__ */ jsx("span", { className: "font-work-sans text-sm text-[#535862] text-right max-w-[180px] break-words", children: (() => {
              if (buildingData?.suite_size_range) return buildingData.suite_size_range;
              if (buildingData?.sqft_range) return buildingData.sqft_range;
              const allProperties = [
                ...buildingData?.mls_properties_for_sale || [],
                ...buildingData?.mls_properties_for_rent || []
              ];
              if (allProperties.length > 0) {
                const sqftValues = allProperties.map((p) => p.sqft || p.LivingAreaRange || p.AboveGradeFinishedArea || 0).filter((v) => v > 0);
                if (sqftValues.length > 0) {
                  const minSqft = Math.min(...sqftValues);
                  const maxSqft = Math.max(...sqftValues);
                  if (minSqft === maxSqft) {
                    return `${minSqft.toLocaleString()} sqft`;
                  }
                  return `${minSqft.toLocaleString()} - ${maxSqft.toLocaleString()} sqft`;
                }
              }
              return "-";
            })() })
          ] }),
          buildingData?.avg_price_per_sqft && /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start", children: [
            /* @__PURE__ */ jsx("span", { className: "font-work-sans font-semibold text-sm text-[#252B37]", children: "Avg Price / Sqft" }),
            /* @__PURE__ */ jsx("span", { className: "font-work-sans text-sm text-[#535862] text-right max-w-[180px] break-words", children: buildingData.avg_price_per_sqft })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                const section = document.getElementById("properties-for-rent");
                if (section) {
                  section.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              },
              className: "w-full h-12 rounded-xl border flex items-center justify-center hover:opacity-80 transition-all group cursor-pointer",
              style: { backgroundColor: buttonQuaternaryBg, color: buttonQuaternaryText, borderColor: buttonQuaternaryText },
              children: /* @__PURE__ */ jsx("span", { className: "font-work-sans font-medium text-base", children: isLoadingCounts ? "Loading..." : `${propertyCounts.for_rent || 0} Units for Rent` })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                const section = document.getElementById("properties-for-sale");
                if (section) {
                  section.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              },
              className: "w-full h-12 rounded-xl border flex items-center justify-center hover:opacity-80 transition-all group cursor-pointer",
              style: { backgroundColor: buttonQuaternaryBg, color: buttonQuaternaryText, borderColor: buttonQuaternaryText },
              children: /* @__PURE__ */ jsx("span", { className: "font-work-sans font-medium text-base", children: isLoadingCounts ? "Loading..." : `${propertyCounts.for_sale || 0} Units for Sale` })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full overflow-hidden flex-shrink-0", children: /* @__PURE__ */ jsx(
              "img",
              {
                src: website?.agent_info?.profile_image || website?.contact_info?.agent?.image || buildingData?.agent_image || "",
                alt: website?.agent_info?.agent_name || website?.contact_info?.agent?.name || buildingData?.agent_name || "Agent",
                className: "w-full h-full object-cover"
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col min-w-0 leading-tight", children: [
              (website?.agent_info?.agent_name || website?.contact_info?.agent?.name || buildingData?.agent_name) && /* @__PURE__ */ jsx("h3", { className: "font-space-grotesk font-bold text-lg text-[#7E2410] truncate", children: website?.agent_info?.agent_name || website?.contact_info?.agent?.name || buildingData?.agent_name }),
              (website?.agent_info?.agent_title || website?.contact_info?.agent?.title || buildingData?.agent_title) && /* @__PURE__ */ jsx("p", { className: "font-work-sans font-medium text-sm text-[#535862] truncate", children: website?.agent_info?.agent_title || website?.contact_info?.agent?.title || buildingData?.agent_title }),
              (website?.agent_info?.brokerage || website?.contact_info?.agent?.brokerage || buildingData?.agent_brokerage) && /* @__PURE__ */ jsx("p", { className: "font-work-sans font-normal text-sm text-[#535862] truncate", children: website?.agent_info?.brokerage || website?.contact_info?.agent?.brokerage || buildingData?.agent_brokerage })
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setShowContactModal(true),
              className: "w-full h-12 rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity",
              style: { backgroundColor: buttonSecondaryBg },
              children: /* @__PURE__ */ jsx("span", { className: "font-work-sans font-extrabold text-sm md:text-base", style: { color: buttonSecondaryText }, children: "Contact Agent" })
            }
          )
        ] })
      ] }) }) })
    ] }) }),
    showModal && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-black bg-opacity-90 px-4 py-3 flex justify-between items-center border-b border-white border-opacity-10 flex-shrink-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-white flex flex-col gap-1", children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-sm", children: buildingData?.name || buildingData?.address || "Building" }),
          /* @__PURE__ */ jsxs("span", { className: "text-white text-opacity-70 text-xs", children: [
            "(",
            modalImageIndex + 1,
            " of ",
            buildingImages.length,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: onToggleFavorite,
              className: "text-white bg-white bg-opacity-10 border border-white border-opacity-20 rounded-md p-2 w-10 h-10 flex items-center justify-center hover:bg-opacity-20 transition-colors",
              children: /* @__PURE__ */ jsx(Heart, { className: "w-5 h-5", filled: isFavorited })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: closeModal,
              className: "text-white bg-white bg-opacity-10 border border-white border-opacity-20 rounded-md p-2 w-10 h-10 flex items-center justify-center hover:bg-opacity-20 transition-colors",
              children: /* @__PURE__ */ jsx(Close, { className: "w-5 h-5" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 flex items-center justify-center relative overflow-hidden min-h-0", children: [
        buildingImages.length > 1 && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: prevModalImage,
            disabled: modalImageIndex === 0,
            className: "absolute left-3 z-10 bg-white bg-opacity-90 border-none rounded-full w-10 h-10 flex items-center justify-center cursor-pointer top-1/2 transform -translate-y-1/2 hover:bg-white hover:scale-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed",
            children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-5 h-5" })
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "w-full h-full flex items-center justify-center overflow-hidden px-16", children: /* @__PURE__ */ jsx(
          "div",
          {
            className: "flex h-full w-full transition-transform duration-300 ease-in-out",
            style: { transform: `translateX(-${modalImageIndex * 100}%)` },
            children: buildingImages.map((image, index) => /* @__PURE__ */ jsx("div", { className: "min-w-full flex items-center justify-center p-4", children: /* @__PURE__ */ jsx(
              "img",
              {
                src: image,
                alt: `Building image ${index + 1}`,
                className: "max-w-full max-h-full object-contain"
              }
            ) }, index))
          }
        ) }),
        buildingImages.length > 1 && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: nextModalImage,
            disabled: modalImageIndex === buildingImages.length - 1,
            className: "absolute right-3 z-10 bg-white bg-opacity-90 border-none rounded-full w-10 h-10 flex items-center justify-center cursor-pointer top-1/2 transform -translate-y-1/2 hover:bg-white hover:scale-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed",
            children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-5 h-5" })
          }
        )
      ] }),
      buildingImages.length > 1 && /* @__PURE__ */ jsx("div", { className: "flex gap-2 px-4 py-3 bg-black bg-opacity-90 border-t border-white border-opacity-10 overflow-x-auto", children: buildingImages.map((image, index) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setModalImageIndex(index),
          className: `border-2 rounded-md overflow-hidden opacity-70 flex-shrink-0 transition-all hover:opacity-90 ${index === modalImageIndex ? "border-blue-500 opacity-100 scale-105" : "border-white border-opacity-20"}`,
          children: /* @__PURE__ */ jsx(
            "img",
            {
              src: image,
              alt: `Thumbnail ${index + 1}`,
              className: "w-20 h-15 object-cover block"
            }
          )
        },
        index
      )) })
    ] }),
    /* @__PURE__ */ jsx(
      ContactAgentModal,
      {
        isOpen: showContactModal,
        onClose: () => setShowContactModal(false),
        agentData: {
          id: buildingData?.agent_id,
          name: website?.agent_info?.agent_name || website?.contact_info?.agent?.name || buildingData?.agent_name,
          title: website?.agent_info?.agent_title || website?.contact_info?.agent?.title || buildingData?.agent_title,
          phone: website?.agent_info?.agent_phone || website?.contact_info?.agent?.phone || buildingData?.agent_phone,
          brokerage: website?.agent_info?.brokerage || website?.contact_info?.agent?.brokerage || buildingData?.agent_brokerage,
          image: website?.agent_info?.profile_image || website?.contact_info?.agent?.image || buildingData?.agent_image
        },
        propertyData: {
          ListingKey: buildingData?.id,
          address: buildingData?.address || buildingData?.name,
          BuildingName: buildingData?.name
        },
        auth,
        websiteSettings: { website }
      }
    )
  ] });
};
export {
  BuildingGallery as default
};
