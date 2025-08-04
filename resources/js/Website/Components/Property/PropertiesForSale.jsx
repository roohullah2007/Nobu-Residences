import React from 'react';
import { PropertyCarousel } from '@/Website/Global/Components';

const PropertiesForSale = ({ forSaleProperties = null }) => {
  // Sample properties for sale data
  const defaultForSaleProperties = [
    {
      id: 1,
      listingKey: "X9234419",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&auto=format&q=80",
      price: 0, // Price on request
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
    },
    {
      id: 4,
      listingKey: "N7058480",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80",
      price: 625000,
      propertyType: "Condo Apartment",
      transactionType: "For Sale",
      bedrooms: 2,
      bathrooms: 1,
      address: "150-420 Highway 7 #, Richmond Hill, ON",
      isRental: false
    },
    {
      id: 5,
      listingKey: "N7058481",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop&auto=format&q=80",
      price: 1250000,
      propertyType: "Detached",
      transactionType: "For Sale",
      bedrooms: 4,
      bathrooms: 3,
      address: "155-430 Highway 7 #, Richmond Hill, ON",
      isRental: false
    },
    {
      id: 6,
      listingKey: "N7058482",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop&auto=format&q=80",
      price: 850000,
      propertyType: "Townhouse",
      transactionType: "For Sale",
      bedrooms: 3,
      bathrooms: 2,
      address: "160-440 Highway 7 #, Richmond Hill, ON",
      isRental: false
    }
  ];

  const propertiesData = forSaleProperties || defaultForSaleProperties;

  return (
    <PropertyCarousel
      properties={propertiesData}
      title="Properties For Sale"
      type="sale"
      viewAllLink="/properties"
    />
  );
};

export default PropertiesForSale;