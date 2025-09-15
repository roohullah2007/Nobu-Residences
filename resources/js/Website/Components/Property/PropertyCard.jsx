import React from 'react';
import { Link } from '@inertiajs/react';
import { formatPrice, formatAddress, getPropertyFeatures } from '@/Website/Utils/property-utils';

const PropertyCard = ({ property, buildingSlug = '15-mercer' }) => {
  // Format property data
  const price = formatPrice(property.ListPrice || property.price || 0, property.isRental);
  const bedrooms = property.BedroomsTotal || property.bedroomsTotal || property.bedrooms || 0;
  const bathrooms = property.BathroomsTotalInteger || property.bathroomsTotalInteger || property.bathrooms || 0;
  const sqft = property.LivingAreaRange || property.livingAreaRange || property.sqft || '';
  const parking = property.ParkingTotal || property.parkingTotal || property.parking || 0;
  const listingKey = property.ListingKey || property.listingKey || '';
  const propertyType = property.PropertySubType || property.propertyType || 'Property';
  const transactionType = property.TransactionType || property.transactionType || 'For Sale';
  const listOfficeName = property.ListOfficeName || property.listOfficeName || '';

  // Format address for display
  const unitNumber = property.UnitNumber || property.unitNumber || '';
  const streetNumber = property.StreetNumber || property.streetNumber || '';
  const streetName = property.StreetName || property.streetName || '';
  const displayAddress = unitNumber ? `${unitNumber} - ${streetNumber} ${streetName}` : `${streetNumber} ${streetName}`;

  // Get property image
  const imageUrl = property.MediaURL || property.imageUrl || property.image || '/images/placeholder-property.jpg';

  // Build property URL
  const propertyUrl = `/${buildingSlug}/${streetNumber}-${streetName.toLowerCase().replace(/\s+/g, '-')}-${unitNumber || 'unit'}/${listingKey}`;

  // Format transaction type for badge
  const statusBadgeText = transactionType === 'For Lease' ? 'For Rent' : transactionType;

  // Format sqft display
  const sqftDisplay = sqft ? (typeof sqft === 'string' ? sqft : `${sqft} sqft`) : '';

  return (
    <div className="flex flex-col w-[300px] min-h-0 idx-ampre-property-card bg-white border-gray-300 border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl group relative">
      <Link href={propertyUrl} className="flex flex-col h-full text-inherit no-underline">
        {/* Image Container */}
        <div className="relative w-full h-[200px] property-image-container overflow-hidden bg-gray-100 rounded-t-xl">
          <div className="relative overflow-hidden w-full h-full property-image lazy-property-image transition-transform duration-300 group-hover:scale-105">
            <img
              src={imageUrl}
              alt={`${propertyType} in ${displayAddress}`}
              className="w-full h-full object-cover transition-all duration-700 ease-out opacity-100 scale-100 blur-0"
              style={{ filter: 'blur(0px)' }}
              onError={(e) => {
                e.target.src = '/images/placeholder-property.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 animate-fade-in"></div>
          </div>

          {/* Badges */}
          <div className="absolute inset-2 flex flex-col justify-between">
            <div className="flex justify-between items-center gap-2.5 h-8">
              <span className="flex items-center justify-center px-3 py-1.5 text-sm property-badge h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm bg-white text-[#293056] border border-gray-200 status-badge">
                {statusBadgeText}
              </span>
              <span className="flex items-center justify-center px-3 py-1.5 text-sm property-badge h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm ml-auto bg-white text-[#293056] border border-gray-200">
                {propertyType}
              </span>
            </div>
            <div className="flex justify-end items-center gap-2.5 h-8"></div>
          </div>
        </div>

        {/* Property Details */}
        <div className="flex flex-col flex-grow items-start p-4 gap-2.5 box-border">
          {/* Price */}
          <div className="flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-bold text-lg leading-7 tracking-tight text-[#293056]">
            {price}
          </div>

          <div className="flex flex-col items-start gap-2 w-full">
            {/* Address */}
            <div className="flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-base leading-6 tracking-tight text-[#293056] line-clamp-2">
              {displayAddress}
            </div>

            {/* Features */}
            <div className="flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-sm leading-6 tracking-tight text-[#293056]">
              {bedrooms}BD | {bathrooms}BA{sqftDisplay ? ` | ${sqftDisplay}` : ''}{parking ? ` | ${parking} Parking` : ''}
            </div>

            {/* Brokerage */}
            {listOfficeName && (
              <div className="flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-sm leading-5 tracking-tight text-gray-600">
                {listOfficeName}
              </div>
            )}

            {/* MLS Number */}
            {listingKey && (
              <div className="flex items-center justify-start w-full min-h-8">
                <div className="font-work-sans font-normal text-base leading-6 tracking-tight text-[#293056]">
                  MLS#: {listingKey}
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PropertyCard;