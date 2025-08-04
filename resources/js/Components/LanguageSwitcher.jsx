import React, { useState, useEffect } from 'react';
import translationManager from '../utils/translations';

const LanguageSwitcher = ({ className = '' }) => {
    const [currentLocale, setCurrentLocale] = useState(translationManager.getLocale());
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const languages = {
        en: { name: 'English', flag: '🇺🇸' },
        fr: { name: 'Français', flag: '🇫🇷' }
    };

    useEffect(() => {
        const handleLocaleChange = (event) => {
            setCurrentLocale(event.detail.locale);
            setIsDropdownOpen(false);
        };

        window.addEventListener('localeChanged', handleLocaleChange);
        return () => window.removeEventListener('localeChanged', handleLocaleChange);
    }, []);

    const switchLanguage = (locale) => {
        if (translationManager.setLocale(locale)) {
            setCurrentLocale(locale);
            setIsDropdownOpen(false);
            
            // Reload the page to apply translations
            window.location.reload();
        }
    };

    return (
        <div className={`relative inline-block text-left ${className}`}>
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                aria-expanded="true"
                aria-haspopup="true"
            >
                <span>{languages[currentLocale]?.flag}</span>
                <span>{languages[currentLocale]?.name}</span>
                <svg
                    className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isDropdownOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsDropdownOpen(false)}
                    />
                    
                    {/* Dropdown */}
                    <div className="absolute right-0 z-50 w-40 mt-2 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                        <div className="py-1">
                            {Object.entries(languages).map(([locale, { name, flag }]) => (
                                <button
                                    key={locale}
                                    onClick={() => switchLanguage(locale)}
                                    className={`flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
                                        currentLocale === locale ? 'bg-gray-50 text-indigo-600' : 'text-gray-700'
                                    }`}
                                >
                                    <span>{flag}</span>
                                    <span>{name}</span>
                                    {currentLocale === locale && (
                                        <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default LanguageSwitcher;
