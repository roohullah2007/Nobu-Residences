import { Head, Link, usePage, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Edit({ auth }) {
    const { website, title } = usePage().props;

    const { data, setData, put, processing, errors } = useForm({
        name: website?.name || '',
        slug: website?.slug || '',
        domain: website?.domain || '',
        is_default: website?.is_default || false,
        is_active: website?.is_active || true,
        logo_url: website?.logo_url || '',
        logo_file: null, // New field for file upload
        meta_title: website?.meta_title || '',
        meta_description: website?.meta_description || '',
        meta_keywords: website?.meta_keywords || '',
        favicon_url: website?.favicon_url || '',
        description: website?.description || '',
        timezone: website?.timezone || 'America/Toronto',
        // Brand colors
        'brand_colors.primary': website?.brand_colors?.primary || '#912018',
        'brand_colors.secondary': website?.brand_colors?.secondary || '#293056',
        'brand_colors.accent': website?.brand_colors?.accent || '#F5F8FF',
        'brand_colors.text': website?.brand_colors?.text || '#000000',
        'brand_colors.background': website?.brand_colors?.background || '#FFFFFF',
        // Contact info
        'contact_info.phone': website?.contact_info?.phone || '',
        'contact_info.email': website?.contact_info?.email || '',
        'contact_info.address': website?.contact_info?.address || '',
        'contact_info.agent.name': website?.contact_info?.agent?.name || '',
        'contact_info.agent.title': website?.contact_info?.agent?.title || '',
        'contact_info.agent.phone': website?.contact_info?.agent?.phone || '',
        'contact_info.agent.brokerage': website?.contact_info?.agent?.brokerage || '',
        'contact_info.agent.image': website?.contact_info?.agent?.image || '',
        agent_image_file: null,
        // Social media
        'social_media.facebook': website?.social_media?.facebook || '',
        'social_media.instagram': website?.social_media?.instagram || '',
        'social_media.twitter': website?.social_media?.twitter || '',
        'social_media.linkedin': website?.social_media?.linkedin || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (website?.id) {
            // Use post method with _method spoofing for file uploads
            const formData = new FormData();
            
            // Add all form data
            Object.keys(data).forEach(key => {
                if (key === 'logo_file' && data[key]) {
                    formData.append('logo_file', data[key]);
                } else if (key === 'agent_image_file' && data[key]) {
                    formData.append('agent_image_file', data[key]);
                } else if (data[key] !== null && data[key] !== undefined) {
                    formData.append(key, data[key]);
                }
            });
            
            // Add method spoofing for PUT request
            formData.append('_method', 'PUT');
            
            // Use post with form data for file upload
            put(route('admin.websites.update', website.id), {
                forceFormData: true
            });
        }
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                                    <input
                                        type="text"
                                        value={data.domain}
                                        onChange={(e) => setData('domain', e.target.value)}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="example.com"
                                    />
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
                                            {(data.logo_url || data.logo_file) && (
                                                <div className="mb-4">
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        {data.logo_file ? 'New Logo Preview:' : 'Current Logo:'}
                                                    </p>
                                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                                                        <img 
                                                            src={data.logo_url} 
                                                            alt={data.logo_file ? 'New Logo Preview' : 'Current Logo'} 
                                                            className="h-16 w-auto mx-auto"
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
                                                                        setData('logo_file', file);
                                                                        if (file) {
                                                                            const reader = new FileReader();
                                                                            reader.onload = (e) => {
                                                                                setData('logo_url', e.target.result);
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

                                            <div className="relative">
                                                <div className="absolute inset-0 flex items-center">
                                                    <div className="w-full border-t border-gray-300" />
                                                </div>
                                                <div className="relative flex justify-center text-sm">
                                                    <span className="px-2 bg-white text-gray-500">or</span>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Logo URL
                                                </label>
                                                <input
                                                    type="url"
                                                    value={data.logo_file ? '' : data.logo_url}
                                                    onChange={(e) => {
                                                        setData('logo_url', e.target.value);
                                                        setData('logo_file', null);
                                                    }}
                                                    disabled={!!data.logo_file}
                                                    className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                                                        data.logo_file ? 'bg-gray-100 text-gray-500' : ''
                                                    }`}
                                                    placeholder="https://example.com/logo.png"
                                                />
                                                {errors.logo_url && <p className="text-red-500 text-xs mt-1">{errors.logo_url}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Brand Colors */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Brand Colors</label>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        {[
                                            { key: 'brand_colors.primary', label: 'Primary', desc: 'Main brand color' },
                                            { key: 'brand_colors.secondary', label: 'Secondary', desc: 'Supporting color' },
                                            { key: 'brand_colors.accent', label: 'Accent', desc: 'Highlight color' },
                                            { key: 'brand_colors.text', label: 'Text', desc: 'Text color' },
                                            { key: 'brand_colors.background', label: 'Background', desc: 'Background color' },
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Favicon URL</label>
                                    <input
                                        type="url"
                                        value={data.favicon_url}
                                        onChange={(e) => setData('favicon_url', e.target.value)}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="https://example.com/favicon.ico"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">16x16 or 32x32 pixel icon file</p>
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
                                        {(data['contact_info.agent.image'] || data.agent_image_file) && (
                                            <div className="flex-shrink-0 relative">
                                                <div className="relative">
                                                    <img 
                                                        src={data['contact_info.agent.image']} 
                                                        alt="Agent Profile" 
                                                        className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                    {/* Remove button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setData('contact_info.agent.image', '');
                                                            setData('agent_image_file', null);
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
                                                    {data.agent_image_file ? 'New Image' : 'Current Image'}
                                                </p>
                                            </div>
                                        )}
                                        
                                        {/* Upload Button */}
                                        <div className="flex-1">
                                            <div className={`flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-all ${
                                                data['contact_info.agent.image'] 
                                                    ? 'border-green-300 bg-green-50 hover:border-green-400' 
                                                    : 'border-gray-300 hover:border-gray-400'
                                            }`}>
                                                <div className="space-y-1 text-center">
                                                    {!data['contact_info.agent.image'] ? (
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
                                                            <span>{data['contact_info.agent.image'] ? 'Change photo' : 'Upload agent photo'}</span>
                                                            <input
                                                                id="agent-image-upload"
                                                                type="file"
                                                                accept="image/*"
                                                                className="sr-only"
                                                                onChange={(e) => {
                                                                    const file = e.target.files[0];
                                                                    setData('agent_image_file', file);
                                                                    if (file) {
                                                                        const reader = new FileReader();
                                                                        reader.onload = (e) => {
                                                                            setData('contact_info.agent.image', e.target.result);
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
                                        value={data['contact_info.agent.name']}
                                        onChange={(e) => setData('contact_info.agent.name', e.target.value)}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Agent Title</label>
                                    <input
                                        type="text"
                                        value={data['contact_info.agent.title']}
                                        onChange={(e) => setData('contact_info.agent.title', e.target.value)}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="Senior Real Estate Agent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Agent Phone</label>
                                    <input
                                        type="tel"
                                        value={data['contact_info.agent.phone']}
                                        onChange={(e) => setData('contact_info.agent.phone', e.target.value)}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Brokerage</label>
                                    <input
                                        type="text"
                                        value={data['contact_info.agent.brokerage']}
                                        onChange={(e) => setData('contact_info.agent.brokerage', e.target.value)}
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
