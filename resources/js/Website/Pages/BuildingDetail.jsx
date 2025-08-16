import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/Website/Global/MainLayout';
import { ViewingRequestModal } from '@/Website/Global/Components';
import PropertyHeader from '@/Website/Global/Components/PropertyHeader';
import Navbar from '@/Website/Global/Navbar';
import { 
  MobileBottomBar
} from '@/Website/Sections/PropertyDetail';
import { BuildingTourScheduling } from '@/Website/Components/PropertyDetail';
import RealEstateLinksSection from '@/Website/Components/PropertyDetail/RealEstateLinksSection';
import { BuildingGallery, BuildingSections } from '@/Website/Sections/BuildingDetail';

export default function BuildingDetail({ auth, siteName, siteUrl, year }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  
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

  // Sample building images (multiple images for gallery)
  const buildingImages = [
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

  const buildingData = {
    name: "8 Hillcrest Ave, North York",
    subtitle: "Modern downtown living",
    description: "Experience luxury living in the heart of downtown.",
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

  return (
    <MainLayout siteName={siteName} siteUrl={siteUrl} year={year}>
      <Head title={`${buildingData.name} - Building Details - ${siteName}`} />
      <div className='bg-[#293056] w-screen h-[85px] md:h-[120px] mb-10'>
        <Navbar auth={auth} />
      </div>
      <div className="idx mx-auto overflow-hidden bg-primary">
        <div className="px-4 md:px-0 max-w-[1280px] mx-auto">

          {/* Building Header with Share and Favorite buttons */}
          <div className="mb-7">
            <PropertyHeader 
              data={buildingData}
              isFavorited={isFavorited}
              onToggleFavorite={handleToggleFavorite}
              type="building"
            />
          </div>

          {/* Building Gallery with Details Card - Single image with modal */}
          <div className="mb-7">
            <BuildingGallery 
              buildingImages={buildingImages}
              buildingData={buildingData}
              isFavorited={isFavorited}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
   
          <div className="flex md:flex-row sm:flex-col flex-col gap-6 w-full">
            <div className="md:w-[950px]">

              {/* Building Sections */}
              <BuildingSections 
                buildingData={buildingData}
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
              <BuildingTourScheduling />
            </div>
          </div>
          <div className='description'>
            {/* Real Estate Market Links Section */}
            <RealEstateLinksSection />
          </div>     
        </div>
      </div>
      
      {/* Mobile Bottom Bar - Fixed at bottom */}
      <MobileBottomBar />
    </MainLayout>
  );
}