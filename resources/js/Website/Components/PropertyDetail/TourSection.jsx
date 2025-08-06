import React from 'react';

const TourSection = () => {
  return (
    <section className="py-8 bg-white">
      <div className="max-w-[1280px] mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 font-space-grotesk">Schedule a Tour</h2>
        <div className="bg-gray-50 rounded-lg p-6">
          <p className="text-gray-700 mb-4">
            Interested in seeing this property? Schedule a virtual or in-person tour.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex-1 bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
              Schedule Virtual Tour
            </button>
            <button className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              Request In-Person Visit
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TourSection;