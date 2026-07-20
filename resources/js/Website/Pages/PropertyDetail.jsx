import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import MainLayout from '@/Website/Global/MainLayout';
import { ViewingRequestModal, LoginModal, WhatsAppButton } from '@/Website/Global/Components';
import PropertyHeader from '@/Website/Global/Components/PropertyHeader';
import {
  PropertyGallery,
  MobileBottomBar,
  PropertySections,
} from '@/Website/Sections/PropertyDetail';
import { TourScheduling } from '@/Website/Components';
import RealEstateLinksSection from '@/Website/Components/PropertyDetail/RealEstateLinksSection';
import MarketSentiment from '@/Website/Components/PropertyDetail/MarketSentiment';
import { formatCardAddress, formatArea } from '@/utils/propertyFormatters';

export default function PropertyDetail({ auth, siteName, siteUrl, year, listingKey, propertyData: initialPropertyData, propertyImages: initialImages, website, buildingData: initialBuildingData, aiDescription: initialAiDescription, metaTitle, metaDescription }) {
  const { globalWebsite } = usePage().props;
  const effectiveWebsite = website || globalWebsite;

  const brandColors = effectiveWebsite?.brand_colors || {
    button_primary_bg: '#293056',
    button_primary_text: '#FFFFFF'
  };

  const buttonPrimaryBg = brandColors.button_primary_bg || '#293056';
  const buttonPrimaryText = brandColors.button_primary_text || '#FFFFFF';

  const [propertyData, setPropertyData] = useState(initialPropertyData);
  const [buildingData, setBuildingData] = useState(initialBuildingData);
  const [aiDescription, setAiDescription] = useState(initialAiDescription);
  // Process initial images - they come as an array of URLs from the server
  const [propertyImages, setPropertyImages] = useState(() => {
    if (initialImages && Array.isArray(initialImages) && initialImages.length > 0) {
      return initialImages;
    }
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
  const [loginInitialTab, setLoginInitialTab] = useState('login');
  const openLoginModal = (tab = 'login') => {
    setLoginInitialTab(tab);
    setLoginModalOpen(true);
  };

  // Global function to open viewing modal from property cards
  useEffect(() => {
    // Debug AI description from backend
    console.log('🤖 === AI Description from Backend ===');
    console.log('🤖 Initial AI description:', initialAiDescription);
    if (initialAiDescription) {
      console.log('✅ 🤖 AI description received from backend!', {
        hasOverview: !!initialAiDescription.overview,
        hasDetailed: !!initialAiDescription.detailed,
        generatedAt: initialAiDescription.generated_at,
        exists: initialAiDescription.exists
      });
    } else {
      console.log('ℹ️ 🤖 No AI description from backend - will generate on frontend');
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
        }

        // Set images - handle both formats
        if (data.images && data.images.length > 0) {
          // Map API images to URL strings
          const imageUrls = data.images.map(img => {
            const url = img.url || img.MediaURL || img.URL || img;
            return url;
          });
          setPropertyImages(imageUrls);
        } else if (data.property && data.property.Images) {
          const imageUrls = data.property.Images.map(img => img.MediaURL || img.URL || img.url || img);
          setPropertyImages(imageUrls);
        }
      } else {
        // Use fallback sample data
        setPropertyData(getSamplePropertyData());
      }
    } catch (error) {
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
      publicRemarks: publicRemarks || '',
      PublicRemarks: publicRemarks || '',
      // Keep raw property fields for child components
      ListPrice: listPrice,
      BedroomsTotal: bedroomsTotal,
      BathroomsTotalInteger: bathroomsTotal,
      bathroomsTotal: bathroomsTotal,
      bedroomsTotal: bedroomsTotal,
      PropertySubType: propertySubType,
      propertySubType: propertySubType,
      propertyType: propertyType,
      LivingArea: livingArea,
      livingArea: livingArea,
      LivingAreaRange: livingArea,
      City: city,
      city: city,
      Exposure: exposure,
      exposure: exposure,
      // Date/time fields for days on market calculation
      DaysOnMarket: property.daysOnMarket || property.DaysOnMarket || null,
      daysOnMarket: property.daysOnMarket || property.DaysOnMarket || null,
      ListingContractDate: property.listingContractDate || property.ListingContractDate || property.listDate || property.listingDate || null,
      listingContractDate: property.listingContractDate || property.ListingContractDate || property.listDate || property.listingDate || null,
      StandardStatus: property.standardStatus || property.StandardStatus || property.status || 'Active',
      MlsStatus: property.mlsStatus || property.MlsStatus || '',
      TransactionType: property.transactionType || property.TransactionType || 'For Sale',
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
      Rooms: property.rooms || property.Rooms || [],
      // Location + raw Repliers sub-objects for breadcrumb + detail cards
      neighborhood: property.neighborhood || property.Neighborhood || '',
      area: property.area || property.Area || '',
      repliers: property.repliers || null
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

  // Use formatted data or fallback, include building data for location breadcrumb
  const displayData = {
    ...(propertyData || getSamplePropertyData()),
    building: buildingData  // Include building data for PropertyHeader location breadcrumb
  };

  // WhatsApp enquiry message for the floating button, built from the live
  // listing: For Sale vs For Rent is detected from TransactionType (Repliers
  // uses "For Lease" for rentals), same test as PropertyHeader.
  const whatsAppMessage = (() => {
    if (!propertyData) return null;
    const isRent = /rent|lease/i.test((propertyData.transactionType || propertyData.TransactionType || '').toString());
    const listingType = isRent ? 'For Rent' : 'For Sale';
    const mlsId = propertyData.mlsNumber || propertyData.listingKey || listingKey;
    const location = [propertyData.address, buildingData?.name].filter(Boolean).join(', ');
    return `Hi, I'd like to get more information about the ${listingType} listing ${mlsId} at ${location}.`;
  })();

  if (isLoading) {
    return (
      <MainLayout siteName={siteName} siteUrl={siteUrl} year={year} auth={auth} website={website} blueHeader={true}>
        <Head title={metaTitle || `Loading Property... - ${siteName}`}>
          {metaDescription && <meta name="description" content={metaDescription} />}
        </Head>
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
    <MainLayout siteName={siteName} siteUrl={siteUrl} year={year} auth={auth} website={website} blueHeader={true}>
      <Head title={metaTitle || `${displayData.address} - Property Details - ${siteName}`}>
        {metaDescription && <meta name="description" content={metaDescription} />}
      </Head>
      <div className="idx mx-auto overflow-hidden bg-primary pb-24 md:pb-0">
        {/* Keep edge padding through tablet/small-desktop; only drop it at
            xl where the 1280px design width fits the viewport exactly. */}
        <div className="px-4 xl:px-0 max-w-[1280px] mx-auto pt-8 md:pt-12">

          {/* Property Header */}
          <div className="mb-5">
            <PropertyHeader
              data={displayData}
              auth={auth}
              type="property"
              buildingData={buildingData}
            />
          </div>

          {/* Property Gallery with Details Card and Modal */}
          <div className="mb-7">
            <PropertyGallery
              propertyImages={propertyImages}
              propertyData={displayData}
              auth={auth}
              onLoginClick={() => openLoginModal('login')}
            />
          </div>

          {/* Columns: stacked below lg; from lg the sidebar sits right and the
              content column is fluid (exact 950px only from xl, where
              950 + 24 gap + 309 fits the 1280 container). The old md:w-[950px]
              forced a 1283px row at 768px and clipped both edges. */}
          <div className="flex flex-col lg:flex-row gap-6 w-full">
            <div className="w-full min-w-0 lg:flex-1 xl:flex-none xl:w-[950px]">

              {/* Property Sections */}
              <PropertySections
                propertyData={displayData}
                propertyImages={propertyImages}
                auth={auth}
                website={website}
                buildingData={buildingData}
                aiDescription={aiDescription}
                onLoginClick={() => openLoginModal('login')}
                onSignupClick={() => openLoginModal('register')}
              />
            </div>

            {/* Right sidebar — stacks below the content at tablet widths,
                becomes the fixed 309px right column from lg */}
            <div className="hidden md:flex w-full max-w-[309px] flex-shrink-0">
              <div className="flex flex-col gap-6 w-full">
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
                        onClick={() => openLoginModal('login')}
                        className="w-full py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-all"
                        style={{ backgroundColor: buttonPrimaryBg, color: buttonPrimaryText }}
                      >
                        Sign Up / Log In
                      </button>
                    </div>
                  </div>
                )}

                {/* Market Sentiment — Buyer's/Seller's market gauge (live) */}
                <MarketSentiment propertyData={displayData} buildingData={buildingData} />

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
      <MobileBottomBar property={propertyData} />

      {/* Floating WhatsApp contact button — lifted above the fixed mobile
          bottom bar on small screens, standard corner offset from md up */}
      <WhatsAppButton message={whatsAppMessage} className="bottom-24 md:bottom-6" />

      {/* Global Viewing Request Modal */}
      <ViewingRequestModal
        isOpen={viewingModal.isOpen}
        onClose={handleCloseViewingModal}
        property={viewingModal.property}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        initialTab={loginInitialTab}
      />
    </MainLayout>
  );
}