import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Close, Heart } from '@/Website/Components/Icons';

export default function PropertyGallery({ 
  propertyImages, 
  propertyData, 
  isFavorited, 
  onToggleFavorite 
}) {
  const [showModal, setShowModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [currentMobileSlide, setCurrentMobileSlide] = useState(0);

  const openModal = (imageIndex = 0) => {
    setModalImageIndex(imageIndex);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    document.body.style.overflow = 'unset';
  };

  const nextModalImage = () => {
    setModalImageIndex((prev) => (prev + 1) % propertyImages.length);
  };

  const prevModalImage = () => {
    setModalImageIndex((prev) => (prev - 1 + propertyImages.length) % propertyImages.length);
  };

  const changeMobileSlide = (direction) => {
    if (direction === 'next') {
      setCurrentMobileSlide((prev) => (prev + 1) % propertyImages.length);
    } else {
      setCurrentMobileSlide((prev) => (prev - 1 + propertyImages.length) % propertyImages.length);
    }
  };

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (showModal) {
        if (e.key === 'ArrowLeft') prevModalImage();
        if (e.key === 'ArrowRight') nextModalImage();
        if (e.key === 'Escape') closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showModal]);

  return (
    <>
      {/* Main Container */}
      <div className="max-w-[1280px] mx-auto px-0 py-0">
        <div className="flex flex-col md:flex-row gap-0 lg:gap-[17px]">
          {/* Images Section */}
          <div className="flex gap-0 md:gap-[17px] flex-1 order-1 lg:order-none">
            {/* Main Large Image - Desktop Only */}
            <div className="hidden lg:block relative w-[619px] h-[645px] flex-shrink-0">
              <div 
                className="relative w-full h-full rounded-xl overflow-hidden cursor-pointer group"
                onClick={() => openModal(0)}
              >
                <img 
                  src={propertyImages[0]}
                  alt="Main property image"
                  className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-10"></div>
              </div>
            </div>
            
            {/* Small Images Column - Hidden on Mobile */}
            <div className="hidden md:flex lg:flex justify-between flex-col w-full md:w-[318px] h-auto md:h-[645px] gap-2 md:gap-0">
              {/* Small Image 1 */}
              <div className="relative w-full md:w-[318px] h-[200px] md:h-[310px]">
                <div 
                  className="relative w-full h-full rounded-xl overflow-hidden cursor-pointer group"
                  onClick={() => openModal(1)}
                >
                  <img 
                    src={propertyImages[1]}
                    alt="Property image 2"
                    className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                </div>
              </div>
              
              {/* Small Image 2 with See All Photos Button */}
              <div className="relative w-full md:w-[318px] h-[200px] md:h-[310px]">
                <div 
                  className="relative w-full h-full rounded-xl overflow-hidden cursor-pointer group"
                  onClick={() => openModal(2)}
                >
                  <img 
                    src={propertyImages[2]}
                    alt="Property image 3"
                    className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  
                  {/* See All Photos Button - Hidden on Mobile */}
                  <div className="hidden md:block absolute bottom-4 right-4">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(0);
                      }}
                      className="flex justify-center items-center w-[129px] h-10 bg-black rounded-xl text-white font-work-sans font-bold text-sm hover:bg-gray-800 transition-colors"
                    >
                      See all photos
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Gallery - Tablet and Mobile Only */}
            <div className="lg:hidden relative w-full h-[300px] md:h-[400px] rounded-none md:rounded-xl overflow-hidden">
              <div className="relative w-full h-full">
                {propertyImages.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-300 ${
                      index === currentMobileSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <img 
                      src={image}
                      alt={`Property image ${index + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                ))}
                
                {/* Mobile Navigation */}
                <button 
                  onClick={() => changeMobileSlide('prev')}
                  className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-all duration-300"
                >
                  <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                
                <button 
                  onClick={() => changeMobileSlide('next')}
                  className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-all duration-300"
                >
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                
                {/* Mobile Counter */}
                <div className="absolute bottom-3 md:bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                  {currentMobileSlide + 1} / {propertyImages.length}
                </div>
              </div>
            </div>
          </div>
          
          {/* Property Details Card */}
          <div className="w-full lg:w-[309px] h-auto lg:h-[645px] bg-white border-0 lg:border border-gray-200 rounded-none lg:rounded-xl flex-shrink-0 order-2 lg:order-none mt-[70px] md:mt-5 lg:mt-0">
            <div className="flex flex-col justify-between p-4 md:p-6 h-full min-h-[500px] lg:min-h-0">
              <div className="flex flex-col gap-6 md:gap-8 lg:gap-10 mb-[30px] md:mb-0">
                {/* SOLD FOR Section */}
                <div className="flex flex-col gap-2 items-center">
                  <div className="flex flex-col md:flex-row gap-2 md:gap-3 items-center justify-between md:justify-center w-full">
                    <span className="font-space-grotesk font-bold text-xl md:text-2xl leading-7 md:leading-[34px] uppercase text-[#93370D]">
                      SOLD FOR
                    </span>
                    <span className="font-space-grotesk font-bold text-xl md:text-2xl leading-7 md:leading-[34px] uppercase text-[#93370D]">
                      {propertyData.soldFor}
                    </span>
                  </div>
                  <div className="font-work-sans font-medium text-sm text-[#535862] text-center">
                    {propertyData.listedFor}
                  </div>
                  <div className="w-full h-px border-t border-[#D5D7DA]"></div>
                </div>
                
                {/* Properties Details Section */}
                <div className="flex flex-col gap-4 md:gap-6">
                  <h3 className="font-red-hat font-bold text-lg md:text-xl text-[#252B37]">
                    Properties detail
                  </h3>
                  
                  <div className="flex flex-col gap-4 md:gap-6">
                    {Object.entries(propertyData.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center gap-3 w-full">
                        <span className="font-work-sans font-normal text-sm md:text-base leading-5 md:leading-[25px] text-[#252B37] tracking-tight capitalize break-words">
                          {key === 'maintenanceFees' ? 'Maintenance Fees' : 
                           key === 'propertyTaxes' ? 'Property Taxes' : 
                           key === 'area' ? 'Square Feet' :
                           key}
                        </span>
                        <span className="font-work-sans font-normal text-sm md:text-base leading-5 md:leading-[25px] text-[#252B37] tracking-tight text-right break-words">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Call us Button */}
              <div className="bg-black rounded-full h-12 md:h-10 flex items-center justify-center w-full">
                <button className="w-full h-full flex items-center justify-center">
                  <span className="font-work-sans font-extrabold text-sm md:text-base text-white">
                    Call us
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Gallery Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col">
          {/* Modal Header */}
          <div className="bg-black bg-opacity-90 px-4 py-3 flex justify-between items-center border-b border-white border-opacity-10 flex-shrink-0">
            <div className="text-white flex flex-col gap-1">
              <span className="font-semibold text-sm">{propertyData.address}</span>
              <span className="text-white text-opacity-70 text-xs">
                ({modalImageIndex + 1} of {propertyImages.length})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={onToggleFavorite}
                className="text-white bg-white bg-opacity-10 border border-white border-opacity-20 rounded-md p-2 w-10 h-10 flex items-center justify-center hover:bg-opacity-20 transition-colors"
              >
                <Heart className="w-5 h-5" filled={isFavorited} />
              </button>
              <button 
                onClick={closeModal}
                className="text-white bg-white bg-opacity-10 border border-white border-opacity-20 rounded-md p-2 w-10 h-10 flex items-center justify-center hover:bg-opacity-20 transition-colors"
              >
                <Close className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Image Area */}
          <div className="flex-1 flex items-center justify-center relative overflow-hidden min-h-0">
            <button 
              onClick={prevModalImage}
              disabled={modalImageIndex === 0}
              className="absolute left-3 z-10 bg-white bg-opacity-90 border-none rounded-full w-10 h-10 flex items-center justify-center cursor-pointer top-1/2 transform -translate-y-1/2 hover:bg-white hover:scale-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="w-full h-full flex items-center justify-center overflow-hidden px-16">
              <div 
                className="flex h-full w-full transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${modalImageIndex * 100}%)` }}
              >
                {propertyImages.map((image, index) => (
                  <div key={index} className="min-w-full flex items-center justify-center p-4">
                    <img 
                      src={image}
                      alt={`Property image ${index + 1}`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              onClick={nextModalImage}
              disabled={modalImageIndex === propertyImages.length - 1}
              className="absolute right-3 z-10 bg-white bg-opacity-90 border-none rounded-full w-10 h-10 flex items-center justify-center cursor-pointer top-1/2 transform -translate-y-1/2 hover:bg-white hover:scale-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Thumbnail Navigation */}
          <div className="flex gap-2 px-4 py-3 bg-black bg-opacity-90 border-t border-white border-opacity-10 overflow-x-auto">
            {propertyImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setModalImageIndex(index)}
                className={`border-2 rounded-md overflow-hidden opacity-70 flex-shrink-0 transition-all hover:opacity-90 ${
                  index === modalImageIndex 
                    ? 'border-blue-500 opacity-100 scale-105' 
                    : 'border-white border-opacity-20'
                }`}
              >
                <img 
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-20 h-15 object-cover block"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
