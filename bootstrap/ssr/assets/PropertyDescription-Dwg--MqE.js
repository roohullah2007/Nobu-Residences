import { jsx, jsxs } from "react/jsx-runtime";
import "react";
const PropertyDescription = ({ propertyData }) => {
  const defaultDescription = `This stunning 2+1 bedroom, 2 bathroom condo offers modern urban living in the heart of downtown Toronto. 
  
Located in the prestigious NO55 Mercer building, this unit features floor-to-ceiling windows with north-facing exposure, providing abundant natural light throughout the day.

The open-concept layout seamlessly connects the living, dining, and kitchen areas, perfect for both entertaining and everyday living. The modern kitchen boasts stainless steel appliances, quartz countertops, and ample storage space.

The master bedroom includes an ensuite bathroom and walk-in closet, while the second bedroom offers flexibility as a guest room or home office. The additional den space can serve as a study or children's play area.

Building amenities include a 24-hour concierge, fitness center, rooftop terrace with stunning city views, and guest suites. The location offers unparalleled access to Toronto's best dining, shopping, and entertainment options.

With easy access to public transportation and major highways, this property represents the perfect blend of luxury, convenience, and urban lifestyle.`;
  const description = propertyData?.description || defaultDescription;
  return /* @__PURE__ */ jsx("section", { className: "py-8 bg-white", children: /* @__PURE__ */ jsxs("div", { className: "max-w-[1280px] mx-auto px-4", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-6", children: "Property Description" }),
    /* @__PURE__ */ jsx("div", { className: "prose max-w-none", children: /* @__PURE__ */ jsx("div", { className: "text-gray-700 leading-relaxed whitespace-pre-line", children: description }) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-8 grid grid-cols-1 md:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 rounded-lg p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 mb-4", children: "Key Features" }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-gray-700", children: [
          /* @__PURE__ */ jsxs("li", { className: "flex items-center", children: [
            /* @__PURE__ */ jsx("span", { className: "w-2 h-2 bg-gray-400 rounded-full mr-3" }),
            "Floor-to-ceiling windows"
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-center", children: [
            /* @__PURE__ */ jsx("span", { className: "w-2 h-2 bg-gray-400 rounded-full mr-3" }),
            "Modern kitchen with quartz countertops"
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-center", children: [
            /* @__PURE__ */ jsx("span", { className: "w-2 h-2 bg-gray-400 rounded-full mr-3" }),
            "In-unit laundry"
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-center", children: [
            /* @__PURE__ */ jsx("span", { className: "w-2 h-2 bg-gray-400 rounded-full mr-3" }),
            "Private balcony"
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-center", children: [
            /* @__PURE__ */ jsx("span", { className: "w-2 h-2 bg-gray-400 rounded-full mr-3" }),
            "Hardwood flooring"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 rounded-lg p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 mb-4", children: "Building Amenities" }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-gray-700", children: [
          /* @__PURE__ */ jsxs("li", { className: "flex items-center", children: [
            /* @__PURE__ */ jsx("span", { className: "w-2 h-2 bg-gray-400 rounded-full mr-3" }),
            "24-hour concierge"
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-center", children: [
            /* @__PURE__ */ jsx("span", { className: "w-2 h-2 bg-gray-400 rounded-full mr-3" }),
            "Fitness center"
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-center", children: [
            /* @__PURE__ */ jsx("span", { className: "w-2 h-2 bg-gray-400 rounded-full mr-3" }),
            "Rooftop terrace"
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-center", children: [
            /* @__PURE__ */ jsx("span", { className: "w-2 h-2 bg-gray-400 rounded-full mr-3" }),
            "Guest suites"
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-center", children: [
            /* @__PURE__ */ jsx("span", { className: "w-2 h-2 bg-gray-400 rounded-full mr-3" }),
            "Underground parking"
          ] })
        ] })
      ] })
    ] })
  ] }) });
};
export {
  PropertyDescription as default
};
