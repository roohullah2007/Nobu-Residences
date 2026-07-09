import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { usePage, useForm, Head, Link, router } from "@inertiajs/react";
import { A as AdminLayout } from "./AdminLayout-CfYoZrH6.js";
import { useState } from "react";
function EditHomePage({ auth }) {
  const { website, homePage, availableIcons, title } = usePage().props;
  const [activeTab, setActiveTab] = useState("hero");
  const [showIconModal, setShowIconModal] = useState(false);
  const [showEditIconModal, setShowEditIconModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("key_facts");
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [showInlineIconModal, setShowInlineIconModal] = useState(false);
  const [inlineIconCategory, setInlineIconCategory] = useState("");
  const [inlineIconIndex, setInlineIconIndex] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const buildUrlWithWebsite = (path) => {
    if (website?.slug && website?.id !== 1) {
      let cleanPath = path;
      if (path.includes("?website=") || path.includes("&website=")) {
        cleanPath = path.replace(/[?&]website=[^&]*/g, "").replace(/\?&/, "?").replace(/\?$/, "");
      }
      const separator = cleanPath.includes("?") ? "&" : "?";
      return `${cleanPath}${separator}website=${website.slug}`;
    }
    return path;
  };
  const getDefaultHeaderLinks = () => {
    return [
      { id: 1, text: "Home", url: "/", enabled: true },
      { id: 2, text: "Rent", url: "/toronto/for-rent", enabled: true },
      { id: 3, text: "Sale", url: "/toronto/for-sale", enabled: true },
      { id: 4, text: "Search All", url: "/search", enabled: true },
      { id: 5, text: "Blog", url: "/blogs", enabled: true },
      { id: 6, text: "Contact Us", url: "/contact", enabled: true }
    ];
  };
  const getDefaultContent = () => {
    const defaults = {
      hero: {
        welcome_text: "WELCOME TO NOBU RESIDENCES",
        main_heading: "Your Next Home Is Just a Click Away",
        subheading: "Whether buying or renting, Nobu makes finding your home easy and reliable.",
        background_image: "/assets/hero-section.jpg",
        buttons: [
          { text: "6 Condos for rent", url: "/rent", style: "primary" },
          { text: "6 Condos for sale", url: "/sale", style: "secondary" }
        ]
      },
      about: {
        title: "Learn everything about Nobu Residence",
        image: "/assets/nobu-building.jpg",
        image_alt: "Nobu Residence Building",
        content: "Found in Toronto's King West area and built in 2024, Nobu Residences was built by Madison Group. This Toronto condo sits near the intersection of Spadina Ave and Wellington St W."
      },
      carousel_settings: {
        for_rent: {
          title: "Properties for Rent",
          address_filter: "Toronto, ON",
          property_subtype: "Condo",
          enabled: true,
          limit: 6
        },
        for_sale: {
          title: "Properties for Sale",
          address_filter: "Toronto, ON",
          property_subtype: "Condo",
          enabled: true,
          limit: 6
        }
      },
      faq: {
        title: "Frequently Asked Questions",
        enabled: true,
        items: [
          {
            question: "What are the rental prices at Nobu Residences?",
            answer: "Rental prices vary based on unit size and floor level. Contact us for current availability and pricing."
          }
        ]
      },
      footer: {
        enabled: true,
        heading: "Your new home is waiting",
        subheading: "Apply online in minutes or get in touch to schedule a personalized tour",
        logo_url: "/assets/logo.png",
        background_image: "/assets/house-img.jpg",
        description: "Experience luxury living at Nobu Residences in the heart of Toronto.",
        quick_links: [
          { text: "Properties for Rent", url: "/rent" },
          { text: "Properties for Sale", url: "/sale" }
        ],
        contact_info: {
          use_global_contact: true,
          show_phone: true,
          show_email: true,
          show_address: true,
          custom_phone: "",
          custom_email: "",
          custom_address: "",
          custom_agent_name: "",
          custom_agent_title: ""
        },
        social_media: {
          use_global_social: true,
          show_facebook: true,
          show_instagram: true,
          show_twitter: true,
          show_linkedin: true
        },
        copyright_text: "© 2024 Nobu Residences. All rights reserved.",
        additional_links: [
          { text: "Privacy Policy", url: "/privacy" },
          { text: "Terms of Service", url: "/terms" }
        ]
      },
      mls_settings: {
        default_city: "Toronto",
        default_building_address: "55 Mercer Street"
      },
      header_links: {
        enabled: true,
        links: getDefaultHeaderLinks()
      }
    };
    const existingContent = homePage?.content || {};
    return {
      hero: { ...defaults.hero, ...existingContent.hero },
      about: { ...defaults.about, ...existingContent.about },
      carousel_settings: {
        for_rent: { ...defaults.carousel_settings.for_rent, ...existingContent.carousel_settings?.for_rent },
        for_sale: { ...defaults.carousel_settings.for_sale, ...existingContent.carousel_settings?.for_sale }
      },
      mls_settings: { ...defaults.mls_settings, ...existingContent.mls_settings },
      faq: { ...defaults.faq, ...existingContent.faq },
      footer: { ...defaults.footer, ...existingContent.footer },
      header_links: {
        enabled: existingContent.header_links?.enabled ?? defaults.header_links.enabled,
        links: existingContent.header_links?.links && existingContent.header_links.links.length > 0 ? existingContent.header_links.links : defaults.header_links.links
      }
    };
  };
  const { data, setData, put, processing, errors, clearErrors } = useForm({
    title: homePage?.title || "",
    content: getDefaultContent(),
    hero_background_image: null,
    about_image: null,
    footer_logo: null,
    footer_background_image: null
  });
  const { data: iconData, setData: setIconData, post: postIcon, processing: iconProcessing, errors: iconErrors, reset: resetIcon } = useForm({
    name: "",
    category: "key_facts",
    icon_file: null
  });
  const { data: editIconData, setData: setEditIconData, post: postEditIcon, processing: editIconProcessing, errors: editIconErrors, reset: resetEditIcon } = useForm({
    _method: "PUT",
    name: "",
    category: "key_facts",
    svg_content: "",
    icon_url: "",
    icon_file: null,
    description: "",
    is_active: true
  });
  const categoryOptions = [
    { value: "key_facts", label: "Key Facts" },
    { value: "amenities", label: "Amenities" },
    { value: "highlights", label: "Highlights" },
    { value: "contact", label: "Contact" },
    { value: "general", label: "General" }
  ];
  const handleSubmit = (e) => {
    e.preventDefault();
    if (website?.id) {
      clearErrors();
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("title", data.title || homePage?.title || "Home");
      formData.append("content", JSON.stringify(data.content));
      if (data.hero_background_image) {
        formData.append("hero_background_image", data.hero_background_image);
      }
      if (data.about_image) {
        formData.append("about_image", data.about_image);
      }
      if (data.footer_logo) {
        formData.append("footer_logo", data.footer_logo);
      }
      if (data.footer_background_image) {
        formData.append("footer_background_image", data.footer_background_image);
      }
      router.post(route("admin.websites.update-home-page", website.id), formData, {
        forceFormData: true,
        preserveScroll: true,
        onSuccess: (response) => {
          console.log("Success response:", response);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 4e3);
        },
        onError: (errors2) => {
          console.error("Form submission errors:", errors2);
        }
      });
    }
  };
  if (!website) {
    return /* @__PURE__ */ jsxs(AdminLayout, { title, children: [
      /* @__PURE__ */ jsx(Head, { title }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-center items-center h-64", children: /* @__PURE__ */ jsx("div", { className: "text-gray-500", children: "Loading website..." }) })
    ] });
  }
  const updateHeroField = (field, value) => {
    setData("content", {
      ...data.content,
      hero: {
        ...data.content.hero,
        [field]: value
      }
    });
  };
  const updateAboutField = (field, value) => {
    setData("content", {
      ...data.content,
      about: {
        ...data.content.about,
        [field]: value
      }
    });
  };
  const updateAboutTabItem = (tabName, index, field, value) => {
    const tabs = data.content.about?.tabs || {};
    const items = tabs[tabName]?.items || [];
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setData("content", {
      ...data.content,
      about: {
        ...data.content.about,
        tabs: {
          ...tabs,
          [tabName]: {
            ...tabs[tabName],
            items: newItems
          }
        }
      }
    });
  };
  const addAboutTabItem = (tabName, defaultItem) => {
    const tabs = data.content.about?.tabs || {};
    const items = tabs[tabName]?.items || [];
    const newItems = [...items, defaultItem];
    setData("content", {
      ...data.content,
      about: {
        ...data.content.about,
        tabs: {
          ...tabs,
          [tabName]: {
            ...tabs[tabName],
            items: newItems
          }
        }
      }
    });
  };
  const removeAboutTabItem = (tabName, index) => {
    const tabs = data.content.about?.tabs || {};
    const items = tabs[tabName]?.items || [];
    const newItems = items.filter((_, i) => i !== index);
    setData("content", {
      ...data.content,
      about: {
        ...data.content.about,
        tabs: {
          ...tabs,
          [tabName]: {
            ...tabs[tabName],
            items: newItems
          }
        }
      }
    });
  };
  const updateCarouselSetting = (carouselType, field, value) => {
    setData("content", {
      ...data.content,
      carousel_settings: {
        ...data.content.carousel_settings,
        [carouselType]: {
          ...data.content.carousel_settings[carouselType],
          [field]: value
        }
      }
    });
  };
  const updateMlsSettings = (field, value) => {
    setData("content", {
      ...data.content,
      mls_settings: {
        ...data.content.mls_settings,
        [field]: value
      }
    });
  };
  const updateFaqField = (field, value) => {
    setData("content", {
      ...data.content,
      faq: {
        ...data.content.faq,
        [field]: value
      }
    });
  };
  const updateFaqItem = (index, field, value) => {
    const newItems = [...data.content.faq?.items || []];
    newItems[index] = { ...newItems[index], [field]: value };
    updateFaqField("items", newItems);
  };
  const addFaqItem = () => {
    const newItems = [...data.content.faq?.items || [], { question: "", answer: "" }];
    updateFaqField("items", newItems);
  };
  const removeFaqItem = (index) => {
    const newItems = (data.content.faq?.items || []).filter((_, i) => i !== index);
    updateFaqField("items", newItems);
  };
  const updateFooterField = (field, value) => {
    setData("content", {
      ...data.content,
      footer: {
        ...data.content.footer,
        [field]: value
      }
    });
  };
  const updateFooterQuickLink = (index, field, value) => {
    const newLinks = [...data.content.footer?.quick_links || []];
    newLinks[index] = { ...newLinks[index], [field]: value };
    updateFooterField("quick_links", newLinks);
  };
  const addFooterQuickLink = () => {
    const newLinks = [...data.content.footer?.quick_links || [], { text: "", url: "" }];
    updateFooterField("quick_links", newLinks);
  };
  const removeFooterQuickLink = (index) => {
    const newLinks = (data.content.footer?.quick_links || []).filter((_, i) => i !== index);
    updateFooterField("quick_links", newLinks);
  };
  const updateFooterAdditionalLink = (index, field, value) => {
    const newLinks = [...data.content.footer?.additional_links || []];
    newLinks[index] = { ...newLinks[index], [field]: value };
    updateFooterField("additional_links", newLinks);
  };
  const addFooterAdditionalLink = () => {
    const newLinks = [...data.content.footer?.additional_links || [], { text: "", url: "" }];
    updateFooterField("additional_links", newLinks);
  };
  const removeFooterAdditionalLink = (index) => {
    const newLinks = (data.content.footer?.additional_links || []).filter((_, i) => i !== index);
    updateFooterField("additional_links", newLinks);
  };
  const updateHeroButton = (index, field, value) => {
    const newButtons = [...data.content.hero.buttons];
    newButtons[index] = { ...newButtons[index], [field]: value };
    updateHeroField("buttons", newButtons);
  };
  const addHeroButton = () => {
    const newButtons = [...data.content.hero.buttons, { text: "", url: "", style: "primary" }];
    updateHeroField("buttons", newButtons);
  };
  const removeHeroButton = (index) => {
    const newButtons = data.content.hero.buttons.filter((_, i) => i !== index);
    updateHeroField("buttons", newButtons);
  };
  const handleIconSubmit = (e) => {
    e.preventDefault();
    postIcon(route("admin.icons.api.store"), {
      onSuccess: () => {
        setShowIconModal(false);
        resetIcon();
      },
      onError: (errors2) => {
        console.error("Icon upload failed:", errors2);
      },
      preserveScroll: true,
      preserveState: false
    });
  };
  const handleInlineIconSubmit = (e) => {
    e.preventDefault();
    const currentTab = activeTab;
    setIconData("category", inlineIconCategory);
    postIcon(route("admin.icons.api.store"), {
      forceFormData: true,
      // Force multipart/form-data for file upload
      onSuccess: (page) => {
        setShowInlineIconModal(false);
        resetIcon();
        setActiveTab(currentTab);
        if (inlineIconIndex !== null && inlineIconCategory) {
          const tabName = inlineIconCategory === "key_facts" ? "key_facts" : inlineIconCategory === "amenities" ? "amenities" : "highlights";
          updateAboutTabItem(tabName, inlineIconIndex, "icon", iconData.name);
        }
      },
      onError: (errors2) => {
        console.error("Icon upload failed:", errors2);
        setActiveTab(currentTab);
      },
      preserveScroll: true,
      preserveState: true
      // Keep the state to preserve tab
    });
  };
  const openInlineIconModal = (category, index) => {
    setInlineIconCategory(category);
    setInlineIconIndex(index);
    setIconData({
      name: "",
      category,
      icon_file: null
    });
    setShowInlineIconModal(true);
  };
  const handleEditIconSubmit = (e) => {
    e.preventDefault();
    postEditIcon(route("admin.icons.update", selectedIcon.id), {
      onSuccess: () => {
        setShowEditIconModal(false);
        setSelectedIcon(null);
        resetEditIcon();
        window.location.reload();
      }
    });
  };
  const openEditIconModal = (icon) => {
    setSelectedIcon(icon);
    setEditIconData({
      _method: "PUT",
      name: icon.name,
      category: icon.category,
      svg_content: icon.svg_content || "",
      icon_url: icon.icon_url || "",
      icon_file: null,
      description: icon.description || "",
      is_active: icon.is_active ?? true
    });
    setShowEditIconModal(true);
  };
  const handleDeleteIcon = async (icon) => {
    if (confirm(`Are you sure you want to delete the "${icon.name}" icon?`)) {
      try {
        const response = await fetch(route("admin.icons.destroy", icon.id), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').getAttribute("content")
          },
          body: JSON.stringify({
            _method: "DELETE"
          })
        });
        if (response.ok) {
          window.location.reload();
        } else {
          alert("Failed to delete icon");
        }
      } catch (error) {
        console.error("Error deleting icon:", error);
        alert("Error deleting icon");
      }
    }
  };
  const renderIconPreview = (iconName, category) => {
    if (!iconName || !availableIcons?.[category]) {
      return /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-gray-100 rounded flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-gray-400 text-xs", children: "None" }) });
    }
    const icon = availableIcons[category].find((i) => i.name === iconName);
    if (!icon) {
      return /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-gray-100 rounded flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-gray-400 text-xs", children: "?" }) });
    }
    if (icon.svg_content) {
      return /* @__PURE__ */ jsx(
        "div",
        {
          className: "w-10 h-10 p-1",
          dangerouslySetInnerHTML: { __html: icon.svg_content }
        }
      );
    }
    if (icon.icon_url) {
      return /* @__PURE__ */ jsx(
        "img",
        {
          src: icon.icon_url,
          alt: icon.name,
          className: "w-10 h-10 object-contain"
        }
      );
    }
    return /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-gray-100 rounded flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-gray-400 text-xs", children: "?" }) });
  };
  const renderIconGrid = (category) => {
    const icons = availableIcons?.[category] || [];
    return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg", children: [
      icons.map((icon) => /* @__PURE__ */ jsxs("div", { className: "group relative flex flex-col items-center p-3 bg-white rounded border hover:shadow-md transition-shadow", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "w-8 h-8 mb-2 cursor-pointer",
            onClick: () => openEditIconModal(icon),
            title: "Click to edit icon",
            children: icon.svg_content ? /* @__PURE__ */ jsx(
              "div",
              {
                dangerouslySetInnerHTML: { __html: icon.svg_content },
                className: "w-full h-full"
              }
            ) : icon.icon_url ? /* @__PURE__ */ jsx(
              "img",
              {
                src: icon.icon_url,
                alt: icon.name,
                className: "w-full h-full object-contain"
              }
            ) : /* @__PURE__ */ jsx("div", { className: "w-full h-full bg-gray-200 rounded flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-400", children: "?" }) })
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-center font-medium mb-2", children: icon.name }),
        /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 bg-black bg-opacity-50 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => openEditIconModal(icon),
              className: "px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700",
              title: "Edit icon",
              children: "Edit"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleDeleteIcon(icon),
              className: "px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700",
              title: "Delete icon",
              children: "Delete"
            }
          )
        ] })
      ] }, icon.id)),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => {
            setSelectedCategory(category);
            setShowIconModal(true);
          },
          className: "flex flex-col items-center p-2 bg-blue-50 border-2 border-dashed border-blue-300 rounded hover:bg-blue-100",
          children: [
            /* @__PURE__ */ jsx("div", { className: "w-8 h-8 mb-2 flex items-center justify-center", children: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6 text-blue-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 6v6m0 0v6m0-6h6m-6 0H6" }) }) }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-center font-medium text-blue-600", children: "Add Icon" })
          ]
        }
      )
    ] });
  };
  return /* @__PURE__ */ jsxs(AdminLayout, { title, children: [
    /* @__PURE__ */ jsx(Head, { title }),
    showSuccess && /* @__PURE__ */ jsx("div", { className: "fixed top-4 right-4 z-[1000] animate-pulse", children: /* @__PURE__ */ jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4 flex items-start shadow-lg max-w-sm", children: [
      /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 text-green-400", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }) }),
      /* @__PURE__ */ jsxs("div", { className: "ml-3", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-green-800", children: "Changes Saved Successfully!" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-green-700 mt-1", children: "Your home page has been updated." })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setShowSuccess(false),
          className: "ml-auto -mr-1.5 -mt-1.5 bg-green-50 text-green-500 rounded-lg p-1.5 hover:bg-green-100 inline-flex h-8 w-8",
          children: [
            /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Dismiss" }),
            /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }) })
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "space-y-8", children: /* @__PURE__ */ jsx("div", { className: "bg-white overflow-hidden shadow-sm sm:rounded-lg", children: /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h3", { className: "text-lg font-medium text-gray-900", children: [
            "Edit Home Page: ",
            website?.name || "Loading..."
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Manage your home page content and sections" })
        ] }),
        /* @__PURE__ */ jsx(
          Link,
          {
            href: website?.id ? route("admin.websites.show", website.id) : "#",
            className: "inline-flex items-center px-4 py-2 bg-gray-300 border border-transparent rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-400",
            children: "← Back to Website"
          }
        )
      ] }),
      Object.keys(errors).length > 0 && /* @__PURE__ */ jsx("div", { className: "mb-6 bg-red-50 border border-red-200 rounded-lg p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex", children: [
        /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 text-red-400 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-red-800 mb-2", children: "There were errors with your submission:" }),
          /* @__PURE__ */ jsx("ul", { className: "text-sm text-red-700 list-disc list-inside", children: Object.entries(errors).map(([key, value]) => /* @__PURE__ */ jsx("li", { children: value }, key)) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "border-b border-gray-200 mb-6", children: /* @__PURE__ */ jsx("nav", { className: "-mb-px flex space-x-8", children: [
        { id: "header", name: "Header Links" },
        { id: "hero", name: "Hero Section" },
        { id: "about", name: "About Section" },
        { id: "carousel", name: "Property Carousels" },
        { id: "mls", name: "MLS Settings" },
        { id: "faq", name: "FAQ Section" },
        { id: "footer", name: "Footer Section" },
        { id: "icons", name: "Icon Management" }
      ].map((tab) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setActiveTab(tab.id),
          className: `whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`,
          children: tab.name
        },
        tab.id
      )) }) }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
        activeTab === "header" && /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
          /* @__PURE__ */ jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start space-x-3", children: [
            /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 text-blue-600 mt-0.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium text-blue-800", children: "Header Navigation Links" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-blue-600 mt-1", children: "Customize the navigation links that appear in the website header. You can add, edit, reorder, or disable links." }),
              website?.id !== 1 && website?.slug && /* @__PURE__ */ jsxs("p", { className: "text-sm text-blue-700 mt-2 font-medium", children: [
                "Website Slug: ",
                /* @__PURE__ */ jsx("code", { className: "bg-blue-100 px-2 py-0.5 rounded", children: website.slug }),
                /* @__PURE__ */ jsxs("span", { className: "font-normal ml-2", children: [
                  "- URLs should include ",
                  /* @__PURE__ */ jsxs("code", { className: "bg-blue-100 px-1 py-0.5 rounded", children: [
                    "?website=",
                    website.slug
                  ] })
                ] })
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 p-6 rounded-lg", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Navigation Links" }),
            /* @__PURE__ */ jsx("div", { className: "space-y-4", children: (data.content.header_links?.links || []).map((link, index) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200", children: [
              /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx("span", { className: "inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500 text-sm font-medium", children: index + 1 }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 grid grid-cols-1 md:grid-cols-3 gap-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-500 mb-1", children: "Link Text" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      value: link.text,
                      onChange: (e) => {
                        const newLinks = [...data.content.header_links.links];
                        newLinks[index] = { ...newLinks[index], text: e.target.value };
                        setData("content", {
                          ...data.content,
                          header_links: { ...data.content.header_links, links: newLinks }
                        });
                      },
                      className: "block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                      placeholder: "Link text"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-500 mb-1", children: "URL" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      value: link.url,
                      onChange: (e) => {
                        const newLinks = [...data.content.header_links.links];
                        newLinks[index] = { ...newLinks[index], url: e.target.value };
                        setData("content", {
                          ...data.content,
                          header_links: { ...data.content.header_links, links: newLinks }
                        });
                      },
                      className: "block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                      placeholder: "/page-url"
                    }
                  ),
                  website?.id !== 1 && link.url && /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs text-green-600", children: [
                    "Preview: ",
                    buildUrlWithWebsite(link.url)
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "flex items-end gap-2", children: /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "checkbox",
                      checked: link.enabled !== false,
                      onChange: (e) => {
                        const newLinks = [...data.content.header_links.links];
                        newLinks[index] = { ...newLinks[index], enabled: e.target.checked };
                        setData("content", {
                          ...data.content,
                          header_links: { ...data.content.header_links, links: newLinks }
                        });
                      },
                      className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600", children: "Enabled" })
                ] }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex-shrink-0 flex items-center gap-2", children: [
                index > 0 && /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      const newLinks = [...data.content.header_links.links];
                      [newLinks[index - 1], newLinks[index]] = [newLinks[index], newLinks[index - 1]];
                      setData("content", {
                        ...data.content,
                        header_links: { ...data.content.header_links, links: newLinks }
                      });
                    },
                    className: "p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded",
                    title: "Move up",
                    children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 15l7-7 7 7" }) })
                  }
                ),
                index < (data.content.header_links?.links || []).length - 1 && /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      const newLinks = [...data.content.header_links.links];
                      [newLinks[index], newLinks[index + 1]] = [newLinks[index + 1], newLinks[index]];
                      setData("content", {
                        ...data.content,
                        header_links: { ...data.content.header_links, links: newLinks }
                      });
                    },
                    className: "p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded",
                    title: "Move down",
                    children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }) })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      const newLinks = data.content.header_links.links.filter((_, i) => i !== index);
                      setData("content", {
                        ...data.content,
                        header_links: { ...data.content.header_links, links: newLinks }
                      });
                    },
                    className: "p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded",
                    title: "Remove link",
                    children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) })
                  }
                )
              ] })
            ] }, link.id || index)) }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => {
                  const newLinks = [...data.content.header_links?.links || []];
                  const newId = Math.max(...newLinks.map((l) => l.id || 0), 0) + 1;
                  newLinks.push({ id: newId, text: "New Link", url: buildUrlWithWebsite("/"), enabled: true });
                  setData("content", {
                    ...data.content,
                    header_links: { ...data.content.header_links, links: newLinks }
                  });
                },
                className: "mt-4 inline-flex items-center px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors",
                children: [
                  /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 4v16m8-8H4" }) }),
                  "Add New Link"
                ]
              }
            )
          ] })
        ] }),
        activeTab === "hero" && /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 p-6 rounded-lg", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Hero Content" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Welcome Text" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: data.content.hero?.welcome_text || "",
                    onChange: (e) => updateHeroField("welcome_text", e.target.value),
                    className: "block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    placeholder: "WELCOME TO NOBU RESIDENCES"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Main Heading" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: data.content.hero?.main_heading || "",
                    onChange: (e) => updateHeroField("main_heading", e.target.value),
                    className: "block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    placeholder: "Your Next Home Is Just a Click Away"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Subheading" }),
                /* @__PURE__ */ jsx(
                  "textarea",
                  {
                    value: data.content.hero?.subheading || "",
                    onChange: (e) => updateHeroField("subheading", e.target.value),
                    rows: 3,
                    className: "block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    placeholder: "Whether buying or renting, Nobu makes finding your home easy and reliable."
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Background Image" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "file",
                  accept: "image/*",
                  onChange: (e) => setData("hero_background_image", e.target.files[0]),
                  className: "block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                }
              ),
              data.content.hero?.background_image && /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
                /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: data.content.hero.background_image,
                    alt: "Current background",
                    className: "w-20 h-20 object-cover rounded-lg border"
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-600", children: [
                  /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Current Image:" }),
                  /* @__PURE__ */ jsx("p", { className: "break-all", children: data.content.hero.background_image })
                ] })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Upload a new image to replace the current background image. Recommended size: 1920x1080px" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 p-6 rounded-lg", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Call-to-Action Buttons" }),
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-4", children: "Configure the buttons that appear in the hero section" }),
            data.content.hero?.buttons?.map((button, index) => /* @__PURE__ */ jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
                /* @__PURE__ */ jsxs("h4", { className: "text-sm font-semibold text-gray-800", children: [
                  "Button #",
                  index + 1
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => removeHeroButton(index),
                    className: "text-red-500 hover:text-red-700 p-1",
                    title: "Remove button",
                    children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Button Text" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      value: button.text,
                      onChange: (e) => updateHeroButton(index, "text", e.target.value),
                      placeholder: "Button text",
                      className: "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Link URL" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      value: button.url,
                      onChange: (e) => updateHeroButton(index, "url", e.target.value),
                      placeholder: "/rent or /sale",
                      className: "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Button Style" }),
                  /* @__PURE__ */ jsxs(
                    "select",
                    {
                      value: button.style,
                      onChange: (e) => updateHeroButton(index, "style", e.target.value),
                      className: "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                      children: [
                        /* @__PURE__ */ jsx("option", { value: "primary", children: "Primary (Blue)" }),
                        /* @__PURE__ */ jsx("option", { value: "secondary", children: "Secondary (Outlined)" })
                      ]
                    }
                  )
                ] })
              ] })
            ] }, index)),
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: addHeroButton,
                className: "inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors duration-200",
                children: [
                  /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 6v6m0 0v6m0-6h6m-6 0H6" }) }),
                  "Add New Button"
                ]
              }
            )
          ] })
        ] }),
        activeTab === "about" && /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 p-6 rounded-lg", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "About Section Content" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Section Title" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: data.content.about?.title || "",
                    onChange: (e) => updateAboutField("title", e.target.value),
                    className: "block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    placeholder: "Learn everything about Nobu Residence"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Overview Tab Content" }),
                /* @__PURE__ */ jsx(
                  "textarea",
                  {
                    value: data.content.about?.content || "",
                    onChange: (e) => updateAboutField("content", e.target.value),
                    rows: 5,
                    className: "block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    placeholder: "Found in Toronto's King West area and built in 2024..."
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Image Alt Text" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: data.content.about?.image_alt || "",
                    onChange: (e) => updateAboutField("image_alt", e.target.value),
                    className: "block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    placeholder: "Nobu Residence Building"
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 p-6 rounded-lg", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Key Facts Tab" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              (data.content.about?.tabs?.key_facts?.items || []).map((item, index) => /* @__PURE__ */ jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-3", children: [
                  /* @__PURE__ */ jsxs("h4", { className: "text-sm font-semibold text-gray-800", children: [
                    "Key Fact #",
                    index + 1
                  ] }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => removeAboutTabItem("key_facts", index),
                      className: "text-red-500 hover:text-red-700 p-1",
                      children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Text" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "text",
                        value: item.text || "",
                        onChange: (e) => updateAboutTabItem("key_facts", index, "text", e.target.value),
                        className: "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm",
                        placeholder: "e.g., 45 floors/ 657 units"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Icon" }),
                    /* @__PURE__ */ jsxs("div", { className: "flex gap-2 items-center", children: [
                      /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: renderIconPreview(item.icon, "key_facts") }),
                      /* @__PURE__ */ jsxs(
                        "select",
                        {
                          value: item.icon || "",
                          onChange: (e) => updateAboutTabItem("key_facts", index, "icon", e.target.value),
                          className: "flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm",
                          children: [
                            /* @__PURE__ */ jsx("option", { value: "", children: "Select icon..." }),
                            (availableIcons?.key_facts || []).map((icon) => /* @__PURE__ */ jsx("option", { value: icon.name, children: icon.name }, icon.id))
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          type: "button",
                          onClick: () => openInlineIconModal("key_facts", index),
                          className: "px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 text-sm",
                          title: "Upload new icon",
                          children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" }) })
                        }
                      )
                    ] })
                  ] })
                ] })
              ] }, index)),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => addAboutTabItem("key_facts", { text: "", icon: "" }),
                  className: "inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100",
                  children: [
                    /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 6v6m0 0v6m0-6h6m-6 0H6" }) }),
                    "Add Key Fact"
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 p-6 rounded-lg", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Amenities Tab" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              (data.content.about?.tabs?.amenities?.items || []).map((item, index) => /* @__PURE__ */ jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-3", children: [
                  /* @__PURE__ */ jsxs("h4", { className: "text-sm font-semibold text-gray-800", children: [
                    "Amenity #",
                    index + 1
                  ] }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => removeAboutTabItem("amenities", index),
                      className: "text-red-500 hover:text-red-700 p-1",
                      children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Text" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "text",
                        value: item.text || "",
                        onChange: (e) => updateAboutTabItem("amenities", index, "text", e.target.value),
                        className: "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm",
                        placeholder: "e.g., Concierge"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Icon" }),
                    /* @__PURE__ */ jsxs("div", { className: "flex gap-2 items-center", children: [
                      /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: renderIconPreview(item.icon, "amenities") }),
                      /* @__PURE__ */ jsxs(
                        "select",
                        {
                          value: item.icon || "",
                          onChange: (e) => updateAboutTabItem("amenities", index, "icon", e.target.value),
                          className: "flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm",
                          children: [
                            /* @__PURE__ */ jsx("option", { value: "", children: "Select icon..." }),
                            (availableIcons?.amenities || []).map((icon) => /* @__PURE__ */ jsx("option", { value: icon.name, children: icon.name }, icon.id))
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          type: "button",
                          onClick: () => openInlineIconModal("amenities", index),
                          className: "px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 text-sm",
                          title: "Upload new icon",
                          children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" }) })
                        }
                      )
                    ] })
                  ] })
                ] })
              ] }, index)),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => addAboutTabItem("amenities", { text: "", icon: "" }),
                  className: "inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100",
                  children: [
                    /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 6v6m0 0v6m0-6h6m-6 0H6" }) }),
                    "Add Amenity"
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 p-6 rounded-lg", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Highlights Tab" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              (data.content.about?.tabs?.highlights?.items || []).map((item, index) => /* @__PURE__ */ jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-3", children: [
                  /* @__PURE__ */ jsxs("h4", { className: "text-sm font-semibold text-gray-800", children: [
                    "Highlight #",
                    index + 1
                  ] }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => removeAboutTabItem("highlights", index),
                      className: "text-red-500 hover:text-red-700 p-1",
                      children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Text" }),
                    /* @__PURE__ */ jsx(
                      "textarea",
                      {
                        value: item.text || "",
                        onChange: (e) => updateAboutTabItem("highlights", index, "text", e.target.value),
                        rows: 2,
                        className: "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm",
                        placeholder: "e.g., Located at 15 Mercer St in Toronto's Entertainment District..."
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Icon" }),
                    /* @__PURE__ */ jsxs("div", { className: "flex gap-2 items-center", children: [
                      /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: renderIconPreview(item.icon, "highlights") }),
                      /* @__PURE__ */ jsxs(
                        "select",
                        {
                          value: item.icon || "",
                          onChange: (e) => updateAboutTabItem("highlights", index, "icon", e.target.value),
                          className: "flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm",
                          children: [
                            /* @__PURE__ */ jsx("option", { value: "", children: "Select icon..." }),
                            (availableIcons?.highlights || []).map((icon) => /* @__PURE__ */ jsx("option", { value: icon.name, children: icon.name }, icon.id))
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          type: "button",
                          onClick: () => openInlineIconModal("highlights", index),
                          className: "px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 text-sm",
                          title: "Upload new icon",
                          children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" }) })
                        }
                      )
                    ] })
                  ] })
                ] })
              ] }, index)),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => addAboutTabItem("highlights", { text: "", icon: "" }),
                  className: "inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100",
                  children: [
                    /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 6v6m0 0v6m0-6h6m-6 0H6" }) }),
                    "Add Highlight"
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "About Section Image" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "file",
                  accept: "image/*",
                  onChange: (e) => setData("about_image", e.target.files[0]),
                  className: "block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                }
              ),
              data.content.about?.image && /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
                /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: data.content.about.image,
                    alt: "Current image",
                    className: "w-20 h-20 object-cover rounded-lg border"
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-600", children: [
                  /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Current Image:" }),
                  /* @__PURE__ */ jsx("p", { className: "break-all", children: data.content.about.image })
                ] })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Upload a new image for the about section. Recommended size: 800x600px" })
            ] })
          ] }) })
        ] }),
        activeTab === "carousel" && /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
          /* @__PURE__ */ jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-blue-700", children: "Configure property carousels that display listings from your MLS feed." }) }),
          /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 p-6 rounded-lg", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "For Rent Carousel" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    id: "for_rent_enabled",
                    checked: data.content.carousel_settings?.for_rent?.enabled || false,
                    onChange: (e) => updateCarouselSetting("for_rent", "enabled", e.target.checked),
                    className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  }
                ),
                /* @__PURE__ */ jsx("label", { htmlFor: "for_rent_enabled", className: "ml-2 text-sm font-medium text-gray-700", children: "Enable For Rent Carousel" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Carousel Title" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: data.content.carousel_settings?.for_rent?.title || "",
                    onChange: (e) => updateCarouselSetting("for_rent", "title", e.target.value),
                    className: "block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    placeholder: "Properties for Rent"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Address Filter" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: data.content.carousel_settings?.for_rent?.address_filter || "",
                    onChange: (e) => updateCarouselSetting("for_rent", "address_filter", e.target.value),
                    className: "block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    placeholder: "Toronto, ON"
                  }
                ),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Filter properties by address or location" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Property Type" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: data.content.carousel_settings?.for_rent?.property_subtype || "",
                    onChange: (e) => updateCarouselSetting("for_rent", "property_subtype", e.target.value),
                    className: "block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    placeholder: "Condo"
                  }
                ),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "e.g., Condo, House, Townhouse" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Number of Properties" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "number",
                    value: data.content.carousel_settings?.for_rent?.limit || 6,
                    onChange: (e) => updateCarouselSetting("for_rent", "limit", parseInt(e.target.value)),
                    min: "1",
                    max: "20",
                    className: "block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 p-6 rounded-lg", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "For Sale Carousel" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    id: "for_sale_enabled",
                    checked: data.content.carousel_settings?.for_sale?.enabled || false,
                    onChange: (e) => updateCarouselSetting("for_sale", "enabled", e.target.checked),
                    className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  }
                ),
                /* @__PURE__ */ jsx("label", { htmlFor: "for_sale_enabled", className: "ml-2 text-sm font-medium text-gray-700", children: "Enable For Sale Carousel" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Carousel Title" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: data.content.carousel_settings?.for_sale?.title || "",
                    onChange: (e) => updateCarouselSetting("for_sale", "title", e.target.value),
                    className: "block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    placeholder: "Properties for Sale"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Address Filter" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: data.content.carousel_settings?.for_sale?.address_filter || "",
                    onChange: (e) => updateCarouselSetting("for_sale", "address_filter", e.target.value),
                    className: "block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    placeholder: "Toronto, ON"
                  }
                ),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Filter properties by address or location" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Property Type" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: data.content.carousel_settings?.for_sale?.property_subtype || "",
                    onChange: (e) => updateCarouselSetting("for_sale", "property_subtype", e.target.value),
                    className: "block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    placeholder: "Condo"
                  }
                ),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "e.g., Condo, House, Townhouse" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Number of Properties" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "number",
                    value: data.content.carousel_settings?.for_sale?.limit || 6,
                    onChange: (e) => updateCarouselSetting("for_sale", "limit", parseInt(e.target.value)),
                    min: "1",
                    max: "20",
                    className: "block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  }
                )
              ] })
            ] })
          ] })
        ] }),
        activeTab === "mls" && /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
          /* @__PURE__ */ jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-blue-700", children: "Configure default settings for MLS property listings on your website." }) }),
          /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 p-6 rounded-lg", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "MLS Default Settings" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Default City" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: data.content.mls_settings?.default_city || "",
                    onChange: (e) => updateMlsSettings("default_city", e.target.value),
                    className: "block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    placeholder: "Toronto"
                  }
                ),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Default city for MLS property searches" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Default Building Address" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: data.content.mls_settings?.default_building_address || "",
                    onChange: (e) => updateMlsSettings("default_building_address", e.target.value),
                    className: "block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    placeholder: "55 Mercer Street"
                  }
                ),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: 'Default building address for homepage property listings (e.g., "15 Mercer Street")' })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex", children: [
            /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx("svg", { className: "h-5 w-5 text-yellow-400", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) }) }),
            /* @__PURE__ */ jsxs("div", { className: "ml-3", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-yellow-800", children: "Note" }),
              /* @__PURE__ */ jsx("div", { className: "mt-2 text-sm text-yellow-700", children: /* @__PURE__ */ jsx("p", { children: "These settings will be used as defaults for property searches throughout your website. The building address will be used to find properties in the same building on the homepage." }) })
            ] })
          ] }) })
        ] }),
        activeTab === "faq" && /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 p-6 rounded-lg", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "FAQ Settings" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    id: "faq_enabled",
                    checked: data.content.faq?.enabled || false,
                    onChange: (e) => updateFaqField("enabled", e.target.checked),
                    className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  }
                ),
                /* @__PURE__ */ jsx("label", { htmlFor: "faq_enabled", className: "ml-2 text-sm font-medium text-gray-700", children: "Enable FAQ Section" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Section Title" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: data.content.faq?.title || "",
                    onChange: (e) => updateFaqField("title", e.target.value),
                    className: "block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    placeholder: "Frequently Asked Questions"
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "FAQ Items" }),
            data.content.faq?.items?.map((item, index) => /* @__PURE__ */ jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4 shadow-sm", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-3", children: [
                /* @__PURE__ */ jsxs("h4", { className: "text-sm font-semibold text-gray-800", children: [
                  "FAQ #",
                  index + 1
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => removeFaqItem(index),
                    className: "text-red-500 hover:text-red-700 p-1",
                    children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Question" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      value: item.question,
                      onChange: (e) => updateFaqItem(index, "question", e.target.value),
                      className: "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                      placeholder: "Enter question..."
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Answer" }),
                  /* @__PURE__ */ jsx(
                    "textarea",
                    {
                      value: item.answer,
                      onChange: (e) => updateFaqItem(index, "answer", e.target.value),
                      rows: 3,
                      className: "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                      placeholder: "Enter answer..."
                    }
                  )
                ] })
              ] })
            ] }, index)),
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: addFaqItem,
                className: "inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors duration-200",
                children: [
                  /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 6v6m0 0v6m0-6h6m-6 0H6" }) }),
                  "Add FAQ Item"
                ]
              }
            )
          ] })
        ] }),
        activeTab === "footer" && /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 p-6 rounded-lg", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Footer Settings" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    id: "footer_enabled",
                    checked: data.content.footer?.enabled || false,
                    onChange: (e) => updateFooterField("enabled", e.target.checked),
                    className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  }
                ),
                /* @__PURE__ */ jsx("label", { htmlFor: "footer_enabled", className: "ml-2 text-sm font-medium text-gray-700", children: "Enable Footer Section" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Footer Heading" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: data.content.footer?.heading || "",
                    onChange: (e) => updateFooterField("heading", e.target.value),
                    className: "block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    placeholder: "Your new home is waiting"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Footer Subheading" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: data.content.footer?.subheading || "",
                    onChange: (e) => updateFooterField("subheading", e.target.value),
                    className: "block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    placeholder: "Apply online in minutes..."
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Footer Description" }),
                /* @__PURE__ */ jsx(
                  "textarea",
                  {
                    value: data.content.footer?.description || "",
                    onChange: (e) => updateFooterField("description", e.target.value),
                    rows: 3,
                    className: "block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    placeholder: "Experience luxury living..."
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Copyright Text" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: data.content.footer?.copyright_text || "",
                    onChange: (e) => updateFooterField("copyright_text", e.target.value),
                    className: "block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    placeholder: "© 2024 Nobu Residences. All rights reserved."
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Footer Logo" }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "file",
                    accept: "image/*",
                    onChange: (e) => setData("footer_logo", e.target.files[0]),
                    className: "block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  }
                ),
                data.content.footer?.logo_url && /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
                  /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: data.content.footer.logo_url,
                      alt: "Footer logo",
                      className: "h-12 object-contain"
                    }
                  ),
                  /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600", children: /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Current Logo" }) })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Footer Background Image" }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "file",
                    accept: "image/*",
                    onChange: (e) => setData("footer_background_image", e.target.files[0]),
                    className: "block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  }
                ),
                data.content.footer?.background_image && /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
                  /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: data.content.footer.background_image,
                      alt: "Footer background",
                      className: "w-20 h-20 object-cover rounded-lg border"
                    }
                  ),
                  /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600", children: /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Current Background" }) })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 p-6 rounded-lg", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Quick Links" }),
            data.content.footer?.quick_links?.map((link, index) => /* @__PURE__ */ jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4 mb-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-3", children: [
                /* @__PURE__ */ jsxs("h4", { className: "text-sm font-semibold text-gray-800", children: [
                  "Link #",
                  index + 1
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => removeFooterQuickLink(index),
                    className: "text-red-500 hover:text-red-700 p-1",
                    children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Link Text" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      value: link.text,
                      onChange: (e) => updateFooterQuickLink(index, "text", e.target.value),
                      className: "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm",
                      placeholder: "Link text"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Link URL" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      value: link.url,
                      onChange: (e) => updateFooterQuickLink(index, "url", e.target.value),
                      className: "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm",
                      placeholder: "/page-url"
                    }
                  )
                ] })
              ] })
            ] }, index)),
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: addFooterQuickLink,
                className: "inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100",
                children: [
                  /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 6v6m0 0v6m0-6h6m-6 0H6" }) }),
                  "Add Quick Link"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 p-6 rounded-lg", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Additional Links" }),
            data.content.footer?.additional_links?.map((link, index) => /* @__PURE__ */ jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4 mb-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-3", children: [
                /* @__PURE__ */ jsxs("h4", { className: "text-sm font-semibold text-gray-800", children: [
                  "Link #",
                  index + 1
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => removeFooterAdditionalLink(index),
                    className: "text-red-500 hover:text-red-700 p-1",
                    children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Link Text" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      value: link.text,
                      onChange: (e) => updateFooterAdditionalLink(index, "text", e.target.value),
                      className: "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm",
                      placeholder: "Link text"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Link URL" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      value: link.url,
                      onChange: (e) => updateFooterAdditionalLink(index, "url", e.target.value),
                      className: "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm",
                      placeholder: "/page-url"
                    }
                  )
                ] })
              ] })
            ] }, index)),
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: addFooterAdditionalLink,
                className: "inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100",
                children: [
                  /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 6v6m0 0v6m0-6h6m-6 0H6" }) }),
                  "Add Additional Link"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 p-6 rounded-lg", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Contact Information" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    id: "use_global_contact",
                    checked: data.content.footer?.contact_info?.use_global_contact || false,
                    onChange: (e) => setData("content", {
                      ...data.content,
                      footer: {
                        ...data.content.footer,
                        contact_info: {
                          ...data.content.footer?.contact_info,
                          use_global_contact: e.target.checked
                        }
                      }
                    }),
                    className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  }
                ),
                /* @__PURE__ */ jsx("label", { htmlFor: "use_global_contact", className: "ml-2 text-sm font-medium text-gray-700", children: "Use global contact information" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "When enabled, uses contact information from website settings" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 p-6 rounded-lg", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Social Media" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    id: "use_global_social",
                    checked: data.content.footer?.social_media?.use_global_social || false,
                    onChange: (e) => setData("content", {
                      ...data.content,
                      footer: {
                        ...data.content.footer,
                        social_media: {
                          ...data.content.footer?.social_media,
                          use_global_social: e.target.checked
                        }
                      }
                    }),
                    className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  }
                ),
                /* @__PURE__ */ jsx("label", { htmlFor: "use_global_social", className: "ml-2 text-sm font-medium text-gray-700", children: "Use global social media links" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "When enabled, uses social media links from website settings" })
            ] })
          ] })
        ] }),
        activeTab === "icons" && /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
          /* @__PURE__ */ jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start space-x-3", children: [
            /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 text-blue-600 mt-0.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium text-blue-800", children: "Icon Management" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-blue-600 mt-1", children: "Manage icons that appear in the About section tabs (Key Facts, Amenities, etc.). Both SVG and PNG/JPG formats are supported." })
            ] })
          ] }) }),
          categoryOptions.map((category) => /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h4", { className: "text-lg font-medium text-gray-900 mb-4", children: [
              category.label,
              " Icons"
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-600 mb-4", children: [
              "Icons used in the ",
              category.label.toLowerCase(),
              " section"
            ] }),
            renderIconGrid(category.value)
          ] }, category.value))
        ] }),
        activeTab !== "icons" && /* @__PURE__ */ jsx("div", { className: "flex justify-end pt-8 border-t border-gray-200", children: /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: processing,
            className: "inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-lg font-semibold text-sm text-white shadow-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200",
            children: processing ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs("svg", { className: "animate-spin -ml-1 mr-3 h-4 w-4 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [
                /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                /* @__PURE__ */ jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
              ] }),
              "Saving Changes..."
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) }),
              "Save Changes"
            ] })
          }
        ) })
      ] })
    ] }) }) }),
    showInlineIconModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50", children: /* @__PURE__ */ jsx("div", { className: "relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white", children: /* @__PURE__ */ jsxs("div", { className: "mt-3", children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: [
        "Upload New ",
        categoryOptions.find((c) => c.value === inlineIconCategory)?.label,
        " Icon"
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleInlineIconSubmit, encType: "multipart/form-data", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Icon Name" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: iconData.name,
                onChange: (e) => setIconData("name", e.target.value),
                className: "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2",
                placeholder: "e.g., building, calendar, location",
                required: true
              }
            ),
            iconErrors.name && /* @__PURE__ */ jsx("p", { className: "text-red-500 text-xs mt-1", children: iconErrors.name })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Icon File" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "file",
                accept: ".svg,.png,.jpg,.jpeg",
                onChange: (e) => setIconData("icon_file", e.target.files[0]),
                className: "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2",
                required: true
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Supported formats: SVG (preferred), PNG, JPG (max 2MB)" }),
            iconErrors.icon_file && /* @__PURE__ */ jsx("p", { className: "text-red-500 text-xs mt-1", children: iconErrors.icon_file })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end space-x-2 mt-6", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                setShowInlineIconModal(false);
                setInlineIconCategory("");
                setInlineIconIndex(null);
                resetIcon();
              },
              className: "px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: iconProcessing,
              className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50",
              children: iconProcessing ? "Uploading..." : "Upload Icon"
            }
          )
        ] })
      ] })
    ] }) }) }),
    showIconModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50", children: /* @__PURE__ */ jsx("div", { className: "relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white", children: /* @__PURE__ */ jsxs("div", { className: "mt-3", children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: [
        "Add New ",
        categoryOptions.find((c) => c.value === selectedCategory)?.label,
        " Icon"
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleIconSubmit, encType: "multipart/form-data", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Icon Name" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: iconData.name,
                onChange: (e) => setIconData("name", e.target.value),
                className: "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2",
                placeholder: "e.g., gym, pool, building",
                required: true
              }
            ),
            iconErrors.name && /* @__PURE__ */ jsx("p", { className: "text-red-500 text-xs mt-1", children: iconErrors.name })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Category" }),
            /* @__PURE__ */ jsx(
              "select",
              {
                value: iconData.category,
                onChange: (e) => setIconData("category", e.target.value),
                className: "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2",
                children: categoryOptions.map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value))
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Icon File" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "file",
                accept: ".svg,.png,.jpg,.jpeg",
                onChange: (e) => setIconData("icon_file", e.target.files[0]),
                className: "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2",
                required: true
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Supported formats: SVG, PNG, JPG (max 2MB)" }),
            iconErrors.icon_file && /* @__PURE__ */ jsx("p", { className: "text-red-500 text-xs mt-1", children: iconErrors.icon_file })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end space-x-2 mt-6", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                setShowIconModal(false);
                resetIcon();
              },
              className: "px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: iconProcessing,
              className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50",
              children: iconProcessing ? "Uploading..." : "Add Icon"
            }
          )
        ] })
      ] })
    ] }) }) }),
    showEditIconModal && selectedIcon && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50", children: /* @__PURE__ */ jsx("div", { className: "relative top-10 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto", children: /* @__PURE__ */ jsxs("div", { className: "mt-3", children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: [
        "Edit Icon: ",
        selectedIcon.name
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleEditIconSubmit, encType: "multipart/form-data", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Icon Name" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: editIconData.name,
                onChange: (e) => setEditIconData("name", e.target.value),
                className: "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2",
                required: true
              }
            ),
            editIconErrors.name && /* @__PURE__ */ jsx("p", { className: "text-red-500 text-xs mt-1", children: editIconErrors.name })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Current Icon" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3 p-3 bg-gray-50 rounded-md", children: [
              /* @__PURE__ */ jsx("div", { className: "w-12 h-12 flex items-center justify-center bg-white rounded border", children: selectedIcon.svg_content ? /* @__PURE__ */ jsx(
                "div",
                {
                  dangerouslySetInnerHTML: { __html: selectedIcon.svg_content },
                  className: "w-8 h-8"
                }
              ) : selectedIcon.icon_url ? /* @__PURE__ */ jsx(
                "img",
                {
                  src: selectedIcon.icon_url,
                  alt: selectedIcon.name,
                  className: "w-8 h-8 object-contain"
                }
              ) : /* @__PURE__ */ jsx("span", { className: "text-gray-400 text-xs", children: "No Icon" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: selectedIcon.name }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 capitalize", children: selectedIcon.category.replace("_", " ") }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400", children: selectedIcon.svg_content ? "SVG Format" : "Image Format" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Category" }),
            /* @__PURE__ */ jsx(
              "select",
              {
                value: editIconData.category,
                onChange: (e) => setEditIconData("category", e.target.value),
                className: "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2",
                children: categoryOptions.map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value))
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Replace Icon (Optional)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "file",
                accept: ".svg,.png,.jpg,.jpeg",
                onChange: (e) => setEditIconData("icon_file", e.target.files[0]),
                className: "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Upload a new file to replace the current icon. Leave empty to keep current icon." }),
            editIconErrors.icon_file && /* @__PURE__ */ jsx("p", { className: "text-red-500 text-xs mt-1", children: editIconErrors.icon_file })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Description (Optional)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: editIconData.description,
                onChange: (e) => setEditIconData("description", e.target.value),
                className: "mt-1 block w-full border border-gray-300 rounded-md px-3 py-2",
                placeholder: "Brief description of the icon"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { className: "flex items-center", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  checked: editIconData.is_active,
                  onChange: (e) => setEditIconData("is_active", e.target.checked),
                  className: "rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "ml-2 text-sm font-medium text-gray-700", children: "Active" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Inactive icons won't be available for use in website sections." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end space-x-2 mt-6", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                setShowEditIconModal(false);
                setSelectedIcon(null);
                resetEditIcon();
              },
              className: "px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: editIconProcessing,
              className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50",
              children: editIconProcessing ? "Updating..." : "Update Icon"
            }
          )
        ] })
      ] })
    ] }) }) })
  ] });
}
export {
  EditHomePage as default
};
