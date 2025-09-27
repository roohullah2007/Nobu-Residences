import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState } from 'react';

export default function Index({ auth }) {
    const { websites, title } = usePage().props;
    const [openDropdownId, setOpenDropdownId] = useState(null);

    const toggleDropdown = (websiteId) => {
        setOpenDropdownId(openDropdownId === websiteId ? null : websiteId);
    };

    const handleDelete = (website) => {
        if (confirm(`Are you sure you want to delete "${website.name}"? This action cannot be undone.`)) {
            // Handle delete logic here
            console.log('Delete website:', website.id);
        }
    };

    const getWebsiteUrl = (website) => {
        if (website.is_default) {
            return 'http://127.0.0.1:8000';
        }
        if (website.domain) {
            return `https://${website.domain}`;
        }
        return `http://127.0.0.1:8000/${website.slug}`;
    };

    return (
        <AdminLayout title={title}>
            <Head title={title} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Website Management</h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Manage and configure your real estate websites
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('admin.websites.create')}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Add Website
                        </Link>
                    </div>
                </div>

                {/* Websites Table */}
                <div className="bg-white shadow rounded-lg border border-gray-200">
                    <div className="overflow-visible">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Website
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Domain
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Pages
                                    </th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {websites && websites.length > 0 ? (
                                    websites.map((website) => (
                                        <tr key={website.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8">
                                                        <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                                            <div className="h-4 w-4 rounded bg-indigo-600"></div>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {website.name}
                                                            {website.is_default && (
                                                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                    Default
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {website.slug}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    website.is_active 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {website.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {website.domain || 'Default Domain'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {website.pages ? website.pages.length : 0} pages
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="relative inline-block text-left">
                                                    <button
                                                        onClick={() => toggleDropdown(website.id)}
                                                        className="inline-flex items-center p-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                        aria-expanded="true"
                                                        aria-haspopup="true"
                                                    >
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                        </svg>
                                                    </button>

                                                    {openDropdownId === website.id && (
                                                        <>
                                                            {/* Overlay to close dropdown when clicking outside */}
                                                            <div 
                                                                className="fixed inset-0 z-40" 
                                                                onClick={() => setOpenDropdownId(null)}
                                                            ></div>
                                                            
                                                            {/* Dropdown menu */}
                                                            <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                                <div className="py-1">
                                                                    {/* View Website */}
                                                                    <a
                                                                        href={getWebsiteUrl(website)}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                    >
                                                                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                        </svg>
                                                                        View Website
                                                                    </a>

                                                                    {/* View Info */}
                                                                    <Link
                                                                        href={route('admin.websites.show', website.id)}
                                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                        onClick={() => setOpenDropdownId(null)}
                                                                    >
                                                                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                        View Info
                                                                    </Link>

                                                                    {/* Edit Info */}
                                                                    <Link
                                                                        href={route('admin.websites.edit', website.id)}
                                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                        onClick={() => setOpenDropdownId(null)}
                                                                    >
                                                                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                        </svg>
                                                                        Edit Info
                                                                    </Link>

                                                                    {/* Pages */}
                                                                    <Link
                                                                        href={route('admin.websites.pages', website.id)}
                                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                        onClick={() => setOpenDropdownId(null)}
                                                                    >
                                                                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                        </svg>
                                                                        Pages
                                                                    </Link>

                                                                    {/* Delete - Only show for non-default websites */}
                                                                    {!website.is_default && (
                                                                        <>
                                                                            <div className="border-t border-gray-100"></div>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setOpenDropdownId(null);
                                                                                    handleDelete(website);
                                                                                }}
                                                                                className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                                                            >
                                                                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                </svg>
                                                                                Delete
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                            No websites found. 
                                            <Link 
                                                href={route('admin.websites.create')}
                                                className="text-indigo-600 hover:text-indigo-800 ml-1 font-medium"
                                            >
                                                Create your first website
                                            </Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
