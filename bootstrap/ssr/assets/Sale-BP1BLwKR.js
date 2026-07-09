import { jsx } from "react/jsx-runtime";
import "react";
import EnhancedPropertySearch from "./Search-DYAGndD_.js";
import "@inertiajs/react";
import "./MainLayout-CodT0wEB.js";
import "./Footer-COZ0Sr-M.js";
import "./ContactAgentModal-BZyWhDPm.js";
import "./PhoneInput-BOSF9o14.js";
import "./imageUrl-B-Y_O6wE.js";
import "./Navbar-BcUYeBAy.js";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import "./LoginModal-CkvRiYR7.js";
import "./GoogleLoginButton-wrwag0eM.js";
import "./PropertyDetailIcons-3huqvWqW.js";
import "@headlessui/react";
import "./propertyUrl-B4IVbEgn.js";
import "./slug-BdTdDGUL.js";
import "./PropertyCardV5-CsET2ACf.js";
import "./propertyFormatters-B0QibXFa.js";
import "./FAQ-zFddXG5C.js";
import "./LazyPropertyCard-DAGraD_8.js";
import "./ViewportAwarePropertyMap-C_QmAwuf.js";
import "./SimplePropertyMap-CcNI_Icw.js";
import "./GoogleMapContainer-1QRikaEJ.js";
import "./MapPropertyCard-JetgmWMH.js";
import "react-dom/client";
import "lodash";
import "./ClusteredPropertyMap-BKplqq5L.js";
import "./IDXAmpreSearchBar-TJWE8Rsc.js";
import "./FiltersModal-DSeD_PdT.js";
import "./SaveSearchModal-BFxxLWhL.js";
function Sale(props) {
  const saleProps = {
    ...props,
    filters: {
      ...props.filters,
      transaction_type: "sale",
      status: "For Sale"
    },
    defaultTab: "sale"
  };
  return /* @__PURE__ */ jsx(EnhancedPropertySearch, { ...saleProps });
}
export {
  Sale as default
};
