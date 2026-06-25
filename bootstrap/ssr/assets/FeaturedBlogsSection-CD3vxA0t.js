import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import "react";
import { Link } from "@inertiajs/react";
const DEFAULT_BLOG_IMAGE = "/images/no-image-placeholder.jpg";
const getValidImageUrl = (blog) => {
  if (blog.validated_image) {
    return blog.validated_image;
  }
  return DEFAULT_BLOG_IMAGE;
};
const FeaturedBlogsSection = ({ blogs = [] }) => {
  const featuredBlogs = blogs.slice(0, 3);
  if (featuredBlogs.length < 3) {
    return null;
  }
  const mainBlog = featuredBlogs[0];
  const topSideBlog = featuredBlogs[1];
  const bottomSideBlog = featuredBlogs[2];
  const mainBlogImage = getValidImageUrl(mainBlog);
  const topSideBlogImage = getValidImageUrl(topSideBlog);
  const bottomSideBlogImage = getValidImageUrl(bottomSideBlog);
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).replace(",", "");
  };
  return /* @__PURE__ */ jsx("section", { className: "py-8", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 md:px-0", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-[1280px] mx-auto h-auto md:h-[604px] flex flex-col md:flex-row gap-6", children: [
    /* @__PURE__ */ jsx(
      Link,
      {
        href: `/blogs/${mainBlog.slug || mainBlog.id}`,
        className: "w-full md:w-[815px] h-[400px] md:h-[604px] rounded-xl p-8 flex flex-col justify-end gap-2.5 relative overflow-hidden hover:scale-[1.01] transition-transform",
        style: {
          backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, rgba(0, 0, 0, 0.7) 60%), url('${mainBlogImage}')`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        },
        children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-6 h-[22px]", children: [
            mainBlog.blog_category && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { className: "text-white font-medium text-base leading-[140%] font-inter", children: mainBlog.blog_category.name }),
              /* @__PURE__ */ jsx("div", { className: "w-10 h-px bg-white" })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-white font-medium text-base leading-[140%] font-inter", children: formatDate(mainBlog.published_at || mainBlog.created_at) })
          ] }),
          /* @__PURE__ */ jsx("h1", { className: "text-white font-medium text-[28px] md:text-[32px] leading-[130%] font-inter max-w-[586px]", children: mainBlog.title })
        ] })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "w-full md:w-[441px] h-auto md:h-[604px] flex flex-col gap-[26px]", children: [
      /* @__PURE__ */ jsx(
        Link,
        {
          href: `/blogs/${topSideBlog.slug || topSideBlog.id}`,
          className: "w-full h-[289px] rounded-xl p-6 flex flex-col justify-end gap-2.5 relative overflow-hidden hover:scale-[1.02] transition-transform",
          style: {
            backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(0, 0, 0, 0.6) 60%), url('${topSideBlogImage}')`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          },
          children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-6 h-[27px]", children: [
              topSideBlog.blog_category && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("span", { className: "text-white font-normal text-lg leading-[27px] tracking-[-0.03em] font-work-sans", children: topSideBlog.blog_category.name }),
                /* @__PURE__ */ jsx("div", { className: "w-10 h-px bg-white" })
              ] }),
              /* @__PURE__ */ jsx("span", { className: "text-white font-normal text-lg leading-[27px] tracking-[-0.03em] font-work-sans", children: formatDate(topSideBlog.published_at || topSideBlog.created_at) })
            ] }),
            /* @__PURE__ */ jsx("h2", { className: "text-white font-bold text-[24px] md:text-[28px] leading-[32px] md:leading-[38px] tracking-[-0.03em] font-space-grotesk max-w-[388px]", children: topSideBlog.title })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        Link,
        {
          href: `/blogs/${bottomSideBlog.slug || bottomSideBlog.id}`,
          className: "w-full h-[289px] rounded-xl p-6 flex flex-col justify-end gap-2.5 relative overflow-hidden hover:scale-[1.02] transition-transform",
          style: {
            backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(0, 0, 0, 0.5) 60%), url('${bottomSideBlogImage}')`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          },
          children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-6 h-[27px]", children: [
              bottomSideBlog.blog_category && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("span", { className: "text-white font-normal text-lg leading-[27px] tracking-[-0.03em] font-work-sans", children: bottomSideBlog.blog_category.name }),
                /* @__PURE__ */ jsx("div", { className: "w-10 h-px bg-white" })
              ] }),
              /* @__PURE__ */ jsx("span", { className: "text-white font-normal text-lg leading-[27px] tracking-[-0.03em] font-work-sans", children: formatDate(bottomSideBlog.published_at || bottomSideBlog.created_at) })
            ] }),
            /* @__PURE__ */ jsx("h2", { className: "text-white font-bold text-[24px] md:text-[28px] leading-[32px] md:leading-[38px] tracking-[-0.03em] font-space-grotesk max-w-[388px]", children: bottomSideBlog.title })
          ] })
        }
      )
    ] })
  ] }) }) });
};
export {
  FeaturedBlogsSection as default
};
