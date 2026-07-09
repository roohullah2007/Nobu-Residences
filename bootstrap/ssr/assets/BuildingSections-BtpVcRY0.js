import { jsxs, jsx } from "react/jsx-runtime";
import "react";
import "@inertiajs/react";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import FAQ from "./FAQ-zFddXG5C.js";
import MoreBuildings from "./MoreBuildings-KSxUuvhG.js";
import BuildingStatusTabs from "./BuildingStatusTabs-BdvQiMFQ.js";
import DeveloperBuildings from "./DeveloperBuildings-fLtmuRmt.js";
import "./PropertyCardV5-BLJPzawm.js";
import "./propertyUrl-B4IVbEgn.js";
import "./slug-BdTdDGUL.js";
import "./propertyFormatters-B0QibXFa.js";
import "./NearbySchools-B1yt2xDw.js";
import "./Amenities-D8UjScBp.js";
import "./MortgageCalculator-Cp8HgKSN.js";
function BuildingSections({
  buildingData,
  sampleSaleProperties,
  sampleRentProperties,
  auth,
  onLoginClick,
  onSignupClick,
  faqs = []
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
    /* @__PURE__ */ jsx("div", { className: "faq-section", children: /* @__PURE__ */ jsx(FAQ, { faqItems: faqs }) })
  ] });
}
export {
  BuildingSections as default
};
