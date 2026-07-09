import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { usePage } from "@inertiajs/react";
const ViewingRequestModal = ({ isOpen, onClose, property }) => {
  const { globalWebsite, website } = usePage().props;
  const currentWebsite = website || globalWebsite;
  const brandColors = currentWebsite?.brand_colors || {};
  const buttonTertiaryBg = brandColors.button_tertiary_bg || "#000000";
  const buttonTertiaryText = brandColors.button_tertiary_text || "#FFFFFF";
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    preferredDate: "",
    preferredTime: "",
    viewingType: "in-person"
    // 'in-person' or 'virtual'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);
    try {
      console.log("Viewing request submitted:", {
        property,
        formData
      });
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: "",
          preferredDate: "",
          preferredTime: "",
          viewingType: "in-person"
        });
        onClose();
      }, 2e3);
    } catch (error) {
      console.error("Error submitting viewing request:", error);
      setSubmitError("There was an error submitting your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };
  if (!isOpen || !property) return null;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-[999999] flex items-center justify-center p-4", onClick: handleClose, children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-6 border-b", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-gray-900", children: "Request a Viewing" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleClose,
          disabled: isSubmitting,
          className: "text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50",
          "aria-label": "Close",
          children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 rounded-lg p-4 mb-6", children: [
        /* @__PURE__ */ jsx("h4", { className: "font-semibold text-gray-900 mb-1", children: property.propertyType }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-sm mb-2", children: property.address }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-gray-500", children: [
            property.bedrooms > 0 && `${property.bedrooms} beds`,
            property.bedrooms > 0 && property.bathrooms > 0 && " • ",
            property.bathrooms > 0 && `${property.bathrooms} baths`
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "font-semibold text-gray-900", children: [
            "MLS#: ",
            property.listingKey
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Viewing Type" }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
            /* @__PURE__ */ jsxs("label", { className: "flex items-center", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "radio",
                  name: "viewingType",
                  value: "in-person",
                  checked: formData.viewingType === "in-person",
                  onChange: handleInputChange,
                  className: "mr-2"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: "In-Person" })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "flex items-center", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "radio",
                  name: "viewingType",
                  value: "virtual",
                  checked: formData.viewingType === "virtual",
                  onChange: handleInputChange,
                  className: "mr-2"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Virtual Tour" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 mb-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-gray-700 mb-1", children: "Full Name *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                id: "name",
                name: "name",
                value: formData.name,
                onChange: handleInputChange,
                required: true,
                disabled: isSubmitting,
                className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#293056] focus:border-transparent disabled:opacity-50"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700 mb-1", children: "Email Address *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "email",
                id: "email",
                name: "email",
                value: formData.email,
                onChange: handleInputChange,
                required: true,
                disabled: isSubmitting,
                className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#293056] focus:border-transparent disabled:opacity-50"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "phone", className: "block text-sm font-medium text-gray-700 mb-1", children: "Phone Number *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "tel",
                id: "phone",
                name: "phone",
                value: formData.phone,
                onChange: handleInputChange,
                required: true,
                disabled: isSubmitting,
                className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#293056] focus:border-transparent disabled:opacity-50"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 mb-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "preferredDate", className: "block text-sm font-medium text-gray-700 mb-1", children: "Preferred Date" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "date",
                id: "preferredDate",
                name: "preferredDate",
                value: formData.preferredDate,
                onChange: handleInputChange,
                disabled: isSubmitting,
                min: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
                className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#293056] focus:border-transparent disabled:opacity-50"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "preferredTime", className: "block text-sm font-medium text-gray-700 mb-1", children: "Preferred Time" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                id: "preferredTime",
                name: "preferredTime",
                value: formData.preferredTime,
                onChange: handleInputChange,
                disabled: isSubmitting,
                className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#293056] focus:border-transparent disabled:opacity-50",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "Select time" }),
                  /* @__PURE__ */ jsx("option", { value: "9:00 AM", children: "9:00 AM" }),
                  /* @__PURE__ */ jsx("option", { value: "10:00 AM", children: "10:00 AM" }),
                  /* @__PURE__ */ jsx("option", { value: "11:00 AM", children: "11:00 AM" }),
                  /* @__PURE__ */ jsx("option", { value: "12:00 PM", children: "12:00 PM" }),
                  /* @__PURE__ */ jsx("option", { value: "1:00 PM", children: "1:00 PM" }),
                  /* @__PURE__ */ jsx("option", { value: "2:00 PM", children: "2:00 PM" }),
                  /* @__PURE__ */ jsx("option", { value: "3:00 PM", children: "3:00 PM" }),
                  /* @__PURE__ */ jsx("option", { value: "4:00 PM", children: "4:00 PM" }),
                  /* @__PURE__ */ jsx("option", { value: "5:00 PM", children: "5:00 PM" }),
                  /* @__PURE__ */ jsx("option", { value: "6:00 PM", children: "6:00 PM" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "message", className: "block text-sm font-medium text-gray-700 mb-1", children: "Additional Notes (Optional)" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              id: "message",
              name: "message",
              value: formData.message,
              onChange: handleInputChange,
              rows: 3,
              disabled: isSubmitting,
              placeholder: "Any specific requirements or questions...",
              className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#293056] focus:border-transparent resize-none disabled:opacity-50"
            }
          )
        ] }),
        submitError && /* @__PURE__ */ jsx("p", { className: "text-red-600 text-sm mb-3", role: "alert", children: submitError }),
        showSuccess && /* @__PURE__ */ jsx("p", { className: "text-green-700 text-sm mb-3 bg-green-50 border border-green-200 rounded-md p-2", role: "status", children: "Viewing request submitted successfully! We'll contact you soon." }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: isSubmitting || showSuccess,
            className: "w-full py-3 px-4 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed",
            style: { backgroundColor: buttonTertiaryBg, color: buttonTertiaryText },
            children: isSubmitting ? "Submitting..." : "Request Viewing"
          }
        )
      ] })
    ] })
  ] }) });
};
export {
  ViewingRequestModal as default
};
