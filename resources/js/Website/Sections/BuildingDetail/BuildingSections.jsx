import React from 'react';
import { FAQ } from '@/Website/Global/Components';
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
    <div className="min-h-screen font-work-sans overflow-x-hidden flex flex-col gap-y-4">
      {/* Building Status and Navigation Tabs */}
      <BuildingStatusTabs building={buildingData} />

      {/* Price History Section - Hidden for now */}
      {/* <div data-price-history>
        <PriceHistory propertyData={buildingData} />
      </div> */}

      {/* The Merchandise Lofts Section */}

      {/* <MerchandiseLofts /> */}

      {/* Properties For Sale Section - Fetch condo apartments dynamically */}
      <MoreBuildings
        title="Properties For Sale"
        propertyType="Condo Apartment"
        transactionType="For Sale"
        buildingData={buildingData}
      />

      {/* Properties For Rent Section - Fetch condo apartments dynamically */}
      <MoreBuildings
        title="Properties For Rent"
        propertyType="Condo Apartment"
        transactionType="For Rent"
        buildingData={buildingData}
      />

      {/* Nearby Buildings Section - Fetch from backend */}
      <MoreBuildings
        title="Nearby Buildings"
        fetchType="buildings"
        buildingData={buildingData}
      />

      {/* Similar Buildings Section - Fetch from backend */}
      <MoreBuildings
        title="Similar Buildings"
        fetchType="buildings"
        buildingData={buildingData}
      />
             
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