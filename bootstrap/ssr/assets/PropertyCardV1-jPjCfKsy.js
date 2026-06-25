import { jsx, jsxs } from "react/jsx-runtime";
import "react";
const PropertyCardV1 = ({
  property,
  size = "default",
  onClick,
  className = ""
}) => {
  const formatPrice = (price, isRental = false) => {
    if (!price || price <= 0) return "Price on request";
    let formattedPrice2 = "";
    if (price >= 1e6) {
      formattedPrice2 = "$" + (price / 1e6).toFixed(1) + "M";
    } else if (price >= 1e3) {
      formattedPrice2 = "$" + Math.round(price / 1e3) + "K";
    } else {
      formattedPrice2 = "$" + price.toLocaleString();
    }
    if (isRental) {
      formattedPrice2 += "/mo";
    }
    return formattedPrice2;
  };
  const buildFeatures = (bedrooms, bathrooms) => {
    const features2 = [];
    if (bedrooms > 0) {
      features2.push(bedrooms + " Bed" + (bedrooms > 1 ? "s" : ""));
    }
    if (bathrooms > 0) {
      features2.push(bathrooms + " Bath" + (bathrooms > 1 ? "s" : ""));
    }
    return features2.join(" | ");
  };
  const formattedPrice = formatPrice(property.price, property.isRental);
  const features = buildFeatures(property.bedrooms, property.bathrooms);
  const detailsUrl = `/property/${property.listingKey}`;
  const sizeConfig = {
    default: {
      container: "w-[360px] h-[470px]",
      image: "h-[275px]",
      content: "p-4 gap-2.5 h-[195px]",
      chip: "px-4 py-1.5 text-sm",
      title: "text-lg",
      details: "text-base"
    },
    mobile: {
      container: "w-80 h-[420px]",
      image: "h-60",
      content: "p-3 gap-2 h-40",
      chip: "px-2 py-1 text-xs",
      title: "text-lg",
      details: "text-sm"
    }
  };
  const config = sizeConfig[size];
  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick(property);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: `flex-none ${config.container} bg-white shadow-lg rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl group ${className}`, children: /* @__PURE__ */ jsxs(
    "a",
    {
      href: detailsUrl,
      className: "block h-full text-inherit no-underline",
      onClick: handleClick,
      children: [
        /* @__PURE__ */ jsxs("div", { className: `relative w-full ${config.image} overflow-hidden bg-gray-100 rounded-t-xl`, children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: property.image,
              alt: `${property.propertyType} in ${property.address}`,
              className: "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105",
              loading: "lazy",
              onError: (e) => {
                e.target.src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80";
              }
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "absolute top-2 left-2 right-2 flex justify-between items-center gap-2.5 h-8", children: [
            /* @__PURE__ */ jsx("span", { className: `flex items-center justify-center ${config.chip} h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm bg-white text-[#293056] border border-gray-200`, children: "Sale" }),
            /* @__PURE__ */ jsx("span", { className: `flex items-center justify-center ${config.chip} h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm ml-auto bg-white text-[#293056] border border-gray-200`, children: formattedPrice })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: `flex flex-col items-start ${config.content} box-border`, children: [
          /* @__PURE__ */ jsx("div", { className: `flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-bold ${config.title} leading-7 tracking-tight text-[#293056]`, children: property.propertyType }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start gap-2 w-full flex-1", children: [
            /* @__PURE__ */ jsx("div", { className: `flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal ${config.details} leading-6 tracking-tight text-[#293056]`, children: property.address }),
            features && /* @__PURE__ */ jsx("div", { className: `flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal ${config.details} leading-6 tracking-tight text-[#293056]`, children: features }),
            /* @__PURE__ */ jsxs("div", { className: `flex items-center justify-start w-full min-h-8 font-work-sans font-normal ${config.details} leading-6 tracking-tight text-[#293056]`, children: [
              "MLS#: ",
              property.listingKey
            ] })
          ] })
        ] })
      ]
    }
  ) });
};
export {
  PropertyCardV1 as default
};
