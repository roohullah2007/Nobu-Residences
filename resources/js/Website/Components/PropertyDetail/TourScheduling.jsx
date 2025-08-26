import React, { useState, useEffect, useRef } from 'react';

const TourSchedulingComponent = () => {
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  const [selectedDateSlot, setSelectedDateSlot] = useState(1); // 0 for first slot, 1 for second slot
  const [selectedTime, setSelectedTime] = useState('afternoon');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scrollState, setScrollState] = useState('static'); // 'static', 'fixed', 'absolute'
  const [absoluteTop, setAbsoluteTop] = useState(0);
  
  const rightColumnRef = useRef(null);
  const contentRef = useRef(null);
  const placeholderRef = useRef(null);
  const initialTopRef = useRef(null);
  const containerLeftRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
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
      const rightColumnElement = rightColumnRef.current;
      
      if (!contentElement || !rightColumnElement) return;
      
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      const navbarHeight = 130; // Height of navbar + buffer
      
      // Store initial position and container left position
      if (initialTopRef.current === null) {
        const rect = rightColumnElement.getBoundingClientRect();
        initialTopRef.current = rect.top + scrollPosition;
        containerLeftRef.current = rect.left;
      }
      
      const initialTop = initialTopRef.current;
      
      // Find the description section (Real Estate Links)
      const descriptionSection = document.querySelector('.description');
      let stopScrollPosition = 0;
      
      if (descriptionSection) {
        const descRect = descriptionSection.getBoundingClientRect();
        stopScrollPosition = descRect.top + scrollPosition;
      } else {
        // Fallback: find footer as stop point
        const footer = document.querySelector('footer');
        if (footer) {
          const footerRect = footer.getBoundingClientRect();
          stopScrollPosition = footerRect.top + scrollPosition;
        }
      }
      
      // Calculate component height and stop position
      const componentHeight = contentElement.offsetHeight;
      // Stop position should be where bottom of tour component meets top of description section
      const stopPosition = stopScrollPosition - componentHeight - navbarHeight - 20; // 20px buffer
      
      const scrollTriggerPosition = initialTop - navbarHeight;
      
      if (scrollPosition <= scrollTriggerPosition) {
        // Before scroll trigger - static position
        setScrollState('static');
        setAbsoluteTop(0);
      } else if (scrollPosition > scrollTriggerPosition && scrollPosition < stopPosition) {
        // Between trigger and stop - fixed position
        setScrollState('fixed');
        setAbsoluteTop(0);
      } else {
        // After stop position - absolute position
        setScrollState('absolute');
        // Calculate absolute position relative to parent container
        const absolutePositionTop = stopPosition - initialTop + navbarHeight;
        setAbsoluteTop(absolutePositionTop);
      }
    };

    // Initial call to set position
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    
    // Handle resize separately to reset initial position
    const handleResize = () => {
      initialTopRef.current = null;
      containerLeftRef.current = null;
      handleScroll();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      initialTopRef.current = null;
      containerLeftRef.current = null;
    };
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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
  
  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // ESC key handler
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isModalOpen]);

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
          className={`w-full flex-shrink-0 ${scrollState === 'fixed' || scrollState === 'absolute' ? 'block' : 'hidden'}`}
          style={{ height: contentRef.current?.offsetHeight || 'auto' }}
        />

        {/* Content */}
        <div 
          ref={contentRef}
          className={`flex flex-col gap-2 w-full max-w-[309px] min-w-[309px] transition-all duration-300 ${
            scrollState === 'fixed' ? 'fixed z-40' : 
            scrollState === 'absolute' ? 'absolute z-40' : ''
          }`}
          style={{
            top: scrollState === 'fixed' ? '130px' : 
                 scrollState === 'absolute' ? `${absoluteTop}px` : 'auto',
            left: scrollState === 'fixed' || scrollState === 'absolute'
              ? containerLeftRef.current || 0 
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

            <button className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg font-medium mt-3 cursor-pointer hover:bg-gray-50">
              Ask A Question
            </button>

            {/* Agent Info Section */}
            <div className="mt-6 pt-6 border-t border-gray-200 w-full">
              <div className="flex items-center mb-4 justify-around">
                <img 
                  src="/assets/jatin-gill.png" 
                  alt="Agent" 
                  className="w-14 h-14 rounded-full mr-4"
                />
                <div>
                  <h3 className="font-bold mb-1" style={{ color: '#293056' }}>Jatin Gill</h3>
                  <p className="text-gray-500 text-sm mb-1">Nobu Residences</p>
                  <p className="text-gray-700 text-sm">647-490-1532</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tour Request Modal */}
      {isModalOpen && (
        <div 
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-[999999]"
          onClick={handleModalClick}
        >
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 relative z-[999999]">
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
    </>
  );
};

export default TourSchedulingComponent;