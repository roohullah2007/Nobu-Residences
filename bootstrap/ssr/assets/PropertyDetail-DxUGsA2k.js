import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import MainLayout from "./MainLayout-B3DCp-WI.js";
import "./Footer-BjazYOa4.js";
import "./ContactAgentModal-Bc8CTpfm.js";
import "./Navbar-Cf7RY0yN.js";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import "./LoginModal-C-0W-anf.js";
import "./GoogleLoginButton-wrwag0eM.js";
import "./PropertyDetailIcons-3huqvWqW.js";
import "@headlessui/react";
const Lock = ({ className }) => /* @__PURE__ */ jsx("svg", { className, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 15v2m-6 4h12a2 2 0 002-2v-9a2 2 0 00-2-2H6a2 2 0 00-2 2v9a2 2 0 002 2z" }) });
const CreditCard = ({ className }) => /* @__PURE__ */ jsx("svg", { className, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" }) });
const Phone = ({ className }) => /* @__PURE__ */ jsx("svg", { className, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" }) });
const Mail = ({ className }) => /* @__PURE__ */ jsx("svg", { className, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" }) });
function AgentPropertyDetail({ property, canPurchaseContact }) {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({
    buyer_name: "",
    buyer_email: "",
    payment_method: "stripe"
  });
  const [loading, setLoading] = useState(false);
  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(route("agent.properties.purchase-contact", property.id), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content
        },
        body: JSON.stringify(purchaseForm)
      });
      const data = await response.json();
      if (data.success) {
        router.reload();
      } else {
        alert(data.message || "Purchase failed. Please try again.");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPurchaseForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  return /* @__PURE__ */ jsxs(MainLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: `${property.title} - Property Details` }),
    /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gray-50", children: [
      /* @__PURE__ */ jsx("div", { className: "bg-white border-b", children: /* @__PURE__ */ jsx("div", { className: "max-w-[1280px] mx-auto px-5 py-8", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start gap-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("h1", { className: "font-space-grotesk font-bold text-3xl md:text-4xl text-[#293056] mb-3", children: property.title }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
            /* @__PURE__ */ jsx("div", { className: "font-work-sans text-lg text-[#293056]", children: property.address }),
            !property.has_contact_access && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium", children: [
              /* @__PURE__ */ jsx(Lock, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsx("span", { children: "Exact Address Hidden" })
            ] })
          ] }),
          property.has_contact_access && property.full_address && property.full_address !== property.address && /* @__PURE__ */ jsxs("div", { className: "text-gray-600 mb-4", children: [
            /* @__PURE__ */ jsx("strong", { children: "Complete Address:" }),
            " ",
            property.full_address
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-gray-600", children: [
              "Postal Code: ",
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: property.postal_code })
            ] }),
            !property.has_contact_access && /* @__PURE__ */ jsx("div", { className: "text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded", children: "Partial" })
          ] }),
          !property.has_contact_access && /* @__PURE__ */ jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsx(Lock, { className: "w-5 h-5 text-blue-600 mt-0.5" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "font-medium text-blue-900 mb-1", children: "Address Protection Active" }),
              /* @__PURE__ */ jsx("div", { className: "text-sm text-blue-700", children: "The exact street address is hidden for privacy. Location shown is approximate (±1km). Purchase contact access to view the precise address and coordinates." })
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-2xl md:text-3xl font-bold text-[#93370D] mb-2", children: [
            "$",
            property.price?.toLocaleString()
          ] }),
          canPurchaseContact && /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setShowPurchaseModal(true),
              className: "bg-[#93370D] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#7A2A09] transition-colors flex items-center gap-2",
              children: [
                /* @__PURE__ */ jsx(Lock, { className: "w-4 h-4" }),
                "Get Contact Info ($",
                property.contact_price,
                ")"
              ]
            }
          )
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsx("div", { className: "max-w-[1280px] mx-auto px-5 py-8", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2", children: [
          property.images && property.images.length > 0 && /* @__PURE__ */ jsx("div", { className: "mb-8", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4", children: property.images.slice(0, 6).map((image, index) => /* @__PURE__ */ jsx("div", { className: "aspect-video bg-gray-200 rounded-lg overflow-hidden", children: /* @__PURE__ */ jsx(
            "img",
            {
              src: image,
              alt: `Property image ${index + 1}`,
              className: "w-full h-full object-cover"
            }
          ) }, index)) }) }),
          /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-sm p-6 mb-8", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold mb-4", children: "Property Details" }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-gray-600 text-sm", children: "Type" }),
                /* @__PURE__ */ jsx("div", { className: "font-medium", children: property.property_type })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-gray-600 text-sm", children: "Bedrooms" }),
                /* @__PURE__ */ jsx("div", { className: "font-medium", children: property.bedrooms })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-gray-600 text-sm", children: "Bathrooms" }),
                /* @__PURE__ */ jsx("div", { className: "font-medium", children: property.bathrooms })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-gray-600 text-sm", children: "Area" }),
                /* @__PURE__ */ jsxs("div", { className: "font-medium", children: [
                  property.area,
                  " sqft"
                ] })
              ] }),
              property.parking > 0 && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-gray-600 text-sm", children: "Parking" }),
                /* @__PURE__ */ jsx("div", { className: "font-medium", children: property.parking })
              ] }),
              property.maintenance_fees && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-gray-600 text-sm", children: "Maintenance" }),
                /* @__PURE__ */ jsxs("div", { className: "font-medium", children: [
                  "$",
                  property.maintenance_fees
                ] })
              ] }),
              property.property_taxes && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-gray-600 text-sm", children: "Property Tax" }),
                /* @__PURE__ */ jsxs("div", { className: "font-medium", children: [
                  "$",
                  property.property_taxes
                ] })
              ] }),
              property.exposure && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-gray-600 text-sm", children: "Exposure" }),
                /* @__PURE__ */ jsx("div", { className: "font-medium", children: property.exposure })
              ] })
            ] })
          ] }),
          property.description && /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-sm p-6", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold mb-4", children: "Description" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-700 leading-relaxed", children: property.description })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "lg:col-span-1", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-sm p-6 sticky top-8", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold mb-4", children: "Agent Information" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
            property.agent.photo ? /* @__PURE__ */ jsx(
              "img",
              {
                src: property.agent.photo,
                alt: property.agent.name,
                className: "w-12 h-12 rounded-full object-cover"
              }
            ) : /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-gray-600 font-medium", children: property.agent.name.charAt(0) }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "font-medium", children: property.agent.name }),
              /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600", children: "Real Estate Agent" })
            ] })
          ] }),
          property.has_contact_access ? /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 p-3 bg-green-50 rounded-lg", children: [
              /* @__PURE__ */ jsx(Phone, { className: "w-5 h-5 text-green-600" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600", children: "Phone" }),
                /* @__PURE__ */ jsx("div", { className: "font-medium", children: property.agent.phone })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 p-3 bg-green-50 rounded-lg", children: [
              /* @__PURE__ */ jsx(Mail, { className: "w-5 h-5 text-green-600" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600", children: "Email" }),
                /* @__PURE__ */ jsx("div", { className: "font-medium", children: property.agent.email })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mt-4 p-3 bg-blue-50 rounded-lg", children: /* @__PURE__ */ jsx("div", { className: "text-sm text-blue-700 text-center", children: "✓ Contact information unlocked!" }) })
          ] }) : /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxs("div", { className: "p-4 bg-orange-50 rounded-lg mb-4", children: [
              /* @__PURE__ */ jsx(Lock, { className: "w-8 h-8 text-orange-500 mx-auto mb-2" }),
              /* @__PURE__ */ jsx("div", { className: "text-sm text-orange-700", children: "Contact information is protected. Purchase access to view agent's phone and email." })
            ] }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setShowPurchaseModal(true),
                className: "w-full bg-[#93370D] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#7A2A09] transition-colors flex items-center justify-center gap-2",
                children: [
                  /* @__PURE__ */ jsx(CreditCard, { className: "w-4 h-4" }),
                  "Purchase Contact ($",
                  property.contact_price,
                  ")"
                ]
              }
            )
          ] })
        ] }) })
      ] }) })
    ] }),
    showPurchaseModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4", children: /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg shadow-xl w-full max-w-md", children: /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold mb-4", children: "Purchase Contact Information" }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4 p-4 bg-gray-50 rounded-lg", children: [
        /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600", children: "Property" }),
        /* @__PURE__ */ jsx("div", { className: "font-medium", children: property.title }),
        /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-600 mt-1", children: [
          "Agent: ",
          property.agent.name
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-lg font-bold text-[#93370D] mt-2", children: [
          "$",
          property.contact_price
        ] })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handlePurchaseSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Your Name" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              name: "buyer_name",
              value: purchaseForm.buyer_name,
              onChange: handleInputChange,
              required: true,
              className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#93370D] focus:border-transparent"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Your Email" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "email",
              name: "buyer_email",
              value: purchaseForm.buyer_email,
              onChange: handleInputChange,
              required: true,
              className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#93370D] focus:border-transparent"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Payment Method" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              name: "payment_method",
              value: purchaseForm.payment_method,
              onChange: handleInputChange,
              className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#93370D] focus:border-transparent",
              children: [
                /* @__PURE__ */ jsx("option", { value: "stripe", children: "Credit Card (Stripe)" }),
                /* @__PURE__ */ jsx("option", { value: "paypal", children: "PayPal" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 pt-4", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setShowPurchaseModal(false),
              className: "flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: loading,
              className: "flex-1 bg-[#93370D] text-white py-2 px-4 rounded-md font-medium hover:bg-[#7A2A09] transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              children: loading ? "Processing..." : "Purchase"
            }
          )
        ] })
      ] })
    ] }) }) })
  ] });
}
export {
  AgentPropertyDetail as default
};
