import React from 'react';
import { PropertyCarouselV2, FAQ } from '@/Website/Global/Components';
import PropertyCarouselBuilding from './PropertyCarouselBuilding';
import { 
  PriceHistory,
  TourSection,
  MoreBuildings,
  ComparableSales,
  MerchandiseLofts,
} from '@/Website/Components/PropertyDetail';
import PropertyDescriptionSection from '@/Website/Components/PropertyDetail/PropertyDescriptionSection';
import BuildingStatusTabs from './BuildingStatusTabs';

export default function BuildingSections({ 
  buildingData,
  sampleSaleProperties,
  sampleRentProperties 
}) {
  return (
    <div className="min-h-screen space-y-4 font-work-sans overflow-x-hidden">
      {/* Building Status and Navigation Tabs */}
      <BuildingStatusTabs building={buildingData} />

      {/* Price History Section - Hidden for now */}
      {/* <div data-price-history>
        <PriceHistory propertyData={buildingData} />
      </div> */}
             
      {/* The Merchandise Lofts Section */}
      
      {/* <MerchandiseLofts /> */}
      
      {/* Properties For Sale Section - Using PropertyCarouselBuilding (2 cards) */}
      <section className="py-4">
        <div className="mx-auto max-w-[1280px]">
          <PropertyCarouselBuilding
            properties={sampleSaleProperties}
            title="Properties For Sale"
            viewAllLink="/properties"
            showBackground={true}
          />
        </div>
      </section>
             
      {/* Properties For Rent Section - Using PropertyCarouselBuilding (2 cards) */}
      <section className="py-4">
        <div className="mx-auto max-w-[1280px]">
          <PropertyCarouselBuilding
            properties={sampleRentProperties}
            title="Properties For Rent"
            viewAllLink="/properties"
            showBackground={true}
          />
        </div>
      </section>

      {/* Dynamic Buildings/Listings Section */}
      <MoreBuildings 
        title={buildingData.details?.type?.toLowerCase().includes('building')
          ? "More Buildings By Agent"
          : "Nearby Buildings"
        }
      />
             
      {/* Similar Listings Section - Using Global PropertyCarouselV2 */}
      <section className="py-4">
        <div className="mx-auto max-w-[1280px]">
          <PropertyCarouselV2
            properties={sampleSaleProperties.concat(sampleRentProperties)}
            title="Similar Buildings"
            viewAllLink="/properties"
            showBackground={true}
          />
        </div>
      </section>
             
      {/* Comparable Sales Section */}
      {/* <ComparableSales /> */}
             

             
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
             
      {/* Building Description Section */}
      {/* <PropertyDescriptionSection /> */}
       
      {/* FAQ Section */}
      <div className="faq-section">
        <FAQ />
      </div>
       
    </div>
  );
}