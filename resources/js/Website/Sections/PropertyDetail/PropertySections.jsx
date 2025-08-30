import React from 'react';
import { FAQ } from '@/Website/Global/Components';
import {
  PropertyStatusTabs,
  PriceHistory,
  TourSection,
  MoreBuildings,
  ComparableSales,
  MerchandiseLofts,
} from '@/Website/Components/PropertyDetail';
import PropertyDescriptionSection from '@/Website/Components/PropertyDetail/PropertyDescriptionSection';

export default function PropertySections({ 
  propertyData, 
  sampleSaleProperties, 
  sampleRentProperties,
  auth 
}) {
  return (
    <div className="min-h-screen space-y-4 font-work-sans overflow-x-hidden">

     {/* Property Status and Navigation Tabs */}
      <PropertyStatusTabs property={propertyData} />
      {/* Price History Section */}
      <PriceHistory propertyData={propertyData} />
      
      {/* The Merchandise Lofts Section */}
      <MerchandiseLofts propertyData={propertyData} />
      
      {/* Dynamic Buildings/Listings Section */}
      <MoreBuildings 
        title={propertyData.details?.type?.toLowerCase().includes('condo') 
          ? "More Buildings By Agent" 
          : "Nearby Listings"
        } 
      />
      
      {/* Similar Listings Section - Using same MoreBuildings component for consistency */}
      <MoreBuildings 
        title="Similar Listings"
      />
      
      {/* Comparable Sales Section - Only visible to logged-in users */}
      {auth?.user && <ComparableSales />}
      
      {/* Properties For Sale Section - Using Global PropertyCarousel
      <section className="py-4 bg-gray-50">
        <div className="mx-auto px-4 md:px-0 max-w-screen-[1280px]">
          <PropertyCarousel
            properties={sampleSaleProperties}
            title="Properties For Sale"
            type="sale"
            viewAllLink="/properties"
          />
        </div>
      </section>
      
      {/* Properties For Rent Section - Using Global PropertyCarousel */}
      {/* <section className="py-4 bg-gray-50">
        <div className="mx-auto px-4 md:px-0 max-w-screen-[1280px]">
          <PropertyCarousel
            properties={sampleRentProperties}
            title="Properties For Rent"
            type="rent"
            viewAllLink="/properties"
          />
        </div>
      </section> */} 
      
      {/* Comparable Sales Section */}
      
      {/* Property Description Section */}
      <PropertyDescriptionSection propertyData={propertyData} />

      {/* FAQ Section */}
      <div className="faq-section">
        <FAQ />
      </div>

 
    </div>
  );
}
