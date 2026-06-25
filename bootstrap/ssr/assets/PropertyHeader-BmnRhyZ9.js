import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { Share, Heart } from "./PropertyDetailIcons-3huqvWqW.js";
import { f as formatCardAddress } from "./propertyFormatters-B0QibXFa.js";
function PropertyHeader({ propertyData, isFavorited, onToggleFavorite }) {
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const displayTitle = formatCardAddress(propertyData);
  const handleShare = (platform) => {
    const currentUrl = window.location.href;
    const propertyTitle = displayTitle || "Property Details";
    const propertySubtitle = propertyData?.subtitle || "";
    const shareText = `Check out this property: ${propertyTitle}${propertySubtitle ? " - " + propertySubtitle : ""}`;
    switch (platform) {
      case "Facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, "_blank");
        break;
      case "Twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`, "_blank");
        break;
      case "Email":
        const emailSubject = encodeURIComponent(`Property Listing: ${propertyTitle}`);
        const emailBody = encodeURIComponent(`Hi,

I thought you might be interested in this property:

${shareText}

View details: ${currentUrl}

Best regards`);
        window.location.href = `mailto:?subject=${emailSubject}&body=${emailBody}`;
        break;
      case "Copy Link":
        navigator.clipboard.writeText(currentUrl).then(() => {
          alert("Link copied to clipboard!");
        }).catch(() => {
          const textArea = document.createElement("textarea");
          textArea.value = currentUrl;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
          alert("Link copied to clipboard!");
        });
        break;
      default:
        console.log(`Sharing to ${platform}`);
    }
    setShowShareDropdown(false);
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "bg-white", children: /* @__PURE__ */ jsx("div", { className: "max-w-[1280px] mx-auto md:px-0", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col-reverse md:flex-row justify-between items-start gap-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1 pr-5", children: [
        /* @__PURE__ */ jsx("h1", { className: "font-space-grotesk font-bold text-[40px] leading-[50px] text-[#293056] tracking-tight mb-3", children: displayTitle }),
        /* @__PURE__ */ jsx("div", { className: "font-work-sans font-medium text-lg leading-[27px] text-[#293056] tracking-tight underline", children: propertyData.subtitle })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex w-full md:w-auto justify-between md:justify-start items-center gap-3 flex-shrink-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setShowShareDropdown(!showShareDropdown),
              className: "flex justify-center items-center px-6 h-[33px] min-w-[95px] bg-white border border-[#717680] rounded-[10px] font-work-sans font-medium text-sm text-[#252B37] hover:bg-gray-50 transition-colors",
              children: "Share"
            }
          ),
          showShareDropdown && /* @__PURE__ */ jsx("div", { className: "absolute top-full left-0 md:left-auto md:right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px] z-50", children: /* @__PURE__ */ jsxs("div", { className: "py-1", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => handleShare("Facebook"),
                className: "flex items-center gap-3 px-4 py-3 hover:bg-gray-50 w-full text-left text-sm",
                children: [
                  /* @__PURE__ */ jsx(Share, { className: "w-4 h-4" }),
                  "Facebook"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => handleShare("Twitter"),
                className: "flex items-center gap-3 px-4 py-3 hover:bg-gray-50 w-full text-left text-sm",
                children: [
                  /* @__PURE__ */ jsx(Share, { className: "w-4 h-4" }),
                  "Twitter"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => handleShare("Email"),
                className: "flex items-center gap-3 px-4 py-3 hover:bg-gray-50 w-full text-left text-sm",
                children: [
                  /* @__PURE__ */ jsx(Share, { className: "w-4 h-4" }),
                  "Email"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => handleShare("Copy Link"),
                className: "flex items-center gap-3 px-4 py-3 hover:bg-gray-50 w-full text-left text-sm",
                children: [
                  /* @__PURE__ */ jsx(Share, { className: "w-4 h-4" }),
                  "Copy Link"
                ]
              }
            )
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: onToggleFavorite,
            className: `flex justify-center items-center gap-2 px-6 h-[33px] min-w-[99px] border rounded-[10px] font-work-sans font-medium text-sm transition-colors ${isFavorited ? "bg-red-50 border-red-200 text-red-600" : "bg-white border-[#717680] text-[#252B37] hover:bg-gray-50"}`,
            children: [
              /* @__PURE__ */ jsx(Heart, { className: "w-[14px] h-4", filled: isFavorited }),
              isFavorited ? "Favorited" : "Favourite"
            ]
          }
        )
      ] })
    ] }) }) }),
    propertyData.soldFor && /* @__PURE__ */ jsx("div", { className: "md:hidden bg-white px-4 py-6", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start", children: [
      /* @__PURE__ */ jsx("div", { className: "font-work-sans font-bold text-lg text-[#8B4513]", children: "SOLD FOR" }),
      /* @__PURE__ */ jsx("div", { className: "font-space-grotesk font-bold text-2xl text-black", children: propertyData.soldFor })
    ] }) }),
    showShareDropdown && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 z-40",
        onClick: () => setShowShareDropdown(false)
      }
    )
  ] });
}
export {
  PropertyHeader as default
};
