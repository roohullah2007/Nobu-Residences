import { Link } from '@inertiajs/react';
import Navbar from '@/Website/Global/Navbar';

export default function HeroSection({ auth, siteName = 'Nobu Residences', website, pageContent }) {
    const heroContent = pageContent?.hero || {};
    const welcomeText = heroContent.welcome_text || `WELCOME TO ${siteName.toUpperCase()}`;
    const mainHeading = heroContent.main_heading || 'Your Next Home Is\nJust a Click Away';
    const subheading = heroContent.subheading || 'Whether buying or renting, Nobu makes finding your home easy and reliable.';
    const backgroundImage = heroContent.background_image || '/assets/hero-section.jpg';
    const buttons = heroContent.buttons || [
        { text: '6 Condos for rent', url: '/rent', style: 'primary' },
        { text: '6 Condos for sale', url: '/sale', style: 'secondary' }
    ];
    
    const brandColors = website?.brand_colors || {
        primary: '#912018',
        secondary: '#293056'
    };
    return (
        <div className="relative bg-cover bg-center bg-no-repeat font-work-sans h-[696px]" style={{
            backgroundImage: `url('${backgroundImage}')`
        }}>
            {/* Background Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
            
            {/* Header */}
            <Navbar auth={auth} />

            {/* Hero Section */}
            <main className="relative z-10 flex items-end h-[calc(696px-64px)]">
                <div className="mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-screen-xl">
                    <div className="max-w-3xl gap-y-6 flex flex-col">
                        {/* Welcome Text */}
                        <div>
                            <p className="text-white font-work-sans font-normal text-sm leading-6 -tracking-wider">
                                / {welcomeText}
                            </p>
                        </div>
                        
                        {/* Main Heading */}
                        <h1 className="text-white text-[45px] font-space-grotesk font-bold md:text-[65px] leading-[55px] md:leading-[72px] -tracking-wider">
                            {mainHeading.split('\n').map((line, index) => (
                                <span key={index}>
                                    {line}
                                    {index < mainHeading.split('\n').length - 1 && <br />}
                                </span>
                            ))}
                        </h1>
                        
                        {/* Subheading */}
                        <p className="text-white max-w-2xl font-work-sans font-normal text-lg leading-[27px] -tracking-wider">
                            {subheading}
                        </p>
                        
                        {/* CTA Buttons */}
                        <div className="flex gap-4">
                            {buttons.map((button, index) => (
                                <Link
                                    key={index}
                                    href={button.url}
                                    className={`inline-flex items-center justify-center transition-colors shadow-lg font-work-sans font-bold text-sm md:text-lg leading-7 -tracking-wider text-center w-[314.5px] h-16 rounded-full px-8 py-2.5 ${
                                        button.style === 'primary'
                                            ? `bg-[${brandColors.primary}] text-white hover:bg-[${brandColors.primary}]`
                                            : 'bg-white text-gray-900 hover:bg-gray-100'
                                    }`}
                                    style={{
                                        backgroundColor: button.style === 'primary' ? brandColors.primary : undefined
                                    }}
                                >
                                    {button.text}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
