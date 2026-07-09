import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
const FAQ = ({
  faqItems = null,
  title = "FAQs",
  className = "",
  containerClassName = "md:py-8 bg-white",
  showContainer = true,
  isAiGenerated = false,
  isAdmin = false
}) => {
  const faqs = Array.isArray(faqItems) ? faqItems : [];
  const [activeIndex, setActiveIndex] = useState(null);
  if (faqs.length === 0) {
    return null;
  }
  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };
  const handleKeyDown = (e, index) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleAccordion(index);
    }
  };
  const PlusIcon = ({ isRotated }) => /* @__PURE__ */ jsx(
    "svg",
    {
      className: `md:w-8 md:h-8 w-7 h-7 text-gray-400 transition-transform duration-200 ease-in-out flex-shrink-0 ml-auto ${isRotated ? "transform rotate-45 text-gray-500" : ""}`,
      fill: "none",
      stroke: "currentColor",
      viewBox: "0 0 24 24",
      children: /* @__PURE__ */ jsx(
        "path",
        {
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "2",
          d: "M12 6v6m0 0v6m0-6h6m-6 0H6"
        }
      )
    }
  );
  const FAQContent = () => /* @__PURE__ */ jsx("div", { className: `mx-auto max-w-[1280px] px-4 md:px-0 ${className}`, children: /* @__PURE__ */ jsxs("div", { className: "md:my-4 my-3 mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 md:mb-3 mb-2.5", children: [
      /* @__PURE__ */ jsx("h2", { className: "md:text-xl text-lg font-bold text-black leading-5 font-space-grotesk tracking-tight", children: title }),
      isAiGenerated && isAdmin && /* @__PURE__ */ jsxs("span", { className: "text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1", children: [
        /* @__PURE__ */ jsx("svg", { className: "w-3 h-3", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M13 10V3L4 14h7v7l9-11h-7z" }) }),
        "AI Generated"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-col md:gap-4 gap-3", children: faqs.map((faq, index) => {
      const isActive = activeIndex === index;
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: `bg-white border border-gray-300 rounded-lg overflow-hidden transition-shadow duration-200 hover:shadow-sm ${isActive ? "shadow-sm bg-gray-50" : ""}`,
          children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                className: `flex justify-between items-center w-full md:p-4 p-3.5 text-left text-gray-900 font-semibold md:text-base text-sm bg-transparent border-0 cursor-pointer transition-all duration-200 outline-none font-work-sans normal-case tracking-normal no-underline shadow-none rounded-none appearance-none hover:bg-gray-50 focus:outline-2 focus:outline-blue-500 focus:-outline-offset-2 focus:bg-gray-50 ${isActive ? "bg-gray-50 text-black" : ""}`,
                onClick: () => toggleAccordion(index),
                onKeyDown: (e) => handleKeyDown(e, index),
                "aria-expanded": isActive,
                "aria-controls": `accordion-${index}`,
                children: [
                  /* @__PURE__ */ jsx("span", { className: "flex-grow text-left mr-4 md:overflow-hidden md:text-ellipsis md:whitespace-nowrap md:max-w-[calc(100%-44px)]", children: faq.question }),
                  /* @__PURE__ */ jsx(PlusIcon, { isRotated: isActive })
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              "div",
              {
                id: `accordion-${index}`,
                className: `overflow-hidden transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) ${isActive ? "md:max-h-48 max-h-96" : "max-h-0"}`,
                role: "region",
                "aria-labelledby": `accordion-button-${index}`,
                children: /* @__PURE__ */ jsx("div", { className: "md:p-4 p-3.5 text-gray-600", children: /* @__PURE__ */ jsx("p", { className: "mb-0 leading-6 text-base font-normal", children: faq.answer }) })
              }
            )
          ]
        },
        faq.id || index
      );
    }) })
  ] }) });
  if (showContainer) {
    return /* @__PURE__ */ jsx("section", { className: containerClassName, children: /* @__PURE__ */ jsx(FAQContent, {}) });
  }
  return /* @__PURE__ */ jsx(FAQContent, {});
};
export {
  FAQ as default
};
