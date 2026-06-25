import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { usePage } from "@inertiajs/react";
import { Calendar, Phone, Close } from "./PropertyDetailIcons-3huqvWqW.js";
function MobileBottomBar() {
  const { globalWebsite, website } = usePage().props;
  const currentWebsite = website || globalWebsite;
  const brandColors = currentWebsite?.brand_colors || {};
  const buttonTertiaryBg = brandColors.button_tertiary_bg || "#000000";
  const buttonTertiaryText = brandColors.button_tertiary_text || "#FFFFFF";
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Viewing request submitted:", formData);
    setShowRequestModal(false);
    setFormData({ name: "", email: "", phone: "", message: "" });
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setShowRequestModal(true),
          className: "flex-1 py-3 px-4 rounded-full font-work-sans font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90",
          style: { backgroundColor: buttonTertiaryBg, color: buttonTertiaryText },
          children: [
            /* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4" }),
            "Request a viewing"
          ]
        }
      ),
      /* @__PURE__ */ jsx("button", { className: "flex-none bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-full font-work-sans font-bold text-sm hover:bg-gray-50 transition-colors", children: /* @__PURE__ */ jsx(Phone, { className: "w-4 h-4" }) })
    ] }) }),
    showRequestModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto mx-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-6 border-b", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-gray-900", children: "Request a Viewing" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setShowRequestModal(false),
            className: "text-gray-400 hover:text-gray-600 transition-colors",
            "aria-label": "Close",
            children: /* @__PURE__ */ jsx(Close, { className: "w-5 h-5" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-gray-700 mb-6", children: [
          "Schedule a viewing for ",
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-gray-900", children: "Property" })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-gray-700 mb-1", children: "Full Name" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                id: "name",
                name: "name",
                value: formData.name,
                onChange: handleInputChange,
                required: true,
                className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700 mb-1", children: "Email Address" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "email",
                id: "email",
                name: "email",
                value: formData.email,
                onChange: handleInputChange,
                required: true,
                className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "phone", className: "block text-sm font-medium text-gray-700 mb-1", children: "Phone Number" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "tel",
                id: "phone",
                name: "phone",
                value: formData.phone,
                onChange: handleInputChange,
                required: true,
                className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "message", className: "block text-sm font-medium text-gray-700 mb-1", children: "Additional Notes (Optional)" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                id: "message",
                name: "message",
                value: formData.message,
                onChange: handleInputChange,
                rows: 3,
                placeholder: "Any specific requirements or questions...",
                className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              className: "w-full py-3 px-4 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-opacity hover:opacity-90",
              style: { backgroundColor: buttonTertiaryBg, color: buttonTertiaryText },
              children: "Request Viewing"
            }
          )
        ] })
      ] })
    ] }) })
  ] });
}
export {
  MobileBottomBar as default
};
