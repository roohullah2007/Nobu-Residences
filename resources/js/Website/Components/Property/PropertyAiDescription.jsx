import React, { useState, useEffect } from 'react';
import { usePropertyAiDescription } from '@/hooks/usePropertyAiDescription';

const PropertyAiDescription = ({ mlsId, showFaqs = false, className = '' }) => {
    const {
        loading,
        description,
        faqs,
        error,
        generateDescription,
        generateFaqs,
        getAllContent
    } = usePropertyAiDescription();

    const [showDetails, setShowDetails] = useState(false);
    const [isGenerated, setIsGenerated] = useState(false);

    // Auto-load existing content on mount
    useEffect(() => {
        if (mlsId && !isGenerated) {
            getAllContent(mlsId);
        }
    }, [mlsId]);

    const handleGenerateDescription = async () => {
        if (mlsId) {
            const result = await generateDescription(mlsId, !description);
            if (result) {
                setIsGenerated(true);
                setShowDetails(true);
            }
        }
    };

    const handleGenerateFaqs = async () => {
        if (mlsId) {
            const result = await generateFaqs(mlsId, !faqs);
            if (result) {
                setIsGenerated(true);
            }
        }
    };

    if (!mlsId) {
        return null;
    }

    return (
        <div className={`property-ai-description ${className}`}>
            {/* Generate Button */}
            {!description && !loading && (
                <button
                    onClick={handleGenerateDescription}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate AI Description
                </button>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-8">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm text-gray-600">Generating AI content...</span>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {/* Description Content */}
            {description && (
                <div className="space-y-4">
                    {/* Overview */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                        <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                AI-Generated Overview
                            </h3>
                            {description.cached && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                    Cached
                                </span>
                            )}
                        </div>
                        <p className="text-gray-700 leading-relaxed">{description.overview}</p>
                    </div>

                    {/* Detailed Description */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                        >
                            <h3 className="text-lg font-semibold text-gray-900">
                                Detailed Description
                            </h3>
                            <svg
                                className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {showDetails && (
                            <div className="px-6 pb-6 pt-2">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                    {description.detailed}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Regenerate Button */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleGenerateDescription}
                            className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm"
                        >
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Regenerate
                        </button>
                        {description.generated_at && (
                            <span className="text-xs text-gray-500">
                                Generated: {new Date(description.generated_at).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* FAQs Section */}
            {showFaqs && (
                <div className="mt-6">
                    {!faqs && !loading && (
                        <button
                            onClick={handleGenerateFaqs}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Generate FAQs
                        </button>
                    )}

                    {faqs && faqs.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Frequently Asked Questions
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {faqs.map((faq, index) => (
                                    <details key={index} className="group">
                                        <summary className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                                            <span className="font-medium text-gray-900 pr-4">
                                                {faq.question}
                                            </span>
                                            <svg
                                                className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform duration-200"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </summary>
                                        <div className="px-6 pb-4 pt-2">
                                            <p className="text-gray-700 leading-relaxed">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PropertyAiDescription;