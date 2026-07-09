import { jsxs, jsx } from "react/jsx-runtime";
import { useContext, createContext, useState } from "react";
import "@inertiajs/react";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import ViewingRequestModal from "./ViewingRequestModal-Bf-aIhpu.js";
const ViewingRequestContext = createContext();
const useViewingRequest = () => {
  const context = useContext(ViewingRequestContext);
  if (!context) {
    throw new Error("useViewingRequest must be used within a ViewingRequestProvider");
  }
  return context;
};
const ViewingRequestProvider = ({ children }) => {
  const [viewingModal, setViewingModal] = useState({
    isOpen: false,
    property: null
  });
  const openViewingModal = (property) => {
    setViewingModal({
      isOpen: true,
      property
    });
  };
  const closeViewingModal = () => {
    setViewingModal({
      isOpen: false,
      property: null
    });
  };
  const contextValue = {
    openViewingModal,
    closeViewingModal,
    isOpen: viewingModal.isOpen,
    property: viewingModal.property
  };
  return /* @__PURE__ */ jsxs(ViewingRequestContext.Provider, { value: contextValue, children: [
    children,
    /* @__PURE__ */ jsx(
      ViewingRequestModal,
      {
        isOpen: viewingModal.isOpen,
        onClose: closeViewingModal,
        property: viewingModal.property
      }
    )
  ] });
};
export {
  ViewingRequestProvider,
  ViewingRequestProvider as default,
  useViewingRequest
};
