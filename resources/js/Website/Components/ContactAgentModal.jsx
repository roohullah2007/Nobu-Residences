import React, { useState } from 'react';
import { router } from '@inertiajs/react';

export default function ContactAgentModal({ isOpen, onClose, agentData, propertyData, auth }) {
    const [formData, setFormData] = useState({
        name: auth?.user?.name || '',
        email: auth?.user?.email || '',
        phone: '',
        question: '',
        inquiry_type: 'agent_contact'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: null
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.email.includes('@')) newErrors.email = 'Please enter a valid email';
        if (!formData.phone) newErrors.phone = 'Phone number is required';
        if (!formData.question) newErrors.question = 'Question is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        
        try {
            await router.post('/agent-enquiry', {
                ...formData,
                agent_id: agentData?.id,
                agent_name: agentData?.name,
                property_listing_key: propertyData?.ListingKey || propertyData?.listingKey || propertyData?.id,
                property_address: propertyData?.UnparsedAddress || propertyData?.address,
                building_name: propertyData?.BuildingName || propertyData?.buildingName || 'Building'
            }, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setSubmitStatus('success');
                    setTimeout(() => {
                        onClose();
                        setSubmitStatus(null);
                        setFormData({
                            ...formData,
                            question: ''
                        });
                    }, 2000);
                },
                onError: (errors) => {
                    setErrors(errors);
                    setIsSubmitting(false);
                }
            });
        } catch (error) {
            console.error('Error submitting enquiry:', error);
            setErrors({ general: 'An error occurred. Please try again.' });
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999999] bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={onClose}>
            {/* Modal Content */}
            <div className="relative bg-white p-6 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold" style={{ color: 'rgb(41, 48, 86)' }}>
                        Ask About Building
                    </h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 bg-transparent border-none text-2xl font-bold cursor-pointer w-8 h-8 rounded flex items-center justify-center p-0 leading-none transition-colors hover:text-gray-800 hover:bg-gray-100 focus:outline-2 focus:outline-blue-500 focus:outline-offset-2"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                {submitStatus === 'success' ? (
                    <div className="py-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-xl text-[#293056] mb-2">
                            Question Sent Successfully!
                        </h3>
                        <p className="text-gray-600">
                            Our agent will get back to you within 24 hours.
                        </p>
                    </div>
                ) : (
                    <>
                        <p className="mb-4 text-gray-500">
                            Have questions about this building? Our agent will get back to you within 24 hours.
                        </p>

                        <form onSubmit={handleSubmit}>
                            {errors.general && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
                                    {errors.general}
                                </div>
                            )}

                            <div className="mb-4">
                                <label htmlFor="questionName" className="block text-gray-700 mb-1 font-medium">
                                    Full Name
                                </label>
                                <input 
                                    type="text" 
                                    id="questionName" 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`w-full py-2 px-3 border rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
                                        errors.name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="questionEmail" className="block text-gray-700 mb-1 font-medium">
                                    Email Address
                                </label>
                                <input 
                                    type="email" 
                                    id="questionEmail" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full py-2 px-3 border rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
                                        errors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="questionPhone" className="block text-gray-700 mb-1 font-medium">
                                    Phone Number
                                </label>
                                <input 
                                    type="tel" 
                                    id="questionPhone" 
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={`w-full py-2 px-3 border rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
                                        errors.phone ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                />
                                {errors.phone && (
                                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="question" className="block text-gray-700 mb-1 font-medium">
                                    Your Question
                                </label>
                                <textarea 
                                    id="question" 
                                    name="question"
                                    value={formData.question}
                                    onChange={handleChange}
                                    className={`w-full py-2 px-3 border rounded-lg text-sm resize-y min-h-[100px] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
                                        errors.question ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="What would you like to know about this building?"
                                    required
                                />
                                {errors.question && (
                                    <p className="text-red-500 text-sm mt-1">{errors.question}</p>
                                )}
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium border-none cursor-pointer hover:bg-gray-800 disabled:opacity-70 transition-colors"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Sending Question...
                                    </div>
                                ) : (
                                    'Send Question'
                                )}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}