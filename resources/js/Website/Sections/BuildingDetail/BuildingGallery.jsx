import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Close, Heart } from '@/Website/Components/Icons';
import ContactAgentModal from '@/Website/Components/ContactAgentModal';

// Building Gallery Component with single image and modal
const BuildingGallery = ({ buildingImages, buildingData, website, isFavorited, onToggleFavorite, auth }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [propertyCounts, setPropertyCounts] = useState({ for_sale: 0, for_rent: 0 });
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  
  // Debug: Log building data
  console.log('BuildingGallery received buildingData:', buildingData);
  
  // Extract building address from buildingData
  const getBuildingAddress = () => {
    const address = buildingData?.address || buildingData?.name || '';
    const match = address.match(/^(\d+)\s+(.+?)(?:,|$)/);
    if (match) {
      // Remove common street suffixes like "Street", "St", "Avenue", "Ave" etc to match MLS data
      let streetName = match[2];
      // Remove trailing street type words for better matching
      streetName = streetName.replace(/\s+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Court|Ct|Place|Pl|Lane|Ln|Way)$/i, '').trim();
      return { streetNumber: match[1], streetName: streetName };
    }
    // Default to 15 Mercer if no address found
    return { streetNumber: '15', streetName: 'Mercer' };
  };
  
  // Get the primary street address for the links
  const getPrimaryAddress = () => {
    if (buildingData?.street_address_1) {
      return buildingData.street_address_1;
    }
    if (buildingData?.address) {
      // Extract first address if multiple (e.g., "15 Mercer St & 35 Mercer")
      const parts = buildingData.address.split(/\s+(?:&|and)\s+/i);
      if (parts[0]) {
        return parts[0].trim();
      }
    }
    return '15-Mercer'; // fallback
  };

  const primaryAddress = getPrimaryAddress();
  // Format as URL: "15 Mercer St" becomes "15-Mercer"
  let buildingUrlSlug = primaryAddress
    .replace(/\s+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Court|Ct|Place|Pl|Lane|Ln|Way)$/i, '')
    .replace(/[,\.]/g, '')
    .replace(/\s+/g, '-');

  // Check if this is a Mercer building (15 or 35 Mercer)
  const isMercerBuilding = buildingUrlSlug === '15-Mercer' || buildingUrlSlug === '35-Mercer';

  // Use combined URL for Mercer buildings
  if (isMercerBuilding) {
    buildingUrlSlug = '15-35-Mercer';
  }
  
  // Get property counts from pre-loaded MLS data
  useEffect(() => {
    // Use pre-loaded MLS properties from buildingData if available
    const saleCount = buildingData?.mls_properties_for_sale?.length || 0;
    const rentCount = buildingData?.mls_properties_for_rent?.length || 0;

    console.log('[BuildingGallery] Using pre-loaded MLS counts:', {
      for_sale: saleCount,
      for_rent: rentCount
    });

    setPropertyCounts({
      for_sale: saleCount,
      for_rent: rentCount
    });
    setIsLoadingCounts(false);
  }, [buildingData]);

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
    setModalImageIndex((prev) => (prev + 1) % buildingImages.length);
  };

  const prevModalImage = () => {
    setModalImageIndex((prev) => (prev - 1 + buildingImages.length) % buildingImages.length);
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <>
      {/* Main Container */}
      <div className="max-w-[1280px] mx-auto px-0 py-0">
        <div className="flex flex-col lg:flex-row gap-4 md:gap-5 lg:gap-6">
          {/* Single Image Section - Flexible width */}
          <div className="flex-1 order-1 lg:order-none">
            {/* Single Large Image with click to open modal */}
            <div className="relative w-full h-[300px] md:h-[400px] lg:h-[645px]">
              <div
                className="relative w-full h-full rounded-xl overflow-hidden cursor-pointer group"
                onClick={() => openModal(0)}
              >
                <img
                  src={buildingImages[0]}
                  alt="Building image"
                  className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-10"></div>

                {/* View Photos overlay on hover */}
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-white text-lg font-work-sans font-semibold">
                    Click to view photos
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Building Details Card - Fixed width */}
          <div className="w-full lg:w-[306px] h-auto lg:h-[645px] bg-gray-50 border border-gray-200 rounded-xl flex-shrink-0 order-2 lg:order-none">
            <div className="flex flex-col justify-between p-4 md:p-6 h-full min-h-[500px] lg:min-h-0">
              <div className="flex flex-col gap-6 md:gap-6 lg:gap-8 mb-[30px] md:mb-0">
                {/* Building Name Section */}
                <div className="flex flex-col gap-4 items-center">
                  <h2 className="font-space-grotesk font-bold text-2xl md:text-3xl leading-tight text-[#293056] text-center">
                    {buildingData?.name || 'Building Name'}
                  </h2>
                  <div className="w-full h-px border-t border-[#D5D7DA]"></div>
                </div>
                
                {/* Building Details */}
                <div className="flex flex-col mt-10 gap-3">
                  {/* Developer */}
                  <div className="flex justify-between items-start">
                    <span className="font-work-sans font-semibold text-sm text-[#252B37]">Developer</span>
                    <span className="font-work-sans text-sm text-[#535862] text-right max-w-[180px]">
                      {buildingData?.developer_name || buildingData?.developer?.name || '-'}
                    </span>
                  </div>
                  
                  {/* Address */}
                  <div className="flex justify-between items-start">
                    <span className="font-work-sans font-semibold text-sm text-[#252B37]">Address</span>
                    <span className="font-work-sans text-sm text-[#535862] text-right max-w-[180px]">
                      {(() => {
                        // Format address with & between street addresses
                        if (buildingData?.street_address_1 && buildingData?.street_address_2) {
                          return `${buildingData.street_address_1} & ${buildingData.street_address_2}`;
                        }
                        // Fallback to main address
                        return buildingData?.address || buildingData?.name || '-';
                      })()}
                    </span>
                  </div>

                  {/* Neighbourhood */}
                  <div className="flex justify-between items-start">
                    <span className="font-work-sans font-semibold text-sm text-[#252B37]">Neighbourhood</span>
                    <span className="font-work-sans text-sm text-[#535862]">
                      {buildingData?.neighborhood_info || buildingData?.neighbourhood || buildingData?.city || '-'}
                    </span>
                  </div>
                </div>
                
                {/* For Sale and For Rent Buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      const section = document.getElementById('properties-for-sale');
                      if (section) {
                        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className="w-full h-12 rounded-lg border border-[#293056] flex items-center justify-center hover:bg-[#293056] hover:text-white transition-colors group cursor-pointer"
                  >
                    <span className="font-work-sans font-medium text-base text-[#293056] group-hover:text-white">
                      {isLoadingCounts
                        ? 'Loading...'
                        : `${propertyCounts.for_sale || 0} for sale`
                      }
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      const section = document.getElementById('properties-for-rent');
                      if (section) {
                        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className="w-full h-12 rounded-lg border border-[#293056] flex items-center justify-center hover:bg-[#293056] hover:text-white transition-colors group cursor-pointer"
                  >
                    <span className="font-work-sans font-medium text-base text-[#293056] group-hover:text-white">
                      {isLoadingCounts
                        ? 'Loading...'
                        : `${propertyCounts.for_rent || 0} for rent`
                      }
                    </span>
                  </button>
                </div>
                
                {/* Agent Section */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                      <img
                        src={website?.agent_info?.profile_image || website?.contact_info?.agent?.image || buildingData?.agent_image || "/assets/school/jatin-gill.png"}
                        alt={website?.agent_info?.agent_name || website?.contact_info?.agent?.name || buildingData?.agent_name || "Agent"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-left">
                      <h3 className="font-space-grotesk font-bold text-lg text-[#7E2410]">
                        {website?.agent_info?.agent_name || website?.contact_info?.agent?.name || buildingData?.agent_name || 'Jatin Gill'}
                      </h3>
                      <p className="font-work-sans font-medium text-sm text-[#535862]">
                        {website?.agent_info?.agent_title || website?.contact_info?.agent?.title || buildingData?.agent_title || 'Property Manager'}
                      </p>
                      <p className="font-work-sans font-normal text-sm text-[#535862]">
                        {website?.agent_info?.brokerage || website?.contact_info?.agent?.brokerage || buildingData?.agent_brokerage || 'Property.ca Inc., Brokerage'}
                      </p>
                    </div>
                  </div>
                </div>
              {/* Contact Agent Button */}
              <div className="rounded-full h-12 flex items-center justify-center w-full" style={{ backgroundColor: 'rgb(126 36 16)' }}>
                <button 
                  onClick={() => setShowContactModal(true)}
                  className="w-full h-full flex items-center justify-center"
                >
                  <span className="font-work-sans font-extrabold text-sm md:text-base text-white">
                    Contact Agent
                  </span>
                </button>
              </div>
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
              <span className="font-semibold text-sm">{buildingData?.name || buildingData?.address || 'Building'}</span>
              <span className="text-white text-opacity-70 text-xs">
                ({modalImageIndex + 1} of {buildingImages.length})
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
            {buildingImages.length > 1 && (
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
                {buildingImages.map((image, index) => (
                  <div key={index} className="min-w-full flex items-center justify-center p-4">
                    <img 
                      src={image}
                      alt={`Building image ${index + 1}`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {buildingImages.length > 1 && (
              <button 
                onClick={nextModalImage}
                disabled={modalImageIndex === buildingImages.length - 1}
                className="absolute right-3 z-10 bg-white bg-opacity-90 border-none rounded-full w-10 h-10 flex items-center justify-center cursor-pointer top-1/2 transform -translate-y-1/2 hover:bg-white hover:scale-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Thumbnail Navigation - Only show if multiple images */}
          {buildingImages.length > 1 && (
            <div className="flex gap-2 px-4 py-3 bg-black bg-opacity-90 border-t border-white border-opacity-10 overflow-x-auto">
              {buildingImages.map((image, index) => (
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
          )}
        </div>
      )}
      
      {/* Contact Agent Modal */}
      <ContactAgentModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        agentData={{
          id: buildingData?.agent_id,
          name: website?.agent_info?.agent_name || website?.contact_info?.agent?.name || buildingData?.agent_name,
          title: website?.agent_info?.agent_title || website?.contact_info?.agent?.title || buildingData?.agent_title,
          phone: website?.agent_info?.agent_phone || website?.contact_info?.agent?.phone || buildingData?.agent_phone,
          brokerage: website?.agent_info?.brokerage || website?.contact_info?.agent?.brokerage || buildingData?.agent_brokerage,
          image: website?.agent_info?.profile_image || website?.contact_info?.agent?.image || buildingData?.agent_image
        }}
        propertyData={{
          ListingKey: buildingData?.id,
          address: buildingData?.address || buildingData?.name,
          BuildingName: buildingData?.name
        }}
        auth={auth}
        websiteSettings={{ website }}
      />
    </>
  );
};

export default BuildingGallery;