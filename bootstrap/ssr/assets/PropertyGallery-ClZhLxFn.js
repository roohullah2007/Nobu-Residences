import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Close } from "./PropertyDetailIcons-3huqvWqW.js";
import { usePage } from "@inertiajs/react";
import PropertyEnquiryModal from "./PropertyEnquiryModal-CGQPgsDx.js";
function PropertyGallery({
  propertyImages,
  propertyData,
  auth,
  onLoginClick
}) {
  const [showModal, setShowModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [currentMobileSlide, setCurrentMobileSlide] = useState(0);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [mlsImages, setMlsImages] = useState([]);
  const [isLoadingMlsImages, setIsLoadingMlsImages] = useState(false);
  const [mlsImagesFetched, setMlsImagesFetched] = useState(false);
  const { globalWebsite, website } = usePage().props;
  const currentWebsite = website || globalWebsite;
  const brandColors = currentWebsite?.brand_colors || {};
  const buttonPrimaryBg = brandColors.button_primary_bg || "#293056";
  const buttonPrimaryText = brandColors.button_primary_text || "#FFFFFF";
  const buttonQuaternaryBg = brandColors.button_quaternary_bg || "#FFFFFF";
  const buttonQuaternaryText = brandColors.button_quaternary_text || "#293056";
  const buttonTertiaryBg = brandColors.button_tertiary_bg || "#000000";
  const buttonTertiaryText = brandColors.button_tertiary_text || "#FFFFFF";
  useEffect(() => {
    const fetchMlsImages = async () => {
      const listingKey = propertyData?.listingKey || propertyData?.ListingKey || propertyData?.mlsNumber || propertyData?.MlsNumber || propertyData?.ListingId || propertyData?.listingId;
      if (!listingKey) {
        console.log("🖼️ No listing key found for MLS image fetch");
        setMlsImagesFetched(true);
        return;
      }
      setIsLoadingMlsImages(true);
      try {
        console.log("🖼️ Fetching MLS images for listing:", listingKey);
        const response = await fetch(`/api/mls/property-images/${listingKey}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.images && data.images.length > 0) {
            console.log("🖼️ Fetched", data.images.length, "MLS images");
            setMlsImages(data.images);
          } else {
            console.log("🖼️ No MLS images found");
          }
        } else {
          console.log("🖼️ MLS image fetch failed:", response.status);
        }
      } catch (error) {
        console.error("🖼️ Error fetching MLS images:", error);
      } finally {
        setIsLoadingMlsImages(false);
        setMlsImagesFetched(true);
      }
    };
    const hasLocalImages = propertyImages && Array.isArray(propertyImages) && propertyImages.length > 0;
    const hasDataImages = propertyData?.Images && Array.isArray(propertyData.Images) && propertyData.Images.length > 0;
    if (!hasLocalImages && !hasDataImages && !mlsImagesFetched && !isLoadingMlsImages) {
      fetchMlsImages();
    }
  }, [propertyData, propertyImages, mlsImagesFetched, isLoadingMlsImages]);
  const processImages = () => {
    let images2 = [];
    const dataImages = propertyData?.Images || propertyData?.images || propertyData?.ImageObjects;
    const imagesToProcess = propertyImages || dataImages || mlsImages || [];
    if (Array.isArray(imagesToProcess)) {
      images2 = imagesToProcess.filter((img) => {
        const url = typeof img === "string" ? img : img?.MediaURL || img?.url || img?.URL || img?.src || img?.MediaUrl;
        const isValid = url && url.trim() !== "" && url !== "undefined" && url !== "null";
        return isValid;
      }).map((img) => {
        let url = typeof img === "string" ? img : img?.MediaURL || img?.url || img?.URL || img?.src || img?.MediaUrl;
        if (url && typeof url === "string") {
          url = url.replace(/([^:]\/)\/+/g, "$1");
          if (!url.startsWith("http") && !url.startsWith("//")) {
            url = window.location.origin + (url.startsWith("/") ? "" : "/") + url;
          }
        }
        return url;
      });
    }
    if (images2.length <= 1) {
      const mainImage = propertyData?.mainImage || propertyData?.main_image || propertyData?.MediaURL;
      if (mainImage && !images2.includes(mainImage)) {
        images2.unshift(mainImage);
      }
    }
    const uniqueImages = [...new Set(images2)];
    if (uniqueImages.length === 0) {
      return [];
    }
    return uniqueImages;
  };
  const images = processImages();
  const openModal = (imageIndex = 0) => {
    if (images.length === 0) {
      console.log("🖼️ Cannot open modal - no images available");
      return;
    }
    const safeIndex = Math.max(0, Math.min(imageIndex, images.length - 1));
    setModalImageIndex(safeIndex);
    setShowModal(true);
    document.body.style.overflow = "hidden";
  };
  const closeModal = () => {
    setShowModal(false);
    document.body.style.overflow = "unset";
  };
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showModal]);
  const nextModalImage = () => {
    setModalImageIndex((prev) => (prev + 1) % images.length);
  };
  const prevModalImage = () => {
    setModalImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  const changeMobileSlide = (direction) => {
    if (direction === "next") {
      setCurrentMobileSlide((prev) => (prev + 1) % images.length);
    } else {
      setCurrentMobileSlide((prev) => (prev - 1 + images.length) % images.length);
    }
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
  const formatPrice = (price) => {
    if (!price || price === 0) return "$0";
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      maximumFractionDigits: 0
    }).format(price);
  };
  const getPropertyStatus = () => {
    const status = propertyData?.StandardStatus || propertyData?.standardStatus || propertyData?.MlsStatus || propertyData?.mlsStatus || propertyData?.status || "Active";
    if (status.toLowerCase().includes("sold") || propertyData?.ClosePrice || propertyData?.closePrice || propertyData?.soldPrice) {
      return "SOLD FOR";
    }
    const transactionType = propertyData?.TransactionType || propertyData?.transactionType || "";
    if (transactionType.toLowerCase().includes("lease")) {
      return "FOR LEASE";
    }
    if (transactionType.toLowerCase().includes("rent")) {
      return "FOR RENT";
    }
    return "FOR SALE";
  };
  const getDisplayPrice = () => {
    const status = getPropertyStatus();
    if (status === "SOLD FOR") {
      if (propertyData?.ClosePrice) return formatPrice(propertyData.ClosePrice);
      if (propertyData?.closePrice) return formatPrice(propertyData.closePrice);
      if (propertyData?.soldPrice) return formatPrice(propertyData.soldPrice);
      if (propertyData?.soldFor) return propertyData.soldFor;
    }
    if (propertyData?.ListPrice) return formatPrice(propertyData.ListPrice);
    if (propertyData?.listPrice) return formatPrice(propertyData.listPrice);
    if (propertyData?.price) return formatPrice(propertyData.price);
    return "Price on request";
  };
  const handleImageError = (e, fallbackIndex = 0) => {
    console.log("🖼️ Image failed to load:", e.target.src);
    e.target.style.display = "none";
    e.target.onerror = null;
    console.log("🖼️ Hidden broken image:", e.target.src);
  };
  const isLoggedIn = auth?.user ? true : false;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "max-w-[1280px] mx-auto px-0 py-0", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row gap-0 md:gap-[17px]", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex gap-0 md:gap-[17px] flex-1 order-1 lg:order-none relative", children: [
        /* @__PURE__ */ jsx("div", { className: "hidden lg:block relative w-[619px] h-[645px] flex-shrink-0", children: images.length > 0 ? /* @__PURE__ */ jsxs(
          "div",
          {
            className: "relative w-full h-full rounded-xl overflow-hidden cursor-pointer group",
            onClick: () => isLoggedIn && openModal(0),
            children: [
              /* @__PURE__ */ jsx(
                "img",
                {
                  src: images[0],
                  alt: "Main property image",
                  className: `w-full h-full object-cover object-center transition-transform duration-300 ${isLoggedIn ? "group-hover:scale-105" : "blur-lg"}`,
                  onError: handleImageError
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black bg-opacity-10" }),
              !isLoggedIn && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl p-6 max-w-sm mx-4 text-center shadow-2xl", children: [
                /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-[#293056] mb-2", children: "Sign in to view photos" }),
                /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-sm mb-4", children: "Create a free account to see all property images and details" }),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => onLoginClick && onLoginClick(),
                      className: "block w-full py-2.5 px-4 rounded-lg font-medium hover:opacity-90 transition-all",
                      style: { backgroundColor: buttonPrimaryBg, color: buttonPrimaryText },
                      children: "Sign In"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => onLoginClick && onLoginClick(),
                      className: "block w-full py-2.5 px-4 border rounded-lg font-medium hover:bg-gray-50 transition-colors",
                      style: { backgroundColor: buttonQuaternaryBg, color: buttonQuaternaryText, borderColor: buttonQuaternaryText },
                      children: "Create Account"
                    }
                  )
                ] })
              ] }) })
            ]
          }
        ) : /* @__PURE__ */ jsx("div", { className: "relative w-full h-full rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center text-gray-500", children: [
          /* @__PURE__ */ jsx("svg", { className: "w-16 h-16 mx-auto mb-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1, d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" }) }),
          /* @__PURE__ */ jsx("p", { className: "text-sm", children: "No images available" })
        ] }) }) }),
        /* @__PURE__ */ jsxs("div", { className: "hidden md:flex lg:flex justify-between flex-col w-full md:flex-1 md:min-w-0 lg:flex-none lg:w-[318px] h-auto md:h-[645px] gap-2 md:gap-0", children: [
          /* @__PURE__ */ jsx("div", { className: "relative w-full lg:w-[318px] h-[200px] md:h-[310px]", children: images.length > 0 ? /* @__PURE__ */ jsxs(
            "div",
            {
              className: "relative w-full h-full rounded-xl overflow-hidden cursor-pointer group",
              onClick: () => isLoggedIn && openModal(1),
              children: [
                /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: images[1] || images[0],
                    alt: "Property image 2",
                    className: `w-full h-full object-cover object-center transition-transform duration-300 ${isLoggedIn ? "group-hover:scale-105" : "blur-lg"}`,
                    onError: (e) => handleImageError(e, 1)
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black bg-opacity-20" }),
                !isLoggedIn && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm", children: /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => onLoginClick && onLoginClick(),
                    className: "px-4 py-2 bg-white/90 backdrop-blur text-[#293056] rounded-lg font-medium hover:bg-white transition-colors text-sm",
                    children: "Sign In"
                  }
                ) })
              ]
            }
          ) : /* @__PURE__ */ jsx("div", { className: "relative w-full h-full rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center text-gray-500", children: [
            /* @__PURE__ */ jsx("svg", { className: "w-12 h-12 mx-auto mb-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1, d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" }) }),
            /* @__PURE__ */ jsx("p", { className: "text-sm", children: "No images available" })
          ] }) }) }),
          /* @__PURE__ */ jsx("div", { className: "relative w-full lg:w-[318px] h-[200px] md:h-[310px]", children: images.length > 0 ? /* @__PURE__ */ jsxs(
            "div",
            {
              className: "relative w-full h-full rounded-xl overflow-hidden cursor-pointer group",
              onClick: () => isLoggedIn && openModal(2),
              children: [
                /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: images[2] || images[1] || images[0],
                    alt: "Property image 3",
                    className: `w-full h-full object-cover object-center transition-transform duration-300 ${isLoggedIn ? "group-hover:scale-105" : "blur-lg"}`,
                    onError: handleImageError
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black bg-opacity-20" }),
                !isLoggedIn && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm", children: /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => onLoginClick && onLoginClick(),
                    className: "px-4 py-2 bg-white/90 backdrop-blur text-[#293056] rounded-lg font-medium hover:bg-white transition-colors text-sm",
                    children: "Create Account"
                  }
                ) }),
                isLoggedIn && images.length > 3 && /* @__PURE__ */ jsx("div", { className: "hidden md:block absolute bottom-4 right-4", children: /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      openModal(0);
                    },
                    className: "flex justify-center items-center w-[129px] h-10 rounded-xl font-work-sans font-bold text-sm hover:opacity-90 transition-opacity",
                    style: { backgroundColor: buttonTertiaryBg, color: buttonTertiaryText },
                    children: "See all photos"
                  }
                ) })
              ]
            }
          ) : /* @__PURE__ */ jsx("div", { className: "relative w-full h-full rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center text-gray-500", children: [
            /* @__PURE__ */ jsx("svg", { className: "w-12 h-12 mx-auto mb-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1, d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" }) }),
            /* @__PURE__ */ jsx("p", { className: "text-sm", children: "No images available" })
          ] }) }) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "lg:hidden relative w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden", children: /* @__PURE__ */ jsxs("div", { className: "relative w-full h-full", children: [
          images.length > 0 ? images.map((image, index) => /* @__PURE__ */ jsx(
            "div",
            {
              className: `absolute inset-0 transition-opacity duration-300 ${index === currentMobileSlide ? "opacity-100" : "opacity-0"}`,
              children: /* @__PURE__ */ jsx(
                "img",
                {
                  src: image,
                  alt: `Property image ${index + 1}`,
                  className: `w-full h-full object-cover object-center ${!isLoggedIn ? "blur-lg" : ""}`,
                  onError: (e) => handleImageError(e, index)
                }
              )
            },
            index
          )) : /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gray-100 flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center text-gray-500", children: [
            /* @__PURE__ */ jsx("svg", { className: "w-12 h-12 mx-auto mb-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1, d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" }) }),
            /* @__PURE__ */ jsx("p", { className: "text-xs", children: "No images available" })
          ] }) }),
          !isLoggedIn && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl p-5 max-w-xs mx-4 text-center shadow-2xl", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-[#293056] mb-2", children: "Sign in to view photos" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs mb-3", children: "Create a free account to see all property images" }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => onLoginClick && onLoginClick(),
                  className: "block w-full py-2 px-3 rounded-lg font-medium text-sm hover:opacity-90 transition-all",
                  style: { backgroundColor: buttonPrimaryBg, color: buttonPrimaryText },
                  children: "Sign In"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => onLoginClick && onLoginClick(),
                  className: "block w-full py-2 px-3 border rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors",
                  style: { backgroundColor: buttonQuaternaryBg, color: buttonQuaternaryText, borderColor: buttonQuaternaryText },
                  children: "Create Account"
                }
              )
            ] })
          ] }) }),
          isLoggedIn && images.length > 1 && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => changeMobileSlide("prev"),
                className: "absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-all duration-300 z-20",
                children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-5 h-5 md:w-6 md:h-6" })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => changeMobileSlide("next"),
                className: "absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-all duration-300 z-20",
                children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-5 h-5 md:w-6 md:h-6" })
              }
            )
          ] }),
          isLoggedIn && images.length > 0 && /* @__PURE__ */ jsxs("div", { className: "absolute bottom-3 md:bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-xs md:text-sm font-medium z-20", children: [
            currentMobileSlide + 1,
            " / ",
            images.length
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "w-full md:w-[309px] h-auto lg:h-[645px] bg-white border border-gray-200 rounded-xl flex-shrink-0 order-2 lg:order-none mt-[70px] md:mt-0", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-between p-4 md:p-6 h-full min-h-[500px] lg:min-h-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6 md:gap-8 lg:gap-10 mb-[30px] md:mb-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 items-center", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center w-full", children: [
              /* @__PURE__ */ jsx("span", { className: "font-space-grotesk font-bold text-xl md:text-2xl leading-7 md:leading-[34px] uppercase text-[#93370D]", children: getPropertyStatus() }),
              /* @__PURE__ */ jsx("span", { className: "font-space-grotesk font-bold text-xl md:text-2xl leading-7 md:leading-[34px] uppercase text-[#93370D]", children: getDisplayPrice() })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "font-work-sans font-medium text-sm text-[#535862] text-center", children: (() => {
              const status = getPropertyStatus();
              if (status === "SOLD FOR") {
                const originalPrice = propertyData?.OriginalListPrice || propertyData?.originalListPrice || propertyData?.ListPrice || propertyData?.listPrice;
                return originalPrice ? `Listed for ${formatPrice(originalPrice)}` : "";
              } else if (status === "FOR RENT" || status === "FOR LEASE") {
                return propertyData?.LeaseTerm ? `${propertyData.LeaseTerm} lease` : "Available now";
              } else {
                let daysOnMarket;
                const listingDateStr = propertyData?.ListingContractDate || propertyData?.listingContractDate || propertyData?.OriginalEntryTimestamp || propertyData?.originalEntryTimestamp;
                if (listingDateStr) {
                  const listingDate = new Date(listingDateStr);
                  const today = /* @__PURE__ */ new Date();
                  if (!isNaN(listingDate.getTime()) && !isNaN(today.getTime())) {
                    const diffTime = today.getTime() - listingDate.getTime();
                    daysOnMarket = Math.floor(diffTime / (1e3 * 60 * 60 * 24));
                    daysOnMarket = Math.max(0, daysOnMarket);
                  }
                }
                if (!daysOnMarket && daysOnMarket !== 0) {
                  daysOnMarket = propertyData?.DaysOnMarket || propertyData?.daysOnMarket;
                }
                if (daysOnMarket === 0) {
                  return "New listing - Listed today";
                } else if (daysOnMarket === 1) {
                  return "1 day on market";
                } else if (daysOnMarket > 0) {
                  return `${daysOnMarket} days on market`;
                } else {
                  return "New listing";
                }
              }
            })() }),
            /* @__PURE__ */ jsx("div", { className: "w-full h-px border-t border-[#D5D7DA]" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 md:gap-6", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-red-hat font-bold text-lg md:text-xl text-[#252B37]", children: "Properties detail" }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 md:gap-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center gap-3 w-full", children: [
                /* @__PURE__ */ jsx("span", { className: "font-work-sans font-normal text-sm md:text-base leading-5 md:leading-[25px] text-[#252B37] tracking-tight capitalize break-words", children: "Type" }),
                /* @__PURE__ */ jsx("span", { className: "font-work-sans font-normal text-sm md:text-base leading-5 md:leading-[25px] text-[#252B37] tracking-tight text-right break-words", children: propertyData?.details?.type || propertyData?.propertyType || propertyData?.propertySubType || "N/A" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center gap-3 w-full", children: [
                /* @__PURE__ */ jsx("span", { className: "font-work-sans font-normal text-sm md:text-base leading-5 md:leading-[25px] text-[#252B37] tracking-tight capitalize break-words", children: "Beds" }),
                /* @__PURE__ */ jsx("span", { className: "font-work-sans font-normal text-sm md:text-base leading-5 md:leading-[25px] text-[#252B37] tracking-tight text-right break-words", children: propertyData?.details?.beds || propertyData?.bedrooms || propertyData?.bedroomsTotal || "N/A" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center gap-3 w-full", children: [
                /* @__PURE__ */ jsx("span", { className: "font-work-sans font-normal text-sm md:text-base leading-5 md:leading-[25px] text-[#252B37] tracking-tight capitalize break-words", children: "Bathrooms" }),
                /* @__PURE__ */ jsx("span", { className: "font-work-sans font-normal text-sm md:text-base leading-5 md:leading-[25px] text-[#252B37] tracking-tight text-right break-words", children: propertyData?.details?.bathrooms || propertyData?.bathrooms || propertyData?.bathroomsTotal || "N/A" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center gap-3 w-full", children: [
                /* @__PURE__ */ jsx("span", { className: "font-work-sans font-normal text-sm md:text-base leading-5 md:leading-[25px] text-[#252B37] tracking-tight capitalize break-words", children: "Area" }),
                /* @__PURE__ */ jsx("span", { className: "font-work-sans font-normal text-sm md:text-base leading-5 md:leading-[25px] text-[#252B37] tracking-tight text-right break-words", children: (() => {
                  const livingArea = propertyData?.LivingAreaRange || propertyData?.livingAreaRange || propertyData?.LivingArea || propertyData?.livingArea || propertyData?.AboveGradeFinishedArea || propertyData?.aboveGradeFinishedArea || propertyData?.BuildingAreaTotal || propertyData?.buildingAreaTotal || propertyData?.GrossFloorArea || propertyData?.grossFloorArea || propertyData?.details?.area;
                  if (livingArea) {
                    if (typeof livingArea === "string" && livingArea.includes("-")) {
                      return `${livingArea} sqft`;
                    } else if (livingArea) {
                      const value = livingArea.toString().replace(/[^0-9\-]/g, "");
                      if (value) {
                        return `${value} sqft`;
                      }
                    }
                  }
                  return "N/A";
                })() })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center gap-3 w-full", children: [
                /* @__PURE__ */ jsx("span", { className: "font-work-sans font-normal text-sm md:text-base leading-5 md:leading-[25px] text-[#252B37] tracking-tight capitalize break-words", children: "Parking" }),
                /* @__PURE__ */ jsx("span", { className: "font-work-sans font-normal text-sm md:text-base leading-5 md:leading-[25px] text-[#252B37] tracking-tight text-right break-words", children: (() => {
                  const parkingTotal = propertyData?.ParkingTotal || propertyData?.parkingTotal || propertyData?.ParkingSpaces || propertyData?.parkingSpaces || propertyData?.GarageSpaces || propertyData?.garageSpaces || propertyData?.details?.parking;
                  if (typeof parkingTotal === "number") {
                    return parkingTotal === 0 ? "0" : parkingTotal.toString();
                  } else if (typeof parkingTotal === "string" && !isNaN(parseInt(parkingTotal))) {
                    const parkingNum = parseInt(parkingTotal);
                    return parkingNum === 0 ? "0" : parkingNum.toString();
                  } else if (propertyData?.ParkingFeatures && Array.isArray(propertyData.ParkingFeatures)) {
                    return propertyData.ParkingFeatures.includes("None") ? "0" : "Yes";
                  } else if (propertyData?.ParkingType1 || propertyData?.parkingType1) {
                    const type = propertyData.ParkingType1 || propertyData.parkingType1;
                    return type.toLowerCase() === "none" ? "0" : "Yes";
                  }
                  return "0";
                })() })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center gap-3 w-full", children: [
                /* @__PURE__ */ jsx("span", { className: "font-work-sans font-normal text-sm md:text-base leading-5 md:leading-[25px] text-[#252B37] tracking-tight capitalize break-words", children: "Maintenance Fees" }),
                /* @__PURE__ */ jsx("span", { className: "font-work-sans font-normal text-sm md:text-base leading-5 md:leading-[25px] text-[#252B37] tracking-tight text-right break-words", children: (() => {
                  const fee = propertyData?.AssociationFee || propertyData?.associationFee || propertyData?.details?.maintenanceFees;
                  if (fee && fee !== "N/A") {
                    if (typeof fee === "string" && (fee.includes("$") || fee.includes("CAD"))) {
                      return fee;
                    } else if (fee && parseFloat(fee) > 0) {
                      return formatPrice(parseFloat(fee));
                    }
                  }
                  return "N/A";
                })() })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center gap-3 w-full", children: [
                /* @__PURE__ */ jsx("span", { className: "font-work-sans font-normal text-sm md:text-base leading-5 md:leading-[25px] text-[#252B37] tracking-tight capitalize break-words", children: "Property Taxes" }),
                /* @__PURE__ */ jsx("span", { className: "font-work-sans font-normal text-sm md:text-base leading-5 md:leading-[25px] text-[#252B37] tracking-tight text-right break-words", children: (() => {
                  const taxes = propertyData?.TaxTotalAnnual || propertyData?.taxTotalAnnual || propertyData?.TaxAnnualAmount || propertyData?.taxAnnualAmount || propertyData?.PropertyTaxes || propertyData?.propertyTaxes || propertyData?.Tax || propertyData?.tax || propertyData?.details?.propertyTaxes;
                  if (taxes && taxes !== "N/A") {
                    if (typeof taxes === "string" && (taxes.includes("$") || taxes.includes("CAD"))) {
                      return taxes;
                    } else if (taxes && parseFloat(taxes) > 0) {
                      return formatPrice(parseFloat(taxes));
                    }
                  }
                  return "N/A";
                })() })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center gap-3 w-full", children: [
                /* @__PURE__ */ jsx("span", { className: "font-work-sans font-normal text-sm md:text-base leading-5 md:leading-[25px] text-[#252B37] tracking-tight capitalize break-words", children: "Exposure" }),
                /* @__PURE__ */ jsx("span", { className: "font-work-sans font-normal text-sm md:text-base leading-5 md:leading-[25px] text-[#252B37] tracking-tight text-right break-words", children: (() => {
                  const exposure = propertyData?.DirectionFaces || propertyData?.directionFaces || propertyData?.Exposure || propertyData?.exposure || propertyData?.FrontingOnNSEW || propertyData?.frontingOnNSEW || propertyData?.Direction || propertyData?.direction || propertyData?.details?.exposure;
                  if (exposure && exposure !== "N/A") {
                    if (typeof exposure === "string") {
                      return exposure.charAt(0).toUpperCase() + exposure.slice(1);
                    }
                    return exposure;
                  }
                  return "N/A";
                })() })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "rounded-full h-12 md:h-10 flex items-center justify-center w-full", style: { backgroundColor: buttonTertiaryBg }, children: /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setShowEnquiryModal(true),
            className: "w-full h-full flex items-center justify-center hover:opacity-90 transition-opacity rounded-full",
            children: /* @__PURE__ */ jsx("span", { className: "font-work-sans font-extrabold text-sm md:text-base", style: { color: buttonTertiaryText }, children: "Enquire this Property" })
          }
        ) })
      ] }) })
    ] }) }),
    showModal && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-black bg-opacity-90 px-4 py-3 flex justify-between items-center border-b border-white border-opacity-10 flex-shrink-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-white flex flex-col gap-1", children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-sm", children: propertyData?.address || "Property Details" }),
          /* @__PURE__ */ jsxs("span", { className: "text-white text-opacity-70 text-xs", children: [
            "(",
            modalImageIndex + 1,
            " of ",
            images.length,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsx(
          "button",
          {
            onClick: closeModal,
            className: "text-white bg-white bg-opacity-10 border border-white border-opacity-20 rounded-md p-2 w-10 h-10 flex items-center justify-center hover:bg-opacity-20 transition-colors",
            children: /* @__PURE__ */ jsx(Close, { className: "w-5 h-5" })
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 flex items-center justify-center relative overflow-hidden min-h-0", children: [
        images.length > 1 && /* @__PURE__ */ jsx(
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
            children: images.map((image, index) => {
              return /* @__PURE__ */ jsx("div", { className: "min-w-full flex items-center justify-center p-4", children: /* @__PURE__ */ jsx(
                "img",
                {
                  src: image,
                  alt: `Property image ${index + 1}`,
                  onError: (e) => {
                    console.error("PropertyGallery - Failed to load modal image:", image);
                    e.target.style.display = "none";
                    e.target.onerror = null;
                  },
                  className: "max-w-full max-h-full object-contain"
                }
              ) }, index);
            })
          }
        ) }),
        images.length > 1 && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: nextModalImage,
            disabled: modalImageIndex === images.length - 1,
            className: "absolute right-3 z-10 bg-white bg-opacity-90 border-none rounded-full w-10 h-10 flex items-center justify-center cursor-pointer top-1/2 transform -translate-y-1/2 hover:bg-white hover:scale-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed",
            children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-5 h-5" })
          }
        )
      ] }),
      images.length > 1 && /* @__PURE__ */ jsx("div", { className: "flex gap-2 px-4 py-3 bg-black bg-opacity-90 border-t border-white border-opacity-10 overflow-x-auto", children: images.map((image, index) => {
        return /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setModalImageIndex(index),
            className: `border-2 rounded-md overflow-hidden opacity-70 flex-shrink-0 transition-all hover:opacity-90 ${index === modalImageIndex ? "border-blue-500 opacity-100 scale-105" : "border-white border-opacity-20"}`,
            children: /* @__PURE__ */ jsx(
              "img",
              {
                src: image,
                alt: `Thumbnail ${index + 1}`,
                className: "w-20 h-15 object-cover block",
                onError: handleImageError
              }
            )
          },
          index
        );
      }) })
    ] }),
    /* @__PURE__ */ jsx(
      PropertyEnquiryModal,
      {
        isOpen: showEnquiryModal,
        onClose: () => setShowEnquiryModal(false),
        propertyData,
        auth
      }
    )
  ] });
}
export {
  PropertyGallery as default
};
