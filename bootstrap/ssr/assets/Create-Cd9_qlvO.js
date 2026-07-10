import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useForm, Head, Link } from "@inertiajs/react";
import { A as AdminLayout } from "./AdminLayout-CaxbTFCB.js";
import { I as InputError } from "./InputError-CBvD_6aD.js";
import { I as InputLabel } from "./InputLabel-DE424DvN.js";
import { T as TextInput } from "./TextInput-D0qTZeQv.js";
import { useState, useRef, useMemo, useEffect } from "react";
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
function Create({ auth, buildings = [], buildingIdsWithWebsite = [], cloudflareEnabled = false, cnameTarget = "", preselectedBuildingId = null }) {
  const [buildingSearch, setBuildingSearch] = useState("");
  const confirmPanelRef = useRef(null);
  const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
    building_id: "",
    homepage_building_id: "",
    name: "",
    domain: "",
    is_default: false,
    is_active: true
  });
  const hasWebsite = useMemo(
    () => new Set((buildingIdsWithWebsite || []).map(String)),
    [buildingIdsWithWebsite]
  );
  const filteredBuildings = useMemo(() => {
    const q = buildingSearch.trim().toLowerCase();
    if (!q) return buildings;
    return buildings.filter(
      (b) => (b.name || "").toLowerCase().includes(q) || (b.address || "").toLowerCase().includes(q) || (b.city || "").toLowerCase().includes(q)
    );
  }, [buildings, buildingSearch]);
  const selectedBuilding = useMemo(
    () => buildings.find((b) => b.id === data.building_id) || null,
    [buildings, data.building_id]
  );
  const chooseBuilding = (building) => {
    clearErrors();
    setData((prev) => ({
      ...prev,
      building_id: building.id,
      homepage_building_id: building.id,
      // Editable in the confirm panel; a second site for the same
      // building just needs a different name (slug auto-suffixes).
      name: building.name || ""
    }));
  };
  useEffect(() => {
    if (data.building_id && confirmPanelRef.current) {
      confirmPanelRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [data.building_id]);
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
      preserveScroll: true
    });
  };
  const typedDomain = String(data.domain || "").trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
  const apexDomain = typedDomain.replace(/^www\./i, "");
  return /* @__PURE__ */ jsxs(AdminLayout, { title: "Create New Website", children: [
    /* @__PURE__ */ jsx(Head, { title: "Create New Website" }),
    /* @__PURE__ */ jsxs("div", { className: `max-w-5xl mx-auto space-y-6 ${lightFormClass}`, children: [
      /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-gray-200 bg-white p-6 shadow-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold text-gray-900", children: "Create New Website" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Pick a building and click Create — branding and contact details are inherited, and AI writes the homepage copy and SEO from the building's data." })
        ] }),
        cloudflareEnabled && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap", children: [
          /* @__PURE__ */ jsx("svg", { className: "h-3.5 w-3.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2.5", d: "M5 13l4 4L19 7" }) }),
          "Auto domain + SSL via Cloudflare"
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "bg-white overflow-hidden rounded-2xl border border-gray-200 shadow-sm", children: /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-4 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Select a Building" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mt-1", children: "The website is generated from this building's data — name, facts, amenities, agent and photos." })
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
        ] }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[55vh] overflow-y-auto pr-1", children: filteredBuildings.map((b) => /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => chooseBuilding(b),
            className: `relative text-left border rounded-lg p-4 hover:border-indigo-500 hover:shadow transition-all flex gap-3 items-start ${data.building_id === b.id ? "border-indigo-600 ring-2 ring-indigo-200" : "border-gray-200"}`,
            children: [
              hasWebsite.has(String(b.id)) && /* @__PURE__ */ jsx("span", { className: "absolute top-2 right-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800", title: "This building already has a website — you can still create another one.", children: "Has a website" }),
              /* @__PURE__ */ jsx(BuildingThumb, { src: b.main_image, alt: b.name }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-900 truncate pr-16", title: b.name, children: b.name }),
                /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500 truncate", title: b.address || b.city || "", children: b.address || b.city || "—" })
              ] })
            ]
          },
          b.id
        )) }),
        /* @__PURE__ */ jsx(InputError, { message: errors.building_id || errors.homepage_building_id, className: "mt-2" })
      ] }) }),
      selectedBuilding && /* @__PURE__ */ jsxs("form", { onSubmit: submit, ref: confirmPanelRef, children: [
        /* @__PURE__ */ jsx("div", { className: "bg-white overflow-hidden rounded-2xl border border-indigo-200 shadow-sm", children: /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 border border-indigo-200 bg-indigo-50/40 rounded-lg p-4", children: [
            /* @__PURE__ */ jsx(BuildingThumb, { src: selectedBuilding.main_image, alt: selectedBuilding.name, className: "opacity-90" }),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs uppercase font-semibold tracking-wide text-indigo-700", children: "Selected Building" }),
              /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-900 truncate", title: selectedBuilding.name, children: selectedBuilding.name }),
              /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500 truncate", title: selectedBuilding.address || selectedBuilding.city || "", children: selectedBuilding.address || selectedBuilding.city || "—" })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-400 whitespace-nowrap hidden sm:inline", children: "Click another card to change" })
          ] }),
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
                  className: `mt-1 block w-full ${errors.name ? "!ring-2 !ring-red-500 !border-red-500" : ""}`,
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
                  placeholder: "e.g., luxurycondos.com — can be added later"
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.domain, className: "mt-2" }),
              cloudflareEnabled && !typedDomain && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-green-700", children: "A domain typed here is registered on Cloudflare automatically — SSL activates as soon as the customer creates one CNAME record." }),
              !cloudflareEnabled && data.domain && /* @__PURE__ */ jsxs("div", { className: "mt-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800", children: [
                /* @__PURE__ */ jsx("p", { className: "font-semibold", children: "Automatic domain connection is currently OFF." }),
                /* @__PURE__ */ jsx("p", { className: "mt-1", children: `The site will be saved, but this domain will not be registered on Cloudflare automatically. To enable it, set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID in the server's .env, then use "Retry" on the website's status page.` })
              ] })
            ] })
          ] }),
          typedDomain && /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 sm:p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx("svg", { className: "h-4.5 w-4.5", width: "18", height: "18", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxs("h4", { className: "text-sm font-semibold text-gray-900", children: [
                "One CNAME record makes ",
                /* @__PURE__ */ jsx("code", { className: "font-mono", children: apexDomain }),
                " live"
              ] }),
              /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-xs text-gray-600", children: "The customer adds this single record at their DNS provider — Cloudflare then validates the domain and issues SSL automatically." }),
              /* @__PURE__ */ jsx("div", { className: "mt-3 overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-xs border-separate border-spacing-0", children: [
                /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "text-left text-gray-500", children: [
                  /* @__PURE__ */ jsx("th", { className: "font-medium pb-1.5 pr-4", children: "Type" }),
                  /* @__PURE__ */ jsx("th", { className: "font-medium pb-1.5 pr-4", children: "Host / Name" }),
                  /* @__PURE__ */ jsx("th", { className: "font-medium pb-1.5", children: "Value" })
                ] }) }),
                /* @__PURE__ */ jsx("tbody", { className: "font-mono text-gray-800", children: /* @__PURE__ */ jsxs("tr", { children: [
                  /* @__PURE__ */ jsx("td", { className: "py-1.5 pr-4 align-top", children: /* @__PURE__ */ jsx("span", { className: "px-1.5 py-0.5 rounded bg-white border border-gray-200", children: "CNAME" }) }),
                  /* @__PURE__ */ jsxs("td", { className: "py-1.5 pr-4 align-top", children: [
                    typedDomain.startsWith("www.") ? "www" : "@",
                    " ",
                    /* @__PURE__ */ jsxs("span", { className: "font-sans text-gray-400", children: [
                      "(",
                      typedDomain,
                      ")"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("td", { className: "py-1.5", children: [
                    /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 break-all", children: [
                      cnameTarget,
                      /* @__PURE__ */ jsx(CopyButton, { value: cnameTarget, label: "Copy target" })
                    ] }),
                    /* @__PURE__ */ jsx("span", { className: "block font-sans text-gray-400 mt-0.5", children: "apex domains: use your provider's CNAME flattening / ALIAS record" })
                  ] })
                ] }) })
              ] }) }),
              /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-gray-500", children: "DNS changes can take a few minutes to propagate. The hostname is registered on Cloudflare automatically after the website is created — the status page shows live progress." })
            ] })
          ] }) })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "sticky bottom-0 z-10 mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-gray-200 bg-white/95 backdrop-blur px-4 py-3 sm:rounded-t-lg", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 max-w-xl", children: "Branding, colors, contact info, agent and fonts are inherited from your default site (or this building's agent). AI writes the SEO metadata, hero copy, About text and FAQs in the background — everything stays editable afterwards in Websites → Edit." }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: processing,
              className: "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 whitespace-nowrap",
              children: processing ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsxs("svg", { className: "h-4 w-4 animate-spin", fill: "none", viewBox: "0 0 24 24", children: [
                  /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                  /* @__PURE__ */ jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" })
                ] }),
                "Creating..."
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M13 10V3L4 14h7v7l9-11h-7z" }) }),
                "Create Website"
              ] })
            }
          )
        ] })
      ] })
    ] })
  ] });
}
export {
  Create as default
};
