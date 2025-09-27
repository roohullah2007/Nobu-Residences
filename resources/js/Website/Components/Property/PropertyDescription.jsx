import React from 'react';

const PropertyDescription = ({ propertyData = null }) => {
  // Default property data if none provided
  const defaultPropertyData = {
    title: '408 - 155 Dalhousie Street',
    description: `Located at 22 Dutch Myrtle Way, this North York condo is available for sale. 22 Dutch Myrtle Way has an asking price of $998800, and has been on the market since April 2025. This condo has 3 beds, 4 bathrooms and is 1800-1999 sqft. Situated in North York's Banbury | Don Mills neighbourhood, Parkwoods-Donalda, Victoria Village, Flemingdon Park and Bridle Path | Sunnybrook | York Mills are nearby neighbourhoods. Dutch Myrtleway is only a 3 minute walk from Tim Hortons for that morning caffeine fix and if you're not in the mood to cook, Panera Bread, Jack Astor's Bar & Grill and Congee Queen are near this condo. Nearby grocery options: McEwan is a 4-minute walk.

Living in this Banbury | Don Mills condo is easy. There is also Don Mills Rd at The Donway East (North) Bus Stop, only steps away, with route Don Mills, and route Don Mills Night Bus nearby. If you're driving from Dutch Myrtleway, you'll have easy access to the rest of the city by way of Don Valley Parkway as well, which is within a 4-minute drive using Wynford Dr ramps.`
  };

  const data = propertyData || defaultPropertyData;

  return (
    <section className="w-full bg-white py-0 px-0 m-0 block relative box-border">
      <div className="max-w-[1280px] w-full mx-auto py-15 px-5 bg-white block box-border relative z-10 md:py-10 md:px-5 sm:py-8 sm:px-4">
        <div className="w-full block relative box-border">
          {/* Property Title Header */}
          <div className="w-full text-center mb-10 block relative box-border md:mb-8 sm:mb-6">
            <h1 className="font-inter font-semibold text-[32px] leading-[1.25] text-gray-800 text-center m-0 p-0 border-0 bg-transparent no-underline normal-case tracking-tight block relative box-border z-20 md:text-[28px] md:leading-[1.3] sm:text-[24px] sm:leading-[1.35]">
              {data.title}
            </h1>
          </div>
          
          {/* Property Description Content */}
          <div className="font-work-sans font-normal text-base leading-[1.6] text-gray-700 text-left m-0 p-0 border-0 bg-transparent no-underline normal-case tracking-normal block relative box-border z-20 w-full max-w-none md:text-[15px] md:leading-[1.65] sm:text-sm sm:leading-[1.7]">
            {/* First Paragraph */}
            <p className="mb-5">
              Located at 22 Dutch Myrtle Way, this North York condo is available for sale. 22 Dutch Myrtle Way has an asking price of $998800, and has been on the market since April 2025. This condo has 3 beds, 4 bathrooms and is 1800-1999 sqft. Situated in North York's Banbury | Don Mills neighbourhood, Parkwoods-Donalda, Victoria Village, Flemingdon Park and Bridle Path | Sunnybrook | York Mills are nearby neighbourhoods. Dutch Myrtleway is only a 3 minute walk from Tim Hortons for that morning caffeine fix and if you're not in the mood to cook, Panera Bread, Jack Astor's Bar & Grill and Congee Queen are near this condo. Nearby grocery options: McEwan is a 4-minute walk.
            </p>
            
            {/* Second Paragraph */}
            <p className="mb-0">
              Living in this Banbury | Don Mills condo is easy. There is also Don Mills Rd at The Donway East (North) Bus Stop, only steps away, with route Don Mills, and route Don Mills Night Bus nearby. If you're driving from Dutch Myrtleway, you'll have easy access to the rest of the city by way of Don Valley Parkway as well, which is within a 4-minute drive using Wynford Dr ramps.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PropertyDescription;