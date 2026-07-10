import { jsxs, jsx } from "react/jsx-runtime";
import { useForm, Head, Link } from "@inertiajs/react";
import { A as AdminLayout } from "./AdminLayout-l5p_UGn9.js";
import { I as InputError } from "./InputError-CBvD_6aD.js";
import { I as InputLabel } from "./InputLabel-DE424DvN.js";
import { P as PrimaryButton } from "./PrimaryButton-DDF1xnxF.js";
import { T as TextInput } from "./TextInput-D0qTZeQv.js";
import { P as PhoneInput } from "./PhoneInput-BOSF9o14.js";
import { c as csrfHeaders } from "./csrf-Rc-HMXbg.js";
import { useState, useMemo, useEffect } from "react";
const lightFormClass = "[&_input]:!bg-white [&_input]:!text-gray-900 [&_input]:!border-gray-300 [&_input]:!text-sm [&_textarea]:!bg-white [&_textarea]:!text-gray-900 [&_textarea]:!border-gray-300 [&_textarea]:!text-sm [&_select]:!bg-white [&_select]:!text-gray-900 [&_select]:!border-gray-300 [&_select]:!text-sm";
function BuildingThumb({ src, alt, className = "" }) {
  const [hasFailed, setHasFailed] = useState(false);
  if (!src || hasFailed) {
    return /* @__PURE__ */ jsx("div", { className: "h-16 w-16 rounded bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0", children: /* @__PURE__ */ jsx("svg", { className: "h-7 w-7", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M3 21h18M5 21V7l7-4 7 4v14M9 9h2m-2 4h2m4-4h2m-2 4h2" }) }) });
  }
  return /* @__PURE__ */ jsx(
    "img",
    {
      src,
      alt,
      onError: () => setHasFailed(true),
      className: `h-16 w-16 rounded object-cover flex-shrink-0 ${className}`
    }
  );
}
function CopyButton({ value, label = "Copy" }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      onClick: copy,
      title: `${label}: ${value}`,
      className: "inline-flex items-center justify-center h-6 w-6 rounded-md border border-gray-200 bg-white text-gray-500 hover:text-gray-800 hover:border-gray-300 transition-colors flex-shrink-0",
      children: copied ? /* @__PURE__ */ jsx("svg", { className: "h-3.5 w-3.5 text-green-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2.5", d: "M5 13l4 4L19 7" }) }) : /* @__PURE__ */ jsx("svg", { className: "h-3.5 w-3.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" }) })
    }
  );
}
function Create({ auth, buildings = [], defaultAgent = null, defaultBranding = null, defaultContactInfo = {}, defaultSocialMedia = {}, ploiEnabled = false, serverIp = null, preselectedBuildingId = null }) {
  const [step, setStep] = useState(1);
  const [buildingSearch, setBuildingSearch] = useState("");
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [aiSeoLoading, setAiSeoLoading] = useState(false);
  const [aiSeoError, setAiSeoError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
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
      const res = await fetch(route("admin.websites.ai-generate-seo"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...csrfHeaders(),
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
    clearErrors();
    if (!data.name.trim()) {
      setError("name", "Website name is required.");
      document.getElementById("name")?.focus();
      return;
    }
    post(route("admin.websites.store"), {
      forceFormData: true,
      preserveScroll: true
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
  const typedDomain = String(data.domain || "").trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
  const apexDomain = typedDomain.replace(/^www\./i, "");
  const dnsServerIp = serverIp || "157.180.26.95";
  return /* @__PURE__ */ jsxs(AdminLayout, { title: "Create New Website", children: [
    /* @__PURE__ */ jsx(Head, { title: "Create New Website" }),
    /* @__PURE__ */ jsxs("div", { className: `max-w-5xl mx-auto space-y-6 ${lightFormClass}`, children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-gray-200 bg-white p-6 shadow-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold text-gray-900", children: "Create New Website" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Launch a building site in two steps — pick the building, then confirm branding, contact and SEO details." })
          ] }),
          ploiEnabled && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap", children: [
            /* @__PURE__ */ jsx("svg", { className: "h-3.5 w-3.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2.5", d: "M5 13l4 4L19 7" }) }),
            "Auto domain + SSL enabled"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-5 flex items-center gap-3", children: [{ n: 1, label: "Select Building" }, { n: 2, label: "Website Details" }].map((s, i) => /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-3 ${i > 0 ? "flex-1" : ""}`, children: [
          i > 0 && /* @__PURE__ */ jsx("div", { className: `h-px flex-1 ${step >= s.n ? "bg-indigo-500" : "bg-gray-200"}` }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => s.n === 1 && setStep(1),
              disabled: s.n === 2 && step === 1,
              className: `flex items-center gap-2 ${s.n === 1 && step === 2 ? "cursor-pointer" : "cursor-default"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: `h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${step === s.n ? "bg-indigo-600 text-white ring-4 ring-indigo-100" : step > s.n ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-400"}`, children: step > s.n ? /* @__PURE__ */ jsx("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2.5", d: "M5 13l4 4L19 7" }) }) : s.n }),
                /* @__PURE__ */ jsx("span", { className: `text-sm font-medium hidden sm:inline ${step === s.n ? "text-gray-900" : "text-gray-500"}`, children: s.label })
              ]
            }
          )
        ] }, s.n)) })
      ] }),
      step === 1 && /* @__PURE__ */ jsx("div", { className: "bg-white overflow-hidden rounded-2xl border border-gray-200 shadow-sm", children: /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
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
              /* @__PURE__ */ jsx(BuildingThumb, { src: b.main_image, alt: b.name }),
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
        return /* @__PURE__ */ jsx("div", { className: "bg-white overflow-hidden rounded-2xl border border-gray-200 shadow-sm", children: /* @__PURE__ */ jsxs("div", { className: "p-6 text-gray-900", children: [
          chosenBuilding && /* @__PURE__ */ jsxs("div", { className: "mb-6 border border-indigo-200 bg-indigo-50/40 rounded-lg p-4 flex items-center gap-4", children: [
            /* @__PURE__ */ jsx(
              BuildingThumb,
              {
                src: chosenBuilding.main_image,
                alt: chosenBuilding.name,
                className: "opacity-90"
              }
            ),
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
            /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-gray-100 bg-gray-50/70 p-5 sm:p-6", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Basic Information" }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(InputLabel, { htmlFor: "name", value: "Website Name *" }),
                  /* @__PURE__ */ jsx(
                    TextInput,
                    {
                      id: "name",
                      type: "text",
                      name: "name",
                      value: data.name,
                      className: `mt-1 block w-full ${errors.name ? "!ring-2 !ring-red-500 !border-red-500" : ""}`,
                      autoComplete: "name",
                      isFocused: true,
                      required: true,
                      "aria-invalid": Boolean(errors.name),
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
                  ploiEnabled && !typedDomain && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-green-700", children: "This domain will be added to the server (Ploi) and get an SSL certificate automatically once its DNS points here." }),
                  !ploiEnabled && data.domain && /* @__PURE__ */ jsxs("div", { className: "mt-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800", children: [
                    /* @__PURE__ */ jsx("p", { className: "font-semibold", children: "Automatic domain connection is currently OFF." }),
                    /* @__PURE__ */ jsx("p", { className: "mt-1", children: `The site will be saved, but this domain will not be connected to the server automatically. To enable it, set PLOI_API_TOKEN, PLOI_SERVER_ID and PLOI_SITE_ID in the server's .env, then use "Retry" on the website's status page. The DNS records below must also be in place.` })
                  ] })
                ] }),
                typedDomain && /* @__PURE__ */ jsx("div", { className: "md:col-span-2 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 sm:p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx("svg", { className: "h-4.5 w-4.5", width: "18", height: "18", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }),
                  /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                    /* @__PURE__ */ jsxs("h4", { className: "text-sm font-semibold text-gray-900", children: [
                      "Point ",
                      /* @__PURE__ */ jsx("code", { className: "font-mono", children: apexDomain }),
                      " at this server"
                    ] }),
                    /* @__PURE__ */ jsxs("p", { className: "mt-0.5 text-xs text-gray-600", children: [
                      "Add these records at your DNS provider. Server IP:",
                      " ",
                      /* @__PURE__ */ jsx("code", { className: "font-mono font-semibold text-indigo-800", children: dnsServerIp }),
                      /* @__PURE__ */ jsx("span", { className: "inline-block align-middle ml-1.5", children: /* @__PURE__ */ jsx(CopyButton, { value: dnsServerIp, label: "Copy IP" }) })
                    ] }),
                    /* @__PURE__ */ jsx("div", { className: "mt-3 overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-xs border-separate border-spacing-0", children: [
                      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "text-left text-gray-500", children: [
                        /* @__PURE__ */ jsx("th", { className: "font-medium pb-1.5 pr-4", children: "Type" }),
                        /* @__PURE__ */ jsx("th", { className: "font-medium pb-1.5 pr-4", children: "Host / Name" }),
                        /* @__PURE__ */ jsx("th", { className: "font-medium pb-1.5", children: "Value" })
                      ] }) }),
                      /* @__PURE__ */ jsxs("tbody", { className: "font-mono text-gray-800", children: [
                        /* @__PURE__ */ jsxs("tr", { children: [
                          /* @__PURE__ */ jsx("td", { className: "py-1.5 pr-4 align-top", children: /* @__PURE__ */ jsx("span", { className: "px-1.5 py-0.5 rounded bg-white border border-gray-200", children: "A" }) }),
                          /* @__PURE__ */ jsxs("td", { className: "py-1.5 pr-4 align-top", children: [
                            "@ ",
                            /* @__PURE__ */ jsxs("span", { className: "font-sans text-gray-400", children: [
                              "(apex — ",
                              apexDomain,
                              ")"
                            ] })
                          ] }),
                          /* @__PURE__ */ jsx("td", { className: "py-1.5", children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
                            dnsServerIp,
                            /* @__PURE__ */ jsx(CopyButton, { value: dnsServerIp, label: "Copy IP" })
                          ] }) })
                        ] }),
                        /* @__PURE__ */ jsxs("tr", { children: [
                          /* @__PURE__ */ jsx("td", { className: "py-1.5 pr-4 align-top", children: /* @__PURE__ */ jsx("span", { className: "px-1.5 py-0.5 rounded bg-white border border-gray-200", children: "CNAME" }) }),
                          /* @__PURE__ */ jsx("td", { className: "py-1.5 pr-4 align-top", children: "www" }),
                          /* @__PURE__ */ jsxs("td", { className: "py-1.5", children: [
                            /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 break-all", children: [
                              apexDomain,
                              /* @__PURE__ */ jsx(CopyButton, { value: apexDomain, label: "Copy domain" })
                            ] }),
                            /* @__PURE__ */ jsxs("span", { className: "block font-sans text-gray-400 mt-0.5", children: [
                              "or an A record for www → ",
                              dnsServerIp
                            ] })
                          ] })
                        ] })
                      ] })
                    ] }) }),
                    /* @__PURE__ */ jsxs("div", { className: "mt-3 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-900", children: [
                      /* @__PURE__ */ jsx("strong", { children: "Using Cloudflare?" }),
                      " Set Proxy status to ",
                      /* @__PURE__ */ jsx("strong", { children: "DNS only" }),
                      " (gray cloud) on both records until the SSL certificate is issued — Let's Encrypt can't validate through the orange-cloud proxy. Afterwards you can re-enable the proxy with SSL/TLS mode ",
                      /* @__PURE__ */ jsx("strong", { children: "Full (strict)" }),
                      "."
                    ] }),
                    /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-gray-500", children: "DNS changes can take a few minutes to propagate. The SSL certificate is requested automatically after the website is created — you can watch progress and retry from the status page that follows." })
                  ] })
                ] }) }),
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
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "md:col-span-2 flex items-start gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3", children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      id: "use_building_as_homepage",
                      type: "checkbox",
                      checked: !!data.use_building_as_homepage,
                      onChange: (e) => setData("use_building_as_homepage", e.target.checked),
                      className: "mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    }
                  ),
                  /* @__PURE__ */ jsxs("label", { htmlFor: "use_building_as_homepage", className: "text-sm text-gray-700 cursor-pointer", children: [
                    /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-900", children: "Use the building page as the homepage" }),
                    /* @__PURE__ */ jsx("span", { className: "block text-xs text-gray-500 mt-0.5", children: `Off (recommended): the site serves the standard Home design with this building's details. On: "/" serves the full building detail page instead.` })
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => setShowAdvanced((v) => !v),
                className: "w-full flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 text-left hover:bg-gray-50 transition-colors",
                children: [
                  /* @__PURE__ */ jsxs("span", { children: [
                    /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-gray-900", children: "Advanced settings (optional)" }),
                    /* @__PURE__ */ jsx("span", { className: "block text-xs text-gray-500 mt-0.5", children: "Logo, brand colors, contact info, social links and SEO — prefilled from the default site; editable any time after creation." })
                  ] }),
                  /* @__PURE__ */ jsx("svg", { className: `h-5 w-5 text-gray-400 transition-transform ${showAdvanced ? "rotate-180" : ""}`, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M19 9l-7 7-7-7" }) })
                ]
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: showAdvanced ? "space-y-6" : "hidden", children: [
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-gray-100 bg-gray-50/70 p-5 sm:p-6", children: [
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
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-gray-100 bg-gray-50/70 p-5 sm:p-6 space-y-6", children: [
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
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-gray-100 bg-gray-50/70 p-5 sm:p-6", children: [
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
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-gray-100 bg-gray-50/70 p-5 sm:p-6", children: [
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
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-gray-100 bg-gray-50/70 p-5 sm:p-6", children: [
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
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-gray-100 pt-6", children: [
              /* @__PURE__ */ jsx(
                Link,
                {
                  href: route("admin.websites.index"),
                  className: "inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors",
                  children: "Cancel"
                }
              ),
              /* @__PURE__ */ jsx(PrimaryButton, { className: "justify-center sm:ml-4 !rounded-lg !px-6 !py-2.5 !text-sm !normal-case !tracking-normal", disabled: processing, children: processing ? "Creating…" : "Create Website" })
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
