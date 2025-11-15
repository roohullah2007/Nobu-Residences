import React, { useEffect } from 'react';
import { FAQ, PropertyCarousel } from '@/Website/Global/Components';
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
  auth,
  buildingData,
  aiDescription
}) {
  // Log AI description and FAQs for debugging (minimal logging)
  useEffect(() => {
    if (aiDescription) {
      if (aiDescription.overview || aiDescription.detailed) {
        console.log('✅ AI description displayed');
      }

      if (aiDescription.faqs && aiDescription.faqs.length > 0) {
        console.log(`✅ AI FAQs displayed (${aiDescription.faqs.length} questions)`);
      }
    }
  }, [aiDescription]);

  return (
    <div className="min-h-screen flex flex-col gap-4 font-work-sans overflow-x-hidden">

     {/* Property Status and Navigation Tabs */}
      <PropertyStatusTabs property={propertyData} buildingData={buildingData} aiDescription={aiDescription} auth={auth} />
      {/* Price History Section - Hidden for now */}
      {/* <PriceHistory propertyData={propertyData} /> */}
      
      {/* The Merchandise Lofts Section */}
      <MerchandiseLofts propertyData={propertyData} />

      {/* Building Amenities are shown in the tabs section only */}

      {/* Condo Apartments Section - Show if property is in a building with condos */}
      {propertyData.details?.type?.toLowerCase().includes('condo') && (
        <section className="py-4">
          <div className="mx-auto max-w-[1280px]">
            <PropertyCarousel
              properties={propertyData.buildingCondoApartments || [
                // Sample condo apartments for demonstration
                {
                  id: 1,
                  listingKey: "C5234419",
                  imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&auto=format&q=80",
                  price: 650000,
                  propertyType: "Condo Apartment",
                  transactionType: "For Sale",
                  bedrooms: 2,
                  bathrooms: 2,
                  address: "Unit 1205, Same Building",
                  isRental: false
                },
                {
                  id: 2,
                  listingKey: "C1209765",
                  imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop&auto=format&q=80",
                  price: 899000,
                  propertyType: "Condo Apartment",
                  transactionType: "For Sale",
                  bedrooms: 3,
                  bathrooms: 2,
                  address: "Unit 2104, Same Building",
                  isRental: false
                }
              ]}
              title="Condo Apartments in This Building"
              type="sale"
              viewAllLink={`/properties?propertyType=Condo+Apartment&buildingId=${propertyData.buildingId}`}
            />
          </div>
        </section>
      )}
      
      {/* Dynamic Buildings/Listings Section */}
      <MoreBuildings
        title={propertyData.details?.type?.toLowerCase().includes('condo')
          ? "More Buildings By Agent"
          : "Nearby Listings"
        }
        propertyData={propertyData}
      />

      {/* Comparable Sales Section - Show sold properties instead of similar listings */}
      <ComparableSales
        title="Comparable Sales"
        propertyData={propertyData}
      />
      
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
      <PropertyDescriptionSection propertyData={propertyData} aiDescription={aiDescription} auth={auth} />

      {/* FAQ Section */}
      <div className="faq-section">
        <FAQ
          faqItems={aiDescription?.faqs ? aiDescription.faqs.map((faq, index) => ({
            id: faq.id || index + 1,
            question: faq.question,
            answer: faq.answer
          })) : null}
          isAiGenerated={!!aiDescription?.faqs && aiDescription.faqs.length > 0}
          isAdmin={auth?.user?.role === 'admin'}
        />
      </div>

 
    </div>
  );
}
