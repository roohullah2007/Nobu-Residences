import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useRef } from "react";
import { usePage, useForm, Head, router } from "@inertiajs/react";
import { A as AdminLayout } from "./AdminLayout-CaxbTFCB.js";
function BlogCreate() {
  const { categories } = usePage().props;
  const [imagePreview, setImagePreview] = useState(null);
  const imageInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data, setData, post, processing, errors, reset } = useForm({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    category_id: null,
    status: "draft",
    image: null,
    meta_title: "",
    meta_description: ""
  });
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData("image", file);
      const reader = new FileReader();
      reader.onload = (e2) => setImagePreview(e2.target.result);
      reader.readAsDataURL(file);
    }
  };
  const removeImage = () => {
    setData("image", null);
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const metaTitle = data.meta_title || data.title;
    const metaDescription = data.meta_description || data.excerpt;
    post(route("admin.blog.store"), {
      ...data,
      meta_title: metaTitle,
      meta_description: metaDescription,
      onSuccess: () => {
        setIsSubmitting(false);
      },
      onError: () => {
        setIsSubmitting(false);
      }
    });
  };
  const handleSaveAsDraft = () => {
    setData("status", "draft");
    setTimeout(() => {
      document.getElementById("blog-form").requestSubmit();
    }, 100);
  };
  const handlePublish = () => {
    setData("status", "published");
    setTimeout(() => {
      document.getElementById("blog-form").requestSubmit();
    }, 100);
  };
  return /* @__PURE__ */ jsxs(AdminLayout, { title: "Create Blog Post", children: [
    /* @__PURE__ */ jsx(Head, { title: "Create Blog Post" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Create New Blog Post" }),
        /* @__PURE__ */ jsxs("div", { className: "flex space-x-3", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: handleSaveAsDraft,
              disabled: processing || isSubmitting,
              className: "px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50",
              children: "Save as Draft"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: handlePublish,
              disabled: processing || isSubmitting,
              className: "px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50",
              children: processing || isSubmitting ? "Publishing..." : "Publish"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("form", { id: "blog-form", onSubmit: handleSubmit, className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "title", className: "block text-sm font-medium text-gray-700 mb-2", children: "Title *" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  id: "title",
                  value: data.title,
                  onChange: (e) => setData("title", e.target.value),
                  className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-lg",
                  placeholder: "Enter blog post title...",
                  required: true
                }
              ),
              errors.title && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.title })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "excerpt", className: "block text-sm font-medium text-gray-700 mb-2", children: "Excerpt" }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  id: "excerpt",
                  value: data.excerpt,
                  onChange: (e) => setData("excerpt", e.target.value),
                  rows: 3,
                  className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500",
                  placeholder: "Brief description of the blog post..."
                }
              ),
              errors.excerpt && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.excerpt }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500", children: "A short summary that will be displayed in blog listings and search results." })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "content", className: "block text-sm font-medium text-gray-700 mb-2", children: "Content *" }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  id: "content",
                  value: data.content,
                  onChange: (e) => setData("content", e.target.value),
                  rows: 20,
                  className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500",
                  placeholder: "Write your blog post content here... You can use HTML tags for formatting.",
                  required: true
                }
              ),
              errors.content && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.content }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500", children: "You can use HTML tags for formatting (p, h1-h6, strong, em, ul, ol, li, a, img, etc.)" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "border-t pt-6", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "SEO Settings" }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { htmlFor: "meta_title", className: "block text-sm font-medium text-gray-700 mb-2", children: "Meta Title" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      id: "meta_title",
                      value: data.meta_title,
                      onChange: (e) => setData("meta_title", e.target.value),
                      className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500",
                      placeholder: "SEO title (will use blog title if empty)"
                    }
                  ),
                  errors.meta_title && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.meta_title })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { htmlFor: "meta_description", className: "block text-sm font-medium text-gray-700 mb-2", children: "Meta Description" }),
                  /* @__PURE__ */ jsx(
                    "textarea",
                    {
                      id: "meta_description",
                      value: data.meta_description,
                      onChange: (e) => setData("meta_description", e.target.value),
                      rows: 3,
                      className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500",
                      placeholder: "SEO description (will use excerpt if empty)"
                    }
                  ),
                  errors.meta_description && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.meta_description })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-gray-900 mb-3", children: "Publish Settings" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "status", className: "block text-sm font-medium text-gray-700 mb-2", children: "Status" }),
                /* @__PURE__ */ jsxs(
                  "select",
                  {
                    id: "status",
                    value: data.status,
                    onChange: (e) => setData("status", e.target.value),
                    className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500",
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "draft", children: "Draft" }),
                      /* @__PURE__ */ jsx("option", { value: "published", children: "Published" })
                    ]
                  }
                ),
                errors.status && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.status })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-gray-900 mb-3", children: "Category" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "category_id", className: "block text-sm font-medium text-gray-700 mb-2", children: "Category" }),
                /* @__PURE__ */ jsxs(
                  "select",
                  {
                    id: "category_id",
                    value: data.category_id || "",
                    onChange: (e) => {
                      const selectedId = e.target.value;
                      const selectedCategory = categories.find((c) => c.id == selectedId);
                      setData({
                        ...data,
                        category_id: selectedId ? parseInt(selectedId) : null,
                        category: selectedCategory ? selectedCategory.name : ""
                      });
                    },
                    className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500",
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "", children: "Select a category..." }),
                      categories.map((category) => /* @__PURE__ */ jsx("option", { value: category.id, children: category.name }, category.id))
                    ]
                  }
                ),
                errors.category_id && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.category_id }),
                /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500", children: "Choose a category to organize your blog post" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-gray-900 mb-3", children: "Featured Image" }),
              imagePreview ? /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: imagePreview,
                    alt: "Preview",
                    className: "w-full h-40 object-cover rounded-lg"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: removeImage,
                    className: "w-full px-3 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500",
                    children: "Remove Image"
                  }
                )
              ] }) : /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    ref: imageInputRef,
                    type: "file",
                    accept: "image/*",
                    onChange: handleImageChange,
                    className: "block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  }
                ),
                errors.image && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.image }),
                /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-500", children: "PNG, JPG, GIF up to 2MB" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("button", { type: "submit", style: { display: "none" }, children: "Submit" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-6 border-t", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => router.visit(route("admin.blog.index")),
            className: "px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex space-x-3", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: handleSaveAsDraft,
              disabled: processing || isSubmitting,
              className: "px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50",
              children: "Save as Draft"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: handlePublish,
              disabled: processing || isSubmitting,
              className: "px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50",
              children: processing || isSubmitting ? "Publishing..." : "Publish"
            }
          )
        ] })
      ] })
    ] })
  ] });
}
export {
  BlogCreate as default
};
