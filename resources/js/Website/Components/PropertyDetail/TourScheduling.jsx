import React, { useState, useEffect, useRef } from 'react';

const TourSchedulingComponent = ({ website }) => {
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  const [selectedDateSlot, setSelectedDateSlot] = useState(1); // 0 for first slot, 1 for second slot
  const [selectedTime, setSelectedTime] = useState('afternoon');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  
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

  // Generate dates array
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
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
      const descriptionElement = document.querySelector('.description');
      let realEstateSectionTop = 0;
      
      if (descriptionElement) {
        realEstateSectionTop = descriptionElement.getBoundingClientRect().top + scrollPosition;
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
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const selectedDate = dates[currentDateIndex + selectedDateSlot];
    const tourRequest = {
      date: selectedDate.date,
      time: selectedTime,
      ...formData
    };
    
    console.log('Tour Request:', tourRequest);
    
    // Reset form and close modal
    setFormData({ name: '', email: '', phone: '', message: '' });
    setIsModalOpen(false);
    
    alert('Your tour request has been submitted successfully!');
  };

  // Handle question form submission
  const handleQuestionSubmit = (e) => {
    e.preventDefault();
    
    console.log('Question Request:', questionFormData);
    
    // Reset form and close modal
    setQuestionFormData({ name: '', email: '', phone: '', question: '' });
    setIsQuestionModalOpen(false);
    
    alert('Your question has been submitted successfully! We will get back to you soon.');
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
          {/* Tour Scheduling Card */}
          <div className="bg-white text-center flex flex-col p-4 items-center justify-center w-full mx-auto shadow-lg rounded-lg border border-gray-300">
            <h2 className="text-xl font-space-grotesk font-extrabold mb-1" style={{ color: '#293056' }}>Schedule a tour</h2>
            <p className="text-gray-700 text-sm mt-1 mb-2">Tour with a buyer's agent</p>

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
              className="w-full bg-black text-white py-2.5 px-4 rounded-lg mb-4 font-medium border-none cursor-pointer hover:bg-gray-800"
            >
              Request A Tour
            </button>

            <div className="text-center text-gray-500 my-3">
              <p>OR</p>
            </div>

            <button 
              onClick={() => setIsQuestionModalOpen(true)}
              className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg font-medium mt-3 cursor-pointer hover:bg-gray-50"
            >
              Ask A Question
            </button>

            {/* Agent Info Section */}
            <div className="mt-6 pt-6 border-t border-gray-200 w-full">
              <div className="flex items-center mb-4 justify-around">
                <img 
                  src={website?.contact_info?.agent?.image || "/assets/jatin-gill.png"} 
                  alt={website?.contact_info?.agent?.name || "Agent"} 
                  className="w-14 h-14 rounded-full mr-4 object-cover"
                />
                <div>
                  <h3 className="font-bold mb-1" style={{ color: '#293056' }}>{website?.contact_info?.agent?.name || 'Jatin Gill'}</h3>
                  <p className="text-gray-500 text-sm mb-1">{website?.contact_info?.agent?.brokerage || 'Nobu Residences'}</p>
                  <p className="text-gray-700 text-sm">{website?.contact_info?.agent?.phone || '647-490-1532'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tour Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center">
          {/* Overlay - Full screen without any gaps */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={handleModalClick}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white p-6 rounded-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold" style={{ color: '#293056' }}>Request a Tour</h3>
              <button
                onClick={closeModal}
                className="text-gray-500 bg-transparent border-none text-2xl font-bold cursor-pointer absolute top-4 right-6 w-8 h-8 rounded flex items-center justify-center p-0 leading-none transition-colors hover:text-gray-800 hover:bg-gray-100 focus:outline-2 focus:outline-blue-500 focus:outline-offset-2"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <p className="mb-4 text-gray-500">
              You've selected: <span className="font-medium">{getSelectedDateTime()}</span>
            </p>

            <div>
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
                  placeholder="Any specific requirements or questions..."
                />
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium border-none cursor-pointer hover:bg-gray-800"
              >
                Confirm Tour Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Modal */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center">
          {/* Overlay - Full screen without any gaps */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={handleQuestionModalClick}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white p-6 rounded-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold" style={{ color: '#293056' }}>Ask A Question</h3>
              <button
                onClick={closeQuestionModal}
                className="text-gray-500 bg-transparent border-none text-2xl font-bold cursor-pointer absolute top-4 right-6 w-8 h-8 rounded flex items-center justify-center p-0 leading-none transition-colors hover:text-gray-800 hover:bg-gray-100 focus:outline-2 focus:outline-blue-500 focus:outline-offset-2"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <p className="mb-4 text-gray-500">
              Have questions about this property? Our agent will get back to you within 24 hours.
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
                  placeholder="What would you like to know about this property?"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium border-none cursor-pointer hover:bg-gray-800"
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

export default TourSchedulingComponent;