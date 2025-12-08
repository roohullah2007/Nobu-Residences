import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';

export default function PropertyEnquiryModal({ isOpen, onClose, propertyData, auth }) {
    const { globalWebsite, website } = usePage().props;
    const currentWebsite = website || globalWebsite;
    const brandColors = currentWebsite?.brand_colors || {};

    const buttonTertiaryBg = brandColors.button_tertiary_bg || '#000000';
    const buttonTertiaryText = brandColors.button_tertiary_text || '#FFFFFF';

    const [formData, setFormData] = useState({
        name: auth?.user?.name || '',
        email: auth?.user?.email || '',
        phone: '',
        message: `I am interested in the property at ${propertyData?.UnparsedAddress || propertyData?.address || 'this location'}. Please contact me with more information.`,
        inquiry_type: 'property_inquiry'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error for this field
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
        if (!formData.message) newErrors.message = 'Message is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        
        try {
            await router.post('/property-enquiry', {
                ...formData,
                property_listing_key: propertyData?.ListingKey || propertyData?.listingKey || propertyData?.id,
                property_address: propertyData?.UnparsedAddress || propertyData?.address,
                property_price: propertyData?.ListPrice || propertyData?.listPrice || propertyData?.price,
                property_type: propertyData?.PropertyType || propertyData?.propertyType,
                property_mls: propertyData?.ListingId || propertyData?.listingId || propertyData?.mlsNumber
            }, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setSubmitStatus('success');
                    setTimeout(() => {
                        onClose();
                        setSubmitStatus(null);
                        // Reset form for next use
                        setFormData({
                            ...formData,
                            message: `I am interested in the property at ${propertyData?.UnparsedAddress || propertyData?.address || 'this location'}. Please contact me with more information.`
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

    const formatAddress = () => {
        const unitNumber = propertyData?.UnitNumber || propertyData?.unitNumber || '';
        const streetNumber = propertyData?.StreetNumber || propertyData?.streetNumber || '';
        const streetName = propertyData?.StreetName || propertyData?.streetName || '';
        
        let parts = [];
        if (unitNumber) parts.push(unitNumber);
        
        if (streetNumber && streetName) {
            parts.push(`${streetNumber} ${streetName}`);
        }
        
        if (parts.length > 0) return parts.join(' - ');
        return propertyData?.UnparsedAddress || propertyData?.address || 'Property';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay - Full screen without any gaps */}
            <div 
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={onClose}
            />
            
            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto mx-4">
                {/* Header */}
                <div className="border-b border-gray-200 p-6 sticky top-0 bg-white z-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="font-space-grotesk font-bold text-2xl text-[#293056] mb-2">
                                Property Enquiry
                            </h2>
                            <p className="font-work-sans text-sm text-gray-600">
                                {formatAddress()}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Success Message */}
                {submitStatus === 'success' ? (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="font-space-grotesk font-bold text-xl text-[#293056] mb-2">
                            Enquiry Sent Successfully!
                        </h3>
                        <p className="font-work-sans text-gray-600">
                            We'll get back to you within 24 hours.
                        </p>
                    </div>
                ) : (
                    /* Form */
                    <form onSubmit={handleSubmit} className="p-6">
                        {errors.general && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
                                {errors.general}
                            </div>
                        )}

                        {/* Name */}
                        <div className="mb-4">
                            <label className="block font-work-sans font-medium text-gray-700 mb-2">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#293056] focus:ring-opacity-50 focus:border-transparent transition-colors ${
                                    errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="mb-4">
                            <label className="block font-work-sans font-medium text-gray-700 mb-2">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#293056] focus:ring-opacity-50 focus:border-transparent transition-colors ${
                                    errors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div className="mb-4">
                            <label className="block font-work-sans font-medium text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#293056] focus:ring-opacity-50 focus:border-transparent transition-colors"
                                placeholder="(optional)"
                            />
                        </div>

                        {/* Message */}
                        <div className="mb-4">
                            <label className="block font-work-sans font-medium text-gray-700 mb-2">
                                Message *
                            </label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows={4}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#293056] focus:ring-opacity-50 focus:border-transparent transition-colors resize-none ${
                                    errors.message ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                            />
                            {errors.message && (
                                <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                            )}
                        </div>

                        {/* Property Details Summary */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <h4 className="font-work-sans font-semibold text-sm text-gray-700 mb-2">
                                Property Details
                            </h4>
                            <div className="space-y-1 text-sm text-gray-600">
                                <p>
                                    <span className="font-medium">Address:</span> {formatAddress()}
                                </p>
                                {propertyData?.ListPrice && (
                                    <p>
                                        <span className="font-medium">Price:</span> ${propertyData.ListPrice?.toLocaleString()}
                                    </p>
                                )}
                                {(propertyData?.BedroomsTotal || propertyData?.bedrooms) && (
                                    <p>
                                        <span className="font-medium">Bedrooms:</span> {propertyData.BedroomsTotal || propertyData.bedrooms}
                                    </p>
                                )}
                                {(propertyData?.BathroomsTotal || propertyData?.bathrooms) && (
                                    <p>
                                        <span className="font-medium">Bathrooms:</span> {propertyData.BathroomsTotal || propertyData.bathrooms}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 rounded-full font-work-sans font-bold text-base transition-opacity hover:opacity-90 disabled:opacity-70"
                            style={{ backgroundColor: buttonTertiaryBg, color: buttonTertiaryText }}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 mr-2" style={{ borderColor: buttonTertiaryText }}></div>
                                    Sending Enquiry...
                                </div>
                            ) : (
                                'Send Enquiry'
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}