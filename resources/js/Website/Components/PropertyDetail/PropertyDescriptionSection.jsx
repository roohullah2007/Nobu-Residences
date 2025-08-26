import React from 'react';

export default function PropertyDescriptionSection({ propertyData }) {
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

  // Get property description
  const getDescription = () => {
    if (!propertyData) {
      return {
        main: "Located at 22 Dutch Myrtle Way, this North York condo is available for sale. 22 Dutch Myrtle Way has an asking price of $998800, and has been on the market since April 2025. This condo has 3 bedrooms, 2 bathrooms and is 1800-1999 sqft. Situated in North York's Banbury | Don Mills neighbourhood, Parkwoods-Donalda, Victoria Village, Flemingdon Park and Bridle Path | Sunnybrook | York Mills are nearby neighbourhoods.",
        amenities: "Dutch Myrtleway is only a 3 minute walk from Tim Hortons for that morning caffeine fix and if you're not in the mood to cook, Panera Bread, Jack Astor's Bar & Grill and Congee Queen are near this condo. Nearby grocery options: McEwan is a 4-minute walk.",
        transportation: "Living in this Banbury | Don Mills condo is easy. There is also Don Mills Rd at The Donway East (North) Bus Stop, only steps away, with route Don Mills, and route Don Mills Night Bus nearby. If you're driving from Dutch Myrtleway, you'll have easy access to the rest of the city by way of Don Valley Parkway as well, which is within a 4-minute drive using Wynford Dr ramps."
      };
    }

    const address = formatAddress();
    // Handle both raw API fields and controller-mapped fields
    const city = propertyData.City || propertyData.city || 'Toronto';
    const propertyType = propertyData.PropertySubType || propertyData.propertySubType || propertyData.PropertyType || propertyData.propertyType || 'property';
    const listPrice = formatPrice(propertyData.ListPrice || propertyData.listPrice || propertyData.price);
    const bedrooms = propertyData.BedroomsTotal || propertyData.bedroomsTotal || propertyData.bedrooms || propertyData.BedroomsAboveGrade || 0;
    const bathrooms = propertyData.BathroomsTotalInteger || propertyData.bathroomsTotalInteger || propertyData.bathrooms || 0;
    const sqft = propertyData.LivingAreaRange || propertyData.livingAreaRange || propertyData.livingArea || propertyData.AboveGradeFinishedArea || 'N/A';
    const neighbourhood = propertyData.CityRegion || propertyData.cityRegion || '';
    const transactionType = propertyData.TransactionType || propertyData.transactionType || 'For Sale';
    
    // Public remarks from API - check both possible field names
    // Controller maps PublicRemarks to 'description' field
    const publicRemarks = propertyData.PublicRemarks || propertyData.description || '';
    
    // If we have public remarks, use them as the main description
    if (publicRemarks) {
      return {
        main: publicRemarks,
        amenities: propertyData.Inclusions || propertyData.inclusions ? `Includes: ${propertyData.Inclusions || propertyData.inclusions}` : '',
        transportation: propertyData.Directions || propertyData.directions || ''
      };
    }

    // Otherwise, build a description from available data
    const main = `Located at ${address}, this ${city} ${propertyType} is available ${transactionType.toLowerCase()}. ${address} has an asking price of ${listPrice}. This ${propertyType} has ${bedrooms} bedroom${bedrooms !== 1 ? 's' : ''}, ${bathrooms} bathroom${bathrooms !== 1 ? 's' : ''}${sqft !== 'N/A' ? ` and is ${sqft} sqft` : ''}. ${neighbourhood ? `Situated in ${neighbourhood}.` : ''}`;
    
    const amenities = propertyData.AssociationAmenities && propertyData.AssociationAmenities.length > 0 
      ? `Building amenities include: ${propertyData.AssociationAmenities.join(', ')}.`
      : '';
    
    const transportation = propertyData.CrossStreet 
      ? `Near ${propertyData.CrossStreet}. ${propertyData.Directions || ''}`
      : propertyData.Directions || '';

    return { main, amenities, transportation };
  };

  const description = getDescription();
  const address = formatAddress();

  return (
    <section className="bg-white md:py-8 ">
      <div className="mx-auto max-w-[950px]">
        <div className="bg-white">
          <h2 className="mb-4 md:mb-6 text-center font-space-grotesk font-bold text-lg md:text-xl leading-tight" style={{ color: '#293056' }}>
            {address}
          </h2>
          <div className="space-y-4 md:space-y-6 text-sm md:text-base leading-relaxed md:leading-normal" style={{ fontFamily: 'Work Sans', fontWeight: 400 }}>
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
