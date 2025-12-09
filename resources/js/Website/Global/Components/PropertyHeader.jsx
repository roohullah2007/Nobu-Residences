import React, { useState } from 'react';
import { Heart, Share, FacebookIcon, TwitterIcon, EmailIcon, LinkIcon } from '@/Website/Components/Icons';
import usePropertyFavourite from '@/hooks/usePropertyFavourite';
import { Link, usePage } from '@inertiajs/react';

export default function PropertyHeader({
  data,
  auth,
  type = 'property', // 'property' or 'building'
  buildingData = null // Building data for property location breadcrumb
}) {
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  // Use the favourite hook instead of local state
  const { isFavourited, toggleFavourite, isLoading: favouriteLoading, isAuthenticated } = usePropertyFavourite(data, auth);

  // Get brand colors from page props
  const { globalWebsite, website } = usePage().props;
  const currentWebsite = website || globalWebsite;
  const brandColors = currentWebsite?.brand_colors || {};
  const buttonPrimaryBg = brandColors.button_primary_bg || '#293056';
  const buttonPrimaryText = brandColors.button_primary_text || '#FFFFFF';
  const buttonQuaternaryBg = brandColors.button_quaternary_bg || '#FFFFFF';
  const buttonQuaternaryText = brandColors.button_quaternary_text || '#293056';

  const handleShare = (platform) => {
    const currentUrl = window.location.href;
    const title = type === 'building' ? data?.name : data?.address;
    const subtitle = data?.subtitle || '';
    const shareText = `Check out this ${type}: ${title}${subtitle ? ' - ' + subtitle : ''}`;
    
    try {
      switch(platform) {
        case 'Facebook':
          const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
          window.open(fbUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
          break;
        case 'Twitter':
          const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`;
          window.open(tweetUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
          break;
        case 'Email':
          const emailSubject = encodeURIComponent(`${type === 'building' ? 'Building' : 'Property'} Listing: ${title}`);
          const emailBody = encodeURIComponent(
            `Hi,\n\nI thought you might be interested in this ${type}:\n\n` +
            `${shareText}\n\n` +
            `View details: ${currentUrl}\n\n` +
            `Best regards`
          );
          window.location.href = `mailto:?subject=${emailSubject}&body=${emailBody}`;
          break;
        case 'Copy Link':
          if (navigator.clipboard && window.isSecureContext) {
            // Modern clipboard API
            navigator.clipboard.writeText(currentUrl).then(() => {
              showCopySuccess();
            }).catch(() => {
              fallbackCopyTextToClipboard(currentUrl);
            });
          } else {
            // Fallback for older browsers
            fallbackCopyTextToClipboard(currentUrl);
          }
          break;
        default:
          console.log(`Sharing to ${platform}`);
      }
    } catch (error) {
      console.error(`Error sharing to ${platform}:`, error);
      if (platform === 'Copy Link') {
        fallbackCopyTextToClipboard(currentUrl);
      }
    }
    
    setShowShareDropdown(false);
  };

  const fallbackCopyTextToClipboard = (text) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        showCopySuccess();
      } else {
        showCopyError();
      }
    } catch (err) {
      console.error('Fallback copy failed:', err);
      showCopyError();
    }
  };

  const showCopySuccess = () => {
    // Create a temporary success message
    const message = document.createElement('div');
    message.textContent = '✓ Link copied to clipboard!';
    message.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10B981;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;
    
    // Add animation keyframes if not already present
    if (!document.getElementById('copy-success-styles')) {
      const style = document.createElement('style');
      style.id = 'copy-success-styles';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(message);
    
    setTimeout(() => {
      message.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (document.body.contains(message)) {
          document.body.removeChild(message);
        }
      }, 300);
    }, 3000);
  };

  const showCopyError = () => {
    alert('Unable to copy link to clipboard. Please copy the URL manually from your browser.');
  };

  const handleFavouriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }
    
    await toggleFavourite();
  };

  // Get display values based on type
  const getTitle = () => {
    if (type === 'building') {
      // For buildings, show the address instead of name
      return data?.address || data?.name;
    }

    // For properties, format as "UnitNumber - StreetNumber StreetName"
    if (type === 'property' && data) {
      const unitNumber = data?.unitNumber || data?.UnitNumber || '';
      const streetNumber = data?.streetNumber || data?.StreetNumber || '';
      const streetName = data?.streetName || data?.StreetName || '';
      
      // Build the formatted title
      let title = '';
      
      // Add unit number if available
      if (unitNumber) {
        title = unitNumber;
      }
      
      // Add street number and name
      if (streetNumber && streetName) {
        const streetPart = `${streetNumber} ${streetName}`;
        if (title) {
          title = `${title} - ${streetPart}`;
        } else {
          title = streetPart;
        }
      }
      
      // Fallback to original address if no formatted parts available
      return title || data?.address;
    }
    
    return data?.address;
  };

  const getSubtitle = () => {
    return data?.subtitle || '';
  };

  // Get location breadcrumb for buildings and properties with building data
  // For buildings: use building's own data
  // For properties: use buildingData if available, otherwise just show city from property
  const getLocationBreadcrumb = () => {
    const parts = [];

    // Determine location source based on type
    let locationSource = null;

    if (type === 'building') {
      // For buildings, use the building's own data
      locationSource = data;
    } else if (type === 'property') {
      // For properties, use buildingData if available
      if (buildingData && (buildingData.city || buildingData.neighbourhood || buildingData.sub_neighbourhood)) {
        locationSource = buildingData;
      } else if (data?.city || data?.City) {
        // No building data, just show city from property
        const city = data?.city || data?.City;
        if (city) {
          return [{
            label: city,
            type: 'city'
          }];
        }
        return null;
      } else {
        return null;
      }
    }

    // If no location source, return null
    if (!locationSource) return null;

    // Add sub_neighbourhood first (e.g., King West)
    if (locationSource?.sub_neighbourhood) {
      parts.push({
        label: locationSource.sub_neighbourhood,
        type: 'sub_neighbourhood'
      });
    }

    // Add neighbourhood (e.g., Downtown)
    if (locationSource?.neighbourhood) {
      parts.push({
        label: locationSource.neighbourhood,
        type: 'neighbourhood'
      });
    }

    // Add city (e.g., Toronto)
    if (locationSource?.city) {
      parts.push({
        label: locationSource.city,
        type: 'city'
      });
    }

    return parts.length > 0 ? parts : null;
  };

  const getPriceDisplay = () => {
    if (type === 'building') {
      return null; // Buildings don't show price in header
    }
    return data?.soldFor || null; // Only return actual sold price, no fallback
  };

  const showMobilePricing = type === 'property' && getPriceDisplay();

  return (
    <>
      {/* Property/Building Header */}
      <div className="bg-white">
        <div className={`max-w-[1280px] mx-auto md:px-0 ${type === 'building' ? 'pt-8' : ''}`}>
          <div className="flex flex-col-reverse md:flex-row justify-between items-start gap-5">
            {/* Property/Building Info */}
            <div className="flex-1 pr-5">
              <h1 className="font-space-grotesk font-bold text-[40px] leading-[50px] text-[#293056] tracking-tight mb-3 md:mb-0">
                {getTitle()}
              </h1>
              {/* Location Breadcrumb for Buildings and Properties with Buildings */}
              {getLocationBreadcrumb() && (
                <h2 className="font-work-sans text-lg text-[#293056] mb-2">
                  <span>
                    {getLocationBreadcrumb().map((part, index) => (
                      <span key={part.type}>
                        {/* All location parts are now clickable taxonomies */}
                        <Link
                          href={part.type === 'city'
                            ? `/search?query=${encodeURIComponent(part.label)}`
                            : part.type === 'neighbourhood'
                            ? `/search?neighbourhood=${encodeURIComponent(part.label)}`
                            : `/search?sub_neighbourhood=${encodeURIComponent(part.label)}`
                          }
                          className="underline hover:text-[#1f2441] transition-colors"
                        >
                          {part.label}
                        </Link>
                        {index < getLocationBreadcrumb().length - 1 && (
                          <span className="text-gray-400">, </span>
                        )}
                      </span>
                    ))}
                  </span>
                </h2>
              )}
              <div className="font-work-sans font-medium text-lg leading-[27px] text-[#293056] tracking-tight underline">
                {getSubtitle()}
              </div>
            </div>
            
            {/* Actions Container */}
            <div className="flex w-full md:w-auto justify-between md:justify-start items-center gap-3 flex-shrink-0">
              {/* Share Button */}
              <div className="relative">
                <button 
                  onClick={() => setShowShareDropdown(!showShareDropdown)}
                  className="flex justify-center items-center gap-2 px-6 h-[33px] min-w-[95px] bg-white border border-[#717680] rounded-[10px] font-work-sans font-medium text-sm text-[#252B37] hover:bg-gray-50 transition-colors"
                >
                  <Share className="w-4 h-4" />
                  Share
                </button>
                
                {showShareDropdown && (
                  <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl min-w-[200px] z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    <div className="py-2">
                      <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                        Share this {type}
                      </div>
                      <button 
                        onClick={() => handleShare('Facebook')}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 hover:text-[#1877F2] w-full text-left text-sm transition-all duration-200 font-medium"
                      >
                        <FacebookIcon className="w-5 h-5 text-[#1877F2]" />
                        Facebook
                      </button>
                      <button 
                        onClick={() => handleShare('Twitter')}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 hover:text-[#1DA1F2] w-full text-left text-sm transition-all duration-200 font-medium"
                      >
                        <TwitterIcon className="w-5 h-5 text-[#1DA1F2]" />
                        Twitter
                      </button>
                      <button 
                        onClick={() => handleShare('Email')}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 hover:text-[#EA4335] w-full text-left text-sm transition-all duration-200 font-medium"
                      >
                        <EmailIcon className="w-5 h-5 text-[#EA4335]" />
                        Email
                      </button>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button 
                        onClick={() => handleShare('Copy Link')}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 hover:text-[#333333] w-full text-left text-sm transition-all duration-200 font-medium"
                      >
                        <LinkIcon className="w-5 h-5 text-[#666666]" />
                        Copy Link
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Favourite Button */}
              <button 
                onClick={handleFavouriteClick}
                disabled={favouriteLoading}
                className={`flex justify-center items-center gap-2 px-6 h-[33px] min-w-[99px] border rounded-[10px] font-work-sans font-medium text-sm transition-all duration-200 ${
                  isFavourited 
                    ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
                    : 'bg-white border-[#717680] text-[#252B37] hover:bg-gray-50'
                } ${favouriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {favouriteLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Heart className="w-[14px] h-4" filled={isFavourited} />
                )}
                {favouriteLoading ? 'Saving...' : (isFavourited ? 'Favourited' : 'Favourite')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Pricing Section - Only for properties */}
      {showMobilePricing && (
        <div className="md:hidden bg-white px-4 py-6">
          <div className="flex justify-between items-start">
            {/* Left side - Sold For text */}
            <div className="font-work-sans font-bold text-lg text-[#8B4513]">
              SOLD FOR
            </div>
            
            {/* Right side - Price */}
            <div className="font-space-grotesk font-bold text-2xl text-black">
              {getPriceDisplay()}
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close share dropdown */}
      {showShareDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowShareDropdown(false)}
        />
      )}

      {/* Authentication Prompt Modal */}
      {showAuthPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-6 h-6 text-red-500" filled={true} />
              <h3 className="text-xl font-bold text-[#293056]">
                Save to Favourites
              </h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Create a free account to save your favourite properties and access them anytime.
            </p>
            
            <div className="flex flex-col gap-3">
              <Link
                href="/register"
                className="w-full py-3 px-4 rounded-lg font-medium text-center hover:opacity-90 transition-all"
                style={{ backgroundColor: buttonPrimaryBg, color: buttonPrimaryText }}
              >
                Create Free Account
              </Link>
              <Link
                href="/login"
                className="w-full py-3 px-4 border rounded-lg font-medium text-center hover:bg-gray-50 transition-colors"
                style={{ backgroundColor: buttonQuaternaryBg, color: buttonQuaternaryText, borderColor: buttonQuaternaryText }}
              >
                Sign In
              </Link>
              <button
                onClick={() => setShowAuthPrompt(false)}
                className="w-full py-2 px-4 text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}