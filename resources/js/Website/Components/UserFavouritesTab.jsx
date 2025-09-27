import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import PropertyCardV5 from '@/Website/Global/Components/PropertyCards/PropertyCardV5';
import LazyPropertyCard from '@/Website/Global/Components/PropertyCards/LazyPropertyCard';

export default function UserFavouritesTab({ onCountUpdate }) {
  const [savedProperties, setSavedProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFavourites();
  }, []);

  const fetchFavourites = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/favourites/properties/with-data', {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched favorites data:', data);

        const formattedFavourites = (data.data || []).map(fav => {
          // Format property data to match PropertyCardV5 requirements
          const propertyData = fav.property_data || {};

          return {
            id: fav.id,
            ListingKey: fav.property_listing_key,
            listingKey: fav.property_listing_key,

            // Price information
            ListPrice: fav.property_price || propertyData.ListPrice,

            // Address information
            StreetNumber: propertyData.StreetNumber || '',
            StreetName: propertyData.StreetName || '',
            StreetSuffix: propertyData.StreetSuffix || '',
            UnitNumber: propertyData.UnitNumber || propertyData.ApartmentNumber || '',
            City: fav.property_city || propertyData.City || '',
            StateOrProvince: propertyData.StateOrProvince || 'ON',
            PostalCode: propertyData.PostalCode || '',

            // Property details
            BedroomsTotal: propertyData.BedroomsTotal || 0,
            BathroomsTotalInteger: propertyData.BathroomsTotalInteger || 0,
            LivingAreaRange: propertyData.LivingAreaRange || propertyData.LivingArea || '',
            PropertyType: propertyData.PropertyType || fav.property_type || 'Residential',
            PropertySubType: propertyData.PropertySubType || '',
            StandardStatus: propertyData.StandardStatus || 'Active',

            // Additional data
            savedDate: formatTimeAgo(fav.created_at),
            // Try multiple sources for image
            imageUrl: fav.property_data?.MediaURL ||
                     fav.property_data?.images?.[0] ||
                     fav.property_data?.imageUrl ||
                     propertyData.MediaURL ||
                     propertyData.images?.[0] ||
                     propertyData.imageUrl ||
                     propertyData.Photos?.[0]?.Uri ||
                     propertyData.Photos?.[0]?.MediaURL ||
                     null,
            originalPropertyData: fav
          };
        });

        console.log('Formatted favorites:', formattedFavourites);
        setSavedProperties(formattedFavourites);
        // Update parent component with count
        if (onCountUpdate) {
          onCountUpdate(formattedFavourites.length);
        }
      }
    } catch (error) {
      console.error('Error fetching favourites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const saved = new Date(date);
    const diffTime = Math.abs(now - saved);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  };

  const removeFavourite = async (listingKey) => {
    try {
      const response = await fetch('/api/favourites/properties', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: JSON.stringify({
          property_listing_key: listingKey
        })
      });

      if (response.ok) {
        const updatedProperties = savedProperties.filter(prop => prop.listingKey !== listingKey);
        setSavedProperties(updatedProperties);
        // Update parent component with count
        if (onCountUpdate) {
          onCountUpdate(updatedProperties.length);
        }

        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successMsg.innerHTML = '<span class="flex items-center gap-2">💔 Property removed from favourites</span>';
        document.body.appendChild(successMsg);

        setTimeout(() => {
          successMsg.style.transition = 'opacity 0.3s';
          successMsg.style.opacity = '0';
          setTimeout(() => successMsg.remove(), 300);
        }, 2500);
      }
    } catch (error) {
      console.error('Error removing favourite:', error);
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-space-grotesk font-bold text-[#293056]">
            Saved Properties
          </h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-[#293056] border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-gray-600">Loading your favourites...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-space-grotesk font-bold text-[#293056]">
          Saved Properties
        </h2>
        {savedProperties.length > 0 && (
          <Link
            href="/user/favourites"
            className="text-sm text-[#293056] hover:text-[#1e2142] font-medium"
          >
            View all favourites →
          </Link>
        )}
      </div>

      {savedProperties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {savedProperties.map((property) => (
            <PropertyCardV5
              key={property.id}
              property={property}
              isBuilding={false}
              onFavoriteChange={() => removeFavourite(property.ListingKey)}
              isFavorited={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No saved properties yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start browsing and save properties you're interested in by clicking the heart icon
          </p>
          <Link
            href="/search"
            className="inline-flex items-center px-6 py-3 bg-[#293056] text-white rounded-lg font-medium hover:bg-[#1e2142] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            Browse Properties
          </Link>
        </div>
      )}

    </div>
  );
}