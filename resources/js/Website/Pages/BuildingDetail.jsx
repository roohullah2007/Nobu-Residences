import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/Website/Global/MainLayout';
import { ViewingRequestModal, LoginModal } from '@/Website/Global/Components';
import PropertyHeader from '@/Website/Global/Components/PropertyHeader';
import Navbar from '@/Website/Global/Navbar';
import { 
  MobileBottomBar
} from '@/Website/Sections/PropertyDetail';
import { BuildingTourScheduling } from '@/Website/Components/PropertyDetail';
import RealEstateLinksSection from '@/Website/Components/PropertyDetail/RealEstateLinksSection';
import { BuildingGallery, BuildingSections } from '@/Website/Sections/BuildingDetail';

export default function BuildingDetail({ auth, siteName, siteUrl, year, buildingId, buildingData, website }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Debug: Log the received building data
  console.log('[BuildingDetail] ========= BUILD v2 =========');
  console.log('[BuildingDetail] buildingId:', buildingId);
  console.log('[BuildingDetail] buildingData:', buildingData);
  console.log('[BuildingDetail] buildingData?.name:', buildingData?.name);
  console.log('[BuildingDetail] mls_properties_for_sale:', buildingData?.mls_properties_for_sale);
  console.log('[BuildingDetail] mls_properties_for_rent:', buildingData?.mls_properties_for_rent);
  console.log('[BuildingDetail] mls_properties_for_sale count:', buildingData?.mls_properties_for_sale?.length || 0);
  console.log('[BuildingDetail] mls_properties_for_rent count:', buildingData?.mls_properties_for_rent?.length || 0);
  console.log('[BuildingDetail] ========================================');
  
  // Viewing request modal state
  const [viewingModal, setViewingModal] = useState({
    isOpen: false,
    property: null
  });

  // Login modal state
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Global function to open viewing modal from property cards
  useEffect(() => {
    window.openViewingModal = (property) => {
      setViewingModal({
        isOpen: true,
        property: property
      });
    };

    // Scroll detection for sidebar visibility
    const handleScroll = () => {
      const faqSection = document.querySelector('.description');
      const footer = document.querySelector('footer');
      
      if (faqSection) {
        const faqRect = faqSection.getBoundingClientRect();
        const footerRect = footer?.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Hide sidebar when FAQ section comes into view OR when footer appears
        const faqInView = faqRect.top <= windowHeight * 0.8; // Start hiding when FAQ is 80% in view
        const footerInView = footerRect && footerRect.top <= windowHeight;
        
        if (faqInView || footerInView) {
          setSidebarVisible(false);
        } else {
          setSidebarVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Cleanup
    return () => {
      delete window.openViewingModal;
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleCloseViewingModal = () => {
    setViewingModal({
      isOpen: false,
      property: null
    });
  };

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };


  // Sample properties for sale data
  const sampleSaleProperties = [
    {
      id: 1,
      listingKey: "C5234419",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&auto=format&q=80",
      imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&auto=format&q=80",
      price: 650000,
      propertyType: "Condo Apartment",
      transactionType: "For Sale",
      bedrooms: 2,
      bathrooms: 2,
      address: "Unit 1205, 8 Hillcrest Ave, North York, ON M2N 6Y6",
      isRental: false
    },
    {
      id: 2,
      listingKey: "C1209765",
      image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop&auto=format&q=80",
      imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop&auto=format&q=80",
      price: 899000,
      propertyType: "Condo Apartment",
      transactionType: "For Sale",
      bedrooms: 3,
      bathrooms: 2,
      address: "Unit 2104, 8 Hillcrest Ave, North York, ON M2N 6Y6",
      isRental: false
    },
    {
      id: 3,
      listingKey: "C11947982",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&auto=format&q=80",
      imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&auto=format&q=80",
      price: 1200000,
      propertyType: "Condo Apartment",
      transactionType: "For Sale",
      bedrooms: 3,
      bathrooms: 3,
      address: "PH01, 8 Hillcrest Ave, North York, ON M2N 6Y6",
      isRental: false
    }
  ];

  // Sample properties for rent data
  const sampleRentProperties = [
    {
      id: 1,
      listingKey: "R11930665",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80",
      imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80",
      price: 2500,
      propertyType: "Condo Apartment",
      transactionType: "For Rent",
      bedrooms: 2,
      bathrooms: 1,
      address: "Unit 805, 8 Hillcrest Ave, North York, ON M2N 6Y6",
      isRental: true
    },
    {
      id: 2,
      listingKey: "R11884737",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&auto=format&q=80",
      imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&auto=format&q=80",
      price: 3200,
      propertyType: "Condo Apartment",
      transactionType: "For Rent",
      bedrooms: 2,
      bathrooms: 2,
      address: "Unit 1507, 8 Hillcrest Ave, North York, ON M2N 6Y6",
      isRental: true
    },
    {
      id: 3,
      listingKey: "R12009946",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80",
      imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80",
      price: 4500,
      propertyType: "Condo Apartment",
      transactionType: "For Rent",
      bedrooms: 3,
      bathrooms: 2,
      address: "Unit 2205, 8 Hillcrest Ave, North York, ON M2N 6Y6",
      isRental: true
    }
  ];

  // Provide fallback building data if none provided
  const effectiveBuildingData = buildingData || {
    id: 'sample-1',
    name: "8 Hillcrest Ave, North York (FALLBACK)",
    subtitle: "Modern downtown living",
    description: "Experience luxury living in the heart of downtown.",
    address: "8 Hillcrest Ave",
    city: "North York",
    province: "ON",
    building_type: "Residential",
    main_image: null,
    images: [],
    details: {
      type: "Residential Building",
      floors: "42",
      units: "387",
      yearBuilt: "2018",
      amenities: "Gym, Pool, Concierge",
      parking: "Underground",
      exposure: "All Directions"
    },
    Rooms: [
      {
        RoomType: 'Lobby',
        RoomLength: '50.0',
        RoomWidth: '30.0',
        RoomLengthWidthUnits: 'feet',
        RoomFeature1: 'Marble Floors',
        RoomFeature2: '24/7 Concierge',
        RoomFeature3: 'Modern Design'
      },
      {
        RoomType: 'Amenity Floor',
        RoomLength: '40.0',
        RoomWidth: '25.0',
        RoomLengthWidthUnits: 'feet',
        RoomFeature1: 'Fitness Center',
        RoomFeature2: 'Swimming Pool',
        RoomFeature3: 'Lounge Area'
      }
    ]
  };

  // DEBUG: Log effectiveBuildingData
  console.log('[BuildingDetail] effectiveBuildingData:', effectiveBuildingData);
  console.log('[BuildingDetail] effectiveBuildingData.name:', effectiveBuildingData?.name);
  console.log('[BuildingDetail] effectiveBuildingData.mls_properties_for_sale:', effectiveBuildingData?.mls_properties_for_sale);
  console.log('[BuildingDetail] effectiveBuildingData.mls_properties_for_rent:', effectiveBuildingData?.mls_properties_for_rent);

  // Use actual building images from backend or fallback to samples
  const buildingImages = [];
  
  // Add main image if available
  if (effectiveBuildingData?.main_image) {
    buildingImages.push(effectiveBuildingData.main_image);
  }
  
  // Add additional images if available
  if (effectiveBuildingData?.images && Array.isArray(effectiveBuildingData.images)) {
    buildingImages.push(...effectiveBuildingData.images);
  }
  
  // If no images from backend, use fallback images
  if (buildingImages.length === 0) {
    buildingImages.push(
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1493663284031-b7e3aaa4c4a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    );
  }

  return (
    <MainLayout siteName={siteName} siteUrl={siteUrl} year={year} website={website} auth={auth} blueHeader={true}>
      <Head title={`${effectiveBuildingData.name} - Building Details - ${siteName}`} />
      <div className="idx mx-auto overflow-hidden bg-primary">
        <div className="px-4 md:px-0 max-w-[1280px] mx-auto">

          {/* Building Header with Share and Favorite buttons */}
          <div className="mb-7">
            <PropertyHeader 
              data={effectiveBuildingData}
              isFavorited={isFavorited}
              onToggleFavorite={handleToggleFavorite}
              type="building"
            />
          </div>

          {/* Building Gallery with Details Card - Single image with modal */}
          <div className="mb-7">
            <BuildingGallery 
              buildingImages={buildingImages}
              buildingData={effectiveBuildingData}
              website={website}
              isFavorited={isFavorited}
              onToggleFavorite={handleToggleFavorite}
              auth={auth}
            />
          </div>
   
          <div className="flex md:flex-row sm:flex-col flex-col gap-6 w-full">
            <div className="md:w-[950px]">

              {/* Building Sections */}
              <BuildingSections 
                buildingData={effectiveBuildingData}
                sampleSaleProperties={sampleSaleProperties}
                sampleRentProperties={sampleRentProperties}
              />
              
              {/* Global Viewing Request Modal */}
              <ViewingRequestModal 
                isOpen={viewingModal.isOpen}
                onClose={handleCloseViewingModal}
                property={viewingModal.property}
              />
              
            </div>
       
            {/* Right sidebar */}
            <div className={`max-w-[309px] md:flex hidden w-full transition-opacity duration-300 ${sidebarVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <div className="space-y-4">
                {/* Login/Signup Card for Non-Authenticated Users */}
                {!auth?.user && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-[#293056] mb-2 font-space-grotesk">
                        Get Building Details
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Create a free account to save buildings and get exclusive access to property details
                      </p>
                      <button
                        onClick={() => setLoginModalOpen(true)}
                        className="w-full bg-[#293056] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#1f2441] transition-colors"
                      >
                        Sign Up / Log In
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Building Tour Scheduling */}
                <BuildingTourScheduling website={website} buildingData={effectiveBuildingData} />
              </div>
            </div>
          </div>
          <div className='description'>
            {/* Real Estate Market Links Section */}
            <RealEstateLinksSection propertyData={buildingData} />
          </div>     
        </div>
      </div>
      
      {/* Mobile Bottom Bar - Fixed at bottom */}
      <MobileBottomBar />
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </MainLayout>
  );
}