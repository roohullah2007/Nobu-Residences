import { jsxs, jsx } from "react/jsx-runtime";
import "react";
const PropertyCardV4 = ({
  image,
  title,
  address,
  units,
  priceRange,
  onClick,
  className = "",
  transactionType = "Sale",
  // Sale/Rent
  price
  // Raw price value for proper formatting
}) => {
  const formatPrice = (priceValue) => {
    if (!priceValue || priceValue <= 0) return "Price on request";
    let formattedPrice = "";
    if (priceValue >= 1e6) {
      formattedPrice = "$" + (priceValue / 1e6).toFixed(1) + "M";
    } else if (priceValue >= 1e3) {
      formattedPrice = "$" + Math.round(priceValue / 1e3) + "K";
    } else {
      formattedPrice = "$" + priceValue.toLocaleString();
    }
    return formattedPrice;
  };
  const displayPrice = price ? formatPrice(price) : priceRange;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `bg-white mb-1 border shadow-lg border-gray-200 rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer ${className}`,
      onClick,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: image,
              alt: title,
              className: "w-full h-[200px] object-cover",
              onError: (e) => {
                e.target.src = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop&auto=format&q=80";
              }
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "absolute inset-2 flex flex-col justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center gap-2.5 h-8", children: [
              /* @__PURE__ */ jsx("span", { className: "flex items-center justify-center px-4 py-1.5 text-sm h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm bg-white text-[#293056] border border-gray-200", children: transactionType }),
              /* @__PURE__ */ jsx("span", { className: "flex items-center justify-center px-4 py-1.5 text-sm h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm ml-auto bg-white text-[#293056] border border-gray-200", children: displayPrice })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex justify-end items-center gap-2.5 h-8", children: /* @__PURE__ */ jsx(
              "button",
              {
                onClick: (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Request clicked for:", title);
                },
                className: "flex items-center justify-center px-4 py-1.5 text-sm h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm bg-white text-[#293056] border border-gray-200 hover:bg-gray-50 transition-colors duration-200",
                "aria-label": `Request viewing for ${title}`,
                children: "Request"
              }
            ) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-[18px] font-semibold text-[#263238] mb-2 leading-tight", children: title }),
          /* @__PURE__ */ jsx("p", { className: "text-[14px] text-gray-600 mb-3 leading-relaxed", children: address }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[14px] text-gray-500", children: units }),
            /* @__PURE__ */ jsx("span", { className: "text-[16px] font-bold text-[#263238]", children: displayPrice })
          ] })
        ] })
      ]
    }
  );
};
export {
  PropertyCardV4 as default
};
