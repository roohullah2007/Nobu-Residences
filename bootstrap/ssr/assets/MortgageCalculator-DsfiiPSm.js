import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
const MortgageCalculator = ({ propertyData = null }) => {
  const [propertyPrice, setPropertyPrice] = useState("1,139,000");
  const [taxesYearly, setTaxesYearly] = useState("0");
  const [condoFees, setCondoFees] = useState("0");
  const [amortization, setAmortization] = useState("30");
  const [interestRate, setInterestRate] = useState("5.5");
  const [downPayment, setDownPayment] = useState("227,800");
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [insurance, setInsurance] = useState("0");
  const [yearlyPayment, setYearlyPayment] = useState("70,382");
  const [monthlyPayment, setMonthlyPayment] = useState("5,865");
  const [principalInterest, setPrincipalInterest] = useState("5,168");
  const isForLease = propertyData?.TransactionType && (propertyData.TransactionType.toLowerCase() === "for lease" || propertyData.TransactionType.toLowerCase() === "lease");
  if (isForLease) {
    return null;
  }
  useEffect(() => {
    if (propertyData) {
      if (propertyData.ListPrice) {
        const price = propertyData.ListPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        setPropertyPrice(price);
        const priceNumber = parseFloat(propertyData.ListPrice);
        const downPaymentAmount = (priceNumber * downPaymentPercent / 100).toFixed(0);
        setDownPayment(downPaymentAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
      }
      if (propertyData.TaxAnnualAmount) {
        setTaxesYearly(propertyData.TaxAnnualAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
      }
      if (propertyData.AssociationFeeIncluded) {
        setCondoFees(propertyData.AssociationFeeIncluded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
      }
    }
  }, [propertyData]);
  const parseCurrency = (value) => {
    return parseFloat(value.toString().replace(/[$,\s]/g, "")) || 0;
  };
  const formatCurrency = (value) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  const calculateMortgage = () => {
    const price = parseCurrency(propertyPrice);
    const taxes = parseCurrency(taxesYearly);
    const condo = parseCurrency(condoFees);
    const insuranceAmount = parseCurrency(insurance);
    const downPaymentAmount = parseCurrency(downPayment);
    const rate = parseFloat(interestRate) / 100 / 12;
    const months = parseInt(amortization) * 12;
    const loanAmount = price - downPaymentAmount;
    let monthlyPI = 0;
    if (rate > 0 && months > 0) {
      monthlyPI = loanAmount * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    } else if (months > 0) {
      monthlyPI = loanAmount / months;
    }
    const monthlyTaxes = taxes / 12;
    const totalMonthly = monthlyPI + monthlyTaxes + insuranceAmount + condo;
    const totalYearly = totalMonthly * 12;
    setPrincipalInterest(formatCurrency(Math.round(monthlyPI)));
    setMonthlyPayment(formatCurrency(Math.round(totalMonthly)));
    setYearlyPayment(formatCurrency(Math.round(totalYearly)));
  };
  const handleDownPaymentSliderChange = (percent) => {
    setDownPaymentPercent(percent);
    const price = parseCurrency(propertyPrice);
    const downPaymentAmount = (price * percent / 100).toFixed(0);
    setDownPayment(formatCurrency(downPaymentAmount));
  };
  const handleDownPaymentInputChange = (value) => {
    setDownPayment(value);
    const price = parseCurrency(propertyPrice);
    const downPaymentAmount = parseCurrency(value);
    if (price > 0) {
      const percent = Math.round(downPaymentAmount / price * 100);
      setDownPaymentPercent(Math.min(Math.max(percent, 5), 50));
    }
  };
  useEffect(() => {
    calculateMortgage();
  }, [propertyPrice, taxesYearly, condoFees, amortization, interestRate, downPayment, insurance]);
  return /* @__PURE__ */ jsx("div", { className: "font-red-hat leading-normal text-inherit box-border", children: /* @__PURE__ */ jsx("div", { className: "mb-8", children: /* @__PURE__ */ jsxs("div", { className: "bg-white flex flex-col border border-gray-300 rounded-lg overflow-hidden", children: [
    /* @__PURE__ */ jsx("div", { className: "bg-[#FBF9F7] px-4 py-1.5 border-b border-gray-300", children: /* @__PURE__ */ jsx("h3", { className: "font-bold text-sm m-0 leading-snug text-black", children: "Mortgage Calculator" }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 p-2 px-4 gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2 leading-snug", children: "Property Price" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: `$ ${propertyPrice}`,
            onChange: (e) => setPropertyPrice(e.target.value.replace(/[$\s]/g, "")),
            className: "w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white transition-all duration-200 text-black leading-snug focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2 leading-snug", children: "Taxes (yearly)" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: `$ ${taxesYearly}`,
            onChange: (e) => setTaxesYearly(e.target.value.replace(/[$\s]/g, "")),
            className: "w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white transition-all duration-200 text-black leading-snug focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2 leading-snug", children: "Condo Fees (monthly)" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: `$ ${condoFees}`,
            onChange: (e) => setCondoFees(e.target.value.replace(/[$\s]/g, "")),
            className: "w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white transition-all duration-200 text-black leading-snug focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 p-2 px-4 gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2 leading-snug", children: "Amortization" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: amortization,
            onChange: (e) => setAmortization(e.target.value),
            className: "w-full px-4 py-2 pr-8 border border-gray-300 rounded-md text-sm bg-white text-black leading-snug appearance-none bg-[url('data:image/svg+xml,%3csvg xmlns=\\'http://www.w3.org/2000/svg\\' fill=\\'none\\' viewBox=\\'0 0 20 20\\'%3e%3cpath stroke=\\'%236b7280\\' stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\' stroke-width=\\'1.5\\' d=\\'m6 8 4 4 4-4\\'/%3e%3c/svg%3e')] bg-[position:right_8px_center] bg-no-repeat bg-[length:16px_16px] focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]",
            children: [
              /* @__PURE__ */ jsx("option", { value: "5", children: "5 Years" }),
              /* @__PURE__ */ jsx("option", { value: "10", children: "10 Years" }),
              /* @__PURE__ */ jsx("option", { value: "15", children: "15 Years" }),
              /* @__PURE__ */ jsx("option", { value: "20", children: "20 Years" }),
              /* @__PURE__ */ jsx("option", { value: "25", children: "25 Years" }),
              /* @__PURE__ */ jsx("option", { value: "30", children: "30 Years" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2 leading-snug", children: "Interest Rate" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: interestRate,
              onChange: (e) => setInterestRate(e.target.value),
              className: "w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white transition-all duration-200 text-black leading-snug focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none text-sm leading-none", children: "%" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2 leading-snug", children: "Down Payment" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: `$ ${downPayment}`,
            onChange: (e) => handleDownPaymentInputChange(e.target.value.replace(/[$\s]/g, "")),
            className: "w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white transition-all duration-200 text-black leading-snug focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center mt-1", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-500 mr-2 min-w-[30px] leading-snug", children: [
            downPaymentPercent,
            "%"
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "range",
              min: "5",
              max: "50",
              value: downPaymentPercent,
              onChange: (e) => handleDownPaymentSliderChange(parseInt(e.target.value)),
              className: "flex-1 h-1 bg-gray-300 rounded-md outline-none cursor-pointer appearance-none \n                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 \n                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer \n                    [&::-webkit-slider-thumb]:border-none\n                    [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full \n                    [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 p-2 px-4 gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2 leading-snug", children: "Insurance (monthly)" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: `$ ${insurance}`,
            onChange: (e) => setInsurance(e.target.value.replace(/[$\s]/g, "")),
            className: "w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white transition-all duration-200 text-black leading-snug focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", {}),
      /* @__PURE__ */ jsx("div", {})
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 p-3 px-4 pb-4 gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-100 p-4 rounded-md", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mb-1 mt-0 leading-snug", children: "Total Yearly Payments" }),
        /* @__PURE__ */ jsxs("p", { className: "text-2xl font-bold text-amber-600 m-0 leading-tight", children: [
          "$ ",
          yearlyPayment
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-100 p-4 rounded-md", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mb-1 mt-0 leading-snug", children: "Total Monthly Payment" }),
        /* @__PURE__ */ jsxs("p", { className: "text-2xl font-bold text-amber-600 m-0 leading-tight", children: [
          "$ ",
          monthlyPayment
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-100 p-4 rounded-md", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mb-1 mt-0 leading-snug", children: "Principal & Interest" }),
        /* @__PURE__ */ jsxs("p", { className: "text-2xl font-bold text-amber-600 m-0 leading-tight", children: [
          "$ ",
          principalInterest
        ] })
      ] })
    ] })
  ] }) }) });
};
export {
  MortgageCalculator as default
};
