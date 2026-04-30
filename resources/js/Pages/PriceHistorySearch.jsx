import React from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/Website/Global/MainLayout';
import PriceHistorySearchInput from '@/Website/Components/PriceHistorySearchInput';

/**
 * Price History Search — landing page with autocomplete. The user types
 * an address or MLS number; selecting a suggestion navigates to that
 * listing's full price history.
 */
export default function PriceHistorySearch({
  auth,
  siteName,
  siteUrl,
  year,
  website,
}) {
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
      <Head title="Price History Search" />

      <div className="bg-white min-h-screen">
        <div className="max-w-[1280px] mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#293056] font-space-grotesk mb-3">
              Search Price History
            </h1>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Find the full listing history of any property — sold, leased,
              expired, and current listings — by address or MLS number.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <PriceHistorySearchInput autoFocus />
          </div>

          <p className="text-xs text-gray-500 text-center mt-6">
            Tip: paste an MLS number (like <code>C12345678</code>) to jump
            straight to that listing's price history.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
