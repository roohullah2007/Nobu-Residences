import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/Website/Global/MainLayout';
import { ViewingRequestModal, LoginModal } from '@/Website/Global/Components';
import PropertyHeader from '@/Website/Global/Components/PropertyHeader';
import {
  PropertyGallery,
  MobileBottomBar,
  PropertySections,
} from '@/Website/Sections/PropertyDetail';
import { TourScheduling } from '@/Website/Components';
import RealEstateLinksSection from '@/Website/Components/PropertyDetail/RealEstateLinksSection';
import { formatCardAddress, formatArea } from '@/utils/propertyFormatters';

export default function PropertyDetail({ auth, siteName, siteUrl, year, listingKey, propertyData: initialPropertyData, propertyImages: initialImages, website, buildingData: initialBuildingData }) {
  const [propertyData, setPropertyData] = useState(initialPropertyData);
  const [buildingData, setBuildingData] = useState(initialBuildingData);
  // Process initial images - they come as an array of URLs from the server
  const [propertyImages, setPropertyImages] = useState(() => {
    if (initialImages && Array.isArray(initialImages) && initialImages.length > 0) {
      console.log('PropertyDetail - Using initial images from server:', initialImages);
      return initialImages;
    }
    console.log('PropertyDetail - No initial images provided');
    return [];
  });
  const [isLoading, setIsLoading] = useState(!initialPropertyData);
  
  // Viewing request modal state
  const [viewingModal, setViewingModal] = useState({
    isOpen: false,
    property: null
  });

  // Login modal state
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Global function to open viewing modal from property cards
  useEffect(() => {
    // Debug building data for amenities
    console.log('=== PropertyDetail Debug - Building Data ===');
    console.log('Initial buildingData from backend:', initialBuildingData);
    console.log('Current buildingData state:', buildingData);
    console.log('Property data:', initialPropertyData);
    
    if (initialBuildingData) {
      console.log('Building Details:', {
        id: initialBuildingData.id,
        name: initialBuildingData.name,
        hasAmenities: !!(initialBuildingData.amenities && initialBuildingData.amenities.length > 0),
        amenitiesCount: initialBuildingData.amenities ? initialBuildingData.amenities.length : 0,
        amenitiesData: initialBuildingData.amenities
      });
    } else {
      console.log('No building data received from backend for this property');
    }
    
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
  }, [initialBuildingData, buildingData, initialPropertyData]);

  const handleCloseViewingModal = () => {
    setViewingModal({
      isOpen: false,
      property: null
    });
  };

  // NO SAMPLE DATA - only use real property data from API

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

        // Set building data if available
        if (data.buildingData) {
          setBuildingData(data.buildingData);
          console.log('PropertyDetail - API: Setting building data:', data.buildingData);
          console.log('PropertyDetail - API: Building has amenities:', !!(data.buildingData.amenities && data.buildingData.amenities.length > 0));
        } else {
          console.log('PropertyDetail - API: No building data in response');
        }

        // Set images - handle both formats
        if (data.images && data.images.length > 0) {
          // Map API images to URL strings
          const imageUrls = data.images.map(img => {
            const url = img.url || img.MediaURL || img.URL || img;
            // Log each image URL for debugging
            console.log('PropertyDetail - Processing image URL:', url);
            return url;
          });
          console.log('PropertyDetail - Setting property images:', imageUrls);
          setPropertyImages(imageUrls);
        } else if (data.property && data.property.Images) {
          const imageUrls = data.property.Images.map(img => img.MediaURL || img.URL || img.url || img);
          console.log('PropertyDetail - Setting property images from property.Images:', imageUrls);
          setPropertyImages(imageUrls);
        } else {
          console.log('PropertyDetail - No images found in API response');
          console.log('PropertyDetail - Full API response:', data);
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
    
    // Format address using the utility function
    const formattedAddress = formatCardAddress(property);
    
    // Format area using the utility function
    const formattedArea = formatArea(property);
    
    return {
      // Raw fields for formatCardAddress function
      UnitNumber: unitNumber,
      unitNumber: unitNumber,
      StreetNumber: streetNumber,
      streetNumber: streetNumber,
      StreetName: streetName,
      streetName: streetName,
      StreetSuffix: streetSuffix,
      streetSuffix: streetSuffix,
      // Formatted fields
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
        area: formattedArea || 'N/A',
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
    address: "Loading...",
    subtitle: "Loading property details...",
    soldFor: null,
    listedFor: null,
    Images: [],
    details: {
      type: "Loading...",
      beds: "0",
      bathrooms: "0",
      area: "N/A",
      parking: "0",
      maintenanceFees: "N/A",
      propertyTaxes: "N/A",
      exposure: "N/A"
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
          <Navbar auth={auth} website={website} />
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
    <MainLayout siteName={siteName} siteUrl={siteUrl} year={year} auth={auth} website={website}>
      <Head title={`${displayData.address} - Property Details - ${siteName}`} />
      <div className="idx mx-auto overflow-hidden bg-primary">
      <div className="px-4 md:px-0 max-w-[1280px] mx-auto">

      {/* Property Header */}
        <div className="mb-7">
        <PropertyHeader 
          data={displayData}
          auth={auth}
          type="property"
        />
        </div>

        {/* Property Gallery with Details Card and Modal */}
        <div className="mb-7">
        <PropertyGallery 
          propertyImages={propertyImages}
          propertyData={displayData}
          auth={auth}
          onLoginClick={() => setLoginModalOpen(true)}
        />
        </div>
 
        <div className="flex md:flex-row sm:flex-col flex-col gap-6 w-full">
        <div className="md:w-[950px]">

        {/* Property Sections */}
        <PropertySections
          propertyData={displayData}
          auth={auth}
          website={website}
          buildingData={buildingData}
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
              <div className="space-y-4">
                {/* Login/Signup Card for Non-Authenticated Users */}
                {!auth?.user && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-[#293056] mb-2 font-space-grotesk">
                        Get More Details
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Create a free account to save properties and get exclusive access to property details
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
                
                {/* Tour Scheduling */}
                <TourScheduling website={website} propertyData={displayData} />
              </div>
            </div>
      </div>
      <div className='description'>
             {/* Real Estate Market Links Section */}
             <RealEstateLinksSection propertyData={displayData} />
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
