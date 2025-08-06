import React, { useState } from 'react';
import { Heart, Share } from '@/Website/Components/Icons';

export default function PropertyHeader({ propertyData, isFavorited, onToggleFavorite }) {
  const [showShareDropdown, setShowShareDropdown] = useState(false);

  const handleShare = (platform) => {
    // Handle sharing logic here
    console.log(`Sharing to ${platform}`);
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
                {propertyData.address}
              </h1>
              <div className="font-work-sans font-medium text-lg leading-[27px] text-[#293056] tracking-tight underline">
                {propertyData.subtitle}
              </div>
            </div>
            
            {/* Actions Container */}
            <div className="flex items-center gap-3 flex-shrink-0">
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
