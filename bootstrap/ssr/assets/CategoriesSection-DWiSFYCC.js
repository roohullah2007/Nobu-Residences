import { jsx, jsxs } from "react/jsx-runtime";
import "react";
import { Link } from "@inertiajs/react";
const CategoriesSection = ({ categories = [] }) => {
  const defaultCategories = [
    {
      id: 1,
      name: "Houses",
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=400&fit=crop",
      link: "/search?property_type=House"
    },
    {
      id: 2,
      name: "Condos",
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=400&fit=crop",
      link: "/search?property_type=Condo"
    },
    {
      id: 3,
      name: "Townhomes",
      image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=400&fit=crop",
      link: "/search?property_type=Townhouse"
    }
  ];
  const displayCategories = categories.length > 0 ? categories : defaultCategories;
  return /* @__PURE__ */ jsx("section", { className: "py-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-[1280px] mx-auto px-4 md:px-0", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-row justify-between items-center mb-8 md:mb-12 h-[50px]", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-space-grotesk font-bold text-[32px] md:text-[40px] leading-[40px] md:leading-[50px] tracking-[-0.03em] text-[#293056]", children: "Categories" }),
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: "/search",
          className: "flex flex-row items-center gap-4 group",
          children: [
            /* @__PURE__ */ jsx("span", { className: "font-work-sans font-bold text-lg leading-[27px] tracking-[-0.03em] text-[#293056] group-hover:text-[#293056]/80 transition-colors", children: "View All" }),
            /* @__PURE__ */ jsx(
              "svg",
              {
                className: "w-6 h-6",
                fill: "none",
                viewBox: "0 0 24 24",
                children: /* @__PURE__ */ jsx(
                  "path",
                  {
                    d: "M5 12H19M19 12L12 5M19 12L12 19",
                    stroke: "#293056",
                    strokeWidth: "2",
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    className: "group-hover:translate-x-1 transition-transform"
                  }
                )
              }
            )
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8", children: displayCategories.slice(0, 3).map((category) => /* @__PURE__ */ jsx(CategoryCard, { category }, category.id)) })
  ] }) });
};
const CategoryCard = ({ category }) => {
  return /* @__PURE__ */ jsxs(
    Link,
    {
      href: category.link,
      className: "group relative block w-full h-[397px] rounded-xl p-6 overflow-hidden bg-cover bg-center transition-transform hover:scale-[1.02]",
      style: {
        backgroundImage: `url(${category.image})`
      },
      children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-xl" }),
        /* @__PURE__ */ jsx("div", { className: "relative h-full flex flex-col justify-end", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-space-grotesk font-bold text-[40px] leading-[50px] tracking-[-0.03em] text-white", children: category.name }),
          /* @__PURE__ */ jsx("div", { className: "w-14 h-14 rounded-full bg-[#93370D] flex items-center justify-center", children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", children: /* @__PURE__ */ jsx("path", { d: "M4 11H16.17L10.58 5.41L12 4L20 12L12 20L10.59 18.59L16.17 13H4V11Z", fill: "white" }) }) })
        ] }) })
      ]
    }
  );
};
export {
  CategoriesSection as default
};
