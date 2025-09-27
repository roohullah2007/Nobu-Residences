import { useState, useEffect } from 'react';

/**
 * Custom hook for managing property favourites
 * 
 * @param {Object} property - Property object containing at least listingKey
 * @param {Object} auth - Auth object from Inertia
 * @returns {Object} - { isFavourited, toggleFavourite, isLoading }
 */
export const usePropertyFavourite = (property, auth) => {
  const [isFavourited, setIsFavourited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if user is authenticated
  const isAuthenticated = auth?.user ? true : false;
  const listingKey = property?.listingKey || property?.ListingKey || property?.id;

  // Check favourite status on mount if user is authenticated
  useEffect(() => {
    if (isAuthenticated && listingKey && !isInitialized) {
      checkFavouriteStatus();
    } else if (!isAuthenticated) {
      setIsFavourited(false);
      setIsInitialized(true);
    }
  }, [isAuthenticated, listingKey]);

  const checkFavouriteStatus = async () => {
    if (!listingKey) return;
    
    try {
      const response = await fetch('/api/favourites/properties/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: JSON.stringify({
          property_listing_key: listingKey
        })
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavourited(data.is_favourited || false);
      } else {
        console.error('Failed to check favourite status');
        setIsFavourited(false);
      }
    } catch (error) {
      console.error('Error checking favourite status:', error);
      setIsFavourited(false);
    } finally {
      setIsInitialized(true);
    }
  };

  const toggleFavourite = async () => {
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/login';
      return { success: false, requires_auth: true };
    }

    if (!listingKey) {
      console.error('No listing key provided for favourite toggle');
      return { success: false, message: 'Property ID missing' };
    }

    setIsLoading(true);
    
    try {
      // Prepare property data for storage
      const propertyData = {
        // Core identifiers
        listingKey: listingKey,
        ListingKey: listingKey,
        id: listingKey,

        // Images - CRITICAL for display
        MediaURL: property?.MediaURL || property?.imageUrl,
        imageUrl: property?.imageUrl || property?.MediaURL,
        images: property?.images || property?.Images || [],

        // Price information
        ListPrice: property?.price || property?.ListPrice || property?.ClosePrice,
        price: property?.price || property?.ListPrice || property?.ClosePrice,
        OriginalListPrice: property?.OriginalListPrice,
        originalPrice: property?.originalPrice || property?.OriginalListPrice,

        // Address information (formatted like search page)
        address: property?.address || property?.Address || property?.UnparsedAddress || property?.full_address,
        UnparsedAddress: property?.UnparsedAddress || property?.address,
        StreetNumber: property?.StreetNumber || property?.streetNumber,
        StreetName: property?.StreetName || property?.streetName,
        StreetSuffix: property?.StreetSuffix || property?.streetSuffix,
        UnitNumber: property?.UnitNumber || property?.unitNumber,
        City: property?.city || property?.City,
        StateOrProvince: property?.province || property?.StateOrProvince || 'ON',
        PostalCode: property?.PostalCode || property?.postalCode,

        // Property details
        PropertyType: property?.propertyType || property?.PropertyType,
        PropertySubType: property?.PropertySubType || property?.propertySubType || property?.propertyType,
        propertyType: property?.propertyType || property?.PropertyType || property?.PropertySubType,
        TransactionType: property?.TransactionType || property?.transactionType || 'For Sale',
        transactionType: property?.transactionType || property?.TransactionType || 'For Sale',

        // Status information - IMPORTANT for proper display
        StandardStatus: property?.StandardStatus || property?.status || 'Active',
        MlsStatus: property?.MlsStatus || property?.mlsStatus,
        formatted_status: property?.formatted_status,
        status: property?.status || property?.StandardStatus || 'Active',

        // Property specifications
        BedroomsTotal: property?.bedrooms || property?.BedroomsTotal,
        BathroomsTotalInteger: property?.bathrooms || property?.BathroomsTotalInteger,
        LivingAreaRange: property?.area || property?.LivingAreaRange || property?.sqft,
        AboveGradeFinishedArea: property?.AboveGradeFinishedArea,
        ParkingTotal: property?.parking || property?.ParkingTotal,

        // Additional MLS fields that might be needed
        GarageSpaces: property?.GarageSpaces || property?.garageSpaces,
        TaxAnnualAmount: property?.TaxAnnualAmount || property?.taxAmount,
        AssociationFee: property?.AssociationFee || property?.associationFee,
        YearBuilt: property?.YearBuilt || property?.yearBuilt,
        LotSizeSquareFeet: property?.LotSizeSquareFeet || property?.lotSize,

        // Dates
        listingDate: property?.listingDate || property?.ListingContractDate,
        ListingContractDate: property?.ListingContractDate || property?.listingDate,
        DaysOnMarket: property?.DaysOnMarket || property?.daysOnMarket,

        // Coordinates
        latitude: property?.latitude || property?.Latitude,
        longitude: property?.longitude || property?.Longitude,

        // Store complete property object for any missing fields
        ...property
      };

      const response = await fetch('/api/favourites/properties/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: JSON.stringify({
          property_listing_key: listingKey,
          property_data: propertyData,
          property_address: propertyData.address,
          property_price: propertyData.price,
          property_type: propertyData.propertyType,
          property_city: propertyData.City,
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setIsFavourited(data.is_favourited);
        
        // Show success message
        showFavouriteNotification(data.message, data.action);
        
        return {
          success: true,
          is_favourited: data.is_favourited,
          message: data.message,
          action: data.action
        };
      } else {
        console.error('Failed to toggle favourite:', data.message);
        return {
          success: false,
          message: data.message,
          requires_auth: data.requires_auth || false
        };
      }
    } catch (error) {
      console.error('Error toggling favourite:', error);
      return {
        success: false,
        message: 'Network error occurred'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const showFavouriteNotification = (message, action) => {
    // Create a temporary notification
    const notification = document.createElement('div');
    const isAdded = action === 'added';
    
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <span>${isAdded ? '❤️' : '💔'}</span>
        <span>${message}</span>
      </div>
    `;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${isAdded ? '#DC2626' : '#6B7280'};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;
    
    // Add animation keyframes if not already present
    if (!document.getElementById('favourite-notification-styles')) {
      const style = document.createElement('style');
      style.id = 'favourite-notification-styles';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

  return {
    isFavourited,
    toggleFavourite,
    isLoading,
    isAuthenticated,
    checkFavouriteStatus
  };
};

export default usePropertyFavourite;
