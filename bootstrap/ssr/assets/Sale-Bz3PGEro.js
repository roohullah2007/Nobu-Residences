import { jsx } from "react/jsx-runtime";
import "react";
import EnhancedPropertySearch from "./Search-Bz7qfHLs.js";
import "@inertiajs/react";
import "./MainLayout-D9byyRJC.js";
import "./Footer-CZ46SECc.js";
import "./ContactAgentModal-Bc8CTpfm.js";
import "./imageUrl-B-Y_O6wE.js";
import "./Navbar-CZkePEXz.js";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import "./LoginModal-BIklH_00.js";
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
import "./IDXAmpreSearchBar-B4xccJ8m.js";
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
