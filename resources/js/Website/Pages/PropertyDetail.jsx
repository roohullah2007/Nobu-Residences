import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/Website/Global/MainLayout';
import { ViewingRequestModal } from '@/Website/Global/Components';
import PropertyHeader from '@/Website/Global/Components/PropertyHeader';
import Navbar from '@/Website/Global/Navbar';
import { 
  PropertyGallery,
  MobileBottomBar, 
  PropertySections,
} from '@/Website/Sections/PropertyDetail';
import { TourScheduling } from '@/Website/Components';
import RealEstateLinksSection from '@/Website/Components/PropertyDetail/RealEstateLinksSection';

export default function PropertyDetail({ auth, siteName, siteUrl, year, listingKey, propertyData: initialPropertyData, propertyImages: initialImages }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [propertyData, setPropertyData] = useState(initialPropertyData);
  const [propertyImages, setPropertyImages] = useState(initialImages || []);
  const [isLoading, setIsLoading] = useState(!initialPropertyData);
  
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

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  // Sample property images (fallback)
  const samplePropertyImages = [
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

  // Fetch property data from API if listingKey is provided and no initial data
  useEffect(() => {
    if (listingKey && !initialPropertyData) {
      fetchPropertyData();
    }
  }, [listingKey]);
  
  const fetchPropertyData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/property-detail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: JSON.stringify({ listingKey })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Format property data for display
        const formattedData = formatPropertyDataForDisplay(data.property);
        setPropertyData(formattedData);
        
        // Set images - handle both formats
        if (data.images && data.images.length > 0) {
          // Map API images to URL strings
          const imageUrls = data.images.map(img => img.url || img.MediaURL || img.URL || img);
          setPropertyImages(imageUrls);
        } else if (data.property && data.property.Images) {
          const imageUrls = data.property.Images.map(img => img.MediaURL || img.URL || img.url || img);
          setPropertyImages(imageUrls);
        }
      } else {
        console.error('Failed to fetch property data');
        // Use fallback sample data
        setPropertyData(getSamplePropertyData());
      }
    } catch (error) {
      console.error('Error fetching property data:', error);
      setPropertyData(getSamplePropertyData());
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatPropertyDataForDisplay = (property) => {
    const formatPrice = (price) => {
      if (!price) return '';
      return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD',
        maximumFractionDigits: 0
      }).format(price);
    };
    
    // Handle both old format (from controller) and direct API response
    const unitNumber = property.unitNumber || property.UnitNumber || property.ApartmentNumber || property.LegalApartmentNumber;
    const streetNumber = property.streetNumber || property.StreetNumber;
    const streetName = property.streetName || property.StreetName;
    const streetSuffix = property.streetSuffix || property.StreetSuffix || '';
    const city = property.city || property.City;
    const province = property.province || property.StateOrProvince;
    const propertySubType = property.propertySubType || property.PropertySubType;
    const propertyType = property.propertyType || property.PropertyType;
    const bedroomsTotal = property.bedroomsTotal || property.BedroomsTotal || 0;
    const bathroomsTotal = property.bathroomsTotal || property.BathroomsTotalInteger || 0;
    const livingArea = property.livingArea || property.LivingAreaRange;
    const parkingTotal = property.parkingTotal || property.ParkingTotal || 0;
    const garageSpaces = property.garageSpaces || property.GarageSpaces || 0;
    const associationFee = property.associationFee || property.AssociationFee;
    const taxAnnualAmount = property.taxAnnualAmount || property.TaxAnnualAmount;
    const yearBuilt = property.yearBuilt || property.YearBuilt;
    const listPrice = property.listPrice || property.ListPrice;
    const closePrice = property.closePrice || property.ClosePrice;
    const publicRemarks = property.publicRemarks || property.PublicRemarks;
    const standardStatus = property.standardStatus || property.StandardStatus;
    const mlsStatus = property.mlsStatus || property.MlsStatus;
    const listingId = property.listingId || property.ListingId || property.ListingKey;
    const listOfficeName = property.listOfficeName || property.ListOfficeName;
    const listAgentFullName = property.listAgentFullName || property.ListAgentFullName;
    const virtualTourURLUnbranded = property.virtualTourURLUnbranded || property.VirtualTourURLUnbranded;
    const exposure = property.exposure || property.Exposure;
    const locker = property.locker || property.Locker;
    const crossStreet = property.crossStreet || property.CrossStreet;
    
    // Format address
    const formattedAddress = unitNumber 
      ? `${unitNumber} - ${streetNumber} ${streetName} ${streetSuffix}`.trim()
      : `${streetNumber} ${streetName} ${streetSuffix}`.trim();
    
    return {
      address: formattedAddress,
      subtitle: `${propertySubType || propertyType} in ${city}, ${province}`,
      soldFor: closePrice ? formatPrice(closePrice) : null,
      listedFor: listPrice ? `Listed for ${formatPrice(listPrice)}` : null,
      listPrice: listPrice,
      mlsNumber: listingId,
      details: {
        type: propertySubType || propertyType || 'Residential',
        beds: `${bedroomsTotal}${property.BedroomsBelowGrade || property.bedroomsBelowGrade ? '+1' : ''}`,
        bathrooms: bathroomsTotal,
        area: livingArea || 'N/A',
        parking: parkingTotal,
        garageSpaces: garageSpaces,
        maintenanceFees: associationFee ? formatPrice(associationFee) : 'N/A',
        propertyTaxes: taxAnnualAmount ? formatPrice(taxAnnualAmount) : 'N/A',
        yearBuilt: yearBuilt || 'New',
        exposure: exposure || 'N/A',
        locker: locker || 'N/A',
        crossStreet: crossStreet || 'N/A',
        status: standardStatus || mlsStatus || 'Active'
      },
      description: publicRemarks || '',
      features: [
        ...(property.features || property.Features || []),
        ...(property.appliances || property.Appliances || []),
        ...(property.interiorFeatures || property.InteriorFeatures || []),
        ...(property.exteriorFeatures || property.ExteriorFeatures || [])
      ],
      heating: property.heating || property.Heating || property.HeatType ? [property.HeatType] : [],
      cooling: property.cooling || property.Cooling || [],
      flooring: property.flooring || property.Flooring || [],
      parkingFeatures: property.parkingFeatures || property.ParkingFeatures || [],
      latitude: property.latitude || property.Latitude,
      longitude: property.longitude || property.Longitude,
      virtualTourUrl: virtualTourURLUnbranded || '',
      listOfficeName: listOfficeName || '',
      listAgentName: listAgentFullName || '',
      listAgentPhone: property.listAgentDirectPhone || property.ListAgentDirectPhone || '',
      listAgentEmail: property.listAgentEmail || property.ListAgentEmail || '',
      // Set images - keep as simple URL array for PropertyGallery component
      Images: propertyImages || [],
      ImageObjects: propertyImages ? propertyImages.map(img => typeof img === 'string' ? { MediaURL: img } : img) : [],
      Rooms: property.rooms || property.Rooms || []
    };
  };
  
  const getSamplePropertyData = () => ({
    address: "408 - 155 Dalhousie Street",
    subtitle: "NO55 Mercer Condos in King West, Downtown, Toronto",
    soldFor: "$1,100,000",
    listedFor: "Listed for 1,139,000 CAD",
    Images: samplePropertyImages.map(url => ({ MediaURL: url })),
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
    Rooms: []
  });
  
  // Use formatted data or fallback
  const displayData = propertyData || getSamplePropertyData();

  if (isLoading) {
    return (
      <MainLayout siteName={siteName} siteUrl={siteUrl} year={year}>
        <Head title={`Loading Property... - ${siteName}`} />
        <div className='bg-[#293056] w-screen h-[85px] md:h-[120px] mb-10'>
          <Navbar auth={auth} />
        </div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-16 h-16 border-4 border-[#293056] border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-[#293056] text-xl font-medium">Loading property details...</div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout siteName={siteName} siteUrl={siteUrl} year={year}>
      <Head title={`${displayData.address} - Property Details - ${siteName}`} />
      <div className='bg-[#293056] w-screen h-[85px] md:h-[120px] mb-10'>
      <Navbar auth={auth} />
      </div>
      <div className="idx mx-auto overflow-hidden bg-primary">
      <div className="px-4 md:px-0 max-w-[1280px] mx-auto">

      {/* Property Header */}
        <div className="mb-7">
        <PropertyHeader 
          data={displayData}
          isFavorited={isFavorited}
          onToggleFavorite={handleToggleFavorite}
          type="property"
        />
        </div>

        {/* Property Gallery with Details Card and Modal */}
        <div className="mb-7">
        <PropertyGallery 
          propertyImages={propertyImages && propertyImages.length > 0 ? propertyImages : samplePropertyImages}
          propertyData={displayData}
          isFavorited={isFavorited}
          onToggleFavorite={handleToggleFavorite}
        />
        </div>
 
        <div className="flex md:flex-row sm:flex-col flex-col gap-6 w-full">
        <div className="md:w-[950px]">

        {/* Property Sections */}
        <PropertySections 
          propertyData={displayData}
          sampleSaleProperties={sampleSaleProperties}
          sampleRentProperties={sampleRentProperties}
          auth={auth}
        />
        
        {/* Global Viewing Request Modal */}
        <ViewingRequestModal 
          isOpen={viewingModal.isOpen}
          onClose={handleCloseViewingModal}
          property={viewingModal.property}
        />
        
        </div>
   
            {/* <!-- Right sidebar --> */}
            <div className="max-w-[309px] md:flex hidden w-full">
              <TourScheduling />
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
