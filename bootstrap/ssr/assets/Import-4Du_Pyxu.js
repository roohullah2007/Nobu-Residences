import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import { A as AdminLayout } from "./AdminLayout-CaxbTFCB.js";
import { c as csrfHeaders } from "./csrf-Rc-HMXbg.js";
const UPLOAD_CHUNK_BYTES = 1.5 * 1024 * 1024;
const PROCESS_RETRY_MS = 2e3;
const MAX_PROCESS_RETRIES = 3;
const HEADER_ALIASES = {
  name: "name",
  building: "name",
  building_name: "name",
  title: "name",
  address: "address",
  street_address: "address",
  full_address: "address",
  street_1: "address",
  street1: "address",
  street_2: "street_address_2",
  street2: "street_address_2",
  street_address_2: "street_address_2",
  city: "city",
  town: "city",
  province: "province",
  state: "province",
  postal_code: "postal_code",
  postcode: "postal_code",
  zip: "postal_code",
  zip_code: "postal_code",
  country: "country",
  building_type: "building_type",
  type: "building_type",
  status: "status",
  listing_type: "listing_type",
  developer: "developer_name",
  developer_name: "developer_name",
  builder: "developer_name",
  neighbourhood: "neighbourhood_name",
  neighborhood: "neighbourhood_name",
  neighbourhood_1: "neighbourhood_name",
  neighborhood_1: "neighbourhood_name",
  sub_neighbourhood: "sub_neighbourhood_name",
  sub_neighborhood: "sub_neighbourhood_name",
  neighbourhood_2: "sub_neighbourhood_name",
  neighborhood_2: "sub_neighbourhood_name",
  management: "management_name",
  management_name: "management_name",
  management_company: "management_name",
  corp_number: "corp_number",
  corp: "corp_number",
  date_registered: "date_registered",
  registered: "date_registered",
  total_units: "total_units",
  units: "total_units",
  floors: "floors",
  storeys: "floors",
  stories: "floors",
  year_built: "year_built",
  built: "year_built",
  year: "year_built",
  built_year: "year_built",
  parking_spots: "parking_spots",
  parking: "parking_spots",
  locker_spots: "locker_spots",
  lockers: "locker_spots",
  maintenance_fee_range: "maintenance_fee_range",
  maintenance_fees: "maintenance_fee_range",
  included_in_maintenance: "maintenance_fee_amenities",
  maintenance_includes: "maintenance_fee_amenities",
  amenities: "amenities",
  sqft_range: "sqft_range",
  avg_unit_size: "sqft_range",
  unit_size: "sqft_range",
  avg_price_per_sqft: "avg_price_per_sqft",
  price_per_sqft: "avg_price_per_sqft",
  images: "images",
  image_links: "images",
  image_urls: "images",
  photos: "images",
  description: "description",
  notes: "description",
  overview: "description",
  // NOTE: a column literally named "URL" is deliberately NOT auto-mapped —
  // spreadsheet exports (condos.ca) put their own listing link there, which
  // we never want imported. "website_url" / "website" headers still map.
  website_url: "website_url",
  website: "website_url",
  virtual_tour_url: "virtual_tour_url",
  virtual_tour: "virtual_tour_url",
  latitude: "latitude",
  lat: "latitude",
  longitude: "longitude",
  lng: "longitude",
  lon: "longitude"
};
const guessField = (header) => {
  const normalized = header.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  return HEADER_ALIASES[normalized] ?? "";
};
const SAMPLE_CSV_HEADERS = [
  "name",
  "address",
  "city",
  "province",
  "postal_code",
  "country",
  "building_type",
  "status",
  "listing_type",
  "developer",
  "neighbourhood",
  "sub_neighbourhood",
  "management",
  "corp_number",
  "date_registered",
  "total_units",
  "floors",
  "year_built",
  "parking_spots",
  "locker_spots",
  "maintenance_fee_range",
  "description",
  "website_url",
  "virtual_tour_url",
  "latitude",
  "longitude"
];
const SAMPLE_CSV_ROW = [
  "Example Tower",
  "123 King St W, Toronto",
  "Toronto",
  "ON",
  "M5V 1J2",
  "Canada",
  "condominium",
  "active",
  "For Sale",
  "Example Developments Inc",
  "Entertainment District",
  "King West",
  "Example Property Management",
  "TSCC 1234",
  "2020-06-15",
  "350",
  "45",
  "2020",
  "200",
  "300",
  "$450 - $900",
  "A sample building row - replace with real data.",
  "https://example.com",
  "https://example.com/tour",
  "43.6452",
  "-79.3897"
];
const downloadSampleCsv = () => {
  const csv = `${SAMPLE_CSV_HEADERS.join(",")}
${SAMPLE_CSV_ROW.map((v) => `"${v}"`).join(",")}
`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "buildings-import-template.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
function BuildingsImport({ importableFields = {} }) {
  const [step, setStep] = useState("upload");
  const [isBusy, setIsBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [upload, setUpload] = useState(null);
  const [mapping, setMapping] = useState({});
  const [duplicateAction, setDuplicateAction] = useState("skip");
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(null);
  const pollTimerRef = useRef(null);
  const postJson = async (url, options = {}) => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...csrfHeaders(),
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json",
        ...options.headers
      },
      body: options.body
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 419) {
        throw new Error("Your session has expired — please refresh the page and try again.");
      }
      throw new Error(json?.message ?? `Server returned ${response.status}`);
    }
    return json;
  };
  const uploadFileInChunks = async (file) => {
    let token = null;
    let offset = 0;
    do {
      const blob = file.slice(offset, offset + UPLOAD_CHUNK_BYTES);
      const isLast = offset + blob.size >= file.size;
      const formData = new FormData();
      formData.append("chunk", blob, file.name);
      formData.append("offset", String(offset));
      formData.append("last", isLast ? "1" : "0");
      if (token) formData.append("token", token);
      const json = await postJson(route("admin.buildings.import.upload"), { body: formData });
      token = json.token;
      offset += blob.size;
      if (isLast) return json;
    } while (offset < file.size);
    throw new Error("The upload ended unexpectedly — please try again.");
  };
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsBusy(true);
    setErrorMessage("");
    try {
      if (!file.size) {
        throw new Error("The selected file is empty.");
      }
      const parsed = await uploadFileInChunks(file);
      setUpload(parsed);
      const guessed = {};
      parsed.headers.forEach((header, index) => {
        const field = guessField(header);
        if (field && !Object.values(guessed).includes(field)) {
          guessed[index] = field;
        }
      });
      setMapping(guessed);
      setStep("map");
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsBusy(false);
      e.target.value = null;
    }
  };
  const handleMappingChange = (columnIndex, field) => {
    setMapping((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (next[key] === field) delete next[key];
      });
      if (field) {
        next[columnIndex] = field;
      } else {
        delete next[columnIndex];
      }
      return next;
    });
  };
  const hasNameMapped = Object.values(mapping).includes("name");
  const hasAddressMapped = Object.values(mapping).includes("address");
  const handleImport = async () => {
    setIsBusy(true);
    setErrorMessage("");
    try {
      const json = await postJson(route("admin.buildings.import.run"), {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: upload.token,
          mapping,
          duplicate_action: duplicateAction
        })
      });
      setProgress({
        status: "queued",
        total: json.total ?? upload.total_rows,
        processed: 0,
        created: 0,
        updated: 0,
        skipped: 0,
        errors: {}
      });
      setStep("importing");
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsBusy(false);
    }
  };
  useEffect(() => {
    if (step !== "importing" || !upload?.token) return void 0;
    let cancelled = false;
    let retries = 0;
    const processNextChunk = async () => {
      if (cancelled) return;
      try {
        const json = await postJson(route("admin.buildings.import.process", upload.token));
        if (cancelled) return;
        retries = 0;
        setProgress(json);
        if (json.status === "finished") {
          setResult(json);
          setStep("done");
          return;
        }
        if (json.status === "failed") {
          setErrorMessage(json.message ?? "Import failed.");
          setStep("map");
          return;
        }
        pollTimerRef.current = setTimeout(processNextChunk, 250);
      } catch (err) {
        if (cancelled) return;
        retries += 1;
        if (retries >= MAX_PROCESS_RETRIES) {
          setErrorMessage(err.message);
          setStep("map");
          return;
        }
        pollTimerRef.current = setTimeout(processNextChunk, PROCESS_RETRY_MS);
      }
    };
    processNextChunk();
    return () => {
      cancelled = true;
      clearTimeout(pollTimerRef.current);
    };
  }, [step, upload?.token]);
  const resetWizard = () => {
    clearTimeout(pollTimerRef.current);
    setStep("upload");
    setUpload(null);
    setMapping({});
    setResult(null);
    setProgress(null);
    setErrorMessage("");
  };
  return /* @__PURE__ */ jsxs(AdminLayout, { title: "Import Buildings", children: [
    /* @__PURE__ */ jsx(Head, { title: "Import Buildings" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "sm:flex sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-base font-semibold leading-6 text-gray-900", children: "Import Buildings from CSV" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-700", children: "Upload a CSV, map its columns to building fields, and the rows import gradually in batches. Developers, neighbourhoods, and sub-neighbourhoods are matched by name and created automatically." })
        ] }),
        /* @__PURE__ */ jsx(
          Link,
          {
            href: route("admin.buildings.index"),
            className: "mt-3 sm:mt-0 inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50",
            children: "Back to Buildings"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-4 flex items-center gap-4 text-sm", children: [
        { key: "upload", label: "1. Upload CSV" },
        { key: "map", label: "2. Map Fields" },
        { key: "importing", label: "3. Importing" },
        { key: "done", label: "4. Results" }
      ].map(({ key, label }, index) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        index > 0 && /* @__PURE__ */ jsx("span", { className: "text-gray-300", children: "/" }),
        /* @__PURE__ */ jsx("span", { className: step === key ? "font-semibold text-indigo-700" : "text-gray-500", children: label })
      ] }, key)) }),
      errorMessage && /* @__PURE__ */ jsx("div", { className: "rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700", children: errorMessage }),
      step === "upload" && /* @__PURE__ */ jsx("div", { className: "bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-8", children: /* @__PURE__ */ jsxs("div", { className: "border-2 border-dashed border-gray-300 rounded-lg p-10 text-center hover:border-indigo-400 transition-colors", children: [
        /* @__PURE__ */ jsx("svg", { className: "mx-auto h-10 w-10 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" }) }),
        /* @__PURE__ */ jsxs("label", { className: "mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 cursor-pointer", children: [
          /* @__PURE__ */ jsx("input", { type: "file", className: "sr-only", accept: ".csv,text/csv", onChange: handleFileChange, disabled: isBusy }),
          isBusy ? "Reading file..." : "Choose CSV File"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-gray-500", children: "CSV up to 25MB — large files are uploaded in small parts automatically. The first row must be column headings." }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: downloadSampleCsv,
            className: "mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800",
            children: [
              /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" }) }),
              "Download sample CSV template"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("p", { className: "mt-2 text-xs text-gray-400 max-w-lg mx-auto", children: [
          "Recognized columns: ",
          SAMPLE_CSV_HEADERS.join(", "),
          ". Only name and address are required — headings are auto-mapped and you can adjust the mapping in the next step."
        ] })
      ] }) }),
      step === "map" && upload && /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsxs("h2", { className: "text-sm font-semibold text-gray-900", children: [
              "Map CSV columns to building fields",
              /* @__PURE__ */ jsxs("span", { className: "ml-2 font-normal text-gray-500", children: [
                "(",
                upload.total_rows,
                " rows found)"
              ] })
            ] }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: resetWizard, className: "text-sm text-indigo-600 hover:text-indigo-800", children: "Upload a different file" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-gray-200 text-sm", children: [
            /* @__PURE__ */ jsx("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("th", { className: "px-3 py-2 text-left font-medium text-gray-600", children: "CSV Column" }),
              /* @__PURE__ */ jsx("th", { className: "px-3 py-2 text-left font-medium text-gray-600", children: "Sample Data" }),
              /* @__PURE__ */ jsx("th", { className: "px-3 py-2 text-left font-medium text-gray-600", children: "Import As" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-100 bg-white", children: upload.headers.map((header, index) => /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-medium text-gray-900", children: header || `Column ${index + 1}` }),
              /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-gray-500 max-w-[220px] truncate", children: upload.preview.map((row) => row[index]).filter(Boolean).slice(0, 2).join(", ") || "—" }),
              /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxs(
                "select",
                {
                  className: "block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 !bg-white !text-gray-900",
                  value: mapping[index] ?? "",
                  onChange: (e) => handleMappingChange(String(index), e.target.value),
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "Don't import" }),
                    Object.entries(importableFields).map(([field, label]) => /* @__PURE__ */ jsx("option", { value: field, children: label }, field))
                  ]
                }
              ) })
            ] }, index)) })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-gray-900 mb-3", children: "If a building already exists (same name + address)" }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-6 text-sm text-gray-700", children: [
            /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "radio",
                  name: "duplicate_action",
                  value: "skip",
                  checked: duplicateAction === "skip",
                  onChange: () => setDuplicateAction("skip"),
                  className: "text-indigo-600 focus:ring-indigo-500"
                }
              ),
              "Skip the row"
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "radio",
                  name: "duplicate_action",
                  value: "update",
                  checked: duplicateAction === "update",
                  onChange: () => setDuplicateAction("update"),
                  className: "text-indigo-600 focus:ring-indigo-500"
                }
              ),
              "Update the existing building"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-6 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500", children: [
              !hasNameMapped && /* @__PURE__ */ jsx("p", { className: "text-red-600", children: 'Map a column to "Building Name" to continue.' }),
              hasNameMapped && !hasAddressMapped && /* @__PURE__ */ jsx("p", { className: "text-amber-600", children: 'Tip: mapping "Address" is required for new buildings.' })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: handleImport,
                disabled: isBusy || !hasNameMapped,
                className: "inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50",
                children: isBusy ? "Queueing..." : `Import ${upload.total_rows} Rows`
              }
            )
          ] })
        ] })
      ] }),
      step === "importing" && progress && /* @__PURE__ */ jsxs("div", { className: "bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6 space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxs("svg", { className: "h-5 w-5 animate-spin text-indigo-600", fill: "none", viewBox: "0 0 24 24", "aria-hidden": "true", children: [
            /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
            /* @__PURE__ */ jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-gray-900", children: "Importing" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500", children: "Buildings are processed gradually in batches. Keep this page open — it drives the import and shows live progress." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-gray-600 mb-1", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              progress.processed,
              " of ",
              progress.total,
              " rows"
            ] }),
            /* @__PURE__ */ jsxs("span", { children: [
              progress.total > 0 ? Math.round(progress.processed / progress.total * 100) : 0,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-2 w-full rounded-full bg-gray-100 overflow-hidden", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "h-full rounded-full bg-indigo-600 transition-all duration-500",
              style: { width: `${progress.total > 0 ? Math.min(100, progress.processed / progress.total * 100) : 0}%` }
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4", children: [
          { label: "Created", value: progress.created, classes: "bg-green-50 text-green-700" },
          { label: "Updated", value: progress.updated, classes: "bg-blue-50 text-blue-700" },
          { label: "Skipped", value: progress.skipped, classes: "bg-gray-50 text-gray-700" },
          { label: "Errors", value: Object.keys(progress.errors ?? {}).length, classes: "bg-red-50 text-red-700" }
        ].map(({ label, value, classes }) => /* @__PURE__ */ jsxs("div", { className: `rounded-lg p-4 text-center ${classes}`, children: [
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold", children: value }),
          /* @__PURE__ */ jsx("p", { className: "text-sm", children: label })
        ] }, label)) })
      ] }),
      step === "done" && result && /* @__PURE__ */ jsxs("div", { className: "bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6 space-y-6", children: [
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4", children: [
          { label: "Created", value: result.created, classes: "bg-green-50 text-green-700" },
          { label: "Updated", value: result.updated, classes: "bg-blue-50 text-blue-700" },
          { label: "Skipped", value: result.skipped, classes: "bg-gray-50 text-gray-700" },
          { label: "Errors", value: Object.keys(result.errors ?? {}).length, classes: "bg-red-50 text-red-700" }
        ].map(({ label, value, classes }) => /* @__PURE__ */ jsxs("div", { className: `rounded-lg p-4 text-center ${classes}`, children: [
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold", children: value }),
          /* @__PURE__ */ jsx("p", { className: "text-sm", children: label })
        ] }, label)) }),
        Object.keys(result.errors ?? {}).length > 0 && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-gray-900 mb-2", children: "Row errors" }),
          /* @__PURE__ */ jsx("ul", { className: "text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-4 space-y-1 max-h-64 overflow-y-auto", children: Object.entries(result.errors).map(([row, message]) => /* @__PURE__ */ jsxs("li", { children: [
            "Row ",
            row,
            ": ",
            message
          ] }, row)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsx(
            Link,
            {
              href: route("admin.buildings.index"),
              className: "inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700",
              children: "View Buildings"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: resetWizard,
              className: "inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50",
              children: "Import Another File"
            }
          )
        ] })
      ] })
    ] })
  ] });
}
export {
  BuildingsImport as default
};
