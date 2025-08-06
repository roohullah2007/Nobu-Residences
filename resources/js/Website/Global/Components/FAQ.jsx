import React, { useState } from 'react';

/**
 * Global FAQ Component
 * Reusable across Home page, Property Detail, and other pages
 */
const FAQ = ({ 
  faqItems = null, 
  title = 'FAQs',
  className = '',
  containerClassName = 'md:py-8 bg-white',
  showContainer = true
}) => {
  // Default FAQ data if none provided
  const defaultFAQs = [
    {
      id: 1,
      question: 'The expense windows adapted sir. Wrong widen drawn.',
      answer: 'Offending belonging promotion provision an be oh consulted ourselves it. Blessing welcomed ladyship she met humoured sir breeding her.'
    },
    {
      id: 2,
      question: 'Six curiosity day assurance bed necessary?',
      answer: 'Six curiosity day assurance bed necessary? Living in this Banbury | Don Mills condo offers convenience and comfort.'
    },
    {
      id: 3,
      question: 'What are the nearby amenities?',
      answer: 'This property offers easy access to restaurants, shopping, and transportation. Tim Hortons is within a 3-minute walk, and Don Valley Parkway is accessible within 4 minutes by car.'
    },
    {
      id: 4,
      question: 'What makes this location special?',
      answer: 'The Banbury | Don Mills neighbourhood offers a perfect blend of urban convenience and suburban tranquility, with excellent transit connections and nearby amenities.'
    }
  ];

  const faqs = faqItems || defaultFAQs;
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleAccordion(index);
    }
  };

  // Plus icon component
  const PlusIcon = ({ isRotated }) => (
    <svg 
      className={`md:w-8 md:h-8 w-7 h-7 text-gray-400 transition-transform duration-200 ease-in-out flex-shrink-0 ml-auto ${
        isRotated ? 'transform rotate-45 text-gray-500' : ''
      }`}
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="2" 
        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
      />
    </svg>
  );

  // FAQ Content
  const FAQContent = () => (
    <div className={`mx-auto max-w-[1280px] ${className}`}>
      <div className="md:my-4 my-3 mx-auto">
        {/* FAQ Title */}
        <h2 className="md:text-xl text-lg font-bold md:mb-3 mb-2.5 text-black leading-5 font-space-grotesk tracking-tight">
          {title}
        </h2>
        
        {/* Accordion Container */}
        <div className="flex flex-col md:gap-4 gap-3">
          {faqs.map((faq, index) => {
            const isActive = activeIndex === index;
            
            return (
              <div 
                key={faq.id || index} 
                className={`bg-white border border-gray-300 rounded-lg overflow-hidden transition-shadow duration-200 hover:shadow-sm ${
                  isActive ? 'shadow-sm bg-gray-50' : ''
                }`}
              >
                {/* Accordion Button */}
                <button
                  className={`flex justify-between items-center w-full md:p-4 p-3.5 text-left text-gray-900 font-semibold md:text-base text-sm bg-transparent border-0 cursor-pointer transition-all duration-200 outline-none font-work-sans normal-case tracking-normal no-underline shadow-none rounded-none appearance-none hover:bg-gray-50 focus:outline-2 focus:outline-blue-500 focus:-outline-offset-2 focus:bg-gray-50 ${
                    isActive ? 'bg-gray-50 text-black' : ''
                  }`}
                  onClick={() => toggleAccordion(index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  aria-expanded={isActive}
                  aria-controls={`accordion-${index}`}
                >
                  <span className="flex-grow text-left mr-4 md:overflow-hidden md:text-ellipsis md:whitespace-nowrap md:max-w-[calc(100%-44px)]">
                    {faq.question}
                  </span>
                  <PlusIcon isRotated={isActive} />
                </button>
                
                {/* Accordion Content */}
                <div 
                  id={`accordion-${index}`}
                  className={`overflow-hidden transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) ${
                    isActive ? 'md:max-h-48 max-h-96' : 'max-h-0'
                  }`}
                  role="region"
                  aria-labelledby={`accordion-button-${index}`}
                >
                  <div className="md:p-4 p-3.5 text-gray-600">
                    <p className="mb-0 leading-6 text-base font-normal">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Return with or without section wrapper based on showContainer prop
  if (showContainer) {
    return (
      <section className={containerClassName}>
        <FAQContent />
      </section>
    );
  }

  return <FAQContent />;
};

export default FAQ;