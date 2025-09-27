import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import ContactAgentModal from '@/Website/Components/ContactAgentModal';

const Footer = ({
    siteName = 'Nobu Residences',
    siteUrl = 'www.noburesidences.com',
    year = new Date().getFullYear(),
    website = null,
    pageContent = null,
    auth = null
}) => {
    const [showContactModal, setShowContactModal] = useState(false);

    // Get footer data from pageContent or fallback to defaults
    const footerData = pageContent?.footer || {};
    const footerEnabled = footerData?.enabled !== false; // Default to true
    
    // If footer is disabled, don't render anything
    if (!footerEnabled) {
        return null;
    }
    
    // Get contact info from website or footer data
    const contactInfo = website?.contact_info || {};
    const agentInfo = website?.agent_info || {};
    const socialMedia = website?.social_media || {
        facebook: 'https://facebook.com',
        instagram: 'https://instagram.com',
        linkedin: 'https://linkedin.com'
    };

    // Contact display settings
    const contactSettings = footerData?.contact_info || {};
    const useGlobalContact = contactSettings?.use_global_contact !== false;
    const showPhone = contactSettings?.show_phone !== false;
    const showEmail = contactSettings?.show_email !== false;
    const showAddress = contactSettings?.show_address !== false;

    // Determine which contact info to use - prioritize agent_info from database
    const displayContactInfo = {
        phone: useGlobalContact ? (contactInfo?.phone || '+1 437 998 1795') : (contactSettings?.custom_phone || '+1 437 998 1795'),
        email: useGlobalContact ? (contactInfo?.email || 'Contact@domain.com') : (contactSettings?.custom_email || 'Contact@domain.com'),
        address: useGlobalContact ? (contactInfo?.address || 'Building No.88, Toronto CA, Ontario, Toronto') : (contactSettings?.custom_address || 'Building No.88, Toronto CA, Ontario, Toronto'),
        agent: {
            name: agentInfo?.agent_name || contactInfo?.agent?.name || 'Jatin Gill',
            title: agentInfo?.agent_title || contactInfo?.agent?.title || 'Property Manager',
            phone: agentInfo?.agent_phone || contactInfo?.agent?.phone || '+1 437 998 1795',
            brokerage: agentInfo?.brokerage || contactInfo?.agent?.brokerage || 'Property.ca Inc., Brokerage',
            image: agentInfo?.profile_image || contactInfo?.agent?.image || '/assets/jatin-gill.png'
        }
    };
    
    // Footer content with fallbacks
    const footerContent = {
        heading: footerData?.heading || 'Your new home is waiting',
        subheading: footerData?.subheading || 'Apply online in minutes or get in touch to schedule a personalized tour',
        description: footerData?.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent',
        logo_url: footerData?.logo_url || website?.logo_url || '/assets/logo.png',
        background_image: footerData?.background_image || '/assets/house-img.jpg',
        copyright_text: footerData?.copyright_text || `Copyright ${year} © ${siteName} - All Rights Reserved.`,
        quick_links: footerData?.quick_links || [
            { text: 'Privacy Policy', url: '/privacy' },
            { text: 'Terms of Service', url: '/terms' },
            { text: 'Contact Us', url: '/contact' },
            { text: 'Log in / Sign up', url: '/login' }
        ],
        additional_links: footerData?.additional_links || []
    };
    
    // Social media display settings
    const socialSettings = footerData?.social_media || {};
    const showFacebook = socialSettings?.show_facebook !== false;
    const showInstagram = socialSettings?.show_instagram !== false;
    const showLinkedin = socialSettings?.show_linkedin !== false;
    return (
        <>
        <footer className="bg-black text-white">
            {/* Main Footer Section */}
            <div className="py-8 md:py-16">
                <div className="mx-auto px-4 md:px-0 max-w-screen-xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
                        {/* Left Content */}
                        <div className="flex flex-col items-start gap-6 md:gap-8">
                            {/* Get in touch button with responsive styles */}
                            <div className="flex flex-row items-start p-0 gap-2 w-[117px] h-8 bg-[#F5F5F5] rounded-full">
                                <div className="flex flex-row justify-center items-center py-1.5 px-4 gap-2 w-[117px] h-8">
                                    <span className="w-[85px] h-6 font-work-sans font-medium text-sm leading-6 text-center text-[#293056]">
                                        Get in touch
                                    </span>
                                </div>
                            </div>

                            {/* Main Heading with responsive styles */}
                            <h2 className="font-space-grotesk font-bold text-2xl md:text-[40px] leading-8 md:leading-[50px] tracking-[-0.03em] text-white max-w-md">
                                {footerContent.heading}
                            </h2>

                            {/* Subheading with responsive styles */}
                            <p className="font-work-sans font-normal text-base md:text-lg leading-6 md:leading-[27px] tracking-[-0.03em] text-white max-w-lg">
                                {footerContent.subheading}
                            </p>

                            {/* Agent Card with responsive styles */}
                            <div className="flex flex-col md:flex-row items-center md:items-center gap-4 bg-gray-700 rounded-2xl p-4 md:p-6 w-full max-w-md">
                                {/* Avatar with responsive styles */}
                                <div className="w-16 h-16 md:w-20 md:h-20 flex-none relative">
                                    <div className="absolute inset-0 bg-gray-300 border-[2.5px] border-white rounded-full flex items-center justify-center overflow-hidden">
                                        <img
                                            src={displayContactInfo?.agent?.image}
                                            alt={displayContactInfo?.agent?.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextElementSibling.style.display = 'flex';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gray-300 rounded-full flex items-center justify-center hidden">
                                            <span className="font-work-sans font-medium text-sm md:text-base leading-6 text-[#1C1463]">
                                                {displayContactInfo?.agent?.name ? displayContactInfo.agent.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'JG'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Agent Info & Button */}
                                <div className="flex flex-col md:flex-row items-center md:items-start gap-3 flex-grow w-full">
                                    {/* Agent Details */}
                                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                                        {/* Name with responsive styles */}
                                        <h3 className="font-space-grotesk font-bold text-sm md:text-base leading-6 md:leading-[26px] tracking-[-0.03em] uppercase text-white">
                                            {displayContactInfo?.agent?.name || 'Jatin Gill'}
                                        </h3>
                                        {/* Title with responsive styles */}
                                        <p className="font-work-sans font-normal text-sm md:text-base leading-5 md:leading-[25px] tracking-[-0.03em] text-white">
                                            {displayContactInfo?.agent?.title || 'Property Manager'}
                                        </p>
                                        {/* Brokerage with responsive styles */}
                                        <p className="font-work-sans font-normal text-xs md:text-sm leading-4 md:leading-5 tracking-[-0.03em] text-gray-300">
                                            {displayContactInfo?.agent?.brokerage || 'Property.ca Inc., Brokerage'}
                                        </p>
                                    </div>
                                    
                                    {/* Contact Button with responsive styles */}
                                    <div className="flex flex-col items-center md:items-start p-0 w-full md:w-[130px] h-10 mt-2 md:mt-0">
                                        <button
                                            onClick={() => setShowContactModal(true)}
                                            className="flex flex-col justify-center items-center p-0 gap-2 w-full md:w-[130px] h-10 bg-white rounded-full hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex flex-row justify-center items-center py-2 md:py-2.5 px-4 md:px-6 gap-2 w-full md:w-[130px] h-10 md:h-14">
                                                <span className="font-work-sans font-bold text-sm md:text-base leading-6 text-center tracking-[-0.03em] text-[#293056]">
                                                    Contact us
                                                </span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Content - House Image with responsive styles */}
                        <div className="flex justify-center lg:justify-end order-first lg:order-last">
                            <div 
                                className="mx-auto w-full max-w-[611px] h-[250px] md:w-[611px] md:h-[394px] rounded-xl bg-cover bg-center bg-no-repeat"
                                style={{
                                    backgroundImage: `url('${footerContent.background_image}')`
                                }}
                            >
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Footer Section */}
            <div className="py-8 md:py-12 border-t border-gray-800">
                <div className="mx-auto px-4 md:px-0 max-w-[1280px]">
                    {/* All sections in one row with justify-between */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 md:gap-4">
                        {/* Company/Brand Section */}
                        <div className="flex flex-col items-start gap-3 md:gap-4 w-full md:w-auto">
                            {/* Brand Name with responsive styles */}
                            <h3 className="font-space-grotesk font-medium text-xl md:text-[28px] leading-7 md:leading-[38px] tracking-[-0.03em] text-white">
                                {siteName.toUpperCase()}
                            </h3>
                            {/* Description with responsive styles */}
                            <p className="font-work-sans font-normal text-sm leading-6 tracking-[-0.03em] text-white max-w-full md:max-w-xs">
                                {footerContent.description}
                            </p>
                        </div>

                        {/* Contact Us Section */}
                        <div className="flex flex-col items-start gap-3 md:gap-4">
                            {/* Contact Us with responsive styles */}
                            <h4 className="font-space-grotesk font-bold text-sm md:text-base leading-6 md:leading-[26px] tracking-[-0.03em] uppercase text-white">
                                CONTACT US
                            </h4>
                            <div className="flex flex-col gap-2">
                                {/* Phone with responsive styles */}
                                {showPhone && displayContactInfo?.phone && (
                                    <p className="font-work-sans font-normal text-sm leading-6 tracking-[-0.03em] text-white">
                                        {displayContactInfo.phone}
                                    </p>
                                )}
                                {/* Email with responsive styles */}
                                {showEmail && displayContactInfo?.email && (
                                    <p className="font-work-sans font-normal text-sm leading-6 tracking-[-0.03em] text-white break-all">
                                        {displayContactInfo.email}
                                    </p>
                                )}
                                {/* Address with responsive styles */}
                                {showAddress && displayContactInfo?.address && (
                                    <p className="font-work-sans font-normal text-sm leading-6 tracking-[-0.03em] text-white">
                                        {displayContactInfo.address}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Company Section */}
                        <div className="flex flex-col items-start gap-3 md:gap-4">
                            {/* Company with responsive styles */}
                            <h4 className="font-space-grotesk font-bold text-sm md:text-base leading-6 md:leading-[26px] tracking-[-0.03em] uppercase text-white">
                                COMPANY
                            </h4>
                            <div className="flex flex-col gap-2">
                                {/* Company links with responsive styles */}
                                {footerContent.quick_links.map((link, index) => (
                                    <Link 
                                        key={index}
                                        href={link.url} 
                                        className="font-work-sans font-normal text-sm leading-6 tracking-[-0.03em] text-white hover:text-gray-300 transition-colors"
                                    >
                                        {link.text}
                                    </Link>
                                ))}
                                {footerContent.additional_links.map((link, index) => (
                                    <Link 
                                        key={`additional-${index}`}
                                        href={link.url} 
                                        className="font-work-sans font-normal text-sm leading-6 tracking-[-0.03em] text-white hover:text-gray-300 transition-colors"
                                    >
                                        {link.text}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Follow Us Section */}
                        <div className="flex flex-col items-start gap-3 md:gap-4">
                            {/* Follow Us with responsive styles */}
                            <h4 className="font-space-grotesk font-bold text-sm md:text-base leading-6 md:leading-[26px] tracking-[-0.03em] uppercase text-white">
                                FOLLOW US
                            </h4>
                            <div className="flex gap-4">
                                {/* Social Media Icons with responsive styles */}
                                <a href={socialMedia.facebook || 'https://facebook.com'} target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">
                                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                    </svg>
                                </a>
                                <a href={socialMedia.instagram || 'https://instagram.com'} target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">
                                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" clipRule="evenodd" />
                                    </svg>
                                </a>
                                <a href={socialMedia.linkedin || 'https://linkedin.com'} target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">
                                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Copyright Section */}
                    <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-gray-800">
                        {/* Copyright with responsive styles */}
                        <p className="font-work-sans font-normal text-sm leading-6 tracking-[-0.03em] text-center text-white">
                            {footerContent.copyright_text}
                        </p>
                    </div>
                </div>
            </div>
        </footer>

        {/* Contact Agent Modal */}
        <ContactAgentModal
            isOpen={showContactModal}
            onClose={() => setShowContactModal(false)}
            agentData={{
                name: displayContactInfo?.agent?.name,
                title: displayContactInfo?.agent?.title,
                phone: displayContactInfo?.agent?.phone,
                brokerage: displayContactInfo?.agent?.brokerage,
                image: displayContactInfo?.agent?.image
            }}
            propertyData={{
                BuildingName: siteName
            }}
            auth={auth}
            websiteSettings={{ website }}
        />
    </>
    );
};

export default Footer;