import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, useForm, Head, Link } from "@inertiajs/react";
import { A as AdminLayout } from "./AdminLayout-DVgDNs4A.js";
import { useState, useRef } from "react";
function Index({ auth }) {
  const { icons, title } = usePage().props;
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingIcon, setEditingIcon] = useState(null);
  const [previewIcon, setPreviewIcon] = useState(null);
  const createFileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  const { data: createData, setData: setCreateData, post: createPost, processing: createProcessing, errors: createErrors, reset: resetCreate } = useForm({
    name: "",
    category: "key_facts",
    svg_content: "",
    icon_url: "",
    icon_file: null,
    description: ""
  });
  const { data: editData, setData: setEditData, post: editPost, processing: editProcessing, errors: editErrors } = useForm({
    _method: "PUT",
    name: "",
    category: "",
    svg_content: "",
    icon_url: "",
    icon_file: null,
    description: "",
    is_active: true
  });
  const iconsByCategory = icons ? icons.reduce((acc, icon) => {
    if (!acc[icon.category]) {
      acc[icon.category] = [];
    }
    acc[icon.category].push(icon);
    return acc;
  }, {}) : {};
  const categories = ["all", ...Object.keys(iconsByCategory)];
  const filteredIcons = selectedCategory === "all" ? icons || [] : iconsByCategory[selectedCategory] || [];
  const categoryOptions = [
    { value: "key_facts", label: "Key Facts" },
    { value: "amenities", label: "Amenities" },
    { value: "highlights", label: "Highlights" },
    { value: "contact", label: "Contact" },
    { value: "general", label: "General" }
  ];
  const handleFileChange = (file, isEdit = false) => {
    if (!file) return;
    const formSetter = isEdit ? setEditData : setCreateData;
    const previewSetter = isEdit ? setPreviewIcon : setPreviewIcon;
    formSetter("icon_file", file);
    if (file.type === "image/svg+xml" || file.name.endsWith(".svg")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const svgContent = e.target.result;
        formSetter("svg_content", svgContent);
        formSetter("icon_url", "");
        previewSetter(svgContent);
      };
      reader.readAsText(file);
    } else if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        formSetter("svg_content", "");
        formSetter("icon_url", imageUrl);
        previewSetter(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };
  const clearFile = (isEdit = false) => {
    const formSetter = isEdit ? setEditData : setCreateData;
    const inputRef = isEdit ? editFileInputRef : createFileInputRef;
    formSetter("icon_file", null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setPreviewIcon(null);
  };
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    createPost(route("admin.icons.api.store"), {
      forceFormData: true,
      onSuccess: () => {
        setShowCreateModal(false);
        resetCreate();
        setPreviewIcon(null);
        if (createFileInputRef.current) {
          createFileInputRef.current.value = "";
        }
      }
    });
  };
  const handleEditSubmit = (e) => {
    e.preventDefault();
    editPost(route("admin.icons.update", editingIcon.id), {
      forceFormData: true,
      onSuccess: () => {
        setEditingIcon(null);
        setPreviewIcon(null);
      }
    });
  };
  const startEdit = (icon) => {
    setEditingIcon(icon);
    setEditData({
      _method: "PUT",
      name: icon.name,
      category: icon.category,
      svg_content: icon.svg_content || "",
      icon_url: icon.icon_url || "",
      icon_file: null,
      description: icon.description || "",
      is_active: icon.is_active
    });
    setPreviewIcon(null);
  };
  const handleDelete = (icon) => {
    if (confirm(`Are you sure you want to delete the "${icon.name}" icon?`)) {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = route("admin.icons.destroy", icon.id);
      const methodInput = document.createElement("input");
      methodInput.type = "hidden";
      methodInput.name = "_method";
      methodInput.value = "DELETE";
      form.appendChild(methodInput);
      const tokenInput = document.createElement("input");
      tokenInput.type = "hidden";
      tokenInput.name = "_token";
      tokenInput.value = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
      form.appendChild(tokenInput);
      document.body.appendChild(form);
      form.submit();
    }
  };
  return /* @__PURE__ */ jsxs(AdminLayout, { title, children: [
    /* @__PURE__ */ jsx(Head, { title }),
    /* @__PURE__ */ jsx("div", { className: "space-y-8", children: /* @__PURE__ */ jsx("div", { className: "bg-white overflow-hidden shadow-sm sm:rounded-lg", children: /* @__PURE__ */ jsxs("div", { className: "p-6 text-gray-900", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Icon Management" }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setShowCreateModal(true),
            className: "inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700",
            children: [
              /* @__PURE__ */ jsx("span", { className: "mr-2", children: "+" }),
              "Add New Icon"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: categories.map((category) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setSelectedCategory(category),
          className: `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
          children: [
            category === "all" ? "All Icons" : category.replace("_", " ").toUpperCase(),
            category !== "all" && iconsByCategory[category] && /* @__PURE__ */ jsx("span", { className: "ml-2 bg-gray-300 text-gray-600 px-2 py-1 rounded-full text-xs", children: iconsByCategory[category].length })
          ]
        },
        category
      )) }) }),
      filteredIcons.length > 0 ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4", children: filteredIcons.map((icon) => /* @__PURE__ */ jsx("div", { className: "bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center space-y-3", children: [
        /* @__PURE__ */ jsx("div", { className: "w-12 h-12 flex items-center justify-center bg-white rounded-lg border", children: icon.svg_content ? /* @__PURE__ */ jsx(
          "div",
          {
            dangerouslySetInnerHTML: { __html: icon.svg_content },
            className: "w-8 h-8"
          }
        ) : icon.icon_url ? /* @__PURE__ */ jsx(
          "img",
          {
            src: icon.icon_url,
            alt: icon.name,
            className: "w-8 h-8 object-contain"
          }
        ) : /* @__PURE__ */ jsx("span", { className: "text-gray-400 text-xs", children: "No Icon" }) }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium text-gray-900 truncate w-full", children: icon.name }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 capitalize", children: icon.category.replace("_", " ") })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center space-x-2", children: /* @__PURE__ */ jsx("span", { className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${icon.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`, children: icon.is_active ? "Active" : "Inactive" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex space-x-2 w-full", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => startEdit(icon),
              className: "flex-1 text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700",
              title: "Edit",
              children: "Edit"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleDelete(icon),
              className: "flex-1 text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700",
              title: "Delete",
              children: "Delete"
            }
          )
        ] })
      ] }) }, icon.id)) }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
        /* @__PURE__ */ jsx("div", { className: "mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx("span", { className: "text-4xl", children: "🎨" }) }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No icons found" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: selectedCategory === "all" ? "Get started by adding your first icon." : `No icons found in the ${selectedCategory.replace("_", " ")} category.` }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setShowCreateModal(true),
            className: "mt-4 inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700",
            children: [
              /* @__PURE__ */ jsx("span", { className: "mr-2", children: "+" }),
              "Add New Icon"
            ]
          }
        )
      ] }),
      icons && icons.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-8 bg-gray-50 rounded-lg p-4", children: [
        /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium text-gray-900 mb-3", children: "Icon Statistics" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-blue-600", children: icons.length }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500", children: "Total Icons" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-green-600", children: icons.filter((icon) => icon.is_active).length }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500", children: "Active" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-purple-600", children: Object.keys(iconsByCategory).length }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500", children: "Categories" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-orange-600", children: icons.filter((icon) => icon.svg_content).length }),
            /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500", children: "SVG Icons" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-8 flex justify-between", children: [
        /* @__PURE__ */ jsx(
          Link,
          {
            href: route("admin.websites.index"),
            className: "inline-flex items-center px-4 py-2 bg-gray-300 border border-transparent rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-400",
            children: "← Back to Websites"
          }
        ),
        /* @__PURE__ */ jsx(
          Link,
          {
            href: route("admin.dashboard"),
            className: "inline-flex items-center px-4 py-2 bg-gray-300 border border-transparent rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-400",
            children: "Dashboard"
          }
        )
      ] })
    ] }) }) }),
    showCreateModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50", children: /* @__PURE__ */ jsx("div", { className: "relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white", children: /* @__PURE__ */ jsxs("div", { className: "mt-3", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Add New Icon" }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleCreateSubmit, children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Name" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: createData.name,
                onChange: (e) => setCreateData("name", e.target.value),
                className: "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2",
                required: true
              }
            ),
            createErrors.name && /* @__PURE__ */ jsx("p", { className: "text-red-500 text-xs mt-1", children: createErrors.name })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Icon Upload" }),
            /* @__PURE__ */ jsxs("div", { className: "mt-1 space-y-2", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  ref: createFileInputRef,
                  type: "file",
                  accept: ".svg,.png,.jpg,.jpeg",
                  onChange: (e) => handleFileChange(e.target.files[0], false),
                  className: "block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Upload SVG, PNG, or JPG files (max 2MB)" }),
              previewIcon && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-2 bg-gray-50 rounded", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsx("div", { className: "w-8 h-8 flex items-center justify-center bg-white rounded border", children: previewIcon.startsWith("<svg") ? /* @__PURE__ */ jsx("div", { dangerouslySetInnerHTML: { __html: previewIcon }, className: "w-6 h-6" }) : /* @__PURE__ */ jsx("img", { src: previewIcon, alt: "Preview", className: "w-6 h-6 object-contain" }) }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600", children: "Preview" })
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => clearFile(false),
                    className: "text-red-600 hover:text-red-800 text-xs",
                    children: "Remove"
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Category" }),
            /* @__PURE__ */ jsx(
              "select",
              {
                value: createData.category,
                onChange: (e) => setCreateData("category", e.target.value),
                className: "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2",
                children: categoryOptions.map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value))
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "SVG Content (Manual Entry)" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                value: createData.svg_content,
                onChange: (e) => setCreateData("svg_content", e.target.value),
                className: "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2",
                rows: "4",
                placeholder: "<svg>...</svg> or upload a file above",
                disabled: !!createData.icon_file
              }
            ),
            createData.icon_file && /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "SVG content will be generated from uploaded file" }),
            createErrors.svg_content && /* @__PURE__ */ jsx("p", { className: "text-red-500 text-xs mt-1", children: createErrors.svg_content })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Icon URL (Alternative)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "url",
                value: createData.icon_url,
                onChange: (e) => setCreateData("icon_url", e.target.value),
                className: "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2",
                placeholder: "https://example.com/icon.svg",
                disabled: !!createData.icon_file
              }
            ),
            createData.icon_file && /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "URL will be generated from uploaded file" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Description" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: createData.description,
                onChange: (e) => setCreateData("description", e.target.value),
                className: "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end space-x-2 mt-6", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                setShowCreateModal(false);
                resetCreate();
              },
              className: "px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: createProcessing,
              className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50",
              children: createProcessing ? "Creating..." : "Create Icon"
            }
          )
        ] })
      ] })
    ] }) }) }),
    editingIcon && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50", children: /* @__PURE__ */ jsx("div", { className: "relative top-10 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto", children: /* @__PURE__ */ jsxs("div", { className: "mt-3", children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: [
        "Edit Icon: ",
        editingIcon.name
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleEditSubmit, children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Name" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: editData.name,
                onChange: (e) => setEditData("name", e.target.value),
                className: "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2",
                required: true
              }
            ),
            editErrors.name && /* @__PURE__ */ jsx("p", { className: "text-red-500 text-xs mt-1", children: editErrors.name })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Current Icon" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2 p-3 bg-gray-50 rounded-md", children: [
              /* @__PURE__ */ jsx("div", { className: "w-12 h-12 flex items-center justify-center bg-white rounded border", children: editingIcon.svg_content ? /* @__PURE__ */ jsx(
                "div",
                {
                  dangerouslySetInnerHTML: { __html: editingIcon.svg_content },
                  className: "w-8 h-8"
                }
              ) : editingIcon.icon_url ? /* @__PURE__ */ jsx(
                "img",
                {
                  src: editingIcon.icon_url,
                  alt: editingIcon.name,
                  className: "w-8 h-8 object-contain"
                }
              ) : /* @__PURE__ */ jsx("span", { className: "text-gray-400 text-xs", children: "No Icon" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: editingIcon.name }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 capitalize", children: editingIcon.category.replace("_", " ") })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Replace Icon (Upload New)" }),
            /* @__PURE__ */ jsxs("div", { className: "mt-1 space-y-2", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  ref: editFileInputRef,
                  type: "file",
                  accept: ".svg,.png,.jpg,.jpeg",
                  onChange: (e) => handleFileChange(e.target.files[0], true),
                  className: "block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Upload SVG, PNG, or JPG files to replace current icon" }),
              previewIcon && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-2 bg-blue-50 rounded border", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsx("div", { className: "w-8 h-8 flex items-center justify-center bg-white rounded border", children: previewIcon.startsWith("<svg") ? /* @__PURE__ */ jsx("div", { dangerouslySetInnerHTML: { __html: previewIcon }, className: "w-6 h-6" }) : /* @__PURE__ */ jsx("img", { src: previewIcon, alt: "New Preview", className: "w-6 h-6 object-contain" }) }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600", children: "New Preview" })
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => clearFile(true),
                    className: "text-red-600 hover:text-red-800 text-xs",
                    children: "Remove"
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Category" }),
            /* @__PURE__ */ jsx(
              "select",
              {
                value: editData.category,
                onChange: (e) => setEditData("category", e.target.value),
                className: "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2",
                children: categoryOptions.map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value))
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "SVG Content (Manual Edit)" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                value: editData.svg_content,
                onChange: (e) => setEditData("svg_content", e.target.value),
                className: "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2",
                rows: "4",
                disabled: !!editData.icon_file
              }
            ),
            editData.icon_file && /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "SVG content will be updated from uploaded file" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Icon URL" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "url",
                value: editData.icon_url,
                onChange: (e) => setEditData("icon_url", e.target.value),
                className: "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2",
                disabled: !!editData.icon_file
              }
            ),
            editData.icon_file && /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "URL will be updated from uploaded file" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Description" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: editData.description,
                onChange: (e) => setEditData("description", e.target.value),
                className: "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("label", { className: "flex items-center", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: editData.is_active,
                onChange: (e) => setEditData("is_active", e.target.checked),
                className: "mr-2"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-700", children: "Active" })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end space-x-2 mt-6", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                setEditingIcon(null);
                setPreviewIcon(null);
              },
              className: "px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: editProcessing,
              className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50",
              children: editProcessing ? "Updating..." : "Update Icon"
            }
          )
        ] })
      ] })
    ] }) }) })
  ] });
}
export {
  Index as default
};
