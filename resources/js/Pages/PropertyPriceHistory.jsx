import React from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/Website/Global/MainLayout';
import PriceHistory from '@/Website/Components/PropertyDetail/PriceHistory';
import PriceHistorySearchInput from '@/Website/Components/PriceHistorySearchInput';

/**
 * Full price history page for a single listing.
 * Route: /price-history/{listingKey}
 *
 * Universal target for the "View full price history" button — works for
 * any listing regardless of whether it's been matched to a building.
 * Includes the same autocomplete search input as the /price-history
 * landing page, pre-filled with this listing's address so the user can
 * pivot to another listing's history without leaving the page.
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
  // "813 - 15 Mercer Street"
  const subtitleAddress = (() => {
    const unit = property?.unitNumber || '';
    const street = [property?.streetNumber, property?.streetName, property?.streetSuffix]
      .filter(Boolean)
      .join(' ');
    const composed = unit ? `${unit} - ${street}` : street;
    return composed || property?.address || '';
  })();

  // Pre-fill the search box with the bare street address (no unit) so
  // the autocomplete returns useful matches at the same building/street.
  const prefillQuery = (() => {
    const street = [property?.streetNumber, property?.streetName, property?.streetSuffix]
      .filter(Boolean)
      .join(' ');
    return street || property?.address || '';
  })();

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

          <div className="mb-8">
            <PriceHistorySearchInput initialQuery={prefillQuery} />
          </div>

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
