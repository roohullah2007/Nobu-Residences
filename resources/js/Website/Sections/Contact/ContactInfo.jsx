import React from 'react';

export default function ContactInfo({ website }) {
  // Get contact info from website - no hardcoded fallbacks
  const contactInfo = website?.contact_info || {};
  const agentInfo = website?.agent_info || {};
  const socialMedia = website?.social_media || {};

  // Prioritize agent_info table for agent details
  const agentName = agentInfo?.agent_name || contactInfo?.agent?.name || '';
  const agentTitle = agentInfo?.agent_title || contactInfo?.agent?.title || '';
  const agentImage = agentInfo?.profile_image || contactInfo?.agent?.image || '';
  const agentPhone = agentInfo?.agent_phone || contactInfo?.phone || '';

  const brandColors = website?.brand_colors || {
    primary: '#912018',
    secondary: '#1d957d',
    accent: '#F5F8FF',
    text: '#000000',
    background: '#FFFFFF'
  };

  return (
    <div className="space-y-8">
      
      {/* Contact Information Card - only show if at least one contact method exists */}
      {(agentPhone || contactInfo?.email || contactInfo?.address) && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="font-space-grotesk font-bold text-xl mb-6" style={{ color: brandColors.primary }}>
            Get in Touch
          </h3>

          <div className="space-y-6">

            {/* Phone */}
            {agentPhone && (
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${brandColors.primary}20` }}>
                  <svg className="w-6 h-6" style={{ color: brandColors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="font-work-sans font-semibold text-gray-900 mb-1">Phone</h4>
                  <p className="font-work-sans text-gray-600">
                    <a href={`tel:${agentPhone}`} className="hover:underline">
                      {agentPhone}
                    </a>
                  </p>
                </div>
              </div>
            )}

            {/* Email */}
            {contactInfo?.email && (
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${brandColors.primary}20` }}>
                  <svg className="w-6 h-6" style={{ color: brandColors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="font-work-sans font-semibold text-gray-900 mb-1">Email</h4>
                  <p className="font-work-sans text-gray-600">
                    <a href={`mailto:${contactInfo.email}`} className="hover:underline break-all">
                      {contactInfo.email}
                    </a>
                  </p>
                </div>
              </div>
            )}

            {/* Address */}
            {contactInfo?.address && (
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${brandColors.primary}20` }}>
                  <svg className="w-6 h-6" style={{ color: brandColors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="font-work-sans font-semibold text-gray-900 mb-1">Address</h4>
                  <p className="font-work-sans text-gray-600">
                    {contactInfo.address}
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Agent Information Card - only show if agent data exists */}
      {(agentName || agentImage) && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="font-space-grotesk font-bold text-xl mb-6" style={{ color: brandColors.primary }}>
            Your Agent
          </h3>

          <div className="flex items-center space-x-4 mb-6">
            {agentImage && (
              <div className="w-16 h-16 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center overflow-hidden">
                <img
                  src={agentImage}
                  alt={agentName || 'Agent'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div className="absolute inset-0 bg-gray-300 rounded-full flex items-center justify-center hidden">
                  <span className="font-work-sans font-medium text-sm text-[#1C1463]">
                    {agentName ? agentName.split(' ').map(n => n[0]).join('') : ''}
                  </span>
                </div>
              </div>
            )}
            <div>
              {agentName && (
                <h4 className="font-space-grotesk font-bold text-lg" style={{ color: brandColors.primary }}>
                  {agentName}
                </h4>
              )}
              {agentTitle && (
                <p className="font-work-sans text-gray-600">
                  {agentTitle}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {agentPhone && (
              <a
                href={`tel:${agentPhone}`}
                className="block w-full py-3 text-white rounded-full font-work-sans font-medium transition-colors hover:bg-opacity-90 text-center"
                style={{ backgroundColor: brandColors.primary }}
              >
                Call Now
              </a>
            )}
            <button
              className="w-full py-3 border-2 rounded-full font-work-sans font-medium transition-colors hover:bg-gray-50"
              style={{ borderColor: brandColors.primary, color: brandColors.primary }}
            >
              Schedule Meeting
            </button>
          </div>
        </div>
      )}

      {/* Social Media Card - only show if at least one social link exists */}
      {(socialMedia?.facebook || socialMedia?.instagram || socialMedia?.linkedin || socialMedia?.twitter) && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="font-space-grotesk font-bold text-xl mb-6" style={{ color: brandColors.primary }}>
            Follow Us
          </h3>

          <div className="flex space-x-4">
            {socialMedia?.facebook && (
              <a
                href={socialMedia.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110"
                style={{ backgroundColor: '#1877F2' }}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
            )}

            {socialMedia?.instagram && (
              <a
                href={socialMedia.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110"
                style={{
                  background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)'
                }}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" clipRule="evenodd" />
                </svg>
              </a>
            )}

            {socialMedia?.linkedin && (
              <a
                href={socialMedia.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110"
                style={{ backgroundColor: '#0077B5' }}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
