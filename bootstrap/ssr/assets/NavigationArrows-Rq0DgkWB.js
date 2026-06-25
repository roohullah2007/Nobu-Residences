import { jsx, jsxs } from "react/jsx-runtime";
import "react";
const ArrowButton = ({ direction = "left", onClick, className = "" }) => {
  const isLeft = direction === "left";
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick,
      className: `
                flex flex-row justify-end items-center
                p-1 w-8 h-8 rounded-full
                bg-white hover:bg-gray-100 transition-colors
                ${isLeft ? "-scale-x-100" : ""}
                ${className}
            `,
      "aria-label": `Navigate ${direction}`,
      children: /* @__PURE__ */ jsx(
        "svg",
        {
          className: `w-6 h-6 ${isLeft ? "-scale-x-100" : ""}`,
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          children: /* @__PURE__ */ jsx(
            "path",
            {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M9 5l7 7-7 7"
            }
          )
        }
      )
    }
  );
};
const NavigationArrows = ({ onPrev, onNext, className = "" }) => {
  return /* @__PURE__ */ jsxs("div", { className: `flex gap-2.5 ${className}`, children: [
    /* @__PURE__ */ jsx(ArrowButton, { direction: "left", onClick: onPrev }),
    /* @__PURE__ */ jsx(ArrowButton, { direction: "right", onClick: onNext })
  ] });
};
export {
  ArrowButton,
  NavigationArrows,
  NavigationArrows as default
};
