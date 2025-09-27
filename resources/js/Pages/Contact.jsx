import React from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/Website/Global/MainLayout';
import ContactForm from '@/Website/Sections/Contact/ContactForm';
import ContactInfo from '@/Website/Sections/Contact/ContactInfo';

export default function Contact({ auth, siteName, siteUrl, year, website }) {
  return (
    <MainLayout siteName={siteName} siteUrl={siteUrl} year={year} website={website} auth={auth}>
      <Head title={`Contact Us - ${siteName}`} />
      
      <div className="idx mx-auto overflow-hidden bg-primary">
        <div className="px-4 md:px-0 max-w-[1280px] mx-auto">
          
          {/* Page Header */}
          <div className="mb-10 py-8">
            <div className="text-center">
              <h1 className="font-space-grotesk font-bold text-3xl md:text-5xl leading-tight tracking-[-0.03em] text-[#293056] mb-4">
                Contact Us
              </h1>
              <p className="font-work-sans font-normal text-lg leading-7 tracking-[-0.03em] text-gray-600 max-w-2xl mx-auto">
                Get in touch with our team for any questions about properties, viewings, or general inquiries.
              </p>
            </div>
          </div>

          <div className="flex md:flex-row flex-col gap-8 w-full mb-12">
            
            {/* Contact Form */}
            <div className="md:w-2/3">
              <ContactForm website={website} />
            </div>
            
            {/* Contact Information */}
            <div className="md:w-1/3">
              <ContactInfo website={website} />
            </div>
            
          </div>
          
        </div>
      </div>
    </MainLayout>
  );
}
