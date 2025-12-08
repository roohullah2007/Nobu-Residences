import MainLayout from '@/Website/Global/MainLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Heart } from '@/Website/Components/Icons';

export default function Dashboard({ auth, website }) {
    const [savedSearches, setSavedSearches] = useState([]);
    const [isLoadingSearches, setIsLoadingSearches] = useState(true);

    const brandColors = website?.brand_colors || {
        primary: '#912018',
        secondary: '#293056'
    };

    useEffect(() => {
        fetchSavedSearches();
    }, []);

    const fetchSavedSearches = async () => {
        try {
            const response = await fetch('/api/saved-searches', {
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSavedSearches(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching saved searches:', error);
        } finally {
            setIsLoadingSearches(false);
        }
    };

    const handleDeleteSearch = async (id) => {
        if (!confirm('Are you sure you want to delete this saved search?')) {
            return;
        }

        try {
            const response = await fetch(`/api/saved-searches/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                }
            });

            if (response.ok) {
                setSavedSearches(savedSearches.filter(search => search.id !== id));
            }
        } catch (error) {
            console.error('Error deleting saved search:', error);
        }
    };

    const handleRunSearch = (id) => {
        window.location.href = `/saved-searches/${id}/run`;
    };

    return (
        <MainLayout auth={auth} website={website} blueHeader={true}>
            <Head title="Dashboard" />

            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

                    {/* User Profile Header */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                {auth?.user?.avatar ? (
                                    <img
                                        src={auth.user.avatar}
                                        alt={auth.user.name}
                                        className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover shadow-lg ring-4 ring-white"
                                    />
                                ) : (
                                    <div
                                        className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white"
                                        style={{ backgroundColor: brandColors.primary }}
                                    >
                                        <span className="text-3xl md:text-4xl font-bold text-white font-space-grotesk">
                                            {auth?.user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* User Info */}
                            <div className="flex-1">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-space-grotesk mb-2">
                                    Welcome back, {auth?.user?.name}!
                                </h1>
                                <p className="text-gray-600 font-work-sans text-base md:text-lg">
                                    Manage your saved searches, favourites, and property interests from your personal dashboard.
                                </p>
                            </div>

                            {/* Profile Settings Link */}
                            <div className="flex-shrink-0">
                                <Link
                                    href="/profile"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all font-work-sans font-medium"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Profile Settings
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
                        {/* My Favourites Card */}
                        <Link
                            href="/user/favourites"
                            className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-transparent transition-all duration-300"
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center bg-red-50 group-hover:scale-110 transition-transform duration-300"
                                >
                                    <Heart className="w-7 h-7 text-red-500" filled={true} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 font-space-grotesk mb-1 group-hover:text-red-600 transition-colors">
                                        My Favourites
                                    </h3>
                                    <p className="text-gray-500 font-work-sans text-sm">
                                        View all your saved and liked properties
                                    </p>
                                </div>
                                <svg className="w-5 h-5 text-gray-300 group-hover:text-gray-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>

                        {/* My Alerts Card */}
                        <Link
                            href="/user/alerts"
                            className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-transparent transition-all duration-300"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center bg-blue-50 group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 font-space-grotesk mb-1 group-hover:text-blue-600 transition-colors">
                                        My Alerts
                                    </h3>
                                    <p className="text-gray-500 font-work-sans text-sm">
                                        View your email notifications
                                    </p>
                                </div>
                                <svg className="w-5 h-5 text-gray-300 group-hover:text-gray-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>

                        {/* Browse For Sale Card */}
                        <Link
                            href="/toronto/for-sale"
                            className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-transparent transition-all duration-300"
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: `${brandColors.secondary}15` }}
                                >
                                    <svg
                                        className="w-7 h-7"
                                        fill="none"
                                        stroke={brandColors.secondary}
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 font-space-grotesk mb-1 group-hover:text-[#293056] transition-colors">
                                        Browse For Sale
                                    </h3>
                                    <p className="text-gray-500 font-work-sans text-sm">
                                        Explore condos and properties for sale
                                    </p>
                                </div>
                                <svg className="w-5 h-5 text-gray-300 group-hover:text-gray-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>
                    </div>

                    {/* Saved Searches Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 font-space-grotesk">Saved Searches</h2>
                                <p className="text-gray-500 font-work-sans text-sm mt-1">
                                    Get notified when new properties match your criteria
                                </p>
                            </div>
                            <Link
                                href="/search"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-work-sans font-medium hover:opacity-90 transition-opacity"
                                style={{ backgroundColor: brandColors.primary }}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                New Search
                            </Link>
                        </div>

                        <div className="p-6">
                            {isLoadingSearches ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="w-10 h-10 border-3 border-gray-200 border-t-[#912018] rounded-full animate-spin"></div>
                                    <p className="mt-4 text-gray-500 font-work-sans">Loading saved searches...</p>
                                </div>
                            ) : savedSearches.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 font-space-grotesk mb-2">No saved searches yet</h3>
                                    <p className="text-gray-500 font-work-sans text-center max-w-sm mb-6">
                                        Save your search criteria to get notified when new properties match your preferences.
                                    </p>
                                    <Link
                                        href="/search"
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-work-sans font-medium hover:opacity-90 transition-opacity"
                                        style={{ backgroundColor: brandColors.primary }}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        Start Searching
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {savedSearches.map((search) => (
                                        <div
                                            key={search.id}
                                            className="group bg-gray-50 hover:bg-white border border-gray-100 hover:border-gray-200 rounded-xl p-5 transition-all duration-200 hover:shadow-sm"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h4 className="font-semibold text-gray-900 font-space-grotesk truncate">
                                                            {search.name}
                                                        </h4>
                                                        {search.email_alerts && (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                                                </svg>
                                                                Alerts On
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500 font-work-sans mb-2 line-clamp-1">
                                                        {search.formatted_criteria || 'All Properties'}
                                                    </p>
                                                    <span className="text-xs text-gray-400 font-work-sans">
                                                        Saved {new Date(search.created_at).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <button
                                                        onClick={() => handleRunSearch(search.id)}
                                                        className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-medium rounded-lg transition-all font-work-sans text-white hover:opacity-90"
                                                        style={{ backgroundColor: brandColors.primary }}
                                                    >
                                                        View Results
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteSearch(search.id)}
                                                        className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Delete search"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Admin Link (if user is admin) */}
                    {auth?.user?.role === 'admin' && (
                        <div className="mt-8">
                            <Link
                                href={route('admin.dashboard')}
                                className="group block bg-gradient-to-r from-[#293056] to-[#3d4a7a] rounded-2xl shadow-sm border border-transparent p-6 hover:shadow-lg transition-all duration-300"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex-shrink-0 w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-white font-space-grotesk mb-1">
                                            Admin Dashboard
                                        </h3>
                                        <p className="text-white/70 font-work-sans text-sm">
                                            Manage your real estate websites and properties
                                        </p>
                                    </div>
                                    <svg className="w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
