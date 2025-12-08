import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';

export default function TabbedContactSection({ auth, website, pageContent }) {
    const { globalWebsite } = usePage().props;
    const currentWebsite = website || globalWebsite;
    const brandColors = currentWebsite?.brand_colors || {};

    const buttonTertiaryBg = brandColors.button_tertiary_bg || '#000000';
    const buttonTertiaryText = brandColors.button_tertiary_text || '#FFFFFF';
    const [activeTab, setActiveTab] = useState('overview');

    // Dynamic tabs from pageContent or default
    const defaultTabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'keyFacts', label: 'Key Facts' },
        { id: 'amenities', label: 'Amenities' },
        { id: 'highlights', label: 'Highlights' },
        { id: 'contact', label: 'Contact' }
    ];
    
    const tabs = pageContent?.tabs || defaultTabs;

    // Dynamic contact info from website data - prioritize agent_info table
    const contactInfo = {
        name: website?.agent_info?.agent_name || website?.contact_info?.agent?.name || '',
        title: website?.agent_info?.agent_title || website?.contact_info?.agent?.title || '',
        email: website?.contact_info?.email || '',
        phone: website?.agent_info?.agent_phone || website?.contact_info?.phone || '',
        address: website?.contact_info?.address || '',
        image: website?.agent_info?.profile_image || website?.contact_info?.agent?.image || '',
        brokerage: website?.agent_info?.brokerage || website?.contact_info?.agent?.brokerage || ''
    };

    // Dynamic content from pageContent
    const overviewContent = pageContent?.overview || {
        title: 'Building Overview',
        content: [
            'Welcome to Nobu Residences, where luxury meets comfort in the heart of Toronto. Our premium condominiums offer stunning views and world-class amenities.',
            'Experience elevated living with our carefully curated selection of units, each designed with modern aesthetics and premium finishes.'
        ]
    };

    const keyFactsContent = pageContent?.keyFacts || {
        title: 'Key Facts',
        facts: [
            { label: 'Building Height', value: '45 Floors' },
            { label: 'Total Units', value: '400+ Units' },
            { label: 'Year Built', value: '2022' },
            { label: 'Parking', value: 'Available' },
            { label: 'Pet Policy', value: 'Pet Friendly' }
        ]
    };

    const amenitiesContent = pageContent?.amenities || {
        title: 'Amenities',
        items: [
            'Fitness Center',
            'Rooftop Terrace',
            'Concierge Service',
            'Pool & Spa',
            'Party Room',
            'Business Center',
            'Guest Suites',
            'Storage Lockers'
        ]
    };

    const highlightsContent = pageContent?.highlights || {
        title: 'Highlights',
        highlights: [
            {
                title: 'Prime Location',
                description: 'Located in the heart of Toronto\'s Entertainment District, steps away from world-class dining, shopping, and entertainment.'
            },
            {
                title: 'Luxury Finishes',
                description: 'Each unit features premium materials, floor-to-ceiling windows, and high-end appliances throughout.'
            },
            {
                title: 'Stunning Views',
                description: 'Enjoy breathtaking views of Toronto\'s skyline and Lake Ontario from select units.'
            }
        ]
    };

    const renderContactInfo = () => (
        <div className="flex flex-col justify-between items-start p-4 gap-4 w-full max-w-[400px] md:w-[268px] md:max-w-[268px] h-auto md:h-[356px] bg-white shadow-[0px_0px_16.3px_rgba(0,0,0,0.1)] rounded-xl flex-none mb-4 md:mb-0">
            <div className="flex flex-col items-start gap-6 md:gap-8 w-full md:w-[226px] h-auto md:h-[324px] flex-none flex-grow">
                {/* Agent Info */}
                <div className="flex flex-row items-center gap-4 w-full md:w-[226px] h-auto md:h-20 flex-none">
                    <div className="w-16 h-16 md:w-20 md:h-20 flex-none relative">
                        <div className="absolute inset-0 bg-gray-300 border border-[#293056] rounded-full flex items-center justify-center overflow-hidden">
                            <img 
                                src={contactInfo.image} 
                                alt={contactInfo.name}
                                className="w-full h-full object-cover rounded-full"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                            <div className="absolute inset-0 bg-gray-300 rounded-full flex items-center justify-center" style={{display: 'none'}}>
                                <span className="font-work-sans font-medium text-sm md:text-base leading-6 text-[#1C1463]">
                                    {contactInfo.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </span>
                            </div>
                        </div>
                        {/* Online indicator */}
                        <div className="absolute w-4 h-4 left-2 top-2">
                            <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                    </div>
                    <div className="flex flex-col items-start w-full md:w-[130px] flex-none">
                        <h5 className="w-full md:w-[130px] h-auto md:h-[26px] font-space-grotesk font-bold text-sm md:text-base leading-[26px] flex items-center tracking-[-0.03em] uppercase text-[#293056] flex-none">
                            {contactInfo.name}
                        </h5>
                        <p className="w-full md:w-[130px] h-auto md:h-[25px] font-work-sans font-normal text-sm md:text-base leading-[25px] flex items-center tracking-[-0.03em] text-[#293056] flex-none">
                            {contactInfo.title}
                        </p>
                    </div>
                </div>

                {/* Contact Details */}
                <div className="flex flex-col justify-center items-start gap-3 md:gap-4 w-full md:w-[226px] h-auto md:h-36 flex-none">
                    {/* Email */}
                    <div className="flex flex-row items-center gap-1 w-full md:w-[226px] flex-none">
                        <div className="w-8 h-8 flex-none relative">
                            <div className="absolute w-8 h-8 left-0 top-0 bg-gray-100 rounded-full"></div>
                            <div className="absolute w-4 h-4 left-2 top-2">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2.6665 2.66675H13.3332C14.0665 2.66675 14.6665 3.26675 14.6665 4.00008V12.0001C14.6665 12.7334 14.0665 13.3334 13.3332 13.3334H2.6665C1.93317 13.3334 1.33317 12.7334 1.33317 12.0001V4.00008C1.33317 3.26675 1.93317 2.66675 2.6665 2.66675Z" stroke="#293056" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                    <path d="M14.6665 4L7.99984 8.66667L1.33317 4" stroke="#293056" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                </svg>
                            </div>
                        </div>
                        <span className="w-full md:w-[149px] font-work-sans font-normal text-xs md:text-sm leading-4 md:leading-6 flex items-center tracking-[-0.03em] text-[#293056] flex-none">
                            {contactInfo.email}
                        </span>
                    </div>

                    {/* Phone */}
                    <div className="flex flex-row items-center gap-1 w-full md:w-[226px] flex-none">
                        <div className="w-8 h-8 flex-none relative">
                            <div className="absolute w-8 h-8 left-0 top-0 bg-gray-100 rounded-full"></div>
                            <div className="absolute w-4 h-4 left-2 top-2">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M14.6665 11.2801V13.2801C14.6665 13.7801 14.2665 14.1801 13.7665 14.1801C6.39984 14.1801 1.33317 9.11341 1.33317 1.74675C1.33317 1.24675 1.73317 0.846748 2.23317 0.846748H4.23317C4.73317 0.846748 5.13317 1.24675 5.13317 1.74675V3.74675L3.1665 5.71341C4.83317 9.04675 7.4665 11.6801 10.7998 13.3467L12.7665 11.3801H14.6665V11.2801Z" stroke="#293056" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                </svg>
                            </div>
                        </div>
                        <span className="w-full md:w-[102px] font-work-sans font-normal text-xs md:text-sm leading-4 md:leading-6 flex items-center tracking-[-0.03em] text-[#293056] flex-none">
                            {contactInfo.phone}
                        </span>
                    </div>

                    {/* Address */}
                    <div className="flex flex-row items-start gap-1 w-full md:w-[226px] flex-none">
                        <div className="w-8 h-8 flex-none relative">
                            <div className="absolute w-8 h-8 left-0 top-0 bg-gray-100 rounded-full"></div>
                            <div className="absolute w-4 h-4 left-2 top-2">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 8.66675C9.10457 8.66675 10 7.77132 10 6.66675C10 5.56218 9.10457 4.66675 8 4.66675C6.89543 4.66675 6 5.56218 6 6.66675C6 7.77132 6.89543 8.66675 8 8.66675Z" stroke="#141B34" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"></path>
                                    <path d="M8 1.33341C6.67392 1.33341 5.40215 1.86008 4.46447 2.79775C3.52678 3.73543 3 5.0072 3 6.33341C3 9.33341 8 14.6667 8 14.6667C8 14.6667 13 9.33341 13 6.33341C13 5.0072 12.4732 3.73543 11.5355 2.79775C10.5979 1.86008 9.32608 1.33341 8 1.33341Z" stroke="#141B34" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"></path>
                                </svg>
                            </div>
                        </div>
                        <span className="w-full md:w-[190px] h-auto md:h-12 font-work-sans font-normal text-xs md:text-sm leading-4 md:leading-6 tracking-[-0.03em] text-[#293056] flex-grow">
                            {contactInfo.address}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    // Contact form component integrated directly
    const renderContactForm = () => {
        const [formData, setFormData] = useState({
            name: auth?.user?.name || '',
            email: auth?.user?.email || '',
            phone: '',
            message: '',
            inquiry_categories: []
        });

        const [isSubmitting, setIsSubmitting] = useState(false);
        const [submitStatus, setSubmitStatus] = useState(null);
        const [errors, setErrors] = useState({});

        // Dynamic categories from pageContent or default
        const categories = pageContent?.contactForm?.categories || [
            { value: 'buyer', label: 'Buyer' },
            { value: 'seller', label: 'Seller' },
            { value: 'renter', label: 'Renter' },
            { value: 'other', label: 'Other' }
        ];

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));

            // Clear error for this field
            if (errors[name]) {
                setErrors(prev => ({
                    ...prev,
                    [name]: null
                }));
            }
        };

        const handleCategoryToggle = (categoryValue) => {
            const currentCategories = [...formData.inquiry_categories];
            const index = currentCategories.indexOf(categoryValue);
            
            if (index > -1) {
                // Remove category
                currentCategories.splice(index, 1);
            } else if (currentCategories.length < 2) {
                // Add category (max 2)
                currentCategories.push(categoryValue);
            }
            
            setFormData(prev => ({
                ...prev,
                inquiry_categories: currentCategories
            }));

            // Clear category error
            if (errors.inquiry_categories) {
                setErrors(prev => ({
                    ...prev,
                    inquiry_categories: null
                }));
            }
        };

        const validateForm = () => {
            const newErrors = {};
            
            if (!formData.name.trim()) {
                newErrors.name = 'Name is required';
            }
            
            if (!formData.email.trim()) {
                newErrors.email = 'Email is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newErrors.email = 'Please enter a valid email address';
            }
            
            if (formData.inquiry_categories.length === 0) {
                newErrors.inquiry_categories = 'Please select at least one category';
            }
            
            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            
            console.log('Form submit triggered:', formData);
            
            if (!validateForm()) {
                console.log('Validation failed:', errors);
                return;
            }
            
            setIsSubmitting(true);
            setErrors({});
            
            try {
                // Get CSRF token
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                
                console.log('Submitting to /contact with data:', formData);
                
                const response = await fetch('/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken || '',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify(formData)
                });

                console.log('Response status:', response.status);
                const data = await response.json();
                console.log('Response data:', data);

                if (response.ok && data.success) {
                    setSubmitStatus('success');
                    console.log('Contact form submitted successfully:', data);
                    
                    // Reset form after success
                    setTimeout(() => {
                        setFormData({
                            name: auth?.user?.name || '',
                            email: auth?.user?.email || '',
                            phone: '',
                            message: '',
                            inquiry_categories: []
                        });
                        setSubmitStatus(null);
                    }, 3000);
                } else {
                    console.log('Submission failed:', data);
                    // Handle validation errors
                    if (data.errors) {
                        setErrors(data.errors);
                    } else {
                        setErrors({ general: data.message || 'An error occurred. Please try again.' });
                    }
                }
            } catch (error) {
                console.error('Error submitting contact form:', error);
                setErrors({ general: 'Network error. Please check your connection and try again.' });
            } finally {
                setIsSubmitting(false);
            }
        };

        if (submitStatus === 'success') {
            return (
                <div className="flex flex-col justify-center items-center p-4 gap-4 w-full max-w-[400px] md:w-[268px] md:max-w-[268px] h-auto md:h-[356px] bg-white shadow-[0px_0px_16.3px_rgba(0,0,0,0.1)] rounded-xl">
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="font-space-grotesk font-bold text-lg text-[#293056] mb-2">
                            Thank you!
                        </h3>
                        <p className="font-work-sans text-sm text-gray-600 mb-4">
                            We received your inquiry and will contact you within 24 hours.
                        </p>
                        <button 
                            onClick={() => setSubmitStatus(null)}
                            className="text-sm text-[#293056] hover:text-[#1C1463] transition-colors underline"
                        >
                            Submit another inquiry
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex flex-col justify-between items-start p-4 gap-4 w-full max-w-[400px] md:w-[268px] md:max-w-[268px] h-auto bg-white shadow-[0px_0px_16.3px_rgba(0,0,0,0.1)] rounded-xl flex-none">
                <div className="flex flex-col items-center gap-1 w-full h-auto flex-none mx-auto">
                    <div className="flex flex-row items-center gap-4 w-full h-auto flex-none">
                        <div className="flex flex-col items-start w-full h-auto flex-none flex-grow">
                            <h5 className="w-full h-auto font-space-grotesk font-bold text-sm md:text-base leading-[26px] flex items-center tracking-[-0.03em] uppercase text-[#293056] flex-none">
                                {pageContent?.contactForm?.title || "We'd love to hear from you"}
                            </h5>
                        </div>
                    </div>
                    
                    {/* Error Messages */}
                    {errors.general && (
                        <div className="w-full text-red-500 text-xs text-center bg-red-50 p-2 rounded mb-2">
                            {errors.general}
                        </div>
                    )}
                    
                    <div className="flex flex-col justify-center items-start gap-1.5 md:gap-2 w-full h-auto flex-none">
                        {/* Name Input */}
                        <div className="flex flex-col items-start gap-0.5 w-full h-auto border-b border-[#D5D7DA] flex-none">
                            <div className="flex flex-col items-start w-full h-auto flex-none">
                                <div className="flex flex-row items-center py-2 md:py-[10px] px-0 pb-3 md:pb-4 gap-2 w-full h-auto filter drop-shadow-[0px_1px_2px_rgba(16,24,40,0.05)] rounded flex-none">
                                    <div className="flex flex-row items-center gap-2 w-full h-auto flex-none flex-grow">
                                        <input 
                                            type="text" 
                                            name="name"
                                            placeholder={pageContent?.contactForm?.fields?.name?.placeholder || "Your Name"}
                                            value={formData.name}
                                            onChange={handleChange}
                                            className={`w-full h-auto font-work-sans font-normal text-xs leading-[21px] tracking-[-0.04em] ${errors.name ? 'text-red-500 placeholder-red-300' : 'text-[#717680]'} flex-none flex-grow border-none outline-none bg-transparent`}
                                            required
                                        />
                                    </div>
                                </div>
                                {errors.name && (
                                    <div className="text-red-500 text-xs mb-1">{errors.name}</div>
                                )}
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="flex flex-col items-start gap-0.5 w-full h-auto border-b border-[#D5D7DA] flex-none">
                            <div className="flex flex-col items-start w-full h-auto flex-none">
                                <div className="flex flex-row items-center py-2 md:py-[10px] px-0 pb-3 md:pb-4 gap-2 w-full h-auto filter drop-shadow-[0px_1px_2px_rgba(16,24,40,0.05)] rounded flex-none">
                                    <div className="flex flex-row items-center gap-2 w-full h-auto flex-none flex-grow">
                                        <input 
                                            type="email" 
                                            name="email"
                                            placeholder={pageContent?.contactForm?.fields?.email?.placeholder || "Email"}
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`w-full h-auto font-work-sans font-normal text-xs leading-[21px] tracking-[-0.04em] ${errors.email ? 'text-red-500 placeholder-red-300' : 'text-[#717680]'} flex-none flex-grow border-none outline-none bg-transparent`}
                                            required
                                        />
                                    </div>
                                </div>
                                {errors.email && (
                                    <div className="text-red-500 text-xs mb-1">{errors.email}</div>
                                )}
                            </div>
                        </div>

                        {/* Phone Input */}
                        <div className="flex flex-col items-start gap-0.5 w-full h-auto border-b border-[#D5D7DA] flex-none">
                            <div className="flex flex-col items-start w-full h-auto flex-none">
                                <div className="flex flex-row items-center py-2 md:py-[10px] px-0 pb-3 md:pb-4 gap-2 w-full h-auto filter drop-shadow-[0px_1px_2px_rgba(16,24,40,0.05)] rounded flex-none">
                                    <div className="flex flex-row items-center gap-2 w-full h-auto flex-none flex-grow">
                                        <input 
                                            type="tel" 
                                            name="phone"
                                            placeholder={pageContent?.contactForm?.fields?.phone?.placeholder || "Phone Number"}
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full h-auto font-work-sans font-normal text-xs leading-[21px] tracking-[-0.04em] text-[#717680] flex-none flex-grow border-none outline-none bg-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Message Input */}
                        <div className="flex flex-col items-start gap-0.5 w-full h-auto border-b border-[#D5D7DA] flex-none">
                            <div className="flex flex-col items-start w-full h-auto flex-none">
                                <div className="flex flex-row items-center py-2 md:py-[10px] px-0 pb-3 md:pb-4 gap-2 w-full h-auto filter drop-shadow-[0px_1px_2px_rgba(16,24,40,0.05)] rounded flex-none">
                                    <div className="flex flex-row items-center gap-2 w-full h-auto flex-none flex-grow">
                                        <textarea 
                                            name="message"
                                            placeholder={pageContent?.contactForm?.fields?.message?.placeholder || "Message (optional)"}
                                            value={formData.message}
                                            onChange={handleChange}
                                            rows="2"
                                            className="w-full h-auto font-work-sans font-normal text-xs leading-[21px] tracking-[-0.04em] text-[#717680] flex-none flex-grow border-none outline-none bg-transparent resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-start gap-3 md:gap-0 w-full h-auto flex-none mx-auto">
                    <div className="flex flex-col items-start gap-3 md:gap-0 w-full h-auto flex-none">
                        <div className="flex flex-row items-center gap-3 w-full h-auto flex-none">
                            <div className="flex flex-row justify-center items-center gap-1 w-5 h-[18px] mix-blend-normal rounded-[250px] flex-none">
                                <div className="w-5 h-5 flex-none">
                                    <svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g clipPath="url(#clip0_8805_77452)">
                                            <path d="M7.32923 12.7293L3.85423 9.25426L2.6709 10.4293L7.32923 15.0876L17.3292 5.0876L16.1542 3.9126L7.32923 12.7293Z" fill="#A4A7AE"></path>
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_8805_77452">
                                                <path d="M0 9.5C0 4.52944 4.02944 0.5 9 0.5H11C15.9706 0.5 20 4.52944 20 9.5C20 14.4706 15.9706 18.5 11 18.5H9C4.02944 18.5 0 14.4706 0 9.5Z" fill="white"></path>
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </div>
                            </div>
                            <span className="w-full h-auto font-work-sans font-normal text-xs leading-[21px] flex items-center tracking-[-0.04em] text-[#293056] flex-grow">
                                {pageContent?.contactForm?.categoryLabel || "I am a: *(select up to 2 categories)"}
                            </span>
                        </div>
                        
                        <div className="flex flex-row justify-between items-center gap-1.5 md:gap-2 w-full h-auto flex-none">
                            {categories.map((category) => (
                                <button
                                    key={category.value}
                                    type="button"
                                    onClick={() => handleCategoryToggle(category.value)}
                                    className={`flex flex-row justify-center items-center gap-1 md:gap-2 w-auto h-auto rounded-[100px] flex-none mx-auto transition-colors ${
                                        formData.inquiry_categories.includes(category.value)
                                            ? 'bg-[#9C2A10] text-white'
                                            : 'bg-[#FDFDFD] border border-[#1C1463] text-[#1C1463] hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex flex-row justify-center items-center py-1 md:py-1.5 px-2 md:px-4 gap-1 md:gap-2.5 h-auto flex-none">
                                        <span className="font-work-sans font-normal text-xs leading-[21px] flex items-center text-center tracking-[-0.04em] flex-none">
                                            {category.label}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                        
                        {errors.inquiry_categories && (
                            <div className="w-full text-red-500 text-xs text-center">
                                {errors.inquiry_categories}
                            </div>
                        )}
                    </div>
                    
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex flex-col justify-center items-center gap-2 w-full h-auto rounded-[100px] flex-none mx-auto transition-opacity hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
                        style={{ backgroundColor: buttonTertiaryBg }}
                    >
                        <div className="flex flex-row justify-center items-center py-2 md:py-2.5 px-4 md:px-6 gap-2 w-full h-auto flex-none">
                            {isSubmitting ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 mr-2" style={{ borderColor: buttonTertiaryText }}></div>
                                    <span className="font-work-sans font-bold text-sm leading-6 flex items-center text-center tracking-[-0.03em] flex-none" style={{ color: buttonTertiaryText }}>
                                        {pageContent?.contactForm?.submitButton?.loadingText || "Submitting..."}
                                    </span>
                                </div>
                            ) : (
                                <span className="w-auto h-auto font-work-sans font-bold text-sm leading-6 flex items-center text-center tracking-[-0.03em] flex-none" style={{ color: buttonTertiaryText }}>
                                    {pageContent?.contactForm?.submitButton?.text || "Submit"}
                                </span>
                            )}
                        </div>
                    </button>
                </div>
            </div>
        );
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="py-8 px-4">
                        <h3 className="font-space-grotesk font-bold text-2xl text-[#293056] mb-4">{overviewContent.title}</h3>
                        {overviewContent.content.map((paragraph, index) => (
                            <p key={index} className={`font-work-sans text-gray-600 ${index < overviewContent.content.length - 1 ? 'mb-4' : ''}`}>
                                {paragraph}
                            </p>
                        ))}
                    </div>
                );
            case 'keyFacts':
                return (
                    <div className="py-8 px-4">
                        <h3 className="font-space-grotesk font-bold text-2xl text-[#293056] mb-4">{keyFactsContent.title}</h3>
                        <div className="space-y-3">
                            {keyFactsContent.facts.map((fact, index) => (
                                <div key={index} className="flex justify-between">
                                    <span className="font-work-sans font-medium">{fact.label}:</span>
                                    <span className="font-work-sans">{fact.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'amenities':
                return (
                    <div className="py-8 px-4">
                        <h3 className="font-space-grotesk font-bold text-2xl text-[#293056] mb-4">{amenitiesContent.title}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {amenitiesContent.items.map((amenity, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-[#293056] rounded-full"></div>
                                    <span className="font-work-sans">{amenity}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'highlights':
                return (
                    <div className="py-8 px-4">
                        <h3 className="font-space-grotesk font-bold text-2xl text-[#293056] mb-4">{highlightsContent.title}</h3>
                        <div className="space-y-4">
                            {highlightsContent.highlights.map((highlight, index) => (
                                <div key={index}>
                                    <h4 className="font-work-sans font-semibold text-lg text-[#293056] mb-2">{highlight.title}</h4>
                                    <p className="font-work-sans text-gray-600">
                                        {highlight.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'contact':
                return (
                    <div className="py-8">
                        <div className="flex w-full justify-between items-center">
                            <div className="flex flex-col md:flex-row w-full pr-0 md:pr-1 justify-between items-center gap-4 md:gap-8">
                                {renderContactInfo()}
                                {renderContactForm()}
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <section className="py-8 md:py-16 bg-white">
            <div className="container mx-auto px-4 md:px-6">
                {/* Tab Navigation */}
                <nav className="flex gap-x-6 overflow-x-auto md:overflow-x-visible px-0 md:px-0 md:mx-0 scrollbar-hide mb-8" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-4 font-bold text-xl leading-none transition-colors border-b-2 font-red-hat whitespace-nowrap flex-shrink-0 ${
                                activeTab === tab.id
                                    ? 'border-gray-900 text-gray-900'
                                    : 'border-transparent text-gray-900 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>

                {/* Tab Content */}
                <div className="min-h-[400px]">
                    {renderTabContent()}
                </div>
            </div>
        </section>
    );
}