import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useRef } from "react";
import { useForm, Head, router } from "@inertiajs/react";
import { A as AdminLayout } from "./AdminLayout-DaZm4wHn.js";
import { R as RichTextEditor } from "./RichTextEditor-B5ugUUwy.js";
function BlogCategoryEdit({ category }) {
  const [imagePreview, setImagePreview] = useState(category.featured_image);
  const imageInputRef = useRef(null);
  const { data, setData, post, processing, errors } = useForm({
    name: category.name || "",
    slug: category.slug || "",
    description: category.description || "",
    is_active: category.is_active ?? true,
    sort_order: category.sort_order || 0,
    featured_image: null,
    remove_image: false,
    _method: "PATCH"
  });
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData("featured_image", file);
      const reader = new FileReader();
      reader.onload = (e2) => setImagePreview(e2.target.result);
      reader.readAsDataURL(file);
    }
  };
  const removeImage = () => {
    setData((data2) => ({
      ...data2,
      remove_image: true,
      featured_image: null
    }));
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("admin.blog-categories.update", category.id), {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        console.log("Form submitted successfully");
      },
      onError: (errors2) => {
        console.error("Form submission errors:", errors2);
      }
    });
  };
  const handleCancel = () => {
    router.visit(route("admin.blog-categories.index"));
  };
  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this category?")) {
      router.delete(route("admin.blog-categories.destroy", category.id));
    }
  };
  return /* @__PURE__ */ jsxs(AdminLayout, { title: "Edit Blog Category", children: [
    /* @__PURE__ */ jsx(Head, { title: "Edit Blog Category" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Edit Blog Category" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600", children: "Update the category details." })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "bg-white shadow rounded-lg", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-gray-700", children: "Category Name *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                id: "name",
                value: data.name,
                onChange: (e) => setData("name", e.target.value),
                className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm",
                required: true,
                autoFocus: true
              }
            ),
            errors.name && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.name })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "slug", className: "block text-sm font-medium text-gray-700", children: "Slug" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                id: "slug",
                value: data.slug,
                onChange: (e) => setData("slug", e.target.value),
                className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm",
                placeholder: "Leave empty to auto-generate from name"
              }
            ),
            errors.slug && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.slug }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-500", children: "URL-friendly version of the name. Will be auto-generated if left empty." })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "description", className: "block text-sm font-medium text-gray-700 mb-1", children: "Description" }),
            /* @__PURE__ */ jsx(
              RichTextEditor,
              {
                id: "description",
                value: data.description,
                onChange: (html) => setData("description", html),
                placeholder: "Optional description of this category",
                error: errors.description
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "sort_order", className: "block text-sm font-medium text-gray-700", children: "Sort Order" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                id: "sort_order",
                value: data.sort_order,
                onChange: (e) => setData("sort_order", parseInt(e.target.value) || 0),
                className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              }
            ),
            errors.sort_order && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.sort_order }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Lower numbers appear first. Use 0 for default ordering." })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Featured Image" }),
            imagePreview ? /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsx(
                "img",
                {
                  src: imagePreview,
                  alt: "Preview",
                  className: "w-full h-48 object-cover rounded-lg"
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "flex space-x-2", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => imageInputRef.current?.click(),
                    className: "flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500",
                    children: "Change"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: removeImage,
                    className: "flex-1 px-3 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500",
                    children: "Remove"
                  }
                )
              ] }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  ref: imageInputRef,
                  type: "file",
                  accept: "image/*",
                  onChange: handleImageChange,
                  className: "hidden"
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
              errors.featured_image && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.featured_image }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-500", children: "PNG, JPG, GIF, WEBP up to 20MB. This image will be displayed in category listings." })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  id: "is_active",
                  checked: data.is_active,
                  onChange: (e) => setData("is_active", e.target.checked),
                  className: "h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                }
              ),
              /* @__PURE__ */ jsx("label", { htmlFor: "is_active", className: "ml-2 block text-sm text-gray-900", children: "Active" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Only active categories will be shown in blog post forms." }),
            errors.is_active && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-600", children: errors.is_active })
          ] }),
          category.blogs_count > 0 && /* @__PURE__ */ jsx("div", { className: "bg-yellow-50 border border-yellow-200 rounded-md p-4", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-yellow-800", children: [
            "This category has ",
            category.blogs_count,
            " blog post",
            category.blogs_count !== 1 ? "s" : "",
            " associated with it."
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 px-6 py-3 flex items-center justify-between rounded-b-lg", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: handleDelete,
              disabled: category.blogs_count > 0,
              className: "text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed",
              title: category.blogs_count > 0 ? "Cannot delete category with existing blogs" : "",
              children: "Delete Category"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: handleCancel,
                className: "bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "submit",
                disabled: processing,
                className: "inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50",
                children: processing ? "Saving..." : "Save Changes"
              }
            )
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  BlogCategoryEdit as default
};
