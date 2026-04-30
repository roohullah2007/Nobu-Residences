import React from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/Website/Global/MainLayout';
import PriceHistory from '@/Website/Components/PropertyDetail/PriceHistory';

/**
 * Full price history page for a single listing.
 * Route: /price-history/{listingKey}
 *
 * Universal target for the "View full price history" button — works for
 * any listing (condos, houses, etc.) regardless of whether it's been
 * matched to a building. Reuses the same `PriceHistory` component used
 * inline on the property detail page, with `showAll` so every entry is
 * rendered without the inline preview cap.
 */
export default function PropertyPriceHistory({
  auth,
  siteName,
  siteUrl,
  year,
  property,
  priceHistory = [],
  website,
}) {
  // Compose a friendly subtitle ("813 - 15 Mercer Street")
  const subtitleAddress = (() => {
    const unit = property?.unitNumber || '';
    const street = [property?.streetNumber, property?.streetName, property?.streetSuffix]
      .filter(Boolean)
      .join(' ');
    const composed = unit ? `${unit} - ${street}` : street;
    return composed || property?.address || '';
  })();

  // The PriceHistory component reads `priceHistory` off `propertyData`,
  // plus the address fields used to render the section subtitle.
  const propertyData = {
    listingKey: property?.listingKey,
    UnitNumber: property?.unitNumber,
    StreetNumber: property?.streetNumber,
    StreetName: property?.streetName,
    StreetSuffix: property?.streetSuffix,
    address: property?.address,
    priceHistory,
  };

  return (
    <MainLayout
      siteName={siteName}
      siteUrl={siteUrl}
      year={year}
      website={website}
      auth={auth}
      blueHeader
      noPadding
    >
      <Head title={`Price History — ${subtitleAddress || 'Listing'}`} />

      <div className="bg-white min-h-screen">
        <div className="max-w-[1280px] mx-auto px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#293056] font-space-grotesk mb-1">
            Listing History
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Full price history for {subtitleAddress || 'this listing'}
          </p>

          <PriceHistory
            propertyData={propertyData}
            propertyImages={property?.images || (property?.imageUrl ? [property.imageUrl] : [])}
            showAll
          />
        </div>
      </div>
    </MainLayout>
  );
}
