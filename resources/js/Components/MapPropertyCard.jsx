import React from 'react';
import { createRoot } from 'react-dom/client';
import PropertyCardV5 from '@/Website/Global/Components/PropertyCards/PropertyCardV5';

/**
 * MapPropertyCard - Wrapper for PropertyCardV5 to be used in Google Maps info windows
 */
const MapPropertyCard = ({ property, onClose }) => {
    // Format property data for PropertyCardV5
    // Use the same image that's shown in the property list (imageUrl field)
    const formattedProperty = {
        id: property.ListingKey || property.listingKey,
        listingKey: property.ListingKey || property.listingKey,
        price: property.ListPrice || property.price,
        bedrooms: property.BedroomsTotal || property.bedrooms,
        bathrooms: property.BathroomsTotalInteger || property.bathrooms,
        sqft: property.AboveGradeFinishedArea || property.sqft,
        parking: property.ParkingTotal || property.parking,
        address: property.UnparsedAddress || property.address,
        propertyType: property.PropertySubType || property.propertyType,
        transactionType: property.TransactionType || property.transactionType,
        city: property.City || property.city,
        province: property.StateOrProvince || property.province,
        source: property.source || 'mls',
        // Use imageUrl which should be the same as what's shown in the list
        imageUrl: property.imageUrl || property.MediaURL || property.image_url,
        images: property.Images || property.images || []
    };

    const handleCardClick = () => {
        // Navigate to property detail page using window.location
        // Since we're in an info window, we can't use Inertia router directly
        window.location.href = `/property/${property.ListingKey}`;
    };

    // Format price
    const formatPrice = (price) => {
        if (!price || price <= 0) return 'Price on request';
        if (price >= 1000000) return '$' + (price / 1000000).toFixed(1) + 'M';
        if (price >= 1000) return '$' + Math.round(price / 1000) + 'K';
        return '$' + price.toLocaleString();
    };

    // Build features display
    const buildFeatures = (bedrooms, bathrooms) => {
        const features = [];
        if (bedrooms > 0) features.push(bedrooms + ' Bed' + (bedrooms > 1 ? 's' : ''));
        if (bathrooms > 0) features.push(bathrooms + ' Bath' + (bathrooms > 1 ? 's' : ''));
        return features.join(' | ');
    };

    return (
        <div className="map-property-card-wrapper" style={{ width: '240px' }}>
            {/* Custom compact card for map */}
            <div 
                onClick={handleCardClick} 
                className="cursor-pointer map-card-compact bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
            >
                {/* Image */}
                <div className="relative" style={{ height: '115px' }}>
                    <img 
                        src={formattedProperty.imageUrl || '/images/no-image.jpg'} 
                        alt={formattedProperty.address}
                        className="w-full h-full object-cover"
                        style={{ height: '115px' }}
                    />
                    {/* Price badge */}
                    <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-bold shadow">
                        {formatPrice(formattedProperty.price)}
                    </div>
                </div>
                
                {/* Content - reduced spacing */}
                <div className="p-2.5">
                    {/* Property Type and MLS# on same line */}
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-sm text-gray-900">
                            {formattedProperty.propertyType || 'Residential'}
                        </span>
                        <span className="text-xs text-gray-600">
                            MLS#: {formattedProperty.listingKey}
                        </span>
                    </div>
                    
                    {/* Address */}
                    <div className="text-sm text-gray-700 mb-1 line-clamp-1">
                        {formattedProperty.address}
                    </div>
                    
                    {/* Features */}
                    <div className="text-xs text-gray-600">
                        {buildFeatures(formattedProperty.bedrooms, formattedProperty.bathrooms)}
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Render PropertyCardV5 in a Google Maps info window
 */
export const renderPropertyCardInInfoWindow = (property, infoWindow, map) => {
    // Create a container div for the smaller card
    const container = document.createElement('div');
    container.id = `map-card-${property.ListingKey || property.listingKey}`;
    container.style.width = '240px';
    container.style.maxWidth = '240px';
    
    // Create React root and render the component
    const root = createRoot(container);
    
    const handleClose = () => {
        infoWindow.close();
    };
    
    // Render the component
    root.render(<MapPropertyCard property={property} onClose={handleClose} />);
    
    // Set the content
    infoWindow.setContent(container);
    
    // Force a re-render after a short delay to ensure proper display
    setTimeout(() => {
        if (infoWindow && infoWindow.getMap()) {
            // Trigger resize event to ensure proper rendering
            window.google.maps.event.trigger(infoWindow, 'domready');
        }
    }, 100);
    
    // Return cleanup function
    return () => {
        setTimeout(() => {
            try {
                root.unmount();
            } catch (e) {
                // Ignore unmount errors
            }
        }, 100);
    };
};

export default MapPropertyCard;