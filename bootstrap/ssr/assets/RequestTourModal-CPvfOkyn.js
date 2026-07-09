import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { P as PhoneInput } from "./PhoneInput-BOSF9o14.js";
const RequestTourModal = ({ isOpen, onClose, property, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    preferredDate: "",
    preferredTime: "",
    message: "",
    tourType: "in-person"
    // 'in-person' or 'virtual'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const { globalWebsite, website } = usePage().props;
  const currentWebsite = website || globalWebsite;
  const brandColors = currentWebsite?.brand_colors || {};
  const buttonTertiaryBg = brandColors.button_tertiary_bg || "#000000";
  const buttonTertiaryText = brandColors.button_tertiary_text || "#FFFFFF";
  const buttonSecondaryBg = brandColors.button_secondary_bg || "#912018";
  brandColors.button_secondary_text || "#FFFFFF";
  const buttonQuaternaryBg = brandColors.button_quaternary_bg || "#FFFFFF";
  const buttonQuaternaryText = brandColors.button_quaternary_text || "#293056";
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);
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
      const response = await fetch("/api/request-tour", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content")
        },
        body: JSON.stringify({
          ...formData,
          propertyId: property?.id || property?.listingKey,
          propertyAddress: property?.address
        })
      });
      if (response.ok) {
        setFormData({
          name: "",
          email: "",
          phone: "",
          preferredDate: "",
          preferredTime: "",
          message: "",
          tourType: "in-person"
        });
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
          if (onSuccess) {
            onSuccess();
          }
        }, 2500);
      } else {
        setSubmitError("Failed to submit tour request. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting tour request:", error);
      setSubmitError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!isOpen) return null;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 bg-black bg-opacity-50 z-[9998]",
        onClick: onClose
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "fixed inset-0 flex items-center justify-center z-[9999] p-4 overflow-hidden", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-xl w-full max-w-md max-h-[85vh] flex flex-col", children: [
      /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 border-b border-gray-200 flex-shrink-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Request a Tour" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: onClose,
              className: "text-gray-400 hover:text-gray-600 transition-colors",
              children: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
            }
          )
        ] }),
        property && /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600", children: property.address })
      ] }),
      showSuccess ? /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col items-center justify-center px-6 py-12", children: [
        /* @__PURE__ */ jsx("div", { className: "w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx("svg", { className: "w-8 h-8 text-green-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) }) }),
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-gray-900 mb-2", children: "Tour Request Submitted!" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-center", children: "We'll contact you soon to confirm your tour." })
      ] }) : /* @__PURE__ */ jsx("form", { id: "tour-request-form", onSubmit: handleSubmit, className: "flex-1 overflow-y-auto px-6 py-4", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Tour Type" }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
            /* @__PURE__ */ jsxs("label", { className: "flex items-center", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "radio",
                  name: "tourType",
                  value: "in-person",
                  checked: formData.tourType === "in-person",
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
                  name: "tourType",
                  value: "virtual",
                  checked: formData.tourType === "virtual",
                  onChange: handleInputChange,
                  className: "mr-2"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Virtual" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
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
              className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent",
              style: { "--tw-ring-color": buttonSecondaryBg },
              placeholder: "John Doe"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700 mb-1", children: "Email *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "email",
              id: "email",
              name: "email",
              value: formData.email,
              onChange: handleInputChange,
              required: true,
              className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent",
              style: { "--tw-ring-color": buttonSecondaryBg },
              placeholder: "john@example.com"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "phone", className: "block text-sm font-medium text-gray-700 mb-1", children: "Phone Number *" }),
          /* @__PURE__ */ jsx(
            PhoneInput,
            {
              id: "phone",
              name: "phone",
              value: formData.phone,
              onChange: handleInputChange,
              required: true,
              className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent",
              style: { "--tw-ring-color": buttonSecondaryBg },
              placeholder: "(555) 123-4567"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "preferredDate", className: "block text-sm font-medium text-gray-700 mb-1", children: "Preferred Date" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "date",
              id: "preferredDate",
              name: "preferredDate",
              value: formData.preferredDate,
              onChange: handleInputChange,
              min: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
              className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent",
              style: { "--tw-ring-color": buttonSecondaryBg }
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "preferredTime", className: "block text-sm font-medium text-gray-700 mb-1", children: "Preferred Time" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "preferredTime",
              name: "preferredTime",
              value: formData.preferredTime,
              onChange: handleInputChange,
              className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent",
              style: { "--tw-ring-color": buttonSecondaryBg },
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Select a time" }),
                /* @__PURE__ */ jsx("option", { value: "morning", children: "Morning (9 AM - 12 PM)" }),
                /* @__PURE__ */ jsx("option", { value: "afternoon", children: "Afternoon (12 PM - 5 PM)" }),
                /* @__PURE__ */ jsx("option", { value: "evening", children: "Evening (5 PM - 8 PM)" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "message", className: "block text-sm font-medium text-gray-700 mb-1", children: "Additional Message" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              id: "message",
              name: "message",
              value: formData.message,
              onChange: handleInputChange,
              rows: 3,
              className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent",
              style: { "--tw-ring-color": buttonSecondaryBg },
              placeholder: "Any specific questions or requirements?"
            }
          )
        ] })
      ] }) }),
      !showSuccess && submitError && /* @__PURE__ */ jsx("p", { className: "px-6 pb-2 text-red-600 text-sm", role: "alert", children: submitError }),
      !showSuccess && /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 border-t border-gray-200 flex gap-3 flex-shrink-0", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: onClose,
            className: "flex-1 px-4 py-2 border rounded-lg hover:opacity-80 transition-all",
            style: { backgroundColor: buttonQuaternaryBg, color: buttonQuaternaryText, borderColor: buttonQuaternaryText },
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            form: "tour-request-form",
            disabled: isSubmitting,
            className: "flex-1 px-4 py-2 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed",
            style: { backgroundColor: buttonTertiaryBg, color: buttonTertiaryText },
            children: isSubmitting ? "Submitting..." : "Request Tour"
          }
        )
      ] })
    ] }) })
  ] });
};
export {
  RequestTourModal as default
};
