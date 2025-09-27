import React from 'react';

const Amenities = ({ propertyData = null }) => {
  // Define amenities with their respective icons and names
  const defaultAmenities = [
    { icon: 'concierge', name: 'Concierge' },
    { icon: 'gym', name: 'Gym' },
    { icon: 'bed', name: 'Guest Suites' },
    { icon: 'pool-ladder', name: 'Outdoor Pool' },
    { icon: 'party-horn', name: 'Party Room' },
    { icon: 'parking', name: 'Visitor Parking' },
    { icon: 'pets', name: 'Pet Restriction' },
    { icon: 'media', name: 'Media Room' },
    { icon: 'meeting-consider-deliberate-about-meet', name: 'Meeting Room' },
    { icon: 'parking-garage-transportation-car-parking', name: 'Parking Garage' },
    { icon: 'bbq-grill', name: 'BBQ Permitted' },
    { icon: 'deck-chair-under-the-sun', name: 'Rooftop Deck' },
    { icon: 'police-security-policeman', name: 'Security Guard' },
    { icon: 'security', name: 'Security System' }
  ];

  // Get amenities data from property or use default
  const getAmenitiesData = () => {
    if (propertyData?.amenities && Array.isArray(propertyData.amenities)) {
      return propertyData.amenities;
    }
    return defaultAmenities;
  };

  const amenitiesData = getAmenitiesData();

  // Simple SVG icons as components for the amenities
  const getIconSVG = (iconName) => {
    const iconMap = {
      'concierge': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 5.5V7.5L21 9ZM1 9L7 7.5V5.5L1 7V9ZM12 7C14.21 7 16 8.79 16 11V12H8V11C8 8.79 9.79 7 12 7ZM6 14C6.55 14 7 14.45 7 15V22H5V15C5 14.45 5.45 14 6 14ZM18 14C18.55 14 19 14.45 19 15V22H17V15C17 14.45 17.45 14 18 14Z" fill="currentColor"/>
        </svg>
      ),
      'gym': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.57 14.86L22 13.43L20.57 12L17 15.57L8.43 7L12 3.43L10.57 2L9.14 3.43L7.71 2L5.57 4.14L4.14 2.71L2.71 4.14L4.14 5.57L2 7.71L3.43 9.14L2 10.57L3.43 12L7 8.43L15.57 17L12 20.57L13.43 22L14.86 20.57L16.29 22L18.43 19.86L19.86 21.29L21.29 19.86L19.86 18.43L22 16.29L20.57 14.86Z" fill="currentColor"/>
        </svg>
      ),
      'bed': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 13C8.1 13 9 12.1 9 11S8.1 9 7 9 5 9.9 5 11 5.9 13 7 13ZM19 7H11V15H3V5H1V18H3V17H21V18H23V10C23 8.3 21.7 7 20 7H19Z" fill="currentColor"/>
        </svg>
      ),
      'pool-ladder': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 21V19H4V17H2V15H4V13H2V11H4V9H2V7H4V5H2V3H4V1H6V3H8V1H10V21H8V19H6V21H2ZM6 5V7H8V5H6ZM6 9V11H8V9H6ZM6 13V15H8V13H6ZM6 17V19H8V17H6ZM14 7C15.11 7 16 7.89 16 9V15C16 16.11 15.11 17 14 17C12.89 17 12 16.11 12 15V9C12 7.89 12.89 7 14 7ZM18 3V21H20V3H18Z" fill="currentColor"/>
        </svg>
      ),
      'party-horn': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.5 1L7 6V16L11.5 21L12.5 21L17 16V6L12.5 1H11.5ZM12 3.2L15 6.5V15.5L12 18.8L9 15.5V6.5L12 3.2ZM12 7C10.9 7 10 7.9 10 9S10.9 11 12 11 14 10.1 14 9 13.1 7 12 7ZM5 8V10H3V12H5V14H7V12H9V10H7V8H5ZM19 12V14H21V16H19V18H17V16H15V14H17V12H19Z" fill="currentColor"/>
        </svg>
      ),
      'parking': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 3H12C14.2 3 16 4.8 16 7S14.2 11 12 11H8V15H6V3ZM8 5V9H12C13.1 9 14 8.1 14 7S13.1 5 12 5H8ZM18 17V19H20V21H18V19H16V17H18ZM22 17V19H24V21H22V19H20V17H22Z" fill="currentColor"/>
        </svg>
      ),
      'pets': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4.5 13C5.6 13 6.5 12.1 6.5 11S5.6 9 4.5 9 2.5 9.9 2.5 11 3.4 13 4.5 13ZM9 13C10.1 13 11 12.1 11 11S10.1 9 9 9 7 9.9 7 11 7.9 13 9 13ZM15 13C16.1 13 17 12.1 17 11S16.1 9 15 9 13 9.9 13 11 13.9 13 15 13ZM19.5 13C20.6 13 21.5 12.1 21.5 11S20.6 9 19.5 9 17.5 9.9 17.5 11 18.4 13 19.5 13ZM17.3 15.8C16.1 16.6 14.6 17 13 17S9.9 16.6 8.7 15.8C8.4 15.6 8 15.7 7.8 16C7.6 16.3 7.7 16.7 8 16.9C9.5 17.9 11.2 18.4 13 18.4S16.5 17.9 18 16.9C18.3 16.7 18.4 16.3 18.2 16C18 15.7 17.6 15.6 17.3 15.8Z" fill="currentColor"/>
        </svg>
      ),
      'media': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 3V5H22V3H18ZM18 7V9H22V7H18ZM18 11V13H22V11H18ZM16 3H2V5H16V3ZM16 7H2V9H16V7ZM16 11H2V13H16V11ZM2 15H22V17H2V15ZM2 19H22V21H2V19Z" fill="currentColor"/>
        </svg>
      ),
      'meeting-consider-deliberate-about-meet': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 6C13.66 6 15 7.34 15 9S13.66 12 12 12 9 10.66 9 9 10.34 6 12 6ZM12 20C9.33 20 7.01 18.83 5.61 17.09C6.86 15.5 9.3 14.5 12 14.5S17.14 15.5 18.39 17.09C16.99 18.83 14.67 20 12 20Z" fill="currentColor"/>
        </svg>
      ),
      'parking-garage-transportation-car-parking': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 11L6.5 6.5H17.5L19 11H17V12H19V14H17V21H15V14H9V21H7V14H5V12H7V11H5ZM6.85 8.5L6.5 9.5H17.5L17.15 8.5H6.85ZM8 16V19H10V16H8ZM14 16V19H16V16H14Z" fill="currentColor"/>
        </svg>
      ),
      'bbq-grill': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.3 10.775Q8.8 11.8 7.4 11.8Q6 11.8 5.5 10.775Q5 9.75 5.95 9.75Q6.9 9.75 9.3 10.775ZM18.5 10.775Q18 11.8 16.6 11.8Q15.2 11.8 14.7 10.775Q14.2 9.75 15.15 9.75Q16.1 9.75 18.5 10.775ZM12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2ZM7 18C7 16.9 7.9 16 9 16S11 16.9 11 18V22H7V18ZM13 18C13 16.9 13.9 16 15 16S17 16.9 17 18V22H13V18Z" fill="currentColor"/>
        </svg>
      ),
      'deck-chair-under-the-sun': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2ZM2 12H4V14H2V12ZM20 12H22V14H20V12ZM11 3.5V5.5H13V3.5H11ZM11 18.5V20.5H13V18.5H11ZM4.93 6.05L6.34 7.46L7.76 6.05L6.34 4.64L4.93 6.05ZM16.24 17.95L17.66 19.36L19.07 17.95L17.66 16.54L16.24 17.95ZM17.66 4.64L16.24 6.05L17.66 7.46L19.07 6.05L17.66 4.64ZM6.34 16.54L4.93 17.95L6.34 19.36L7.76 17.95L6.34 16.54Z" fill="currentColor"/>
        </svg>
      ),
      'police-security-policeman': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 7C13.1 7 14 7.9 14 9S13.1 11 12 11 10 10.1 10 9 10.9 7 12 7ZM12 17C9.33 17 7.01 15.84 5.61 14.09C6.86 12.5 9.3 11.5 12 11.5S17.14 12.5 18.39 14.09C16.99 15.84 14.67 17 12 17Z" fill="currentColor"/>
        </svg>
      ),
      'security': (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z" fill="currentColor"/>
        </svg>
      )
    };

    return iconMap[iconName] || iconMap['concierge']; // Default to concierge icon if not found
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Amenities Styles */
          .idx-property-amenities.features-amenities-container {
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              margin-bottom: 16px;
              overflow: hidden;
          }

          .idx-property-amenities.features-header {
              background-color: #FBF9F7;
              padding: 16px;
              padding-top: 6px;
              padding-bottom: 6px;
              border-bottom: 1px solid #e5e7eb;
          }

          .idx-property-amenities.features-title {
              font-weight: 700;
              font-size: 14px;
              margin: 0;
          }

          .idx-property-amenities.features-subtitle-section {
              padding: 16px;
          }

          .idx-property-amenities.features-subtitle {
              color: #727272;
              font-weight: 500;
              font-size: 14px;
              margin: 0;
          }

          .idx-property-amenities.amenities-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 40px 50px;
              padding: 16px;
          }

          .idx-property-amenities.amenity-item {
              display: flex;
              align-items: center;
          }

          .idx-property-amenities.amenity-icon {
              margin-right: 8px;
              width: 24px;
              height: 24px;
              color: #374151;
          }

          .idx-property-amenities.amenity-text {
              font-size: 14px;
              color: #374151;
          }

          /* Mobile responsive */
          @media (max-width: 1024px) {
            .idx-property-amenities.amenities-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }

          @media (max-width: 768px) {
            .idx-property-amenities.amenities-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
            }
          }

          @media (max-width: 640px) {
            .idx-property-amenities.amenities-grid {
              grid-template-columns: 1fr;
              gap: 20px;
            }
          }
        `
      }} />
      
      <div className="idx-property-amenities features-amenities-container">
        <div className="idx-property-amenities features-header">
          <h3 className="idx-property-amenities features-title">Features & Amenities</h3>
        </div>

        <div className="idx-property-amenities features-subtitle-section">
          <p className="idx-property-amenities features-subtitle">View available facilities</p>
        </div>

        <div className="idx-property-amenities amenities-grid">
          {amenitiesData.map((amenity, index) => (
            <div key={index} className="idx-property-amenities amenity-item">
              <div className="idx-property-amenities amenity-icon">
                {getIconSVG(amenity.icon)}
              </div>
              <span className="idx-property-amenities amenity-text">{amenity.name}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Amenities;