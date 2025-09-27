import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Dashboard({ auth }) {
    const [savedSearches, setSavedSearches] = useState([]);
    const [isLoadingSearches, setIsLoadingSearches] = useState(true);

    useEffect(() => {
        // Fetch saved searches
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

            console.log('Saved searches API response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Saved searches data:', data);
                setSavedSearches(data.data || []);
            } else {
                console.error('Failed to fetch saved searches:', response.status, response.statusText);
                const errorText = await response.text();
                console.error('Error response:', errorText);
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
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Welcome Section */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome back, {auth?.user?.name}!</h3>
                                <p className="text-gray-600">Manage your saved searches and property interests from your dashboard.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <Link
                                    href="/search"
                                    className="block p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                                >
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <div className="ml-4">
                                            <h4 className="text-lg font-semibold">Search Properties</h4>
                                            <p className="text-blue-100">Find your dream property</p>
                                        </div>
                                    </div>
                                </Link>

                                <Link
                                    href="/user/favourites"
                                    className="block p-6 bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg text-white hover:from-green-600 hover:to-green-700 transition-all duration-200"
                                >
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        </div>
                                        <div className="ml-4">
                                            <h4 className="text-lg font-semibold">My Favourites</h4>
                                            <p className="text-green-100">View saved properties</p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Saved Searches Section */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Saved Searches</h3>
                                <Link
                                    href="/search"
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    + New Search
                                </Link>
                            </div>

                            {isLoadingSearches ? (
                                <div className="text-center py-8">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                    <p className="mt-2 text-gray-500">Loading saved searches...</p>
                                </div>
                            ) : savedSearches.length === 0 ? (
                                <div className="text-center py-8">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No saved searches</h3>
                                    <p className="mt-1 text-sm text-gray-500">Get started by saving your first property search.</p>
                                    <div className="mt-6">
                                        <Link
                                            href="/search"
                                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            <svg className="mr-2 -ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            Search Properties
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {savedSearches.map((search) => (
                                        <div key={search.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900">{search.name}</h4>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {search.formatted_criteria || 'All Properties'}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <span className="text-xs text-gray-400">
                                                            Saved {new Date(search.created_at).toLocaleDateString()}
                                                        </span>
                                                        {search.email_alerts && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                                Email Alerts On
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 ml-4">
                                                    <button
                                                        onClick={() => handleRunSearch(search.id)}
                                                        className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteSearch(search.id)}
                                                        className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                                    >
                                                        Delete
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
                        <div className="mt-6 overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <Link
                                    href={route('admin.dashboard')}
                                    className="block p-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-200"
                                >
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div className="ml-4">
                                            <h4 className="text-lg font-semibold">Admin Dashboard</h4>
                                            <p className="text-purple-100">Manage your real estate websites and properties</p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}