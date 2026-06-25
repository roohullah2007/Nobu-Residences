import { jsx, jsxs } from "react/jsx-runtime";
import "react";
function PolicyContent({ website, siteName }) {
  const companyName = siteName || "Nobu Residences";
  const contactEmail = website?.contact_email || "info@noburesidence.com";
  const contactPhone = website?.phone || "(555) 123-4567";
  const address = website?.address || "123 Real Estate Ave, City, State 12345";
  return /* @__PURE__ */ jsx("div", { className: "prose prose-lg max-w-none", children: /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { className: "font-space-grotesk font-bold text-2xl text-[#293056] mb-4", children: "Introduction" }),
      /* @__PURE__ */ jsxs("p", { className: "font-work-sans text-gray-700 leading-relaxed", children: [
        "This Privacy Policy describes how ",
        companyName,
        ' ("we," "our," or "us") collects, uses, and shares your personal information when you visit or make a purchase from our website or use our real estate services.'
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { className: "font-space-grotesk font-bold text-2xl text-[#293056] mb-4", children: "Information We Collect" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-space-grotesk font-semibold text-xl text-[#293056] mb-2", children: "Personal Information" }),
          /* @__PURE__ */ jsx("p", { className: "font-work-sans text-gray-700 leading-relaxed", children: "When you interact with our services, we may collect personal information such as:" }),
          /* @__PURE__ */ jsxs("ul", { className: "font-work-sans text-gray-700 leading-relaxed ml-6 mt-2 space-y-1", children: [
            /* @__PURE__ */ jsx("li", { children: "• Name and contact information (email, phone number, mailing address)" }),
            /* @__PURE__ */ jsx("li", { children: "• Property preferences and search criteria" }),
            /* @__PURE__ */ jsx("li", { children: "• Financial information (for pre-qualification purposes)" }),
            /* @__PURE__ */ jsx("li", { children: "• Communication records and preferences" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-space-grotesk font-semibold text-xl text-[#293056] mb-2", children: "Automatically Collected Information" }),
          /* @__PURE__ */ jsx("p", { className: "font-work-sans text-gray-700 leading-relaxed", children: "We automatically collect certain information about your device and how you interact with our website, including:" }),
          /* @__PURE__ */ jsxs("ul", { className: "font-work-sans text-gray-700 leading-relaxed ml-6 mt-2 space-y-1", children: [
            /* @__PURE__ */ jsx("li", { children: "• IP address and browser information" }),
            /* @__PURE__ */ jsx("li", { children: "• Website usage patterns and preferences" }),
            /* @__PURE__ */ jsx("li", { children: "• Property viewing history and saved searches" }),
            /* @__PURE__ */ jsx("li", { children: "• Cookies and similar tracking technologies" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { className: "font-space-grotesk font-bold text-2xl text-[#293056] mb-4", children: "How We Use Your Information" }),
      /* @__PURE__ */ jsx("p", { className: "font-work-sans text-gray-700 leading-relaxed mb-3", children: "We use the information we collect to:" }),
      /* @__PURE__ */ jsxs("ul", { className: "font-work-sans text-gray-700 leading-relaxed ml-6 space-y-1", children: [
        /* @__PURE__ */ jsx("li", { children: "• Provide and improve our real estate services" }),
        /* @__PURE__ */ jsx("li", { children: "• Match you with suitable properties and opportunities" }),
        /* @__PURE__ */ jsx("li", { children: "• Communicate with you about properties, market updates, and our services" }),
        /* @__PURE__ */ jsx("li", { children: "• Process transactions and maintain records" }),
        /* @__PURE__ */ jsx("li", { children: "• Comply with legal obligations and protect our rights" }),
        /* @__PURE__ */ jsx("li", { children: "• Analyze website usage to improve user experience" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { className: "font-space-grotesk font-bold text-2xl text-[#293056] mb-4", children: "Information Sharing" }),
      /* @__PURE__ */ jsx("p", { className: "font-work-sans text-gray-700 leading-relaxed mb-3", children: "We may share your personal information in the following circumstances:" }),
      /* @__PURE__ */ jsxs("ul", { className: "font-work-sans text-gray-700 leading-relaxed ml-6 space-y-1", children: [
        /* @__PURE__ */ jsx("li", { children: "• With your consent or at your direction" }),
        /* @__PURE__ */ jsx("li", { children: "• With real estate professionals, lenders, and service providers" }),
        /* @__PURE__ */ jsx("li", { children: "• With MLS (Multiple Listing Service) systems when appropriate" }),
        /* @__PURE__ */ jsx("li", { children: "• To comply with legal requirements or protect our rights" }),
        /* @__PURE__ */ jsx("li", { children: "• In connection with business transfers or acquisitions" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { className: "font-space-grotesk font-bold text-2xl text-[#293056] mb-4", children: "Data Security" }),
      /* @__PURE__ */ jsx("p", { className: "font-work-sans text-gray-700 leading-relaxed", children: "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is completely secure, and we cannot guarantee absolute security." })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { className: "font-space-grotesk font-bold text-2xl text-[#293056] mb-4", children: "Your Rights" }),
      /* @__PURE__ */ jsx("p", { className: "font-work-sans text-gray-700 leading-relaxed mb-3", children: "Depending on your location, you may have certain rights regarding your personal information, including:" }),
      /* @__PURE__ */ jsxs("ul", { className: "font-work-sans text-gray-700 leading-relaxed ml-6 space-y-1", children: [
        /* @__PURE__ */ jsx("li", { children: "• The right to access and receive a copy of your personal information" }),
        /* @__PURE__ */ jsx("li", { children: "• The right to update or correct inaccurate information" }),
        /* @__PURE__ */ jsx("li", { children: "• The right to delete your personal information" }),
        /* @__PURE__ */ jsx("li", { children: "• The right to restrict or object to processing" }),
        /* @__PURE__ */ jsx("li", { children: "• The right to data portability" }),
        /* @__PURE__ */ jsx("li", { children: "• The right to withdraw consent" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { className: "font-space-grotesk font-bold text-2xl text-[#293056] mb-4", children: "Cookies and Tracking" }),
      /* @__PURE__ */ jsx("p", { className: "font-work-sans text-gray-700 leading-relaxed", children: "We use cookies and similar technologies to enhance your browsing experience, remember your preferences, and analyze website traffic. You can control cookie settings through your browser, but disabling cookies may limit some website functionality." })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { className: "font-space-grotesk font-bold text-2xl text-[#293056] mb-4", children: "Third-Party Services" }),
      /* @__PURE__ */ jsx("p", { className: "font-work-sans text-gray-700 leading-relaxed", children: "Our website may contain links to third-party websites or integrate with third-party services (such as MLS systems, mapping services, or social media platforms). This Privacy Policy does not apply to those third-party services, and we encourage you to review their privacy policies." })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { className: "font-space-grotesk font-bold text-2xl text-[#293056] mb-4", children: "Children's Privacy" }),
      /* @__PURE__ */ jsx("p", { className: "font-work-sans text-gray-700 leading-relaxed", children: "Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us." })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { className: "font-space-grotesk font-bold text-2xl text-[#293056] mb-4", children: "Changes to This Privacy Policy" }),
      /* @__PURE__ */ jsx("p", { className: "font-work-sans text-gray-700 leading-relaxed", children: 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Your continued use of our services after such changes constitutes acceptance of the updated policy.' })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { className: "font-space-grotesk font-bold text-2xl text-[#293056] mb-4", children: "Contact Us" }),
      /* @__PURE__ */ jsx("p", { className: "font-work-sans text-gray-700 leading-relaxed mb-3", children: "If you have any questions about this Privacy Policy or our privacy practices, please contact us:" }),
      /* @__PURE__ */ jsxs("div", { className: "font-work-sans text-gray-700 leading-relaxed space-y-1", children: [
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Email:" }),
          " ",
          contactEmail
        ] }),
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Phone:" }),
          " ",
          contactPhone
        ] }),
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Address:" }),
          " ",
          address
        ] })
      ] })
    ] })
  ] }) });
}
export {
  PolicyContent as default
};
