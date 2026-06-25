import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import "react";
import { Head, Link, router } from "@inertiajs/react";
import MainLayout from "./MainLayout-BQc-YZ7r.js";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import FAQ from "./FAQ-DwtK7V0z.js";
import RealEstateLinksSection from "./RealEstateLinksSection-rgnwZUht.js";
import FeaturedBlogsSection from "./FeaturedBlogsSection-CD3vxA0t.js";
import BlogCategoriesSection from "./BlogCategoriesSection-CVdeXS2c.js";
import "./Footer-BjazYOa4.js";
import "./ContactAgentModal-Bc8CTpfm.js";
import "./Navbar-DVqP4Fqr.js";
import "./LoginModal-C-0W-anf.js";
import "./GoogleLoginButton-wrwag0eM.js";
import "./PropertyDetailIcons-3huqvWqW.js";
import "@headlessui/react";
function Blog({ auth, siteName = "NobuResidence", siteUrl, year, website, blogs, categories: backendCategories, selectedCategory: selectedCategorySlug }) {
  const blogData = blogs?.data || [];
  const pagination = blogs || null;
  const categories = backendCategories || [];
  const selectedCategoryObj = categories.find((cat) => cat.slug === selectedCategorySlug);
  const filteredPosts = blogData;
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };
  const handlePageChange = (url) => {
    if (url) {
      router.visit(url, { preserveState: true });
    }
  };
  return /* @__PURE__ */ jsxs(MainLayout, { auth, website, children: [
    /* @__PURE__ */ jsx(Head, { title: "Real Estate Blog" }),
    /* @__PURE__ */ jsxs(
      "section",
      {
        className: "relative bg-cover bg-center bg-no-repeat flex items-center pt-20 md:pt-32 h-[280px] md:h-[441px]",
        style: {
          backgroundImage: "url(/assets/building.jpg)"
        },
        children: [
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" }),
          /* @__PURE__ */ jsx("div", { className: "relative z-10 w-full max-w-[1280px] mx-auto px-4 md:px-0", children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl text-left text-white", children: [
            /* @__PURE__ */ jsxs("h3", { className: "font-work-sans font-normal text-sm leading-6 -tracking-wider mb-4", children: [
              "/ Blog ",
              selectedCategoryObj && `/ ${selectedCategoryObj.name}`
            ] }),
            /* @__PURE__ */ jsx("h1", { className: "font-space-grotesk text-3xl md:text-4xl lg:text-5xl font-bold leading-tight", children: selectedCategoryObj ? `${selectedCategoryObj.name} Articles` : "Inspiration for Real Estate by real people" })
          ] }) })
        ]
      }
    ),
    /* @__PURE__ */ jsx("section", { className: "py-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-[1280px] mx-auto px-4 md:px-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-row justify-between items-center mb-8 md:mb-12 h-[50px]", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx("h2", { className: "font-space-grotesk font-bold text-[32px] md:text-[40px] leading-[40px] md:leading-[50px] tracking-[-0.03em] text-[#293056]", children: "Blogs" }),
          selectedCategoryObj && /* @__PURE__ */ jsx("span", { className: "inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium", children: selectedCategoryObj.name })
        ] }),
        selectedCategoryObj ? /* @__PURE__ */ jsxs(
          Link,
          {
            href: "/blogs",
            className: "flex flex-row items-center gap-4 group",
            children: [
              /* @__PURE__ */ jsx("span", { className: "font-work-sans font-bold text-lg leading-[27px] tracking-[-0.03em] text-[#293056] group-hover:text-[#293056]/80 transition-colors", children: "Clear Filter" }),
              /* @__PURE__ */ jsx(
                "svg",
                {
                  className: "w-6 h-6",
                  fill: "none",
                  viewBox: "0 0 24 24",
                  children: /* @__PURE__ */ jsx(
                    "path",
                    {
                      d: "M6 18L18 6M6 6l12 12",
                      stroke: "#293056",
                      strokeWidth: "2",
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      className: "group-hover:rotate-90 transition-transform"
                    }
                  )
                }
              )
            ]
          }
        ) : /* @__PURE__ */ jsxs(
          Link,
          {
            href: "/blogs",
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
      filteredPosts.length > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: filteredPosts.map((post) => /* @__PURE__ */ jsx(
          Link,
          {
            href: `/blogs/${post.slug || post.id}`,
            className: "block group",
            children: /* @__PURE__ */ jsxs("article", { className: "bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer h-full", children: [
              /* @__PURE__ */ jsx(
                "img",
                {
                  src: post.validated_image || "/images/no-image-placeholder.jpg",
                  alt: post.title,
                  className: "h-48 w-full object-cover"
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
                post.blog_category && /* @__PURE__ */ jsx("span", { className: "inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium mb-3", children: post.blog_category.name }),
                /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors", children: post.title }),
                /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-sm mb-4 line-clamp-2", children: post.excerpt }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs text-gray-500", children: [
                  /* @__PURE__ */ jsxs("span", { children: [
                    "By ",
                    post.author || "Admin"
                  ] }),
                  /* @__PURE__ */ jsx("span", { children: formatDate(post.published_at || post.created_at) })
                ] })
              ] })
            ] })
          },
          post.id
        )) }),
        pagination && pagination.last_page > 1 && /* @__PURE__ */ jsx("div", { className: "mt-12 flex justify-center gap-2", children: pagination.links.map((link, index) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => handlePageChange(link.url),
            disabled: !link.url,
            className: `px-4 py-2 rounded-lg font-medium transition-colors ${link.active ? "bg-blue-600 text-white" : link.url ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-gray-50 text-gray-400 cursor-not-allowed"}`,
            dangerouslySetInnerHTML: { __html: link.label }
          },
          index
        )) })
      ] }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-lg", children: selectedCategoryObj ? `No blog posts found in the ${selectedCategoryObj.name} category.` : "No blog posts found." }),
        selectedCategoryObj && /* @__PURE__ */ jsx(
          Link,
          {
            href: "/blogs",
            className: "mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium",
            children: "View all blog posts →"
          }
        )
      ] })
    ] }) }),
    blogData.length > 0 && /* @__PURE__ */ jsx(FeaturedBlogsSection, { blogs: blogData }),
    /* @__PURE__ */ jsx(BlogCategoriesSection, { categories }),
    /* @__PURE__ */ jsx("section", { className: "bg-gray-100 py-8", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 md:px-0 text-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-gray-900 mb-4", children: "Stay Updated" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-600 mb-8 max-w-2xl mx-auto", children: "Subscribe to our newsletter and never miss the latest real estate insights and market updates" }),
      /* @__PURE__ */ jsxs("form", { className: "max-w-md mx-auto flex gap-4", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "email",
            placeholder: "Enter your email",
            className: "flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            className: "px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors",
            children: "Subscribe"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "faq-section", children: /* @__PURE__ */ jsx(FAQ, {}) }),
    /* @__PURE__ */ jsx(RealEstateLinksSection, {})
  ] });
}
export {
  Blog as default
};
