import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import Navbar from '@/Website/Global/Navbar';
import Footer from '@/Website/Global/Footer';
import { ViewingRequestModal, FAQ, RealEstateLinksSection } from '@/Website/Global/Components';
import PropertiesForSale from '@/Website/Components/Property/PropertiesForSale';
import PropertiesForRent from '@/Website/Components/Property/PropertiesForRent';
import ContactAgentModal from '@/Website/Components/ContactAgentModal';

export default function SchoolDetail({
  auth,
  website,
  siteName,
  siteUrl,
  year,
  schoolId,
  schoolSlug,
  schoolData: initialSchoolData
}) {
  const [schoolData, setSchoolData] = useState(initialSchoolData);
  const [isLoading, setIsLoading] = useState(!initialSchoolData);
  const [showContactModal, setShowContactModal] = useState(false);
  const [viewingModal, setViewingModal] = useState({
    isOpen: false,
    property: null
  });

  // Get brand colors for dynamic button styling
  const { globalWebsite } = usePage().props;
  const currentWebsite = globalWebsite || website || {};
  const brandColors = currentWebsite?.brand_colors || {
    primary: '#912018',
    secondary: '#293056',
    button_secondary_bg: '#912018',
    button_secondary_text: '#FFFFFF'
  };
  const buttonSecondaryBg = brandColors.button_secondary_bg || '#912018';
  const buttonSecondaryText = brandColors.button_secondary_text || '#FFFFFF';

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

  // Extract school type from Google types or use default
  const getSchoolType = () => {
    if (schoolData?.school_type_label) {
      return schoolData.school_type_label;
    }
    if (schoolData?.types) {
      if (schoolData.types.includes('primary_school')) return 'Public';
      if (schoolData.types.includes('secondary_school')) return 'Public';
      if (schoolData.types.includes('school')) return 'Public';
    }
    return 'Public';
  };

  // Extract grade level
  const getGradeLevel = () => {
    if (schoolData?.grade_level_label) {
      return schoolData.grade_level_label;
    }
    if (schoolData?.types) {
      if (schoolData.types.includes('primary_school')) return 'Elementary';
      if (schoolData.types.includes('secondary_school')) return 'High School';
    }
    return 'Elementary';
  };

  // Parse address to get city and province
  const parseAddress = () => {
    const address = schoolData?.address || schoolData?.formatted_address || '';
    const parts = address.split(',').map(s => s.trim());
    const city = parts.length > 1 ? parts[parts.length - 2] : 'Toronto';
    const province = parts.length > 2 && parts[parts.length - 1].includes('ON') ? 'ON' : 'ON';
    return { city, province, full: address };
  };

  if (isLoading) {
    return (
      <>
        <Head title={`Loading School... - ${siteName}`} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block w-16 h-16 border-4 border-[#293056] border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-[#293056] text-xl font-medium">Loading school details...</div>
          </div>
        </div>
      </>
    );
  }

  if (!schoolData) {
    return (
      <>
        <Head title={`School Not Found - ${siteName}`} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-[#293056] text-xl font-medium mb-4">School not found</div>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 rounded-lg hover:opacity-90 transition-colors"
              style={{ backgroundColor: buttonSecondaryBg, color: buttonSecondaryText }}
            >
              Go Back
            </button>
          </div>
        </div>
      </>
    );
  }

  const { city, province, full: fullAddress } = parseAddress();

  return (
    <>
      <Head title={`${schoolData.name} - School Details - ${siteName}`} />

      {/* Hero Section with School background */}
      <div className="relative bg-cover bg-center bg-no-repeat font-work-sans min-h-screen md:h-[895px]" style={{
        backgroundImage: `url('/assets/school/school-bg.jpg')`
      }}>
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent"></div>

        {/* Header */}
        <Navbar auth={auth} website={website} />

        {/* Hero Section */}
        <main className="relative px-4 md:px-0 z-10 flex max-w-[1280px] mx-auto flex-col items-center justify-center md:h-[calc(895px-140px)] pt-36 md:pt-60 py-8 md:py-0">
          <div className="w-full">
            {/* Top Section - School Information Card and Agent Card */}
            <div className="flex w-full flex-col md:flex-row justify-between items-start mb-16 md:mb-16 space-y-6 md:space-y-0 md:space-x-6">

              {/* School Information Card */}
              <div className="w-full md:max-w-[593px]">
                <div className="flex flex-col justify-center items-center p-4 sm:p-6 gap-2 w-full bg-white/10 backdrop-blur-xl rounded-xl">
                  <div className="flex flex-col justify-center items-center p-0 gap-4 sm:gap-6 w-full">
                    {/* First Row */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-0 gap-2 sm:gap-3.5 w-full">
                      <div className="w-full sm:flex-1 font-work-sans text-base sm:text-lg leading-6 sm:leading-7 flex items-center tracking-wider text-white">
                        <span className="font-bold">Type:</span>
                        <span className="font-normal ml-1" style={{fontWeight: 400}}>
                          {getSchoolType()}
                        </span>
                      </div>
                      <div className="w-full sm:flex-1 font-work-sans text-base sm:text-lg leading-6 sm:leading-7 flex items-center tracking-wider text-white">
                        <span className="font-bold">Language:</span>
                        <span className="font-normal ml-1" style={{fontWeight: 400}}>
                          {schoolData.languages?.join(', ') || 'English'}
                        </span>
                      </div>
                    </div>

                    {/* Second Row */}
                    <div className="flex flex-col sm:flex-row justify-between items-start p-0 gap-2 sm:gap-3.5 w-full">
                      <div className="w-full sm:flex-1 font-work-sans text-base sm:text-lg leading-6 sm:leading-7 flex items-start tracking-wider text-white">
                        <div className="break-words">
                          <span className="font-bold">Board:</span>
                          <span className="font-normal ml-1" style={{fontWeight: 400}}>
                            {schoolData.school_board || 'Toronto District School Board'}
                          </span>
                        </div>
                      </div>
                      <div className="w-full sm:flex-1 font-work-sans text-base sm:text-lg leading-6 sm:leading-7 flex items-start tracking-wider text-white">
                        <div className="break-all">
                          <span className="font-bold">Website:</span>
                          {schoolData.website_url ? (
                            <a
                              href={schoolData.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-normal ml-1 underline hover:no-underline"
                              style={{fontWeight: 400}}
                            >
                              {schoolData.website_url}
                            </a>
                          ) : (
                            <span className="font-normal ml-1" style={{fontWeight: 400}}>
                              Not available
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Third Row */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-0 gap-2 sm:gap-3.5 w-full">
                      <div className="w-full sm:flex-1 font-work-sans text-base sm:text-lg leading-6 sm:leading-7 flex items-center tracking-wider text-white">
                        <span className="font-bold">Level:</span>
                        <span className="font-normal ml-1" style={{fontWeight: 400}}>
                          {getGradeLevel()}
                        </span>
                      </div>
                      <div className="w-full sm:flex-1 font-work-sans text-base sm:text-lg leading-6 sm:leading-7 flex items-center tracking-wider text-white">
                        <span className="font-bold">Phone:</span>
                        {schoolData.phone ? (
                          <a
                            href={`tel:${schoolData.phone}`}
                            className="font-normal ml-1 underline hover:no-underline"
                            style={{fontWeight: 400}}
                          >
                            {schoolData.phone}
                          </a>
                        ) : (
                          <span className="font-normal ml-1" style={{fontWeight: 400}}>
                            Not available
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agent Card */}
              <div className="w-full md:max-w-[448px]">
                <div className="flex flex-col items-start p-4 sm:p-[18px_27px] gap-2.5 w-full bg-white/10 backdrop-blur-xl rounded-tl-3xl rounded-br-3xl rounded-3xl">
                  <div className="flex flex-col items-start p-0 gap-4 sm:gap-6 w-full">
                    {/* Agent Header */}
                    <div className="flex flex-row items-center p-0 gap-3 sm:gap-4 w-full">
                      {/* Avatar */}
                      {(website?.agent_info?.profile_image || website?.contact_info?.agent?.image) && (
                        <div
                          className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 border-2 border-[#293056] rounded-full bg-cover bg-center"
                          style={{
                            backgroundImage: `url('${website?.agent_info?.profile_image || website?.contact_info?.agent?.image}')`
                          }}
                        />
                      )}

                      {/* Agent Info */}
                      <div className="flex flex-col items-start p-0 flex-1 min-w-0">
                        {/* Name */}
                        {(website?.agent_info?.agent_name || website?.contact_info?.agent?.name) && (
                          <div className="w-full font-space-grotesk font-bold text-sm sm:text-base leading-5 sm:leading-[26px] flex items-center tracking-wider uppercase text-[#293056] truncate">
                            {(website?.agent_info?.agent_name || website?.contact_info?.agent?.name).toUpperCase()}
                          </div>
                        )}

                        {/* Title */}
                        {(website?.agent_info?.agent_title || website?.contact_info?.agent?.title) && (
                          <div className="w-full font-work-sans font-bold text-xs sm:text-sm leading-5 sm:leading-6 flex items-center tracking-wider text-[#7E2410] truncate">
                            {website?.agent_info?.agent_title || website?.contact_info?.agent?.title}
                          </div>
                        )}

                        {/* Company */}
                        {(website?.agent_info?.brokerage || website?.contact_info?.agent?.brokerage) && (
                          <div className="w-full font-work-sans font-medium text-sm sm:text-base leading-5 sm:leading-[25px] flex items-center tracking-wider text-[#293056] truncate">
                            {website?.agent_info?.brokerage || website?.contact_info?.agent?.brokerage}
                          </div>
                        )}

                        {/* Phone */}
                        {(website?.agent_info?.agent_phone || website?.contact_info?.agent?.phone) && (
                          <div className="w-full font-work-sans font-bold text-sm sm:text-base leading-5 sm:leading-[25px] flex items-center tracking-wider text-[#293056]">
                            {website?.agent_info?.agent_phone || website?.contact_info?.agent?.phone}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contact Button */}
                    <button
                      onClick={() => setShowContactModal(true)}
                      className="flex justify-center items-center w-full h-10 sm:h-12 rounded-full hover:opacity-90 transition-opacity duration-200"
                      style={{ backgroundColor: buttonSecondaryBg, color: buttonSecondaryText }}
                    >
                      <span className="font-work-sans font-bold text-sm sm:text-base leading-5 sm:leading-6 tracking-wider whitespace-nowrap">
                        Contact agent
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section - School Information */}
            <div className="w-full">
              {/* Left Content */}
              <div className="flex-1 max-w-full md:max-w-2xl">
                {/* School Name */}
                <h1 className="text-white font-bold mb-4 sm:mb-6 font-space-grotesk text-2xl sm:text-3xl md:text-4xl md:text-5xl xl:text-[65px] leading-tight tracking-wider">
                  {schoolData.name}
                </h1>

                {/* Address */}
                <p className="text-white mb-3 sm:mb-4 font-work-sans text-base sm:text-lg font-bold tracking-wider">
                  {fullAddress || `${city}, ${province}`}
                </p>

                {/* Description */}
                <p className="text-white mb-6 sm:mb-8 font-work-sans text-base sm:text-lg font-medium tracking-wider">
                  {getSchoolType()} {getGradeLevel()} School in {city}, {province}
                </p>

                {/* Rating Button */}
                {schoolData.rating && (
                  <button className="flex justify-center items-center w-full sm:w-[203px] h-12 sm:h-16 rounded-full hover:opacity-90 transition-opacity duration-200" style={{ backgroundColor: buttonSecondaryBg, color: buttonSecondaryText }}>
                    <span className="font-work-sans font-bold text-base sm:text-lg leading-6 sm:leading-7 tracking-wider whitespace-nowrap">
                      Rating: {schoolData.rating}/10
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <div className="overflow-x-hidden px-4 md:px-0">
        {/* School Information Section */}
        <section className="py-4 md:py-8 bg-white relative z-10">
          <div className="max-w-[1280px] mx-auto">
            {/* School Description */}
            {schoolData.description ? (
              <>
                <h2 className="font-space-grotesk font-bold text-2xl text-[#293056] mb-4">
                  About {schoolData.name}
                </h2>
                <p className="font-work-sans text-gray-700 leading-relaxed mb-4 md:mb-8">
                  {schoolData.description}
                </p>
              </>
            ) : (
              <>
                <h2 className="font-space-grotesk font-bold text-2xl text-[#293056] mb-4">
                  About {schoolData.name}
                </h2>
                <p className="font-work-sans text-gray-700 leading-relaxed mb-4 md:mb-8">
                  {schoolData.name} is a {getSchoolType().toLowerCase()} {getGradeLevel().toLowerCase()} school
                  located in {city}, {province}. The school serves the local community with quality education
                  and various programs designed to help students reach their full potential.
                </p>
              </>
            )}

            {/* Opening Hours - for Google Places schools */}
            {schoolData.opening_hours && schoolData.opening_hours.length > 0 && (
              <div className="mb-4">
                <h3 className="font-space-grotesk font-bold text-2xl text-[#293056] mb-4">
                  Opening Hours
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {schoolData.opening_hours.map((hours, index) => (
                    <div key={index} className="font-work-sans text-gray-700">
                      {hours}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional School Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Programs */}
              {schoolData.programs && schoolData.programs.length > 0 && (
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="font-space-grotesk font-bold text-xl text-[#293056] mb-4">
                    Programs Offered
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {schoolData.programs.map((program, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded text-sm"
                        style={{ backgroundColor: buttonSecondaryBg, color: buttonSecondaryText }}
                      >
                        {program}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Facilities */}
              {schoolData.facilities && schoolData.facilities.length > 0 && (
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="font-space-grotesk font-bold text-xl text-[#293056] mb-4">
                    Facilities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {schoolData.facilities.map((facility, index) => (
                      <span
                        key={index}
                        className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm"
                      >
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Principal & Capacity */}
              {(schoolData.principal_name || schoolData.student_capacity) && (
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="font-space-grotesk font-bold text-xl text-[#293056] mb-4">
                    School Information
                  </h3>
                  <div className="space-y-2">
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
                  </div>
                </div>
              )}
            </div>

            {/* Reviews section removed */}
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

            {/* Properties For Sale Component - Pass school address */}
            <PropertiesForSale
              schoolAddress={fullAddress}
              auth={auth}
            />

            {/* Properties For Rent Component - Pass school address */}
            <PropertiesForRent
              schoolAddress={fullAddress}
              auth={auth}
            />
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

      {/* Contact Agent Modal */}
      <ContactAgentModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        agentData={{
          name: website?.agent_info?.agent_name || website?.contact_info?.agent?.name,
          title: website?.agent_info?.agent_title || website?.contact_info?.agent?.title,
          phone: website?.agent_info?.agent_phone || website?.contact_info?.agent?.phone,
          brokerage: website?.agent_info?.brokerage || website?.contact_info?.agent?.brokerage,
          image: website?.agent_info?.profile_image || website?.contact_info?.agent?.image
        }}
        propertyData={{
          BuildingName: schoolData?.name || 'School Property'
        }}
        auth={auth}
        websiteSettings={{ website }}
      />

      {/* Footer */}
      <Footer
        siteName={siteName}
        siteUrl={siteUrl}
        year={year}
        website={website}
        auth={auth}
      />
    </>
  );
}