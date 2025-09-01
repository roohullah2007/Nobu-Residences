import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/Website/Global/MainLayout';
import Navbar from '@/Website/Global/Navbar';
import { ViewingRequestModal, FAQ, RealEstateLinksSection } from '@/Website/Global/Components';
import PropertiesForSale from '@/Website/Components/Property/PropertiesForSale';
import PropertiesForRent from '@/Website/Components/Property/PropertiesForRent';

export default function SchoolDetail({ 
  auth, 
  siteName, 
  siteUrl, 
  year, 
  schoolId, 
  schoolSlug, 
  schoolData: initialSchoolData 
}) {
  const [schoolData, setSchoolData] = useState(initialSchoolData);
  const [isLoading, setIsLoading] = useState(!initialSchoolData);
  const [viewingModal, setViewingModal] = useState({
    isOpen: false,
    property: null
  });

  // Global function to open viewing modal from property cards
  useEffect(() => {
    window.openViewingModal = (property) => {
      setViewingModal({
        isOpen: true,
        property: property
      });
    };

    // Cleanup
    return () => {
      delete window.openViewingModal;
    };
  }, []);

  const handleCloseViewingModal = () => {
    setViewingModal({
      isOpen: false,
      property: null
    });
  };

  // Fetch school data if not provided
  useEffect(() => {
    if (!initialSchoolData && (schoolId || schoolSlug)) {
      fetchSchoolData();
    }
  }, [schoolId, schoolSlug]);

  const fetchSchoolData = async () => {
    setIsLoading(true);
    try {
      const endpoint = schoolSlug 
        ? `/api/schools/slug/${schoolSlug}` 
        : `/api/schools/${schoolId}`;
      
      const response = await fetch(endpoint);
      const result = await response.json();
      
      if (result.success) {
        setSchoolData(result.data);
      } else {
        console.error('Failed to fetch school data:', result.message);
      }
    } catch (error) {
      console.error('Error fetching school data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout siteName={siteName} siteUrl={siteUrl} year={year}>
        <Head title={`Loading School... - ${siteName}`} />
        <div className='bg-[#293056] w-screen h-[85px] md:h-[120px] mb-10'>
          <Navbar auth={auth} />
        </div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block w-16 h-16 border-4 border-[#293056] border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-[#293056] text-xl font-medium">Loading school details...</div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!schoolData) {
    return (
      <MainLayout siteName={siteName} siteUrl={siteUrl} year={year}>
        <Head title={`School Not Found - ${siteName}`} />
        <div className='bg-[#293056] w-screen h-[85px] md:h-[120px] mb-10'>
          <Navbar auth={auth} />
        </div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-[#293056] text-xl font-medium mb-4">School not found</div>
            <button 
              onClick={() => window.history.back()}
              className="bg-[#293056] text-white px-6 py-2 rounded-lg hover:bg-[#1f2442] transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout siteName={siteName} siteUrl={siteUrl} year={year}>
      <Head title={`${schoolData.name} - School Details - ${siteName}`} />
      
      <div className='bg-[#293056] w-screen h-[85px] md:h-[120px] mb-10'>
        <Navbar auth={auth} />
      </div>

      <div className="overflow-x-hidden px-4 md:px-0">
        {/* School Hero Section */}
        <section className="py-16 bg-white relative z-10">
          <div className="max-w-[1280px] mx-auto">
            {/* School Header */}
            <div className="mb-8">
              <h1 className="font-space-grotesk font-bold text-[40px] leading-[50px] text-[#293056] tracking-tight mb-3">
                {schoolData.name}
              </h1>
              <div className="font-work-sans font-medium text-lg leading-[27px] text-[#293056] tracking-tight">
                {schoolData.school_type_label} {schoolData.grade_level_label} School
              </div>
              {schoolData.school_board && (
                <div className="font-work-sans font-normal text-base text-gray-600 mt-2">
                  {schoolData.school_board}
                </div>
              )}
            </div>

            {/* School Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {/* Contact Information */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="font-space-grotesk font-bold text-xl text-[#293056] mb-4">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-work-sans font-medium text-gray-700">Address:</span>
                    <p className="font-work-sans text-gray-600">
                      {schoolData.address}, {schoolData.city}, {schoolData.province} {schoolData.postal_code}
                    </p>
                  </div>
                  {schoolData.phone && (
                    <div>
                      <span className="font-work-sans font-medium text-gray-700">Phone:</span>
                      <p className="font-work-sans text-gray-600">
                        <a href={`tel:${schoolData.phone}`} className="hover:underline">
                          {schoolData.phone}
                        </a>
                      </p>
                    </div>
                  )}
                  {schoolData.email && (
                    <div>
                      <span className="font-work-sans font-medium text-gray-700">Email:</span>
                      <p className="font-work-sans text-gray-600">
                        <a href={`mailto:${schoolData.email}`} className="hover:underline">
                          {schoolData.email}
                        </a>
                      </p>
                    </div>
                  )}
                  {schoolData.website_url && (
                    <div>
                      <span className="font-work-sans font-medium text-gray-700">Website:</span>
                      <p className="font-work-sans text-gray-600">
                        <a 
                          href={schoolData.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Visit School Website
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* School Information */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="font-space-grotesk font-bold text-xl text-[#293056] mb-4">
                  School Information
                </h3>
                <div className="space-y-3">
                  {schoolData.principal_name && (
                    <div>
                      <span className="font-work-sans font-medium text-gray-700">Principal:</span>
                      <p className="font-work-sans text-gray-600">{schoolData.principal_name}</p>
                    </div>
                  )}
                  {schoolData.student_capacity && (
                    <div>
                      <span className="font-work-sans font-medium text-gray-700">Capacity:</span>
                      <p className="font-work-sans text-gray-600">{schoolData.student_capacity} students</p>
                    </div>
                  )}
                  {schoolData.established_year && (
                    <div>
                      <span className="font-work-sans font-medium text-gray-700">Established:</span>
                      <p className="font-work-sans text-gray-600">{schoolData.established_year}</p>
                    </div>
                  )}
                  {schoolData.rating && (
                    <div>
                      <span className="font-work-sans font-medium text-gray-700">Rating:</span>
                      <p className="font-work-sans text-gray-600">{schoolData.rating}/10</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Programs & Facilities */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="font-space-grotesk font-bold text-xl text-[#293056] mb-4">
                  Programs & Facilities
                </h3>
                <div className="space-y-3">
                  {schoolData.programs && schoolData.programs.length > 0 && (
                    <div>
                      <span className="font-work-sans font-medium text-gray-700">Programs:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {schoolData.programs.slice(0, 3).map((program, index) => (
                          <span 
                            key={index}
                            className="bg-[#293056] text-white px-2 py-1 rounded text-xs"
                          >
                            {program}
                          </span>
                        ))}
                        {schoolData.programs.length > 3 && (
                          <span className="text-gray-500 text-xs">
                            +{schoolData.programs.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {schoolData.languages && schoolData.languages.length > 0 && (
                    <div>
                      <span className="font-work-sans font-medium text-gray-700">Languages:</span>
                      <p className="font-work-sans text-gray-600">
                        {schoolData.languages.join(', ')}
                      </p>
                    </div>
                  )}
                  {schoolData.facilities && schoolData.facilities.length > 0 && (
                    <div>
                      <span className="font-work-sans font-medium text-gray-700">Facilities:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {schoolData.facilities.slice(0, 4).map((facility, index) => (
                          <span 
                            key={index}
                            className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs"
                          >
                            {facility}
                          </span>
                        ))}
                        {schoolData.facilities.length > 4 && (
                          <span className="text-gray-500 text-xs">
                            +{schoolData.facilities.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* School Description */}
            {schoolData.description && (
              <div className="mb-12">
                <h3 className="font-space-grotesk font-bold text-2xl text-[#293056] mb-4">
                  About {schoolData.name}
                </h3>
                <p className="font-work-sans text-gray-700 leading-relaxed">
                  {schoolData.description}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Properties Section */}
        <section className="py-8 bg-gray-50 relative z-10" style={{minHeight: '500px'}}>
          <div className="mx-auto space-y-10 md:px-0 max-w-[1280px]">
            <div className="text-center mb-8">
              <h2 className="font-space-grotesk font-bold text-3xl text-[#293056] mb-4">
                Properties Near {schoolData.name}
              </h2>
              <p className="font-work-sans text-gray-600 max-w-2xl mx-auto">
                Discover homes and condos in the area close to this school. Perfect for families looking for educational convenience.
              </p>
            </div>
            
            {/* Properties For Sale Component */}
            <PropertiesForSale />
            
            {/* Properties For Rent Component */}
            <PropertiesForRent />
          </div>
        </section>

        {/* FAQ Section */}
        <FAQ 
          title="School Information FAQs"
          containerClassName="py-4 md:py-16 bg-white"
          showContainer={true}
        />

        <div className='max-w-[1280px] mx-auto'>
          {/* Real Estate Links Section */}
          <RealEstateLinksSection />
        </div>
      </div>

      {/* Global Viewing Request Modal */}
      <ViewingRequestModal 
        isOpen={viewingModal.isOpen}
        onClose={handleCloseViewingModal}
        property={viewingModal.property}
      />
    </MainLayout>
  );
}
