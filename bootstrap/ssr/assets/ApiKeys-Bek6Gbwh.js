import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { A as AdminLayout } from "./AdminLayout-CfYoZrH6.js";
import { useForm } from "@inertiajs/react";
import { I as InputError } from "./InputError-CBvD_6aD.js";
import { I as InputLabel } from "./InputLabel-DE424DvN.js";
import { P as PrimaryButton } from "./PrimaryButton-DDF1xnxF.js";
import { S as SecondaryButton } from "./SecondaryButton-D0HLp6wy.js";
import { T as TextInput } from "./TextInput-D0qTZeQv.js";
import axios from "axios";
function ApiKeys({ title, api_keys, mls_settings, connection_status, status }) {
  const [showValues, setShowValues] = useState({});
  const [testResults, setTestResults] = useState({});
  const [testing, setTesting] = useState({});
  const [activeTab, setActiveTab] = useState("api_keys");
  const { data, setData, post, processing, errors, reset } = useForm({
    // API Keys
    repliers_api_url: api_keys.repliers_api_url || "",
    repliers_api_key: "",
    google_maps_api_key: "",
    walkscore_api_key: "",
    // MLS Settings
    mls_auto_sync: mls_settings?.auto_sync ?? true,
    mls_sync_interval: mls_settings?.sync_interval ?? 60,
    mls_max_properties: mls_settings?.max_properties ?? 1e3,
    mls_default_city: mls_settings?.default_city ?? "Toronto",
    default_building_address: mls_settings?.default_building_address ?? "55 Mercer Street",
    cache_ttl: mls_settings?.cache_ttl ?? 300
  });
  const toggleShowValue = (fieldName) => {
    setShowValues((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };
  const submit = (e) => {
    e.preventDefault();
    post(route("admin.api-keys.update"), {
      onSuccess: () => {
        reset("repliers_api_key", "google_maps_api_key", "walkscore_api_key");
      }
    });
  };
  const getStatusColor = (status2) => {
    switch (status2) {
      case "configured":
        return "text-green-600";
      case "not_configured":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };
  const getStatusText = (status2) => {
    switch (status2) {
      case "configured":
        return "Configured";
      case "not_configured":
        return "Not Configured";
      default:
        return "Unknown";
    }
  };
  const testApiConnection = async (apiType) => {
    setTesting((prev) => ({ ...prev, [apiType]: true }));
    setTestResults((prev) => ({ ...prev, [apiType]: null }));
    try {
      const response = await axios.post(route("admin.api-keys.test"), {
        api_type: apiType
      });
      setTestResults((prev) => ({ ...prev, [apiType]: response.data }));
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        [apiType]: {
          success: false,
          message: error.response?.data?.message || "Test failed"
        }
      }));
    } finally {
      setTesting((prev) => ({ ...prev, [apiType]: false }));
    }
  };
  const apiKeysConfig = [
    {
      id: "repliers_api_url",
      label: "Repliers API URL",
      type: "url",
      description: "The base URL for the Repliers MLS API endpoint.",
      placeholder: "https://api.repliers.io/",
      required: true,
      showToggle: false,
      currentValue: api_keys.repliers_api_url
    },
    {
      id: "repliers_api_key",
      label: "Repliers API Key",
      type: "password",
      description: "API key for Repliers MLS API authentication.",
      placeholder: "Enter your Repliers API key",
      required: true,
      showToggle: true,
      currentValue: api_keys.repliers_api_key
    },
    {
      id: "google_maps_api_key",
      label: "Google Maps API Key",
      type: "password",
      description: "API key for Google Maps integration and geocoding services.",
      placeholder: "Enter your Google Maps API key",
      required: false,
      showToggle: true,
      currentValue: api_keys.google_maps_api_key
    },
    {
      id: "walkscore_api_key",
      label: "WalkScore API Key",
      type: "password",
      description: "API key for WalkScore integration to show walkability ratings.",
      placeholder: "Enter your WalkScore API key",
      required: false,
      showToggle: true,
      currentValue: api_keys.walkscore_api_key
    }
  ];
  return /* @__PURE__ */ jsx(AdminLayout, { title, children: /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsx("div", { className: "md:flex md:items-center md:justify-between", children: /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight", children: "API Keys Management" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500", children: "Configure your API credentials for Repliers, Google Maps, and other services" })
    ] }) }),
    status && /* @__PURE__ */ jsx("div", { className: "rounded-md bg-green-50 p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex", children: [
      /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx("svg", { className: "h-5 w-5 text-green-400", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }) }),
      /* @__PURE__ */ jsx("div", { className: "ml-3", children: /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-green-800", children: status }) })
    ] }) }),
    connection_status && /* @__PURE__ */ jsxs("div", { className: "bg-white shadow rounded-lg p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "API Connection Status" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
          /* @__PURE__ */ jsx("div", { className: `w-3 h-3 rounded-full ${connection_status.repliers === "configured" ? "bg-green-400" : "bg-red-400"}` }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Repliers API" }),
          /* @__PURE__ */ jsx("span", { className: `text-sm ${getStatusColor(connection_status.repliers)}`, children: getStatusText(connection_status.repliers) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
          /* @__PURE__ */ jsx("div", { className: `w-3 h-3 rounded-full ${connection_status.google_maps === "configured" ? "bg-green-400" : "bg-red-400"}` }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Google Maps" }),
          /* @__PURE__ */ jsx("span", { className: `text-sm ${getStatusColor(connection_status.google_maps)}`, children: getStatusText(connection_status.google_maps) })
        ] })
      ] }),
      connection_status.last_test && /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500 mt-4", children: [
        "Last tested: ",
        new Date(connection_status.last_test).toLocaleString()
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "border-b border-gray-200", children: /* @__PURE__ */ jsxs("nav", { className: "-mb-px flex space-x-8", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setActiveTab("api_keys"),
          className: `py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "api_keys" ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`,
          children: "API Keys"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setActiveTab("mls_settings"),
          className: `py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "mls_settings" ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`,
          children: "MLS Settings"
        }
      )
    ] }) }),
    activeTab === "api_keys" && /* @__PURE__ */ jsx("div", { className: "bg-white shadow rounded-lg", children: /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-6 p-6", children: [
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-6", children: apiKeysConfig.map((config) => /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: config.id, value: config.label, className: "font-semibold" }),
          config.required && /* @__PURE__ */ jsx("span", { className: "text-sm text-red-500", children: "Required" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mb-2", children: config.description }),
        config.currentValue && /* @__PURE__ */ jsx("div", { className: "bg-gray-50 rounded-md p-3 mb-2", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-600", children: "Current:" }),
            /* @__PURE__ */ jsx("code", { className: "text-sm bg-gray-200 px-2 py-1 rounded font-mono", children: config.showToggle && !showValues[config.id] ? config.currentValue : config.currentValue })
          ] }),
          config.showToggle && config.currentValue && /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => toggleShowValue(config.id),
              className: "text-sm text-indigo-600 hover:text-indigo-500",
              children: showValues[config.id] ? "Hide" : "Show"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: config.id,
              type: config.showToggle && showValues[config.id] ? "text" : config.type,
              name: config.id,
              value: data[config.id],
              className: "block w-full",
              placeholder: config.placeholder,
              onChange: (e) => setData(config.id, e.target.value)
            }
          ),
          config.showToggle && /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "absolute inset-y-0 right-0 pr-3 flex items-center",
              onClick: () => toggleShowValue(config.id),
              children: showValues[config.id] ? /* @__PURE__ */ jsx("svg", { className: "h-5 w-5 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" }) }) : /* @__PURE__ */ jsxs("svg", { className: "h-5 w-5 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: [
                /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" }),
                /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.275 4.057-5.065 7-9.543 7-4.477 0-8.268-2.943-9.542-7z" })
              ] })
            }
          )
        ] }),
        /* @__PURE__ */ jsx(InputError, { message: errors[config.id], className: "mt-2" })
      ] }, config.id)) }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-end pt-6 border-t border-gray-200", children: /* @__PURE__ */ jsx(PrimaryButton, { disabled: processing, children: processing ? "Saving..." : "Save API Keys" }) })
    ] }) }),
    activeTab === "mls_settings" && /* @__PURE__ */ jsx("div", { className: "bg-white shadow rounded-lg", children: /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-6 p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "mls_auto_sync", value: "Auto Sync MLS", className: "font-semibold" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mb-2", children: "Automatically synchronize properties from MLS API" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                id: "mls_auto_sync",
                type: "checkbox",
                checked: data.mls_auto_sync,
                onChange: (e) => setData("mls_auto_sync", e.target.checked),
                className: "rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              }
            ),
            /* @__PURE__ */ jsx("label", { htmlFor: "mls_auto_sync", className: "ml-2 text-sm text-gray-700", children: "Enable automatic MLS synchronization" })
          ] }),
          /* @__PURE__ */ jsx(InputError, { message: errors.mls_auto_sync, className: "mt-2" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "mls_sync_interval", value: "Sync Interval (minutes)", className: "font-semibold" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mb-2", children: "How often to sync properties from MLS API (5-1440 minutes)" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "mls_sync_interval",
              type: "number",
              min: "5",
              max: "1440",
              value: data.mls_sync_interval,
              className: "block w-full",
              placeholder: "60",
              onChange: (e) => setData("mls_sync_interval", parseInt(e.target.value) || 60)
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.mls_sync_interval, className: "mt-2" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "mls_max_properties", value: "Max Properties", className: "font-semibold" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mb-2", children: "Maximum number of properties to sync (10-10,000)" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "mls_max_properties",
              type: "number",
              min: "10",
              max: "10000",
              value: data.mls_max_properties,
              className: "block w-full",
              placeholder: "1000",
              onChange: (e) => setData("mls_max_properties", parseInt(e.target.value) || 1e3)
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.mls_max_properties, className: "mt-2" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "mls_default_city", value: "Default City", className: "font-semibold" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mb-2", children: "Default city for MLS property searches" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "mls_default_city",
              type: "text",
              value: data.mls_default_city,
              className: "block w-full",
              placeholder: "Toronto",
              onChange: (e) => setData("mls_default_city", e.target.value)
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.mls_default_city, className: "mt-2" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "default_building_address", value: "Default Building Address", className: "font-semibold" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mb-2", children: 'Default building address for homepage property listings (e.g., "55 Mercer Street")' }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "default_building_address",
              type: "text",
              value: data.default_building_address,
              className: "block w-full",
              placeholder: "55 Mercer Street",
              onChange: (e) => setData("default_building_address", e.target.value)
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.default_building_address, className: "mt-2" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "cache_ttl", value: "Cache TTL (seconds)", className: "font-semibold" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mb-2", children: "Cache time-to-live for API responses (60-3600 seconds)" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "cache_ttl",
              type: "number",
              min: "60",
              max: "3600",
              value: data.cache_ttl,
              className: "block w-full",
              placeholder: "300",
              onChange: (e) => setData("cache_ttl", parseInt(e.target.value) || 300)
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.cache_ttl, className: "mt-2" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-end pt-6 border-t border-gray-200", children: /* @__PURE__ */ jsx(PrimaryButton, { disabled: processing, children: processing ? "Saving..." : "Save MLS Settings" }) })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "bg-white shadow rounded-lg", children: /* @__PURE__ */ jsxs("div", { className: "px-4 py-5 sm:p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg leading-6 font-medium text-gray-900 mb-4", children: "API Status & Testing" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 px-4 py-4 rounded-lg", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
              /* @__PURE__ */ jsx("div", { className: `w-3 h-3 rounded-full mr-3 ${api_keys.repliers_api_key ? "bg-green-400" : "bg-red-400"}` }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900", children: "Repliers API" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: api_keys.repliers_api_key ? "Connected" : "Not configured" })
              ] })
            ] }),
            api_keys.repliers_api_key && /* @__PURE__ */ jsx(
              SecondaryButton,
              {
                onClick: () => testApiConnection("repliers"),
                disabled: testing.repliers,
                children: testing.repliers ? "Testing..." : "Test Connection"
              }
            )
          ] }),
          testResults.repliers && /* @__PURE__ */ jsxs("div", { className: `mt-3 p-3 rounded text-sm ${testResults.repliers.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`, children: [
            testResults.repliers.message,
            testResults.repliers.data && /* @__PURE__ */ jsxs("div", { className: "mt-1 text-xs", children: [
              "Properties accessible: ",
              testResults.repliers.data.property_count
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 px-4 py-4 rounded-lg", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
              /* @__PURE__ */ jsx("div", { className: `w-3 h-3 rounded-full mr-3 ${api_keys.google_maps_api_key ? "bg-green-400" : "bg-yellow-400"}` }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900", children: "Google Maps" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: api_keys.google_maps_api_key ? "Connected" : "Optional" })
              ] })
            ] }),
            api_keys.google_maps_api_key && /* @__PURE__ */ jsx(
              SecondaryButton,
              {
                onClick: () => testApiConnection("google_maps"),
                disabled: testing.google_maps,
                children: testing.google_maps ? "Testing..." : "Test Connection"
              }
            )
          ] }),
          testResults.google_maps && /* @__PURE__ */ jsx("div", { className: `mt-3 p-3 rounded text-sm ${testResults.google_maps.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`, children: testResults.google_maps.message })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 px-4 py-4 rounded-lg", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
              /* @__PURE__ */ jsx("div", { className: `w-3 h-3 rounded-full mr-3 ${api_keys.walkscore_api_key ? "bg-green-400" : "bg-yellow-400"}` }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900", children: "WalkScore" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: api_keys.walkscore_api_key ? "Connected" : "Optional" })
              ] })
            ] }),
            api_keys.walkscore_api_key && /* @__PURE__ */ jsx(
              SecondaryButton,
              {
                onClick: () => testApiConnection("walkscore"),
                disabled: testing.walkscore,
                children: testing.walkscore ? "Testing..." : "Test Connection"
              }
            )
          ] }),
          testResults.walkscore && /* @__PURE__ */ jsxs("div", { className: `mt-3 p-3 rounded text-sm ${testResults.walkscore.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`, children: [
            testResults.walkscore.message,
            testResults.walkscore.data && /* @__PURE__ */ jsxs("div", { className: "mt-1 text-xs", children: [
              "Toronto WalkScore: ",
              testResults.walkscore.data.walkscore
            ] })
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex", children: [
      /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx("svg", { className: "h-5 w-5 text-blue-400", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z", clipRule: "evenodd" }) }) }),
      /* @__PURE__ */ jsxs("div", { className: "ml-3", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-blue-800", children: "Need Help?" }),
        /* @__PURE__ */ jsx("div", { className: "mt-2 text-sm text-blue-700", children: /* @__PURE__ */ jsxs("ul", { className: "list-disc list-inside space-y-1", children: [
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Repliers API:" }),
            " Get your API key from your Repliers account dashboard"
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Google Maps:" }),
            " Get your API key from the Google Cloud Console"
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "WalkScore:" }),
            " Sign up at walkscore.com/professional/api"
          ] })
        ] }) })
      ] })
    ] }) })
  ] }) });
}
export {
  ApiKeys as default
};
