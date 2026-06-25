import { jsx } from "react/jsx-runtime";
import "react";
import EnhancedPropertySearch from "./Search-CAYcq88j.js";
import "@inertiajs/react";
import "./MainLayout-DZ-6ZPt1.js";
import "./Footer-BjazYOa4.js";
import "./ContactAgentModal-Bc8CTpfm.js";
import "./Navbar-DVqP4Fqr.js";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import "./LoginModal-C-0W-anf.js";
import "./GoogleLoginButton-wrwag0eM.js";
import "./PropertyDetailIcons-3huqvWqW.js";
import "@headlessui/react";
import "./propertyUrl-B4IVbEgn.js";
import "./slug-BdTdDGUL.js";
import "./PropertyCardV5-CEcGAClp.js";
import "./propertyFormatters-B0QibXFa.js";
import "./LazyPropertyCard-DZZuEl7H.js";
import "./ViewportAwarePropertyMap-C_QmAwuf.js";
import "./SimplePropertyMap-CcNI_Icw.js";
import "./GoogleMapContainer-1QRikaEJ.js";
import "./MapPropertyCard-JetgmWMH.js";
import "react-dom/client";
import "lodash";
import "./ClusteredPropertyMap-BpL1V82V.js";
import "./IDXAmpreSearchBar-BpkgyaSB.js";
import "./FiltersModal-U8-T5uIZ.js";
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
