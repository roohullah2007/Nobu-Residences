import React from 'react';
import { PropertyCarousel } from '@/Website/Global/Components';

const PropertiesForRent = ({ forRentProperties = null }) => {
  // Sample properties for rent data
  const defaultForRentProperties = [
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
    },
    {
      id: 4,
      listingKey: "N7058485",
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop&auto=format&q=80",
      price: 2800,
      propertyType: "Condo Apartment",
      transactionType: "For Rent",
      bedrooms: 1,
      bathrooms: 1,
      address: "165-450 Highway 7 #, Richmond Hill, ON",
      isRental: true
    },
    {
      id: 5,
      listingKey: "N7058486",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop&auto=format&q=80",
      price: 3500,
      propertyType: "Townhouse",
      transactionType: "For Lease",
      bedrooms: 3,
      bathrooms: 2,
      address: "170-460 Highway 7 #, Richmond Hill, ON",
      isRental: true
    },
    {
      id: 6,
      listingKey: "N7058487",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop&auto=format&q=80",
      price: 4200,
      propertyType: "Detached",
      transactionType: "For Rent",
      bedrooms: 4,
      bathrooms: 3,
      address: "175-470 Highway 7 #, Richmond Hill, ON",
      isRental: true
    }
  ];

  const propertiesData = forRentProperties || defaultForRentProperties;

  return (
    <PropertyCarousel
      properties={propertiesData}
      title="Properties For Rent"
      type="rent"
      viewAllLink="/properties"
    />
  );
};

export default PropertiesForRent;