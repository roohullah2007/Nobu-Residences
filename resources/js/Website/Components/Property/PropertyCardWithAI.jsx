import React, { useState } from 'react';
import PropertyCard from './PropertyCard';
import PropertyAiDescription from './PropertyAiDescription';

const PropertyCardWithAI = ({ property }) => {
    const [showAiModal, setShowAiModal] = useState(false);
    const mlsId = property.ListingKey || property.listingKey || property.MLS_NUMBER || property.mls_number || '';

    const handleAiClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowAiModal(true);
    };

    return (
        <>
            <div className="relative">
                <PropertyCard property={property} />

                {/* AI Description Button Overlay */}
                <button
                    onClick={handleAiClick}
                    className="absolute bottom-4 right-4 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                    title="Generate AI Description"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>AI Description</span>
                </button>
            </div>

            {/* AI Description Modal */}
            {showAiModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center">
                                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                AI-Generated Property Information
                            </h2>
                            <button
                                onClick={() => setShowAiModal(false)}
                                className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                            {/* Property Info Header */}
                            <div className="mb-6 pb-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {property.UnparsedAddress || property.address || 'Property Address'}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span>MLS# {mlsId}</span>
                                    <span>•</span>
                                    <span>{property.PropertySubType || property.propertyType || 'Property'}</span>
                                    <span>•</span>
                                    <span className="font-semibold text-blue-600">
                                        ${(property.ListPrice || property.price || 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* AI Description Component */}
                            <PropertyAiDescription
                                mlsId={mlsId}
                                showFaqs={true}
                                className="space-y-6"
                            />
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                                Powered by Gemini AI
                            </div>
                            <button
                                onClick={() => setShowAiModal(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PropertyCardWithAI;