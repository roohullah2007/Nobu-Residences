import React, { useState } from 'react';
import { router } from '@inertiajs/react';

export default function ContactAgentModal({ isOpen, onClose, agentData, propertyData, auth, websiteSettings }) {
    const [contactMethod, setContactMethod] = useState('form'); // 'form', 'phone', 'email'
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
    const [emailCopied, setEmailCopied] = useState(false);
    const [phoneCopied, setPhoneCopied] = useState(false);

    // Agent contact info from backend website settings or agentData
    const agentPhone = agentData?.phone || websiteSettings?.website?.contact_info?.agent?.phone || websiteSettings?.website?.contact_info?.phone || '+1 (647) 555-0123';
    const agentEmail = agentData?.email || websiteSettings?.website?.contact_info?.agent?.email || websiteSettings?.website?.contact_info?.email || 'agent@noburesidence.com';
    const agentName = agentData?.name || websiteSettings?.website?.contact_info?.agent?.name || 'Nobu Residence Agent';
    const agentBrokerage = agentData?.brokerage || websiteSettings?.website?.contact_info?.agent?.brokerage || 'Nobu Residences';
    const agentImage = agentData?.image || websiteSettings?.website?.contact_info?.agent?.image || null;

    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text).then(() => {
            if (type === 'email') {
                setEmailCopied(true);
                setTimeout(() => setEmailCopied(false), 2000);
            } else if (type === 'phone') {
                setPhoneCopied(true);
                setTimeout(() => setPhoneCopied(false), 2000);
            }
        });
    };

    const handlePhoneCall = () => {
        window.location.href = `tel:${agentPhone}`;
    };

    const handleEmailClick = () => {
        const subject = encodeURIComponent(`Inquiry about ${propertyData?.UnparsedAddress || propertyData?.BuildingName || 'Property'}`);
        const body = encodeURIComponent(`Hello ${agentName},\n\nI am interested in learning more about ${propertyData?.UnparsedAddress || propertyData?.BuildingName || 'this property'}.\n\nPlease contact me at your earliest convenience.\n\nThank you,\n${formData.name || ''}`);
        window.location.href = `mailto:${agentEmail}?subject=${subject}&body=${body}`;
    };

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
                agent_name: agentName,
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
                        Contact Agent
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 bg-transparent border-none text-2xl font-bold cursor-pointer w-8 h-8 rounded flex items-center justify-center p-0 leading-none transition-colors hover:text-gray-800 hover:bg-gray-100"
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
                            Message Sent Successfully!
                        </h3>
                        <p className="text-gray-600">
                            Our agent will get back to you within 24 hours.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Agent Info */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                                    {agentImage ? (
                                        <img
                                            src={agentImage}
                                            alt={agentName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-lg text-[#293056]">{agentName}</h4>
                                    <p className="text-sm text-gray-600">Licensed Real Estate Agent</p>
                                    {agentBrokerage && (
                                        <p className="text-sm text-gray-500">{agentBrokerage}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Contact Method Tabs */}
                        <div className="flex gap-2 mb-6 border-b">
                            <button
                                onClick={() => setContactMethod('form')}
                                className={`px-4 py-2 font-medium transition-colors ${
                                    contactMethod === 'form'
                                        ? 'text-[#293056] border-b-2 border-[#293056]'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                                Message
                            </button>
                            <button
                                onClick={() => setContactMethod('phone')}
                                className={`px-4 py-2 font-medium transition-colors ${
                                    contactMethod === 'phone'
                                        ? 'text-[#293056] border-b-2 border-[#293056]'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                Phone
                            </button>
                            <button
                                onClick={() => setContactMethod('email')}
                                className={`px-4 py-2 font-medium transition-colors ${
                                    contactMethod === 'email'
                                        ? 'text-[#293056] border-b-2 border-[#293056]'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Email
                            </button>
                        </div>

                        {/* Contact Method Content */}
                        {contactMethod === 'form' && (
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
                                        placeholder="What would you like to know about this property?"
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
                        )}

                        {contactMethod === 'phone' && (
                            <div className="text-center py-6">
                                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <h4 className="font-semibold text-lg mb-2">Call Us Directly</h4>
                                <p className="text-gray-600 mb-4">Available Mon-Sat, 9AM-6PM EST</p>

                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <p className="text-2xl font-bold text-[#293056] mb-2">{agentPhone}</p>
                                    <div className="flex gap-2 justify-center">
                                        <button
                                            onClick={handlePhoneCall}
                                            className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            Call Now
                                        </button>
                                        <button
                                            onClick={() => copyToClipboard(agentPhone, 'phone')}
                                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                        >
                                            {phoneCopied ? '✓ Copied!' : 'Copy Number'}
                                        </button>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-500">
                                    Or send us a message and we'll call you back
                                </p>
                            </div>
                        )}

                        {contactMethod === 'email' && (
                            <div className="text-center py-6">
                                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h4 className="font-semibold text-lg mb-2">Email Us</h4>
                                <p className="text-gray-600 mb-4">We typically respond within 24 hours</p>

                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <p className="text-xl font-semibold text-[#293056] mb-3">{agentEmail}</p>
                                    <div className="flex gap-2 justify-center">
                                        <button
                                            onClick={handleEmailClick}
                                            className="px-6 py-2 bg-[#293056] text-white rounded-lg font-medium hover:bg-[#1e2142] transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            Compose Email
                                        </button>
                                        <button
                                            onClick={() => copyToClipboard(agentEmail, 'email')}
                                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                        >
                                            {emailCopied ? '✓ Copied!' : 'Copy Email'}
                                        </button>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-500">
                                    For immediate assistance, please call us
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}