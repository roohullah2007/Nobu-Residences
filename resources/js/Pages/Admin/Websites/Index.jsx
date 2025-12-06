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

    // Calculate stats
    const totalWebsites = websites?.length || 0;
    const activeWebsites = websites?.filter(w => w.is_active).length || 0;

    return (
        <AdminLayout title="Websites">
            <Head title={title} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-[#0f172a]">Websites</h1>
                        <p className="text-sm text-[#64748b] mt-1">
                            Manage and configure your real estate websites
                        </p>
                    </div>
                    <Link
                        href={route('admin.websites.create')}
                        className="inline-flex items-center px-4 py-2.5 bg-[#0f172a] text-white text-sm font-medium rounded-lg hover:bg-[#1e293b] transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Website
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#64748b]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-[#0f172a]">{totalWebsites}</p>
                                <p className="text-sm text-[#64748b]">Total Websites</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#f0fdf4] flex items-center justify-center text-[#16a34a]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-[#0f172a]">{activeWebsites}</p>
                                <p className="text-sm text-[#64748b]">Active</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Websites Table */}
                <div className="bg-white rounded-lg border border-[#e2e8f0]">
                    <div className="overflow-visible">
                        <table className="min-w-full divide-y divide-[#e2e8f0]">
                            <thead className="bg-[#f8fafc]">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                        Website
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                        Domain
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                        Pages
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-[#e2e8f0]">
                                {websites && websites.length > 0 ? (
                                    websites.map((website) => (
                                        <tr key={website.id} className="hover:bg-[#f8fafc] transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-lg bg-[#0f172a] flex items-center justify-center">
                                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-[#0f172a]">
                                                                {website.name}
                                                            </span>
                                                            {website.is_default && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#eff6ff] text-[#1e40af]">
                                                                    Default
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-[#94a3b8]">
                                                            {website.slug}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                    website.is_active
                                                        ? 'bg-[#f0fdf4] text-[#16a34a]'
                                                        : 'bg-[#fef2f2] text-[#dc2626]'
                                                }`}>
                                                    {website.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#0f172a]">
                                                {website.domain || 'Default Domain'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#64748b]">
                                                {website.pages ? website.pages.length : 0} pages
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="relative inline-block text-left">
                                                    <button
                                                        onClick={() => toggleDropdown(website.id)}
                                                        className="inline-flex items-center p-2 text-[#64748b] bg-[#f1f5f9] rounded-lg hover:bg-[#e2e8f0] transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                        </svg>
                                                    </button>

                                                    {openDropdownId === website.id && (
                                                        <>
                                                            <div
                                                                className="fixed inset-0 z-40"
                                                                onClick={() => setOpenDropdownId(null)}
                                                            ></div>

                                                            <div className="absolute right-0 z-50 mt-2 w-48 bg-white border border-[#e2e8f0] rounded-lg shadow-lg">
                                                                <div className="py-1">
                                                                    <a
                                                                        href={getWebsiteUrl(website)}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center px-4 py-2 text-sm text-[#0f172a] hover:bg-[#f8fafc] transition-colors"
                                                                    >
                                                                        <svg className="w-4 h-4 mr-3 text-[#64748b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                        </svg>
                                                                        View Website
                                                                    </a>

                                                                    <Link
                                                                        href={route('admin.websites.show', website.id)}
                                                                        className="flex items-center px-4 py-2 text-sm text-[#0f172a] hover:bg-[#f8fafc] transition-colors"
                                                                        onClick={() => setOpenDropdownId(null)}
                                                                    >
                                                                        <svg className="w-4 h-4 mr-3 text-[#64748b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                        View Info
                                                                    </Link>

                                                                    <Link
                                                                        href={route('admin.websites.edit', website.id)}
                                                                        className="flex items-center px-4 py-2 text-sm text-[#0f172a] hover:bg-[#f8fafc] transition-colors"
                                                                        onClick={() => setOpenDropdownId(null)}
                                                                    >
                                                                        <svg className="w-4 h-4 mr-3 text-[#64748b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                        </svg>
                                                                        Edit Info
                                                                    </Link>

                                                                    <Link
                                                                        href={route('admin.websites.pages', website.id)}
                                                                        className="flex items-center px-4 py-2 text-sm text-[#0f172a] hover:bg-[#f8fafc] transition-colors"
                                                                        onClick={() => setOpenDropdownId(null)}
                                                                    >
                                                                        <svg className="w-4 h-4 mr-3 text-[#64748b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                        </svg>
                                                                        Pages
                                                                    </Link>

                                                                    {!website.is_default && (
                                                                        <>
                                                                            <div className="border-t border-[#e2e8f0] my-1"></div>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setOpenDropdownId(null);
                                                                                    handleDelete(website);
                                                                                }}
                                                                                className="flex items-center w-full px-4 py-2 text-sm text-[#dc2626] hover:bg-[#fef2f2] transition-colors"
                                                                            >
                                                                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
                                        <td colSpan="5" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="w-12 h-12 rounded-lg bg-[#f1f5f9] flex items-center justify-center mb-3">
                                                    <svg className="w-6 h-6 text-[#94a3b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                                                    </svg>
                                                </div>
                                                <p className="text-sm font-medium text-[#0f172a]">No websites found</p>
                                                <p className="text-xs text-[#94a3b8] mt-1 mb-4">Create your first website to get started</p>
                                                <Link
                                                    href={route('admin.websites.create')}
                                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#0f172a] rounded-lg hover:bg-[#1e293b] transition-colors"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                    Add Website
                                                </Link>
                                            </div>
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
