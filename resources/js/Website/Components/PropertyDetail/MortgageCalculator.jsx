import React, { useState } from 'react';

const MortgageCalculator = ({ property }) => {
  // Get property price from property data or default
  const defaultPrice = property?.ListPrice || property?.OriginalPrice || 1139000;
  
  // Get property tax from property data
  const propertyTax = property?.Taxes || property?.TaxAnnualAmount || 0;
  
  // Get condo fees from property data
  const monthlyCondoFees = property?.AssociationFee || property?.MaintenanceExpense || 0;
  
  const [propertyPrice, setPropertyPrice] = useState(defaultPrice);
  const [taxes, setTaxes] = useState(propertyTax);
  const [condoFees, setCondoFees] = useState(monthlyCondoFees);
  const [amortization, setAmortization] = useState('30 Years');
  const [interestRate, setInterestRate] = useState(5.5);
  // Calculate default down payment (5% minimum for Canadian properties)
  const defaultDownPayment = Math.max(defaultPrice * 0.05, 52450);
  const [downPayment, setDownPayment] = useState(defaultDownPayment);
  const [taxesBottom, setTaxesBottom] = useState(0);

  // Calculate mortgage values
  const loanAmount = propertyPrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = parseInt(amortization) * 12;
  
  const monthlyPayment = loanAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
    (Math.pow(1 + monthlyRate, numPayments) - 1);

  const totalPayment = monthlyPayment + (taxes / 12) + (condoFees / 12);
  const totalYearlyPayments = totalPayment * 12;
  const principalInterest = monthlyPayment;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (amount) => {
    return new Intl.NumberFormat('en-US').format(amount);
  };

  return (
    <div className="space-y-3 md:space-y-6">
      <div>
        <h2 className="text-base font-semibold mb-2 md:mb-4" style={{ color: '#293056' }}>Mortgage Calculator</h2>
        <p className="text-gray-600 text-xs md:text-sm mb-3 md:mb-4 leading-tight">Calculate your estimated monthly payments for this property based on different loan terms and down payment amounts.</p>
      </div>
      
      {/* Input Fields - Compact Mobile Layout */}
      <div className="space-y-3 md:space-y-6">
        {/* Row 1: Property Price and Down Payment */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-6">
          <div>
            <label className="block text-xs font-normal text-gray-700 mb-1 font-work-sans">
              Property Price
            </label>
            <input
              type="text"
              value={`$ ${formatNumber(propertyPrice)}`}
              onChange={(e) => {
                const value = e.target.value.replace(/[$,\s]/g, '');
                setPropertyPrice(Number(value) || 0);
              }}
              className="w-full px-2 py-2 md:px-3 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs md:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-xs font-normal text-gray-700 mb-1 font-work-sans">
              Down Payment
            </label>
            <input
              type="text"
              value={`$ ${formatNumber(downPayment)}`}
              onChange={(e) => {
                const value = e.target.value.replace(/[$,\s]/g, '');
                setDownPayment(Number(value) || 0);
              }}
              className="w-full px-2 py-2 md:px-3 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs md:text-sm"
            />
          </div>
        </div>
        
        {/* Row 2: Interest Rate and Amortization */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-6">
          <div>
            <label className="block text-xs font-normal text-gray-700 mb-1 font-work-sans">
              Interest Rate
            </label>
            <input
              type="text"
              value={`${interestRate} %`}
              onChange={(e) => {
                const value = e.target.value.replace(/[%\s]/g, '');
                setInterestRate(Number(value) || 0);
              }}
              className="w-full px-2 py-2 md:px-3 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs md:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-xs font-normal text-gray-700 mb-1 font-work-sans">
              Amortization
            </label>
            <select
              value={amortization}
              onChange={(e) => setAmortization(e.target.value)}
              className="w-full px-2 py-2 md:px-3 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs md:text-sm appearance-none bg-white"
            >
              <option value="15 Years">15 Years</option>
              <option value="20 Years">20 Years</option>
              <option value="25 Years">25 Years</option>
              <option value="30 Years">30 Years</option>
            </select>
          </div>
        </div>
        
        {/* Row 3: Taxes and Condo Fees */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-6">
          <div>
            <label className="block text-xs font-normal text-gray-700 mb-1 font-work-sans">
              Property Tax (Annual)
            </label>
            <input
              type="text"
              value={`$ ${formatNumber(taxes)}`}
              onChange={(e) => {
                const value = e.target.value.replace(/[$,\s]/g, '');
                setTaxes(Number(value) || 0);
              }}
              className="w-full px-2 py-2 md:px-3 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs md:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-xs font-normal text-gray-700 mb-1 font-work-sans">
              Condo Fees (Monthly)
            </label>
            <input
              type="text"
              value={`$ ${formatNumber(condoFees)}`}
              onChange={(e) => {
                const value = e.target.value.replace(/[$,\s]/g, '');
                setCondoFees(Number(value) || 0);
              }}
              className="w-full px-2 py-2 md:px-3 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs md:text-sm"
            />
          </div>
        </div>
        
        {/* Results Cards - Compact Mobile Layout */}
        <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-3 md:gap-6">
          {/* Mobile: Single column layout, Desktop: 3 columns */}
          
          {/* Total Payment - Most Important */}
          <div className="bg-[#F5F5F5] rounded-lg p-3 md:p-6">
            <h4 className="text-xs font-normal mb-1 md:mb-2 font-work-sans" style={{ color: '#293056' }}>
              Monthly Payment
            </h4>
            <p className="text-sm md:text-base font-bold text-green-600 font-work-sans">
              {formatCurrency(totalPayment)}
            </p>
          </div>
          
          {/* Principal & Interest */}
          <div className="bg-[#F5F5F5] rounded-lg p-3 md:p-6">
            <h4 className="text-xs font-normal mb-1 md:mb-2 font-work-sans" style={{ color: '#293056' }}>
              Principal & Interest
            </h4>
            <p className="text-sm md:text-base font-normal text-green-600 font-work-sans">
              {formatCurrency(principalInterest)}
            </p>
          </div>
          
          {/* Total Yearly Payments */}
          <div className="bg-[#F5F5F5] rounded-lg p-3 md:p-6">
            <h4 className="text-xs font-normal mb-1 md:mb-2 font-work-sans" style={{ color: '#293056' }}>
              Yearly Payments
            </h4>
            <p className="text-sm md:text-base font-normal text-green-600 font-work-sans">
              {formatCurrency(totalYearlyPayments)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MortgageCalculator;