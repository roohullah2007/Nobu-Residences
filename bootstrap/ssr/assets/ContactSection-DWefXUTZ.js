import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import axios from "axios";
function ContactSection({ website, pageContent, building = {} }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
    interests: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const contactInfo = website?.contact_info || {};
  const agentInfo = website?.agent_info || {};
  const clean = (v) => {
    if (v === null || v === void 0) return "";
    const s = String(v).trim();
    return s === "-" ? "" : s;
  };
  const buildingName = clean(building.name) || "Nobu Residences";
  const phone = clean(agentInfo.agent_phone) || clean(contactInfo.phone) || clean(building.agent_phone);
  const email = clean(contactInfo.email) || clean(building.agent_email);
  const address = clean(contactInfo.address) || clean(building.address);
  const hours = clean(contactInfo.hours) || "Mon–Sat: 9AM–8PM · Sun: 10AM–5PM";
  const INTERESTS = ["Buying", "Renting", "Selling", "Investing", "Short-Term Rental", "General Info"];
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };
  const toggleInterest = (interest) => {
    setFormData((prev) => {
      const current = [...prev.interests];
      const idx = current.indexOf(interest);
      if (idx > -1) current.splice(idx, 1);
      else current.push(interest);
      return { ...prev, interests: current };
    });
    if (formErrors.interests) setFormErrors((prev) => ({ ...prev, interests: "" }));
  };
  const validateForm = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email is invalid";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) errors.phone = "Phone number is invalid";
    if (formData.interests.length === 0) errors.interests = "Please select at least one option";
    return errors;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const CATEGORY_MAP = {
        "Buying": "buyer",
        "Renting": "renter",
        "Selling": "seller",
        "Investing": "buyer",
        "Short-Term Rental": "renter",
        "General Info": "other"
      };
      const categories = [...new Set(formData.interests.map((i) => CATEGORY_MAP[i] || "other"))].slice(0, 2);
      const interestsLine = formData.interests.length ? `Interested in: ${formData.interests.join(", ")}.` : "";
      const message = [formData.message?.trim(), interestsLine].filter(Boolean).join("\n\n") || `Contact form submission from ${buildingName} home page`;
      const response = await axios.post("/contact", {
        name: fullName,
        email: formData.email,
        phone: formData.phone,
        inquiry_categories: categories,
        message
      });
      if (response.data.success) {
        setSubmitSuccess(true);
        setFormData({ firstName: "", lastName: "", email: "", phone: "", message: "", interests: [] });
        setFormErrors({});
        setTimeout(() => setSubmitSuccess(false), 5e3);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitError(error.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const fieldClass = (field) => `w-full px-4 py-3.5 bg-neutral-50 border text-[14px] text-neutral-700 placeholder:text-neutral-300 rounded-lg focus:outline-none focus:bg-white transition-colors ${formErrors[field] ? "border-red-400" : "border-neutral-200 focus:border-gold-400"}`;
  const ico = { strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", fill: "none", stroke: "currentColor", width: 18, height: 18, viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", "aria-hidden": true };
  const infoItems = [
    phone && { label: "Phone", value: phone, href: `tel:${String(phone).replace(/[^+\d]/g, "")}`, icon: /* @__PURE__ */ jsx("svg", { ...ico, children: /* @__PURE__ */ jsx("path", { d: "M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" }) }) },
    email && { label: "Email", value: email, href: `mailto:${email}`, icon: /* @__PURE__ */ jsxs("svg", { ...ico, children: [
      /* @__PURE__ */ jsx("path", { d: "m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" }),
      /* @__PURE__ */ jsx("rect", { x: "2", y: "4", width: "20", height: "16", rx: "2" })
    ] }) },
    address && { label: "Address", value: address, icon: /* @__PURE__ */ jsxs("svg", { ...ico, children: [
      /* @__PURE__ */ jsx("path", { d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" }),
      /* @__PURE__ */ jsx("circle", { cx: "12", cy: "10", r: "3" })
    ] }) },
    { label: "Availability", value: hours, icon: /* @__PURE__ */ jsxs("svg", { ...ico, children: [
      /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
      /* @__PURE__ */ jsx("path", { d: "M12 6v6l4 2" })
    ] }) }
  ].filter(Boolean);
  return /* @__PURE__ */ jsx("section", { id: "contact", className: "bg-neutral-50 py-20 md:py-28", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-screen-xl px-4 md:px-0", children: /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-5 gap-12", children: [
    /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2", children: [
      /* @__PURE__ */ jsx("p", { className: "text-gold-500 text-[11px] tracking-[0.3em] uppercase mb-3", children: "Get in Touch" }),
      /* @__PURE__ */ jsx("h2", { className: "font-playfair text-3xl md:text-4xl text-neutral-900 mb-4", children: "Schedule a Viewing" }),
      /* @__PURE__ */ jsxs("p", { className: "text-neutral-500 text-[15px] leading-relaxed mb-8", children: [
        "Interested in buying, selling, or renting at ",
        buildingName,
        "? Contact us for a private viewing or market analysis of any unit in the building."
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-5", children: infoItems.map((item) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-gold-50 rounded-lg flex items-center justify-center flex-shrink-0 text-gold-600", children: item.icon }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "block text-[13px] text-neutral-400 mb-0.5", children: item.label }),
          item.href ? /* @__PURE__ */ jsx("a", { href: item.href, className: "text-[15px] text-neutral-800 font-medium hover:text-gold-600 transition-colors", children: item.value }) : /* @__PURE__ */ jsx("span", { className: "text-[15px] text-neutral-800 font-medium", children: item.value })
        ] })
      ] }, item.label)) }),
      /* @__PURE__ */ jsxs("div", { className: "mt-8 p-5 bg-neutral-900 rounded-xl", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
          /* @__PURE__ */ jsx("svg", { ...ico, className: "text-gold-400", children: /* @__PURE__ */ jsx("path", { d: "M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z" }) }),
          /* @__PURE__ */ jsx("span", { className: "text-white text-[14px] font-medium", children: "AI Concierge Available" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-white/50 text-[13px] leading-relaxed", children: "Use our AI-powered chat assistant (bottom right) for instant answers about available units, pricing, amenities, and more." })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "lg:col-span-3", children: /* @__PURE__ */ jsx("div", { className: "bg-white rounded-xl shadow-sm border border-neutral-200 p-6 md:p-8", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-5", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-[12px] tracking-[0.1em] uppercase text-neutral-400 mb-2", children: "First Name" }),
          /* @__PURE__ */ jsx("input", { type: "text", name: "firstName", value: formData.firstName, onChange: handleInputChange, placeholder: "John", className: fieldClass("firstName") }),
          formErrors.firstName && /* @__PURE__ */ jsx("span", { className: "mt-1 block text-xs text-red-500", children: formErrors.firstName })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-[12px] tracking-[0.1em] uppercase text-neutral-400 mb-2", children: "Last Name" }),
          /* @__PURE__ */ jsx("input", { type: "text", name: "lastName", value: formData.lastName, onChange: handleInputChange, placeholder: "Smith", className: fieldClass("lastName") })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-[12px] tracking-[0.1em] uppercase text-neutral-400 mb-2", children: "Email" }),
        /* @__PURE__ */ jsx("input", { type: "email", name: "email", value: formData.email, onChange: handleInputChange, placeholder: "john@example.com", className: fieldClass("email") }),
        formErrors.email && /* @__PURE__ */ jsx("span", { className: "mt-1 block text-xs text-red-500", children: formErrors.email })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-[12px] tracking-[0.1em] uppercase text-neutral-400 mb-2", children: "Phone" }),
        /* @__PURE__ */ jsx("input", { type: "tel", name: "phone", value: formData.phone, onChange: handleInputChange, placeholder: "(416) 555-0123", className: fieldClass("phone") }),
        formErrors.phone && /* @__PURE__ */ jsx("span", { className: "mt-1 block text-xs text-red-500", children: formErrors.phone })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-[12px] tracking-[0.1em] uppercase text-neutral-400 mb-2", children: "I'm Interested In" }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-2", children: INTERESTS.map((interest) => /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg cursor-pointer hover:border-gold-300 transition-colors", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              className: "accent-gold-500",
              checked: formData.interests.includes(interest),
              onChange: () => toggleInterest(interest)
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-[13px] text-neutral-600", children: interest })
        ] }, interest)) }),
        formErrors.interests && /* @__PURE__ */ jsx("span", { className: "mt-1 block text-xs text-red-500", children: formErrors.interests })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-[12px] tracking-[0.1em] uppercase text-neutral-400 mb-2", children: "Message" }),
        /* @__PURE__ */ jsx("textarea", { name: "message", rows: "4", value: formData.message, onChange: handleInputChange, placeholder: "Tell us about your requirements...", className: `${fieldClass("message")} resize-none` })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: isSubmitting,
          className: `w-full py-4 bg-neutral-900 hover:bg-gold-600 text-white text-[13px] tracking-[0.15em] uppercase font-medium rounded-lg transition-colors ${isSubmitting ? "opacity-50" : ""}`,
          children: isSubmitting ? "Sending…" : "Send Inquiry"
        }
      ),
      submitSuccess && /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-green-200 bg-green-50 p-3 text-center text-sm font-medium text-green-800", children: "Thank you! We will be in touch soon." }),
      submitError && /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm font-medium text-red-700", children: submitError }),
      /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-neutral-400 text-center", children: [
        "By submitting, you agree to receive communications about ",
        buildingName,
        ". We respect your privacy."
      ] })
    ] }) }) })
  ] }) }) });
}
export {
  ContactSection as default
};
