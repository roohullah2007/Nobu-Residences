import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { usePage, router } from "@inertiajs/react";
function ContactAgentModal({ isOpen, onClose, agentData, propertyData, auth, websiteSettings }) {
  const { globalWebsite, website } = usePage().props;
  const currentWebsite = website || globalWebsite;
  const brandColors = currentWebsite?.brand_colors || {};
  const buttonTertiaryBg = brandColors.button_tertiary_bg || "#000000";
  const buttonTertiaryText = brandColors.button_tertiary_text || "#FFFFFF";
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
  const agentInfo = websiteSettings?.website?.agent_info;
  const contactInfo = websiteSettings?.website?.contact_info;
  agentData?.phone || agentInfo?.agent_phone || contactInfo?.phone || "";
  agentData?.email || contactInfo?.email || "";
  agentData?.name || agentInfo?.agent_name || "";
  agentData?.title || agentInfo?.agent_title || "";
  agentData?.brokerage || agentInfo?.brokerage || "";
  agentData?.image || agentInfo?.profile_image || "";
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
        agent_id: agentData?.id,
        agent_name: agentData?.name,
        property_listing_key: propertyData?.ListingKey || propertyData?.listingKey || propertyData?.id,
        property_address: propertyData?.UnparsedAddress || propertyData?.address,
        building_name: propertyData?.BuildingName || propertyData?.buildingName || "Building"
      }, {
        preserveState: true,
        preserveScroll: true,
        onSuccess: () => {
          setSubmitStatus("success");
          setIsSubmitting(false);
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
        },
        onFinish: () => {
          setIsSubmitting(false);
        }
      });
    } catch (error) {
      console.error("Error submitting enquiry:", error);
      setErrors({ general: "An error occurred. Please try again." });
      setIsSubmitting(false);
    }
  };
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[999999] bg-black bg-opacity-50 flex items-center justify-center p-4", onClick: onClose, children: /* @__PURE__ */ jsxs("div", { className: "relative bg-white p-6 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-xl font-bold", style: { color: "rgb(41, 48, 86)" }, children: [
        "Contact Agent about ",
        propertyData?.BuildingName || propertyData?.buildingName || propertyData?.address || "Property"
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onClose,
          className: "text-gray-500 bg-transparent border-none text-2xl font-bold cursor-pointer absolute top-4 right-6 w-8 h-8 rounded flex items-center justify-center p-0 leading-none transition-colors hover:text-gray-800 hover:bg-gray-100 focus:outline-2 focus:outline-blue-500 focus:outline-offset-2",
          "aria-label": "Close",
          children: "×"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mb-4 space-y-2", children: /* @__PURE__ */ jsxs("p", { className: "text-gray-600 text-sm", children: [
      "Building: ",
      /* @__PURE__ */ jsx("span", { className: "font-medium", children: propertyData?.address || propertyData?.BuildingName || "Property" })
    ] }) }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "name", className: "block text-gray-700 mb-1 font-medium", children: "Full Name" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            id: "name",
            name: "name",
            value: formData.name,
            onChange: handleChange,
            className: "w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
            required: true
          }
        ),
        errors.name && /* @__PURE__ */ jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.name })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "block text-gray-700 mb-1 font-medium", children: "Email Address" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "email",
            id: "email",
            name: "email",
            value: formData.email,
            onChange: handleChange,
            className: "w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
            required: true
          }
        ),
        errors.email && /* @__PURE__ */ jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.email })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "phone", className: "block text-gray-700 mb-1 font-medium", children: "Phone Number" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "tel",
            id: "phone",
            name: "phone",
            value: formData.phone,
            onChange: handleChange,
            className: "w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
            required: true
          }
        ),
        errors.phone && /* @__PURE__ */ jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.phone })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "question", className: "block text-gray-700 mb-1 font-medium", children: "Message (Optional)" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            id: "question",
            name: "question",
            value: formData.question,
            onChange: handleChange,
            className: "w-full py-2 px-3 border border-gray-300 rounded-lg text-sm resize-y min-h-[80px] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
            placeholder: "Any specific questions about the building..."
          }
        ),
        errors.question && /* @__PURE__ */ jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.question })
      ] }),
      submitStatus === "success" && /* @__PURE__ */ jsx("div", { className: "mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm", children: "Your message has been sent successfully!" }),
      errors.general && /* @__PURE__ */ jsx("div", { className: "mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm", children: errors.general }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: isSubmitting,
          className: "w-full py-3 px-4 rounded-lg font-medium border-none cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed",
          style: { backgroundColor: buttonTertiaryBg, color: buttonTertiaryText },
          children: isSubmitting ? "Submitting..." : "Submit"
        }
      )
    ] })
  ] }) });
}
export {
  ContactAgentModal as default
};
