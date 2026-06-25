import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
const MortgageCalculator = ({ property, hideHeading = false }) => {
  const defaultPrice = property?.ListPrice || property?.OriginalPrice || 1139e3;
  const propertyTax = property?.Taxes || property?.TaxAnnualAmount || 0;
  const monthlyCondoFees = property?.AssociationFee || property?.MaintenanceExpense || 0;
  const [propertyPrice, setPropertyPrice] = useState(defaultPrice);
  const [taxes, setTaxes] = useState(propertyTax);
  const [condoFees, setCondoFees] = useState(monthlyCondoFees);
  const [amortization, setAmortization] = useState("30 Years");
  const [interestRate, setInterestRate] = useState(5.5);
  const defaultDownPayment = Math.max(defaultPrice * 0.05, 52450);
  const [downPayment, setDownPayment] = useState(defaultDownPayment);
  const [taxesBottom, setTaxesBottom] = useState(0);
  const loanAmount = propertyPrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = parseInt(amortization) * 12;
  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  const totalPayment = monthlyPayment + taxes / 12 + condoFees / 12;
  const totalYearlyPayments = totalPayment * 12;
  const principalInterest = monthlyPayment;
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  const formatNumber = (amount) => {
    return new Intl.NumberFormat("en-US").format(amount);
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3 md:space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      !hideHeading && /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold mb-2 md:mb-4", style: { color: "#293056" }, children: "Mortgage Calculator" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs md:text-sm mb-3 md:mb-4 leading-tight", children: "Calculate your estimated monthly payments for this property based on different loan terms and down payment amounts." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-3 md:space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-normal text-gray-700 mb-1 font-work-sans", children: "Property Price" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: `$ ${formatNumber(propertyPrice)}`,
              onChange: (e) => {
                const value = e.target.value.replace(/[$,\s]/g, "");
                setPropertyPrice(Number(value) || 0);
              },
              className: "w-full px-2 py-2 md:px-3 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs md:text-sm"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-normal text-gray-700 mb-1 font-work-sans", children: "Down Payment" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: `$ ${formatNumber(downPayment)}`,
              onChange: (e) => {
                const value = e.target.value.replace(/[$,\s]/g, "");
                setDownPayment(Number(value) || 0);
              },
              className: "w-full px-2 py-2 md:px-3 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs md:text-sm"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-normal text-gray-700 mb-1 font-work-sans", children: "Interest Rate" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: `${interestRate} %`,
              onChange: (e) => {
                const value = e.target.value.replace(/[%\s]/g, "");
                setInterestRate(Number(value) || 0);
              },
              className: "w-full px-2 py-2 md:px-3 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs md:text-sm"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-normal text-gray-700 mb-1 font-work-sans", children: "Amortization" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: amortization,
              onChange: (e) => setAmortization(e.target.value),
              className: "w-full px-2 py-2 md:px-3 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs md:text-sm appearance-none bg-white",
              children: [
                /* @__PURE__ */ jsx("option", { value: "15 Years", children: "15 Years" }),
                /* @__PURE__ */ jsx("option", { value: "20 Years", children: "20 Years" }),
                /* @__PURE__ */ jsx("option", { value: "25 Years", children: "25 Years" }),
                /* @__PURE__ */ jsx("option", { value: "30 Years", children: "30 Years" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-normal text-gray-700 mb-1 font-work-sans", children: "Property Tax (Annual)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: `$ ${formatNumber(taxes)}`,
              onChange: (e) => {
                const value = e.target.value.replace(/[$,\s]/g, "");
                setTaxes(Number(value) || 0);
              },
              className: "w-full px-2 py-2 md:px-3 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs md:text-sm"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-normal text-gray-700 mb-1 font-work-sans", children: "Condo Fees (Monthly)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: `$ ${formatNumber(condoFees)}`,
              onChange: (e) => {
                const value = e.target.value.replace(/[$,\s]/g, "");
                setCondoFees(Number(value) || 0);
              },
              className: "w-full px-2 py-2 md:px-3 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs md:text-sm"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2 md:space-y-0 md:grid md:grid-cols-3 md:gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-[#F5F5F5] rounded-lg p-3 md:p-6", children: [
          /* @__PURE__ */ jsx("h4", { className: "text-xs font-normal mb-1 md:mb-2 font-work-sans", style: { color: "#293056" }, children: "Monthly Payment" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm md:text-base font-bold text-green-600 font-work-sans", children: formatCurrency(totalPayment) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-[#F5F5F5] rounded-lg p-3 md:p-6", children: [
          /* @__PURE__ */ jsx("h4", { className: "text-xs font-normal mb-1 md:mb-2 font-work-sans", style: { color: "#293056" }, children: "Principal & Interest" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm md:text-base font-normal text-green-600 font-work-sans", children: formatCurrency(principalInterest) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-[#F5F5F5] rounded-lg p-3 md:p-6", children: [
          /* @__PURE__ */ jsx("h4", { className: "text-xs font-normal mb-1 md:mb-2 font-work-sans", style: { color: "#293056" }, children: "Yearly Payments" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm md:text-base font-normal text-green-600 font-work-sans", children: formatCurrency(totalYearlyPayments) })
        ] })
      ] })
    ] })
  ] });
};
export {
  MortgageCalculator as default
};
