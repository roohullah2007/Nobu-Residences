import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import { c as createBuildingUrl } from "./slug-BdTdDGUL.js";
function MerchandiseLofts({ propertyData }) {
  const [buildingData, setBuildingData] = useState(null);
  const [mlsCounts, setMlsCounts] = useState({ for_sale: 0, for_rent: 0 });
  const [loading, setLoading] = useState(true);
  const extractAddress = () => {
    if (!propertyData) return null;
    const streetNumber = propertyData.StreetNumber || propertyData.streetNumber || "";
    const streetName = propertyData.StreetName || propertyData.streetName || "";
    if (streetNumber && streetName) {
      return { streetNumber, streetName };
    }
    const fullAddress = propertyData.address || propertyData.StreetAddress || "";
    if (fullAddress) {
      const match = fullAddress.match(/^(\d+)(?:-\d+)?\s+(.+?)(?:\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Court|Ct|Place|Pl|Lane|Ln|Way))?/i);
      if (match) {
        return {
          streetNumber: match[1],
          streetName: match[2]
        };
      }
    }
    return null;
  };
  useEffect(() => {
    const fetchBuildingData = async () => {
      const address = extractAddress();
      if (!address || !address.streetNumber || !address.streetName) {
        setLoading(false);
        return;
      }
      try {
        const buildingResponse = await fetch(`/api/buildings/find-by-address?street_number=${address.streetNumber}&street_name=${encodeURIComponent(address.streetName)}`);
        if (!buildingResponse.ok) {
          console.warn(`Building API returned ${buildingResponse.status}: ${buildingResponse.statusText}`);
          setLoading(false);
          return;
        }
        const buildingResult = await buildingResponse.json();
        let fetchedBuildingData = null;
        if (buildingResult.success && buildingResult.data) {
          fetchedBuildingData = buildingResult.data;
          setBuildingData(fetchedBuildingData);
        }
        const timestamp = (/* @__PURE__ */ new Date()).getTime();
        let totalForSale = 0;
        let totalForRent = 0;
        if (fetchedBuildingData && (fetchedBuildingData.street_address_1 || fetchedBuildingData.street_address_2 || Array.isArray(fetchedBuildingData.additional_addresses) && fetchedBuildingData.additional_addresses.length)) {
          const addresses = [];
          const seen = /* @__PURE__ */ new Set();
          const ADDR_RE = /^(\d+)\s+(.+?)(?:\s+(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive|Ct|Court|Pl|Place|Ln|Lane|Way))?(?:\s*,.*)?$/i;
          const pushParsed = (raw) => {
            if (!raw) return;
            const m = String(raw).match(ADDR_RE);
            if (!m) return;
            const num = m[1];
            const name = m[2].trim();
            const key = `${num}|${name.toLowerCase()}`;
            if (seen.has(key)) return;
            seen.add(key);
            addresses.push({ streetNumber: num, streetName: name });
          };
          pushParsed(fetchedBuildingData.street_address_1);
          pushParsed(fetchedBuildingData.street_address_2);
          if (Array.isArray(fetchedBuildingData.additional_addresses)) {
            fetchedBuildingData.additional_addresses.forEach(pushParsed);
          }
          if (addresses.length === 0) {
            addresses.push({ streetNumber: address.streetNumber, streetName: address.streetName });
          }
          const countPromises = addresses.map(async (addr) => {
            const countUrl = `/api/buildings/count-mls-listings?street_number=${addr.streetNumber}&street_name=${encodeURIComponent(addr.streetName)}&_t=${timestamp}`;
            try {
              const response = await fetch(countUrl);
              if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                  return result.data;
                }
              }
            } catch (err) {
              console.error(`Error fetching counts for ${addr.streetNumber} ${addr.streetName}:`, err);
            }
            return { for_sale: 0, for_rent: 0 };
          });
          const results = await Promise.all(countPromises);
          results.forEach((result) => {
            totalForSale += result.for_sale || 0;
            totalForRent += result.for_rent || 0;
          });
          setMlsCounts({
            for_sale: totalForSale,
            for_rent: totalForRent,
            total: totalForSale + totalForRent
          });
        } else {
          const countUrl = `/api/buildings/count-mls-listings?street_number=${address.streetNumber}&street_name=${encodeURIComponent(address.streetName)}&_t=${timestamp}`;
          const mlsResponse = await fetch(countUrl);
          if (!mlsResponse.ok) {
            console.warn(`MLS count API returned ${mlsResponse.status}: ${mlsResponse.statusText}`);
            setLoading(false);
            return;
          }
          const mlsResult = await mlsResponse.json();
          if (mlsResult.success) {
            setMlsCounts(mlsResult.data);
          }
        }
      } catch (error) {
        console.error("Error fetching building data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBuildingData();
  }, [propertyData]);
  if (!loading && !buildingData) {
    return null;
  }
  if (loading) {
    return /* @__PURE__ */ jsx("section", { children: /* @__PURE__ */ jsx("div", { className: "mx-auto md:h-[268px] max-w-[1280px]", children: /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg md:rounded-xl border shadow-md overflow-hidden h-full animate-pulse", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row h-full", children: [
      /* @__PURE__ */ jsx("div", { className: "md:w-[330px] bg-gray-200" }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 p-6", children: [
        /* @__PURE__ */ jsx("div", { className: "h-8 bg-gray-200 rounded mb-2" }),
        /* @__PURE__ */ jsx("div", { className: "h-4 bg-gray-200 rounded w-1/2 mb-2" }),
        /* @__PURE__ */ jsx("div", { className: "h-16 bg-gray-200 rounded mb-6" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
          /* @__PURE__ */ jsx("div", { className: "flex-1 h-12 bg-gray-200 rounded-full" }),
          /* @__PURE__ */ jsx("div", { className: "flex-1 h-12 bg-gray-200 rounded-full" })
        ] })
      ] })
    ] }) }) }) });
  }
  const buildingName = buildingData?.name || "The Building";
  const buildingAddress = buildingData?.address || extractAddress()?.streetNumber + " " + extractAddress()?.streetName;
  let buildingImage = null;
  if (buildingData?.main_image) {
    buildingImage = buildingData.main_image;
  } else if (buildingData?.images && Array.isArray(buildingData.images) && buildingData.images.length > 0) {
    buildingImage = buildingData.images[0];
  }
  const buildingId = buildingData?.id;
  const buildingStreetAddresses = [
    buildingData?.street_address_1,
    buildingData?.street_address_2,
    ...Array.isArray(buildingData?.additional_addresses) ? buildingData.additional_addresses : []
  ].filter(Boolean).join(",");
  return /* @__PURE__ */ jsx("section", { children: /* @__PURE__ */ jsx("div", { className: "mx-auto md:h-[268px] max-w-[1280px]", children: /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg md:rounded-xl border shadow-md overflow-hidden h-full", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row h-full", children: [
    /* @__PURE__ */ jsx("div", { className: "md:w-[330px]", children: buildingImage ? /* @__PURE__ */ jsx(
      "img",
      {
        src: buildingImage,
        alt: buildingName,
        className: "w-full h-48 md:h-full object-cover",
        onError: (e) => {
          console.error("Building image failed to load:", buildingImage);
          e.target.style.display = "none";
        },
        onLoad: () => {
          console.log("Building image loaded successfully:", buildingImage);
        }
      }
    ) : /* @__PURE__ */ jsx("div", { className: "w-full h-48 md:h-full bg-gray-200 flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: "No image available" }) }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 p-6 flex flex-col justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        buildingId ? /* @__PURE__ */ jsx(
          Link,
          {
            href: createBuildingUrl(buildingName),
            className: "text-xl md:text-2xl font-bold mb-2 font-space-grotesk hover:underline cursor-pointer transition-all duration-200 block",
            style: { color: "#293056" },
            children: buildingName
          }
        ) : /* @__PURE__ */ jsx("h2", { className: "text-xl md:text-2xl font-bold mb-2 font-space-grotesk", style: { color: "#293056" }, children: buildingName }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 mb-2 text-sm md:text-base", children: buildingAddress }),
        /* @__PURE__ */ jsxs("p", { className: "text-gray-700 mb-6 text-sm md:text-base", children: [
          "Browse all condo apartments at ",
          buildingName,
          " — ",
          mlsCounts.for_sale || 0,
          " condo apartments for sale and ",
          mlsCounts.for_rent || 0,
          " for rent at ",
          buildingAddress,
          "."
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-col sm:flex-row gap-3 md:gap-4", children: buildingId ? (() => {
        const baseQuery = new URLSearchParams({ building_id: buildingId });
        if (buildingStreetAddresses) {
          baseQuery.set("street_addresses", buildingStreetAddresses);
        }
        const rentHref = `/search?${baseQuery.toString()}&status=${encodeURIComponent("For Rent")}`;
        const saleHref = `/search?${baseQuery.toString()}&status=${encodeURIComponent("For Sale")}`;
        return /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs(
            Link,
            {
              href: rentHref,
              className: "flex-1 px-4 md:px-6 py-2.5 md:py-3 border-2 border-orange-400 rounded-full text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors duration-200 font-medium text-sm md:text-base text-center",
              children: [
                mlsCounts.for_rent || 0,
                " Condos for Rent"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            Link,
            {
              href: saleHref,
              className: "flex-1 px-4 md:px-6 py-2.5 md:py-3 border-2 border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium text-sm md:text-base text-center",
              children: [
                mlsCounts.for_sale || 0,
                " Condos for Sale"
              ]
            }
          )
        ] });
      })() : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: `/search?status=${encodeURIComponent("For Rent")}`,
            className: "flex-1 px-4 md:px-6 py-2.5 md:py-3 border-2 border-orange-400 rounded-full text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors duration-200 font-medium text-sm md:text-base text-center",
            children: [
              mlsCounts.for_rent || 0,
              " Condos for Rent"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: `/search?status=${encodeURIComponent("For Sale")}`,
            className: "flex-1 px-4 md:px-6 py-2.5 md:py-3 border-2 border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium text-sm md:text-base text-center",
            children: [
              mlsCounts.for_sale || 0,
              " Condos for Sale"
            ]
          }
        )
      ] }) })
    ] })
  ] }) }) }) });
}
export {
  MerchandiseLofts as default
};
