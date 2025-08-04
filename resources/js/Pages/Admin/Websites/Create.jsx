import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useState } from 'react';

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        domain: '',
        is_default: false,
        logo_url: '',
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        favicon_url: '',
        description: '',
        timezone: 'America/Toronto',
        background_image: '',
        brand_colors: {
            primary: '#912018',
            secondary: '#293056',
            accent: '#F5F8FF',
            text: '#000000',
            background: '#FFFFFF',
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
        },
        contact_info: {
            phone: '',
            email: '',
            address: '',
            website: '',
            business_hours: '',
            agent: {
                name: '',
                title: '',
                photo: '',
                phone: '',
                email: ''
            }
        },
        social_media: {
            facebook: '',
            instagram: '',
            twitter: '',
            linkedin: '',
            youtube: '',
            tiktok: ''
        },
        footer_info: {
            about_text: '',
            copyright_text: '',
            privacy_policy_url: '',
            terms_of_service_url: '',
            additional_links: [
                { name: '', url: '' }
            ]
        }
    });

    const [backgroundImagePreview, setBackgroundImagePreview] = useState('');
    const [agentPhotoPreview, setAgentPhotoPreview] = useState('');

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.websites.store'));
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

    // Handle background image upload
    const handleBackgroundImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target.result;
                setBackgroundImagePreview(result);
                setData('background_image', result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle agent photo upload
    const handleAgentPhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target.result;
                setAgentPhotoPreview(result);
                setData('contact_info', {
                    ...data.contact_info,
                    agent: {
                        ...data.contact_info.agent,
                        photo: result
                    }
                });
            };
            reader.readAsDataURL(file);
        }
    };

    // Add new footer link
    const addFooterLink = () => {
        setData('footer_info', {
            ...data.footer_info,
            additional_links: [
                ...data.footer_info.additional_links,
                { name: '', url: '' }
            ]
        });
    };

    // Remove footer link
    const removeFooterLink = (index) => {
        const newLinks = data.footer_info.additional_links.filter((_, i) => i !== index);
        setData('footer_info', {
            ...data.footer_info,
            additional_links: newLinks
        });
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

                            {/* Assets */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Assets</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="logo_url" value="Logo URL" />
                                        <TextInput
                                            id="logo_url"
                                            type="url"
                                            name="logo_url"
                                            value={data.logo_url}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('logo_url', e.target.value)}
                                            placeholder="https://example.com/logo.png"
                                        />
                                        <InputError message={errors.logo_url} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="favicon_url" value="Favicon URL" />
                                        <TextInput
                                            id="favicon_url"
                                            type="url"
                                            name="favicon_url"
                                            value={data.favicon_url}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('favicon_url', e.target.value)}
                                            placeholder="https://example.com/favicon.ico"
                                        />
                                        <InputError message={errors.favicon_url} className="mt-2" />
                                    </div>

                                    <div className="md:col-span-2">
                                        <InputLabel htmlFor="background_image" value="Background Image" />
                                        
                                        {/* URL Input Option */}
                                        <div className="mt-1 mb-4">
                                            <TextInput
                                                id="background_image_url"
                                                type="url"
                                                value={data.background_image && data.background_image.startsWith('http') ? data.background_image : ''}
                                                className="block w-full"
                                                onChange={(e) => {
                                                    setData('background_image', e.target.value);
                                                    setBackgroundImagePreview(e.target.value);
                                                }}
                                                placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                                            />
                                            <p className="mt-1 text-sm text-gray-500">Or upload a file below</p>
                                        </div>
                                        
                                        {/* File Upload Option */}
                                        <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                                            <div className="space-y-1 text-center">
                                                {backgroundImagePreview ? (
                                                    <div className="mb-4">
                                                        <img 
                                                            src={backgroundImagePreview} 
                                                            alt="Background preview" 
                                                            className="mx-auto h-32 w-auto rounded-lg shadow-md"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setBackgroundImagePreview('');
                                                                setData('background_image', '');
                                                            }}
                                                            className="mt-2 text-sm text-red-600 hover:text-red-800"
                                                        >
                                                            Remove Image
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                                <div className="flex text-sm text-gray-600">
                                                    <label htmlFor="background_image" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                                        <span className="inline-flex items-center px-4 py-2 border border-indigo-300 rounded-md hover:bg-indigo-50">
                                                            📁 Choose File
                                                        </span>
                                                        <input 
                                                            id="background_image" 
                                                            name="background_image" 
                                                            type="file" 
                                                            className="sr-only" 
                                                            accept="image/*" 
                                                            onChange={handleBackgroundImageUpload} 
                                                        />
                                                    </label>
                                                    <p className="pl-1 self-center">or drag and drop</p>
                                                </div>
                                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                                
                                                {/* Alternative Upload Button */}
                                                <div className="mt-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => document.getElementById('background_image').click()}
                                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                                    >
                                                        Upload Background Image
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Brand Colors */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Brand Colors</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {Object.entries(data.brand_colors).map(([key, color]) => (
                                        <div key={key}>
                                            <InputLabel 
                                                htmlFor={`color_${key}`} 
                                                value={key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')} 
                                            />
                                            <div className="mt-1 flex items-center space-x-2">
                                                <div className="flex-shrink-0">
                                                    <input
                                                    id={`color_${key}`}
                                                    type="color"
                                                    value={color}
                                                    onChange={(e) => setData('brand_colors', {
                                                    ...data.brand_colors,
                                                    [key]: e.target.value
                                                    })}
                                                    className="w-10 h-12 border border-gray-300 rounded cursor-pointer block"
                                                    />
                                                </div>
                                                <TextInput
                                                    type="text"
                                                    value={color}
                                                    onChange={(e) => setData('brand_colors', {
                                                        ...data.brand_colors,
                                                        [key]: e.target.value
                                                    })}
                                                    className="flex-1"
                                                    placeholder="#000000"
                                                />
                                            </div>
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
                                            value={data.contact_info.phone}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('contact_info', {
                                                ...data.contact_info,
                                                phone: e.target.value
                                            })}
                                            placeholder="+1 (555) 123-4567"
                                        />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="contact_email" value="Email" />
                                        <TextInput
                                            id="contact_email"
                                            type="email"
                                            value={data.contact_info.email}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('contact_info', {
                                                ...data.contact_info,
                                                email: e.target.value
                                            })}
                                            placeholder="contact@example.com"
                                        />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="contact_website" value="Website URL" />
                                        <TextInput
                                            id="contact_website"
                                            type="url"
                                            value={data.contact_info.website}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('contact_info', {
                                                ...data.contact_info,
                                                website: e.target.value
                                            })}
                                            placeholder="https://example.com"
                                        />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="business_hours" value="Business Hours" />
                                        <TextInput
                                            id="business_hours"
                                            type="text"
                                            value={data.contact_info.business_hours}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('contact_info', {
                                                ...data.contact_info,
                                                business_hours: e.target.value
                                            })}
                                            placeholder="Mon-Fri 9AM-6PM"
                                        />
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <InputLabel htmlFor="contact_address" value="Address" />
                                    <textarea
                                        id="contact_address"
                                        value={data.contact_info.address}
                                        onChange={(e) => setData('contact_info', {
                                            ...data.contact_info,
                                            address: e.target.value
                                        })}
                                        rows={2}
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        placeholder="123 Main St, City, Province, Country"
                                    />
                                </div>

                                {/* Property Manager */}
                                <div className="mt-6">
                                    <h4 className="text-md font-medium text-gray-900 mb-4">Property Manager</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <InputLabel htmlFor="agent_photo" value="Property Manager Photo" />
                                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                                                <div className="space-y-1 text-center">
                                                    {agentPhotoPreview ? (
                                                        <div className="mb-4">
                                                            <img 
                                                                src={agentPhotoPreview} 
                                                                alt="Agent photo preview" 
                                                                className="mx-auto h-24 w-24 rounded-full object-cover shadow-md"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setAgentPhotoPreview('');
                                                                    setData('contact_info', {
                                                                        ...data.contact_info,
                                                                        agent: {
                                                                            ...data.contact_info.agent,
                                                                            photo: ''
                                                                        }
                                                                    });
                                                                }}
                                                                className="mt-2 text-sm text-red-600 hover:text-red-800"
                                                            >
                                                                Remove Photo
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    )}
                                                    <div className="flex text-sm text-gray-600">
                                                        <label htmlFor="agent_photo" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                                                            <span className="inline-flex items-center px-4 py-2 border border-indigo-300 rounded-md hover:bg-indigo-50">
                                                                📁 Choose Photo
                                                            </span>
                                                            <input 
                                                                id="agent_photo" 
                                                                name="agent_photo" 
                                                                type="file" 
                                                                className="sr-only" 
                                                                accept="image/*" 
                                                                onChange={handleAgentPhotoUpload} 
                                                            />
                                                        </label>
                                                        <p className="pl-1 self-center">or drag and drop</p>
                                                    </div>
                                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                                    
                                                    {/* Alternative Upload Button */}
                                                    <div className="mt-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => document.getElementById('agent_photo').click()}
                                                            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                                        >
                                                            Upload Photo
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="agent_name" value="Name" />
                                            <TextInput
                                                id="agent_name"
                                                type="text"
                                                value={data.contact_info.agent.name}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('contact_info', {
                                                    ...data.contact_info,
                                                    agent: {
                                                        ...data.contact_info.agent,
                                                        name: e.target.value
                                                    }
                                                })}
                                                placeholder="John Doe"
                                            />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="agent_title" value="Title" />
                                            <TextInput
                                                id="agent_title"
                                                type="text"
                                                value={data.contact_info.agent.title}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('contact_info', {
                                                    ...data.contact_info,
                                                    agent: {
                                                        ...data.contact_info.agent,
                                                        title: e.target.value
                                                    }
                                                })}
                                                placeholder="Property Manager"
                                            />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="agent_phone" value="Direct Phone" />
                                            <TextInput
                                                id="agent_phone"
                                                type="tel"
                                                value={data.contact_info.agent.phone}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('contact_info', {
                                                    ...data.contact_info,
                                                    agent: {
                                                        ...data.contact_info.agent,
                                                        phone: e.target.value
                                                    }
                                                })}
                                                placeholder="+1 (555) 987-6543"
                                            />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="agent_email" value="Direct Email" />
                                            <TextInput
                                                id="agent_email"
                                                type="email"
                                                value={data.contact_info.agent.email}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('contact_info', {
                                                    ...data.contact_info,
                                                    agent: {
                                                        ...data.contact_info.agent,
                                                        email: e.target.value
                                                    }
                                                })}
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Social Media */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Social Media</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {Object.entries(data.social_media).map(([platform, url]) => (
                                        <div key={platform}>
                                            <InputLabel 
                                                htmlFor={`social_${platform}`} 
                                                value={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`} 
                                            />
                                            <TextInput
                                                id={`social_${platform}`}
                                                type="url"
                                                value={url}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('social_media', {
                                                    ...data.social_media,
                                                    [platform]: e.target.value
                                                })}
                                                placeholder={`https://${platform}.com/yourpage`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Footer Information */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Footer Information</h3>
                                <div className="space-y-6">
                                    <div>
                                        <InputLabel htmlFor="about_text" value="About Text" />
                                        <textarea
                                            id="about_text"
                                            value={data.footer_info.about_text}
                                            onChange={(e) => setData('footer_info', {
                                                ...data.footer_info,
                                                about_text: e.target.value
                                            })}
                                            rows={3}
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            placeholder="Brief description about your company or property..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <InputLabel htmlFor="copyright_text" value="Copyright Text" />
                                            <TextInput
                                                id="copyright_text"
                                                type="text"
                                                value={data.footer_info.copyright_text}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('footer_info', {
                                                    ...data.footer_info,
                                                    copyright_text: e.target.value
                                                })}
                                                placeholder="© 2024 Your Company Name. All rights reserved."
                                            />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="privacy_policy_url" value="Privacy Policy URL" />
                                            <TextInput
                                                id="privacy_policy_url"
                                                type="url"
                                                value={data.footer_info.privacy_policy_url}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('footer_info', {
                                                    ...data.footer_info,
                                                    privacy_policy_url: e.target.value
                                                })}
                                                placeholder="https://example.com/privacy"
                                            />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="terms_of_service_url" value="Terms of Service URL" />
                                            <TextInput
                                                id="terms_of_service_url"
                                                type="url"
                                                value={data.footer_info.terms_of_service_url}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('footer_info', {
                                                    ...data.footer_info,
                                                    terms_of_service_url: e.target.value
                                                })}
                                                placeholder="https://example.com/terms"
                                            />
                                        </div>
                                    </div>

                                    {/* Additional Footer Links */}
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <InputLabel value="Additional Footer Links" />
                                            <button
                                                type="button"
                                                onClick={addFooterLink}
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                                            >
                                                + Add Link
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {data.footer_info.additional_links.map((link, index) => (
                                                <div key={index} className="flex gap-4 p-4 bg-white rounded border">
                                                    <div className="flex-1">
                                                        <TextInput
                                                            type="text"
                                                            value={link.name}
                                                            className="block w-full"
                                                            onChange={(e) => {
                                                                const newLinks = [...data.footer_info.additional_links];
                                                                newLinks[index].name = e.target.value;
                                                                setData('footer_info', {
                                                                    ...data.footer_info,
                                                                    additional_links: newLinks
                                                                });
                                                            }}
                                                            placeholder="Link Name"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <TextInput
                                                            type="url"
                                                            value={link.url}
                                                            className="block w-full"
                                                            onChange={(e) => {
                                                                const newLinks = [...data.footer_info.additional_links];
                                                                newLinks[index].url = e.target.value;
                                                                setData('footer_info', {
                                                                    ...data.footer_info,
                                                                    additional_links: newLinks
                                                                });
                                                            }}
                                                            placeholder="https://example.com"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFooterLink(index)}
                                                        className="px-3 py-2 text-red-600 hover:text-red-800"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
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
