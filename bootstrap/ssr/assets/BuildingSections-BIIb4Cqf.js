import { jsxs, jsx } from "react/jsx-runtime";
import "react";
import "@inertiajs/react";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import FAQ from "./FAQ-DwtK7V0z.js";
import MoreBuildings from "./MoreBuildings-DDajRlOM.js";
import BuildingStatusTabs from "./BuildingStatusTabs-D5QGwG0n.js";
import DeveloperBuildings from "./DeveloperBuildings-B3qXa4B5.js";
import "./PropertyCardV5-CX7Swo2f.js";
import "./propertyUrl-B4IVbEgn.js";
import "./slug-BdTdDGUL.js";
import "./propertyFormatters-B0QibXFa.js";
import "./NearbySchools-B1yt2xDw.js";
import "./Amenities-D8UjScBp.js";
import "./MortgageCalculator-Oo7_FBQb.js";
function BuildingSections({
  buildingData,
  sampleSaleProperties,
  sampleRentProperties,
  auth,
  onLoginClick,
  onSignupClick
}) {
  console.log("[BuildingSections] ========= DEBUG v2 =========");
  console.log("[BuildingSections] buildingData:", buildingData);
  console.log("[BuildingSections] buildingData keys:", buildingData ? Object.keys(buildingData) : "NULL");
  console.log("[BuildingSections] mls_properties_for_sale:", buildingData?.mls_properties_for_sale);
  console.log("[BuildingSections] mls_properties_for_sale length:", buildingData?.mls_properties_for_sale?.length);
  console.log("[BuildingSections] mls_properties_for_rent:", buildingData?.mls_properties_for_rent);
  console.log("[BuildingSections] mls_properties_for_rent length:", buildingData?.mls_properties_for_rent?.length);
  console.log("[BuildingSections] =============================");
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen font-work-sans overflow-x-hidden flex flex-col gap-y-4", children: [
    /* @__PURE__ */ jsx(BuildingStatusTabs, { building: buildingData }),
    /* @__PURE__ */ jsx("div", { id: "properties-for-sale", children: /* @__PURE__ */ jsx(
      MoreBuildings,
      {
        title: "Properties For Sale",
        propertyType: "Condo Apartment",
        transactionType: "For Sale",
        buildingData,
        onLoginRequired: onLoginClick,
        onSignupRequired: onSignupClick
      }
    ) }),
    /* @__PURE__ */ jsx("div", { id: "properties-for-rent", children: /* @__PURE__ */ jsx(
      MoreBuildings,
      {
        title: "Properties For Rent",
        propertyType: "Condo Apartment",
        transactionType: "For Rent",
        buildingData,
        onLoginRequired: onLoginClick,
        onSignupRequired: onSignupClick
      }
    ) }),
    (buildingData?.developer_id || buildingData?.developer_name) && /* @__PURE__ */ jsx(DeveloperBuildings, { buildingData }),
    /* @__PURE__ */ jsx("div", { className: "faq-section", children: /* @__PURE__ */ jsx(FAQ, {}) })
  ] });
}
export {
  BuildingSections as default
};
