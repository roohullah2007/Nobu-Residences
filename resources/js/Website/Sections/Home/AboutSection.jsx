import { useState } from 'react';
import axios from 'axios';

export default function AboutSection({ website, pageContent, availableIcons }) {
    const [activeTab, setActiveTab] = useState('Overview');
    
    // Contact form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        categories: []
    });
    
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');
    
    const tabs = ['Overview', 'Key Facts', 'Amenities', 'Highlights', 'Contact'];
    
    // Get about section content with fallbacks to default
    const aboutContent = pageContent?.about || {};
    const aboutTitle = aboutContent.title || 'Learn everything about Nobu Residence';
    const aboutImage = aboutContent.image || '/assets/nobu-building.jpg';
    const aboutImageAlt = aboutContent.image_alt || 'Nobu Residence Building';
    const aboutTabs = aboutContent.tabs || {};
    
    // Helper function to get icon by name from availableIcons
    const getIcon = (iconName, category) => {
        if (!availableIcons || !iconName) return null;
        
        const categoryIcons = availableIcons[category] || [];
        return categoryIcons.find(icon => icon.name === iconName);
    };

    // Helper function to render SVG icon
    const renderIcon = (iconName, category, defaultIcon = null, className = "w-8 h-8") => {
        const icon = getIcon(iconName, category);
        
        if (icon?.svg_content) {
            return (
                <div 
                    className={className}
                    dangerouslySetInnerHTML={{ __html: icon.svg_content }}
                />
            );
        }
        
        if (icon?.icon_url) {
            return (
                <img 
                    src={icon.icon_url} 
                    alt={iconName}
                    className={className}
                />
            );
        }
        
        // Fallback to default icon if provided
        if (defaultIcon) {
            return (
                <div 
                    className={className}
                    dangerouslySetInnerHTML={{ __html: defaultIcon }}
                />
            );
        }
        
        // Ultimate fallback - simple placeholder
        return (
            <div className={`${className} bg-gray-200 rounded flex items-center justify-center`}>
                <span className="text-gray-400 text-xs">🏢</span>
            </div>
        );
    };

    // Get default data structure for Key Facts
    const getKeyFactsData = () => {
        // Try to get from pageContent first, then fallback to default
        if (aboutTabs?.key_facts?.items) {
            return aboutTabs.key_facts.items;
        }
        
        return [
            { text: '45 floors/ 657 units', icon: 'building' },
            { text: 'Built in 2024', icon: 'calendar' },
            { text: '416 sqft - 1389 sqft', icon: 'measurement' },
            { text: 'High-rise condo', icon: 'tower' },
            { text: 'Avg $1,100 per square foot', icon: 'price' }
        ];
    };

    // Get default data structure for Amenities
    const getAmenitiesData = () => {
        // Try to get from pageContent first, then fallback to default
        if (aboutTabs?.amenities?.items) {
            return aboutTabs.amenities.items;
        }
        
        return [
            { text: 'Concierge', icon: 'concierge' },
            { text: 'Gym', icon: 'gym' },
            { text: 'Guest Suites', icon: 'guest_suite' },
            { text: 'Outdoor Pool', icon: 'pool' },
            { text: 'Party Room', icon: 'party_room' },
            { text: 'Visitor Parking', icon: 'parking' },
            { text: 'Pet Restriction', icon: 'pet' },
            { text: 'Media Room', icon: 'media' },
            { text: 'Meeting Room', icon: 'meeting' },
            { text: 'Parking Garage', icon: 'garage' },
            { text: 'BBQ Permitted', icon: 'bbq' },
            { text: 'Rooftop Deck', icon: 'rooftop' },
            { text: 'Security Guard', icon: 'security' },
            { text: 'Security System', icon: 'security_system' }
        ];
    };

    // Get default data structure for Highlights
    const getHighlightsData = () => {
        // Try to get from pageContent first, then fallback to default
        if (aboutTabs?.highlights?.items) {
            return aboutTabs.highlights.items;
        }
        
        return [
            { text: 'Located at 15 Mercer St in Toronto\'s Entertainment District, with two iconic 49-storey towers and a heritage podium.', icon: 'location' },
            { text: 'Integrated with the world-renowned Nobu Hotel and Restaurant, offering a luxury lifestyle experience.', icon: 'restaurant' },
            { text: 'Premium amenities including concierge services, fitness facilities, and exclusive resident lounges.', icon: 'amenities' },
            { text: 'Steps away from major transit, shopping, dining, and cultural attractions in downtown Toronto.', icon: 'transit' }
        ];
    };

    // Form handling functions
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };
    
    const handleCategoryToggle = (category) => {
        setFormData(prev => {
            const currentCategories = [...prev.categories];
            const index = currentCategories.indexOf(category);
            
            if (index > -1) {
                // Remove category if already selected
                currentCategories.splice(index, 1);
            } else {
                // Add category if not selected (max 2)
                if (currentCategories.length < 2) {
                    currentCategories.push(category);
                }
            }
            
            return {
                ...prev,
                categories: currentCategories
            };
        });
    };
    
    const validateForm = () => {
        const errors = {};
        
        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        }
        
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email is invalid';
        }
        
        if (!formData.phone.trim()) {
            errors.phone = 'Phone number is required';
        } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
            errors.phone = 'Phone number is invalid';
        }
        
        if (formData.categories.length === 0) {
            errors.categories = 'Please select at least one category';
        }
        
        return errors;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        
        setIsSubmitting(true);
        setSubmitError('');
        setSubmitSuccess(false);
        
        try {
            const response = await axios.post('/contact', {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                inquiry_categories: formData.categories.map(cat => cat.toLowerCase()),
                message: 'Contact form submission from About section'
            });
            
            if (response.data.success) {
                setSubmitSuccess(true);
                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    categories: []
                });
                setFormErrors({});
                
                // Hide success message after 5 seconds
                setTimeout(() => {
                    setSubmitSuccess(false);
                }, 5000);
            }
        } catch (error) {
            console.error('Form submission error:', error);
            setSubmitError(error.response?.data?.message || 'An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Default SVG fallbacks for backward compatibility
    const defaultIcons = {
        building: '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.3333 2.66675L2.66663 9.33341" stroke="#293056" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 4V29.3333H9.33333C6.81917 29.3333 5.56209 29.3333 4.78105 28.5523C4 27.7712 4 26.5141 4 24V9.33333" stroke="#293056" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>',
        user: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z" stroke="#020202" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>',
        shield: '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.6668 11.3334C18.6668 7.65152 15.682 4.66675 12.0002 4.66675C8.31827 4.66675 5.3335 7.65152 5.3335 11.3334" stroke="#293056" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>'
    };
    
    return (
        <section className="py-4 md:py-16 bg-[#F5F8FF]">
            <div className="mx-auto px-4 md:px-0 max-w-screen-xl">
                {/* About Badge - Hidden on Mobile */}
                <div className="mb-8 hidden md:block">
                    <span className="inline-block py-2 px-4 bg-[#F5F5F5] text-gray-600 rounded-full shadow-sm font-work-sans font-medium text-sm leading-6 tracking-normal text-center border border-transparent">
                        About
                    </span>
                </div>
                                        
                {/* Section Title - Hidden on Mobile */}
                <h2 className="text-[#293056] mb-16 font-space-grotesk font-bold text-[40px] leading-[50px] -tracking-wider max-w-2xl hidden md:block">
                    {aboutTitle}
                </h2>
                
                {/* Content Grid */}
                <div className="grid lg:grid-cols-2 gap-12 items-start max-w-screen-xl">
                    {/* Building Image - Hidden on Mobile */}
                    <div className="relative hidden md:block">
                        <div className="overflow-hidden rounded-xl w-full max-w-[582px] h-[502px]">
                            <img 
                                src={aboutImage}
                                alt={aboutImageAlt}
                                className="w-full h-full object-cover rounded-xl"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.style.background = 'linear-gradient(to bottom, #60a5fa, #2563eb)';
                                    e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full text-white text-lg font-medium">Nobu Residence</div>';
                                }}
                            />
                        </div>
                    </div>
                        
                    {/* Content Panel */}
                    <div className="overflow-hidden max-w-[582px]">
                        {/* Tab Navigation - Scrollable on Mobile */}
                        <div className="border-b border-gray-200">
                            <nav 
                                className="flex gap-x-6 overflow-x-auto md:overflow-x-visible px-0 md:px-0 md:mx-0 scrollbar-hide" 
                                aria-label="Tabs"
                            >
                                {tabs.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`py-4 font-bold text-xl leading-none transition-colors border-b-2 font-red-hat whitespace-nowrap flex-shrink-0 ${
                                            activeTab === tab
                                                ? 'border-gray-900 text-gray-900'
                                                : 'border-transparent text-gray-900 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </nav>
                        </div>
                        
                        {/* Tab Content */}
                        <div className="py-8">
                            {activeTab === 'Overview' && (
                                <div className="prose prose-gray max-w-none">
                                    <p className="text-gray-700 font-work-sans font-normal text-lg leading-[27px] -tracking-wider">
                                        {aboutContent?.content || aboutTabs?.overview?.content || 
                                        `Found in Toronto's King West area and built in 2024, Nobu Residences was 
                                        built by Madison Group. This Toronto condo sits near the intersection of 
                                        Spadina Ave and Wellington St W. Nobu Residences is a High-Rise condo 
                                        located in the King West neighbourhood. Nobu Residences is a 45 storey 
                                        condo, located at 15 Mercer Street. There are suites ranging in size from 417 to 
                                        1091 sqft. This Toronto condo has 658 units. Residents of this condo can enjoy 
                                        amenities like a Concierge and Gym, along with an.`}
                                    </p>
                                </div>
                            )}
                            
                            {activeTab === 'Key Facts' && (
                                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                    {getKeyFactsData().map((fact, index) => (
                                        <div key={index} className="flex flex-row items-center gap-3.5 w-[297px] h-8">
                                            <div className="w-8 h-8 flex-none">
                                                {renderIcon(fact.icon, 'key_facts', defaultIcons.building)}
                                            </div>
                                            <span className="font-work-sans font-normal text-lg leading-[27px] tracking-[-0.03em] text-[#293056] flex items-center">
                                                {fact.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {activeTab === 'Amenities' && (
                                <div className="space-y-4">
                                    {/* Amenities Grid - 4 columns */}
                                    <div className="grid grid-cols-4 gap-x-4 gap-y-6">
                                        {getAmenitiesData().map((amenity, index) => (
                                            <div key={index} className="flex flex-row items-center gap-2 w-[140.5px] h-8">
                                                <div className="w-5 h-5 flex-none">
                                                    {renderIcon(amenity.icon, 'amenities', defaultIcons.user, "w-5 h-5")}
                                                </div>
                                                <span className="font-red-hat font-semibold text-sm leading-6 text-[#545454] flex items-center">
                                                    {amenity.text}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {activeTab === 'Highlights' && (
                                <div className="space-y-4">
                                    {/* Highlights List */}
                                    <div className="space-y-6">
                                        {getHighlightsData().map((highlight, index) => (
                                            <div key={index} className="flex flex-row items-center gap-[14px] w-[658px] h-[54px]">
                                                <div className="w-8 h-8 flex-none">
                                                    {renderIcon(highlight.icon, 'highlights', defaultIcons.shield)}
                                                </div>
                                                <span className="w-[612px] h-[54px] font-work-sans font-normal text-lg leading-[27px] flex items-center tracking-[-0.03em] text-[#293056] flex-grow">
                                                    {highlight.text}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {activeTab === 'Contact' && (
                                <div className="flex w-full justify-between items-center">
                                    {/* Contact Cards Container */}
                                    <div className="flex flex-col md:flex-row w-full pr-0 md:pr-1 justify-between items-center">
                                        {/* Contact Information Card */}
                                        <div className="flex flex-col justify-between items-start p-4 gap-4 w-full max-w-[400px] md:w-[268px] md:max-w-[268px] h-auto md:h-[356px] bg-white shadow-[0px_0px_16.3px_rgba(0,0,0,0.1)] rounded-xl flex-none mb-4 md:mb-0">
                                            <div className="flex flex-col items-start gap-6 md:gap-8 w-full md:w-[226px] h-auto md:h-[324px] flex-none flex-grow">
                                                {/* Profile Section */}
                                                <div className="flex flex-row items-center gap-4 w-full md:w-[226px] h-auto md:h-20 flex-none">
                                                    {/* Avatar */}
                                                    <div className="w-16 h-16 md:w-20 md:h-20 flex-none relative">
                                                        <div className="absolute inset-0 bg-gray-300 border border-[#293056] rounded-full flex items-center justify-center">
                                                            <img 
                                                                src="/assets/jatin-gill.png" 
                                                                alt={website?.contact_info?.agent?.name || "Jatin Gill"}
                                                                className="w-full h-full object-cover rounded-full"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextElementSibling.style.display = 'flex';
                                                                }}
                                                            />
                                                            <div className="absolute inset-0 bg-gray-300 rounded-full flex items-center justify-center hidden">
                                                                <span className="font-work-sans font-medium text-sm md:text-base leading-6 text-[#1C1463]">
                                                                    {(website?.contact_info?.agent?.name || "Jatin Gill").split(' ').map(n => n[0]).join('')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Name & Title */}
                                                    <div className="flex flex-col items-start w-full md:w-[130px] flex-none">
                                                        <h5 className="w-full md:w-[130px] h-auto md:h-[26px] font-space-grotesk font-bold text-sm md:text-base leading-[26px] flex items-center tracking-[-0.03em] uppercase text-[#293056] flex-none">
                                                            {website?.contact_info?.agent?.name || "Jatin Gill"}
                                                        </h5>
                                                        <p className="w-full md:w-[130px] h-auto md:h-[25px] font-work-sans font-normal text-sm md:text-base leading-[25px] flex items-center text-center tracking-[-0.03em] text-[#293056] flex-none">
                                                            {website?.contact_info?.agent?.title || "Property Manager"}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                {/* Contact Details */}
                                                <div className="flex flex-col justify-center items-start gap-3 md:gap-4 w-full md:w-[226px] h-auto md:h-36 flex-none">
                                                    {/* Email */}
                                                    <div className="flex flex-row items-center gap-1 w-full md:w-[226px] flex-none">
                                                        <div className="w-8 h-8 flex-none relative">
                                                            <div className="absolute w-8 h-8 left-0 top-0 bg-gray-100 rounded-full"></div>
                                                            {renderIcon('email', 'contact', 
                                                                '<svg className="absolute w-4 h-4 left-2 top-2" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.6665 2.66675H13.3332C14.0665 2.66675 14.6665 3.26675 14.6665 4.00008V12.0001C14.6665 12.7334 14.0665 13.3334 13.3332 13.3334H2.6665C1.93317 13.3334 1.33317 12.7334 1.33317 12.0001V4.00008C1.33317 3.26675 1.93317 2.66675 2.6665 2.66675Z" stroke="#293056" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M14.6665 4L7.99984 8.66667L1.33317 4" stroke="#293056" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>',
                                                                "absolute w-4 h-4 left-2 top-2"
                                                            )}
                                                        </div>
                                                        <span className="w-full md:w-[149px] font-work-sans font-normal text-xs md:text-sm leading-4 md:leading-6 flex items-center tracking-[-0.03em] text-[#293056] flex-none">
                                                            {website?.contact_info?.email || "Contact@domain.com"}
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Phone */}
                                                    <div className="flex flex-row items-center gap-1 w-full md:w-[226px] flex-none">
                                                        <div className="w-8 h-8 flex-none relative">
                                                            <div className="absolute w-8 h-8 left-0 top-0 bg-gray-100 rounded-full"></div>
                                                            {renderIcon('phone', 'contact',
                                                                '<svg className="absolute w-4 h-4 left-2 top-2" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.6665 11.2801V13.2801C14.6665 13.7801 14.2665 14.1801 13.7665 14.1801C6.39984 14.1801 1.33317 9.11341 1.33317 1.74675C1.33317 1.24675 1.73317 0.846748 2.23317 0.846748H4.23317C4.73317 0.846748 5.13317 1.24675 5.13317 1.74675V3.74675L3.1665 5.71341C4.83317 9.04675 7.4665 11.6801 10.7998 13.3467L12.7665 11.3801H14.6665V11.2801Z" stroke="#293056" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>',
                                                                "absolute w-4 h-4 left-2 top-2"
                                                            )}
                                                        </div>
                                                        <span className="w-full md:w-[102px] font-work-sans font-normal text-xs md:text-sm leading-4 md:leading-6 flex items-center tracking-[-0.03em] text-[#293056] flex-none">
                                                            {website?.contact_info?.phone || "+1 437 998 1795"}
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Address */}
                                                    <div className="flex flex-row items-start gap-1 w-full md:w-[226px] flex-none">
                                                        <div className="w-8 h-8 flex-none relative">
                                                            <div className="absolute w-8 h-8 left-0 top-0 bg-gray-100 rounded-full"></div>
                                                            {renderIcon('address', 'contact',
                                                                '<svg className="absolute w-4 h-4 left-2 top-2" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 8.66675C9.10457 8.66675 10 7.77132 10 6.66675C10 5.56218 9.10457 4.66675 8 4.66675C6.89543 4.66675 6 5.56218 6 6.66675C6 7.77132 6.89543 8.66675 8 8.66675Z" stroke="#141B34" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 1.33341C6.67392 1.33341 5.40215 1.86008 4.46447 2.79775C3.52678 3.73543 3 5.0072 3 6.33341C3 9.33341 8 14.6667 8 14.6667C8 14.6667 13 9.33341 13 6.33341C13 5.0072 12.4732 3.73543 11.5355 2.79775C10.5979 1.86008 9.32608 1.33341 8 1.33341Z" stroke="#141B34" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>',
                                                                "absolute w-4 h-4 left-2 top-2"
                                                            )}
                                                        </div>
                                                        <span className="w-full md:w-[190px] h-auto md:h-12 font-work-sans font-normal text-xs md:text-sm leading-4 md:leading-6 tracking-[-0.03em] text-[#293056] flex-grow">
                                                            {website?.contact_info?.address || "Building No.88, Toronto CA, Ontario, Toronto"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Contact Form Card - Keeping the existing form */}
                                        <form onSubmit={handleSubmit} className="flex flex-col items-start p-4 gap-4 w-full max-w-[400px] md:w-[268px] md:max-w-[268px] h-auto md:min-h-[356px] bg-white shadow-[0px_0px_16.3px_rgba(0,0,0,0.1)] rounded-xl flex-none">
                                            {/* Form Header */}
                                            <div className="flex flex-col items-center gap-1 w-full md:w-[226px] h-auto md:h-[170px] flex-none mx-auto">
                                                <div className="flex flex-row items-center gap-4 w-full md:w-[226px] h-auto md:h-[26px] flex-none">
                                                    <div className="flex flex-col items-start w-full md:w-[226px] h-auto md:h-[26px] flex-none flex-grow">
                                                        <h5 className="w-full md:w-[226px] h-auto md:h-[26px] font-space-grotesk font-bold text-sm md:text-base leading-[26px] flex items-center tracking-[-0.03em] uppercase text-[#293056] flex-none">
                                                            We'd love to hear from you
                                                        </h5>
                                                    </div>
                                                </div>
                                                
                                                {/* Form Fields */}
                                                <div className="flex flex-col justify-center items-start gap-1.5 md:gap-2 w-full md:w-[226px] h-auto md:h-[140px] flex-none">
                                                    {/* Name Input */}
                                                    <div className="flex flex-col items-start gap-0.5 w-full md:w-[226px] h-auto border-b border-[#D5D7DA] flex-none">
                                                        <div className="flex flex-col items-start w-full md:w-[226px] h-auto flex-none">
                                                            <div className="flex flex-row items-center py-2 md:py-[10px] px-0 pb-3 md:pb-4 gap-2 w-full md:w-[226px] h-auto filter drop-shadow-[0px_1px_2px_rgba(16,24,40,0.05)] rounded flex-none">
                                                                <div className="flex flex-row items-center gap-2 w-full md:w-[226px] h-auto md:h-[21px] flex-none flex-grow">
                                                                    <input 
                                                                        type="text" 
                                                                        name="name"
                                                                        value={formData.name}
                                                                        onChange={handleInputChange}
                                                                        placeholder="Your Name"
                                                                        className={`w-full md:w-[226px] h-auto md:h-[21px] font-work-sans font-normal text-xs leading-[21px] tracking-[-0.04em] flex-none flex-grow border-none outline-none bg-transparent ${
                                                                            formErrors.name ? 'placeholder-red-500' : 'text-[#717680]'
                                                                        }`}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {formErrors.name && (
                                                            <span className="text-red-500 text-xs mt-1">{formErrors.name}</span>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Email Input */}
                                                    <div className="flex flex-col items-start gap-0.5 w-full md:w-[226px] h-auto border-b border-[#D5D7DA] flex-none">
                                                        <div className="flex flex-col items-start w-full md:w-[226px] h-auto flex-none">
                                                            <div className="flex flex-row items-center py-2 md:py-[10px] px-0 pb-3 md:pb-4 gap-2 w-full md:w-[226px] h-auto filter drop-shadow-[0px_1px_2px_rgba(16,24,40,0.05)] rounded flex-none">
                                                                <div className="flex flex-row items-center gap-2 w-full md:w-[226px] h-auto md:h-[21px] flex-none flex-grow">
                                                                    <input 
                                                                        type="email" 
                                                                        name="email"
                                                                        value={formData.email}
                                                                        onChange={handleInputChange}
                                                                        placeholder="Email"
                                                                        className={`w-full md:w-[226px] h-auto md:h-[21px] font-work-sans font-normal text-xs leading-[21px] tracking-[-0.04em] flex-none flex-grow border-none outline-none bg-transparent ${
                                                                            formErrors.email ? 'placeholder-red-500' : 'text-[#717680]'
                                                                        }`}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {formErrors.email && (
                                                            <span className="text-red-500 text-xs mt-1">{formErrors.email}</span>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Phone Input */}
                                                    <div className="flex flex-col items-start gap-0.5 w-full md:w-[226px] h-auto border-b border-[#D5D7DA] flex-none">
                                                        <div className="flex flex-col items-start w-full md:w-[226px] h-auto flex-none">
                                                            <div className="flex flex-row items-center py-2 md:py-[10px] px-0 pb-3 md:pb-4 gap-2 w-full md:w-[226px] h-auto filter drop-shadow-[0px_1px_2px_rgba(16,24,40,0.05)] rounded flex-none">
                                                                <div className="flex flex-row items-center gap-2 w-full md:w-[226px] h-auto md:h-[21px] flex-none flex-grow">
                                                                    <input 
                                                                        type="tel" 
                                                                        name="phone"
                                                                        value={formData.phone}
                                                                        onChange={handleInputChange}
                                                                        placeholder="Phone Number"
                                                                        className={`w-full md:w-[226px] h-auto md:h-[21px] font-work-sans font-normal text-xs leading-[21px] tracking-[-0.04em] flex-none flex-grow border-none outline-none bg-transparent ${
                                                                            formErrors.phone ? 'placeholder-red-500' : 'text-[#717680]'
                                                                        }`}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {formErrors.phone && (
                                                            <span className="text-red-500 text-xs mt-1">{formErrors.phone}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Form Footer */}
                                            <div className="flex flex-col items-start gap-3 w-full md:w-[226px] h-auto flex-none mx-auto">
                                                {/* Checkbox & Categories */}
                                                <div className="flex flex-col items-start gap-3 w-full md:w-[226px] h-auto flex-none">
                                                    <div className="flex flex-row items-center gap-3 w-full md:w-[226px] h-auto md:h-[21px] flex-none">
                                                        <div className="flex flex-row justify-center items-center gap-1 w-5 h-[18px] mix-blend-normal rounded-[250px] flex-none">
                                                            <div className="w-5 h-5 flex-none">
                                                            <svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <g clipPath="url(#clip0_8805_77452)">
                                                            <path d="M7.32923 12.7293L3.85423 9.25426L2.6709 10.4293L7.32923 15.0876L17.3292 5.0876L16.1542 3.9126L7.32923 12.7293Z" fill="#A4A7AE"/>
                                                            </g>
                                                            <defs>
                                                            <clipPath id="clip0_8805_77452">
                                                            <path d="M0 9.5C0 4.52944 4.02944 0.5 9 0.5H11C15.9706 0.5 20 4.52944 20 9.5C20 14.4706 15.9706 18.5 11 18.5H9C4.02944 18.5 0 14.4706 0 9.5Z" fill="white"/>
                                                            </clipPath>
                                                            </defs>
                                                            </svg>
                                                            </div>
                                                        </div>
                                                        <span className="w-full md:w-[194px] h-auto md:h-[21px] font-work-sans font-normal text-xs leading-[21px] flex items-center tracking-[-0.04em] text-[#293056] flex-grow">
                                                            I am a: *(select up to 2 categories)
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Category Pills */}
                                                    <div className="flex flex-row justify-between items-center gap-1 w-full md:w-[226px] h-auto flex-none mt-2">
                                                        {['Buyer', 'Seller', 'Renter', 'Other'].map((category) => (
                                                            <button
                                                                key={category}
                                                                type="button"
                                                                onClick={() => handleCategoryToggle(category)}
                                                                className={`flex justify-center items-center h-7 rounded-full cursor-pointer transition-all flex-1 min-w-0 ${
                                                                    formData.categories.includes(category)
                                                                        ? 'bg-[#9C2A10]'
                                                                        : 'bg-[#FDFDFD] border border-[#1C1463]'
                                                                }`}
                                                            >
                                                                <span className={`px-2 py-0.5 font-work-sans font-normal text-[10px] leading-tight ${
                                                                    formData.categories.includes(category)
                                                                        ? 'text-white'
                                                                        : 'text-[#1C1463]'
                                                                }`}>
                                                                    {category}
                                                                </span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                    {formErrors.categories && (
                                                        <span className="text-red-500 text-xs mt-1">{formErrors.categories}</span>
                                                    )}
                                                </div>
                                                
                                                {/* Submit Button */}
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className={`flex justify-center items-center w-full md:w-[226px] h-10 mt-2 mb-4 rounded-[100px] transition-all ${
                                                        isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800 cursor-pointer'
                                                    }`}
                                                >
                                                    <span className="font-work-sans font-bold text-sm leading-6 text-white py-2">
                                                        {isSubmitting ? 'Sending...' : 'Submit'}
                                                    </span>
                                                </button>
                                                
                                                {/* Success/Error Messages */}
                                                {submitSuccess && (
                                                    <div className="w-full mt-2 p-2 bg-green-100 border border-green-400 text-green-700 rounded text-xs text-center">
                                                        Thank you! We'll be in touch soon.
                                                    </div>
                                                )}
                                                {submitError && (
                                                    <div className="w-full mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-xs text-center">
                                                        {submitError}
                                                    </div>
                                                )}
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
