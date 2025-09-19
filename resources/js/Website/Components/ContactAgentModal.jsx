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
            <div className="relative bg-white p-6 rounded-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold" style={{ color: 'rgb(41, 48, 86)' }}>
                        Contact Agent
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 bg-transparent border-none text-2xl font-bold cursor-pointer w-8 h-8 rounded flex items-center justify-center p-0 leading-none transition-colors hover:text-gray-800 hover:bg-gray-100 focus:outline-2 focus:outline-blue-500 focus:outline-offset-2"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                {/* Agent Info Display */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                        {agentImage && (
                            <img
                                src={agentImage}
                                alt={agentName}
                                className="w-16 h-16 rounded-full object-cover mr-4"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                        )}
                        <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-900">{agentName}</h4>
                            {agentTitle && <p className="text-sm text-gray-600">{agentTitle}</p>}
                            <p className="text-sm text-gray-600">{agentBrokerage}</p>
                        </div>
                    </div>

                    {/* Contact Options - Only Phone */}
                    <div className="mt-4">
                        <a
                            href={`tel:${agentPhone}`}
                            className="flex items-center justify-center w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            Call {agentPhone}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}