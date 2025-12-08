import React from 'react';
import { usePage } from '@inertiajs/react';
import TourScheduling from './TourScheduling';

const PropertySidebar = ({ propertyData, agentInfo }) => {
  const { globalWebsite, website } = usePage().props;
  const currentWebsite = website || globalWebsite;
  const brandColors = currentWebsite?.brand_colors || {};

  const buttonTertiaryBg = brandColors.button_tertiary_bg || '#000000';
  const buttonTertiaryText = brandColors.button_tertiary_text || '#FFFFFF';
  return (
    <div className="w-full space-y-2">
      {/* Property Details Card */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="flex flex-col justify-between p-6 h-full">
          <div className="flex flex-col gap-6">
            {/* SOLD FOR Section */}
            <div className="flex flex-col gap-2 items-center">
              <div className="flex flex-col gap-2 items-center justify-center w-full">
                <span className="font-space-grotesk font-bold text-2xl leading-[34px] uppercase text-[#93370D]">
                  SOLD FOR
                </span>
                <span className="font-space-grotesk font-bold text-2xl leading-[34px] uppercase text-[#93370D]">
                  {propertyData.soldFor}
                </span>
              </div>
              <div className="font-work-sans font-medium text-sm text-[#535862] text-center">
                {propertyData.listedFor}
              </div>
              <div className="w-full h-px border-t border-[#D5D7DA]"></div>
            </div>
            
            {/* Properties Details Section */}
            <div className="flex flex-col gap-6">
              <h3 className="font-red-hat font-bold text-xl text-[#252B37]">
                Properties detail
              </h3>
              
              <div className="flex flex-col gap-6">
                {Object.entries(propertyData.details).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center gap-3 w-full">
                    <span className="font-work-sans font-normal text-base leading-[25px] text-[#252B37] tracking-tight capitalize break-words">
                      {key === 'maintenanceFees' ? 'Maintenance Fees' : 
                       key === 'propertyTaxes' ? 'Property Taxes' : 
                       key === 'area' ? 'Square Feet' :
                       key}
                    </span>
                    <span className="font-work-sans font-normal text-base leading-[25px] text-[#252B37] tracking-tight text-right break-words">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Call us Button */}
          <div className="rounded-full h-14 flex items-center justify-center w-full mt-6 transition-opacity hover:opacity-90" style={{ backgroundColor: buttonTertiaryBg }}>
            <button className="w-full h-full flex items-center justify-center">
              <span className="font-work-sans font-extrabold text-base" style={{ color: buttonTertiaryText }}>
                Call us
              </span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Tour Scheduling Component */}
      <TourScheduling 
        propertyData={propertyData}
        agentInfo={agentInfo}
      />
    </div>
  );
};

export default PropertySidebar;