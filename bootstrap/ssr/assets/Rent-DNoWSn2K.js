import { jsx } from "react/jsx-runtime";
import "react";
import EnhancedPropertySearch from "./Search-dzCMudAI.js";
import "@inertiajs/react";
import "./MainLayout-CuFObsz2.js";
import "./Footer-BjazYOa4.js";
import "./ContactAgentModal-Bc8CTpfm.js";
import "./Navbar-Cpn1c-fk.js";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import "./LoginModal-C-0W-anf.js";
import "./GoogleLoginButton-wrwag0eM.js";
import "./PropertyDetailIcons-3huqvWqW.js";
import "@headlessui/react";
import "./propertyUrl-B4IVbEgn.js";
import "./slug-BdTdDGUL.js";
import "./PropertyCardV5-CX7Swo2f.js";
import "./propertyFormatters-B0QibXFa.js";
import "./LazyPropertyCard-O4wYsNOG.js";
import "./ViewportAwarePropertyMap-C_QmAwuf.js";
import "./SimplePropertyMap-CcNI_Icw.js";
import "./GoogleMapContainer-1QRikaEJ.js";
import "./MapPropertyCard-JetgmWMH.js";
import "react-dom/client";
import "lodash";
import "./ClusteredPropertyMap-BpL1V82V.js";
import "./IDXAmpreSearchBar-jwPm_q4-.js";
import "./FiltersModal-DSeD_PdT.js";
function Rent(props) {
  const rentProps = {
    ...props,
    filters: {
      ...props.filters,
      transaction_type: "rent",
      status: "For Rent"
    },
    defaultTab: "rent"
  };
  return /* @__PURE__ */ jsx(EnhancedPropertySearch, { ...rentProps });
}
export {
  Rent as default
};
