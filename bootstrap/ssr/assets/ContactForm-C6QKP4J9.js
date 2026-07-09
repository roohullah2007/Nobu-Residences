import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { P as PhoneInput } from "./PhoneInput-BOSF9o14.js";
const SCHEDULE_MEETING_EVENT = "contact:schedule-meeting";
function ContactForm({ website }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    inquiry_type: "general"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const nameInputRef = useRef(null);
  useEffect(() => {
    const handleScheduleMeeting = () => {
      setSubmitStatus(null);
      setFormData((prev) => ({ ...prev, subject: "Schedule a Meeting" }));
      setTimeout(() => nameInputRef.current?.focus({ preventScroll: true }), 400);
    };
    window.addEventListener(SCHEDULE_MEETING_EVENT, handleScheduleMeeting);
    return () => window.removeEventListener(SCHEDULE_MEETING_EVENT, handleScheduleMeeting);
  }, []);
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setSubmitStatus("success");
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          inquiry_type: "general"
        });
      } else {
        setErrorMessage(result.message || "Something went wrong. Please try again.");
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Contact form submission error:", error);
      setErrorMessage("Failed to submit form. Please check your connection and try again.");
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };
  const brandColors = website?.brand_colors || {
    primary: "#912018",
    secondary: "#1d957d"
  };
  const buttonSecondaryBg = brandColors.button_secondary_bg || brandColors.secondary;
  const buttonSecondaryText = brandColors.button_secondary_text || "#FFFFFF";
  if (submitStatus === "success") {
    return /* @__PURE__ */ jsx("div", { id: "contact-form", className: "bg-white rounded-2xl shadow-lg p-8", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6", children: /* @__PURE__ */ jsx("svg", { className: "w-8 h-8 text-green-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M5 13l4 4L19 7" }) }) }),
      /* @__PURE__ */ jsx("h3", { className: "font-space-grotesk font-bold text-xl mb-4", style: { color: brandColors.primary }, children: "Message Sent Successfully!" }),
      /* @__PURE__ */ jsx("p", { className: "font-work-sans text-gray-600 mb-6", children: "Thank you for contacting us. We'll get back to you within 24 hours." }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setSubmitStatus(null),
          className: "px-6 py-3 rounded-full font-work-sans font-medium hover:opacity-90 transition-colors",
          style: { backgroundColor: buttonSecondaryBg, color: buttonSecondaryText },
          children: "Send Another Message"
        }
      )
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { id: "contact-form", className: "bg-white rounded-2xl shadow-lg p-8", children: [
    /* @__PURE__ */ jsx("h2", { className: "font-space-grotesk font-bold text-2xl mb-6", style: { color: brandColors.primary }, children: "Send us a Message" }),
    submitStatus === "error" && errorMessage && /* @__PURE__ */ jsx("div", { className: "mb-6 p-4 bg-red-50 border border-red-200 rounded-lg", children: /* @__PURE__ */ jsx("p", { className: "font-work-sans text-red-600 text-sm", children: errorMessage }) }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block font-work-sans font-medium text-gray-700 mb-2", children: "What can we help you with?" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            name: "inquiry_type",
            value: formData.inquiry_type,
            onChange: handleChange,
            className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-transparent transition-colors",
            style: { "--tw-ring-color": brandColors.primary },
            required: true,
            children: [
              /* @__PURE__ */ jsx("option", { value: "general", children: "General Inquiry" }),
              /* @__PURE__ */ jsx("option", { value: "viewing", children: "Property Viewing" }),
              /* @__PURE__ */ jsx("option", { value: "rental", children: "Rental Information" }),
              /* @__PURE__ */ jsx("option", { value: "purchase", children: "Purchase Information" }),
              /* @__PURE__ */ jsx("option", { value: "support", children: "Technical Support" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block font-work-sans font-medium text-gray-700 mb-2", children: "Full Name *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              ref: nameInputRef,
              type: "text",
              name: "name",
              value: formData.name,
              onChange: handleChange,
              className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-transparent transition-colors",
              style: { "--tw-ring-color": brandColors.primary },
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block font-work-sans font-medium text-gray-700 mb-2", children: "Email Address *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "email",
              name: "email",
              value: formData.email,
              onChange: handleChange,
              className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-transparent transition-colors",
              style: { "--tw-ring-color": brandColors.primary },
              required: true
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block font-work-sans font-medium text-gray-700 mb-2", children: "Phone Number" }),
          /* @__PURE__ */ jsx(
            PhoneInput,
            {
              name: "phone",
              value: formData.phone,
              onChange: handleChange,
              className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-transparent transition-colors",
              style: { "--tw-ring-color": brandColors.primary }
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block font-work-sans font-medium text-gray-700 mb-2", children: "Subject *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              name: "subject",
              value: formData.subject,
              onChange: handleChange,
              className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-transparent transition-colors",
              style: { "--tw-ring-color": brandColors.primary },
              required: true
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block font-work-sans font-medium text-gray-700 mb-2", children: "Message *" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            name: "message",
            value: formData.message,
            onChange: handleChange,
            rows: 6,
            className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-transparent transition-colors resize-none",
            style: { "--tw-ring-color": brandColors.primary },
            placeholder: "Please provide details about your inquiry...",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: isSubmitting,
          className: "w-full py-4 rounded-full font-work-sans font-bold text-lg transition-all duration-300 disabled:opacity-70 hover:opacity-90",
          style: { backgroundColor: buttonSecondaryBg, color: buttonSecondaryText },
          children: isSubmitting ? /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center", children: [
            /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" }),
            "Sending Message..."
          ] }) : "Send Message"
        }
      )
    ] })
  ] });
}
export {
  SCHEDULE_MEETING_EVENT,
  ContactForm as default
};
