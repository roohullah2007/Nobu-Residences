import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { usePage, router } from "@inertiajs/react";
function EnhancedContactAgentModal({ isOpen, onClose, agentData, propertyData, auth, websiteSettings }) {
  const { globalWebsite, website } = usePage().props;
  const brandColors = globalWebsite?.brand_colors || website?.brand_colors || {};
  const buttonPrimaryBg = brandColors.button_primary_bg || "#293056";
  const buttonPrimaryText = brandColors.button_primary_text || "#FFFFFF";
  const [contactMethod, setContactMethod] = useState("form");
  const [formData, setFormData] = useState({
    name: auth?.user?.name || "",
    email: auth?.user?.email || "",
    phone: "",
    question: "",
    inquiry_type: "agent_contact"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const [emailCopied, setEmailCopied] = useState(false);
  const [phoneCopied, setPhoneCopied] = useState(false);
  const agentPhone = agentData?.phone || websiteSettings?.website?.contact_info?.agent?.phone || websiteSettings?.website?.contact_info?.phone || "+1 (647) 555-0123";
  const agentEmail = agentData?.email || websiteSettings?.website?.contact_info?.agent?.email || websiteSettings?.website?.contact_info?.email || "agent@noburesidence.com";
  const agentName = agentData?.name || websiteSettings?.website?.contact_info?.agent?.name || "Nobu Residence Agent";
  const agentBrokerage = agentData?.brokerage || websiteSettings?.website?.contact_info?.agent?.brokerage || "Nobu Residences";
  const agentImage = agentData?.image || websiteSettings?.website?.contact_info?.agent?.image || null;
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null
      });
    }
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.email.includes("@")) newErrors.email = "Please enter a valid email";
    if (!formData.phone) newErrors.phone = "Phone number is required";
    if (!formData.question) newErrors.question = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await router.post("/agent-enquiry", {
        ...formData,
        contact_method: "form",
        agent_id: agentData?.id,
        agent_name: agentData?.name,
        property_listing_key: propertyData?.ListingKey || propertyData?.listingKey || propertyData?.id,
        property_address: propertyData?.UnparsedAddress || propertyData?.address,
        building_name: propertyData?.BuildingName || propertyData?.buildingName || "Property"
      }, {
        preserveState: true,
        preserveScroll: true,
        onSuccess: () => {
          setSubmitStatus("success");
          setTimeout(() => {
            onClose();
            setSubmitStatus(null);
            setFormData({
              ...formData,
              question: ""
            });
          }, 2e3);
        },
        onError: (errors2) => {
          setErrors(errors2);
          setIsSubmitting(false);
        }
      });
    } catch (error) {
      console.error("Error submitting enquiry:", error);
      setErrors({ general: "An error occurred. Please try again." });
      setIsSubmitting(false);
    }
  };
  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === "email") {
        setEmailCopied(true);
        setTimeout(() => setEmailCopied(false), 2e3);
      } else if (type === "phone") {
        setPhoneCopied(true);
        setTimeout(() => setPhoneCopied(false), 2e3);
      }
    });
  };
  const handlePhoneCall = () => {
    window.location.href = `tel:${agentPhone}`;
  };
  const handleEmailClick = () => {
    const subject = encodeURIComponent(`Inquiry about ${propertyData?.UnparsedAddress || "Property"}`);
    const body = encodeURIComponent(`Hello ${agentName},

I am interested in learning more about ${propertyData?.UnparsedAddress || "this property"}.

Please contact me at your earliest convenience.

Thank you,
${formData.name || ""}`);
    window.location.href = `mailto:${agentEmail}?subject=${subject}&body=${body}`;
  };
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[999999] bg-black bg-opacity-50 flex items-center justify-center p-4", onClick: onClose, children: /* @__PURE__ */ jsxs("div", { className: "relative bg-white p-6 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold", style: { color: "rgb(41, 48, 86)" }, children: "Contact Agent" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onClose,
          className: "text-gray-500 bg-transparent border-none text-2xl font-bold cursor-pointer w-8 h-8 rounded flex items-center justify-center p-0 leading-none transition-colors hover:text-gray-800 hover:bg-gray-100",
          "aria-label": "Close",
          children: "×"
        }
      )
    ] }),
    submitStatus === "success" ? /* @__PURE__ */ jsxs("div", { className: "py-8 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx("svg", { className: "w-8 h-8 text-green-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M5 13l4 4L19 7" }) }) }),
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-xl text-[#293056] mb-2", children: "Message Sent Successfully!" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "Our agent will get back to you within 24 hours." })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "bg-gray-50 rounded-lg p-4 mb-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden", children: agentImage ? /* @__PURE__ */ jsx(
          "img",
          {
            src: agentImage,
            alt: agentName,
            className: "w-full h-full object-cover"
          }
        ) : /* @__PURE__ */ jsx("svg", { className: "w-8 h-8 text-gray-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" }) }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-lg text-[#293056]", children: agentName }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: "Licensed Real Estate Agent" }),
          agentBrokerage && /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: agentBrokerage })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mb-6 border-b", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setContactMethod("form"),
            className: `px-4 py-2 font-medium transition-colors ${contactMethod === "form" ? "border-b-2" : "text-gray-500 hover:text-gray-700"}`,
            style: contactMethod === "form" ? { color: buttonPrimaryBg, borderColor: buttonPrimaryBg } : {},
            children: [
              /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 inline mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" }) }),
              "Message"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setContactMethod("phone"),
            className: `px-4 py-2 font-medium transition-colors ${contactMethod === "phone" ? "border-b-2" : "text-gray-500 hover:text-gray-700"}`,
            style: contactMethod === "phone" ? { color: buttonPrimaryBg, borderColor: buttonPrimaryBg } : {},
            children: [
              /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 inline mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" }) }),
              "Phone"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setContactMethod("email"),
            className: `px-4 py-2 font-medium transition-colors ${contactMethod === "email" ? "border-b-2" : "text-gray-500 hover:text-gray-700"}`,
            style: contactMethod === "email" ? { color: buttonPrimaryBg, borderColor: buttonPrimaryBg } : {},
            children: [
              /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 inline mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" }) }),
              "Email"
            ]
          }
        )
      ] }),
      contactMethod === "form" && /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
        errors.general && /* @__PURE__ */ jsx("div", { className: "bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4", children: errors.general }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 mb-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "name", className: "block text-gray-700 mb-1 font-medium text-sm", children: "Full Name" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                id: "name",
                name: "name",
                value: formData.name,
                onChange: handleChange,
                className: `w-full py-2 px-3 border rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${errors.name ? "border-red-500" : "border-gray-300"}`,
                placeholder: "Your name",
                required: true
              }
            ),
            errors.name && /* @__PURE__ */ jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.name })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "phone", className: "block text-gray-700 mb-1 font-medium text-sm", children: "Phone Number" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "tel",
                id: "phone",
                name: "phone",
                value: formData.phone,
                onChange: handleChange,
                className: `w-full py-2 px-3 border rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${errors.phone ? "border-red-500" : "border-gray-300"}`,
                placeholder: "(555) 123-4567",
                required: true
              }
            ),
            errors.phone && /* @__PURE__ */ jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.phone })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "block text-gray-700 mb-1 font-medium text-sm", children: "Email Address" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "email",
              id: "email",
              name: "email",
              value: formData.email,
              onChange: handleChange,
              className: `w-full py-2 px-3 border rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${errors.email ? "border-red-500" : "border-gray-300"}`,
              placeholder: "your@email.com",
              required: true
            }
          ),
          errors.email && /* @__PURE__ */ jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.email })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "question", className: "block text-gray-700 mb-1 font-medium text-sm", children: "Your Message" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              id: "question",
              name: "question",
              value: formData.question,
              onChange: handleChange,
              className: `w-full py-2 px-3 border rounded-lg text-sm resize-y min-h-[100px] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${errors.question ? "border-red-500" : "border-gray-300"}`,
              placeholder: "I'm interested in learning more about this property...",
              required: true
            }
          ),
          errors.question && /* @__PURE__ */ jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.question })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: isSubmitting,
            className: "w-full py-3 px-4 rounded-lg font-medium cursor-pointer hover:opacity-90 disabled:opacity-70 transition-all",
            style: { backgroundColor: buttonPrimaryBg, color: buttonPrimaryText },
            children: isSubmitting ? /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center", children: [
              /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" }),
              "Sending Message..."
            ] }) : "Send Message"
          }
        )
      ] }),
      contactMethod === "phone" && /* @__PURE__ */ jsxs("div", { className: "text-center py-6", children: [
        /* @__PURE__ */ jsx("div", { className: "w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx("svg", { className: "w-10 h-10 text-blue-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" }) }) }),
        /* @__PURE__ */ jsx("h4", { className: "font-semibold text-lg mb-2", children: "Call Us Directly" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 mb-4", children: "Available Mon-Sat, 9AM-6PM EST" }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 rounded-lg p-4 mb-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-[#293056] mb-2", children: agentPhone }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2 justify-center", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: handlePhoneCall,
                className: "px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2",
                children: [
                  /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" }) }),
                  "Call Now"
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => copyToClipboard(agentPhone, "phone"),
                className: "px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors",
                children: phoneCopied ? "✓ Copied!" : "Copy Number"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Or send us a message and we'll call you back" })
      ] }),
      contactMethod === "email" && /* @__PURE__ */ jsxs("div", { className: "text-center py-6", children: [
        /* @__PURE__ */ jsx("div", { className: "w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx("svg", { className: "w-10 h-10 text-purple-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" }) }) }),
        /* @__PURE__ */ jsx("h4", { className: "font-semibold text-lg mb-2", children: "Email Us" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 mb-4", children: "We typically respond within 24 hours" }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 rounded-lg p-4 mb-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xl font-semibold text-[#293056] mb-3", children: agentEmail }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2 justify-center", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: handleEmailClick,
                className: "px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-all flex items-center gap-2",
                style: { backgroundColor: buttonPrimaryBg, color: buttonPrimaryText },
                children: [
                  /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" }) }),
                  "Compose Email"
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => copyToClipboard(agentEmail, "email"),
                className: "px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors",
                children: emailCopied ? "✓ Copied!" : "Copy Email"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "For immediate assistance, please call us" })
      ] }),
      propertyData && /* @__PURE__ */ jsx("div", { className: "mt-6 pt-4 border-t", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-600", children: [
        "Inquiring about: ",
        /* @__PURE__ */ jsx("span", { className: "font-medium", children: propertyData?.UnparsedAddress || propertyData?.address || "Property" })
      ] }) })
    ] })
  ] }) });
}
export {
  EnhancedContactAgentModal as default
};
