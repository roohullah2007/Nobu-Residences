import { jsx, jsxs } from "react/jsx-runtime";
import "react";
import { Link } from "@inertiajs/react";
const CategoryCard = ({
  title,
  backgroundImage,
  link = "#",
  className = ""
}) => {
  return /* @__PURE__ */ jsx(
    Link,
    {
      href: link,
      className: `
                group relative block w-full h-[397px] rounded-xl overflow-hidden
                bg-gradient-to-b from-transparent to-black/20
                hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1
                ${className}
            `,
      style: {
        backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      },
      children: /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 right-0 p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-white font-bold text-4xl leading-[50px] tracking-[-0.03em] font-['Space_Grotesk'] max-w-[204px]", children: title }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-16 h-16 transform scale-x-[-1] group-hover:scale-x-[-1.1] transition-transform duration-300", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-14 h-14 bg-[#93370D] rounded-full transform scale-x-[-1]", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-10 h-10 transform scale-x-[-1]", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-6 h-6 rounded-full transform scale-x-[-1]", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-end w-8 h-8 rounded-full transform scale-x-[-1]", children: /* @__PURE__ */ jsx(
          "svg",
          {
            width: "24",
            height: "24",
            viewBox: "0 0 24 24",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg",
            className: "text-white transform scale-x-[-1]",
            children: /* @__PURE__ */ jsx(
              "path",
              {
                d: "M9 18l6-6-6-6",
                stroke: "currentColor",
                strokeWidth: "2",
                strokeLinecap: "round",
                strokeLinejoin: "round"
              }
            )
          }
        ) }) }) }) }) })
      ] }) })
    }
  );
};
export {
  CategoryCard as default
};
