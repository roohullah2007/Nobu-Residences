import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
const PENDING_SAVED_SEARCH_KEY = "pendingSavedSearch";
const stashPendingSavedSearch = (payload) => {
  try {
    sessionStorage.setItem(PENDING_SAVED_SEARCH_KEY, JSON.stringify(payload));
  } catch (e) {
  }
};
const popPendingSavedSearch = () => {
  try {
    const raw = sessionStorage.getItem(PENDING_SAVED_SEARCH_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(PENDING_SAVED_SEARCH_KEY);
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};
const getCsrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";
const FREQUENCIES = [
  { value: 1, label: "Daily" },
  { value: 7, label: "Weekly" },
  { value: 30, label: "Monthly" }
];
const summarizeCriteria = (params = {}) => {
  const parts = [];
  if (params.query) parts.push(params.query);
  if (params.status) parts.push(params.status);
  if (Array.isArray(params.property_type) && params.property_type.length > 0) {
    parts.push(params.property_type.join(", "));
  }
  if (params.bedrooms > 0) parts.push(`${params.bedrooms}+ beds`);
  if (params.bathrooms > 0) parts.push(`${params.bathrooms}+ baths`);
  if (params.price_min > 0 || params.price_max > 0 && params.price_max < 1e7) {
    const min = params.price_min > 0 ? `$${Number(params.price_min).toLocaleString()}` : "$0";
    const max = params.price_max > 0 && params.price_max < 1e7 ? `$${Number(params.price_max).toLocaleString()}` : "any";
    parts.push(`${min} – ${max}`);
  }
  if (params.min_sqft > 0) parts.push(`${params.min_sqft}+ sqft`);
  return parts.join(" · ");
};
function SaveSearchModal({
  isOpen,
  onClose,
  searchParams = {},
  defaultName = "",
  auth,
  onSaved,
  onLoginRequired,
  buttonPrimaryBg = "#293056",
  buttonPrimaryText = "#FFFFFF",
  buttonQuaternaryBg = "#FFFFFF",
  buttonQuaternaryText = "#293056"
}) {
  const [searchName, setSearchName] = useState(defaultName);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [frequency, setFrequency] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (isOpen) {
      setSearchName(defaultName);
      setError("");
    }
  }, [isOpen, defaultName]);
  if (!isOpen) return null;
  const criteria = summarizeCriteria(searchParams);
  const handleSave = async () => {
    if (!auth?.user) {
      stashPendingSavedSearch({ search_params: searchParams, name: searchName || defaultName });
      onClose();
      if (onLoginRequired) onLoginRequired();
      return;
    }
    if (!searchName.trim()) {
      setError("Please enter a name for your search");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/save-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-CSRF-TOKEN": getCsrfToken()
        },
        body: JSON.stringify({
          name: searchName.trim(),
          search_params: searchParams,
          email_alerts: emailAlerts,
          frequency
        })
      });
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html") || response.status === 401) {
        stashPendingSavedSearch({ search_params: searchParams, name: searchName || defaultName });
        onClose();
        if (onLoginRequired) onLoginRequired();
        return;
      }
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save search");
      }
      onClose();
      if (onSaved) onSaved(result.data);
    } catch (e) {
      setError(e.message || "Failed to save search. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg p-6 w-full max-w-md", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
      /* @__PURE__ */ jsxs("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
        /* @__PURE__ */ jsx("path", { d: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9", stroke: buttonPrimaryBg, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }),
        /* @__PURE__ */ jsx("path", { d: "M13.73 21a2 2 0 0 1-3.46 0", stroke: buttonPrimaryBg, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" })
      ] }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold", style: { color: buttonQuaternaryText }, children: "Get email alerts" })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mb-4", children: "We'll email you when new listings match this search." }),
    criteria && /* @__PURE__ */ jsx("div", { className: "mb-4 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700", children: criteria }),
    /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
      /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Search Name" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: searchName,
          onChange: (e) => setSearchName(e.target.value),
          placeholder: "e.g., Downtown Toronto Condos",
          className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#293056]"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxs("label", { className: "flex items-center", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "checkbox",
          checked: emailAlerts,
          onChange: (e) => setEmailAlerts(e.target.checked),
          className: "rounded border-gray-300 text-[#293056] focus:ring-[#293056]"
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Send me email alerts for new matching listings" })
    ] }) }),
    emailAlerts && /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Alert frequency" }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: FREQUENCIES.map((f) => /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setFrequency(f.value),
          className: "flex-1 px-3 py-2 rounded-md border text-sm font-medium transition-all",
          style: frequency === f.value ? { backgroundColor: buttonPrimaryBg, color: buttonPrimaryText, borderColor: buttonPrimaryBg } : { backgroundColor: "#FFFFFF", color: "#374151", borderColor: "#D1D5DB" },
          children: f.label
        },
        f.value
      )) })
    ] }),
    error && /* @__PURE__ */ jsx("div", { className: "mb-4 text-sm text-red-600", children: error }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onClose,
          className: "flex-1 px-4 py-2 border rounded-md hover:opacity-80 transition-all",
          style: { backgroundColor: buttonQuaternaryBg, color: buttonQuaternaryText, borderColor: buttonQuaternaryText },
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleSave,
          disabled: isLoading,
          className: "flex-1 px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-50",
          style: { backgroundColor: buttonPrimaryBg, color: buttonPrimaryText },
          children: isLoading ? "Saving..." : emailAlerts ? "Save & Get Alerts" : "Save Search"
        }
      )
    ] })
  ] }) });
}
export {
  PENDING_SAVED_SEARCH_KEY,
  SaveSearchModal as default,
  popPendingSavedSearch,
  stashPendingSavedSearch
};
