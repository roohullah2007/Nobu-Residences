import React, { useState } from 'react';

const NearbySchools = ({ propertyData = null }) => {
  const [showAll, setShowAll] = useState(false);

  // Process schools data from property object or use sample data
  const getSchoolsData = () => {
    let schoolsData = [];

    // If property data is provided and has nearby schools
    if (propertyData?.NearbySchools && Array.isArray(propertyData.NearbySchools) && propertyData.NearbySchools.length > 0) {
      schoolsData = propertyData.NearbySchools.map(school => ({
        distance_km: school.Distance || '',
        walk_time: school.WalkTime || '',
        name: school.Name || '',
        type: school.Type || '',
        board: school.Board || '',
        url: school.URL || '#'
      }));
    }

    // If no schools data, use sample/fallback data
    if (schoolsData.length === 0) {
      schoolsData = [
        {
          distance_km: '0.2 km',
          walk_time: '3 min walk',
          name: "St Michael's Choir (Sr) School",
          type: 'Catholic',
          board: 'Catholic | Secondary | Toronto Catholic District School Board',
          url: '#'
        },
        {
          distance_km: '0.2 km',
          walk_time: '3 min walk',
          name: "St Michael's Choir (Sr) School",
          type: 'Catholic',
          board: 'Catholic | Secondary | Toronto Catholic District School Board',
          url: '#'
        },
        {
          distance_km: '0.2 km',
          walk_time: '3 min walk',
          name: "St Michael's Choir (Sr) School",
          type: 'Catholic',
          board: 'Catholic | Secondary | Toronto Catholic District School Board',
          url: '#'
        }
      ];
    }

    return schoolsData;
  };

  const schoolsData = getSchoolsData();
  const displayedSchools = showAll ? schoolsData : schoolsData.slice(0, 3);
  const remainingCount = schoolsData.length - 3;

  const handleToggleShow = () => {
    setShowAll(!showAll);
  };

  return (
    <div className="py-6">
      <div className="flex flex-col">
        <div className="space-y-4">
          {displayedSchools.map((school, index) => (
            <div key={index} className="flex flex-row items-center p-4 gap-8 w-full h-[82px] border border-[#D2D2D2] rounded-none">
              {/* Distance Column */}
              <div className="flex flex-col justify-center items-start p-0 w-[104px] h-12 border-r border-[#A4A7AE]">
                <div className="w-[104px] h-6 font-work-sans font-bold text-sm leading-6 flex items-center tracking-[-0.03em] text-[#727272]">
                  {school.distance_km}
                </div>
                <div className="w-[104px] h-6 font-work-sans font-medium text-sm leading-6 flex items-center tracking-[-0.03em] text-[#707070]">
                  {school.walk_time}
                </div>
              </div>
              
              {/* School Info Column */}
              <div className="flex flex-col justify-center items-start p-0 gap-px flex-1 h-[50px]">
                <div className="font-work-sans font-bold text-base leading-[25px] flex items-center tracking-[-0.03em] text-[#293056]">
                  {school.name}
                </div>
                <div className="font-work-sans font-normal text-sm leading-6 flex items-center tracking-[-0.03em] text-[#717680]">
                  {school.board}
                </div>
              </div>
            </div>
          ))}
        </div>

        {schoolsData.length > 3 && (
          <div className="px-6 py-4">
            <button
              onClick={handleToggleShow}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              {showAll 
                ? 'Show Less' 
                : `Show More (${remainingCount})`
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbySchools;