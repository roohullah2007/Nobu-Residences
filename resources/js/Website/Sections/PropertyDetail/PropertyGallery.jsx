import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Close, Heart } from '@/Website/Components/Icons';
import { Link } from '@inertiajs/react';
import PropertyEnquiryModal from '@/Website/Components/PropertyEnquiryModal';

export default function PropertyGallery({ 
  propertyImages, 
  propertyData, 
  auth,
  onLoginClick 
}) {
  const [showModal, setShowModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [currentMobileSlide, setCurrentMobileSlide] = useState(0);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);


  // Ensure we have valid images array with fallback
  const processImages = () => {
    let images = [];

    // First check if propertyData has Images field
    const dataImages = propertyData?.Images || propertyData?.images || propertyData?.ImageObjects;
    const imagesToProcess = propertyImages || dataImages || [];

    // Handle different image data structures
    if (Array.isArray(imagesToProcess)) {
      images = imagesToProcess.filter(img => {
        // Handle both string URLs and objects with MediaURL property
        const url = typeof img === 'string' ? img : (img?.MediaURL || img?.url || img?.URL || img?.src || img?.MediaUrl);
        const isValid = url && url.trim() !== '' && url !== 'undefined' && url !== 'null';

        return isValid;
      }).map(img => {
        let url = typeof img === 'string' ? img : (img?.MediaURL || img?.url || img?.URL || img?.src || img?.MediaUrl);
        const originalUrl = url;

        // Clean up the URL
        if (url && typeof url === 'string') {
          // Remove any duplicate slashes except for http://
          url = url.replace(/([^:]\/)\/+/g, "$1");

          // Handle AMPRE CDN URLs - convert HTTPS to HTTP to avoid SSL issues
          if (url.includes('ampre.ca')) {
            // Always ensure HTTP for AMPRE URLs, even if already HTTP
            if (url.startsWith('https://')) {
              url = url.replace('https://', 'http://');
              console.log('🖼️ Converted AMPRE HTTPS to HTTP:', originalUrl, '->', url);
            } else if (!url.startsWith('http://') && !url.startsWith('//')) {
              // If it's a relative AMPRE URL, make it absolute with HTTP
              url = 'http://' + (url.startsWith('/') ? url.substring(1) : url);
              console.log('🖼️ Made AMPRE URL absolute:', originalUrl, '->', url);
            }
          }

          // Ensure URL is absolute
          if (!url.startsWith('http') && !url.startsWith('//')) {
            // If it's a relative URL, prepend the base URL
            url = window.location.origin + (url.startsWith('/') ? '' : '/') + url;
          }
        }

        return url;
      });
    }

    // If we only have one image or no images, check if propertyData has a main image
    if (images.length <= 1) {
      const mainImage = propertyData?.mainImage || propertyData?.main_image || propertyData?.MediaURL;
      if (mainImage && !images.includes(mainImage)) {
        images.unshift(mainImage); // Add main image as first
      }
    }

    // Remove duplicates
    const uniqueImages = [...new Set(images)];

    // NO FALLBACK IMAGES - only use real property images
    if (uniqueImages.length === 0) {
      return [];
    }

    return uniqueImages;
  };

  const images = processImages();

  const openModal = (imageIndex = 0) => {
    // Don't open modal if no images are available
    if (images.length === 0) {
      console.log('🖼️ Cannot open modal - no images available');
      return;
    }

    // Ensure the imageIndex is within bounds
    const safeIndex = Math.max(0, Math.min(imageIndex, images.length - 1));
    setModalImageIndex(safeIndex);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    document.body.style.overflow = 'unset';
  };

  // Ensure scroll is disabled when modal opens and enabled when it closes
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  const nextModalImage = () => {
    setModalImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevModalImage = () => {
    setModalImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const changeMobileSlide = (direction) => {
    if (direction === 'next') {
      setCurrentMobileSlide((prev) => (prev + 1) % images.length);
    } else {
      setCurrentMobileSlide((prev) => (prev - 1 + images.length) % images.length);
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

  // Helper function to format price
  const formatPrice = (price) => {
    if (!price || price === 0) return '$0';
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Get the status of the property
  const getPropertyStatus = () => {
    // Check various status fields from API
    const status = propertyData?.StandardStatus || propertyData?.standardStatus || 
                   propertyData?.MlsStatus || propertyData?.mlsStatus || 
                   propertyData?.status || 'Active';
    
    // Check if property is sold
    if (status.toLowerCase().includes('sold') || propertyData?.ClosePrice || propertyData?.closePrice || propertyData?.soldPrice) {
      return 'SOLD FOR';
    }
    
    // Check transaction type
    const transactionType = propertyData?.TransactionType || propertyData?.transactionType || '';
    if (transactionType.toLowerCase().includes('lease')) {
      return 'FOR LEASE';
    }
    if (transactionType.toLowerCase().includes('rent')) {
      return 'FOR RENT';
    }
    
    return 'FOR SALE';
  };

  // Get the price to display based on status
  const getDisplayPrice = () => {
    const status = getPropertyStatus();
    
    if (status === 'SOLD FOR') {
      // For sold properties, show sold price
      if (propertyData?.ClosePrice) return formatPrice(propertyData.ClosePrice);
      if (propertyData?.closePrice) return formatPrice(propertyData.closePrice);
      if (propertyData?.soldPrice) return formatPrice(propertyData.soldPrice);
      if (propertyData?.soldFor) return propertyData.soldFor;
    }
    
    // For active listings, show list price
    if (propertyData?.ListPrice) return formatPrice(propertyData.ListPrice);
    if (propertyData?.listPrice) return formatPrice(propertyData.listPrice);
    if (propertyData?.price) return formatPrice(propertyData.price);
    
    return 'Price on request';
  };

  // Handle image loading errors - NO FALLBACK IMAGES
  const handleImageError = (e, fallbackIndex = 0) => {
    console.log('🖼️ Image failed to load:', e.target.src);

    // Try HTTP version if HTTPS fails for AMPRE images
    if (e.target.src.includes('ampre.ca') && e.target.src.startsWith('https://')) {
      console.log('🖼️ Trying HTTP version for AMPRE image');
      e.target.src = e.target.src.replace('https://', 'http://');
      return;
    }

    // Hide the broken image by setting display to none
    e.target.style.display = 'none';
    // Prevent infinite error loop
    e.target.onerror = null;
    console.log('🖼️ Hidden broken image:', e.target.src);
  };

  // Check if user is logged in
  const isLoggedIn = auth?.user ? true : false;

  return (
    <>
      {/* Main Container */}
      <div className="max-w-[1280px] mx-auto px-0 py-0">
        <div className="flex flex-col md:flex-row gap-0 lg:gap-[17px]">
          {/* Images Section */}
          <div className="flex gap-0 md:gap-[17px] flex-1 order-1 lg:order-none relative">
            {/* Main Large Image - Desktop Only */}
            <div className="hidden lg:block relative w-[619px] h-[645px] flex-shrink-0">
              {images.length > 0 ? (
                <div
                  className="relative w-full h-full rounded-xl overflow-hidden cursor-pointer group"
                  onClick={() => isLoggedIn && openModal(0)}
                >
                  <img
                    src={(function() {
                      let url = images[0];
                      if (url && url.includes && url.includes('ampre.ca') && url.startsWith('https://')) {
                        return url.replace('https://', 'http://');
                      }
                      return url;
                    })()}
                    alt="Main property image"
                    className={`w-full h-full object-cover object-center transition-transform duration-300 ${isLoggedIn ? 'group-hover:scale-105' : 'blur-lg'}`}
                    onError={handleImageError}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-10"></div>

                  {/* Login Overlay for Main Image */}
                  {!isLoggedIn && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                      <div className="bg-white rounded-xl p-6 max-w-sm mx-4 text-center shadow-2xl">
                        <h3 className="text-xl font-bold text-[#293056] mb-2">
                          Sign in to view photos
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                          Create a free account to see all property images and details
                        </p>
                        <div className="flex flex-col gap-3">
                          <button
                            onClick={() => onLoginClick && onLoginClick()}
                            className="block w-full py-2.5 px-4 bg-[#293056] text-white rounded-lg font-medium hover:bg-[#1f2441] transition-colors"
                          >
                            Sign In
                          </button>
                          <button
                            onClick={() => onLoginClick && onLoginClick()}
                            className="block w-full py-2.5 px-4 border border-[#293056] text-[#293056] rounded-lg font-medium hover:bg-gray-50 transition-colors"
                          >
                            Create Account
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative w-full h-full rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">No images available</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Small Images Column - Hidden on Mobile */}
            <div className="hidden md:flex lg:flex justify-between flex-col w-full md:w-[318px] h-auto md:h-[645px] gap-2 md:gap-0">
              {/* Small Image 1 */}
              <div className="relative w-full md:w-[318px] h-[200px] md:h-[310px]">
                <div 
                  className="relative w-full h-full rounded-xl overflow-hidden cursor-pointer group"
                  onClick={() => isLoggedIn && openModal(1)}
                >
                  <img 
                    src={(function() {
                      let url = images[1] || images[0];
                      if (url && url.includes && url.includes('ampre.ca') && url.startsWith('https://')) {
                        return url.replace('https://', 'http://');
                      }
                      return url;
                    })()}
                    alt="Property image 2"
                    className={`w-full h-full object-cover object-center transition-transform duration-300 ${isLoggedIn ? 'group-hover:scale-105' : 'blur-lg'}`}
                    onError={(e) => handleImageError(e, 1)}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  
                  {/* Login Overlay for Small Image 1 */}
                  {!isLoggedIn && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                      <button
                        onClick={() => onLoginClick && onLoginClick()}
                        className="px-4 py-2 bg-white/90 backdrop-blur text-[#293056] rounded-lg font-medium hover:bg-white transition-colors text-sm"
                      >
                        Sign In
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Small Image 2 with See All Photos Button */}
              <div className="relative w-full md:w-[318px] h-[200px] md:h-[310px]">
                <div 
                  className="relative w-full h-full rounded-xl overflow-hidden cursor-pointer group"
                  onClick={() => isLoggedIn && openModal(2)}
                >
                  <img 
                    src={(function() {
                      let url = images[2] || images[1] || images[0];
                      if (url && url.includes && url.includes('ampre.ca') && url.startsWith('https://')) {
                        return url.replace('https://', 'http://');
                      }
                      return url;
                    })()}
                    alt="Property image 3"
                    className={`w-full h-full object-cover object-center transition-transform duration-300 ${isLoggedIn ? 'group-hover:scale-105' : 'blur-lg'}`}
                    onError={handleImageError}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  
                  {/* Login Overlay for Small Image 2 */}
                  {!isLoggedIn && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                      <button
                        onClick={() => onLoginClick && onLoginClick()}
                        className="px-4 py-2 bg-white/90 backdrop-blur text-[#293056] rounded-lg font-medium hover:bg-white transition-colors text-sm"
                      >
                        Create Account
                      </button>
                    </div>
                  )}
                  
                  {/* See All Photos Button - Only show if logged in and we have more than 3 images */}
                  {isLoggedIn && images.length > 3 && (
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
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Gallery - Tablet and Mobile Only */}
            <div className="lg:hidden relative w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden">
              <div className="relative w-full h-full">
                {images.length > 0 ? (
                  images.map((image, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-300 ${
                        index === currentMobileSlide ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <img
                        src={(function() {
                          let url = image;
                          if (url && url.includes && url.includes('ampre.ca') && url.startsWith('https://')) {
                            return url.replace('https://', 'http://');
                          }
                          return url;
                        })()}
                        alt={`Property image ${index + 1}`}
                        className={`w-full h-full object-cover object-center ${!isLoggedIn ? 'blur-lg' : ''}`}
                        onError={(e) => handleImageError(e, index)}
                      />
                    </div>
                  ))
                ) : (
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xs">No images available</p>
                    </div>
                  </div>
                )}
                
                {/* Login Overlay for Mobile Gallery */}
                {!isLoggedIn && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
                    <div className="bg-white rounded-xl p-5 max-w-xs mx-4 text-center shadow-2xl">
                      <h3 className="text-lg font-bold text-[#293056] mb-2">
                        Sign in to view photos
                      </h3>
                      <p className="text-gray-600 text-xs mb-3">
                        Create a free account to see all property images
                      </p>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => onLoginClick && onLoginClick()}
                          className="block w-full py-2 px-3 bg-[#293056] text-white rounded-lg font-medium text-sm hover:bg-[#1f2441] transition-colors"
                        >
                          Sign In
                        </button>
                        <button
                          onClick={() => onLoginClick && onLoginClick()}
                          className="block w-full py-2 px-3 border border-[#293056] text-[#293056] rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
                        >
                          Create Account
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Mobile Navigation - Only show if logged in and we have more than 1 image */}
                {isLoggedIn && images.length > 1 && (
                  <>
                    <button 
                      onClick={() => changeMobileSlide('prev')}
                      className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-all duration-300 z-20"
                    >
                      <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    
                    <button 
                      onClick={() => changeMobileSlide('next')}
                      className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-all duration-300 z-20"
                    >
                      <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                  </>
                )}
                
                {/* Mobile Counter - Only show if logged in and we have images */}
                {isLoggedIn && images.length > 0 && (
                  <div className="absolute bottom-3 md:bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-xs md:text-sm font-medium z-20">
                    {currentMobileSlide + 1} / {images.length}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Property Details Card */}
          <div className="w-full lg:w-[309px] h-auto lg:h-[645px] bg-white border border-gray-200 rounded-xl flex-shrink-0 order-2 lg:order-none mt-[70px] md:mt-5 lg:mt-0">
            <div className="flex flex-col justify-between p-4 md:p-6 h-full min-h-[500px] lg:min-h-0">
              <div className="flex flex-col gap-6 md:gap-8 lg:gap-10 mb-[30px] md:mb-0">
                {/* Property Status and Price Section */}
                <div className="flex flex-col gap-2 items-center">
                  <div className="flex justify-between items-center w-full">
                    <span className="font-space-grotesk font-bold text-xl md:text-2xl leading-7 md:leading-[34px] uppercase text-[#93370D]">
                      {getPropertyStatus()}
                    </span>
                    <span className="font-space-grotesk font-bold text-xl md:text-2xl leading-7 md:leading-[34px] uppercase text-[#93370D]">
                      {getDisplayPrice()}
                    </span>
                  </div>
                  <div className="font-work-sans font-medium text-sm text-[#535862] text-center">
                    {(() => {
                      const status = getPropertyStatus();
                      if (status === 'SOLD FOR') {
                        // Show original list price for sold properties
                        const originalPrice = propertyData?.OriginalListPrice || propertyData?.originalListPrice || 
                                            propertyData?.ListPrice || propertyData?.listPrice;
                        return originalPrice ? `Listed for ${formatPrice(originalPrice)}` : '';
                      } else if (status === 'FOR RENT' || status === 'FOR LEASE') {
                        // Show rental/lease period if available
                        return propertyData?.LeaseTerm ? `${propertyData.LeaseTerm} lease` : 'Available now';
                      } else {
                        // For sale properties - calculate days on market from ListingContractDate or OriginalEntryTimestamp
                        let daysOnMarket;
                        
                        // Try to get listing date from various possible fields
                        const listingDateStr = propertyData?.ListingContractDate || 
                                             propertyData?.listingContractDate ||
                                             propertyData?.OriginalEntryTimestamp ||
                                             propertyData?.originalEntryTimestamp;
                        
                        if (listingDateStr) {
                          const listingDate = new Date(listingDateStr);
                          const today = new Date();
                          
                          // Ensure the dates are valid
                          if (!isNaN(listingDate.getTime()) && !isNaN(today.getTime())) {
                            // Calculate difference in milliseconds
                            const diffTime = today.getTime() - listingDate.getTime();
                            // Convert to days and round down (floor) for accurate day count
                            daysOnMarket = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                            
                            // Ensure we don't show negative days
                            daysOnMarket = Math.max(0, daysOnMarket);
                          }
                        }
                        
                        // Fallback to DaysOnMarket field if calculation fails
                        if (!daysOnMarket && daysOnMarket !== 0) {
                          daysOnMarket = propertyData?.DaysOnMarket || propertyData?.daysOnMarket;
                        }
                        
                        // Display appropriate text
                        if (daysOnMarket === 0) {
                          return 'New listing - Listed today';
                        } else if (daysOnMarket === 1) {
                          return '1 day on market';
                        } else if (daysOnMarket > 0) {
                          return `${daysOnMarket} days on market`;
                        } else {
                          return 'New listing';
                        }
                      }
                    })()}
                  </div>
                  <div className="w-full h-px border-t border-[#D5D7DA]"></div>
                </div>
                
                {/* Properties Details Section */}
                <div className="flex flex-col gap-4 md:gap-6">
                  <h3 className="font-red-hat font-bold text-lg md:text-xl text-[#252B37]">
                    Properties detail
                  </h3>
                  
                  <div className="flex flex-col gap-4 md:gap-6">
                    {/* Type */}
                    <div className="flex justify-between items-center gap-3 w-full">
                      <span className="font-work-sans font-normal text-sm md:text-base leading-5 md:leading-[25px] text-[#252B37] tracking-tight capitalize break-words">
                        Type
                      </span>
                      <span className="font-work-sans font-normal text-sm md:text-base leading-5 md:leading-[25px] text-[#252B37] tracking-tight text-right break-words">
                        {propertyData?.details?.type || propertyData?.propertyType || propertyData?.propertySubType || 'N/A'}
                      </span>
                    </div>
                    
                    {/* Beds */}
                    <div className="flex justify-between items-center gap-3 w-full">
                      <span className="font-work-sans font-normal text-sm md:text-base leading-5 md:leading-[25px] text-[#252B37] tracking-tight capitalize break-words">
                        Beds
                      </span>
                      <span className="font-work-sans font-normal text-sm md:text-base leading-5 md:leading-[25px] text-[#252B37] tracking-tight text-right break-words">
                        {propertyData?.details?.beds || propertyData?.bedrooms || propertyData?.bedroomsTotal || 'N/A'}
                      </span>
                    </div>
                    
                    {/* Bathrooms */}
                    <div className="flex justify-between items-center gap-3 w-full">
                      <span className="font-work-sans font-normal text-sm md:text-base leading-5 md:leading-[25px] text-[#252B37] tracking-tight capitalize break-words">
                        Bathrooms
                      </span>
                      <span className="font-work-sans font-normal text-sm md:text-base leading-5 md:leading-[25px] text-[#252B37] tracking-tight text-right break-words">
                        {propertyData?.details?.bathrooms || propertyData?.bathrooms || propertyData?.bathroomsTotal || 'N/A'}
                      </span>
                    </div>
                    
                    {/* Area */}
                    <div className="flex justify-between items-center gap-3 w-full">
                      <span className="font-work-sans font-normal text-sm md:text-base leading-5 md:leading-[25px] text-[#252B37] tracking-tight capitalize break-words">
                        Area
                      </span>
                      <span className="font-work-sans font-normal text-sm md:text-base leading-5 md:leading-[25px] text-[#252B37] tracking-tight text-right break-words">
                        {(() => {
                          // Check various area fields from API
                          const livingArea = propertyData?.LivingAreaRange || propertyData?.livingAreaRange || 
                                           propertyData?.LivingArea || propertyData?.livingArea ||
                                           propertyData?.AboveGradeFinishedArea || propertyData?.aboveGradeFinishedArea ||
                                           propertyData?.BuildingAreaTotal || propertyData?.buildingAreaTotal ||
                                           propertyData?.GrossFloorArea || propertyData?.grossFloorArea ||
                                           propertyData?.details?.area;
                          
                          if (livingArea) {
                            // If it's a range like "500-599" or "1800-1999", show the range as-is
                            if (typeof livingArea === 'string' && livingArea.includes('-')) {
                              return `${livingArea} sqft`;
                            }
                            // If it's already a number or string
                            else if (livingArea) {
                              // Remove any existing "sqft" or unit text
                              const value = livingArea.toString().replace(/[^0-9\-]/g, '');
                              if (value) {
                                return `${value} sqft`;
                              }
                            }
                          }
                          return 'N/A';
                        })()}
                      </span>
                    </div>
                    
                    {/* Parking */}
                    <div className="flex justify-between items-center gap-3 w-full">
                      <span className="font-work-sans font-normal text-sm md:text-base leading-5 md:leading-[25px] text-[#252B37] tracking-tight capitalize break-words">
                        Parking
                      </span>
                      <span className="font-work-sans font-normal text-sm md:text-base leading-5 md:leading-[25px] text-[#252B37] tracking-tight text-right break-words">
                        {(() => {
                          // Check various parking fields
                          const parkingTotal = propertyData?.ParkingTotal || propertyData?.parkingTotal || 
                                             propertyData?.ParkingSpaces || propertyData?.parkingSpaces ||
                                             propertyData?.GarageSpaces || propertyData?.garageSpaces ||
                                             propertyData?.details?.parking;
                          
                          // If parking is a number, show the actual number
                          if (typeof parkingTotal === 'number') {
                            return parkingTotal === 0 ? '0' : parkingTotal.toString();
                          }
                          // If parking is a string number, show the actual number
                          else if (typeof parkingTotal === 'string' && !isNaN(parseInt(parkingTotal))) {
                            const parkingNum = parseInt(parkingTotal);
                            return parkingNum === 0 ? '0' : parkingNum.toString();
                          }
                          // Check parking features array
                          else if (propertyData?.ParkingFeatures && Array.isArray(propertyData.ParkingFeatures)) {
                            return propertyData.ParkingFeatures.includes('None') ? '0' : 'Yes';
                          }
                          // Check parking type
                          else if (propertyData?.ParkingType1 || propertyData?.parkingType1) {
                            const type = propertyData.ParkingType1 || propertyData.parkingType1;
                            return type.toLowerCase() === 'none' ? '0' : 'Yes';
                          }
                          
                          return '0';
                        })()}
                      </span>
                    </div>
                    
                    {/* Maintenance Fees */}
                    <div className="flex justify-between items-center gap-3 w-full">
                      <span className="font-work-sans font-normal text-sm md:text-base leading-5 md:leading-[25px] text-[#252B37] tracking-tight capitalize break-words">
                        Maintenance Fees
                      </span>
                      <span className="font-work-sans font-normal text-sm md:text-base leading-5 md:leading-[25px] text-[#252B37] tracking-tight text-right break-words">
                        {(() => {
                          // Check various fee fields
                          const fee = propertyData?.AssociationFee || propertyData?.associationFee ||
                                    propertyData?.details?.maintenanceFees;
                          
                          if (fee && fee !== 'N/A') {
                            // If it's already formatted
                            if (typeof fee === 'string' && (fee.includes('$') || fee.includes('CAD'))) {
                              return fee;
                            }
                            // If it's a number, format it
                            else if (fee && parseFloat(fee) > 0) {
                              return formatPrice(parseFloat(fee));
                            }
                          }
                          return 'N/A';
                        })()}
                      </span>
                    </div>
                    
                    {/* Property Taxes */}
                    <div className="flex justify-between items-center gap-3 w-full">
                      <span className="font-work-sans font-normal text-sm md:text-base leading-5 md:leading-[25px] text-[#252B37] tracking-tight capitalize break-words">
                        Property Taxes
                      </span>
                      <span className="font-work-sans font-normal text-sm md:text-base leading-5 md:leading-[25px] text-[#252B37] tracking-tight text-right break-words">
                        {(() => {
                          // Check various tax fields
                          const taxes = propertyData?.TaxTotalAnnual || propertyData?.taxTotalAnnual ||
                                       propertyData?.TaxAnnualAmount || propertyData?.taxAnnualAmount ||
                                       propertyData?.PropertyTaxes || propertyData?.propertyTaxes ||
                                       propertyData?.Tax || propertyData?.tax ||
                                       propertyData?.details?.propertyTaxes;
                          
                          if (taxes && taxes !== 'N/A') {
                            // If it's already formatted
                            if (typeof taxes === 'string' && (taxes.includes('$') || taxes.includes('CAD'))) {
                              return taxes;
                            }
                            // If it's a number, format it
                            else if (taxes && parseFloat(taxes) > 0) {
                              return formatPrice(parseFloat(taxes));
                            }
                          }
                          return 'N/A';
                        })()}
                      </span>
                    </div>
                    
                    {/* Exposure */}
                    <div className="flex justify-between items-center gap-3 w-full">
                      <span className="font-work-sans font-normal text-sm md:text-base leading-5 md:leading-[25px] text-[#252B37] tracking-tight capitalize break-words">
                        Exposure
                      </span>
                      <span className="font-work-sans font-normal text-sm md:text-base leading-5 md:leading-[25px] text-[#252B37] tracking-tight text-right break-words">
                        {(() => {
                          // Check various exposure/direction fields
                          const exposure = propertyData?.DirectionFaces || propertyData?.directionFaces ||
                                         propertyData?.Exposure || propertyData?.exposure ||
                                         propertyData?.FrontingOnNSEW || propertyData?.frontingOnNSEW ||
                                         propertyData?.Direction || propertyData?.direction ||
                                         propertyData?.details?.exposure;
                          
                          if (exposure && exposure !== 'N/A') {
                            // Return the exposure value, capitalize first letter if it's all lowercase
                            if (typeof exposure === 'string') {
                              return exposure.charAt(0).toUpperCase() + exposure.slice(1);
                            }
                            return exposure;
                          }
                          return 'N/A';
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Enquire this Property Button */}
              <div className="bg-black rounded-full h-12 md:h-10 flex items-center justify-center w-full">
                <button 
                  onClick={() => setShowEnquiryModal(true)}
                  className="w-full h-full flex items-center justify-center hover:bg-gray-800 transition-colors rounded-full"
                >
                  <span className="font-work-sans font-extrabold text-sm md:text-base text-white">
                    Enquire this Property
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
              <span className="font-semibold text-sm">{propertyData?.address || 'Property Details'}</span>
              <span className="text-white text-opacity-70 text-xs">
                ({modalImageIndex + 1} of {images.length})
              </span>
            </div>
            <div className="flex items-center gap-2">
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
            {images.length > 1 && (
              <button 
                onClick={prevModalImage}
                disabled={modalImageIndex === 0}
                className="absolute left-3 z-10 bg-white bg-opacity-90 border-none rounded-full w-10 h-10 flex items-center justify-center cursor-pointer top-1/2 transform -translate-y-1/2 hover:bg-white hover:scale-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            
            <div className="w-full h-full flex items-center justify-center overflow-hidden px-16">
              <div 
                className="flex h-full w-full transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${modalImageIndex * 100}%)` }}
              >
                {images.map((image, index) => {
                  // Ensure AMPRE images use HTTP in modal too
                  let modalImageUrl = image;
                  if (modalImageUrl && modalImageUrl.includes && modalImageUrl.includes('ampre.ca') && modalImageUrl.startsWith('https://')) {
                    modalImageUrl = modalImageUrl.replace('https://', 'http://');
                  }
                  return (
                    <div key={index} className="min-w-full flex items-center justify-center p-4">
                      <img 
                        src={modalImageUrl}
                        alt={`Property image ${index + 1}`}
                        onError={(e) => {
                          console.error('PropertyGallery - Failed to load modal image:', modalImageUrl);
                          // Hide broken image - no fallback
                          e.target.style.display = 'none';
                          e.target.onerror = null;
                        }}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            
            {images.length > 1 && (
              <button 
                onClick={nextModalImage}
                disabled={modalImageIndex === images.length - 1}
                className="absolute right-3 z-10 bg-white bg-opacity-90 border-none rounded-full w-10 h-10 flex items-center justify-center cursor-pointer top-1/2 transform -translate-y-1/2 hover:bg-white hover:scale-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Thumbnail Navigation - Only show if we have more than 1 image */}
          {images.length > 1 && (
            <div className="flex gap-2 px-4 py-3 bg-black bg-opacity-90 border-t border-white border-opacity-10 overflow-x-auto">
              {images.map((image, index) => {
                // Ensure AMPRE images use HTTP in thumbnails too
                let thumbUrl = image;
                if (thumbUrl && thumbUrl.includes && thumbUrl.includes('ampre.ca') && thumbUrl.startsWith('https://')) {
                  thumbUrl = thumbUrl.replace('https://', 'http://');
                }
                return (
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
                      src={thumbUrl}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-20 h-15 object-cover block"
                      onError={handleImageError}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Property Enquiry Modal */}
      <PropertyEnquiryModal
        isOpen={showEnquiryModal}
        onClose={() => setShowEnquiryModal(false)}
        propertyData={propertyData}
        auth={auth}
      />
    </>
  );
}
