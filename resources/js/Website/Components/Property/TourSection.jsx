import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';

const TourSection = ({ propertyData = null }) => {
  const [selectedDateIndex, setSelectedDateIndex] = useState(2);
  const [selectedTime, setSelectedTime] = useState('afternoon');
  const [currentDateOffset, setCurrentDateOffset] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get brand colors from page props
  const { globalWebsite, website } = usePage().props;
  const currentWebsite = website || globalWebsite;
  const brandColors = currentWebsite?.brand_colors || {};
  const buttonQuaternaryBg = brandColors.button_quaternary_bg || '#FFFFFF';
  const buttonQuaternaryText = brandColors.button_quaternary_text || '#293056';
  const buttonTertiaryBg = brandColors.button_tertiary_bg || '#000000';
  const buttonTertiaryText = brandColors.button_tertiary_text || '#FFFFFF';

  // Get property data or use defaults
  const getPropertyInfo = () => {
    if (propertyData) {
      return {
        name: propertyData.name || 'The Merchandise Lofts',
        address: propertyData.address || '155 Dalhousie St',
        image: propertyData.Images?.[0]?.MediaURL || 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=300&h=300&fit=crop&crop=center',
        forRent: propertyData.forRent || 9,
        forSale: propertyData.forSale || 9
      };
    }
    return {
      name: 'The Merchandise Lofts',
      address: '155 Dalhousie St',
      image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=300&h=300&fit=crop&crop=center',
      forRent: 9,
      forSale: 9
    };
  };

  const property = getPropertyInfo();

  // Generate dates for the next 14 days
  const generateDates = () => {
    const dates = [];
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      dates.push({
        date: date,
        day: days[date.getDay()],
        dayNum: date.getDate().toString().padStart(2, '0'),
        month: months[date.getMonth()],
        iso: date.toISOString()
      });
    }
    return dates;
  };

  const allDates = generateDates();
  const visibleDates = allDates.slice(currentDateOffset, currentDateOffset + 3);

  const timeSlots = [
    { id: 'morning', label: 'Morning', range: '8AM TO 12PM' },
    { id: 'afternoon', label: 'Afternoon', range: '12PM TO 4PM' },
    { id: 'evening', label: 'Evening', range: '4PM TO 8PM' }
  ];

  const handlePrevDate = () => {
    if (currentDateOffset > 0) {
      setCurrentDateOffset(currentDateOffset - 1);
    }
  };

  const handleNextDate = () => {
    if (currentDateOffset < allDates.length - 3) {
      setCurrentDateOffset(currentDateOffset + 1);
    }
  };

  const handleDateSelect = (index) => {
    setSelectedDateIndex(index);
  };

  const handleTimeSelect = (timeId) => {
    setSelectedTime(timeId);
  };

  const handleRequestTour = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    const selectedDate = visibleDates[selectedDateIndex];
    const formattedDate = `${selectedDate.day}, ${selectedDate.month} ${selectedDate.dayNum}`;
    const timeRanges = {
      morning: '9AM to 12PM',
      afternoon: '12PM to 4PM',
      evening: '4PM to 8PM'
    };

    try {
      const response = await fetch('/api/tour-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          full_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          selected_date: formattedDate,
          selected_time: timeRanges[selectedTime],
          property_type: 'property',
          property_id: propertyData?.listingKey || propertyData?.ListingKey || null,
          property_address: property.address
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setShowModal(false);
        setFormData({ name: '', email: '', phone: '', message: '' });
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
        }, 5000);
      } else {
        if (result.errors) {
          const errorMessages = Object.values(result.errors).flat().join('\n');
          alert(`Please correct the following errors:\n${errorMessages}`);
        } else {
          alert(result.message || 'Failed to submit tour request. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error submitting tour request:', error);
      alert('An error occurred while submitting your request. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedDateTime = () => {
    const selectedDate = visibleDates[selectedDateIndex];
    const selectedTimeSlot = timeSlots.find(t => t.id === selectedTime);
    if (selectedDate && selectedTimeSlot) {
      return `${selectedDate.day} ${selectedDate.dayNum} ${selectedDate.month}, ${selectedTimeSlot.label}`;
    }
    return '';
  };

  // Icon components
  const ChevronLeftIcon = ({ className }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15,18 9,12 15,6"></polyline>
    </svg>
  );

  const ChevronRightIcon = ({ className }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9,18 15,12 9,6"></polyline>
    </svg>
  );

  const CloseIcon = ({ className }) => (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <div className="w-full max-w-[1280px] mx-auto px-5 py-5">
      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-[1000000] animate-slide-in-right">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start shadow-lg max-w-sm">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Tour Request Submitted!
              </h3>
              <p className="text-sm text-green-700 mt-1">
                We'll contact you shortly to confirm your tour.
              </p>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="ml-4 flex-shrink-0 text-green-400 hover:text-green-600"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Tour Section */}
      <div className="flex flex-col lg:flex-row items-center gap-5 w-full max-w-[1280px] h-auto lg:h-[218px] mx-auto">
        
        {/* Left Card - Property Info */}
        <div className="relative w-full lg:w-[658px] h-[218px] bg-white rounded-xl shadow-lg overflow-hidden flex-none">
          {/* Property Image */}
          <div className="absolute w-[232px] h-[238px] left-0 top-0 overflow-hidden">
            <img 
              src={property.image}
              alt={property.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=300&h=300&fit=crop&crop=center';
              }}
            />
          </div>
          
          {/* Property Content */}
          <div className="absolute w-[350px] h-[185px] left-[270px] top-4 flex flex-col justify-between items-start gap-12">
            {/* Property Info */}
            <div className="flex flex-col items-start gap-2 w-full h-auto">
              <div className="flex flex-col items-start w-full">
                <h2 className="font-space-grotesk font-medium text-[28px] leading-[38px] tracking-tight text-[#252B37] mb-2">
                  {property.name}
                </h2>
              </div>
              <p className="font-work-sans font-normal text-sm leading-6 tracking-tight text-[#707070]">
                {property.address}
              </p>
            </div>
            
            {/* Property Buttons */}
            <div className="flex flex-row items-end gap-2 w-full h-10">
              <div className="flex flex-col items-center w-[160px] h-10">
                <button
                  className="flex flex-col justify-center items-center w-full h-10 border rounded-full bg-transparent cursor-pointer transition-all duration-300 hover:bg-[rgba(41,48,86,0.05)] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
                  style={{ borderColor: buttonQuaternaryText }}
                >
                  <div className="flex flex-row justify-center items-center px-6 py-2.5 gap-2 w-full h-10">
                    <span
                      className="font-work-sans font-bold text-sm leading-5 tracking-tight"
                      style={{ color: buttonQuaternaryText }}
                    >
                      {property.forRent} for rent
                    </span>
                  </div>
                </button>
              </div>

              <div className="flex flex-col items-center w-[182px] h-10 flex-1">
                <button
                  className="flex flex-col justify-center items-center w-full h-10 border rounded-full bg-transparent cursor-pointer transition-all duration-300 hover:bg-[rgba(41,48,86,0.05)] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
                  style={{ borderColor: buttonQuaternaryText }}
                >
                  <div className="flex flex-row justify-center items-center px-6 py-2.5 gap-2 w-full h-10">
                    <span
                      className="font-work-sans font-bold text-sm leading-5 tracking-tight"
                      style={{ color: buttonQuaternaryText }}
                    >
                      {property.forSale} for sale
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card - Tour Scheduling */}
        <div className="w-full lg:w-[602px] h-auto lg:h-[218px] bg-white border border-[#F1F1F1] shadow-lg rounded-[10px] flex flex-row justify-center items-center p-4 flex-none lg:flex-1">
          <div className="flex flex-col lg:flex-row justify-center items-start gap-8 w-full max-w-[570px] h-auto lg:h-[170px]">
            
            {/* Date and Time Section */}
            <div className="flex flex-col items-center gap-5 w-full lg:w-[302px] h-auto lg:h-[170px]">
              {/* Date Selection */}
              <div className="flex flex-row items-center gap-1 w-full lg:w-[302px] h-[91px]">
                <button 
                  onClick={handlePrevDate}
                  disabled={currentDateOffset === 0}
                  className="w-6 h-6 bg-white border-none cursor-pointer text-[#414141] flex items-center justify-center hover:bg-gray-50 hover:rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="w-6 h-6" />
                </button>
                
                <div className="flex flex-row items-center gap-2 w-[247px] h-[91px]">
                  {visibleDates.map((dateData, index) => (
                    <div
                      key={index}
                      onClick={() => handleDateSelect(index)}
                      className={`flex flex-col justify-center items-center p-2 gap-1 w-[77px] h-[91px] rounded-lg cursor-pointer transition-all duration-300 ${
                        selectedDateIndex === index
                          ? 'bg-white border-2 border-black shadow-lg'
                          : 'bg-white border border-[#999999] hover:border-[#666666] hover:shadow-sm'
                      }`}
                    >
                      <span className="font-work-sans font-medium text-xs leading-4 uppercase tracking-wide text-[#6B7280]">
                        {dateData.day}
                      </span>
                      <span className="font-space-grotesk font-bold text-2xl leading-8 text-[#1F2937]">
                        {dateData.dayNum}
                      </span>
                      <span className="font-work-sans font-medium text-xs leading-4 uppercase tracking-wide text-[#6B7280]">
                        {dateData.month}
                      </span>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={handleNextDate}
                  disabled={currentDateOffset >= allDates.length - 3}
                  className="w-6 h-6 bg-white border-none cursor-pointer text-[#414141] flex items-center justify-center hover:bg-gray-50 hover:rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Time Selection */}
              <div className="flex flex-row justify-between items-center gap-2 w-full lg:w-[302px] h-[59px]">
                {timeSlots.map((timeSlot) => (
                  <div
                    key={timeSlot.id}
                    onClick={() => handleTimeSelect(timeSlot.id)}
                    className={`flex flex-col justify-center items-center gap-1 w-[94px] h-[59px] rounded cursor-pointer transition-all duration-300 ${
                      selectedTime === timeSlot.id
                        ? 'border-2 border-black bg-transparent'
                        : 'border border-[#999999] bg-transparent hover:border-[#666666]'
                    }`}
                  >
                    <span className="font-red-hat font-medium text-sm leading-[18px] text-center text-[#263238] w-full">
                      {timeSlot.label}
                    </span>
                    <span className="font-red-hat font-normal text-xs leading-4 text-center text-[#263238] w-full">
                      {timeSlot.range}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tour Info Section - Desktop */}
            <div className="hidden lg:flex flex-col items-center gap-2 w-[223px] h-[170px]">
              <div className="gap-1 w-[154px] h-[47px]">
                <h3 className="w-[154px] h-6 font-red-hat font-extrabold text-lg leading-6 text-center text-black">
                  Schedule a tour
                </h3>
                <p className="w-[154px] h-[19px] font-red-hat font-normal text-sm leading-[19px] text-[#263238]">
                  Tour with a buyer's agent
                </p>
              </div>
              
              {/* Desktop Tour Buttons */}
              <div className="flex flex-col justify-between gap-3 w-full mt-6">
                <button
                  onClick={handleRequestTour}
                  className="px-6 py-2.5 gap-2 w-[223px] h-11 rounded-full border-none font-work-sans font-extrabold text-base leading-6 text-center cursor-pointer transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5"
                  style={{ backgroundColor: buttonTertiaryBg, color: buttonTertiaryText }}
                >
                  Request a tour
                </button>
                <button
                  className="flex flex-row justify-center items-center px-6 py-2.5 gap-2 w-[223px] h-11 border rounded-full bg-transparent font-work-sans font-extrabold text-base leading-6 text-center cursor-pointer transition-all duration-300 hover:bg-gray-50"
                  style={{ backgroundColor: buttonQuaternaryBg, color: buttonQuaternaryText, borderColor: buttonQuaternaryText }}
                >
                  Ask a question
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Tour Buttons */}
      <div className="flex lg:hidden flex-row justify-between gap-3 w-full mt-6">
        <button
          onClick={handleRequestTour}
          className="px-6 py-2.5 gap-2 flex-1 h-11 rounded-full border-none font-work-sans font-extrabold text-base leading-6 text-center cursor-pointer transition-all duration-300 hover:opacity-90"
          style={{ backgroundColor: buttonTertiaryBg, color: buttonTertiaryText }}
        >
          Request a tour
        </button>
        <button
          className="flex flex-row justify-center items-center px-6 py-2.5 gap-2 flex-1 h-11 border rounded-full bg-transparent font-work-sans font-extrabold text-base leading-6 text-center cursor-pointer transition-all duration-300 hover:bg-gray-50"
          style={{ backgroundColor: buttonQuaternaryBg, color: buttonQuaternaryText, borderColor: buttonQuaternaryText }}
        >
          Ask a question
        </button>
      </div>

      {/* Tour Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Request a Tour</h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-6">
                You've selected: <span className="font-semibold text-gray-900">{getSelectedDateTime()}</span>
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Any specific requirements or questions..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-md font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-opacity"
                  style={{ backgroundColor: buttonTertiaryBg, color: buttonTertiaryText }}
                >
                  Confirm Tour Request
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TourSection;