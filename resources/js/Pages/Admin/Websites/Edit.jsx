import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import React, { useState, useEffect } from 'react';

export default function Edit({ auth }) {
    const { website, title, buildings, flash } = usePage().props;
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Auto-hide toast after 3 seconds
    useEffect(() => {
        if (showSuccessToast) {
            const timer = setTimeout(() => {
                setShowSuccessToast(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccessToast]);

    // Check for both snake_case and camelCase (Laravel typically sends as snake_case)
    const agentInfo = website?.agent_info || website?.agentInfo;
    let initialAgentImage = agentInfo?.profile_image || '';

    // If the image path exists and doesn't start with http or /, prepend /storage/
    if (initialAgentImage && !initialAgentImage.startsWith('http') && !initialAgentImage.startsWith('/')) {
        initialAgentImage = `/storage/${initialAgentImage}`;
    }

    const [logoPreview, setLogoPreview] = React.useState(website?.logo || website?.logo_url || '');
    const [faviconPreview, setFaviconPreview] = React.useState(website?.favicon_url || '');
    const [agentImagePreview, setAgentImagePreview] = React.useState(initialAgentImage);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: website?.name || '',
        slug: website?.slug || '',
        domain: website?.domain || '',
        is_default: website?.is_default || false,
        is_active: website?.is_active || true,
        homepage_building_id: website?.homepage_building_id || null,
        use_building_as_homepage: website?.use_building_as_homepage || false,
        logo_url: website?.logo_url || '',
        logo_file: null, // For logo file upload
        favicon_url: website?.favicon_url || '',
        favicon_file: null, // For favicon file upload
        meta_title: website?.meta_title || '',
        meta_description: website?.meta_description || '',
        meta_keywords: website?.meta_keywords || '',
        description: website?.description || '',
        timezone: website?.timezone || 'America/Toronto',
        // Brand colors - Core
        'brand_colors.primary': website?.brand_colors?.primary || '#912018',
        'brand_colors.accent': website?.brand_colors?.accent || '#F5F8FF',
        'brand_colors.text': website?.brand_colors?.text || '#000000',
        'brand_colors.background': website?.brand_colors?.background || '#FFFFFF',
        // Button colors - Primary (Blue buttons - Available Building, Sign Up/Log In)
        'brand_colors.button_primary_bg': website?.brand_colors?.button_primary_bg || '#293056',
        'brand_colors.button_primary_text': website?.brand_colors?.button_primary_text || '#FFFFFF',
        // Button colors - Secondary (Red/Brown buttons - Contact Agent, Show All Listings)
        'brand_colors.button_secondary_bg': website?.brand_colors?.button_secondary_bg || '#912018',
        'brand_colors.button_secondary_text': website?.brand_colors?.button_secondary_text || '#FFFFFF',
        // Button colors - Tertiary (Black buttons - Request Building Tour)
        'brand_colors.button_tertiary_bg': website?.brand_colors?.button_tertiary_bg || '#000000',
        'brand_colors.button_tertiary_text': website?.brand_colors?.button_tertiary_text || '#FFFFFF',
        // Button colors - Quaternary (White/Light buttons - outline buttons)
        'brand_colors.button_quaternary_bg': website?.brand_colors?.button_quaternary_bg || '#FFFFFF',
        'brand_colors.button_quaternary_text': website?.brand_colors?.button_quaternary_text || '#293056',
        // Footer colors
        'brand_colors.footer_bg': website?.brand_colors?.footer_bg || '#1a1a2e',
        'brand_colors.footer_text': website?.brand_colors?.footer_text || '#FFFFFF',
        // Link colors
        'brand_colors.link_color': website?.brand_colors?.link_color || '#912018',
        'brand_colors.link_hover': website?.brand_colors?.link_hover || '#6d1812',
        // Contact info
        'contact_info.phone': website?.contact_info?.phone || '',
        'contact_info.email': website?.contact_info?.email || '',
        'contact_info.address': website?.contact_info?.address || '',
        // Agent Information (from agent_info table)
        agent_name: agentInfo?.agent_name || '',
        agent_title: agentInfo?.agent_title || '',
        agent_phone: agentInfo?.agent_phone || '',
        brokerage: agentInfo?.brokerage || '',
        agent_profile_image: null,
        // Social media
        'social_media.facebook': website?.social_media?.facebook || '',
        'social_media.instagram': website?.social_media?.instagram || '',
        'social_media.twitter': website?.social_media?.twitter || '',
        'social_media.linkedin': website?.social_media?.linkedin || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        // Transform data for submission
        const transformedData = {
            ...data,
            _method: 'PUT' // Add method spoofing for Laravel
        };

        // Use router.post for file uploads with PUT method
        router.post(route('admin.websites.update', website.id), transformedData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                // Reset file inputs after successful upload
                setData('logo_file', null);
                setData('agent_profile_image', null);
                setData('favicon_file', null);
                // Show success toast
                setSuccessMessage('Website settings saved successfully!');
                setShowSuccessToast(true);
            },
            onError: (errors) => {
                console.error('Form errors:', errors);
            }
        });
    };

    // If website is not loaded yet, show loading
    if (!website) {
        return (
            <AdminLayout title={title}>
                <Head title={title} />
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <span className="ml-3 text-gray-500">Loading website...</span>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title={title}>
            <Head title={title} />

            {/* Success Toast Notification */}
            {showSuccessToast && (
                <>
                <style>{`
                    @keyframes fadeInSlide {
                        from { opacity: 0; transform: translateX(20px); }
                        to { opacity: 1; transform: translateX(0); }
                    }
                `}</style>
                <div className="fixed top-4 right-4 z-50" style={{ animation: 'fadeInSlide 0.3s ease-out' }}>
                    <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-green-800">{successMessage}</p>
                        </div>
                        <button
                            onClick={() => setShowSuccessToast(false)}
                            className="flex-shrink-0 text-green-500 hover:text-green-700"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                </>
            )}

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Edit Website</h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Update settings and configuration for <span className="font-medium">{website?.name}</span>
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('admin.websites.show', website.id)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                            </svg>
                            Back to Website
                        </Link>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white shadow rounded-lg border border-gray-200">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center mb-4">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                        <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"/>
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                                    <p className="text-sm text-gray-500">Essential website details and configuration</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Website Name</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        required
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                                    <input
                                        type="text"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        required
                                    />
                                    {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Custom Domain</label>
                                    <input
                                        type="text"
                                        value={data.domain}
                                        onChange={(e) => setData('domain', e.target.value)}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="yourdomain.com"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Enter your custom domain (without http/https). DNS must be configured to point to this server.
                                    </p>
                                    {data.slug && (
                                        <div className="mt-2 p-2 bg-blue-50 rounded-md">
                                            <p className="text-xs text-blue-700">
                                                <strong>Preview URL:</strong>{' '}
                                                <code className="bg-blue-100 px-1 rounded">?website={data.slug}</code>
                                            </p>
                                            <p className="text-xs text-blue-600 mt-1">
                                                Use this query parameter to preview this website without connecting a domain.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                                    <select
                                        value={data.timezone}
                                        onChange={(e) => setData('timezone', e.target.value)}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                        <option value="America/Toronto">America/Toronto</option>
                                        <option value="America/New_York">America/New_York</option>
                                        <option value="America/Los_Angeles">America/Los_Angeles</option>
                                        <option value="America/Chicago">America/Chicago</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows="3"
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="Brief description of this website..."
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <div className="flex items-start space-x-6">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="is_default"
                                                type="checkbox"
                                                checked={data.is_default}
                                                onChange={(e) => setData('is_default', e.target.checked)}
                                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                            />
                                            <div className="ml-3 text-sm">
                                                <label htmlFor="is_default" className="font-medium text-gray-700">Default Website</label>
                                                <p className="text-gray-500">This will be the main website for your domain</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center h-5">
                                            <input
                                                id="is_active"
                                                type="checkbox"
                                                checked={data.is_active}
                                                onChange={(e) => setData('is_active', e.target.checked)}
                                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                            />
                                            <div className="ml-3 text-sm">
                                                <label htmlFor="is_active" className="font-medium text-gray-700">Active</label>
                                                <p className="text-gray-500">Website is publicly accessible</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Homepage Settings */}
                    <div className="bg-white shadow rounded-lg border border-gray-200">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center mb-4">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-medium text-gray-900">Homepage Settings</h3>
                                    <p className="text-sm text-gray-500">Configure what shows as your homepage</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Use Building as Homepage Toggle */}
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="use_building_as_homepage"
                                            type="checkbox"
                                            checked={data.use_building_as_homepage}
                                            onChange={(e) => setData('use_building_as_homepage', e.target.checked)}
                                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="use_building_as_homepage" className="font-medium text-gray-700">
                                            Use Building Page as Homepage
                                        </label>
                                        <p className="text-gray-500">
                                            Display a building details page as the homepage instead of the default homepage
                                        </p>
                                    </div>
                                </div>

                                {/* Building Selection */}
                                {data.use_building_as_homepage && (
                                    <div className="ml-7">
                                        <label htmlFor="homepage_building_id" className="block text-sm font-medium text-gray-700 mb-1">
                                            Select Building
                                        </label>
                                        <select
                                            id="homepage_building_id"
                                            value={data.homepage_building_id || ''}
                                            onChange={(e) => setData('homepage_building_id', e.target.value || null)}
                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                        >
                                            <option value="">-- Select a Building --</option>
                                            {buildings?.map((building) => (
                                                <option key={building.id} value={building.id}>
                                                    {building.name} {building.address && `- ${building.address}`}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.homepage_building_id && (
                                            <p className="mt-2 text-sm text-red-600">{errors.homepage_building_id}</p>
                                        )}
                                        {data.homepage_building_id && (
                                            <p className="mt-2 text-sm text-gray-500">
                                                When users visit your homepage, they will see the details page for the selected building.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Logo & Branding */}
                    <div className="bg-white shadow rounded-lg border border-gray-200">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center mb-4">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                        <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-medium text-gray-900">Logo & Branding</h3>
                                    <p className="text-sm text-gray-500">Upload your logo and customize brand colors</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Logo Upload Section */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Logo</label>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Current/Preview Logo */}
                                        <div>
                                            {(logoPreview || data.logo_url) && (
                                                <div className="mb-4">
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        {data.logo_file ? 'New Logo Preview:' : 'Current Logo:'}
                                                    </p>
                                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                                                        <img
                                                            src={logoPreview || data.logo_url}
                                                            alt={data.logo_file ? 'New Logo Preview' : 'Current Logo'}
                                                            className="h-16 w-auto mx-auto object-contain"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Upload Controls */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Upload New Logo
                                                </label>
                                                {data.logo_file && (
                                                    <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                                        <div className="flex">
                                                            <div className="flex-shrink-0">
                                                                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                            <div className="ml-3">
                                                                <p className="text-sm text-yellow-800">
                                                                    <strong>Note:</strong> Uploading a new logo will replace the current logo.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                                                    <div className="space-y-1 text-center">
                                                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                        <div className="flex text-sm text-gray-600">
                                                            <label htmlFor="logo-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                                                <span>Upload a file</span>
                                                                <input
                                                                    id="logo-upload"
                                                                    type="file"
                                                                    accept="image/*"
                                                                    className="sr-only"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files[0];
                                                                        console.log('Logo file selected:', file);
                                                                        if (file) {
                                                                            setData('logo_file', file);
                                                                            console.log('Logo file set in data');
                                                                            const reader = new FileReader();
                                                                            reader.onload = (e) => {
                                                                                setLogoPreview(e.target.result);
                                                                            };
                                                                            reader.readAsDataURL(file);
                                                                        }
                                                                    }}
                                                                />
                                                            </label>
                                                            <p className="pl-1">or drag and drop</p>
                                                        </div>
                                                        <p className="text-xs text-gray-500">
                                                            PNG, JPG, JPEG, SVG up to 2MB
                                                        </p>
                                                    </div>
                                                </div>
                                                {errors.logo_file && <p className="text-red-500 text-xs mt-1">{errors.logo_file}</p>}
                                            </div>

                                        </div>
                                    </div>
                                </div>

                                {/* Core Brand Colors */}
                                <div className="border-b border-gray-200 pb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        <span className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                            </svg>
                                            Core Brand Colors
                                        </span>
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { key: 'brand_colors.primary', label: 'Primary', desc: 'Main brand color' },
                                            { key: 'brand_colors.accent', label: 'Accent', desc: 'Highlight color' },
                                            { key: 'brand_colors.text', label: 'Text', desc: 'Text color' },
                                            { key: 'brand_colors.background', label: 'Background', desc: 'Page background' },
                                        ].map((color) => (
                                            <div key={color.key} className="text-center">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">{color.label}</label>
                                                <div className="relative">
                                                    <input
                                                        type="color"
                                                        value={data[color.key]}
                                                        onChange={(e) => setData(color.key, e.target.value)}
                                                        className="h-12 w-full rounded-md border border-gray-300 cursor-pointer"
                                                    />
                                                    <div className="mt-1 text-xs text-gray-500 text-center">
                                                        {data[color.key]}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1">{color.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Button Colors */}
                                <div className="border-b border-gray-200 pb-6 pt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        <span className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                            </svg>
                                            Button Colors
                                        </span>
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { key: 'brand_colors.button_primary_bg', label: 'Primary BG', desc: 'Blue buttons' },
                                            { key: 'brand_colors.button_primary_text', label: 'Primary Text', desc: 'Primary text' },
                                            { key: 'brand_colors.button_secondary_bg', label: 'Secondary BG', desc: 'Red/Brown buttons' },
                                            { key: 'brand_colors.button_secondary_text', label: 'Secondary Text', desc: 'Secondary text' },
                                            { key: 'brand_colors.button_tertiary_bg', label: 'Tertiary BG', desc: 'Black buttons' },
                                            { key: 'brand_colors.button_tertiary_text', label: 'Tertiary Text', desc: 'Tertiary text' },
                                            { key: 'brand_colors.button_quaternary_bg', label: 'Quaternary BG', desc: 'White buttons' },
                                            { key: 'brand_colors.button_quaternary_text', label: 'Quaternary Text', desc: 'Quaternary text' },
                                        ].map((color) => (
                                            <div key={color.key} className="text-center">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">{color.label}</label>
                                                <div className="relative">
                                                    <input
                                                        type="color"
                                                        value={data[color.key]}
                                                        onChange={(e) => setData(color.key, e.target.value)}
                                                        className="h-12 w-full rounded-md border border-gray-300 cursor-pointer"
                                                    />
                                                    <div className="mt-1 text-xs text-gray-500 text-center">
                                                        {data[color.key]}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1">{color.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Button Preview */}
                                    <div className="mt-4 flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            className="px-5 py-2 rounded-lg font-medium transition-opacity hover:opacity-80 text-sm"
                                            style={{
                                                backgroundColor: data['brand_colors.button_primary_bg'],
                                                color: data['brand_colors.button_primary_text']
                                            }}
                                        >
                                            Available Building
                                        </button>
                                        <button
                                            type="button"
                                            className="px-5 py-2 rounded-lg font-medium transition-opacity hover:opacity-80 text-sm"
                                            style={{
                                                backgroundColor: data['brand_colors.button_secondary_bg'],
                                                color: data['brand_colors.button_secondary_text']
                                            }}
                                        >
                                            Contact Agent
                                        </button>
                                        <button
                                            type="button"
                                            className="px-5 py-2 rounded-lg font-medium transition-opacity hover:opacity-80 text-sm"
                                            style={{
                                                backgroundColor: data['brand_colors.button_tertiary_bg'],
                                                color: data['brand_colors.button_tertiary_text']
                                            }}
                                        >
                                            Request Tour
                                        </button>
                                        <button
                                            type="button"
                                            className="px-5 py-2 rounded-lg font-medium transition-opacity hover:opacity-80 text-sm border"
                                            style={{
                                                backgroundColor: data['brand_colors.button_quaternary_bg'],
                                                color: data['brand_colors.button_quaternary_text'],
                                                borderColor: data['brand_colors.button_quaternary_text']
                                            }}
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>

                                {/* Footer Colors */}
                                <div className="border-b border-gray-200 pb-6 pt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        <span className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            Footer Colors
                                        </span>
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { key: 'brand_colors.footer_bg', label: 'Footer Background', desc: 'Footer section background' },
                                            { key: 'brand_colors.footer_text', label: 'Footer Text', desc: 'Footer text color' },
                                        ].map((color) => (
                                            <div key={color.key} className="text-center">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">{color.label}</label>
                                                <div className="relative">
                                                    <input
                                                        type="color"
                                                        value={data[color.key]}
                                                        onChange={(e) => setData(color.key, e.target.value)}
                                                        className="h-12 w-full rounded-md border border-gray-300 cursor-pointer"
                                                    />
                                                    <div className="mt-1 text-xs text-gray-500 text-center">
                                                        {data[color.key]}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1">{color.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Footer Preview */}
                                    <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: data['brand_colors.footer_bg'] }}>
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium" style={{ color: data['brand_colors.footer_text'] }}>Footer Preview</span>
                                            <div className="flex gap-4">
                                                <span style={{ color: data['brand_colors.footer_text'] }}>Privacy</span>
                                                <span style={{ color: data['brand_colors.footer_text'] }}>Terms</span>
                                                <span style={{ color: data['brand_colors.footer_text'] }}>Contact</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Link Colors */}
                                <div className="pt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        <span className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                            </svg>
                                            Link Colors
                                        </span>
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { key: 'brand_colors.link_color', label: 'Link Color', desc: 'Default link color' },
                                            { key: 'brand_colors.link_hover', label: 'Link Hover', desc: 'Link hover color' },
                                        ].map((color) => (
                                            <div key={color.key} className="text-center">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">{color.label}</label>
                                                <div className="relative">
                                                    <input
                                                        type="color"
                                                        value={data[color.key]}
                                                        onChange={(e) => setData(color.key, e.target.value)}
                                                        className="h-12 w-full rounded-md border border-gray-300 cursor-pointer"
                                                    />
                                                    <div className="mt-1 text-xs text-gray-500 text-center">
                                                        {data[color.key]}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1">{color.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Link Preview */}
                                    <div className="mt-4">
                                        <span className="mr-2">Preview:</span>
                                        <a
                                            href="#"
                                            onClick={(e) => e.preventDefault()}
                                            className="underline transition-colors"
                                            style={{ color: data['brand_colors.link_color'] }}
                                            onMouseEnter={(e) => e.target.style.color = data['brand_colors.link_hover']}
                                            onMouseLeave={(e) => e.target.style.color = data['brand_colors.link_color']}
                                        >
                                            Sample Link (hover me)
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SEO Settings */}
                    <div className="bg-white shadow rounded-lg border border-gray-200">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center mb-4">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                                        <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-medium text-gray-900">SEO Settings</h3>
                                    <p className="text-sm text-gray-500">Optimize your website for search engines</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                                    <input
                                        type="text"
                                        value={data.meta_title}
                                        onChange={(e) => setData('meta_title', e.target.value)}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="Your Website Title - Brand Name"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Recommended: 50-60 characters</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                                    <textarea
                                        value={data.meta_description}
                                        onChange={(e) => setData('meta_description', e.target.value)}
                                        rows="3"
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="A brief description of your website that appears in search results..."
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Recommended: 150-160 characters</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
                                    <input
                                        type="text"
                                        value={data.meta_keywords}
                                        onChange={(e) => setData('meta_keywords', e.target.value)}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="keyword1, keyword2, keyword3"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Separate keywords with commas</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Favicon</label>
                                    <div className="space-y-3">
                                        {/* Current/Preview Favicon */}
                                        <div className="flex items-center gap-4">
                                            {(faviconPreview || data.favicon_url) && (
                                                <div className="flex-shrink-0">
                                                    <img
                                                        src={faviconPreview || data.favicon_url}
                                                        alt="Favicon preview"
                                                        className="h-10 w-10 object-contain border border-gray-200 rounded p-1 bg-white"
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="flex justify-center px-4 py-3 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                                                    <div className="text-center">
                                                        <label htmlFor="favicon-upload" className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                                                            <span>{faviconPreview || data.favicon_url ? 'Change Favicon' : 'Upload Favicon'}</span>
                                                            <input
                                                                id="favicon-upload"
                                                                type="file"
                                                                accept="image/png,image/jpeg,image/x-icon,image/ico,image/svg+xml"
                                                                className="sr-only"
                                                                onChange={(e) => {
                                                                    const file = e.target.files[0];
                                                                    if (file) {
                                                                        setData('favicon_file', file);
                                                                        const reader = new FileReader();
                                                                        reader.onload = (e) => {
                                                                            setFaviconPreview(e.target.result);
                                                                        };
                                                                        reader.readAsDataURL(file);
                                                                    }
                                                                }}
                                                            />
                                                        </label>
                                                        <p className="text-xs text-gray-500 mt-1">ICO, PNG, SVG up to 1MB</p>
                                                    </div>
                                                </div>
                                            </div>
                                            {(faviconPreview || data.favicon_url) && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setFaviconPreview('');
                                                        setData('favicon_url', '');
                                                        setData('favicon_file', null);
                                                    }}
                                                    className="text-red-500 hover:text-red-700"
                                                    title="Remove favicon"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                        {/* URL fallback */}
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Or enter favicon URL:</p>
                                            <input
                                                type="text"
                                                value={data.favicon_url}
                                                onChange={(e) => {
                                                    setData('favicon_url', e.target.value);
                                                    setFaviconPreview(e.target.value);
                                                }}
                                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                placeholder="/favicon.ico or https://example.com/favicon.png"
                                            />
                                        </div>
                                    </div>
                                    {errors.favicon_file && <p className="text-red-500 text-xs mt-1">{errors.favicon_file}</p>}
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-white shadow rounded-lg border border-gray-200">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center mb-4">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
                                    <p className="text-sm text-gray-500">Business contact details and agent information</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={data['contact_info.phone']}
                                        onChange={(e) => setData('contact_info.phone', e.target.value)}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={data['contact_info.email']}
                                        onChange={(e) => setData('contact_info.email', e.target.value)}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="info@example.com"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <textarea
                                        value={data['contact_info.address']}
                                        onChange={(e) => setData('contact_info.address', e.target.value)}
                                        rows="2"
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="123 Main Street, City, State ZIP"
                                    />
                                </div>

                                {/* Agent Information Section */}
                                <div className="md:col-span-2 border-t pt-4 mt-4">
                                    <h4 className="text-md font-semibold text-gray-800 mb-4">Agent Information</h4>
                                </div>

                                {/* Agent Image Upload */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Agent Profile Image</label>
                                    <div className="flex items-start space-x-6">
                                        {/* Current/Preview Image */}
                                        {agentImagePreview && (
                                            <div className="flex-shrink-0 relative">
                                                <div className="relative">
                                                    <img
                                                        src={agentImagePreview}
                                                        alt="Agent Profile"
                                                        className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                                                    />
                                                    {/* Remove button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setData('agent_profile_image', null);
                                                            setAgentImagePreview('');
                                                        }}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md"
                                                        title="Remove image"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-2 text-center">
                                                    {data.agent_profile_image ? 'New Image' : 'Current Image'}
                                                </p>
                                            </div>
                                        )}
                                        
                                        {/* Upload Button */}
                                        <div className="flex-1">
                                            <div className={`flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-all ${
                                                agentImagePreview
                                                    ? 'border-green-300 bg-green-50 hover:border-green-400'
                                                    : 'border-gray-300 hover:border-gray-400'
                                            }`}>
                                                <div className="space-y-1 text-center">
                                                    {!agentImagePreview ? (
                                                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    )}
                                                    <div className="flex text-sm text-gray-600">
                                                        <label htmlFor="agent-image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                                            <span>{agentImagePreview ? 'Change photo' : 'Upload agent photo'}</span>
                                                            <input
                                                                id="agent-image-upload"
                                                                type="file"
                                                                accept="image/*"
                                                                className="sr-only"
                                                                onChange={(e) => {
                                                                    const file = e.target.files[0];
                                                                    if (file) {
                                                                        setData('agent_profile_image', file);
                                                                        const reader = new FileReader();
                                                                        reader.onload = (e) => {
                                                                            setAgentImagePreview(e.target.result);
                                                                        };
                                                                        reader.readAsDataURL(file);
                                                                    }
                                                                }}
                                                            />
                                                        </label>
                                                        <p className="pl-1">or drag and drop</p>
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        PNG, JPG, JPEG up to 2MB
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
                                    <input
                                        type="text"
                                        value={data.agent_name}
                                        onChange={(e) => setData('agent_name', e.target.value)}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Agent Title</label>
                                    <input
                                        type="text"
                                        value={data.agent_title}
                                        onChange={(e) => setData('agent_title', e.target.value)}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="Senior Real Estate Agent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Agent Phone</label>
                                    <input
                                        type="tel"
                                        value={data.agent_phone}
                                        onChange={(e) => setData('agent_phone', e.target.value)}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Brokerage</label>
                                    <input
                                        type="text"
                                        value={data.brokerage}
                                        onChange={(e) => setData('brokerage', e.target.value)}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="Keller Williams Realty"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Media */}
                    <div className="bg-white shadow rounded-lg border border-gray-200">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center mb-4">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 rounded-lg bg-pink-100 flex items-center justify-center">
                                        <svg className="h-5 w-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4l-2 14h14l-2-14M8 8v4m4-4v4m4-4v4"/>
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-medium text-gray-900">Social Media</h3>
                                    <p className="text-sm text-gray-500">Connect your social media profiles</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                                    <input
                                        type="url"
                                        value={data['social_media.facebook']}
                                        onChange={(e) => setData('social_media.facebook', e.target.value)}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="https://facebook.com/yourpage"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                                    <input
                                        type="url"
                                        value={data['social_media.instagram']}
                                        onChange={(e) => setData('social_media.instagram', e.target.value)}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="https://instagram.com/youraccount"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                                    <input
                                        type="url"
                                        value={data['social_media.twitter']}
                                        onChange={(e) => setData('social_media.twitter', e.target.value)}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="https://twitter.com/youraccount"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                                    <input
                                        type="url"
                                        value={data['social_media.linkedin']}
                                        onChange={(e) => setData('social_media.linkedin', e.target.value)}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="https://linkedin.com/company/yourcompany"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-4 py-4">
                        <Link
                            href={route('admin.websites.show', website.id)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
