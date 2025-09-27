import React, { useState } from 'react';
import MainLayout from '../Layouts/MainLayout';
import PropertyAiDescription from '../Components/Property/PropertyAiDescription';

const PropertyAiDemo = () => {
    const [mlsId, setMlsId] = useState('');
    const [submittedMlsId, setSubmittedMlsId] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (mlsId.trim()) {
            setSubmittedMlsId(mlsId.trim());
        }
    };

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-6">
                        <h1 className="text-3xl font-bold mb-2 flex items-center">
                            <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Property AI Description Generator
                        </h1>
                        <p className="text-blue-100">
                            Generate AI-powered property descriptions and FAQs using Gemini AI
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        {/* Input Form */}
                        <form onSubmit={handleSubmit} className="mb-8">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label htmlFor="mlsId" className="block text-sm font-medium text-gray-700 mb-2">
                                        Enter MLS ID or Property Key
                                    </label>
                                    <input
                                        type="text"
                                        id="mlsId"
                                        value={mlsId}
                                        onChange={(e) => setMlsId(e.target.value)}
                                        placeholder="e.g., C9425648, W9425649"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                                    >
                                        Generate
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* AI Description Component */}
                        {submittedMlsId && (
                            <div>
                                <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-sm text-gray-600">Generating for MLS ID: </span>
                                            <span className="font-semibold text-gray-900">{submittedMlsId}</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSubmittedMlsId('');
                                                setMlsId('');
                                            }}
                                            className="text-sm text-gray-500 hover:text-gray-700"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>

                                <PropertyAiDescription
                                    mlsId={submittedMlsId}
                                    showFaqs={true}
                                    className="space-y-6"
                                />
                            </div>
                        )}

                        {/* Instructions */}
                        {!submittedMlsId && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                                    How to Use
                                </h3>
                                <ul className="space-y-2 text-blue-800">
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 mr-2 mt-0.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Enter a valid MLS ID or property listing key</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 mr-2 mt-0.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Click "Generate" to create AI-powered descriptions</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 mr-2 mt-0.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>The system will generate both overview and detailed descriptions</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 mr-2 mt-0.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>You can also generate FAQs for the property</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 mr-2 mt-0.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Generated content is cached for faster retrieval</span>
                                    </li>
                                </ul>
                            </div>
                        )}

                        {/* Features */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">AI-Powered</h3>
                                <p className="text-sm text-gray-600">
                                    Uses Google's Gemini AI to generate compelling, SEO-friendly descriptions
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-100">
                                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">Fast & Cached</h3>
                                <p className="text-sm text-gray-600">
                                    Descriptions are cached for instant retrieval on subsequent views
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100">
                                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">FAQ Generation</h3>
                                <p className="text-sm text-gray-600">
                                    Automatically generates relevant FAQs to answer buyer questions
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default PropertyAiDemo;