import { Link } from '@inertiajs/react';
import React, { useState } from 'react';
import Navbar from '@/Website/Global/Navbar';
import ContactAgentModal from '@/Website/Components/ContactAgentModal';
import { usePage } from '@inertiajs/react';

export default function SchoolHeroSection({ auth, siteName = 'X Houses', website }) {
    const [showContactModal, setShowContactModal] = useState(false);
    const { globalWebsite, website: pageWebsite } = usePage().props;
    const currentWebsite = website || pageWebsite || globalWebsite;

    const brandColors = currentWebsite?.brand_colors || {
        primary: '#912018',
        secondary: '#293056',
        button_secondary_bg: '#912018',
        button_secondary_text: '#FFFFFF'
    };

    // Get button colors with fallbacks
    const buttonSecondaryBg = brandColors.button_secondary_bg || '#912018';
    const buttonSecondaryText = brandColors.button_secondary_text || '#FFFFFF';

    return (
        <div className="relative bg-cover bg-center bg-no-repeat font-work-sans min-h-screen md:h-[895px]" style={{
            backgroundImage: `url('/assets/school/school-bg.jpg')`
        }}>
            {/* Background Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent"></div>
            
            {/* Header */}
            <Navbar auth={auth} />

            {/* Hero Section */}
            <main className="relative px-4 md:px-0 z-10 flex max-w-[1280px] mx-auto flex-col items-center justify-center min-h-[calc(100vh-80px)] md:h-[calc(895px-80px)] pt-36 md:pt-60 py-8 md:py-0">
                <div className="w-full">
                    {/* Top Section - School Information Card and Agent Card */}
                    <div className="flex w-full flex-col md:flex-row justify-between items-start mb-16 md:mb-16 space-y-6 md:space-y-0 md:space-x-6">
                        {/* School Information Card */}
                        <div className="w-full md:max-w-[593px]">
                            <div className="flex flex-col justify-center items-center p-4 sm:p-6 gap-2 w-full bg-white/10 backdrop-blur-xl rounded-xl">
                                <div className="flex flex-col justify-center items-center p-0 gap-4 sm:gap-6 w-full">
                                    {/* First Row */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-0 gap-2 sm:gap-3.5 w-full">
                                        <div className="w-full sm:flex-1 font-work-sans text-base sm:text-lg leading-6 sm:leading-7 flex items-center tracking-wider text-white">
                                            <span className="font-bold">Type:</span> <span className="font-normal ml-1" style={{fontWeight: 400}}>Catholic</span>
                                        </div>
                                        <div className="w-full sm:flex-1 font-work-sans text-base sm:text-lg leading-6 sm:leading-7 flex items-center tracking-wider text-white">
                                            <span className="font-bold">Language:</span> <span className="font-normal ml-1" style={{fontWeight: 400}}>English</span>
                                        </div>
                                    </div>

                                    {/* Second Row */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start p-0 gap-2 sm:gap-3.5 w-full">
                                        <div className="w-full sm:flex-1 font-work-sans text-base sm:text-lg leading-6 sm:leading-7 flex items-start tracking-wider text-white">
                                            <div className="break-words">
                                                <span className="font-bold">Board:</span> <span className="font-normal ml-1" style={{fontWeight: 400}}>Toronto Catholic District School Board</span>
                                            </div>
                                        </div>
                                        <div className="w-full sm:flex-1 font-work-sans text-base sm:text-lg leading-6 sm:leading-7 flex items-start tracking-wider text-white">
                                            <div className="break-all">
                                                <span className="font-bold">Website:</span> <span className="font-normal ml-1" style={{fontWeight: 400}}>https://clsbe.lisboa.ucp.pt/</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Third Row */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-0 gap-2 sm:gap-3.5 w-full">
                                        <div className="w-full sm:flex-1 font-work-sans text-base sm:text-lg leading-6 sm:leading-7 flex items-center tracking-wider text-white">
                                            <span className="font-bold">Level:</span> <span className="font-normal ml-1" style={{fontWeight: 400}}>Elementary</span>
                                        </div>
                                        <div className="w-full sm:flex-1 font-work-sans text-base sm:text-lg leading-6 sm:leading-7 flex items-center tracking-wider text-white">
                                            <span className="font-bold">Phone:</span> <span className="font-normal ml-1" style={{fontWeight: 400}}>123-145-458</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Agent Card */}
                        <div className="w-full md:max-w-[448px]">
                            <div className="flex flex-col items-start p-4 sm:p-[18px_27px] gap-2.5 w-full bg-white/10 backdrop-blur-xl rounded-tl-3xl rounded-br-3xl rounded-3xl">
                                <div className="flex flex-col items-start p-0 gap-4 sm:gap-6 w-full">
                                    {/* Agent Header */}
                                    <div className="flex flex-row items-center p-0 gap-3 sm:gap-4 w-full">
                                        {/* Avatar */}
                                        {(website?.agent_info?.profile_image || website?.contact_info?.agent?.image) && (
                                            <div
                                                className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 border-2 border-[#293056] rounded-full bg-cover bg-center"
                                                style={{
                                                    backgroundImage: `url('${website?.agent_info?.profile_image || website?.contact_info?.agent?.image}')`
                                                }}
                                            />
                                        )}

                                        {/* Agent Info */}
                                        <div className="flex flex-col items-start p-0 flex-1 min-w-0">
                                            {/* Name */}
                                            {(website?.agent_info?.agent_name || website?.contact_info?.agent?.name) && (
                                                <div className="w-full font-space-grotesk font-bold text-sm sm:text-base leading-5 sm:leading-[26px] flex items-center tracking-wider uppercase text-[#293056] truncate">
                                                    {(website?.agent_info?.agent_name || website?.contact_info?.agent?.name).toUpperCase()}
                                                </div>
                                            )}

                                            {/* Title */}
                                            {(website?.agent_info?.agent_title || website?.contact_info?.agent?.title) && (
                                                <div className="w-full font-work-sans font-bold text-xs sm:text-sm leading-5 sm:leading-6 flex items-center tracking-wider text-[#7E2410] truncate">
                                                    {website?.agent_info?.agent_title || website?.contact_info?.agent?.title}
                                                </div>
                                            )}

                                            {/* Company */}
                                            {(website?.agent_info?.brokerage || website?.contact_info?.agent?.brokerage) && (
                                                <div className="w-full font-work-sans font-medium text-sm sm:text-base leading-5 sm:leading-[25px] flex items-center tracking-wider text-[#293056] truncate">
                                                    {website?.agent_info?.brokerage || website?.contact_info?.agent?.brokerage}
                                                </div>
                                            )}

                                            {/* Phone */}
                                            {(website?.agent_info?.agent_phone || website?.contact_info?.agent?.phone) && (
                                                <div className="w-full font-work-sans font-bold text-sm sm:text-base leading-5 sm:leading-[25px] flex items-center tracking-wider text-[#293056]">
                                                    {website?.agent_info?.agent_phone || website?.contact_info?.agent?.phone}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Contact Button */}
                                    <button
                                        onClick={() => setShowContactModal(true)}
                                        className="flex justify-center items-center w-full h-10 sm:h-12 rounded-full hover:opacity-90 transition-all duration-200"
                                        style={{ backgroundColor: buttonSecondaryBg, color: buttonSecondaryText }}
                                    >
                                        <span className="font-work-sans font-bold text-sm sm:text-base leading-5 sm:leading-6 tracking-wider whitespace-nowrap">
                                            Contact agent
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section - School Information */}
                    <div className="w-full">
                        {/* Left Content */}
                        <div className="flex-1 max-w-full md:max-w-2xl">
                            {/* School Name */}
                            <h1 className="text-white font-bold mb-4 sm:mb-6 font-space-grotesk text-2xl sm:text-3xl md:text-4xl md:text-5xl xl:text-[65px] leading-tight tracking-wider">
                                Holly Name Catholic School
                            </h1>
                            
                            {/* Address */}
                            <p className="text-white mb-3 sm:mb-4 font-work-sans text-base sm:text-lg font-bold tracking-wider">
                                690 Carlaw Ave, Toronto, ON
                            </p>
                            
                            {/* Description */}
                            <p className="text-white mb-6 sm:mb-8 font-work-sans text-base sm:text-lg font-medium tracking-wider">
                                NO55 Mercer Condos in King West, Downtown, Toronto
                            </p>
                            
                            {/* Rating Button */}
                            <button
                                className="flex justify-center items-center w-full sm:w-[203px] h-12 sm:h-16 rounded-full hover:opacity-90 transition-all duration-200"
                                style={{ backgroundColor: buttonSecondaryBg, color: buttonSecondaryText }}
                            >
                                <span className="font-work-sans font-bold text-base sm:text-lg leading-6 sm:leading-7 tracking-wider whitespace-nowrap">
                                    Rating: 8.5/10
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Contact Agent Modal */}
            <ContactAgentModal
                isOpen={showContactModal}
                onClose={() => setShowContactModal(false)}
                agentData={{
                    name: website?.agent_info?.agent_name || website?.contact_info?.agent?.name,
                    title: website?.agent_info?.agent_title || website?.contact_info?.agent?.title,
                    phone: website?.agent_info?.agent_phone || website?.contact_info?.agent?.phone,
                    brokerage: website?.agent_info?.brokerage || website?.contact_info?.agent?.brokerage,
                    image: website?.agent_info?.profile_image || website?.contact_info?.agent?.image
                }}
                propertyData={{
                    BuildingName: 'School Property'
                }}
                auth={auth}
                websiteSettings={{ website }}
            />
        </div>
    );
}