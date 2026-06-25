import { jsx, jsxs } from "react/jsx-runtime";
import "react";
function TermsContent({ website, siteName }) {
  const companyName = siteName || "Nobu Residences";
  const contactEmail = website?.contact_info?.email || "info@noburesidences.com";
  const contactPhone = website?.contact_info?.phone || "(555) 123-4567";
  const address = website?.contact_info?.address || "123 Real Estate Ave, City, State 12345";
  return /* @__PURE__ */ jsx("div", { className: "prose prose-lg max-w-none", children: /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { className: "font-space-grotesk font-bold text-2xl text-[#293056] mb-4", children: "Agreement to Terms" }),
      /* @__PURE__ */ jsxs("p", { className: "font-work-sans text-gray-700 leading-relaxed", children: [
        'These Terms of Service ("Terms") govern your use of ',
        companyName,
        "'s website and real estate services. By accessing or using our services, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our services."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { className: "font-space-grotesk font-bold text-2xl text-[#293056] mb-4", children: "Acceptance of Terms" }),
      /* @__PURE__ */ jsx("p", { className: "font-work-sans text-gray-700 leading-relaxed", children: "By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. Additionally, when using this website's particular services, you shall be subject to any posted guidelines or rules applicable to such services." })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { className: "font-space-grotesk font-bold text-2xl text-[#293056] mb-4", children: "Use License" }),
      /* @__PURE__ */ jsxs("p", { className: "font-work-sans text-gray-700 leading-relaxed mb-3", children: [
        "Permission is granted to temporarily download one copy of the materials on ",
        companyName,
        "'s website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:"
      ] }),
      /* @__PURE__ */ jsxs("ul", { className: "font-work-sans text-gray-700 leading-relaxed ml-6 space-y-1", children: [
        /* @__PURE__ */ jsx("li", { children: "• modify or copy the materials" }),
        /* @__PURE__ */ jsx("li", { children: "• use the materials for any commercial purpose or for any public display (commercial or non-commercial)" }),
        /* @__PURE__ */ jsx("li", { children: "• attempt to decompile or reverse engineer any software contained on the website" }),
        /* @__PURE__ */ jsx("li", { children: "• remove any copyright or other proprietary notations from the materials" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "font-work-sans text-gray-700 leading-relaxed mt-3", children: "This license shall automatically terminate if you violate any of these restrictions and may be terminated by us at any time. Upon terminating your viewing of these materials or upon the termination of this license, you must destroy any downloaded materials in your possession whether in electronic or printed format." })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { className: "font-space-grotesk font-bold text-2xl text-[#293056] mb-4", children: "User Accounts" }),
      /* @__PURE__ */ jsx("p", { className: "font-work-sans text-gray-700 leading-relaxed mb-3", children: "When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account." }),
      /* @__PURE__ */ jsx("p", { className: "font-work-sans text-gray-700 leading-relaxed", children: "You agree not to disclose your password to any third party and to take sole responsibility for any activities or actions under your account, whether or not you have authorized such activities or actions." })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { className: "font-space-grotesk font-bold text-2xl text-[#293056] mb-4", children: "Real Estate Services" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-space-grotesk font-semibold text-xl text-[#293056] mb-2", children: "Property Listings" }),
          /* @__PURE__ */ jsx("p", { className: "font-work-sans text-gray-700 leading-relaxed", children: "Property information displayed on our website is obtained from various sources including MLS systems, property owners, and third parties. While we strive for accuracy, we do not guarantee the completeness or accuracy of property information and recommend independent verification." })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-space-grotesk font-semibold text-xl text-[#293056] mb-2", children: "Professional Services" }),
          /* @__PURE__ */ jsx("p", { className: "font-work-sans text-gray-700 leading-relaxed", children: "Our real estate services are provided by licensed professionals. All real estate transactions are subject to applicable laws and regulations. We recommend consulting with appropriate professionals including attorneys, accountants, and inspectors before making any real estate decisions." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { className: "font-space-grotesk font-bold text-2xl text-[#293056] mb-4", children: "Prohibited Uses" }),
      /* @__PURE__ */ jsx("p", { className: "font-work-sans text-gray-700 leading-relaxed mb-3", children: "You may not use our service:" }),
      /* @__PURE__ */ jsxs("ul", { className: "font-work-sans text-gray-700 leading-relaxed ml-6 space-y-1", children: [
        /* @__PURE__ */ jsx("li", { children: "• For any unlawful purpose or to solicit others to perform unlawful acts" }),
        /* @__PURE__ */ jsx("li", { children: "• To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances" }),
        /* @__PURE__ */ jsx("li", { children: "• To infringe upon or violate our intellectual property rights or the intellectual property rights of others" }),
        /* @__PURE__ */ jsx("li", { children: "• To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate" }),
        /* @__PURE__ */ jsx("li", { children: "• To submit false or misleading information" }),
        /* @__PURE__ */ jsx("li", { children: "• To upload or transmit viruses or any other type of malicious code" }),
        /* @__PURE__ */ jsx("li", { children: "• To collect or track personal information of others" }),
        /* @__PURE__ */ jsx("li", { children: "• To spam, phish, pharm, pretext, spider, crawl, or scrape" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { className: "font-space-grotesk font-bold text-2xl text-[#293056] mb-4", children: "Content and Intellectual Property" }),
      /* @__PURE__ */ jsxs("p", { className: "font-work-sans text-gray-700 leading-relaxed mb-3", children: [
        "The content on this website, including but not limited to text, graphics, images, logos, and software, is the property of ",
        companyName,
        " or its content suppliers and is protected by copyright and other intellectual property laws."
      ] }),
      /* @__PURE__ */ jsx("p", { className: "font-work-sans text-gray-700 leading-relaxed", children: "You may not reproduce, distribute, display, sell, lease, transmit, create derivative works from, translate, modify, reverse-engineer, disassemble, decompile or otherwise exploit this website or any portion of it unless expressly permitted by us in writing." })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { className: "font-space-grotesk font-bold text-2xl text-[#293056] mb-4", children: "Disclaimer" }),
      /* @__PURE__ */ jsxs("p", { className: "font-work-sans text-gray-700 leading-relaxed mb-3", children: [
        "The materials on ",
        companyName,
        "'s website are provided on an 'as is' basis. ",
        companyName,
        " makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights."
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "font-work-sans text-gray-700 leading-relaxed", children: [
        "Further, ",
        companyName,
        " does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { className: "font-space-grotesk font-bold text-2xl text-[#293056] mb-4", children: "Limitations of Liability" }),
      /* @__PURE__ */ jsxs("p", { className: "font-work-sans text-gray-700 leading-relaxed", children: [
        "In no event shall ",
        companyName,
        " or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ",
        companyName,
        "'s website, even if ",
        companyName,
        " or its authorized representative has been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { className: "font-space-grotesk font-bold text-2xl text-[#293056] mb-4", children: "Indemnification" }),
      /* @__PURE__ */ jsxs("p", { className: "font-work-sans text-gray-700 leading-relaxed", children: [
        "You agree to indemnify, defend, and hold harmless ",
        companyName,
        ", its officers, directors, employees, agents, and third parties, for any losses, costs, liabilities and damages (including reasonable attorney's fees) relating to or arising out of your use of or inability to use the site, any user postings made by you, your violation of any terms of this Agreement or your violation of any rights of a third party, or your violation of any applicable laws, rules or regulations."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { className: "font-space-grotesk font-bold text-2xl text-[#293056] mb-4", children: "Termination" }),
      /* @__PURE__ */ jsx("p", { className: "font-work-sans text-gray-700 leading-relaxed", children: "We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including but not limited to a breach of the Terms. If you wish to terminate your account, you may simply discontinue using the service." })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { className: "font-space-grotesk font-bold text-2xl text-[#293056] mb-4", children: "Governing Law" }),
      /* @__PURE__ */ jsxs("p", { className: "font-work-sans text-gray-700 leading-relaxed", children: [
        "These Terms shall be interpreted and governed by the laws of the jurisdiction in which ",
        companyName,
        " operates, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { className: "font-space-grotesk font-bold text-2xl text-[#293056] mb-4", children: "Changes to Terms of Service" }),
      /* @__PURE__ */ jsx("p", { className: "font-work-sans text-gray-700 leading-relaxed", children: "We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our service after any revisions become effective, you agree to be bound by the revised terms." })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { className: "font-space-grotesk font-bold text-2xl text-[#293056] mb-4", children: "Contact Information" }),
      /* @__PURE__ */ jsx("p", { className: "font-work-sans text-gray-700 leading-relaxed mb-3", children: "If you have any questions about these Terms of Service, please contact us:" }),
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
  TermsContent as default
};
