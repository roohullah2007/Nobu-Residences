import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useForm, Head, Link } from "@inertiajs/react";
import { A as AdminLayout } from "./AdminLayout-DVgDNs4A.js";
import { P as PrimaryButton } from "./PrimaryButton-DDF1xnxF.js";
import { S as SecondaryButton } from "./SecondaryButton-D0HLp6wy.js";
import { I as InputLabel } from "./InputLabel-DE424DvN.js";
import { T as TextInput } from "./TextInput-D0qTZeQv.js";
import { I as InputError } from "./InputError-CBvD_6aD.js";
import { Q as QuickCreateSelect } from "./QuickCreateSelect-ITDJ5W80.js";
function BuildingsCreate({ auth, developers = [], amenities = [], maintenanceFeeAmenities = [], neighbourhoods = [], subNeighbourhoods = [] }) {
  const { data, setData, post, processing, errors } = useForm({
    name: "",
    address: "",
    street_address_1: "",
    street_address_2: "",
    additional_addresses: [],
    city: "Toronto",
    province: "ON",
    postal_code: "",
    country: "Canada",
    management_name: "",
    corp_number: "",
    date_registered: "",
    building_type: "condominium",
    total_units: "",
    year_built: "",
    description: "",
    main_image: "",
    images: [],
    developer_id: "",
    neighbourhood_id: "",
    sub_neighbourhood_id: "",
    is_featured: false,
    latitude: "",
    longitude: "",
    amenity_ids: [],
    floors: "",
    parking_spots: "",
    locker_spots: "",
    maintenance_fee_range: "",
    website_url: "",
    floor_plans: [],
    virtual_tour_url: "",
    features: [],
    nearby_transit: [],
    neighborhood_info: "",
    deposit_structure: "",
    estimated_completion: "",
    architect: "",
    interior_designer: "",
    landscape_architect: "",
    status: "active",
    listing_type: "For Sale",
    maintenance_fee_amenity_ids: []
  });
  const [developerOptions, setDeveloperOptions] = useState(developers);
  const [neighbourhoodOptions, setNeighbourhoodOptions] = useState(neighbourhoods);
  const [subNeighbourhoodOptions, setSubNeighbourhoodOptions] = useState(subNeighbourhoods);
  const filteredSubNeighbourhoods = data.neighbourhood_id ? subNeighbourhoodOptions.filter((sub) => String(sub.neighbourhood_id) === String(data.neighbourhood_id)) : subNeighbourhoodOptions;
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedMaintenanceFeeAmenities, setSelectedMaintenanceFeeAmenities] = useState([]);
  const [imagePreview, setImagePreview] = useState("");
  const [galleryImages, setGalleryImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGalleryImage, setUploadingGalleryImage] = useState(false);
  const [showAmenitySelector, setShowAmenitySelector] = useState(false);
  const [amenitySearch, setAmenitySearch] = useState("");
  const [showMaintenanceAmenitySelector, setShowMaintenanceAmenitySelector] = useState(false);
  const [generatingAiDescription, setGeneratingAiDescription] = useState(false);
  const [aiDescriptionError, setAiDescriptionError] = useState("");
  const buildingTypes = [
    { value: "condominium", label: "Condominium" },
    { value: "apartment", label: "Apartment" },
    { value: "townhouse", label: "Townhouse" },
    { value: "commercial", label: "Commercial" },
    { value: "mixed_use", label: "Mixed Use" }
  ];
  const provinces = [
    { value: "ON", label: "Ontario" },
    { value: "BC", label: "British Columbia" },
    { value: "AB", label: "Alberta" },
    { value: "QC", label: "Quebec" },
    { value: "MB", label: "Manitoba" },
    { value: "SK", label: "Saskatchewan" },
    { value: "NS", label: "Nova Scotia" },
    { value: "NB", label: "New Brunswick" },
    { value: "NL", label: "Newfoundland and Labrador" },
    { value: "PE", label: "Prince Edward Island" },
    { value: "NT", label: "Northwest Territories" },
    { value: "YT", label: "Yukon" },
    { value: "NU", label: "Nunavut" }
  ];
  const amenityCategories = {
    "Building Features": ["Concierge", "Security", "Elevator", "Party Room", "Guest Suite", "Rooftop Terrace"],
    "Health & Wellness": ["Gym", "Yoga Studio", "Spa", "Sauna", "Steam Room", "Pool"],
    "Entertainment": ["Theatre", "Games Room", "Library", "BBQ Area", "Lounge"],
    "Business": ["Business Centre", "Meeting Room", "Co-working Space"],
    "Outdoor": ["Garden", "Playground", "Dog Park", "Tennis Court", "Basketball Court"],
    "Parking": ["Visitor Parking", "EV Charging", "Bike Storage", "Car Wash"]
  };
  const amenityIcons = {
    "Concierge": "🎩",
    "Security": "🔒",
    "Elevator": "🛗",
    "Party Room": "🎉",
    "Guest Suite": "🛏️",
    "Rooftop Terrace": "🏙️",
    "Gym": "💪",
    "Yoga Studio": "🧘",
    "Spa": "💆",
    "Sauna": "🧖",
    "Steam Room": "♨️",
    "Pool": "🏊",
    "Theatre": "🎬",
    "Games Room": "🎮",
    "Library": "📚",
    "BBQ Area": "🍖",
    "Lounge": "🛋️",
    "Business Centre": "💼",
    "Meeting Room": "👥",
    "Co-working Space": "💻",
    "Garden": "🌳",
    "Playground": "🎠",
    "Dog Park": "🐕",
    "Tennis Court": "🎾",
    "Basketball Court": "🏀",
    "Visitor Parking": "🅿️",
    "EV Charging": "🔌",
    "Bike Storage": "🚲",
    "Car Wash": "🚗"
  };
  const handleGenerateAiDescription = async () => {
    setGeneratingAiDescription(true);
    setAiDescriptionError("");
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
      const response = await fetch("/api/buildings/generate-ai-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken || "",
          "X-Requested-With": "XMLHttpRequest",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          building_data: {
            name: data.name,
            address: data.address,
            city: data.city,
            province: data.province,
            building_type: data.building_type,
            total_units: data.total_units,
            year_built: data.year_built,
            floors: data.floors,
            amenities: selectedAmenities.map((a) => a.name),
            maintenance_fee_amenities: selectedMaintenanceFeeAmenities.map((a) => a.name),
            maintenance_fee_range: data.maintenance_fee_range,
            developer_name: data.developer_name,
            management_name: data.management_name,
            existing_description: data.description
          }
        })
      });
      const result = await response.json();
      if (result.success && result.description) {
        setData("description", result.description);
        console.log("✅ 🤖 Building AI description generated successfully");
      } else {
        setAiDescriptionError(result.error || "Failed to generate AI description");
        console.error("❌ 🤖 Error generating building AI description:", result.error);
      }
    } catch (error) {
      console.error("❌ 🤖 Error generating building AI description:", error);
      setAiDescriptionError("Failed to generate AI description. Please try again.");
    } finally {
      setGeneratingAiDescription(false);
    }
  };
  const handleImageUpload = async (e, imageType = "main") => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const filesToUpload = imageType === "main" ? [files[0]] : files;
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    for (const file of filesToUpload) {
      if (!validTypes.includes(file.type)) {
        alert(`Invalid file type: ${file.name}. Please upload valid image files (JPEG, PNG, GIF, or WebP).`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`File too large: ${file.name}. Images must be less than 5MB.`);
        return;
      }
    }
    if (imageType === "main") {
      setUploadingImage(true);
    } else {
      setUploadingGalleryImage(true);
    }
    const uploadPromises = filesToUpload.map(async (file) => {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("image_type", imageType);
      try {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
        const response = await fetch("/api/buildings/upload-image", {
          method: "POST",
          headers: {
            "X-CSRF-TOKEN": csrfToken || "",
            "X-Requested-With": "XMLHttpRequest",
            "Accept": "application/json"
          },
          body: formData
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success && result.url) {
          return result.url;
        } else {
          console.error("Upload failed:", result.message);
          return null;
        }
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        return null;
      }
    });
    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      const successfulUploads = uploadedUrls.filter((url) => url !== null);
      if (successfulUploads.length > 0) {
        if (imageType === "main") {
          setData("main_image", successfulUploads[0]);
          setImagePreview(successfulUploads[0]);
        } else {
          const updatedImages = [...galleryImages, ...successfulUploads];
          setGalleryImages(updatedImages);
          setData("images", updatedImages);
        }
        if (successfulUploads.length < filesToUpload.length) {
          alert(`${successfulUploads.length} of ${filesToUpload.length} images uploaded successfully.`);
        }
      } else {
        alert("Failed to upload images. Please try again.");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      alert("Failed to upload images. Please try again.");
    } finally {
      if (imageType === "main") {
        setUploadingImage(false);
      } else {
        setUploadingGalleryImage(false);
      }
      e.target.value = null;
    }
  };
  const handleRemoveMainImage = () => {
    setData("main_image", "");
    setImagePreview("");
  };
  const handleRemoveGalleryImage = (imageUrl) => {
    const updatedImages = galleryImages.filter((img) => img !== imageUrl);
    setGalleryImages(updatedImages);
    setData("images", updatedImages);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      ...data,
      amenity_ids: selectedAmenities.map((a) => a.id),
      maintenance_fee_amenity_ids: selectedMaintenanceFeeAmenities.map((a) => a.id)
    };
    post(route("admin.buildings.store"), formData);
  };
  const toggleAmenity = (amenity) => {
    const exists = selectedAmenities.find((a) => a.id === amenity.id);
    if (exists) {
      setSelectedAmenities(selectedAmenities.filter((a) => a.id !== amenity.id));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };
  const toggleMaintenanceFeeAmenity = (amenity) => {
    const exists = selectedMaintenanceFeeAmenities.find((a) => a.id === amenity.id);
    if (exists) {
      setSelectedMaintenanceFeeAmenities(selectedMaintenanceFeeAmenities.filter((a) => a.id !== amenity.id));
    } else {
      setSelectedMaintenanceFeeAmenities([...selectedMaintenanceFeeAmenities, amenity]);
    }
  };
  const filteredAmenities = amenities.filter(
    (amenity) => amenity.name.toLowerCase().includes(amenitySearch.toLowerCase())
  );
  const detectAddressRange = (value) => {
    if (!value) return null;
    const rangeMatch = value.match(/^(\d+)\s*[-–—]\s*(\d+)\s+(.+)$/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10);
      const end = parseInt(rangeMatch[2], 10);
      const rest = rangeMatch[3].split(/\s*,/)[0].trim();
      if (!isNaN(start) && !isNaN(end) && end > start && rest) {
        const numbers = [];
        for (let n = start; n <= end; n += 1) {
          numbers.push(n);
          if (numbers.length > 50) break;
        }
        return {
          count: numbers.length,
          addresses: numbers.map((n) => `${n} ${rest}`)
        };
      }
    }
    const parts = value.split(/\s*[,&]\s*/).map((p) => p.trim()).filter((p) => /^\d/.test(p));
    if (parts.length >= 2) {
      return { count: parts.length, addresses: parts };
    }
    return null;
  };
  const handleExpandRange = () => {
    const range = detectAddressRange(data.address);
    if (!range) return;
    setData((prev) => ({
      ...prev,
      street_address_1: "",
      street_address_2: "",
      additional_addresses: range.addresses
    }));
  };
  const addressRange = detectAddressRange(data.address);
  return /* @__PURE__ */ jsxs(AdminLayout, { title: "Create Building", children: [
    /* @__PURE__ */ jsx(Head, { title: "Create Building" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsx("div", { className: "sm:flex sm:items-center", children: /* @__PURE__ */ jsxs("div", { className: "sm:flex-auto", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-base font-semibold leading-6 text-gray-900", children: "Create New Building" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-700", children: "Add a new building to your real estate portfolio." })
      ] }) }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "mt-8 space-y-8 [&_input]:!bg-white [&_input]:!text-gray-900 [&_textarea]:!bg-white [&_textarea]:!text-gray-900 [&_select]:!bg-white [&_select]:!text-gray-900", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2", children: /* @__PURE__ */ jsxs("div", { className: "px-4 py-6 sm:p-8", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold leading-7 text-gray-900 mb-6", children: "Basic Information" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "sm:col-span-3", children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "name", value: "Building Name *" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "name",
                  type: "text",
                  className: "mt-1 block w-full",
                  value: data.name,
                  onChange: (e) => setData("name", e.target.value),
                  placeholder: "e.g., The Well",
                  required: true
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.name, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "sm:col-span-3", children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "building_type", value: "Building Type *" }),
              /* @__PURE__ */ jsx(
                "select",
                {
                  id: "building_type",
                  className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500",
                  value: data.building_type,
                  onChange: (e) => setData("building_type", e.target.value),
                  required: true,
                  children: buildingTypes.map((type) => /* @__PURE__ */ jsx("option", { value: type.value, children: type.label }, type.value))
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.building_type, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "sm:col-span-3", children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "listing_type", value: "Listing Type *" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  id: "listing_type",
                  className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500",
                  value: data.listing_type,
                  onChange: (e) => setData("listing_type", e.target.value),
                  required: true,
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "For Sale", children: "For Sale" }),
                    /* @__PURE__ */ jsx("option", { value: "For Rent", children: "For Rent" }),
                    /* @__PURE__ */ jsx("option", { value: "Both", children: "Both (Sale & Rent)" })
                  ]
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.listing_type, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "sm:col-span-3", children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "status", value: "Status *" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  id: "status",
                  className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500",
                  value: data.status,
                  onChange: (e) => setData("status", e.target.value),
                  required: true,
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "active", children: "Active" }),
                    /* @__PURE__ */ jsx("option", { value: "pre_construction", children: "Pre Construction" }),
                    /* @__PURE__ */ jsx("option", { value: "under_construction", children: "Under Construction" }),
                    /* @__PURE__ */ jsx("option", { value: "completed", children: "Completed" }),
                    /* @__PURE__ */ jsx("option", { value: "sold_out", children: "Sold Out" })
                  ]
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.status, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "sm:col-span-4", children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "address", value: "Address *" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "address",
                  type: "text",
                  className: "mt-1 block w-full",
                  value: data.address,
                  onChange: (e) => setData("address", e.target.value),
                  placeholder: "e.g., 10 Capreol Crt — or a range like '8-30 Widmer St, Toronto'",
                  required: true
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.address, className: "mt-2" }),
              addressRange && /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center gap-2 text-sm text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md px-3 py-2", children: [
                /* @__PURE__ */ jsx("svg", { className: "h-4 w-4 flex-shrink-0", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M13 10V3L4 14h7v7l9-11h-7z" }) }),
                /* @__PURE__ */ jsxs("span", { children: [
                  "Detected range — expand to ",
                  addressRange.count,
                  " addresses?"
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: handleExpandRange,
                    className: "ml-auto inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700",
                    children: "Expand"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "city", value: "City *" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "city",
                  type: "text",
                  className: "mt-1 block w-full",
                  value: data.city,
                  onChange: (e) => setData("city", e.target.value),
                  placeholder: "e.g., Toronto",
                  required: true
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.city, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "sm:col-span-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx(InputLabel, { value: "Additional Street Addresses" }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setData("additional_addresses", [...data.additional_addresses || [], ""]),
                    className: "inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700",
                    children: "+ Add address"
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1", children: 'Use this for buildings that span multiple street numbers (e.g., "8-30 Widmer St").' }),
              /* @__PURE__ */ jsx("div", { className: "mt-2 space-y-2", children: (data.additional_addresses || []).map((addr, idx) => /* @__PURE__ */ jsxs("div", { className: "flex gap-2 items-center", children: [
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    type: "text",
                    className: "block w-full",
                    value: addr,
                    onChange: (e) => {
                      const next = [...data.additional_addresses];
                      next[idx] = e.target.value;
                      setData("additional_addresses", next);
                    },
                    placeholder: "e.g., 12 Widmer St"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      const next = data.additional_addresses.filter((_, i) => i !== idx);
                      setData("additional_addresses", next);
                    },
                    className: "px-2 py-1 text-red-600 hover:text-red-800 text-sm",
                    title: "Remove this address",
                    children: "×"
                  }
                )
              ] }, idx)) }),
              /* @__PURE__ */ jsx(InputError, { message: errors.additional_addresses, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "province", value: "Province *" }),
              /* @__PURE__ */ jsx(
                "select",
                {
                  id: "province",
                  className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500",
                  value: data.province,
                  onChange: (e) => setData("province", e.target.value),
                  required: true,
                  children: provinces.map((province) => /* @__PURE__ */ jsx("option", { value: province.value, children: province.label }, province.value))
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.province, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "postal_code", value: "Postal Code" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "postal_code",
                  type: "text",
                  className: "mt-1 block w-full",
                  value: data.postal_code,
                  onChange: (e) => setData("postal_code", e.target.value),
                  placeholder: "e.g., M5V 0K6"
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.postal_code, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "country", value: "Country" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "country",
                  type: "text",
                  className: "mt-1 block w-full",
                  value: data.country,
                  onChange: (e) => setData("country", e.target.value),
                  placeholder: "e.g., Canada"
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.country, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "sm:col-span-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx(InputLabel, { htmlFor: "description", value: "Description" }),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: handleGenerateAiDescription,
                    disabled: generatingAiDescription,
                    className: "inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                    children: [
                      /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 10V3L4 14h7v7l9-11h-7z" }) }),
                      generatingAiDescription ? "Generating..." : "Generate with AI"
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  id: "description",
                  rows: 4,
                  className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500",
                  value: data.description,
                  onChange: (e) => setData("description", e.target.value),
                  placeholder: "Enter building description or use AI to generate one automatically..."
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.description, className: "mt-2" }),
              aiDescriptionError && /* @__PURE__ */ jsx("div", { className: "mt-2 text-sm text-red-600", children: aiDescriptionError })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2", children: /* @__PURE__ */ jsxs("div", { className: "px-4 py-6 sm:p-8", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold leading-7 text-gray-900 mb-6", children: "Building Details" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "total_units", value: "Total Units" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "total_units",
                  type: "number",
                  className: "mt-1 block w-full",
                  value: data.total_units,
                  onChange: (e) => setData("total_units", e.target.value)
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.total_units, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "floors", value: "Number of Floors" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "floors",
                  type: "number",
                  className: "mt-1 block w-full",
                  value: data.floors,
                  onChange: (e) => setData("floors", e.target.value)
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.floors, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "year_built", value: "Year Built" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "year_built",
                  type: "number",
                  className: "mt-1 block w-full",
                  value: data.year_built,
                  onChange: (e) => setData("year_built", e.target.value),
                  min: "1900",
                  max: (/* @__PURE__ */ new Date()).getFullYear() + 10
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.year_built, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "parking_spots", value: "Parking Spots" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "parking_spots",
                  type: "number",
                  className: "mt-1 block w-full",
                  value: data.parking_spots,
                  onChange: (e) => setData("parking_spots", e.target.value)
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.parking_spots, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "locker_spots", value: "Locker Spots" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "locker_spots",
                  type: "number",
                  className: "mt-1 block w-full",
                  value: data.locker_spots,
                  onChange: (e) => setData("locker_spots", e.target.value)
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.locker_spots, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "sm:col-span-2", children: /* @__PURE__ */ jsx(
              QuickCreateSelect,
              {
                id: "developer_id",
                label: "Developer",
                value: data.developer_id,
                onChange: (value) => setData("developer_id", value),
                options: developerOptions,
                createUrl: route("admin.api.developers.store"),
                createPayload: { type: "developer" },
                createTitle: "New developer name",
                placeholder: "Select a developer",
                error: errors.developer_id,
                onCreated: (item) => setDeveloperOptions(
                  (prev) => prev.some((d) => d.id === item.id) ? prev : [...prev, item].sort((a, b) => a.name.localeCompare(b.name))
                )
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "management_name", value: "Management Company" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "management_name",
                  type: "text",
                  className: "mt-1 block w-full",
                  value: data.management_name,
                  onChange: (e) => setData("management_name", e.target.value),
                  placeholder: "Management company name"
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.management_name, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "corp_number", value: "Corp Number" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "corp_number",
                  type: "text",
                  className: "mt-1 block w-full",
                  value: data.corp_number,
                  onChange: (e) => setData("corp_number", e.target.value),
                  placeholder: "e.g., TSCC 2500"
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.corp_number, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "date_registered", value: "Date Registered" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "date_registered",
                  type: "date",
                  className: "mt-1 block w-full",
                  value: data.date_registered,
                  onChange: (e) => setData("date_registered", e.target.value)
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.date_registered, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "sm:col-span-3", children: /* @__PURE__ */ jsx(
              QuickCreateSelect,
              {
                id: "neighbourhood_id",
                label: "Neighbourhood",
                value: data.neighbourhood_id,
                onChange: (value) => {
                  setData("neighbourhood_id", value);
                  setData("sub_neighbourhood_id", "");
                },
                options: neighbourhoodOptions,
                createUrl: route("admin.api.neighbourhoods.store"),
                createPayload: { city: data.city },
                createTitle: "New neighbourhood name",
                placeholder: "Select a neighbourhood...",
                error: errors.neighbourhood_id,
                onCreated: (item) => setNeighbourhoodOptions(
                  (prev) => prev.some((n) => n.id === item.id) ? prev : [...prev, item].sort((a, b) => a.name.localeCompare(b.name))
                )
              }
            ) }),
            /* @__PURE__ */ jsx("div", { className: "sm:col-span-3", children: /* @__PURE__ */ jsx(
              QuickCreateSelect,
              {
                id: "sub_neighbourhood_id",
                label: "Sub-Neighbourhood",
                value: data.sub_neighbourhood_id,
                onChange: (value) => setData("sub_neighbourhood_id", value),
                options: filteredSubNeighbourhoods,
                getOptionLabel: (sub) => {
                  const parentName = sub.neighbourhood_name ?? sub.neighbourhood?.name;
                  return !data.neighbourhood_id && parentName ? `${sub.name} (${parentName})` : sub.name;
                },
                createUrl: route("admin.api.sub-neighbourhoods.store"),
                createPayload: { neighbourhood_id: data.neighbourhood_id || null },
                createTitle: "New sub-neighbourhood name",
                placeholder: "Select a sub-neighbourhood...",
                error: errors.sub_neighbourhood_id,
                onCreated: (item) => setSubNeighbourhoodOptions(
                  (prev) => prev.some((s) => s.id === item.id) ? prev : [...prev, item].sort((a, b) => a.name.localeCompare(b.name))
                )
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { className: "sm:col-span-3", children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "maintenance_fee_range", value: "Maintenance Fee Range" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "maintenance_fee_range",
                  type: "text",
                  className: "mt-1 block w-full",
                  value: data.maintenance_fee_range,
                  onChange: (e) => setData("maintenance_fee_range", e.target.value),
                  placeholder: "e.g., $0.65 - $0.85 per sq ft"
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.maintenance_fee_range, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "sm:col-span-3", children: [
              /* @__PURE__ */ jsx(InputLabel, { value: "Price Range" }),
              /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-md px-3 py-2", children: "Auto-filled from live MLS listings after saving — no manual entry needed." })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2", children: /* @__PURE__ */ jsxs("div", { className: "px-4 py-6 sm:p-8", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold leading-7 text-gray-900 mb-6", children: "Building Amenities" }),
          /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: selectedAmenities.length > 0 ? selectedAmenities.map((amenity) => /* @__PURE__ */ jsxs(
            "span",
            {
              className: "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800",
              children: [
                amenity.icon ? /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: amenity.icon,
                    alt: amenity.name,
                    className: "w-4 h-4 object-contain"
                  }
                ) : /* @__PURE__ */ jsx("span", { children: amenityIcons[amenity.name] || "✨" }),
                amenity.name,
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => toggleAmenity(amenity),
                    className: "ml-1 text-blue-600 hover:text-blue-800",
                    children: "×"
                  }
                )
              ]
            },
            amenity.id
          )) : /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm", children: "No amenities selected" }) }) }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => setShowAmenitySelector(!showAmenitySelector),
              className: "inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150",
              children: [
                showAmenitySelector ? "Hide" : "Select",
                " Amenities"
              ]
            }
          ),
          showAmenitySelector && /* @__PURE__ */ jsxs("div", { className: "mt-4 border rounded-lg p-4 bg-gray-50", children: [
            /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                placeholder: "Search amenities...",
                className: "w-full px-3 py-2 border border-gray-300 rounded-md",
                value: amenitySearch,
                onChange: (e) => setAmenitySearch(e.target.value)
              }
            ) }),
            amenities.length > 0 ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2", children: filteredAmenities.map((amenity) => {
              const isSelected = selectedAmenities.find((a) => a.id === amenity.id);
              return /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => toggleAmenity(amenity),
                  className: `flex items-center gap-2 p-2 rounded-lg text-sm transition-colors ${isSelected ? "bg-blue-100 text-blue-800 border-2 border-blue-300" : "bg-white hover:bg-gray-100 border border-gray-200"}`,
                  children: [
                    amenity.icon ? /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: amenity.icon,
                        alt: amenity.name,
                        className: "w-5 h-5 object-contain"
                      }
                    ) : /* @__PURE__ */ jsx("span", { className: "text-lg", children: amenityIcons[amenity.name] || "✨" }),
                    /* @__PURE__ */ jsx("span", { className: "text-left", children: amenity.name })
                  ]
                },
                amenity.id
              );
            }) }) : /* @__PURE__ */ jsx("div", { className: "space-y-4", children: Object.entries(amenityCategories).map(([category, items]) => /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h4", { className: "font-medium text-gray-700 mb-2", children: category }),
              /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2", children: items.map((item) => {
                const amenity = { id: item, name: item, icon: amenityIcons[item] };
                const isSelected = selectedAmenities.find((a) => a.name === item);
                return /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => toggleAmenity(amenity),
                    className: `flex items-center gap-2 p-2 rounded-lg text-sm transition-colors ${isSelected ? "bg-blue-100 text-blue-800 border-2 border-blue-300" : "bg-white hover:bg-gray-100 border border-gray-200"}`,
                    children: [
                      /* @__PURE__ */ jsx("span", { className: "text-lg", children: amenityIcons[item] }),
                      /* @__PURE__ */ jsx("span", { className: "text-left", children: item })
                    ]
                  },
                  item
                );
              }) })
            ] }, category)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-8 border-t pt-6", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold leading-6 text-gray-900 mb-4", children: "Amenities Included in Maintenance Fees" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Select amenities that are covered by the maintenance fees" }),
            /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: selectedMaintenanceFeeAmenities.length > 0 ? selectedMaintenanceFeeAmenities.map((amenity) => {
              return /* @__PURE__ */ jsxs(
                "span",
                {
                  className: "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-green-100 text-green-800",
                  children: [
                    /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: amenity.icon || "/assets/svgs/amenity-default.svg",
                        alt: amenity.name,
                        className: "w-4 h-4 object-contain"
                      }
                    ),
                    amenity.name,
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => toggleMaintenanceFeeAmenity(amenity),
                        className: "ml-1 text-green-600 hover:text-green-800",
                        children: "×"
                      }
                    )
                  ]
                },
                amenity.id
              );
            }) : /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm", children: "No maintenance fee amenities selected" }) }) }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => setShowMaintenanceAmenitySelector(!showMaintenanceAmenitySelector),
                className: "inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150",
                children: [
                  showMaintenanceAmenitySelector ? "Hide" : "Select",
                  " Maintenance Amenities"
                ]
              }
            ),
            showMaintenanceAmenitySelector && /* @__PURE__ */ jsx("div", { className: "mt-4 border rounded-lg p-4 bg-gray-50", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2", children: maintenanceFeeAmenities.map((amenity) => {
              const isIncluded = selectedMaintenanceFeeAmenities.some((a) => a.id === amenity.id);
              return /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => toggleMaintenanceFeeAmenity(amenity),
                  className: `flex items-center gap-2 p-2 rounded-lg text-sm transition-colors ${isIncluded ? "bg-green-100 text-green-800 border-2 border-green-300" : "bg-white hover:bg-gray-100 border border-gray-200"}`,
                  children: [
                    /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: amenity.icon || "/assets/svgs/amenity-default.svg",
                        alt: amenity.name,
                        className: "w-5 h-5 object-contain"
                      }
                    ),
                    /* @__PURE__ */ jsx("span", { className: "text-left", children: amenity.name })
                  ]
                },
                amenity.id
              );
            }) }) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2", children: /* @__PURE__ */ jsxs("div", { className: "px-4 py-6 sm:p-8", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold leading-7 text-gray-900 mb-6", children: "Media & Links" }),
          /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-gray-700 mb-4", children: "Main Building Image" }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-x-6 gap-y-4", children: /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "mt-1 space-y-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxs("label", { className: "relative cursor-pointer bg-indigo-600 rounded-md font-medium text-white hover:bg-indigo-700 px-4 py-2 inline-flex items-center", children: [
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "file",
                        className: "sr-only",
                        accept: "image/*",
                        onChange: (e) => handleImageUpload(e, "main"),
                        disabled: uploadingImage
                      }
                    ),
                    /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" }) }),
                    uploadingImage ? "Uploading..." : "Select Main Image"
                  ] }),
                  imagePreview && /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: handleRemoveMainImage,
                      className: "bg-red-600 hover:bg-red-700 text-white rounded-md px-4 py-2 text-sm",
                      children: "Remove Main Image"
                    }
                  )
                ] }),
                !imagePreview && /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Select the main image for the building (JPG, PNG, GIF, max 5MB)" })
              ] }),
              /* @__PURE__ */ jsx(InputError, { message: errors.main_image, className: "mt-2" }),
              imagePreview && /* @__PURE__ */ jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsx(
                "img",
                {
                  src: imagePreview,
                  alt: "Main building image",
                  className: "w-full h-64 object-cover rounded-lg border border-gray-200",
                  onError: (e) => {
                    e.target.src = "https://via.placeholder.com/400x300?text=Invalid+Image";
                  }
                }
              ) })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mb-8 border-t pt-6", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-gray-700 mb-4", children: "Gallery Images" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxs("label", { className: "relative cursor-pointer bg-green-600 rounded-md font-medium text-white hover:bg-green-700 px-4 py-2 inline-flex items-center", children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "file",
                      className: "sr-only",
                      accept: "image/*",
                      multiple: true,
                      onChange: (e) => handleImageUpload(e, "gallery"),
                      disabled: uploadingGalleryImage
                    }
                  ),
                  /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 4v16m8-8H4" }) }),
                  uploadingGalleryImage ? "Uploading..." : "Add Gallery Images (Multiple)"
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "text-sm text-gray-500", children: [
                  galleryImages.length,
                  " image",
                  galleryImages.length !== 1 ? "s" : "",
                  " in gallery"
                ] })
              ] }),
              galleryImages.length > 0 && /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4", children: galleryImages.map((image, index) => /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
                /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: image,
                    alt: `Gallery image ${index + 1}`,
                    className: "w-full h-32 object-cover rounded-lg border border-gray-200",
                    onError: (e) => {
                      e.target.src = "https://via.placeholder.com/200x150?text=Invalid+Image";
                    }
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => handleRemoveGalleryImage(image),
                    className: "absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity",
                    title: "Remove image",
                    children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
                  }
                )
              ] }, index)) }),
              galleryImages.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 italic", children: "No gallery images uploaded yet" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "border-t pt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "sm:col-span-3", children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "website_url", value: "Website URL" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "website_url",
                  type: "url",
                  className: "mt-1 block w-full",
                  value: data.website_url,
                  onChange: (e) => setData("website_url", e.target.value),
                  placeholder: "https://example.com"
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.website_url, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "sm:col-span-3", children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "virtual_tour_url", value: "Virtual Tour URL" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "virtual_tour_url",
                  type: "url",
                  className: "mt-1 block w-full",
                  value: data.virtual_tour_url,
                  onChange: (e) => setData("virtual_tour_url", e.target.value),
                  placeholder: "https://example.com/tour"
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.virtual_tour_url, className: "mt-2" })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2", children: /* @__PURE__ */ jsxs("div", { className: "px-4 py-6 sm:p-8", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold leading-7 text-gray-900 mb-6", children: "Status & Settings" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "sm:col-span-3", children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "status", value: "Status" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  id: "status",
                  className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500",
                  value: data.status,
                  onChange: (e) => setData("status", e.target.value),
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "active", children: "Active" }),
                    /* @__PURE__ */ jsx("option", { value: "inactive", children: "Inactive" }),
                    /* @__PURE__ */ jsx("option", { value: "pending", children: "Pending" })
                  ]
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.status, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "sm:col-span-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center mt-6", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  id: "is_featured",
                  type: "checkbox",
                  className: "h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600",
                  checked: data.is_featured,
                  onChange: (e) => setData("is_featured", e.target.checked)
                }
              ),
              /* @__PURE__ */ jsx("label", { htmlFor: "is_featured", className: "ml-2 block text-sm text-gray-900", children: "Featured Building" })
            ] }) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-x-6", children: [
          /* @__PURE__ */ jsx(Link, { href: route("admin.buildings.index"), children: /* @__PURE__ */ jsx(SecondaryButton, { type: "button", children: "Cancel" }) }),
          /* @__PURE__ */ jsx(PrimaryButton, { type: "submit", disabled: processing, children: processing ? "Creating..." : "Create Building" })
        ] })
      ] })
    ] })
  ] });
}
export {
  BuildingsCreate as default
};
