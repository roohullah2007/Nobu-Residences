import { jsxs, jsx } from "react/jsx-runtime";
import { useForm, Head, Link, router } from "@inertiajs/react";
import { A as AdminLayout } from "./AdminLayout-CfYoZrH6.js";
import { I as InputError } from "./InputError-CBvD_6aD.js";
import { I as InputLabel } from "./InputLabel-DE424DvN.js";
import { P as PrimaryButton } from "./PrimaryButton-DDF1xnxF.js";
import { T as TextInput } from "./TextInput-D0qTZeQv.js";
import { P as PhoneInput } from "./PhoneInput-BOSF9o14.js";
import { useState, useMemo, useEffect } from "react";
const lightFormClass = "[&_input]:!bg-white [&_input]:!text-gray-900 [&_textarea]:!bg-white [&_textarea]:!text-gray-900 [&_select]:!bg-white [&_select]:!text-gray-900";
function Create({ auth, buildings = [], defaultAgent = null, defaultBranding = null, defaultContactInfo = {}, defaultSocialMedia = {}, ploiEnabled = false, preselectedBuildingId = null }) {
  const [step, setStep] = useState(1);
  const [buildingSearch, setBuildingSearch] = useState("");
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [aiSeoLoading, setAiSeoLoading] = useState(false);
  const [aiSeoError, setAiSeoError] = useState("");
  const { data, setData, processing, errors } = useForm({
    building_id: "",
    name: "",
    slug: "",
    domain: "",
    is_default: false,
    is_active: true,
    // Homepage settings. use_building_as_homepage defaults OFF so new
    // sites get the same Home page design as the default (Nobu) site,
    // with hero/facts/counts dynamically resolved from the linked
    // building. Admins can still opt in to the full BuildingDetail-as-
    // homepage via the checkbox on Admin > Websites > Edit.
    use_building_as_homepage: false,
    homepage_building_id: "",
    // File uploads
    logo_file: null,
    favicon_file: null,
    agent_profile_image: null,
    // Text URLs (fallback if no file uploaded)
    logo_url: defaultBranding?.logo_url || "",
    favicon_url: defaultBranding?.favicon_url || "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    description: "",
    timezone: "America/Toronto",
    // Core brand colors
    "brand_colors.primary": "#912018",
    "brand_colors.secondary": "#293056",
    "brand_colors.accent": "#F5F8FF",
    "brand_colors.text": "#000000",
    "brand_colors.background": "#FFFFFF",
    // Button colors - Primary (Blue buttons - Available Building, Sign Up/Log In)
    "brand_colors.button_primary_bg": "#293056",
    "brand_colors.button_primary_text": "#FFFFFF",
    // Button colors - Secondary (Red/Brown buttons - Contact Agent, Show All Listings)
    "brand_colors.button_secondary_bg": "#912018",
    "brand_colors.button_secondary_text": "#FFFFFF",
    // Button colors - Tertiary (Black buttons - Request Building Tour)
    "brand_colors.button_tertiary_bg": "#000000",
    "brand_colors.button_tertiary_text": "#FFFFFF",
    // Button colors - Quaternary (White/Light buttons - outline)
    "brand_colors.button_quaternary_bg": "#FFFFFF",
    "brand_colors.button_quaternary_text": "#293056",
    // Footer colors
    "brand_colors.footer_bg": "#1a1a2e",
    "brand_colors.footer_text": "#FFFFFF",
    // Link colors
    "brand_colors.link_color": "#912018",
    "brand_colors.link_hover": "#6d1812",
    // Contact info — inherits from the default (Nobu) website so new
    // sites have a working phone/email/address out of the box.
    "contact_info.phone": defaultContactInfo?.phone || "",
    "contact_info.email": defaultContactInfo?.email || "",
    "contact_info.address": defaultContactInfo?.address || "",
    // Agent info — inherits from the default (Nobu) website's agentInfo
    // row. We deliberately don't fall back to hardcoded strings here
    // because the old fallback ("Property Manager / Property.ca Inc")
    // didn't match the current Nobu setup ("Agent / RE/MAX") and ended
    // up overwriting fresh state with stale data when defaultAgent was
    // present but a single field was empty.
    agent_name: defaultAgent?.agent_name || "",
    agent_title: defaultAgent?.agent_title || "",
    agent_phone: defaultAgent?.agent_phone || "",
    brokerage: defaultAgent?.brokerage || "",
    // Social media — same pattern, inherits from default site.
    "social_media.facebook": defaultSocialMedia?.facebook || "",
    "social_media.instagram": defaultSocialMedia?.instagram || "",
    "social_media.twitter": defaultSocialMedia?.twitter || "",
    "social_media.linkedin": defaultSocialMedia?.linkedin || ""
  });
  const [logoPreview, setLogoPreview] = useState(defaultBranding?.logo_url || "");
  const [faviconPreview, setFaviconPreview] = useState(defaultBranding?.favicon_url || "");
  const [agentPhotoPreview, setAgentPhotoPreview] = useState(defaultAgent?.profile_image || "");
  const filteredBuildings = useMemo(() => {
    const q = buildingSearch.trim().toLowerCase();
    if (!q) return buildings;
    return buildings.filter(
      (b) => (b.name || "").toLowerCase().includes(q) || (b.address || "").toLowerCase().includes(q) || (b.city || "").toLowerCase().includes(q)
    );
  }, [buildings, buildingSearch]);
  const applyBuildingDefaults = (building) => {
    if (!building) return;
    const fallbackAgent = {
      name: defaultAgent?.agent_name || "",
      title: defaultAgent?.agent_title || "",
      phone: defaultAgent?.agent_phone || "",
      brokerage: defaultAgent?.brokerage || "",
      image: defaultAgent?.profile_image || ""
    };
    setData((prev) => ({
      ...prev,
      building_id: building.id,
      homepage_building_id: building.id,
      // NOTE: deliberately NOT forcing use_building_as_homepage here —
      // the homepage keeps the shared Home design (dynamic per-building
      // values); the flag stays whatever the form default is.
      name: building.name || prev.name,
      meta_title: building.name ? `${building.name} - Official Site` : prev.meta_title,
      meta_description: building.description || prev.meta_description,
      "contact_info.address": building.address || prev["contact_info.address"],
      "contact_info.phone": building.agent_phone || prev["contact_info.phone"] || fallbackAgent.phone,
      "contact_info.email": building.agent_email || prev["contact_info.email"],
      agent_name: building.agent_name || fallbackAgent.name,
      agent_title: building.agent_title || fallbackAgent.title,
      agent_phone: building.agent_phone || fallbackAgent.phone,
      brokerage: building.agent_brokerage || fallbackAgent.brokerage
      // Keep the Nobu logo as the default — building.main_image is an exterior photo, not a logo
    }));
    setAgentPhotoPreview(building.agent_image || fallbackAgent.image || "");
  };
  const generateSeoWithAi = async () => {
    setAiSeoLoading(true);
    setAiSeoError("");
    try {
      const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";
      const res = await fetch(route("admin.websites.ai-generate-seo"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrf,
          "Accept": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify({
          name: data.name,
          building_id: data.building_id || null
        })
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const json = await res.json();
      setData((prev) => ({
        ...prev,
        meta_title: json.title || prev.meta_title,
        meta_description: json.description || prev.meta_description,
        meta_keywords: json.keywords || prev.meta_keywords
      }));
    } catch (err) {
      setAiSeoError(err.message || "AI generation failed");
    } finally {
      setAiSeoLoading(false);
    }
  };
  const chooseBuilding = (building) => {
    setSelectedBuildingId(building.id);
    applyBuildingDefaults(building);
    setStep(2);
  };
  useEffect(() => {
    if (!preselectedBuildingId) return;
    const building = buildings.find((b) => String(b.id) === String(preselectedBuildingId));
    if (building) {
      chooseBuilding(building);
    }
  }, []);
  const submit = (e) => {
    e.preventDefault();
    router.post(route("admin.websites.store"), data, {
      forceFormData: true,
      preserveScroll: true,
      onError: (errs) => console.error("Form errors:", errs)
    });
  };
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setData("logo_file", file);
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };
  const handleFaviconUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setData("favicon_file", file);
    const reader = new FileReader();
    reader.onload = (ev) => setFaviconPreview(ev.target.result);
    reader.readAsDataURL(file);
  };
  const handleAgentPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setData("agent_profile_image", file);
    const reader = new FileReader();
    reader.onload = (ev) => setAgentPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };
  return /* @__PURE__ */ jsxs(AdminLayout, { title: "Create New Website", children: [
    /* @__PURE__ */ jsx(Head, { title: "Create New Website" }),
    /* @__PURE__ */ jsxs("div", { className: `space-y-8 ${lightFormClass}`, children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white shadow-sm sm:rounded-lg p-4 flex items-center gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-2 ${step === 1 ? "text-indigo-700 font-semibold" : "text-gray-500"}`, children: [
          /* @__PURE__ */ jsx("span", { className: `h-7 w-7 rounded-full flex items-center justify-center text-sm ${step === 1 ? "bg-indigo-600 text-white" : "bg-gray-200"}`, children: "1" }),
          "Select Building"
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-gray-300", children: "/" }),
        /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-2 ${step === 2 ? "text-indigo-700 font-semibold" : "text-gray-500"}`, children: [
          /* @__PURE__ */ jsx("span", { className: `h-7 w-7 rounded-full flex items-center justify-center text-sm ${step === 2 ? "bg-indigo-600 text-white" : "bg-gray-200"}`, children: "2" }),
          "Website Details ",
          ploiEnabled ? /* @__PURE__ */ jsx("span", { className: "ml-2 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700", children: "Ploi auto-alias" }) : null
        ] })
      ] }),
      step === 1 && /* @__PURE__ */ jsx("div", { className: "bg-white overflow-hidden shadow-sm sm:rounded-lg", children: /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-4 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Select a Building" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Pick the building this website will represent — we'll auto-fill the basics from its data." })
          ] }),
          /* @__PURE__ */ jsx(
            Link,
            {
              href: route("admin.buildings.create"),
              className: "inline-flex items-center px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md shadow-sm",
              children: "+ Create New Building"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx(
          TextInput,
          {
            type: "text",
            value: buildingSearch,
            onChange: (e) => setBuildingSearch(e.target.value),
            placeholder: "Search by name, address, or city...",
            className: "block w-full"
          }
        ) }),
        filteredBuildings.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12 border-2 border-dashed border-gray-200 rounded-lg", children: [
          /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "No buildings found." }),
          /* @__PURE__ */ jsx(
            Link,
            {
              href: route("admin.buildings.create"),
              className: "mt-3 inline-flex items-center px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md",
              children: "Create your first building"
            }
          )
        ] }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-1", children: filteredBuildings.map((b) => /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => chooseBuilding(b),
            className: `text-left border rounded-lg p-4 hover:border-indigo-500 hover:shadow transition-all flex gap-3 items-start ${selectedBuildingId === b.id ? "border-indigo-600 ring-2 ring-indigo-200" : "border-gray-200"}`,
            children: [
              b.main_image ? /* @__PURE__ */ jsx("img", { src: b.main_image, alt: b.name, className: "h-16 w-16 rounded object-cover flex-shrink-0" }) : /* @__PURE__ */ jsx("div", { className: "h-16 w-16 rounded bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0", children: /* @__PURE__ */ jsx("svg", { className: "h-7 w-7", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M3 21h18M5 21V7l7-4 7 4v14M9 9h2m-2 4h2m4-4h2m-2 4h2" }) }) }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-900 truncate", children: b.name }),
                /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500 truncate", children: b.address || b.city || "—" })
              ] })
            ]
          },
          b.id
        )) })
      ] }) }),
      step === 2 && (() => {
        const chosenBuilding = buildings.find((b) => b.id === selectedBuildingId);
        return /* @__PURE__ */ jsx("div", { className: "bg-white overflow-hidden shadow-sm sm:rounded-lg", children: /* @__PURE__ */ jsxs("div", { className: "p-6 text-gray-900", children: [
          chosenBuilding && /* @__PURE__ */ jsxs("div", { className: "mb-6 border border-indigo-200 bg-indigo-50/40 rounded-lg p-4 flex items-center gap-4", children: [
            chosenBuilding.main_image ? /* @__PURE__ */ jsx(
              "img",
              {
                src: chosenBuilding.main_image,
                alt: chosenBuilding.name,
                className: "h-16 w-16 rounded object-cover flex-shrink-0 opacity-90"
              }
            ) : /* @__PURE__ */ jsx("div", { className: "h-16 w-16 rounded bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0", children: /* @__PURE__ */ jsx("svg", { className: "h-7 w-7", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M3 21h18M5 21V7l7-4 7 4v14M9 9h2m-2 4h2m4-4h2m-2 4h2" }) }) }),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xs uppercase font-semibold tracking-wide text-indigo-700", children: "Selected Building" }),
                /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-gray-500", children: [
                  /* @__PURE__ */ jsx("svg", { className: "h-3.5 w-3.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 11c0-1.105.895-2 2-2s2 .895 2 2v2H8v-2c0-1.105.895-2 2-2zM5 13h14v8H5v-8z" }) }),
                  "Locked"
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-900 truncate", children: chosenBuilding.name }),
              /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500 truncate", children: chosenBuilding.address || chosenBuilding.city || "—" })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setStep(1),
                className: "text-sm text-indigo-600 hover:text-indigo-800 font-medium whitespace-nowrap",
                children: "Change building"
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setStep(1),
              className: "text-sm text-indigo-600 hover:text-indigo-800",
              children: "← Back to building selection"
            }
          ) }),
          /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 rounded-lg p-6", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Basic Information" }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(InputLabel, { htmlFor: "name", value: "Website Name" }),
                  /* @__PURE__ */ jsx(
                    TextInput,
                    {
                      id: "name",
                      type: "text",
                      name: "name",
                      value: data.name,
                      className: "mt-1 block w-full",
                      autoComplete: "name",
                      isFocused: true,
                      onChange: (e) => setData("name", e.target.value),
                      placeholder: "e.g., Luxury Downtown Condos"
                    }
                  ),
                  /* @__PURE__ */ jsx(InputError, { message: errors.name, className: "mt-2" })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(InputLabel, { htmlFor: "domain", value: "Custom Domain (Optional)" }),
                  /* @__PURE__ */ jsx(
                    TextInput,
                    {
                      id: "domain",
                      type: "text",
                      name: "domain",
                      value: data.domain,
                      className: "mt-1 block w-full",
                      onChange: (e) => setData("domain", e.target.value),
                      placeholder: "e.g., luxurycondos.com"
                    }
                  ),
                  /* @__PURE__ */ jsx(InputError, { message: errors.domain, className: "mt-2" }),
                  ploiEnabled ? /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-green-700", children: "This domain will be added to the server (Ploi) and get an SSL certificate automatically. Make sure the domain's DNS A record points to this server first." }) : data.domain && /* @__PURE__ */ jsxs("div", { className: "mt-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800", children: [
                    /* @__PURE__ */ jsx("p", { className: "font-semibold", children: "Automatic domain connection is currently OFF." }),
                    /* @__PURE__ */ jsx("p", { className: "mt-1", children: `The site will be saved, but this domain will not be connected to the server automatically. To enable it, set PLOI_API_TOKEN, PLOI_SERVER_ID and PLOI_SITE_ID in the server's .env, then use "Retry" on the website's status page. The domain's DNS A record must also point to the server.` })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(InputLabel, { htmlFor: "timezone", value: "Timezone" }),
                  /* @__PURE__ */ jsxs(
                    "select",
                    {
                      id: "timezone",
                      name: "timezone",
                      value: data.timezone,
                      onChange: (e) => setData("timezone", e.target.value),
                      className: "mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm",
                      children: [
                        /* @__PURE__ */ jsx("option", { value: "America/Toronto", children: "America/Toronto" }),
                        /* @__PURE__ */ jsx("option", { value: "America/New_York", children: "America/New_York" }),
                        /* @__PURE__ */ jsx("option", { value: "America/Los_Angeles", children: "America/Los_Angeles" }),
                        /* @__PURE__ */ jsx("option", { value: "America/Chicago", children: "America/Chicago" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsx(InputError, { message: errors.timezone, className: "mt-2" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 rounded-lg p-6", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Logo & Branding" }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(InputLabel, { htmlFor: "logo_file", value: "Logo" }),
                  /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center space-x-4", children: [
                    logoPreview && /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: logoPreview,
                        alt: "Logo preview",
                        className: "h-16 w-auto object-contain border border-gray-200 rounded p-1 bg-white"
                      }
                    ) }),
                    /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsx("div", { className: "flex justify-center px-4 py-4 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                      /* @__PURE__ */ jsx("svg", { className: "mx-auto h-8 w-8 text-gray-400", stroke: "currentColor", fill: "none", viewBox: "0 0 48 48", children: /* @__PURE__ */ jsx("path", { d: "M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) }),
                      /* @__PURE__ */ jsxs("label", { htmlFor: "logo_file", className: "relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500", children: [
                        /* @__PURE__ */ jsx("span", { children: "Upload Logo" }),
                        /* @__PURE__ */ jsx(
                          "input",
                          {
                            id: "logo_file",
                            name: "logo_file",
                            type: "file",
                            className: "sr-only",
                            accept: "image/png,image/jpeg,image/jpg,image/svg+xml,image/webp",
                            onChange: handleLogoUpload
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "PNG, JPG, SVG up to 2MB" })
                    ] }) }) })
                  ] }),
                  logoPreview && /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => {
                        setLogoPreview("");
                        setData("logo_file", null);
                      },
                      className: "mt-2 text-sm text-red-600 hover:text-red-800",
                      children: "Remove Logo"
                    }
                  ),
                  /* @__PURE__ */ jsx(InputError, { message: errors.logo_file, className: "mt-2" })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(InputLabel, { htmlFor: "favicon_file", value: "Favicon" }),
                  /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center space-x-4", children: [
                    faviconPreview && /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: faviconPreview,
                        alt: "Favicon preview",
                        className: "h-10 w-10 object-contain border border-gray-200 rounded p-1 bg-white"
                      }
                    ) }),
                    /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsx("div", { className: "flex justify-center px-4 py-4 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                      /* @__PURE__ */ jsx("svg", { className: "mx-auto h-8 w-8 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" }) }),
                      /* @__PURE__ */ jsxs("label", { htmlFor: "favicon_file", className: "relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500", children: [
                        /* @__PURE__ */ jsx("span", { children: "Upload Favicon" }),
                        /* @__PURE__ */ jsx(
                          "input",
                          {
                            id: "favicon_file",
                            name: "favicon_file",
                            type: "file",
                            className: "sr-only",
                            accept: "image/png,image/jpeg,image/x-icon,image/ico,image/svg+xml",
                            onChange: handleFaviconUpload
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: "ICO, PNG, SVG up to 1MB" })
                    ] }) }) })
                  ] }),
                  faviconPreview && /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => {
                        setFaviconPreview("");
                        setData("favicon_file", null);
                      },
                      className: "mt-2 text-sm text-red-600 hover:text-red-800",
                      children: "Remove Favicon"
                    }
                  ),
                  /* @__PURE__ */ jsx(InputError, { message: errors.favicon_file, className: "mt-2" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 rounded-lg p-6 space-y-6", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Brand Colors" }),
              /* @__PURE__ */ jsxs("div", { className: "border-b border-gray-200 pb-6", children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-3", children: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" }) }),
                  "Core Brand Colors"
                ] }) }),
                /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
                  { key: "brand_colors.primary", label: "Primary", desc: "Main brand color" },
                  { key: "brand_colors.accent", label: "Accent", desc: "Highlight color" },
                  { key: "brand_colors.text", label: "Text", desc: "Text color" },
                  { key: "brand_colors.background", label: "Background", desc: "Page background" }
                ].map((color) => /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: color.label }),
                  /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "color",
                        value: data[color.key],
                        onChange: (e) => setData(color.key, e.target.value),
                        className: "h-12 w-full rounded-md border border-gray-300 cursor-pointer"
                      }
                    ),
                    /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-gray-500 text-center", children: data[color.key] })
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 mt-1", children: color.desc })
                ] }, color.key)) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "border-b border-gray-200 pb-6 pt-4", children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-3", children: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" }) }),
                  "Button Colors"
                ] }) }),
                /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
                  { key: "brand_colors.button_primary_bg", label: "Primary BG", desc: "Blue buttons" },
                  { key: "brand_colors.button_primary_text", label: "Primary Text", desc: "Primary text" },
                  { key: "brand_colors.button_secondary_bg", label: "Secondary BG", desc: "Red/Brown buttons" },
                  { key: "brand_colors.button_secondary_text", label: "Secondary Text", desc: "Secondary text" },
                  { key: "brand_colors.button_tertiary_bg", label: "Tertiary BG", desc: "Black buttons" },
                  { key: "brand_colors.button_tertiary_text", label: "Tertiary Text", desc: "Tertiary text" },
                  { key: "brand_colors.button_quaternary_bg", label: "Quaternary BG", desc: "White buttons" },
                  { key: "brand_colors.button_quaternary_text", label: "Quaternary Text", desc: "Quaternary text" }
                ].map((color) => /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: color.label }),
                  /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "color",
                        value: data[color.key],
                        onChange: (e) => setData(color.key, e.target.value),
                        className: "h-12 w-full rounded-md border border-gray-300 cursor-pointer"
                      }
                    ),
                    /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-gray-500 text-center", children: data[color.key] })
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 mt-1", children: color.desc })
                ] }, color.key)) }),
                /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-wrap gap-3", children: [
                  /* @__PURE__ */ jsx("button", { type: "button", className: "px-5 py-2 rounded-lg font-medium transition-opacity hover:opacity-80 text-sm", style: { backgroundColor: data["brand_colors.button_primary_bg"], color: data["brand_colors.button_primary_text"] }, children: "Available Building" }),
                  /* @__PURE__ */ jsx("button", { type: "button", className: "px-5 py-2 rounded-lg font-medium transition-opacity hover:opacity-80 text-sm", style: { backgroundColor: data["brand_colors.button_secondary_bg"], color: data["brand_colors.button_secondary_text"] }, children: "Contact Agent" }),
                  /* @__PURE__ */ jsx("button", { type: "button", className: "px-5 py-2 rounded-lg font-medium transition-opacity hover:opacity-80 text-sm", style: { backgroundColor: data["brand_colors.button_tertiary_bg"], color: data["brand_colors.button_tertiary_text"] }, children: "Request Tour" }),
                  /* @__PURE__ */ jsx("button", { type: "button", className: "px-5 py-2 rounded-lg font-medium transition-opacity hover:opacity-80 text-sm border", style: { backgroundColor: data["brand_colors.button_quaternary_bg"], color: data["brand_colors.button_quaternary_text"], borderColor: data["brand_colors.button_quaternary_text"] }, children: "View Details" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "border-b border-gray-200 pb-6 pt-4", children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-3", children: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" }) }),
                  "Footer Colors"
                ] }) }),
                /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
                  { key: "brand_colors.footer_bg", label: "Footer Background", desc: "Footer section background" },
                  { key: "brand_colors.footer_text", label: "Footer Text", desc: "Footer text color" }
                ].map((color) => /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: color.label }),
                  /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "color",
                        value: data[color.key],
                        onChange: (e) => setData(color.key, e.target.value),
                        className: "h-12 w-full rounded-md border border-gray-300 cursor-pointer"
                      }
                    ),
                    /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-gray-500 text-center", children: data[color.key] })
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 mt-1", children: color.desc })
                ] }, color.key)) }),
                /* @__PURE__ */ jsx("div", { className: "mt-4 p-4 rounded-lg", style: { backgroundColor: data["brand_colors.footer_bg"] }, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsx("span", { className: "font-medium", style: { color: data["brand_colors.footer_text"] }, children: "Footer Preview" }),
                  /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
                    /* @__PURE__ */ jsx("span", { style: { color: data["brand_colors.footer_text"] }, children: "Privacy" }),
                    /* @__PURE__ */ jsx("span", { style: { color: data["brand_colors.footer_text"] }, children: "Terms" }),
                    /* @__PURE__ */ jsx("span", { style: { color: data["brand_colors.footer_text"] }, children: "Contact" })
                  ] })
                ] }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "pt-4", children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-3", children: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" }) }),
                  "Link Colors"
                ] }) }),
                /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
                  { key: "brand_colors.link_color", label: "Link Color", desc: "Default link color" },
                  { key: "brand_colors.link_hover", label: "Link Hover", desc: "Link hover color" }
                ].map((color) => /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                  /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: color.label }),
                  /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "color",
                        value: data[color.key],
                        onChange: (e) => setData(color.key, e.target.value),
                        className: "h-12 w-full rounded-md border border-gray-300 cursor-pointer"
                      }
                    ),
                    /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-gray-500 text-center", children: data[color.key] })
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 mt-1", children: color.desc })
                ] }, color.key)) }),
                /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
                  /* @__PURE__ */ jsx("span", { className: "mr-2", children: "Preview:" }),
                  /* @__PURE__ */ jsx(
                    "a",
                    {
                      href: "#",
                      onClick: (e) => e.preventDefault(),
                      className: "underline transition-colors",
                      style: { color: data["brand_colors.link_color"] },
                      onMouseEnter: (e) => e.target.style.color = data["brand_colors.link_hover"],
                      onMouseLeave: (e) => e.target.style.color = data["brand_colors.link_color"],
                      children: "Sample Link (hover me)"
                    }
                  )
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 rounded-lg p-6", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Contact Information" }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(InputLabel, { htmlFor: "contact_phone", value: "Phone" }),
                  /* @__PURE__ */ jsx(
                    PhoneInput,
                    {
                      id: "contact_phone",
                      value: data["contact_info.phone"],
                      className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm",
                      onChange: (e) => setData("contact_info.phone", e.target.value)
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(InputLabel, { htmlFor: "contact_email", value: "Email" }),
                  /* @__PURE__ */ jsx(
                    TextInput,
                    {
                      id: "contact_email",
                      type: "email",
                      value: data["contact_info.email"],
                      className: "mt-1 block w-full",
                      onChange: (e) => setData("contact_info.email", e.target.value),
                      placeholder: "contact@example.com"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
                  /* @__PURE__ */ jsx(InputLabel, { htmlFor: "contact_address", value: "Address" }),
                  /* @__PURE__ */ jsx(
                    "textarea",
                    {
                      id: "contact_address",
                      value: data["contact_info.address"],
                      onChange: (e) => setData("contact_info.address", e.target.value),
                      rows: 2,
                      className: "mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm",
                      placeholder: "123 Main St, City, Province, Country"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mt-6 border-t pt-6", children: [
                /* @__PURE__ */ jsx("h4", { className: "text-md font-semibold text-gray-800 mb-4", children: "Property Manager / Agent" }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
                  /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
                    /* @__PURE__ */ jsx(InputLabel, { htmlFor: "agent_profile_image", value: "Profile Photo" }),
                    /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-start space-x-6", children: [
                      agentPhotoPreview && /* @__PURE__ */ jsxs("div", { className: "flex-shrink-0 relative", children: [
                        /* @__PURE__ */ jsx(
                          "img",
                          {
                            src: agentPhotoPreview,
                            alt: "Agent Profile",
                            className: "h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          "button",
                          {
                            type: "button",
                            onClick: () => {
                              setAgentPhotoPreview("");
                              setData("agent_profile_image", null);
                            },
                            className: "absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md",
                            title: "Remove image",
                            children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M6 18L18 6M6 6l12 12" }) })
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsx("div", { className: "flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors", children: /* @__PURE__ */ jsxs("div", { className: "space-y-1 text-center", children: [
                        !agentPhotoPreview && /* @__PURE__ */ jsx("svg", { className: "mx-auto h-12 w-12 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" }) }),
                        /* @__PURE__ */ jsxs("div", { className: "flex text-sm text-gray-600", children: [
                          /* @__PURE__ */ jsxs("label", { htmlFor: "agent_profile_image", className: "relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500", children: [
                            /* @__PURE__ */ jsx("span", { children: agentPhotoPreview ? "Change photo" : "Upload photo" }),
                            /* @__PURE__ */ jsx(
                              "input",
                              {
                                id: "agent_profile_image",
                                name: "agent_profile_image",
                                type: "file",
                                className: "sr-only",
                                accept: "image/png,image/jpeg,image/jpg,image/webp",
                                onChange: handleAgentPhotoUpload
                              }
                            )
                          ] }),
                          /* @__PURE__ */ jsx("p", { className: "pl-1", children: "or drag and drop" })
                        ] }),
                        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "PNG, JPG up to 2MB" })
                      ] }) }) })
                    ] }),
                    /* @__PURE__ */ jsx(InputError, { message: errors.agent_profile_image, className: "mt-2" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx(InputLabel, { htmlFor: "agent_name", value: "Name" }),
                    /* @__PURE__ */ jsx(
                      TextInput,
                      {
                        id: "agent_name",
                        type: "text",
                        value: data.agent_name,
                        className: "mt-1 block w-full",
                        onChange: (e) => setData("agent_name", e.target.value),
                        placeholder: "John Doe"
                      }
                    ),
                    /* @__PURE__ */ jsx(InputError, { message: errors.agent_name, className: "mt-2" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx(InputLabel, { htmlFor: "agent_title", value: "Title" }),
                    /* @__PURE__ */ jsx(
                      TextInput,
                      {
                        id: "agent_title",
                        type: "text",
                        value: data.agent_title,
                        className: "mt-1 block w-full",
                        onChange: (e) => setData("agent_title", e.target.value),
                        placeholder: "Senior Real Estate Agent"
                      }
                    ),
                    /* @__PURE__ */ jsx(InputError, { message: errors.agent_title, className: "mt-2" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx(InputLabel, { htmlFor: "agent_phone", value: "Agent Phone" }),
                    /* @__PURE__ */ jsx(
                      PhoneInput,
                      {
                        id: "agent_phone",
                        value: data.agent_phone,
                        className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm",
                        onChange: (e) => setData("agent_phone", e.target.value)
                      }
                    ),
                    /* @__PURE__ */ jsx(InputError, { message: errors.agent_phone, className: "mt-2" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx(InputLabel, { htmlFor: "brokerage", value: "Brokerage" }),
                    /* @__PURE__ */ jsx(
                      TextInput,
                      {
                        id: "brokerage",
                        type: "text",
                        value: data.brokerage,
                        className: "mt-1 block w-full",
                        onChange: (e) => setData("brokerage", e.target.value),
                        placeholder: "Keller Williams Realty"
                      }
                    ),
                    /* @__PURE__ */ jsx(InputError, { message: errors.brokerage, className: "mt-2" })
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 rounded-lg p-6", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Social Media" }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(InputLabel, { htmlFor: "social_facebook", value: "Facebook URL" }),
                  /* @__PURE__ */ jsx(
                    TextInput,
                    {
                      id: "social_facebook",
                      type: "url",
                      value: data["social_media.facebook"],
                      className: "mt-1 block w-full",
                      onChange: (e) => setData("social_media.facebook", e.target.value),
                      placeholder: "https://facebook.com/yourpage"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(InputLabel, { htmlFor: "social_instagram", value: "Instagram URL" }),
                  /* @__PURE__ */ jsx(
                    TextInput,
                    {
                      id: "social_instagram",
                      type: "url",
                      value: data["social_media.instagram"],
                      className: "mt-1 block w-full",
                      onChange: (e) => setData("social_media.instagram", e.target.value),
                      placeholder: "https://instagram.com/youraccount"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(InputLabel, { htmlFor: "social_twitter", value: "Twitter URL" }),
                  /* @__PURE__ */ jsx(
                    TextInput,
                    {
                      id: "social_twitter",
                      type: "url",
                      value: data["social_media.twitter"],
                      className: "mt-1 block w-full",
                      onChange: (e) => setData("social_media.twitter", e.target.value),
                      placeholder: "https://twitter.com/youraccount"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(InputLabel, { htmlFor: "social_linkedin", value: "LinkedIn URL" }),
                  /* @__PURE__ */ jsx(
                    TextInput,
                    {
                      id: "social_linkedin",
                      type: "url",
                      value: data["social_media.linkedin"],
                      className: "mt-1 block w-full",
                      onChange: (e) => setData("social_media.linkedin", e.target.value),
                      placeholder: "https://linkedin.com/company/yourcompany"
                    }
                  )
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 rounded-lg p-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4 gap-4", children: [
                /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900", children: "SEO Settings" }),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: generateSeoWithAi,
                    disabled: aiSeoLoading,
                    className: "inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60",
                    children: [
                      /* @__PURE__ */ jsx("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" }) }),
                      aiSeoLoading ? "Generating…" : "Generate with AI"
                    ]
                  }
                )
              ] }),
              aiSeoError && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 mb-2", children: aiSeoError }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mb-4", children: 'Click "Generate with AI" to auto-fill these fields based on the selected building.' }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(InputLabel, { htmlFor: "meta_title", value: "Meta Title" }),
                  /* @__PURE__ */ jsx(
                    TextInput,
                    {
                      id: "meta_title",
                      type: "text",
                      name: "meta_title",
                      value: data.meta_title,
                      className: "mt-1 block w-full",
                      onChange: (e) => setData("meta_title", e.target.value),
                      placeholder: "Luxury Condos for Sale and Rent"
                    }
                  ),
                  /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Recommended: 50-60 characters" }),
                  /* @__PURE__ */ jsx(InputError, { message: errors.meta_title, className: "mt-2" })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(InputLabel, { htmlFor: "meta_description", value: "Meta Description" }),
                  /* @__PURE__ */ jsx(
                    "textarea",
                    {
                      id: "meta_description",
                      name: "meta_description",
                      value: data.meta_description,
                      onChange: (e) => setData("meta_description", e.target.value),
                      rows: 3,
                      className: "mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm",
                      placeholder: "Discover luxury living at our premium condos..."
                    }
                  ),
                  /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Recommended: 150-160 characters" }),
                  /* @__PURE__ */ jsx(InputError, { message: errors.meta_description, className: "mt-2" })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(InputLabel, { htmlFor: "meta_keywords", value: "Meta Keywords" }),
                  /* @__PURE__ */ jsx(
                    TextInput,
                    {
                      id: "meta_keywords",
                      type: "text",
                      name: "meta_keywords",
                      value: data.meta_keywords,
                      className: "mt-1 block w-full",
                      onChange: (e) => setData("meta_keywords", e.target.value),
                      placeholder: "luxury condos, real estate, Toronto"
                    }
                  ),
                  /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Separate keywords with commas" }),
                  /* @__PURE__ */ jsx(InputError, { message: errors.meta_keywords, className: "mt-2" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx(
                Link,
                {
                  href: route("admin.websites.index"),
                  className: "inline-flex items-center px-4 py-2 bg-gray-300 border border-transparent rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-400",
                  children: "Cancel"
                }
              ),
              /* @__PURE__ */ jsx(PrimaryButton, { className: "ml-4", disabled: processing, children: processing ? "Creating..." : "Create Website" })
            ] })
          ] })
        ] }) });
      })()
    ] })
  ] });
}
export {
  Create as default
};
