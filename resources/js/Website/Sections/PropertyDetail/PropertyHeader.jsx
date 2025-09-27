import React, { useState } from 'react';
import { Heart, Share } from '@/Website/Components/Icons';
import { formatCardAddress } from '@/utils/propertyFormatters';

export default function PropertyHeader({ propertyData, isFavorited, onToggleFavorite }) {
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  
  // Format the property title using the new format
  const displayTitle = formatCardAddress(propertyData);

  const handleShare = (platform) => {
    const currentUrl = window.location.href;
    const propertyTitle = displayTitle || 'Property Details';
    const propertySubtitle = propertyData?.subtitle || '';
    const shareText = `Check out this property: ${propertyTitle}${propertySubtitle ? ' - ' + propertySubtitle : ''}`;
    
    switch(platform) {
      case 'Facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
        break;
      case 'Twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`, '_blank');
        break;
      case 'Email':
        const emailSubject = encodeURIComponent(`Property Listing: ${propertyTitle}`);
        const emailBody = encodeURIComponent(`Hi,\n\nI thought you might be interested in this property:\n\n${shareText}\n\nView details: ${currentUrl}\n\nBest regards`);
        window.location.href = `mailto:?subject=${emailSubject}&body=${emailBody}`;
        break;
      case 'Copy Link':
        navigator.clipboard.writeText(currentUrl).then(() => {
          // You could add a toast notification here
          alert('Link copied to clipboard!');
        }).catch(() => {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = currentUrl;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          alert('Link copied to clipboard!');
        });
        break;
      default:
        console.log(`Sharing to ${platform}`);
    }
    setShowShareDropdown(false);
  };

  return (
    <>
      {/* Property Header */}
      <div className="bg-white">
        <div className="max-w-[1280px] mx-auto md:px-0">
          <div className="flex flex-col-reverse md:flex-row justify-between items-start gap-5">
            {/* Property Info */}
            <div className="flex-1 pr-5">
              <h1 className="font-space-grotesk font-bold text-[40px] leading-[50px] text-[#293056] tracking-tight mb-3">
                {displayTitle}
              </h1>
              <div className="font-work-sans font-medium text-lg leading-[27px] text-[#293056] tracking-tight underline">
                {propertyData.subtitle}
              </div>
            </div>
            
            {/* Actions Container */}
            <div className="flex w-full md:w-auto justify-between md:justify-start items-center gap-3 flex-shrink-0">
              {/* Share Button */}
              <div className="relative">
                <button 
                  onClick={() => setShowShareDropdown(!showShareDropdown)}
                  className="flex justify-center items-center px-6 h-[33px] min-w-[95px] bg-white border border-[#717680] rounded-[10px] font-work-sans font-medium text-sm text-[#252B37] hover:bg-gray-50 transition-colors"
                >
                  Share
                </button>
                
                {showShareDropdown && (
                  <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px] z-50">
                    <div className="py-1">
                    <button 
                    onClick={() => handleShare('Facebook')}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 w-full text-left text-sm"
                    >
                    <Share className="w-4 h-4" />
                    Facebook
                    </button>
                    <button 
                    onClick={() => handleShare('Twitter')}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 w-full text-left text-sm"
                    >
                    <Share className="w-4 h-4" />
                    Twitter
                    </button>
                    <button 
                    onClick={() => handleShare('Email')}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 w-full text-left text-sm"
                    >
                    <Share className="w-4 h-4" />
                    Email
                    </button>
                      <button 
                      onClick={() => handleShare('Copy Link')}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 w-full text-left text-sm"
                    >
                      <Share className="w-4 h-4" />
                      Copy Link
                    </button>
                  </div>
                  </div>
                )}
              </div>
              
              {/* Favourite Button */}
              <button 
                onClick={onToggleFavorite}
                className={`flex justify-center items-center gap-2 px-6 h-[33px] min-w-[99px] border rounded-[10px] font-work-sans font-medium text-sm transition-colors ${
                  isFavorited 
                    ? 'bg-red-50 border-red-200 text-red-600' 
                    : 'bg-white border-[#717680] text-[#252B37] hover:bg-gray-50'
                }`}
              >
                <Heart className="w-[14px] h-4" filled={isFavorited} />
                {isFavorited ? 'Favorited' : 'Favourite'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Pricing Section - Only visible on mobile when property has soldFor price */}
      {propertyData.soldFor && (
        <div className="md:hidden bg-white px-4 py-6">
          <div className="flex justify-between items-start">
            {/* Left side - Sold For text */}
            <div className="font-work-sans font-bold text-lg text-[#8B4513]">
              SOLD FOR
            </div>

            {/* Right side - Price */}
            <div className="font-space-grotesk font-bold text-2xl text-black">
              {propertyData.soldFor}
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
    </>
  );
}
