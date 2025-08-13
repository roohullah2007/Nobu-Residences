import React from 'react';
import { PropertyCarouselV2, FAQ } from '@/Website/Global/Components';
import {
  PropertyStatusTabs,
  PriceHistory,
  TourSection,
  MoreBuildings,
  ComparableSales,
  MerchandiseLofts,
} from '@/Website/Components/PropertyDetail';
import RealEstateLinksSection from '@/Website/Components/PropertyDetail/RealEstateLinksSection';
import PropertyDescriptionSection from '@/Website/Components/PropertyDetail/PropertyDescriptionSection';

export default function PropertySections({ 
  propertyData, 
  sampleSaleProperties, 
  sampleRentProperties 
}) {
  return (
    <div className="min-h-screen space-y-4 font-work-sans overflow-x-hidden">

     {/* Property Status and Navigation Tabs */}
      <PropertyStatusTabs property={propertyData} />
      {/* Price History Section */}
      <PriceHistory propertyData={propertyData} />
      
      {/* The Merchandise Lofts Section */}
      <MerchandiseLofts />
      
      {/* Dynamic Buildings/Listings Section */}
      <MoreBuildings 
        title={propertyData.details?.type?.toLowerCase().includes('condo') 
          ? "More Buildings By Agent" 
          : "Nearby Listings"
        } 
      />
      
      {/* Similar Listings Section - Using Global PropertyCarouselV2 */}
      <section className="py-4">
        <div className="mx-auto max-w-[1280px]">
          <PropertyCarouselV2
            properties={sampleSaleProperties.concat(sampleRentProperties)}
            title="Similar Listings"
            viewAllLink="/properties"
            showBackground={true}
          />
        </div>
      </section>
      
      {/* Comparable Sales Section */}
      <ComparableSales />
      
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
      <PropertyDescriptionSection />

      {/* FAQ Section */}
      <div className="faq-section">
        <FAQ />
      </div>

 
    </div>
  );
}
