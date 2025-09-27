import React from 'react';
import { Link } from '@inertiajs/react';

const Footer = () => {
    return (
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
                                Your new home is waiting
                            </h2>

                            {/* Subheading with responsive styles */}
                            <p className="font-work-sans font-normal text-base md:text-lg leading-6 md:leading-[27px] tracking-[-0.03em] text-white max-w-lg">
                                Apply online in minutes or get in touch to schedule a personalized tour
                            </p>

                            {/* Agent Card with responsive styles */}
                            <div className="flex flex-col md:flex-row items-center md:items-center gap-4 bg-gray-700 rounded-2xl p-4 md:p-6 w-full max-w-md">
                                {/* Avatar with responsive styles */}
                                <div className="w-16 h-16 md:w-20 md:h-20 flex-none relative">
                                    <div className="absolute inset-0 bg-gray-300 border-[2.5px] border-white rounded-full flex items-center justify-center overflow-hidden">
                                        <img 
                                            src="/assets/jatin-gill.png" 
                                            alt="Jatin Gill"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextElementSibling.style.display = 'flex';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gray-300 rounded-full flex items-center justify-center hidden">
                                            <span className="font-work-sans font-medium text-sm md:text-base leading-6 text-[#1C1463]">
                                                JG
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
                                            Jatin Gill
                                        </h3>
                                        {/* Title with responsive styles */}
                                        <p className="font-work-sans font-normal text-sm md:text-base leading-5 md:leading-[25px] tracking-[-0.03em] text-white">
                                            Property Manager
                                        </p>
                                    </div>
                                    
                                    {/* Contact Button with responsive styles */}
                                    <div className="flex flex-col items-center md:items-start p-0 w-full md:w-[130px] h-10 mt-2 md:mt-0">
                                        <button className="flex flex-col justify-center items-center p-0 gap-2 w-full md:w-[130px] h-10 bg-white rounded-full">
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
                                className="mx-auto w-full max-w-[400px] h-[250px] md:w-[611px] md:h-[394px] rounded-xl bg-cover bg-center bg-no-repeat"
                                style={{
                                    backgroundImage: "url('/assets/house-img.jpg')"
                                }}
                            >
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Footer Section */}
            <div className="py-8 md:py-12 border-t border-gray-800">
                <div className="mx-auto px-4 md:px-0 max-w-screen-xl">
                    {/* Mobile: Stack all sections vertically */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-4">
                        {/* X Houses Section */}
                        <div className="flex flex-col items-start gap-3 md:gap-4 w-full md:w-auto">
                            {/* X Houses with responsive styles */}
                            <h3 className="font-space-grotesk font-medium text-xl md:text-[28px] leading-7 md:leading-[38px] tracking-[-0.03em] text-white">
                                X HOUSES
                            </h3>
                            {/* Description with responsive styles */}
                            <p className="font-work-sans font-normal text-sm leading-6 tracking-[-0.03em] text-white max-w-full md:max-w-xs">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent
                            </p>
                        </div>

                        {/* Mobile: Grid layout for contact info sections */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 w-full md:w-auto">
                            {/* Contact Us Section */}
                            <div className="flex flex-col items-start gap-3 md:gap-4">
                                {/* Contact Us with responsive styles */}
                                <h4 className="font-space-grotesk font-bold text-sm md:text-base leading-6 md:leading-[26px] tracking-[-0.03em] uppercase text-white">
                                    CONTACT US
                                </h4>
                                <div className="flex flex-col gap-2">
                                    {/* Phone with responsive styles */}
                                    <p className="font-work-sans font-normal text-sm leading-6 tracking-[-0.03em] text-white">
                                        +1 437 998 1795
                                    </p>
                                    {/* Email with responsive styles */}
                                    <p className="font-work-sans font-normal text-sm leading-6 tracking-[-0.03em] text-white break-all">
                                        Contact@domain.com
                                    </p>
                                    {/* Address with responsive styles */}
                                    <p className="font-work-sans font-normal text-sm leading-6 tracking-[-0.03em] text-white">
                                        Building No.88, Toronto CA, Ontario, Toronto
                                    </p>
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
                                    <Link href="#" className="font-work-sans font-normal text-sm leading-6 tracking-[-0.03em] text-white hover:text-gray-300 transition-colors">
                                        Privacy Policy
                                    </Link>
                                    <Link href="#" className="font-work-sans font-normal text-sm leading-6 tracking-[-0.03em] text-white hover:text-gray-300 transition-colors">
                                        Terms of Service
                                    </Link>
                                    <Link href="#" className="font-work-sans font-normal text-sm leading-6 tracking-[-0.03em] text-white hover:text-gray-300 transition-colors">
                                        Contact Us
                                    </Link>
                                    <Link href="#" className="font-work-sans font-normal text-sm leading-6 tracking-[-0.03em] text-white hover:text-gray-300 transition-colors">
                                        Log in / Sign up
                                    </Link>
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
                                    <Link href="#" className="text-white hover:text-gray-300 transition-colors">
                                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                        </svg>
                                    </Link>
                                    <Link href="#" className="text-white hover:text-gray-300 transition-colors">
                                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path fillRule="evenodd" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.347-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z" clipRule="evenodd" />
                                        </svg>
                                    </Link>
                                    <Link href="#" className="text-white hover:text-gray-300 transition-colors">
                                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Copyright Section */}
                    <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-gray-800">
                        {/* Copyright with responsive styles */}
                        <p className="font-work-sans font-normal text-sm leading-6 tracking-[-0.03em] text-center text-white">
                            Copyright 2025 @sanemuix.com all Right Reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;