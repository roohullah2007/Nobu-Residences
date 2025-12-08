import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useState } from 'react';

export default function Create({ auth }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        slug: '',
        domain: '',
        is_default: false,
        is_active: true,
        // File uploads
        logo_file: null,
        favicon_file: null,
        agent_profile_image: null,
        // Text URLs (fallback if no file uploaded)
        logo_url: '',
        favicon_url: '',
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        description: '',
        timezone: 'America/Toronto',
        // Brand colors as flat keys for proper FormData handling
        'brand_colors.primary': '#912018',
        'brand_colors.secondary': '#293056',
        'brand_colors.accent': '#F5F8FF',
        'brand_colors.text': '#000000',
        'brand_colors.background': '#FFFFFF',
        // Contact info as flat keys
        'contact_info.phone': '',
        'contact_info.email': '',
        'contact_info.address': '',
        // Agent info (separate table)
        agent_name: '',
        agent_title: '',
        agent_phone: '',
        brokerage: '',
        // Social media as flat keys
        'social_media.facebook': '',
        'social_media.instagram': '',
        'social_media.twitter': '',
        'social_media.linkedin': '',
    });

    const [logoPreview, setLogoPreview] = useState('');
    const [faviconPreview, setFaviconPreview] = useState('');
    const [agentPhotoPreview, setAgentPhotoPreview] = useState('');

    const submit = (e) => {
        e.preventDefault();

        // Use router.post with forceFormData for file uploads
        router.post(route('admin.websites.store'), data, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                // Will redirect to show page on success
            },
            onError: (errors) => {
                console.error('Form errors:', errors);
            }
        });
    };

    // Auto-generate slug from name
    const updateSlug = (name) => {
        const slug = name.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
        setData('slug', slug);
    };

    // Handle logo file upload
    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('logo_file', file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setLogoPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle favicon file upload
    const handleFaviconUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('favicon_file', file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setFaviconPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle agent photo upload
    const handleAgentPhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('agent_profile_image', file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setAgentPhotoPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <AdminLayout title="Create New Website">
            <Head title="Create New Website" />

            <div className="space-y-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 text-gray-900">
                        <form onSubmit={submit} className="space-y-6">
                            {/* Basic Information */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="name" value="Website Name" />
                                        <TextInput
                                            id="name"
                                            type="text"
                                            name="name"
                                            value={data.name}
                                            className="mt-1 block w-full"
                                            autoComplete="name"
                                            isFocused={true}
                                            onChange={(e) => {
                                                setData('name', e.target.value);
                                                updateSlug(e.target.value);
                                            }}
                                            placeholder="e.g., Luxury Downtown Condos"
                                        />
                                        <InputError message={errors.name} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="slug" value="URL Slug" />
                                        <TextInput
                                            id="slug"
                                            type="text"
                                            name="slug"
                                            value={data.slug}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('slug', e.target.value)}
                                            placeholder="e.g., luxury-downtown-condos"
                                        />
                                        <InputError message={errors.slug} className="mt-2" />
                                        <p className="mt-1 text-sm text-gray-500">Used in URLs (auto-generated from name)</p>
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="domain" value="Custom Domain (Optional)" />
                                        <TextInput
                                            id="domain"
                                            type="text"
                                            name="domain"
                                            value={data.domain}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('domain', e.target.value)}
                                            placeholder="e.g., luxurycondos.com"
                                        />
                                        <InputError message={errors.domain} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="timezone" value="Timezone" />
                                        <select
                                            id="timezone"
                                            name="timezone"
                                            value={data.timezone}
                                            onChange={(e) => setData('timezone', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        >
                                            <option value="America/Toronto">America/Toronto</option>
                                            <option value="America/New_York">America/New_York</option>
                                            <option value="America/Los_Angeles">America/Los_Angeles</option>
                                            <option value="America/Chicago">America/Chicago</option>
                                        </select>
                                        <InputError message={errors.timezone} className="mt-2" />
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <InputLabel htmlFor="description" value="Description" />
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        placeholder="Brief description of the property..."
                                    />
                                    <InputError message={errors.description} className="mt-2" />
                                </div>

                                <div className="mt-6">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="is_default"
                                            checked={data.is_default}
                                            onChange={(e) => setData('is_default', e.target.checked)}
                                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-600">Set as default website</span>
                                    </label>
                                </div>
                            </div>

                            {/* Logo & Branding */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Logo & Branding</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Logo Upload */}
                                    <div>
                                        <InputLabel htmlFor="logo_file" value="Logo" />
                                        <div className="mt-2 flex items-center space-x-4">
                                            {logoPreview && (
                                                <div className="flex-shrink-0">
                                                    <img
                                                        src={logoPreview}
                                                        alt="Logo preview"
                                                        className="h-16 w-auto object-contain border border-gray-200 rounded p-1 bg-white"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="flex justify-center px-4 py-4 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                                                    <div className="text-center">
                                                        <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                        <label htmlFor="logo_file" className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                                                            <span>Upload Logo</span>
                                                            <input
                                                                id="logo_file"
                                                                name="logo_file"
                                                                type="file"
                                                                className="sr-only"
                                                                accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                                                                onChange={handleLogoUpload}
                                                            />
                                                        </label>
                                                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, SVG up to 2MB</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {logoPreview && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setLogoPreview('');
                                                    setData('logo_file', null);
                                                }}
                                                className="mt-2 text-sm text-red-600 hover:text-red-800"
                                            >
                                                Remove Logo
                                            </button>
                                        )}
                                        <InputError message={errors.logo_file} className="mt-2" />

                                        {/* Optional: URL fallback */}
                                        <div className="mt-3">
                                            <p className="text-xs text-gray-500 mb-1">Or enter logo URL:</p>
                                            <TextInput
                                                type="url"
                                                value={data.logo_url}
                                                className="block w-full text-sm"
                                                onChange={(e) => setData('logo_url', e.target.value)}
                                                placeholder="https://example.com/logo.png"
                                            />
                                        </div>
                                    </div>

                                    {/* Favicon Upload */}
                                    <div>
                                        <InputLabel htmlFor="favicon_file" value="Favicon" />
                                        <div className="mt-2 flex items-center space-x-4">
                                            {faviconPreview && (
                                                <div className="flex-shrink-0">
                                                    <img
                                                        src={faviconPreview}
                                                        alt="Favicon preview"
                                                        className="h-10 w-10 object-contain border border-gray-200 rounded p-1 bg-white"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="flex justify-center px-4 py-4 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                                                    <div className="text-center">
                                                        <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <label htmlFor="favicon_file" className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                                                            <span>Upload Favicon</span>
                                                            <input
                                                                id="favicon_file"
                                                                name="favicon_file"
                                                                type="file"
                                                                className="sr-only"
                                                                accept="image/png,image/jpeg,image/x-icon,image/ico,image/svg+xml"
                                                                onChange={handleFaviconUpload}
                                                            />
                                                        </label>
                                                        <p className="text-xs text-gray-500 mt-1">ICO, PNG, SVG up to 1MB</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {faviconPreview && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFaviconPreview('');
                                                    setData('favicon_file', null);
                                                }}
                                                className="mt-2 text-sm text-red-600 hover:text-red-800"
                                            >
                                                Remove Favicon
                                            </button>
                                        )}
                                        <InputError message={errors.favicon_file} className="mt-2" />

                                        {/* Optional: URL fallback */}
                                        <div className="mt-3">
                                            <p className="text-xs text-gray-500 mb-1">Or enter favicon URL:</p>
                                            <TextInput
                                                type="url"
                                                value={data.favicon_url}
                                                className="block w-full text-sm"
                                                onChange={(e) => setData('favicon_url', e.target.value)}
                                                placeholder="https://example.com/favicon.ico"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Brand Colors */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Brand Colors</h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    {[
                                        { key: 'brand_colors.primary', label: 'Primary', desc: 'Main brand color' },
                                        { key: 'brand_colors.secondary', label: 'Secondary', desc: 'Supporting color' },
                                        { key: 'brand_colors.accent', label: 'Accent', desc: 'Highlight color' },
                                        { key: 'brand_colors.text', label: 'Text', desc: 'Text color' },
                                        { key: 'brand_colors.background', label: 'Background', desc: 'Background color' },
                                    ].map((color) => (
                                        <div key={color.key} className="text-center">
                                            <InputLabel htmlFor={color.key} value={color.label} />
                                            <div className="mt-1">
                                                <input
                                                    id={color.key}
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

                            {/* Contact Information */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="contact_phone" value="Phone" />
                                        <TextInput
                                            id="contact_phone"
                                            type="tel"
                                            value={data['contact_info.phone']}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('contact_info.phone', e.target.value)}
                                            placeholder="+1 (555) 123-4567"
                                        />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="contact_email" value="Email" />
                                        <TextInput
                                            id="contact_email"
                                            type="email"
                                            value={data['contact_info.email']}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('contact_info.email', e.target.value)}
                                            placeholder="contact@example.com"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <InputLabel htmlFor="contact_address" value="Address" />
                                        <textarea
                                            id="contact_address"
                                            value={data['contact_info.address']}
                                            onChange={(e) => setData('contact_info.address', e.target.value)}
                                            rows={2}
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            placeholder="123 Main St, City, Province, Country"
                                        />
                                    </div>
                                </div>

                                {/* Property Manager/Agent */}
                                <div className="mt-6 border-t pt-6">
                                    <h4 className="text-md font-semibold text-gray-800 mb-4">Property Manager / Agent</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Agent Photo Upload */}
                                        <div className="md:col-span-2">
                                            <InputLabel htmlFor="agent_profile_image" value="Profile Photo" />
                                            <div className="mt-2 flex items-start space-x-6">
                                                {agentPhotoPreview && (
                                                    <div className="flex-shrink-0 relative">
                                                        <img
                                                            src={agentPhotoPreview}
                                                            alt="Agent Profile"
                                                            className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setAgentPhotoPreview('');
                                                                setData('agent_profile_image', null);
                                                            }}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md"
                                                            title="Remove image"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                                                        <div className="space-y-1 text-center">
                                                            {!agentPhotoPreview && (
                                                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                </svg>
                                                            )}
                                                            <div className="flex text-sm text-gray-600">
                                                                <label htmlFor="agent_profile_image" className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                                                                    <span>{agentPhotoPreview ? 'Change photo' : 'Upload photo'}</span>
                                                                    <input
                                                                        id="agent_profile_image"
                                                                        name="agent_profile_image"
                                                                        type="file"
                                                                        className="sr-only"
                                                                        accept="image/png,image/jpeg,image/jpg,image/webp"
                                                                        onChange={handleAgentPhotoUpload}
                                                                    />
                                                                </label>
                                                                <p className="pl-1">or drag and drop</p>
                                                            </div>
                                                            <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <InputError message={errors.agent_profile_image} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="agent_name" value="Name" />
                                            <TextInput
                                                id="agent_name"
                                                type="text"
                                                value={data.agent_name}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('agent_name', e.target.value)}
                                                placeholder="John Doe"
                                            />
                                            <InputError message={errors.agent_name} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="agent_title" value="Title" />
                                            <TextInput
                                                id="agent_title"
                                                type="text"
                                                value={data.agent_title}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('agent_title', e.target.value)}
                                                placeholder="Senior Real Estate Agent"
                                            />
                                            <InputError message={errors.agent_title} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="agent_phone" value="Agent Phone" />
                                            <TextInput
                                                id="agent_phone"
                                                type="tel"
                                                value={data.agent_phone}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('agent_phone', e.target.value)}
                                                placeholder="+1 (555) 987-6543"
                                            />
                                            <InputError message={errors.agent_phone} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="brokerage" value="Brokerage" />
                                            <TextInput
                                                id="brokerage"
                                                type="text"
                                                value={data.brokerage}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('brokerage', e.target.value)}
                                                placeholder="Keller Williams Realty"
                                            />
                                            <InputError message={errors.brokerage} className="mt-2" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Social Media */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Social Media</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="social_facebook" value="Facebook URL" />
                                        <TextInput
                                            id="social_facebook"
                                            type="url"
                                            value={data['social_media.facebook']}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('social_media.facebook', e.target.value)}
                                            placeholder="https://facebook.com/yourpage"
                                        />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="social_instagram" value="Instagram URL" />
                                        <TextInput
                                            id="social_instagram"
                                            type="url"
                                            value={data['social_media.instagram']}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('social_media.instagram', e.target.value)}
                                            placeholder="https://instagram.com/youraccount"
                                        />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="social_twitter" value="Twitter URL" />
                                        <TextInput
                                            id="social_twitter"
                                            type="url"
                                            value={data['social_media.twitter']}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('social_media.twitter', e.target.value)}
                                            placeholder="https://twitter.com/youraccount"
                                        />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="social_linkedin" value="LinkedIn URL" />
                                        <TextInput
                                            id="social_linkedin"
                                            type="url"
                                            value={data['social_media.linkedin']}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('social_media.linkedin', e.target.value)}
                                            placeholder="https://linkedin.com/company/yourcompany"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SEO Settings */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
                                <div className="space-y-6">
                                    <div>
                                        <InputLabel htmlFor="meta_title" value="Meta Title" />
                                        <TextInput
                                            id="meta_title"
                                            type="text"
                                            name="meta_title"
                                            value={data.meta_title}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('meta_title', e.target.value)}
                                            placeholder="Luxury Condos for Sale and Rent"
                                        />
                                        <InputError message={errors.meta_title} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="meta_description" value="Meta Description" />
                                        <textarea
                                            id="meta_description"
                                            name="meta_description"
                                            value={data.meta_description}
                                            onChange={(e) => setData('meta_description', e.target.value)}
                                            rows={3}
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            placeholder="Discover luxury living at our premium condos..."
                                        />
                                        <InputError message={errors.meta_description} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="meta_keywords" value="Meta Keywords" />
                                        <TextInput
                                            id="meta_keywords"
                                            type="text"
                                            name="meta_keywords"
                                            value={data.meta_keywords}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('meta_keywords', e.target.value)}
                                            placeholder="luxury condos, real estate, Toronto"
                                        />
                                        <InputError message={errors.meta_keywords} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex items-center justify-between">
                                <Link
                                    href={route('admin.websites.index')}
                                    className="inline-flex items-center px-4 py-2 bg-gray-300 border border-transparent rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-400"
                                >
                                    Cancel
                                </Link>

                                <PrimaryButton className="ml-4" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Website'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
