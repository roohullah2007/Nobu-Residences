import React from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/Website/Global/MainLayout';
import TermsContent from '@/Website/Sections/Terms/TermsContent';

export default function Terms({ auth, siteName, siteUrl, year, website }) {
  return (
    <MainLayout siteName={siteName} siteUrl={siteUrl} year={year} website={website} auth={auth}>
      <Head title={`Terms of Service - ${siteName}`} />
      
      <div className="idx mx-auto overflow-hidden bg-primary">
        <div className="px-4 md:px-0 max-w-[1024px] mx-auto">
          
          {/* Page Header */}
          <div className="mb-10">
            <div className="text-center">
              <h1 className="font-space-grotesk font-bold text-3xl md:text-5xl leading-tight tracking-[-0.03em] text-[#293056] mb-4">
                Terms of Service
              </h1>
              <p className="font-work-sans font-normal text-lg leading-7 tracking-[-0.03em] text-gray-600 max-w-2xl mx-auto">
                Please read these terms and conditions carefully before using our services.
              </p>
              <p className="font-work-sans font-normal text-sm text-gray-500 mt-4">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="mb-12">
            <TermsContent website={website} siteName={siteName} />
          </div>
          
        </div>
      </div>
    </MainLayout>
  );
}
