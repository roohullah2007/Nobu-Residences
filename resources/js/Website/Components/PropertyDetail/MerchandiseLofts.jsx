import React from 'react';

export default function MerchandiseLofts() {
  return (
    <section>
      <div className="mx-auto md:h-[268px] max-w-[1280px]">
        <div className="bg-white rounded-lg md:rounded-xl border shadow-md overflow-hidden h-full">
          <div className="flex flex-col md:flex-row h-full">
            {/* Left side - Image */}
            <div className="md:w-[330px]">
              <img 
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="The Merchandise Lofts" 
                className="w-full h-48 md:h-full object-cover"
              />
            </div>
            
            {/* Right side - Content */}
            <div className="flex-1 p-6  flex flex-col justify-between">
              <div>
              <h2 className="text-xl md:text-2xl font-bold mb-2 font-space-grotesk" style={{ color: '#293056' }}>
                The Merchandise Lofts
              </h2>
              <p className="text-gray-600 mb-2 text-sm md:text-base">
                155 Dalhousie St
              </p>
              <p className="text-gray-700 mb-6 text-sm md:text-base">
                Browse all listings at The Merchandise Lofts — condos for sale and rent at 155 Dalhousie St.
              </p>
              </div>
              
              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <button className="flex-1 px-4 md:px-6 py-2.5 md:py-3 border-2 border-orange-400 rounded-full text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors duration-200 font-medium text-sm md:text-base">
                  9 for rent
                </button>
                <button className="flex-1 px-4 md:px-6 py-2.5 md:py-3 border-2 border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium text-sm md:text-base">
                  9 for sale
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
