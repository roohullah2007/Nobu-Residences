import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/Website/Global/MainLayout';
import { ViewingRequestModal } from '@/Website/Global/Components';
import Navbar from '@/Website/Global/Navbar';
import { 
  PropertyHeader, 
  PropertyGallery,
  MobileBottomBar, 
  PropertySections,
} from '@/Website/Sections/PropertyDetail';
import { TourScheduling } from '../Components';
import RealEstateLinksSection from '../Components/PropertyDetail/RealEstateLinksSection';

export default function PropertyDetail({ auth, siteName, siteUrl, year }) {
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

  return (
    <MainLayout siteName={siteName} siteUrl={siteUrl} year={year}>
      <Head title={`${propertyData.address} - Property Details - ${siteName}`} />
      <div className='bg-[#293056] w-screen h-[120px] mb-10'>
      <Navbar auth={auth} />
      </div>
      <div className="idx mx-auto overflow-hidden bg-primary">
      <div className="space-y-7 px-4 md:px-0 max-w-[1280px] mx-auto">

      {/* Property Header */}
        <PropertyHeader 
          propertyData={propertyData}
          isFavorited={isFavorited}
          onToggleFavorite={handleToggleFavorite}
        />

        {/* Property Gallery with Details Card and Modal */}
        <PropertyGallery 
          propertyImages={propertyImages}
          propertyData={propertyData}
          isFavorited={isFavorited}
          onToggleFavorite={handleToggleFavorite}
        />
 
        <div className="flex md:flex-row sm:flex-col flex-col gap-6 w-full">
        <div className="md:w-[950px]">

        {/* Mobile Bottom Bar */}
        <MobileBottomBar />

        {/* Property Sections */}
        <PropertySections 
          propertyData={propertyData}
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
   
            {/* <!-- Right sidebar --> */}
            <div className={`max-w-[309px] md:flex hidden w-full transition-opacity duration-300 ${sidebarVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <TourScheduling />
            </div>
      </div>
      <div className='description'>
             {/* Real Estate Market Links Section */}
             <RealEstateLinksSection />
             </div>     
      </div>
      </div>
    </MainLayout>
  );
}
