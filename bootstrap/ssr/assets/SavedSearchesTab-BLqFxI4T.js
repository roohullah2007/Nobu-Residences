import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { usePage, Link, router } from "@inertiajs/react";
function SavedSearchesTab() {
  const { globalWebsite, website } = usePage().props;
  const brandColors = globalWebsite?.brand_colors || website?.brand_colors || {};
  const buttonPrimaryBg = brandColors.button_primary_bg || "#293056";
  const buttonPrimaryText = brandColors.button_primary_text || "#FFFFFF";
  const [savedSearches, setSavedSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    fetchSavedSearches();
  }, []);
  const fetchSavedSearches = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/saved-searches", {
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSavedSearches(data.data || []);
        }
      }
    } catch (error) {
      console.error("Error fetching saved searches:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const formatSavedSearch = (search) => {
    const params = search.search_params || {};
    const location = params.query || "Any Location";
    const priceMin = params.price_min || 0;
    const priceMax = params.price_max || 1e7;
    let priceRange;
    if (priceMax >= 1e7) {
      priceRange = `$${(priceMin / 1e3).toFixed(0)}k+`;
    } else {
      priceRange = `$${(priceMin / 1e3).toFixed(0)}k - $${priceMax < 1e6 ? (priceMax / 1e3).toFixed(0) + "k" : (priceMax / 1e6).toFixed(1) + "M"}`;
    }
    const savedDate = new Date(search.created_at);
    const now = /* @__PURE__ */ new Date();
    const diffTime = Math.abs(now - savedDate);
    const diffDays = Math.floor(diffTime / (1e3 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1e3 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1e3 * 60));
    let timeAgo = "Just now";
    if (diffDays > 7) {
      timeAgo = `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
    } else if (diffDays > 1) {
      timeAgo = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } else if (diffDays === 1) {
      timeAgo = "Yesterday";
    } else if (diffHours > 1) {
      timeAgo = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else if (diffMinutes > 1) {
      timeAgo = `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    }
    return {
      ...search,
      location,
      priceRange,
      timeAgo,
      results: search.results_count || 0
    };
  };
  const runSearch = (search) => {
    const params = search.search_params || {};
    const queryParams = new URLSearchParams();
    if (params.query) {
      queryParams.append("query", params.query);
    }
    if (params.status) {
      queryParams.append("status", params.status);
    }
    if (params.price_min) {
      queryParams.append("price_min", params.price_min);
    }
    if (params.price_max) {
      queryParams.append("price_max", params.price_max);
    }
    if (params.property_type && Array.isArray(params.property_type)) {
      params.property_type.forEach((type) => {
        queryParams.append("property_type[]", type);
      });
    }
    if (params.bedrooms) {
      queryParams.append("bedrooms", params.bedrooms);
    }
    if (params.bathrooms) {
      queryParams.append("bathrooms", params.bathrooms);
    }
    if (params.min_sqft) {
      queryParams.append("min_sqft", params.min_sqft);
    }
    if (params.max_sqft) {
      queryParams.append("max_sqft", params.max_sqft);
    }
    if (params.parking) {
      queryParams.append("parking", params.parking);
    }
    if (params.sort_by) {
      queryParams.append("sort_by", params.sort_by);
    }
    const searchUrl = `/search?${queryParams.toString()}`;
    router.visit(searchUrl, {
      preserveState: false,
      preserveScroll: false
    });
  };
  const deleteSavedSearch = async (searchId) => {
    if (!confirm("Are you sure you want to delete this saved search?")) {
      return;
    }
    try {
      const response = await fetch(`/api/saved-searches/${searchId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        }
      });
      if (response.ok) {
        setSavedSearches((prev) => prev.filter((s) => s.id !== searchId));
        const successMsg = document.createElement("div");
        successMsg.className = "fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
        successMsg.innerHTML = '<span class="flex items-center gap-2">✓ Search deleted successfully!</span>';
        document.body.appendChild(successMsg);
        setTimeout(() => {
          successMsg.style.transition = "opacity 0.3s";
          successMsg.style.opacity = "0";
          setTimeout(() => successMsg.remove(), 300);
        }, 2500);
      }
    } catch (error) {
      console.error("Error deleting saved search:", error);
    }
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-space-grotesk font-bold text-[#293056] mb-6", children: "Saved Searches" }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "inline-block w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mb-4", style: { borderColor: buttonPrimaryBg, borderTopColor: "transparent" } }),
        /* @__PURE__ */ jsx("div", { className: "text-gray-600", children: "Loading saved searches..." })
      ] }) })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-space-grotesk font-bold text-[#293056]", children: "Saved Searches" }),
      /* @__PURE__ */ jsx(
        Link,
        {
          href: "/search",
          className: "text-sm text-[#293056] hover:text-[#1e2142] font-medium",
          children: "Create new search →"
        }
      )
    ] }),
    savedSearches.length > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-6", children: savedSearches.map((search) => {
      const formatted = formatSavedSearch(search);
      return /* @__PURE__ */ jsx("div", { className: "bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-medium text-gray-900 mb-1", children: search.name }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center flex-wrap gap-2 text-sm text-gray-600", children: [
            search.search_params.status && /* @__PURE__ */ jsx("span", { className: "bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium", children: search.search_params.status }),
            /* @__PURE__ */ jsx("span", { className: "bg-gray-100 px-2 py-1 rounded", children: formatted.location }),
            /* @__PURE__ */ jsx("span", { className: "bg-green-100 text-green-700 px-2 py-1 rounded", children: formatted.priceRange }),
            search.search_params.property_type && search.search_params.property_type.length > 0 && /* @__PURE__ */ jsx("span", { className: "bg-purple-100 text-purple-700 px-2 py-1 rounded", children: search.search_params.property_type.join(", ") }),
            search.search_params.bedrooms > 0 && /* @__PURE__ */ jsxs("span", { className: "bg-orange-100 text-orange-700 px-2 py-1 rounded", children: [
              search.search_params.bedrooms,
              "+ beds"
            ] }),
            search.search_params.bathrooms > 0 && /* @__PURE__ */ jsxs("span", { className: "bg-indigo-100 text-indigo-700 px-2 py-1 rounded", children: [
              search.search_params.bathrooms,
              "+ baths"
            ] }),
            (search.search_params.min_sqft > 0 || search.search_params.max_sqft > 0) && /* @__PURE__ */ jsx("span", { className: "bg-teal-100 text-teal-700 px-2 py-1 rounded", children: search.search_params.min_sqft > 0 && search.search_params.max_sqft > 0 ? `${search.search_params.min_sqft}-${search.search_params.max_sqft} sqft` : search.search_params.min_sqft > 0 ? `${search.search_params.min_sqft}+ sqft` : `Up to ${search.search_params.max_sqft} sqft` }),
            search.search_params.parking > 0 && /* @__PURE__ */ jsxs("span", { className: "bg-gray-100 px-2 py-1 rounded", children: [
              search.search_params.parking,
              "+ parking"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mt-2", children: [
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500", children: [
              "Saved ",
              formatted.timeAgo
            ] }),
            search.email_alerts && /* @__PURE__ */ jsxs("span", { className: "text-xs text-green-600 flex items-center gap-1", children: [
              /* @__PURE__ */ jsx("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M10 2v2a6 6 0 016 6h2a8 8 0 00-8-8zM0 12a10 10 0 0020 0h-2a8 8 0 11-16 0H0zm4 0a6 6 0 1112 0H4z" }) }),
              "Email alerts enabled"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 ml-4", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => runSearch(search),
              className: "px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-all",
              style: { backgroundColor: buttonPrimaryBg, color: buttonPrimaryText },
              children: "Run Search"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => deleteSavedSearch(search.id),
              className: "px-3 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors",
              title: "Delete search",
              children: /* @__PURE__ */ jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsx("path", { d: "M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" }) })
            }
          )
        ] })
      ] }) }, search.id);
    }) }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-12 bg-gray-50 rounded-lg", children: [
      /* @__PURE__ */ jsx("div", { className: "w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsx("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "#6B7280", strokeWidth: "2", children: /* @__PURE__ */ jsx("path", { d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }) }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No saved searches yet" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-600 mb-6 max-w-md mx-auto", children: "Save your searches to quickly access them later and get email alerts when new properties match your criteria" }),
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: "/search",
          className: "inline-flex items-center px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-all",
          style: { backgroundColor: buttonPrimaryBg, color: buttonPrimaryText },
          children: [
            /* @__PURE__ */ jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", className: "mr-2", children: /* @__PURE__ */ jsx("path", { d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }),
            "Start Searching"
          ]
        }
      )
    ] })
  ] });
}
export {
  SavedSearchesTab as default
};
