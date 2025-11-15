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
    const agentInfo = websiteSettings?.website?.agent_info;
    const agentPhone = agentData?.phone || agentInfo?.agent_phone || websiteSettings?.website?.contact_info?.phone || '+1 (647) 555-0123';
    const agentEmail = agentData?.email || websiteSettings?.website?.contact_info?.email || 'agent@noburesidence.com';
    const agentName = agentData?.name || agentInfo?.agent_name || 'Nobu Residence Agent';
    const agentTitle = agentInfo?.agent_title || 'Property Manager';
    const agentBrokerage = agentData?.brokerage || agentInfo?.brokerage || 'Nobu Residences';
    const agentImage = agentData?.image || agentInfo?.profile_image || null;

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
        // Message is optional, so no validation needed

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
                        Contact Agent about {propertyData?.BuildingName || propertyData?.buildingName || propertyData?.address || 'Property'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 bg-transparent border-none text-2xl font-bold cursor-pointer absolute top-4 right-6 w-8 h-8 rounded flex items-center justify-center p-0 leading-none transition-colors hover:text-gray-800 hover:bg-gray-100 focus:outline-2 focus:outline-blue-500 focus:outline-offset-2"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                {/* Building Info */}
                <div className="mb-4 space-y-2">
                    <p className="text-gray-600 text-sm">
                        Building: <span className="font-medium">{propertyData?.address || propertyData?.BuildingName || 'Property'}</span>
                    </p>
                </div>

                {/* Contact Form */}
                <form onSubmit={handleSubmit}>
                    {/* Full Name */}
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-gray-700 mb-1 font-medium">
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            required
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    {/* Email Address */}
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700 mb-1 font-medium">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            required
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    {/* Phone Number */}
                    <div className="mb-4">
                        <label htmlFor="phone" className="block text-gray-700 mb-1 font-medium">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            required
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    {/* Additional Notes */}
                    <div className="mb-4">
                        <label htmlFor="question" className="block text-gray-700 mb-1 font-medium">
                            Message (Optional)
                        </label>
                        <textarea
                            id="question"
                            name="question"
                            value={formData.question}
                            onChange={handleChange}
                            className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm resize-y min-h-[80px] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            placeholder="Any specific questions about the building..."
                        ></textarea>
                        {errors.question && <p className="text-red-500 text-xs mt-1">{errors.question}</p>}
                    </div>

                    {/* Success/Error Messages */}
                    {submitStatus === 'success' && (
                        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
                            Your message has been sent successfully!
                        </div>
                    )}
                    {errors.general && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                            {errors.general}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium border-none cursor-pointer transition-colors hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                </form>
            </div>
        </div>
    );
}