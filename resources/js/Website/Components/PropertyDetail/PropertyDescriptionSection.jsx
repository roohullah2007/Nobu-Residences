import React, { useEffect, useState } from 'react';
import { usePropertyAiDescription } from '@/hooks/usePropertyAiDescription';

export default function PropertyDescriptionSection({ propertyData, aiDescription: backendAiDescription, auth }) {
  // AI Description integration
  const {
    description: aiDescription,
    loading: aiLoading,
    getAllContent,
    setDescription
  } = usePropertyAiDescription();

  // State to track if we're waiting for AI content
  const [waitingForAi, setWaitingForAi] = useState(false);
  const [hasLoadedAi, setHasLoadedAi] = useState(false);

  // Get MLS ID from property
  const mlsId = propertyData?.ListingKey || propertyData?.listingKey || propertyData?.MLS_NUMBER || propertyData?.mls_number || '';

  // Auto-load existing AI description when component mounts
  useEffect(() => {
    // If we have AI description from backend, use it immediately
    if (backendAiDescription && (backendAiDescription.exists || backendAiDescription.overview || backendAiDescription.detailed)) {
      setDescription({
        overview: backendAiDescription.overview,
        detailed: backendAiDescription.detailed
      });
      setHasLoadedAi(true);
      setWaitingForAi(false);
      return;
    }

    // Wait for AI generation - this is now PRIORITY
    if (mlsId && !backendAiDescription && !hasLoadedAi) {
      setWaitingForAi(true);

      // Check for existing content or wait for generation
      getAllContent(mlsId).then((result) => {
        if (result && result.description) {
          setHasLoadedAi(true);
          setWaitingForAi(false);
        }
        // Silently wait if not ready yet
      }).catch((error) => {
        // Silently wait for AI generation to complete
      });
    }
  }, [mlsId, backendAiDescription, hasLoadedAi]);

  // Listen for AI description updates from other components
  useEffect(() => {
    if (aiDescription && (aiDescription.overview || aiDescription.detailed)) {
      setHasLoadedAi(true);
      setWaitingForAi(false);
    }
  }, [aiDescription]);

  // Poll for AI completion when waiting
  useEffect(() => {
    if (waitingForAi && mlsId && !hasLoadedAi) {
      const pollInterval = setInterval(() => {
        getAllContent(mlsId).then((result) => {
          if (result && result.description) {
            setHasLoadedAi(true);
            setWaitingForAi(false);
            clearInterval(pollInterval);
          }
        }).catch(() => {
          // Continue polling silently on error
        });
      }, 3000); // Check every 3 seconds

      // Cleanup interval on unmount or when AI loads
      return () => clearInterval(pollInterval);
    }
  }, [waitingForAi, mlsId, hasLoadedAi]);
  // Format the address from the property data
  const formatAddress = () => {
    if (!propertyData) return '408 - 155 Dalhousie Street';
    
    // Check for already formatted address first (from controller)
    if (propertyData.address && typeof propertyData.address === 'string') {
      return propertyData.address;
    }
    
    // Otherwise build from individual fields
    const unit = propertyData.UnitNumber || propertyData.unitNumber || propertyData.ApartmentNumber || propertyData.apartmentNumber || '';
    const streetNumber = propertyData.StreetNumber || propertyData.streetNumber || '';
    const streetName = propertyData.StreetName || propertyData.streetName || '';
    const streetSuffix = propertyData.StreetSuffix || propertyData.streetSuffix || '';
    
    if (unit) {
      return `${unit} - ${streetNumber} ${streetName} ${streetSuffix}`.trim();
    }
    return `${streetNumber} ${streetName} ${streetSuffix}`.trim();
  };

  // Format price
  const formatPrice = (price) => {
    if (!price || price === 0) return 'Price on request';
    return '$' + price.toLocaleString();
  };

  // Generate basic description from property data
  const generateBasicDescription = () => {
    if (!propertyData) return 'Property information is loading...';

    // Try multiple field name variations for property data
    const type = propertyData.PropertySubType || propertyData.propertySubType || propertyData.propertyType || 'Property';
    const bedrooms = propertyData.BedroomsTotal || propertyData.bedroomsTotal || propertyData.bedrooms || propertyData.Bedrooms || 0;
    const bathrooms = propertyData.BathroomsTotal || propertyData.bathroomsTotal || propertyData.bathrooms || propertyData.Bathrooms || propertyData.BathroomTotal || propertyData.bathroomTotal || 0;
    const sqft = propertyData.LivingArea || propertyData.livingArea || propertyData.LivingAreaRange || null;
    const price = formatPrice(propertyData.ListPrice || propertyData.listPrice || propertyData.price);

    // Don't show bedroom/bathroom count if it's 0 or missing
    const bedroomText = bedrooms > 0 ? `${bedrooms} bedroom${bedrooms > 1 ? 's' : ''}` : 'bedroom';
    const bathroomText = bathrooms > 0 ? `${bathrooms} bathroom${bathrooms > 1 ? 's' : ''}` : 'bathroom';

    let description = `This ${type.toLowerCase()} features ${bedroomText} and ${bathroomText}`;

    if (sqft && sqft !== 'N/A' && sqft > 0) {
      description += ` with ${sqft} square feet of living space`;
    }

    description += `. Listed at ${price}, this property offers a great opportunity in a desirable location.`;

    return description;
  };

  // Get property description (prioritize AI content)
  const getDescription = () => {
    // Check for AI content from multiple sources - PRIORITIZE DETAILED over OVERVIEW
    const aiDetailedContent = aiDescription?.detailed || backendAiDescription?.detailed;
    const aiOverviewContent = aiDescription?.overview || backendAiDescription?.overview;

    // Use detailed description if available, otherwise use overview
    const aiContent = aiDetailedContent || aiOverviewContent;

    if (aiContent) {
      // Show loading indicator is no longer needed once we have AI content
      if (waitingForAi) {
        setWaitingForAi(false);
        setHasLoadedAi(true);
      }
      return {
        main: aiContent,
        amenities: '',
        transportation: '',
        isAiGenerated: true,
        isLoading: false
      };
    }

    // Try to use property remarks first if no AI content
    const propertyRemarks = propertyData?.PublicRemarks || propertyData?.publicRemarks || propertyData?.description;
    if (propertyRemarks && propertyRemarks.trim() && !waitingForAi) {
      return {
        main: propertyRemarks,
        amenities: '',
        transportation: '',
        isAiGenerated: false,
        isLoading: false
      };
    }

    // Show basic description as fallback (when waiting for AI or no content)
    const basicDescription = generateBasicDescription();
    return {
      main: basicDescription,
      amenities: '',
      transportation: '',
      isAiGenerated: false,
      isLoading: waitingForAi || aiLoading
    };
  };

  const description = getDescription();
  const address = formatAddress();

  return (
    <section className="bg-white md:py-8 ">
      <div className="mx-auto max-w-[950px]">
        <div className="bg-white">
          <div className="flex items-center justify-center gap-2 mb-4 md:mb-6">
            <h2 className="text-center font-space-grotesk font-bold text-lg md:text-xl leading-tight" style={{ color: '#293056' }}>
              {address}
            </h2>
            {description.isAiGenerated && auth?.user?.role === 'admin' && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                AI Generated
              </span>
            )}
          </div>
          <div className="space-y-4 md:space-y-6 text-sm md:text-base leading-relaxed md:leading-normal" style={{ fontFamily: 'Work Sans', fontWeight: 400 }}>
            {/* Show AI content directly without loading indicators */}
            {description.main && (
              <p className="text-gray-700">
                {description.main}
              </p>
            )}
            {description.amenities && (
              <p className="text-gray-700">
                {description.amenities}
              </p>
            )}
            {description.transportation && (
              <p className="text-gray-700">
                {description.transportation}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
