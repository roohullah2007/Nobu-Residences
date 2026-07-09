import { jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import PropertyCarousel from "./PropertyCarousel-xQqZk_Vh.js";
import "@inertiajs/react";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import "./PhoneInput-BOSF9o14.js";
import axios from "axios";
import "./PropertyCard-BWgqbSLf.js";
const PropertiesForSale = ({ auth, forSaleProperties = null, carouselSettings, mlsSettings, schoolAddress = null }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const defaultBuildingAddress = mlsSettings?.default_building_address || "15 Mercer Street";
  const addressParts = defaultBuildingAddress.split(" ");
  const streetNumber = addressParts[0] || "15";
  const streetName = addressParts.slice(1).join(" ").replace(/\s+Street$/i, "") || "Mercer";
  const buildingSlug = `${streetNumber}-${streetName.replace(/\s+/g, "-")}`;
  useEffect(() => {
    if (!forSaleProperties) {
      fetchProperties();
    }
  }, [forSaleProperties, schoolAddress]);
  const fetchProperties = async () => {
    try {
      const params = { type: "sale" };
      if (schoolAddress) {
        const [streetAddress, ...cityParts] = schoolAddress.split(",");
        params.address = streetAddress.trim();
        params.city = cityParts.join(",").trim() || "Toronto";
      }
      const response = await axios.get("/api/homepage-properties", {
        params
      });
      if (response.data.success && response.data.data.forSale) {
        setProperties(response.data.data.forSale);
      }
    } catch (error) {
      console.error("Error fetching sale properties:", error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };
  const propertiesData = forSaleProperties || properties;
  if (!forSaleProperties && loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex justify-center items-center py-8", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" }) });
  }
  const isEnabled = carouselSettings?.enabled !== false;
  if (!isEnabled || propertiesData.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsx(
    PropertyCarousel,
    {
      properties: propertiesData,
      auth,
      title: carouselSettings?.title || "Properties For Sale",
      type: "sale",
      viewAllLink: `/${buildingSlug}/for-sale`
    }
  );
};
export {
  PropertiesForSale as default
};
