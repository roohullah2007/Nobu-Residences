import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import MainLayout from '@/Website/Global/MainLayout';
import { FAQ } from '@/Website/Global/Components';
import RealEstateLinksSection from '@/Website/Components/PropertyDetail/RealEstateLinksSection';
import PropertyCardV5 from '@/Website/Global/Components/PropertyCards/PropertyCardV5';
import { createBuildingUrl } from '@/utils/slug';
import { validateContactFields, mapServerErrors, focusFirstError } from '@/utils/contactFormValidation';
import PhoneInput from '@/Components/PhoneInput';

export default function DeveloperDetail({
    auth,
    siteName = 'NobuResidence',
    siteUrl,
    year,
    website,
    developer,
    buildings = [],
    listings = [],
    allDevelopers = [],
    faqs = []
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentDateIndex, setCurrentDateIndex] = useState(0);
    const [selectedDateSlot, setSelectedDateSlot] = useState(0);
    const [selectedTime, setSelectedTime] = useState('afternoon');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successType, setSuccessType] = useState('tour');
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
    const [questionFormData, setQuestionFormData] = useState({ name: '', email: '', phone: '', question: '' });

    // Inline validation state — red text under each invalid field plus a
    // summary line for non-field errors. No alert() in these flows.
    const [formErrors, setFormErrors] = useState({});
    const [formServerError, setFormServerError] = useState('');
    const [questionErrors, setQuestionErrors] = useState({});
    const [questionServerError, setQuestionServerError] = useState('');

    const inputClass = (hasError) =>
        `w-full py-2 px-3 border rounded-lg ${hasError ? 'border-red-500' : 'border-gray-300'}`;

    const FieldError = ({ message }) =>
        message ? <p className="text-red-600 text-sm mt-1">{message}</p> : null;

    // Generate dates array
    const generateDates = () => {
        const dates = [];
        const today = new Date();
        for (let i = 1; i <= 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push({
                date: date,
                day: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][date.getDay()],
                dayNum: date.getDate(),
                month: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][date.getMonth()]
            });
        }
        return dates;
    };

    const dates = generateDates();
    const currentDates = [dates[currentDateIndex], dates[currentDateIndex + 1], dates[currentDateIndex + 2]];

    const goToPrevDate = () => { if (currentDateIndex > 0) setCurrentDateIndex(currentDateIndex - 1); };
    const goToNextDate = () => { if (currentDateIndex < dates.length - 3) setCurrentDateIndex(currentDateIndex + 1); };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFormErrors(prev => (prev[name] ? { ...prev, [name]: undefined } : prev));
    };

    const handleQuestionInputChange = (e) => {
        const { name, value } = e.target;
        setQuestionFormData(prev => ({ ...prev, [name]: value }));
        setQuestionErrors(prev => (prev[name] ? { ...prev, [name]: undefined } : prev));
    };

    const getSelectedDateTime = () => {
        const selectedDate = dates[currentDateIndex + selectedDateSlot];
        const timeRanges = { morning: '9AM to 12PM', afternoon: '12PM to 4PM', evening: '4PM to 8PM' };
        return `${selectedDate?.day}, ${selectedDate?.month} ${selectedDate?.dayNum} (${timeRanges[selectedTime]})`;
    };

    const handleTourSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        // Client-side inline validation — red text under each invalid field.
        const clientErrors = validateContactFields(formData);
        if (Object.keys(clientErrors).length > 0) {
            setFormErrors(clientErrors);
            setFormServerError('');
            focusFirstError(clientErrors, { name: 'devTourName', email: 'devTourEmail', phone: 'devTourPhone' });
            return;
        }
        setFormErrors({});
        setFormServerError('');
        setIsSubmitting(true);
        const selectedDate = dates[currentDateIndex + selectedDateSlot];
        const timeRanges = { morning: '9AM to 12PM', afternoon: '12PM to 4PM', evening: '4PM to 8PM' };
        try {
            const response = await fetch('/api/tour-requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    full_name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    message: formData.message,
                    selected_date: `${selectedDate?.day}, ${selectedDate?.month} ${selectedDate?.dayNum}`,
                    selected_time: timeRanges[selectedTime],
                    property_type: 'developer',
                    property_id: developer?.id || null,
                    property_address: developer?.name || 'Developer'
                })
            });
            const result = await response.json();
            if (response.ok && result.success) {
                setFormData({ name: '', email: '', phone: '', message: '' });
                setIsModalOpen(false);
                setSuccessType('tour');
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 5000);
            } else if (result.errors) {
                // Laravel validation errors render inline under their field;
                // anything unmappable shows in the red summary line.
                const { fieldErrors, unmapped } = mapServerErrors(result.errors, {
                    full_name: 'name', name: 'name', email: 'email', phone: 'phone', message: 'message',
                });
                setFormErrors(fieldErrors);
                setFormServerError(unmapped);
                focusFirstError(fieldErrors, { name: 'devTourName', email: 'devTourEmail', phone: 'devTourPhone' });
            } else {
                setFormServerError(result.message || 'Failed to submit tour request.');
            }
        } catch (error) {
            setFormServerError('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleQuestionSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        // Client-side inline validation — red text under each invalid field.
        const clientErrors = validateContactFields(questionFormData, { requireQuestion: true });
        if (Object.keys(clientErrors).length > 0) {
            setQuestionErrors(clientErrors);
            setQuestionServerError('');
            focusFirstError(clientErrors, { name: 'devQuestionName', email: 'devQuestionEmail', phone: 'devQuestionPhone', question: 'devQuestion' });
            return;
        }
        setQuestionErrors({});
        setQuestionServerError('');
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/property-questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: questionFormData.name,
                    email: questionFormData.email,
                    phone: questionFormData.phone,
                    question: questionFormData.question,
                    property_listing_key: developer?.id || null,
                    property_address: developer?.name || 'Developer',
                    property_type: 'developer'
                })
            });
            const result = await response.json();
            if (response.ok && result.success) {
                setQuestionFormData({ name: '', email: '', phone: '', question: '' });
                setIsQuestionModalOpen(false);
                setSuccessType('question');
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 5000);
            } else if (result.errors) {
                // Laravel validation errors render inline under their field;
                // anything unmappable shows in the red summary line.
                const { fieldErrors, unmapped } = mapServerErrors(result.errors, {
                    name: 'name', email: 'email', phone: 'phone', question: 'question',
                });
                setQuestionErrors(fieldErrors);
                setQuestionServerError(unmapped);
                focusFirstError(fieldErrors, { name: 'devQuestionName', email: 'devQuestionEmail', phone: 'devQuestionPhone', question: 'devQuestion' });
            } else {
                setQuestionServerError(result.message || 'Failed to submit question.');
            }
        } catch (error) {
            setQuestionServerError('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter developers based on search
    const filteredDevelopers = allDevelopers.filter(dev =>
        dev.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleBuildingClick = (building) => {
        window.location.href = createBuildingUrl(building.name || building.address, building.id);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.visit(`/developers?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    // If viewing a specific developer, show the detail page layout
    if (developer) {
        return (
            <MainLayout auth={auth} website={website}>
                <Head title={`${developer.name} - Developer`} />

                {/* Header Bar - Same as homepage */}
                <div className="w-full h-[85px] md:h-[120px] relative flex items-center" style={{ backgroundColor: '#292E56' }}>
                </div>

                {/* Developer Hero Section */}
                <section className="pt-8 sm:pt-16 pb-6 sm:pb-8 bg-white">
                    <div className="max-w-[1280px] mx-auto px-4">
                        <div className="flex flex-col lg:flex-row justify-between items-start gap-6 sm:gap-8 rounded-2xl p-4 sm:p-8" style={{ backgroundColor: '#F8F9FC' }}>
                            {/* Left Side - Name & Meta */}
                            <div className="flex-1 w-full lg:w-auto">
                                {/* Type / Established badge */}
                                <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-6">
                                    {developer.type && (
                                        <span className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#912018] text-white text-xs sm:text-sm font-medium capitalize">
                                            {String(developer.type).replace(/_/g, ' & ')}
                                        </span>
                                    )}
                                    {developer.established_year && (
                                        <span className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#293056] text-white text-xs sm:text-sm font-medium">
                                            Est. {developer.established_year}
                                        </span>
                                    )}
                                </div>

                                {/* Developer Name */}
                                <h1
                                    className="font-space-grotesk font-bold text-[#101323]"
                                    style={{
                                        fontSize: 'clamp(36px, 5vw, 56px)',
                                        lineHeight: '1.1',
                                        letterSpacing: '-0.03em'
                                    }}
                                >
                                    {developer.name}
                                </h1>

                                {developer.website && (
                                    <a
                                        href={developer.website.startsWith('http') ? developer.website : `https://${developer.website}`}
                                        target="_blank"
                                        rel="noopener nofollow"
                                        className="inline-flex items-center gap-1.5 mt-3 font-work-sans text-sm sm:text-base text-[#293056] underline hover:opacity-80"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        Visit website
                                    </a>
                                )}
                            </div>

                            {/* Right Side - Logo Card */}
                            <div className="flex-shrink-0 w-full lg:w-auto">
                                <div className="w-full sm:w-[280px] h-[140px] bg-white rounded-2xl border border-gray-200 flex items-center justify-center p-6 shadow-sm">
                                    {developer.logo ? (
                                        <img
                                            src={developer.logo.startsWith('/') ? developer.logo : `/storage/${developer.logo}`}
                                            alt={developer.name}
                                            className="max-w-full max-h-full object-contain"
                                        />
                                    ) : (
                                        <span className="text-4xl font-bold text-[#912018] text-center">
                                            {developer.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Developer Info Section */}
                <section className="py-12 bg-white">
                    <div className="max-w-[1280px] mx-auto px-4">
                        <div className="rounded-2xl p-4 sm:p-8" style={{ backgroundColor: '#F8F9FC' }}>
                            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                                {/* Left Side - Description (from admin-managed content) */}
                                <div className="flex-1 lg:max-w-[60%]">
                                    <div className="mb-8">
                                        <h3
                                            className="font-work-sans font-bold text-[#101323] mb-4"
                                            style={{ fontSize: '18px', lineHeight: '27px', letterSpacing: '-0.03em' }}
                                        >
                                            {developer.established_year
                                                ? `${new Date().getFullYear() - developer.established_year} Years of Excellence`
                                                : `About ${developer.name}`}
                                        </h3>
                                        {developer.description ? (
                                            <p
                                                className="font-work-sans font-normal text-[#101323]/80"
                                                style={{ fontSize: '16px', lineHeight: '25px', letterSpacing: '-0.03em', whiteSpace: 'pre-line' }}
                                            >
                                                {developer.description}
                                            </p>
                                        ) : (
                                            <p
                                                className="font-work-sans font-normal text-[#101323]/80"
                                                style={{ fontSize: '16px', lineHeight: '25px', letterSpacing: '-0.03em' }}
                                            >
                                                {developer.name} is a {String(developer.type || 'developer').replace(/_/g, ' & ')} with {developer.buildings_count || buildings.length || ''} project{(developer.buildings_count || buildings.length) === 1 ? '' : 's'} featured on this site.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Right Side - Stats Cards (admin-managed; a card hides when its value is empty) */}
                                {(developer.projects_completed || developer.projects_under_construction || developer.upcoming_projects) ? (
                                <div className="flex-shrink-0 w-full lg:w-[380px] space-y-4 sm:space-y-6">
                                    {developer.projects_completed > 0 && (
                                    <div className="rounded-xl p-5 flex items-center gap-4" style={{ backgroundColor: '#EBECF5' }}>
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.5">
                                                <path d="M3 21h18M3 7v1a3 3 0 003 3h12a3 3 0 003-3V7M6 21V11M18 21V11M12 21V11M3 7l9-4 9 4M12 3v4" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-work-sans font-semibold text-[#64748B] text-sm uppercase tracking-wide">
                                                TOTAL PROJECTS COMPLETED
                                            </p>
                                        </div>
                                        <span className="font-work-sans font-bold text-[#912018] text-xl">
                                            {Number(developer.projects_completed).toLocaleString()}
                                        </span>
                                    </div>
                                    )}

                                    {developer.projects_under_construction > 0 && (
                                    <div className="rounded-xl p-5 flex items-center gap-4" style={{ backgroundColor: '#EBECF5' }}>
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.5">
                                                <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-work-sans font-semibold text-[#64748B] text-sm uppercase tracking-wide">
                                                PROJECTS UNDER CONSTRUCTION
                                            </p>
                                        </div>
                                        <span className="font-work-sans font-bold text-[#912018] text-xl">
                                            {Number(developer.projects_under_construction).toLocaleString()}
                                        </span>
                                    </div>
                                    )}

                                    {developer.upcoming_projects > 0 && (
                                    <div className="rounded-xl p-5 flex items-center gap-4" style={{ backgroundColor: '#EBECF5' }}>
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.5">
                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                                <line x1="16" y1="2" x2="16" y2="6"/>
                                                <line x1="8" y1="2" x2="8" y2="6"/>
                                                <line x1="3" y1="10" x2="21" y2="10"/>
                                                <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" strokeLinecap="round"/>
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-work-sans font-semibold text-[#64748B] text-sm uppercase tracking-wide">
                                                UPCOMING PROJECTS
                                            </p>
                                        </div>
                                        <span className="font-work-sans font-bold text-[#912018] text-xl">
                                            {Number(developer.upcoming_projects).toLocaleString()}
                                        </span>
                                    </div>
                                    )}
                                </div>
                                ) : null}
                            </div>

                            {/* View All Button */}
                            <div className="mt-8 sm:mt-10">
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('developer-buildings')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                    className="inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-[#101323] text-white font-work-sans font-semibold text-sm sm:text-base rounded-full hover:bg-[#101323]/90 transition-colors"
                                >
                                    View all the projects for sale
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Agent Info & Tour Scheduling Section */}
                <section className="bg-[#292E56] py-8 lg:py-0 lg:h-[314px]">
                    <div className="max-w-[1280px] mx-auto px-4 h-full flex items-center">
                        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full">
                            {/* Agent Info Card - Left Side */}
                            <div className="bg-white rounded-2xl p-4 sm:p-6 flex-1 lg:flex-none lg:w-[602px]">
                                <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                                    {/* Agent Photo */}
                                    <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full overflow-hidden border-4 border-gray-200 flex-shrink-0">
                                        {website?.agent_info?.profile_image || website?.contact_info?.agent?.image ? (
                                            <img
                                                src={website?.agent_info?.profile_image || website?.contact_info?.agent?.image}
                                                alt={website?.agent_info?.agent_name || website?.contact_info?.agent?.name || "Agent"}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                                <span className="text-xl sm:text-2xl font-bold text-gray-500">
                                                    {(website?.agent_info?.agent_name || website?.contact_info?.agent?.name || 'A').charAt(0)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Agent Details */}
                                    <div className="flex-1 text-center sm:text-left">
                                        <h3 className="font-work-sans font-bold text-[#101323] text-lg sm:text-xl uppercase tracking-wide">
                                            {website?.agent_info?.agent_name || website?.contact_info?.agent?.name || 'JATIN GILL'}
                                        </h3>
                                        <p className="font-work-sans text-[#912018] font-semibold text-xs sm:text-sm mt-1">
                                            {website?.agent_info?.agent_title || website?.contact_info?.agent?.title || 'Sales Representative'}
                                        </p>
                                        <p className="font-work-sans text-[#101323]/80 text-xs sm:text-sm mt-1">
                                            {website?.agent_info?.brokerage || website?.contact_info?.agent?.brokerage || 'Property.ca Inc, Brokerage'}
                                        </p>
                                        {(() => {
                                            const phone = website?.agent_info?.agent_phone || website?.contact_info?.agent?.phone || '647-490-1532';
                                            const telHref = `tel:${String(phone).replace(/[^+\d]/g, '')}`;
                                            return (
                                                <a
                                                    href={telHref}
                                                    className="inline-block font-work-sans text-[#101323] font-bold text-xs sm:text-sm mt-2 hover:text-[#292E56] hover:underline"
                                                >
                                                    {phone}
                                                </a>
                                            );
                                        })()}
                                    </div>

                                    {/* Contact Button */}
                                    <button className="w-full sm:w-auto py-2 sm:py-3 px-4 sm:px-6 bg-[#292E56] text-white font-work-sans font-semibold text-sm sm:text-base rounded-full hover:bg-[#292E56]/90 transition-colors">
                                        Contact the team
                                    </button>
                                </div>
                            </div>

                            {/* Tour Scheduling Card - Right Side */}
                            <div className="bg-white rounded-2xl p-4 sm:p-6 flex-1 lg:flex-none lg:w-[602px]">
                                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-center w-full lg:justify-between">
                                    {/* Left Side - Dates & Times */}
                                    <div className="flex flex-col gap-3 w-full lg:w-auto">
                                        {/* Date Selection Row */}
                                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                                            {/* Prev Button */}
                                            <button
                                                onClick={goToPrevDate}
                                                disabled={currentDateIndex === 0}
                                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="15,18 9,12 15,6"></polyline>
                                                </svg>
                                            </button>

                                            {/* Date Slots */}
                                            <div className="flex gap-1 sm:gap-2">
                                                {currentDates.map((dateItem, index) => (
                                                    <div
                                                        key={index}
                                                        onClick={() => setSelectedDateSlot(index)}
                                                        className={`rounded-lg text-center cursor-pointer border-2 transition-all flex flex-col justify-center w-[60px] h-[70px] sm:w-[77px] sm:h-[91px] ${
                                                            selectedDateSlot === index
                                                                ? 'bg-white border-[#292E56]'
                                                                : 'bg-white border-gray-200 hover:border-gray-300'
                                                        }`}
                                                    >
                                                        <p className="uppercase text-[10px] sm:text-xs text-gray-500 font-medium">{dateItem?.day}</p>
                                                        <p className="text-xl sm:text-2xl font-bold my-0.5 sm:my-1">{dateItem?.dayNum}</p>
                                                        <p className="uppercase text-[10px] sm:text-xs text-gray-500">{dateItem?.month}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Next Button */}
                                            <button
                                                onClick={goToNextDate}
                                                disabled={currentDateIndex >= dates.length - 3}
                                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="9,18 15,12 9,6"></polyline>
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Time Slots Row */}
                                        <div className="flex gap-1 sm:gap-2 justify-center">
                                            {[
                                                { key: 'morning', label: 'Morning', range: '9AM TO 12PM' },
                                                { key: 'afternoon', label: 'Afternoon', range: '12PM TO 4PM' },
                                                { key: 'evening', label: 'Evening', range: '4PM TO 8PM' }
                                            ].map((timeSlot) => (
                                                <div
                                                    key={timeSlot.key}
                                                    onClick={() => setSelectedTime(timeSlot.key)}
                                                    className={`rounded-lg cursor-pointer border-2 text-center flex flex-col justify-center w-[70px] h-[50px] sm:w-[91px] sm:h-[59px] ${
                                                        selectedTime === timeSlot.key
                                                            ? 'bg-white border-[#292E56]'
                                                            : 'bg-white border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <p className="text-xs sm:text-sm font-semibold">{timeSlot.label}</p>
                                                    <p className="text-[8px] sm:text-[10px] text-gray-500 uppercase">{timeSlot.range}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right Side - Schedule Info & Buttons */}
                                    <div className="flex flex-col gap-3 w-full lg:w-[223px]">
                                        <div className="text-center lg:text-left">
                                            <h3 className="font-space-grotesk font-bold text-[#293056] text-lg sm:text-xl">Schedule a tour</h3>
                                            <p className="text-gray-500 text-xs sm:text-sm">Tour with a buyer's agent</p>
                                        </div>

                                        <button
                                            onClick={() => setIsModalOpen(true)}
                                            className="w-full bg-[#292E56] text-white font-work-sans font-medium text-sm sm:text-base rounded-lg hover:bg-[#292E56]/90 transition-colors h-[40px] sm:h-[44px]"
                                        >
                                            Request A Tour
                                        </button>

                                        <button
                                            onClick={() => setIsQuestionModalOpen(true)}
                                            className="w-full bg-white text-gray-700 font-work-sans font-medium text-sm sm:text-base rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors h-[40px] sm:h-[44px]"
                                        >
                                            Ask A Question
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Buildings by Developer Section */}
                {buildings.length > 0 && (
                    <section id="developer-buildings" className="py-8 sm:py-12 bg-white scroll-mt-24">
                        {/* px-4 md:px-0 matches the FAQ / RealEstateLinksSection containers
                            so this heading shares the same left edge as the sections below */}
                        <div className="max-w-[1280px] mx-auto px-4 md:px-0">
                            {/* Section Header */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-2">
                                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                                    <h2 className="font-space-grotesk font-bold text-[22px] sm:text-[28px] md:text-[32px] leading-tight tracking-[-0.03em] text-[#293056]">
                                        Buildings by {developer.name}
                                    </h2>
                                    <span className="inline-flex items-center justify-center px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-bold rounded-full bg-[#293056] text-white">
                                        {buildings.length}
                                    </span>
                                </div>
                            </div>

                            {/* Buildings Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {buildings.map((building) => {
                                    // main_image / images[] hold either full http(s) URLs or
                                    // root-relative paths (the Building model strips local hosts),
                                    // so use them as-is — same as Search.jsx and BuildingCard.jsx.
                                    // Only bare storage paths (no leading slash) need /storage/.
                                    const resolveImage = (img) =>
                                        img && typeof img === 'string'
                                            ? (img.startsWith('http') || img.startsWith('/') ? img : `/storage/${img}`)
                                            : null;
                                    const buildingImage = resolveImage(building.main_image)
                                        || resolveImage(building.images?.[0])
                                        || '/images/no-image-placeholder.jpg';

                                    return (
                                        <div
                                            key={building.id}
                                            className="flex flex-col w-full min-h-[380px] bg-white border-gray-300 border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl group relative"
                                            onClick={() => handleBuildingClick(building)}
                                        >
                                            {/* Building Image */}
                                            <div className="relative w-full h-[200px] overflow-hidden bg-gray-100 rounded-t-xl">
                                                <div className="relative overflow-hidden w-full h-full transition-transform duration-300 group-hover:scale-105">
                                                    <img
                                                        src={buildingImage}
                                                        alt={building.name}
                                                        className="w-full h-full object-cover transition-all duration-700 ease-out"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = '/images/no-image-placeholder.jpg';
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Building Info */}
                                            <div className="flex flex-col flex-grow items-start p-4 gap-2.5 box-border">
                                                {/* Building Name */}
                                                <div className="flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-bold text-lg leading-7 tracking-tight text-[#293056]">
                                                    {building.name}
                                                </div>

                                                <div className="flex flex-col items-start gap-2 w-full">
                                                    {/* Address */}
                                                    <div className="flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-base leading-6 tracking-tight text-[#293056] line-clamp-2">
                                                        {building.address || building.street_address || 'Address not available'}
                                                    </div>

                                                    {/* Developer — clickable link to the developer page */}
                                                    <div className="flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-sm leading-6 tracking-tight text-gray-600">
                                                        <span className="text-gray-500">By</span>&nbsp;
                                                        <a
                                                            href={`/developer/${developer?.slug || developer?.id}`}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="text-[#293056] font-medium truncate hover:underline"
                                                        >
                                                            {developer?.name || 'Developer'}
                                                        </a>
                                                    </div>

                                                    {/* Units | Floors | Year Built — last row, so no bottom border
                                                        (separators only appear BETWEEN rows) */}
                                                    <div className="flex items-center justify-start w-full min-h-8 font-work-sans font-normal text-sm leading-6 tracking-tight text-[#293056]">
                                                        {building.total_units && `${building.total_units} Units`}
                                                        {building.total_units && building.floors && ' | '}
                                                        {building.floors && `${building.floors} Floors`}
                                                        {(building.total_units || building.floors) && building.year_built && ' | '}
                                                        {building.year_built && `Built ${building.year_built}`}
                                                        {!building.total_units && !building.floors && !building.year_built && 'Details coming soon'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}

                {/* Expertise Highlights & Awards Section (admin-managed; each column hides when empty) */}
                {((developer.highlights && developer.highlights.length > 0) || (developer.awards && developer.awards.length > 0)) && (
                <section className="py-10 sm:py-16 bg-white">
                    <div className="max-w-[1280px] mx-auto px-4 md:px-0">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                            {/* Expertise Highlights */}
                            {developer.highlights && developer.highlights.length > 0 && (
                            <div>
                                <h2 className="font-space-grotesk font-bold text-[#293056] text-xl sm:text-2xl uppercase tracking-wide mb-6 sm:mb-8">
                                    EXPERTISE HIGHLIGHTS
                                </h2>
                                <ul className="space-y-6">
                                    {developer.highlights.map((item, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <span className="w-2 h-2 bg-[#293056] rounded-full mt-2 flex-shrink-0"></span>
                                            <p className="font-work-sans text-[#293056]">
                                                {item.title && <span className="font-bold">{item.title}: </span>}
                                                {item.text}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            )}

                            {/* Awards & Recognitions */}
                            {developer.awards && developer.awards.length > 0 && (
                            <div>
                                <h2 className="font-space-grotesk font-bold text-[#293056] text-xl sm:text-2xl uppercase tracking-wide mb-6 sm:mb-8">
                                    AWARDS & RECOGNITIONS
                                </h2>
                                <ul className="space-y-6">
                                    {developer.awards.map((item, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <span className="w-2 h-2 bg-[#293056] rounded-full mt-2 flex-shrink-0"></span>
                                            <p className="font-work-sans text-[#293056]">
                                                {item.title && <span className="font-bold">{item.title}: </span>}
                                                {item.text}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            )}
                        </div>
                    </div>
                </section>
                )}

                {/* Listings by Developer Section */}
                {listings.length > 0 && (
                    <section className="py-8 sm:py-12 bg-white">
                        <div className="max-w-[1280px] mx-auto px-4 md:px-0">
                            {/* Section Header */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-2">
                                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                                    <h2 className="font-space-grotesk font-bold text-[22px] sm:text-[28px] md:text-[32px] leading-tight tracking-[-0.03em] text-[#293056]">
                                        Listings by {developer.name}
                                    </h2>
                                    <span className="inline-flex items-center justify-center px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-bold rounded-full bg-[#293056] text-white">
                                        {listings.length}
                                    </span>
                                </div>
                            </div>

                            {/* Listings Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {listings.map((listing) => {
                                    const formattedListing = {
                                        id: listing.id,
                                        listingKey: listing.ListingKey || listing.id,
                                        propertyType: listing.PropertyType || 'Residential',
                                        address: listing.UnparsedAddress || `${listing.StreetNumber} ${listing.StreetName}`,
                                        name: listing.UnparsedAddress || `${listing.StreetNumber} ${listing.StreetName}`,
                                        city: listing.City,
                                        province: listing.StateOrProvince,
                                        imageUrl: listing.MediaURL || listing.images?.[0] || '/images/no-image-placeholder.jpg',
                                        price: listing.ListPrice || listing.price || 0,
                                        bedrooms: listing.BedroomsTotal || listing.bedrooms,
                                        bathrooms: listing.BathroomsTotalInteger || listing.bathrooms,
                                        isRental: listing.TransactionType === 'For Rent',
                                        transactionType: listing.TransactionType || 'For Sale',
                                        source: 'mls',
                                        UnitNumber: listing.UnitNumber,
                                        StreetNumber: listing.StreetNumber,
                                        StreetName: listing.StreetName,
                                        City: listing.City,
                                        StateOrProvince: listing.StateOrProvince
                                    };

                                    return (
                                        <PropertyCardV5
                                            key={listing.id || listing.ListingKey}
                                            property={formattedListing}
                                            size="default"
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}

                {/* Tour Request Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[999999] flex items-center justify-center">
                        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsModalOpen(false)} />
                        <div className="relative bg-white p-6 rounded-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold" style={{ color: '#293056' }}>Request a Tour</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 text-2xl font-bold">×</button>
                            </div>
                            <p className="text-gray-500 mb-4">You've selected: <span className="font-medium">{getSelectedDateTime()}</span></p>
                            <form onSubmit={handleTourSubmit} noValidate>
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-1 font-medium">Full Name</label>
                                    <input type="text" id="devTourName" name="name" value={formData.name} onChange={handleInputChange} className={inputClass(formErrors.name)} aria-invalid={!!formErrors.name} />
                                    <FieldError message={formErrors.name} />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-1 font-medium">Email Address</label>
                                    <input type="email" id="devTourEmail" name="email" value={formData.email} onChange={handleInputChange} className={inputClass(formErrors.email)} aria-invalid={!!formErrors.email} />
                                    <FieldError message={formErrors.email} />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-1 font-medium">Phone Number</label>
                                    <PhoneInput id="devTourPhone" name="phone" value={formData.phone} onChange={handleInputChange} className={inputClass(formErrors.phone)} aria-invalid={!!formErrors.phone} />
                                    <FieldError message={formErrors.phone} />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-1 font-medium">Additional Notes (Optional)</label>
                                    <textarea name="message" value={formData.message} onChange={handleInputChange} className="w-full py-2 px-3 border border-gray-300 rounded-lg min-h-[80px]" />
                                </div>
                                {formServerError && (
                                    <p className="text-red-600 text-sm mb-3" role="alert">{formServerError}</p>
                                )}
                                <button type="submit" disabled={isSubmitting} className="w-full py-3 px-4 rounded-lg font-medium bg-[#292E56] text-white hover:opacity-90 disabled:opacity-50">
                                    {isSubmitting ? 'Submitting...' : 'Confirm Tour Request'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Question Modal */}
                {isQuestionModalOpen && (
                    <div className="fixed inset-0 z-[999999] flex items-center justify-center">
                        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsQuestionModalOpen(false)} />
                        <div className="relative bg-white p-6 rounded-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold" style={{ color: '#293056' }}>Ask A Question</h3>
                                <button onClick={() => setIsQuestionModalOpen(false)} className="text-gray-500 text-2xl font-bold">×</button>
                            </div>
                            <form onSubmit={handleQuestionSubmit} noValidate>
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-1 font-medium">Full Name</label>
                                    <input type="text" id="devQuestionName" name="name" value={questionFormData.name} onChange={handleQuestionInputChange} className={inputClass(questionErrors.name)} aria-invalid={!!questionErrors.name} />
                                    <FieldError message={questionErrors.name} />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-1 font-medium">Email Address</label>
                                    <input type="email" id="devQuestionEmail" name="email" value={questionFormData.email} onChange={handleQuestionInputChange} className={inputClass(questionErrors.email)} aria-invalid={!!questionErrors.email} />
                                    <FieldError message={questionErrors.email} />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-1 font-medium">Phone Number</label>
                                    <PhoneInput id="devQuestionPhone" name="phone" value={questionFormData.phone} onChange={handleQuestionInputChange} className={inputClass(questionErrors.phone)} aria-invalid={!!questionErrors.phone} />
                                    <FieldError message={questionErrors.phone} />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-1 font-medium">Your Question</label>
                                    <textarea id="devQuestion" name="question" value={questionFormData.question} onChange={handleQuestionInputChange} className={`${inputClass(questionErrors.question)} min-h-[100px]`} aria-invalid={!!questionErrors.question} />
                                    <FieldError message={questionErrors.question} />
                                </div>
                                {questionServerError && (
                                    <p className="text-red-600 text-sm mb-3" role="alert">{questionServerError}</p>
                                )}
                                <button type="submit" disabled={isSubmitting} className="w-full py-3 px-4 rounded-lg font-medium bg-[#292E56] text-white hover:opacity-90 disabled:opacity-50">
                                    {isSubmitting ? 'Submitting...' : 'Send Question'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Success Notification */}
                {showSuccess && (
                    <div className="fixed top-4 right-4 z-[1000000] animate-slide-in-right">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start shadow-lg max-w-sm">
                            <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-green-800">
                                    {successType === 'question' ? 'Question Submitted!' : 'Tour Request Submitted!'}
                                </h3>
                                <p className="text-sm text-green-700 mt-1">
                                    {successType === 'question' ? "We'll get back to you within 24 hours." : "We'll contact you shortly to confirm your tour."}
                                </p>
                            </div>
                            <button onClick={() => setShowSuccess(false)} className="ml-3 text-green-400 hover:text-green-600">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Description now renders in the Developer Info section above */}

                {/* FAQ Section */}
                <div className="faq-section">
                    <FAQ faqItems={faqs} />
                </div>

                {/* Real Estate Links Section */}
                <RealEstateLinksSection />
            </MainLayout>
        );
    }

    // Developers listing page (when no specific developer is selected)
    return (
        <MainLayout auth={auth} website={website} blueHeader={true}>
            <Head title="Top Condo Developers in Toronto" />

            {/* Hero Section - Full Screen Height */}
            <section
                className="relative bg-cover bg-center bg-no-repeat flex items-center justify-center min-h-[70vh] sm:min-h-screen py-20 sm:py-0"
                style={{
                    backgroundImage: 'url(/images/developers-hero.webp)'
                }}
            >
                {/* Blurred Band */}
                <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[calc(100%-32px)] max-w-[1280px] h-auto min-h-[200px] sm:h-[296px] backdrop-blur-xl bg-white/30 rounded-2xl py-8 sm:py-0"></div>

                {/* Content Container */}
                <div className="relative z-10 w-full max-w-[1280px] mx-auto px-4 flex flex-col items-center justify-center">
                    {/* Main Title */}
                    <h1
                        className="font-space-grotesk font-bold text-center mb-6 sm:mb-10 text-[28px] sm:text-[40px] md:text-[55px] lg:text-[65px]"
                        style={{
                            lineHeight: '1.1',
                            letterSpacing: '-0.03em',
                            color: '#101323'
                        }}
                    >
                        Top {allDevelopers.length} Condo Developers in Toronto
                    </h1>

                    {/* Search Box with Live Results */}
                    <div className="w-full max-w-[580px] relative px-4 sm:px-0">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                placeholder="Search by developer..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-12 sm:h-14 px-4 sm:px-5 pr-14 sm:pr-16 rounded-lg bg-white border-0 text-[#101323] placeholder-[#101323]/50 focus:outline-none focus:ring-2 focus:ring-[#101323]/20 font-work-sans text-sm sm:text-base shadow-sm"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#101323] text-white flex items-center justify-center">
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <path d="m21 21-4.35-4.35"></path>
                                </svg>
                            </div>
                        </div>

                        {/* Live Search Results Dropdown */}
                        {searchQuery.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[320px] overflow-y-auto z-50">
                                {filteredDevelopers.length > 0 ? (
                                    filteredDevelopers.slice(0, 6).map((dev) => (
                                        <Link
                                            key={dev.id}
                                            href={`/developer/${dev.slug || dev.id}`}
                                            className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                                        >
                                            {/* Developer Logo */}
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                {dev.logo ? (
                                                    <img
                                                        src={dev.logo.startsWith('/') ? dev.logo : `/storage/${dev.logo}`}
                                                        alt={dev.name}
                                                        className="max-w-[40px] max-h-[40px] object-contain"
                                                    />
                                                ) : (
                                                    <span className="text-lg font-bold text-[#293056]">
                                                        {dev.name.charAt(0)}
                                                    </span>
                                                )}
                                            </div>
                                            {/* Developer Info */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-work-sans font-semibold text-[#101323] truncate">
                                                    {dev.name}
                                                </h4>
                                                <p className="text-sm text-gray-500">
                                                    {dev.buildings_count || 0} buildings
                                                </p>
                                            </div>
                                            {/* Arrow */}
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="px-4 py-6 text-center">
                                        <p className="text-gray-500 font-work-sans">No developers found</p>
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="mt-2 text-[#293056] hover:text-[#293056]/80 font-medium text-sm"
                                        >
                                            Clear search
                                        </button>
                                    </div>
                                )}
                                {filteredDevelopers.length > 6 && (
                                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                                        <p className="text-sm text-gray-600 text-center">
                                            Showing 6 of {filteredDevelopers.length} results. Scroll down to see all.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* All Developers Grid */}
            {allDevelopers.length > 0 && (
                <section className="py-8 sm:py-12 bg-white">
                    <div className="max-w-[1280px] mx-auto px-4">
                        {/* Section Header */}
                        <h2 className="font-space-grotesk font-bold text-[22px] sm:text-[28px] md:text-[32px] leading-tight tracking-[-0.03em] text-[#293056] mb-6 sm:mb-8">
                            Condo Developers in Toronto
                        </h2>

                        {/* Developers Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {filteredDevelopers.map((dev) => (
                                <Link
                                    key={dev.id}
                                    href={`/developer/${dev.slug || dev.id}`}
                                    className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all w-full"
                                >
                                    {/* Developer Logo Section */}
                                    <div
                                        className="w-full bg-gray-50 flex items-center justify-center h-[200px] sm:h-[250px] lg:h-[275px]"
                                    >
                                        {dev.logo ? (
                                            <img
                                                src={dev.logo.startsWith('/') ? dev.logo : `/storage/${dev.logo}`}
                                                alt={dev.name}
                                                className="max-w-[150px] sm:max-w-[200px] max-h-[80px] sm:max-h-[120px] object-contain"
                                            />
                                        ) : (
                                            <span className="text-3xl sm:text-5xl font-bold text-[#101323] px-4 text-center">
                                                {dev.name}
                                            </span>
                                        )}
                                    </div>

                                    {/* Developer Info Section */}
                                    <div className="px-4 py-3">
                                        {/* Developer Name */}
                                        <h3
                                            className="font-work-sans font-bold text-[#101323] group-hover:text-blue-600 transition-colors text-base sm:text-lg"
                                            style={{
                                                lineHeight: '27px',
                                                letterSpacing: '-0.03em'
                                            }}
                                        >
                                            {dev.name}
                                        </h3>

                                        {/* Divider */}
                                        <div className="border-t border-gray-200 my-2"></div>

                                        {/* Buildings Count */}
                                        <p
                                            className="font-work-sans font-normal text-[#101323]/70 text-sm sm:text-base"
                                            style={{
                                                lineHeight: '25px',
                                                letterSpacing: '-0.03em'
                                            }}
                                        >
                                            {dev.buildings_count || 0} buildings
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Empty State */}
                        {filteredDevelopers.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-600 text-lg">
                                    No developers found matching "{searchQuery}".
                                </p>
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Clear search
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* FAQ Section */}
            <div className="faq-section">
                <FAQ faqItems={faqs} />
            </div>

            {/* Real Estate Links Section */}
            <RealEstateLinksSection />
        </MainLayout>
    );
}
