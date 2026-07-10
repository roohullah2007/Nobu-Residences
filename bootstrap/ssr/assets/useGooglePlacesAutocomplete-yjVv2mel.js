import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { I as InputLabel } from "./InputLabel-DE424DvN.js";
import { I as InputError } from "./InputError-CBvD_6aD.js";
import { c as csrfHeaders, D as DeveloperApiSearch, i as importDeveloperFromApi } from "./DeveloperApiSearch-CdxwE2Dz.js";
function QuickCreateSelect({
  id,
  label,
  value,
  onChange,
  options = [],
  getOptionLabel = (option) => option.name,
  createUrl,
  createPayload = {},
  createTitle = "Add new",
  placeholder = "Select...",
  error,
  onCreated,
  // When set, "+ New" delegates to the caller (e.g. to open a full modal)
  // instead of showing the inline name-only creator.
  onRequestCreate
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [createError, setCreateError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const selectedOption = options.find((option) => String(option.id) === String(value));
  const filteredOptions = query.trim() ? options.filter((option) => getOptionLabel(option).toLowerCase().includes(query.trim().toLowerCase())) : options;
  const selectOption = (option) => {
    onChange(String(option.id));
    setIsOpen(false);
    setHighlightIndex(-1);
  };
  const handleCreate = async () => {
    const name = newName.trim();
    if (!name || isSaving) return;
    setIsSaving(true);
    setCreateError("");
    try {
      const response = await fetch(createUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...csrfHeaders(),
          "X-Requested-With": "XMLHttpRequest",
          Accept: "application/json"
        },
        body: JSON.stringify({ ...createPayload, name })
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message ?? `Server returned ${response.status}`);
      }
      onCreated?.(result);
      onChange(result.id);
      setNewName("");
      setIsCreating(false);
    } catch (err) {
      setCreateError(err.message ?? "Failed to create.");
    } finally {
      setIsSaving(false);
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreate();
    }
    if (e.key === "Escape") {
      setIsCreating(false);
      setCreateError("");
    }
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx(InputLabel, { htmlFor: id, value: label }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => onRequestCreate ? onRequestCreate() : setIsCreating(!isCreating),
          className: "text-xs font-medium text-indigo-600 hover:text-indigo-800",
          children: !onRequestCreate && isCreating ? "Cancel" : "+ New"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          id,
          type: "text",
          role: "combobox",
          "aria-expanded": isOpen,
          autoComplete: "off",
          className: "mt-1 block w-full rounded-md !border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 !bg-white !text-gray-900 pr-8",
          value: isOpen ? query : selectedOption ? getOptionLabel(selectedOption) : "",
          placeholder: selectedOption ? getOptionLabel(selectedOption) : placeholder,
          onFocus: () => {
            setIsOpen(true);
            setQuery("");
            setHighlightIndex(-1);
          },
          onChange: (e) => {
            setQuery(e.target.value);
            setHighlightIndex(-1);
          },
          onBlur: () => setTimeout(() => setIsOpen(false), 100),
          onKeyDown: (e) => {
            if (e.key === "Escape") {
              setIsOpen(false);
              e.currentTarget.blur();
            }
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setIsOpen(true);
              setHighlightIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlightIndex((prev) => Math.max(prev - 1, 0));
            }
            if (e.key === "Enter") {
              e.preventDefault();
              const target = filteredOptions[highlightIndex] ?? (filteredOptions.length === 1 ? filteredOptions[0] : null);
              if (target) {
                selectOption(target);
                e.currentTarget.blur();
              }
            }
          }
        }
      ),
      /* @__PURE__ */ jsx(
        "svg",
        {
          className: "pointer-events-none absolute right-2.5 top-1/2 mt-0.5 h-4 w-4 -translate-y-1/2 text-gray-400",
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" })
        }
      ),
      isOpen && /* @__PURE__ */ jsxs("ul", { className: "absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg", children: [
        /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "block w-full px-3 py-1.5 text-left text-gray-500 hover:bg-gray-50",
            onMouseDown: (e) => {
              e.preventDefault();
              onChange("");
              setIsOpen(false);
            },
            children: placeholder
          }
        ) }),
        filteredOptions.map((option, index) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: `block w-full px-3 py-1.5 text-left hover:bg-indigo-50 ${index === highlightIndex ? "bg-indigo-100 text-indigo-900" : String(option.id) === String(value) ? "bg-indigo-50 font-medium text-indigo-700" : "text-gray-900"}`,
            onMouseDown: (e) => {
              e.preventDefault();
              selectOption(option);
            },
            children: getOptionLabel(option)
          }
        ) }, option.id)),
        filteredOptions.length === 0 && /* @__PURE__ */ jsx("li", { className: "px-3 py-1.5 text-gray-400", children: 'No matches — use "+ New" to add it' })
      ] })
    ] }),
    isCreating && /* @__PURE__ */ jsxs("div", { className: "mt-2 rounded-md border border-indigo-200 bg-indigo-50 p-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            className: "block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 !bg-white !text-gray-900",
            value: newName,
            onChange: (e) => setNewName(e.target.value),
            onKeyDown: handleKeyDown,
            placeholder: `${createTitle}...`,
            autoFocus: true
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: handleCreate,
            disabled: isSaving || !newName.trim(),
            className: "whitespace-nowrap rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50",
            children: isSaving ? "Adding..." : "Add"
          }
        )
      ] }),
      createError && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-600", children: createError })
    ] }),
    /* @__PURE__ */ jsx(InputError, { message: error, className: "mt-2" })
  ] });
}
function QuickCreateInline({
  createUrl,
  createPayload = {},
  buttonLabel = "+ New",
  placeholder = "Name...",
  onCreated,
  withImage = false,
  imageFieldName = "icon_file"
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [createError, setCreateError] = useState("");
  const fileInputRef = useRef(null);
  const resetForm = () => {
    setNewName("");
    setImageFile(null);
    setImagePreview("");
    setCreateError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const handleFileChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : "");
  };
  const handleCreate = async () => {
    const name = newName.trim();
    if (!name || isSaving) return;
    setIsSaving(true);
    setCreateError("");
    try {
      let body;
      const headers = {
        ...csrfHeaders(),
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json"
      };
      if (imageFile) {
        body = new FormData();
        Object.entries(createPayload).forEach(([k, v]) => body.append(k, v));
        body.append("name", name);
        body.append(imageFieldName, imageFile);
      } else {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify({ ...createPayload, name });
      }
      const response = await fetch(createUrl, { method: "POST", headers, body });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message ?? `Server returned ${response.status}`);
      }
      onCreated?.(result);
      resetForm();
      setIsCreating(false);
    } catch (err) {
      setCreateError(err.message ?? "Failed to create.");
    } finally {
      setIsSaving(false);
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreate();
    }
    if (e.key === "Escape") {
      setIsCreating(false);
      resetForm();
    }
  };
  if (!isCreating) {
    return /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => setIsCreating(true),
        className: "inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-indigo-300 bg-white px-3 py-2 text-sm font-medium text-indigo-700 shadow-sm hover:bg-indigo-50",
        children: buttonLabel
      }
    );
  }
  return /* @__PURE__ */ jsxs("div", { className: "w-full rounded-md border border-indigo-200 bg-indigo-50 p-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          className: "block flex-1 min-w-[200px] rounded-md !border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 !bg-white !text-gray-900",
          value: newName,
          onChange: (e) => setNewName(e.target.value),
          onKeyDown: handleKeyDown,
          placeholder,
          autoFocus: true
        }
      ),
      withImage && /* @__PURE__ */ jsxs("label", { className: "inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50", children: [
        imagePreview ? /* @__PURE__ */ jsx("img", { src: imagePreview, alt: "Icon preview", className: "h-5 w-5 object-contain" }) : /* @__PURE__ */ jsx("svg", { className: "h-4 w-4 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" }) }),
        imageFile ? imageFile.name : "Upload icon",
        /* @__PURE__ */ jsx(
          "input",
          {
            ref: fileInputRef,
            type: "file",
            accept: "image/*,.svg",
            className: "hidden",
            onChange: handleFileChange
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: handleCreate,
          disabled: isSaving || !newName.trim(),
          className: "whitespace-nowrap rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50",
          children: isSaving ? "Adding..." : "Add"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            setIsCreating(false);
            resetForm();
          },
          className: "whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900",
          children: "Cancel"
        }
      )
    ] }),
    withImage && !imageFile && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Optional icon — SVG, PNG or JPG, max 2 MB." }),
    createError && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-600", children: createError })
  ] });
}
const EMPTY_FORM = {
  name: "",
  type: "developer",
  email: "",
  phone: "",
  website: "",
  established_year: "",
  description: "",
  logo: null
};
const DEVELOPER_TYPES = [
  { value: "developer", label: "Developer" },
  { value: "builder", label: "Builder" },
  { value: "builder_developer", label: "Builder & Developer" }
];
const inputClasses = "w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]";
function DeveloperModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [logoPreview, setLogoPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  if (!open) return null;
  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setField("logo", file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  };
  const handleClose = () => {
    setForm({ ...EMPTY_FORM });
    setLogoPreview(null);
    setError("");
    onClose();
  };
  const handleApiSelect = async (apiDeveloper) => {
    if (isSaving) return;
    setIsSaving(true);
    setError("");
    try {
      const developer = await importDeveloperFromApi(apiDeveloper.slug);
      onCreated?.(developer);
      handleClose();
    } catch (err) {
      setError(err.message ?? "Failed to load developer from the directory.");
    } finally {
      setIsSaving(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || isSaving) return;
    setIsSaving(true);
    setError("");
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          formData.append(key, value);
        }
      });
      const response = await fetch(route("admin.api.developers.store"), {
        method: "POST",
        headers: {
          ...csrfHeaders(),
          "X-Requested-With": "XMLHttpRequest",
          Accept: "application/json"
        },
        body: formData
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message ?? `Server returned ${response.status}`);
      }
      onCreated?.(result);
      handleClose();
    } catch (err) {
      setError(err.message ?? "Failed to create developer.");
    } finally {
      setIsSaving(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-[#0f172a] mb-4", children: "Add Developer" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-4 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3", children: [
      /* @__PURE__ */ jsx(
        DeveloperApiSearch,
        {
          label: "Search the developer directory (condos.ca)",
          onSelect: handleApiSelect
        }
      ),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-[#64748b]", children: "Picking a result loads the developer (name, website, logo) into the database instantly — or enter the details manually below." })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium text-[#0f172a] mb-1.5", children: [
              "Name ",
              /* @__PURE__ */ jsx("span", { className: "text-[#dc2626]", children: "*" })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                className: inputClasses,
                value: form.name,
                onChange: (e) => setField("name", e.target.value),
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium text-[#0f172a] mb-1.5", children: [
              "Type ",
              /* @__PURE__ */ jsx("span", { className: "text-[#dc2626]", children: "*" })
            ] }),
            /* @__PURE__ */ jsx(
              "select",
              {
                className: inputClasses,
                value: form.type,
                onChange: (e) => setField("type", e.target.value),
                required: true,
                children: DEVELOPER_TYPES.map(({ value, label }) => /* @__PURE__ */ jsx("option", { value, children: label }, value))
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-[#0f172a] mb-1.5", children: "Email" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "email",
                className: inputClasses,
                value: form.email,
                onChange: (e) => setField("email", e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-[#0f172a] mb-1.5", children: "Phone" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                className: inputClasses,
                value: form.phone,
                onChange: (e) => setField("phone", e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-[#0f172a] mb-1.5", children: "Website" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                placeholder: "https://example.com",
                className: inputClasses,
                value: form.website,
                onChange: (e) => setField("website", e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-[#0f172a] mb-1.5", children: "Established Year" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                min: "1800",
                max: (/* @__PURE__ */ new Date()).getFullYear(),
                placeholder: "e.g. 1985",
                className: inputClasses,
                value: form.established_year,
                onChange: (e) => setField("established_year", e.target.value)
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-[#0f172a] mb-1.5", children: "Description" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              rows: 4,
              placeholder: "Company profile shown on the public developer page...",
              className: inputClasses,
              value: form.description,
              onChange: (e) => setField("description", e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-[#0f172a] mb-1.5", children: "Logo" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "file",
              className: "w-full text-sm text-[#64748b] border border-[#e2e8f0] rounded-lg cursor-pointer file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-[#f1f5f9] file:text-[#0f172a] file:font-medium hover:file:bg-[#e2e8f0]",
              accept: "image/*",
              onChange: handleLogoChange
            }
          ),
          logoPreview && /* @__PURE__ */ jsxs("div", { className: "mt-3 p-3 bg-[#f8fafc] rounded-lg", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-[#64748b] mb-2", children: "Preview:" }),
            /* @__PURE__ */ jsx("img", { src: logoPreview, alt: "Logo preview", className: "w-16 h-16 object-contain" })
          ] })
        ] }),
        error && /* @__PURE__ */ jsx("p", { className: "text-sm text-[#dc2626]", children: error })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 flex gap-3 justify-end", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: handleClose,
            className: "px-4 py-2 text-sm font-medium text-[#64748b] bg-[#f1f5f9] rounded-lg hover:bg-[#e2e8f0] transition-colors",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: isSaving || !form.name.trim(),
            className: "px-4 py-2 text-sm font-medium text-white bg-[#0f172a] rounded-lg hover:bg-[#1e293b] transition-colors disabled:opacity-50",
            children: isSaving ? "Creating..." : "Create"
          }
        )
      ] })
    ] })
  ] }) });
}
const GOOGLE_READY_POLL_MS = 400;
const GOOGLE_READY_MAX_ATTEMPTS = 25;
const parseAddressComponents = (place) => {
  const components = place?.address_components || [];
  const find = (type, key = "long_name") => components.find((c) => c.types.includes(type))?.[key] || "";
  const streetNumber = find("street_number");
  const streetName = find("route");
  return {
    streetAddress: [streetNumber, streetName].filter(Boolean).join(" "),
    city: find("locality") || find("postal_town") || find("sublocality_level_1"),
    province: find("administrative_area_level_1", "short_name"),
    postalCode: find("postal_code"),
    country: find("country"),
    latitude: place?.geometry?.location?.lat?.() ?? "",
    longitude: place?.geometry?.location?.lng?.() ?? ""
  };
};
function useGooglePlacesAutocomplete(inputId, onPlaceSelected) {
  const callbackRef = useRef(onPlaceSelected);
  callbackRef.current = onPlaceSelected;
  useEffect(() => {
    let attempts = 0;
    let pollTimer = null;
    let autocomplete = null;
    const init = () => {
      const input = document.getElementById(inputId);
      if (!window.google?.maps?.places?.Autocomplete || !input) {
        attempts += 1;
        if (attempts < GOOGLE_READY_MAX_ATTEMPTS) {
          pollTimer = setTimeout(init, GOOGLE_READY_POLL_MS);
        }
        return;
      }
      autocomplete = new window.google.maps.places.Autocomplete(input, {
        types: ["address"],
        componentRestrictions: { country: "ca" },
        fields: ["address_components", "geometry"]
      });
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place?.address_components) return;
        callbackRef.current?.(parseAddressComponents(place), place);
      });
    };
    init();
    return () => {
      if (pollTimer) clearTimeout(pollTimer);
      if (autocomplete && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [inputId]);
}
export {
  DeveloperModal as D,
  QuickCreateSelect as Q,
  QuickCreateInline as a,
  useGooglePlacesAutocomplete as u
};
