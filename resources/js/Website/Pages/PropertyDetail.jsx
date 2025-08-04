import React, { useState, useRef, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/Website/Global/MainLayout';
import { PropertyCarousel, FAQ, ViewingRequestModal } from '@/Website/Global/Components';
import {
  PropertyStatusTabs,
  NearbySchools,
  PriceHistory,
  TourSection,
  MoreBuildings,
  SimilarListings,
  ComparableSales,
  PropertyDescription
} from '@/Website/Components/PropertyDetail';

// Custom SVG Icons
const ChevronLeft = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 18L9 12L15 6" />
  </svg>
);

const ChevronRight = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18L15 12L9 6" />
  </svg>
);

const Heart = ({ className, filled = false }) => (
  <svg className={className} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.636364} d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const Share = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
  </svg>
);

const Close = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Phone = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const Calendar = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export default function PropertyDetail({ auth, siteName, siteUrl, year }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const [currentMobileSlide, setCurrentMobileSlide] = useState(0);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  
  // Viewing request modal state
  const [viewingModal, setViewingModal] = useState({
    isOpen: false,
    property: null
  });

  // Global function to open viewing modal from property cards
  useEffect(() => {
    window.openViewingModal = (property) => {
      setViewingModal({
        isOpen: true,
        property: property
      });
    };

    // Cleanup
    return () => {
      delete window.openViewingModal;
    };
  }, []);

  const handleCloseViewingModal = () => {
    setViewingModal({
      isOpen: false,
      property: null
    });
  };

  // Sample property images
  const propertyImages = [
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1493663284031-b7e3aaa4c4a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
  ];

  // Sample properties for sale data
  const sampleSaleProperties = [
    {
      id: 1,
      listingKey: "X9234419",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&auto=format&q=80",
      price: 0,
      propertyType: "Vacant Land",
      transactionType: "For Sale",
      bedrooms: 0,
      bathrooms: 0,
      address: "Deleted Deleted Deleted, Deleted, ON DELETED",
      isRental: false
    },
    {
      id: 2,
      listingKey: "N1209765",
      image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop&auto=format&q=80",
      price: 899000,
      propertyType: "Detached",
      transactionType: "For Sale",
      bedrooms: 3,
      bathrooms: 2,
      address: "108 Moore's Beach Road, Georgina, ON L0E 1N0",
      isRental: false
    },
    {
      id: 3,
      listingKey: "X11947982",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&auto=format&q=80",
      price: 1700000,
      propertyType: "Commercial Retail",
      transactionType: "For Sale",
      bedrooms: 0,
      bathrooms: 0,
      address: "284 Dundas Street, London East, ON N6B 1T6",
      isRental: false
    }
  ];

  // Sample properties for rent data
  const sampleRentProperties = [
    {
      id: 1,
      listingKey: "X11930665",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80",
      price: 2000,
      propertyType: "Co-op Apartment",
      transactionType: "For Rent",
      bedrooms: 2,
      bathrooms: 1,
      address: "104 Devonshire Avenue, London South, ON N6C 2H8",
      isRental: true
    },
    {
      id: 2,
      listingKey: "X11884737",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&auto=format&q=80",
      price: 4000,
      propertyType: "Commercial Retail",
      transactionType: "For Lease",
      bedrooms: 0,
      bathrooms: 0,
      address: "924 Oxford Street E 3, London East, ON N5Y 3J9",
      isRental: true
    },
    {
      id: 3,
      listingKey: "X12009946",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80",
      price: 3000,
      propertyType: "Commercial Retail",
      transactionType: "For Rent",
      bedrooms: 0,
      bathrooms: 0,
      address: "211 DUNDAS Street, London East, ON N6A 1G4",
      isRental: true
    }
  ];

  const propertyData = {
    address: "408 - 155 Dalhousie Street",
    subtitle: "NO55 Mercer Condos in King West, Downtown, Toronto",
    soldFor: "$1,100,000",
    listedFor: "Listed for 1,139,000 CAD",
    Images: propertyImages.map(url => ({ MediaURL: url })),
    details: {
      type: "Residential Condo",
      beds: "2+1",
      bathrooms: "2",
      area: "1276 sqft",
      parking: "2",
      maintenanceFees: "$2375",
      propertyTaxes: "$260",
      exposure: "North"
    },
    Rooms: [
      {
        RoomType: 'Living Room',
        RoomLength: '23.6',
        RoomWidth: '10.7',
        RoomLengthWidthUnits: 'feet',
        RoomFeature1: 'Combined w/Dining',
        RoomFeature2: 'Window Floor to Ceil',
        RoomFeature3: 'Laminate'
      },
      {
        RoomType: 'Master Bedroom',
        RoomLength: '14.8',
        RoomWidth: '12.5',
        RoomLengthWidthUnits: 'feet',
        RoomFeature1: 'Walk-in Closet',
        RoomFeature2: 'Ensuite Bathroom',
        RoomFeature3: ''
      },
      {
        RoomType: 'Kitchen',
        RoomLength: '10.5',
        RoomWidth: '9.2',
        RoomLengthWidthUnits: 'feet',
        RoomFeature1: 'Granite Countertops',
        RoomFeature2: 'Stainless Steel Appliances',
        RoomFeature3: 'Island'
      }
    ]
  };

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Viewing request submitted:', formData);
    setShowRequestModal(false);
    // Reset form
    setFormData({ name: '', email: '', phone: '', message: '' });
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
    <MainLayout siteName={siteName} siteUrl={siteUrl} year={year}>
      <Head title={`${propertyData.address} - Property Details - ${siteName}`} />
      
      <div className="min-h-screen bg-gray-50 font-work-sans overflow-x-hidden">
        {/* Property Header */}
        <div className="bg-white">
          <div className="max-w-[1280px] mx-auto px-5 py-8">
            <div className="flex flex-col-reverse md:flex-row justify-between items-start gap-5">
              {/* Property Info */}
              <div className="flex-1 pr-5">
                <h1 className="font-space-grotesk font-bold text-[40px] leading-[50px] text-[#293056] tracking-tight mb-3">
                  {propertyData.address}
                </h1>
                <div className="font-work-sans font-medium text-lg leading-[27px] text-[#293056] tracking-tight underline">
                  {propertyData.subtitle}
                </div>
              </div>
              
              {/* Actions Container */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Share Button */}
                <div className="relative">
                  <button 
                    onClick={() => setShowShareDropdown(!showShareDropdown)}
                    className="flex justify-center items-center px-6 h-[33px] min-w-[95px] bg-white border border-[#717680] rounded-[10px] font-work-sans font-medium text-sm text-[#252B37] hover:bg-gray-50 transition-colors"
                  >
                    Share
                  </button>
                  
                  {showShareDropdown && (
                    <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px] z-50">
                      <div className="py-1">
                        <button className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 w-full text-left text-sm">
                          <Share className="w-4 h-4" />
                          Facebook
                        </button>
                        <button className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 w-full text-left text-sm">
                          <Share className="w-4 h-4" />
                          Twitter
                        </button>
                        <button className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 w-full text-left text-sm">
                          <Share className="w-4 h-4" />
                          Copy Link
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Favourite Button */}
                <button 
                  onClick={() => setIsFavorited(!isFavorited)}
                  className={`flex justify-center items-center gap-2 px-6 h-[33px] min-w-[99px] border rounded-[10px] font-work-sans font-medium text-sm transition-colors ${
                    isFavorited 
                      ? 'bg-red-50 border-red-200 text-red-600' 
                      : 'bg-white border-[#717680] text-[#252B37] hover:bg-gray-50'
                  }`}
                >
                  <Heart className="w-[14px] h-4" filled={isFavorited} />
                  {isFavorited ? 'Favorited' : 'Favourite'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Container */}
        <div className="max-w-[1280px] mx-auto px-0 md:px-5 py-0 md:py-8">
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
                <div className="bg-black rounded-full h-12 md:h-14 flex items-center justify-center w-full">
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

        {/* Mobile Request Viewing Button - Fixed at bottom */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
          <div className="flex gap-3">
            <button 
              onClick={() => setShowRequestModal(true)}
              className="flex-1 bg-black text-white py-3 px-4 rounded-full font-work-sans font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Request a viewing
            </button>
            <button className="flex-none bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-full font-work-sans font-bold text-sm hover:bg-gray-50 transition-colors">
              <Phone className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Property Status and Navigation Tabs */}
        <PropertyStatusTabs property={propertyData} />
        
        {/* Price History Section */}
        <PriceHistory propertyData={propertyData} />
        
        {/* Tour Section */}
        <TourSection propertyData={propertyData} />
        
        {/* More Buildings Section */}
        <MoreBuildings agentName="Jatin Gill" />
        
        {/* Similar Listings Section - Using Global PropertyCarousel */}
        <section className="py-4 md:py-16 bg-gray-50">
          <div className="mx-auto px-4 md:px-0 max-w-screen-[1280px]">
            <PropertyCarousel
              properties={sampleSaleProperties.concat(sampleRentProperties)}
              title="Similar Listings"
              type="sale"
              viewAllLink="/properties"
            />
          </div>
        </section>
        
        {/* Properties For Sale Section - Using Global PropertyCarousel */}
        <section className="py-4 md:py-16 bg-gray-50">
          <div className="mx-auto px-4 md:px-0 max-w-screen-[1280px]">
            <PropertyCarousel
              properties={sampleSaleProperties}
              title="Properties For Sale"
              type="sale"
              viewAllLink="/properties"
            />
          </div>
        </section>
        
        {/* Properties For Rent Section - Using Global PropertyCarousel */}
        <section className="py-4 md:py-16 bg-gray-50">
          <div className="mx-auto px-4 md:px-0 max-w-screen-[1280px]">
            <PropertyCarousel
              properties={sampleRentProperties}
              title="Properties For Rent"
              type="rent"
              viewAllLink="/properties"
            />
          </div>
        </section>
        
        {/* Comparable Sales Section */}
        <ComparableSales />
        
        {/* Property Description Section */}
        <PropertyDescription propertyData={{
          title: propertyData.address || '408 - 155 Dalhousie Street',
          description: propertyData.description || null
        }} />
        
        {/* FAQ Section */}
        <FAQ />
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
                onClick={() => setIsFavorited(!isFavorited)}
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

      {/* Mobile Request Viewing Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-t-lg md:rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Request a Viewing</h3>
              <button 
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <Close className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-6">
                Schedule a viewing for <span className="font-semibold text-gray-900">{propertyData.address}</span>
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
                  className="w-full bg-black text-white py-3 px-4 rounded-md font-semibold hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors"
                >
                  Request Viewing
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close share dropdown */}
      {showShareDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowShareDropdown(false)}
        />
      )}
      
      {/* Global Viewing Request Modal */}
      <ViewingRequestModal 
        isOpen={viewingModal.isOpen}
        onClose={handleCloseViewingModal}
        property={viewingModal.property}
      />
    </MainLayout>
  );
}