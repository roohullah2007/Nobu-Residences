import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Show({ auth }) {
    const { website, title } = usePage().props;

    return (
        <AdminLayout title={title}>
            <Head title={title} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Link
                            href={route('admin.websites.index')}
                            className="text-gray-500 hover:text-gray-700 mr-4"
                        >
                            ← Back
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                {website.name}
                                {website.is_default && (
                                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        Default
                                    </span>
                                )}
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">{website.slug}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            View Live Site
                        </a>
                        <Link
                            href={route('admin.websites.edit', website.id)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            Edit Website
                        </Link>
                    </div>
                </div>

                {/* Status Card */}
                <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-gray-900">Website Status</h3>
                            <p className="text-sm text-gray-600 mt-1">Current operational status</p>
                        </div>
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                            website.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                        }`}>
                            {website.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Website Information */}
                    <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
                        <h3 className="text-base font-semibold text-gray-900 mb-4">Website Information</h3>
                        <dl className="space-y-4">
                            {(website.logo || website.logo_url) && (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Logo</dt>
                                    <dd className="mt-1">
                                        <img
                                            src={website.logo || website.logo_url}
                                            alt={`${website.name} logo`}
                                            className="h-16 object-contain"
                                        />
                                    </dd>
                                </div>
                            )}
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Domain</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {website.domain || 'Default Domain'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Description</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {website.description || 'No description provided'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Timezone</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {website.timezone || 'America/Toronto'}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
                        <h3 className="text-base font-semibold text-gray-900 mb-4">Contact Information</h3>
                        {website.contact_info ? (
                            <dl className="space-y-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {website.contact_info.phone || 'Not provided'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {website.contact_info.email || 'Not provided'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {website.contact_info.address || 'Not provided'}
                                    </dd>
                                </div>
                            </dl>
                        ) : (
                            <p className="text-sm text-gray-500">No contact information provided</p>
                        )}
                    </div>
                </div>

                {/* Brand Colors */}
                {website.brand_colors && (
                    <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
                        <h3 className="text-base font-semibold text-gray-900 mb-4">Brand Colors</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(website.brand_colors).map(([name, color]) => (
                                <div key={name} className="flex items-center space-x-3">
                                    <div 
                                        className="w-8 h-8 rounded-lg border border-gray-200 shadow-sm"
                                        style={{ backgroundColor: color }}
                                    ></div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900 capitalize">
                                            {name.replace('_', ' ')}
                                        </div>
                                        <div className="text-xs text-gray-500">{color}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Website Pages */}
                <div className="bg-white shadow rounded-lg border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-base font-semibold text-gray-900">Website Pages</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {website.pages && website.pages.length > 0 ? (
                            website.pages.map((page) => (
                                <div key={page.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 capitalize">
                                            {page.page_type.replace('_', ' ')} Page
                                        </p>
                                        <p className="text-sm text-gray-500">{page.title}</p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            page.is_active 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {page.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                        {page.page_type === 'home' && (
                                            <Link
                                                href={route('admin.websites.edit-home-page', website.id)}
                                                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                            >
                                                Edit Content
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-6 py-8 text-center">
                                <p className="text-sm text-gray-500">No pages found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Social Media Links */}
                {website.social_media && Object.keys(website.social_media).length > 0 && (
                    <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
                        <h3 className="text-base font-semibold text-gray-900 mb-4">Social Media Links</h3>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(website.social_media).map(([platform, url]) => (
                                <div key={platform}>
                                    <dt className="text-sm font-medium text-gray-500 capitalize">{platform}</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {url ? (
                                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                                                {url}
                                            </a>
                                        ) : (
                                            <span className="text-gray-400">Not provided</span>
                                        )}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
