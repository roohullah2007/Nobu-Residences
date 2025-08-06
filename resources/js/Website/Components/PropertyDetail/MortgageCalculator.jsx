import React, { useState } from 'react';

const MortgageCalculator = () => {
  const [propertyPrice, setPropertyPrice] = useState(1139000);
  const [taxes, setTaxes] = useState(0);
  const [condoFees, setCondoFees] = useState(0);
  const [amortization, setAmortization] = useState('30 Years');
  const [interestRate, setInterestRate] = useState(5.5);
  const [downPayment, setDownPayment] = useState(52450);
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
    <div className="py-6">
      <div className="space-y-6">
        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Property Price */}
          <div>
            <label className="block text-xs font-normal text-gray-700 mb-2 font-work-sans">
              Property Price
            </label>
            <input
              type="text"
              value={`$ ${formatNumber(propertyPrice)}`}
              onChange={(e) => {
                const value = e.target.value.replace(/[$,\s]/g, '');
                setPropertyPrice(Number(value) || 0);
              }}
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          
          {/* Taxes */}
          <div>
            <label className="block text-xs font-normal text-gray-700 mb-2 font-work-sans">
              Taxes
            </label>
            <input
              type="text"
              value={`$ ${taxes}`}
              onChange={(e) => {
                const value = e.target.value.replace(/[$,\s]/g, '');
                setTaxes(Number(value) || 0);
              }}
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          
          {/* Condo Fees */}
          <div>
            <label className="block text-xs font-normal text-gray-700 mb-2 font-work-sans">
              Condo Fees
            </label>
            <input
              type="text"
              value={`$ ${condoFees}`}
              onChange={(e) => {
                const value = e.target.value.replace(/[$,\s]/g, '');
                setCondoFees(Number(value) || 0);
              }}
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
        
        {/* Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Amortization */}
          <div>
            <label className="block text-xs font-normal text-gray-700 mb-2 font-work-sans">
              Amortization
            </label>
            <select
              value={amortization}
              onChange={(e) => setAmortization(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none bg-white"
            >
              <option value="15 Years">15 Years</option>
              <option value="20 Years">20 Years</option>
              <option value="25 Years">25 Years</option>
              <option value="30 Years">30 Years</option>
            </select>
          </div>
          
          {/* Interest Rate */}
          <div>
            <label className="block text-xs font-normal text-gray-700 mb-2 font-work-sans">
              Interest Rate
            </label>
            <input
              type="text"
              value={`${interestRate} %`}
              onChange={(e) => {
                const value = e.target.value.replace(/[%\s]/g, '');
                setInterestRate(Number(value) || 0);
              }}
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          
          {/* Down Payment */}
          <div>
            <label className="block text-xs font-normal text-gray-700 mb-2 font-work-sans">
              Down Payment
            </label>
            <input
              type="text"
              value={`$ ${formatNumber(downPayment)}`}
              onChange={(e) => {
                const value = e.target.value.replace(/[$,\s]/g, '');
                setDownPayment(Number(value) || 0);
              }}
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
        
        {/* Taxes Field */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-normal text-gray-700 mb-2 font-work-sans">
              Taxes
            </label>
            <input
              type="text"
              value={`${taxesBottom}`}
              onChange={(e) => {
                const value = e.target.value.replace(/[$,\s]/g, '');
                setTaxesBottom(Number(value) || 0);
              }}
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
        
        {/* Results Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Total Yearly Payments */}
          <div className="bg-[#F5F5F5] rounded-lg p-6">
            <h4 className="text-xs font-normal mb-2 font-work-sans" style={{ color: '#293056' }}>
              Total Yearly Payments
            </h4>
            <p className="text-base font-normal text-green-600 font-work-sans">
              {formatCurrency(totalYearlyPayments)}
            </p>
          </div>
          
          {/* Total Payment */}
          <div className="bg-[#F5F5F5] rounded-lg p-6">
            <h4 className="text-xs font-normal mb-2 font-work-sans" style={{ color: '#293056' }}>
              Total Payment
            </h4>
            <p className="text-base font-normal text-green-600 font-work-sans">
              {formatCurrency(totalPayment)}
            </p>
          </div>
          
          {/* Principal & Interest */}
          <div className="bg-[#F5F5F5] rounded-lg p-6">
            <h4 className="text-xs font-normal mb-2 font-work-sans" style={{ color: '#293056' }}>
              Principal & Interest
            </h4>
            <p className="text-base font-normal text-green-600 font-work-sans">
              {formatCurrency(principalInterest)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MortgageCalculator;