import React, { useState, useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';

const BuildingTourScheduling = ({ website, buildingData }) => {
  const { globalWebsite, website: pageWebsite } = usePage().props;
  const currentWebsite = pageWebsite || globalWebsite || website;
  const brandColors = currentWebsite?.brand_colors || {};
  const buttonTertiaryBg = brandColors.button_tertiary_bg || '#000000';
  const buttonTertiaryText = brandColors.button_tertiary_text || '#FFFFFF';
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  const [selectedDateSlot, setSelectedDateSlot] = useState(0); // 0 for first slot (tomorrow), 1 for second slot
  const [selectedTime, setSelectedTime] = useState('morning'); // Default to morning - earliest available
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successType, setSuccessType] = useState('tour'); // 'tour' or 'question'
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rightColumnRef = useRef(null);
  const contentRef = useRef(null);
  const placeholderRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [questionFormData, setQuestionFormData] = useState({
    name: '',
    email: '',
    phone: '',
    question: ''
  });

  // Generate dates array - starts from TOMORROW (no same-day booking)
  const generateDates = () => {
    const dates = [];
    const today = new Date();

    // Start from i=1 (tomorrow) - no same-day booking allowed
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        date: date,
        day: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][date.getDay()],
        dayNum: date.getDate(),
        month: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][date.getMonth()]
      });
    }
    return dates;
  };

  const dates = generateDates();

  // Handle scroll for fixed positioning
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 768) return; // Skip on mobile
      
      const contentElement = contentRef.current;
      const placeholderElement = placeholderRef.current;
      
      if (!contentElement || !placeholderElement) return;
      
      const rect = rightColumnRef.current?.getBoundingClientRect();
      const scrollPosition = window.pageYOffset;
      const initialTop = rect ? rect.top + scrollPosition : 0;
      
      // Find the RealEstateLinksSection element
      const realEstateSection = document.querySelector('section');
      let realEstateSectionTop = 0;
      
      // Look for RealEstateLinksSection by checking for its heading text
      const sections = document.querySelectorAll('section');
      for (let section of sections) {
        const heading = section.querySelector('h2');
        if (heading && heading.textContent.includes('Explore the North Riverdale')) {
          realEstateSectionTop = section.getBoundingClientRect().top + scrollPosition;
          break;
        }
      }
      
      // Calculate stop position (when tour component would overlap with RealEstateLinksSection)
      const componentHeight = contentElement.offsetHeight;
      const stopPosition = realEstateSectionTop - componentHeight - 20; // 20px buffer
      
      if (scrollPosition > initialTop && scrollPosition < stopPosition) {
        if (!isFixed) {
          setIsFixed(true);
        }
      } else {
        if (isFixed) {
          setIsFixed(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isFixed]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle question form input changes
  const handleQuestionInputChange = (e) => {
    const { name, value } = e.target;
    setQuestionFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting) return;

    setIsSubmitting(true);

    const selectedDate = dates[currentDateIndex + selectedDateSlot];
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
          property_type: 'building',
          property_id: buildingData?.id || null,
          property_address: (() => {
            // Format address with & between street addresses
            if (buildingData?.street_address_1 && buildingData?.street_address_2) {
              return `${buildingData.street_address_1} & ${buildingData.street_address_2} ${buildingData?.city || ''} ${buildingData?.province || ''}`.trim();
            }
            // Fallback to full_address or address
            return buildingData?.full_address ||
              `${buildingData?.address || ''} ${buildingData?.city || ''} ${buildingData?.province || ''}`.trim() ||
              buildingData?.name || 'Building Address Not Available';
          })()
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Reset form and show success
        setFormData({ name: '', email: '', phone: '', message: '' });
        setIsModalOpen(false);
        setSuccessType('tour');
        setShowSuccess(true);

        // Hide success message after 5 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 5000);
      } else {
        // Handle validation errors
        if (result.errors) {
          const errorMessages = Object.values(result.errors).flat().join('\n');
          alert(`Please correct the following errors:\n${errorMessages}`);
        } else {
          alert(result.message || 'Failed to submit tour request. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error submitting building tour request:', error);
      alert('An error occurred while submitting your request. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle question form submission
  const handleQuestionSubmit = async (e) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/property-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: questionFormData.name,
          email: questionFormData.email,
          phone: questionFormData.phone,
          question: questionFormData.question,
          property_listing_key: buildingData?.buildingKey || buildingData?.id || null,
          property_address: buildingData?.address || buildingData?.addressText || 'Building Address Not Available',
          property_type: 'building'
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Reset form and close modal
        setQuestionFormData({ name: '', email: '', phone: '', question: '' });
        setIsQuestionModalOpen(false);

        // Show success
        setSuccessType('question');
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
        }, 5000);
      } else {
        // Handle validation errors
        if (result.errors) {
          const errorMessages = Object.values(result.errors).flat().join('\n');
          alert(`Please correct the following errors:\n${errorMessages}`);
        } else {
          alert(result.message || 'Failed to submit question. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error submitting building question:', error);
      alert('An error occurred while submitting your question. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get selected date and time string for modal
  const getSelectedDateTime = () => {
    const selectedDate = dates[currentDateIndex + selectedDateSlot];
    const timeRanges = {
      morning: '9AM to 12PM',
      afternoon: '12PM to 4PM',
      evening: '4PM to 8PM'
    };
    
    return `${selectedDate.day}, ${selectedDate.month} ${selectedDate.dayNum} (${timeRanges[selectedTime]})`;
  };

  // Navigation handlers
  const goToPrevDate = () => {
    if (currentDateIndex > 0) {
      setCurrentDateIndex(currentDateIndex - 1);
    }
  };

  const goToNextDate = () => {
    if (currentDateIndex < dates.length - 2) {
      setCurrentDateIndex(currentDateIndex + 1);
    }
  };

  // Close modal handlers
  const closeModal = () => setIsModalOpen(false);
  const closeQuestionModal = () => setIsQuestionModalOpen(false);
  
  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const handleQuestionModalClick = (e) => {
    if (e.target === e.currentTarget) {
      closeQuestionModal();
    }
  };

  // ESC key handler
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        if (isModalOpen) {
          closeModal();
        }
        if (isQuestionModalOpen) {
          closeQuestionModal();
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isModalOpen, isQuestionModalOpen]);

  const currentDates = [
    dates[currentDateIndex],
    dates[currentDateIndex + 1]
  ];

  return (
    <>
      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-[1000000] animate-slide-in-right">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start shadow-lg max-w-sm">
            <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-green-800">
                {successType === 'question' ? 'Question Submitted!' : 'Building Tour Request Submitted!'}
              </h3>
              <p className="text-sm text-green-700 mt-1">
                {successType === 'question'
                  ? 'We\'ll get back to you within 24 hours.'
                  : 'We\'ll contact you shortly to confirm your building tour.'}
              </p>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="ml-3 text-green-400 hover:text-green-600"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Right Column Container */}
      <div
        ref={rightColumnRef}
        className="flex flex-col gap-2 relative max-w-[309px]"
      >
        {/* Placeholder for fixed positioning */}
        <div 
          ref={placeholderRef}
          className={`w-full flex-shrink-0 ${isFixed && window.innerWidth >= 768 ? 'block' : 'hidden'}`}
          style={{ height: contentRef.current?.offsetHeight || 'auto' }}
        />

        {/* Content */}
        <div 
          ref={contentRef}
          className={`flex flex-col gap-2 w-full max-w-[309px] min-w-[309px] ${
            isFixed && window.innerWidth >= 768 
              ? 'fixed top-5 z-50' 
              : ''
          }`}
          style={{
            left: isFixed && window.innerWidth >= 768 
              ? rightColumnRef.current?.getBoundingClientRect().left || 0 
              : 'auto'
          }}
        >
          {/* Building Tour Scheduling Card */}
          <div className="bg-white text-center flex flex-col p-4 items-center justify-center w-full mx-auto shadow-lg rounded-lg border border-gray-300">
            <h2 className="text-xl font-space-grotesk font-extrabold mb-1" style={{ color: '#293056' }}>Schedule a building tour</h2>
            <p className="text-gray-700 text-sm mt-1 mb-2">Visit the building amenities</p>

            {/* Date Navigation */}
            <div className="flex gap-3 mb-3">
              <button 
                onClick={goToPrevDate}
                disabled={currentDateIndex === 0}
                className="p-3 rounded-lg border border-gray-400 bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg width="26px" height="26px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15,18 9,12 15,6"></polyline>
                </svg>
              </button>

              <div className="flex-1 flex justify-center">
                <div className="flex justify-center gap-2">
                  {/* Date Slot 1 */}
                  <div 
                    onClick={() => setSelectedDateSlot(0)}
                    className={`w-[77px] h-[108px] shadow-lg p-2 rounded-lg text-center border-2 cursor-pointer ${
                      selectedDateSlot === 0 
                        ? 'bg-blue-50 border-blue-500' 
                        : 'bg-gray-50 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <p className="uppercase text-sm text-gray-500">{currentDates[0]?.day}</p>
                    <p className="text-xl font-bold my-1">{currentDates[0]?.dayNum}</p>
                    <p className="uppercase text-sm text-gray-500">{currentDates[0]?.month}</p>
                  </div>

                  {/* Date Slot 2 */}
                  <div 
                    onClick={() => setSelectedDateSlot(1)}
                    className={`w-[77px] h-[108px] shadow-lg p-2 rounded-lg text-center border-2 cursor-pointer ${
                      selectedDateSlot === 1 
                        ? 'bg-blue-50 border-blue-500' 
                        : 'bg-gray-50 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <p className="uppercase text-sm text-gray-500">{currentDates[1]?.day}</p>
                    <p className="text-xl font-bold my-1">{currentDates[1]?.dayNum}</p>
                    <p className="uppercase text-sm text-gray-500">{currentDates[1]?.month}</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={goToNextDate}
                disabled={currentDateIndex >= dates.length - 2}
                className="p-3 rounded-lg border border-gray-400 bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg width="26px" height="26px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
              </button>
            </div>

            {/* Time Selection */}
            <div className="grid grid-cols-3 my-3 gap-2">
              {[
                { key: 'morning', label: 'Morning', range: '9AM TO 12PM' },
                { key: 'afternoon', label: 'Afternoon', range: '12PM TO 4PM' },
                { key: 'evening', label: 'Evening', range: '4PM TO 8PM' }
              ].map((timeSlot) => (
                <div
                  key={timeSlot.key}
                  onClick={() => setSelectedTime(timeSlot.key)}
                  className={`w-[91px] h-[55px] shadow-lg p-1 rounded-lg cursor-pointer border-2 ${
                    selectedTime === timeSlot.key
                      ? 'bg-blue-50 border-blue-500'
                      : 'bg-gray-50 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <p className="text-center text-sm font-medium">{timeSlot.label}</p>
                  <p className="text-center text-xs mt-1 text-gray-500">{timeSlot.range}</p>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-lg mb-4 font-medium border-none cursor-pointer hover:opacity-90 transition-opacity"
              style={{ backgroundColor: buttonTertiaryBg, color: buttonTertiaryText }}
            >
              Request Building Tour
            </button>

            <div className="text-center text-gray-500 my-3">
              <p>OR</p>
            </div>

            <button 
              onClick={() => setIsQuestionModalOpen(true)}
              className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg font-medium cursor-pointer hover:bg-gray-50"
            >
              Ask About Building
            </button>
          </div>
        </div>
      </div>

      {/* Building Tour Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999999] bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={handleModalClick}>
          {/* Modal Content */}
          <div className="relative bg-white p-6 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold" style={{ color: '#293056' }}>Request a Building Tour</h3>
              <button
                onClick={closeModal}
                className="text-gray-500 bg-transparent border-none text-2xl font-bold cursor-pointer absolute top-4 right-6 w-8 h-8 rounded flex items-center justify-center p-0 leading-none transition-colors hover:text-gray-800 hover:bg-gray-100 focus:outline-2 focus:outline-blue-500 focus:outline-offset-2"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="mb-4 space-y-2">
              <p className="text-gray-500">
                You've selected: <span className="font-medium">{getSelectedDateTime()}</span>
              </p>
              {buildingData && (
                <p className="text-gray-600 text-sm">
                  Building: <span className="font-medium">
                    {(() => {
                      // Format address with & between street addresses
                      if (buildingData?.street_address_1 && buildingData?.street_address_2) {
                        return `${buildingData.street_address_1} & ${buildingData.street_address_2} ${buildingData?.city || ''} ${buildingData?.province || ''}`.trim();
                      }
                      // Fallback to full_address or address
                      return buildingData?.full_address ||
                             `${buildingData?.address || ''} ${buildingData?.city || ''} ${buildingData?.province || ''}`.trim() ||
                             buildingData?.name || 'Building';
                    })()}
                  </span>
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="phone" className="block text-gray-700 mb-1 font-medium">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="message" className="block text-gray-700 mb-1 font-medium">Additional Notes (Optional)</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm resize-y min-h-[80px] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Any specific requirements or questions about the building..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-lg font-medium border-none cursor-pointer transition-opacity ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                }`}
                style={{ backgroundColor: buttonTertiaryBg, color: buttonTertiaryText }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Confirm Building Tour Request'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Question Modal */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-[999999] bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={handleQuestionModalClick}>
          {/* Modal Content */}
          <div className="relative bg-white p-6 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold" style={{ color: '#293056' }}>Ask About Building</h3>
              <button
                onClick={closeQuestionModal}
                className="text-gray-500 bg-transparent border-none text-2xl font-bold cursor-pointer absolute top-4 right-6 w-8 h-8 rounded flex items-center justify-center p-0 leading-none transition-colors hover:text-gray-800 hover:bg-gray-100 focus:outline-2 focus:outline-blue-500 focus:outline-offset-2"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <p className="mb-4 text-gray-500">
              Have questions about this building? Our agent will get back to you within 24 hours.
            </p>

            <form onSubmit={handleQuestionSubmit}>
              <div className="mb-4">
                <label htmlFor="questionName" className="block text-gray-700 mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  id="questionName"
                  name="name"
                  value={questionFormData.name}
                  onChange={handleQuestionInputChange}
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="questionEmail" className="block text-gray-700 mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  id="questionEmail"
                  name="email"
                  value={questionFormData.email}
                  onChange={handleQuestionInputChange}
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="questionPhone" className="block text-gray-700 mb-1 font-medium">Phone Number</label>
                <input
                  type="tel"
                  id="questionPhone"
                  name="phone"
                  value={questionFormData.phone}
                  onChange={handleQuestionInputChange}
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="question" className="block text-gray-700 mb-1 font-medium">Your Question</label>
                <textarea
                  id="question"
                  name="question"
                  value={questionFormData.question}
                  onChange={handleQuestionInputChange}
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm resize-y min-h-[100px] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="What would you like to know about this building?"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-lg font-medium border-none cursor-pointer hover:opacity-90 transition-opacity"
                style={{ backgroundColor: buttonTertiaryBg, color: buttonTertiaryText }}
              >
                Send Question
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default BuildingTourScheduling;