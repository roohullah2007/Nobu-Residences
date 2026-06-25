import { jsx, jsxs } from "react/jsx-runtime";
import React from "react";
class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorCount: 0 };
  }
  static getDerivedStateFromError(error) {
    if (error?.message?.includes("removeChild") || error?.message?.includes("insertBefore") || error?.message?.includes("Node") || error?.message?.includes("DOM")) {
      return null;
    }
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    if (error?.message?.includes("removeChild") || error?.message?.includes("insertBefore") || error?.message?.includes("Node") || error?.message?.includes("DOM")) {
      return;
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.state.hasError && prevProps.children !== this.props.children) {
      this.setState({ hasError: false });
    }
  }
  render() {
    if (this.state.hasError) {
      return /* @__PURE__ */ jsx("div", { className: "w-full h-full bg-gray-100 rounded-lg border flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center p-8", children: [
        /* @__PURE__ */ jsx("div", { className: "text-gray-500 mb-2", children: /* @__PURE__ */ jsx("svg", { className: "w-12 h-12 mx-auto", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx(
          "path",
          {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          }
        ) }) }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-1", children: "Map temporarily unavailable" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: "Please refresh the page" })
      ] }) });
    }
    return this.props.children;
  }
}
export {
  MapErrorBoundary as default
};
