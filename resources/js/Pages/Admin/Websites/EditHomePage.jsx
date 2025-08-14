import { Head, Link, usePage, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState } from 'react';

export default function EditHomePage({ auth }) {
    const { website, homePage, availableIcons, title } = usePage().props;
    const [activeTab, setActiveTab] = useState('hero');
    const [showIconModal, setShowIconModal] = useState(false);
    const [showEditIconModal, setShowEditIconModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('key_facts');
    const [selectedIcon, setSelectedIcon] = useState(null);

    // Helper function to merge existing content with defaults
    const getDefaultContent = () => {
        const defaults = {
            hero: {
                welcome_text: 'WELCOME TO NOBU RESIDENCES',
                main_heading: 'Your Next Home Is Just a Click Away',
                subheading: 'Whether buying or renting, Nobu makes finding your home easy and reliable.',
                background_image: '/assets/hero-section.jpg',
                buttons: [
                    { text: '6 Condos for rent', url: '/rent', style: 'primary' },
                    { text: '6 Condos for sale', url: '/sale', style: 'secondary' }
                ]
            },
            about: {
                title: 'Learn everything about Nobu Residence',
                image: '/assets/nobu-building.jpg',
                image_alt: 'Nobu Residence Building',
                content: 'Found in Toronto\'s King West area and built in 2024, Nobu Residences was built by Madison Group. This Toronto condo sits near the intersection of Spadina Ave and Wellington St W.'
            },
            carousel_settings: {
                for_rent: {
                    title: 'Properties for Rent',
                    address_filter: 'Toronto, ON',
                    property_subtype: 'Condo',
                    enabled: true,
                    limit: 6
                },
                for_sale: {
                    title: 'Properties for Sale',
                    address_filter: 'Toronto, ON',
                    property_subtype: 'Condo',
                    enabled: true,
                    limit: 6
                }
            },
            faq: {
                title: 'Frequently Asked Questions',
                enabled: true,
                items: [
                    {
                        question: 'What are the rental prices at Nobu Residences?',
                        answer: 'Rental prices vary based on unit size and floor level. Contact us for current availability and pricing.'
                    }
                ]
            },
            footer: {
                enabled: true,
                heading: 'Your new home is waiting',
                subheading: 'Apply online in minutes or get in touch to schedule a personalized tour',
                logo_url: '/assets/logo.png',
                background_image: '/assets/house-img.jpg',
                description: 'Experience luxury living at Nobu Residences in the heart of Toronto.',
                quick_links: [
                    { text: 'Properties for Rent', url: '/rent' },
                    { text: 'Properties for Sale', url: '/sale' }
                ],
                contact_info: {
                    use_global_contact: true,
                    show_phone: true,
                    show_email: true,
                    show_address: true,
                    custom_phone: '',
                    custom_email: '',
                    custom_address: '',
                    custom_agent_name: '',
                    custom_agent_title: ''
                },
                social_media: {
                    use_global_social: true,
                    show_facebook: true,
                    show_instagram: true,
                    show_twitter: true,
                    show_linkedin: true
                },
                copyright_text: '© 2024 Nobu Residences. All rights reserved.',
                additional_links: [
                    { text: 'Privacy Policy', url: '/privacy' },
                    { text: 'Terms of Service', url: '/terms' }
                ]
            }
        };

        const existingContent = homePage?.content || {};
        
        return {
            hero: { ...defaults.hero, ...existingContent.hero },
            about: { ...defaults.about, ...existingContent.about },
            carousel_settings: {
                for_rent: { ...defaults.carousel_settings.for_rent, ...existingContent.carousel_settings?.for_rent },
                for_sale: { ...defaults.carousel_settings.for_sale, ...existingContent.carousel_settings?.for_sale }
            },
            faq: { ...defaults.faq, ...existingContent.faq },
            footer: { ...defaults.footer, ...existingContent.footer }
        };
    };

    // Form for updating home page content
    const { data, setData, put, processing, errors, clearErrors } = useForm({
        title: homePage?.title || '',
        content: getDefaultContent(),
        hero_background_image: null,
        about_image: null,
        footer_logo: null,
        footer_background_image: null
    });

    // Form for creating new icons
    const { data: iconData, setData: setIconData, post: postIcon, processing: iconProcessing, errors: iconErrors, reset: resetIcon } = useForm({
        name: '',
        category: 'key_facts',
        icon_file: null,
    });

    // Form for editing icons
    const { data: editIconData, setData: setEditIconData, post: postEditIcon, processing: editIconProcessing, errors: editIconErrors, reset: resetEditIcon } = useForm({
        _method: 'PUT',
        name: '',
        category: 'key_facts',
        svg_content: '',
        icon_url: '',
        icon_file: null,
        description: '',
        is_active: true,
    });

    const categoryOptions = [
        { value: 'key_facts', label: 'Key Facts' },
        { value: 'amenities', label: 'Amenities' },
        { value: 'highlights', label: 'Highlights' },
        { value: 'contact', label: 'Contact' },
        { value: 'general', label: 'General' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (website?.id) {
            clearErrors();
            
            const submitData = {
                title: data.title || '',
                content: JSON.stringify(data.content),
                hero_background_image: data.hero_background_image,
                about_image: data.about_image,
                footer_logo: data.footer_logo,
                footer_background_image: data.footer_background_image,
            };
            
            put(route('admin.websites.home-page.update', website.id), submitData, {
                forceFormData: true,
                onSuccess: (response) => {
                    console.log('Success response:', response);
                },
                onError: (errors) => {
                    console.error('Form submission errors:', errors);
                }
            });
        }
    };

    // If website is not loaded yet, show loading
    if (!website) {
        return (
            <AdminLayout title={title}>
                <Head title={title} />
                <div className="flex justify-center items-center h-64">
                    <div className="text-gray-500">Loading website...</div>
                </div>
            </AdminLayout>
        );
    }

    const updateHeroField = (field, value) => {
        setData('content', {
            ...data.content,
            hero: {
                ...data.content.hero,
                [field]: value
            }
        });
    };

    const updateAboutField = (field, value) => {
        setData('content', {
            ...data.content,
            about: {
                ...data.content.about,
                [field]: value
            }
        });
    };

    const updateCarouselSetting = (carouselType, field, value) => {
        setData('content', {
            ...data.content,
            carousel_settings: {
                ...data.content.carousel_settings,
                [carouselType]: {
                    ...data.content.carousel_settings[carouselType],
                    [field]: value
                }
            }
        });
    };

    const updateFaqField = (field, value) => {
        setData('content', {
            ...data.content,
            faq: {
                ...data.content.faq,
                [field]: value
            }
        });
    };

    const updateFaqItem = (index, field, value) => {
        const newItems = [...(data.content.faq?.items || [])];
        newItems[index] = { ...newItems[index], [field]: value };
        updateFaqField('items', newItems);
    };

    const addFaqItem = () => {
        const newItems = [...(data.content.faq?.items || []), { question: '', answer: '' }];
        updateFaqField('items', newItems);
    };

    const removeFaqItem = (index) => {
        const newItems = (data.content.faq?.items || []).filter((_, i) => i !== index);
        updateFaqField('items', newItems);
    };

    const updateFooterField = (field, value) => {
        setData('content', {
            ...data.content,
            footer: {
                ...data.content.footer,
                [field]: value
            }
        });
    };

    const updateFooterQuickLink = (index, field, value) => {
        const newLinks = [...(data.content.footer?.quick_links || [])];
        newLinks[index] = { ...newLinks[index], [field]: value };
        updateFooterField('quick_links', newLinks);
    };

    const addFooterQuickLink = () => {
        const newLinks = [...(data.content.footer?.quick_links || []), { text: '', url: '' }];
        updateFooterField('quick_links', newLinks);
    };

    const removeFooterQuickLink = (index) => {
        const newLinks = (data.content.footer?.quick_links || []).filter((_, i) => i !== index);
        updateFooterField('quick_links', newLinks);
    };

    const updateFooterAdditionalLink = (index, field, value) => {
        const newLinks = [...(data.content.footer?.additional_links || [])];
        newLinks[index] = { ...newLinks[index], [field]: value };
        updateFooterField('additional_links', newLinks);
    };

    const addFooterAdditionalLink = () => {
        const newLinks = [...(data.content.footer?.additional_links || []), { text: '', url: '' }];
        updateFooterField('additional_links', newLinks);
    };

    const removeFooterAdditionalLink = (index) => {
        const newLinks = (data.content.footer?.additional_links || []).filter((_, i) => i !== index);
        updateFooterField('additional_links', newLinks);
    };

    const updateHeroButton = (index, field, value) => {
        const newButtons = [...data.content.hero.buttons];
        newButtons[index] = { ...newButtons[index], [field]: value };
        updateHeroField('buttons', newButtons);
    };

    const addHeroButton = () => {
        const newButtons = [...data.content.hero.buttons, { text: '', url: '', style: 'primary' }];
        updateHeroField('buttons', newButtons);
    };

    const removeHeroButton = (index) => {
        const newButtons = data.content.hero.buttons.filter((_, i) => i !== index);
        updateHeroField('buttons', newButtons);
    };

    const handleIconSubmit = (e) => {
        e.preventDefault();
        postIcon(route('admin.icons.api.store'), {
            onSuccess: () => {
                setShowIconModal(false);
                resetIcon();
                window.location.reload();
            }
        });
    };

    const handleEditIconSubmit = (e) => {
        e.preventDefault();
        postEditIcon(route('admin.icons.update', selectedIcon.id), {
            onSuccess: () => {
                setShowEditIconModal(false);
                setSelectedIcon(null);
                resetEditIcon();
                window.location.reload();
            }
        });
    };

    const openEditIconModal = (icon) => {
        setSelectedIcon(icon);
        setEditIconData({
            _method: 'PUT',
            name: icon.name,
            category: icon.category,
            svg_content: icon.svg_content || '',
            icon_url: icon.icon_url || '',
            icon_file: null,
            description: icon.description || '',
            is_active: icon.is_active ?? true,
        });
        setShowEditIconModal(true);
    };

    const handleDeleteIcon = async (icon) => {
        if (confirm(`Are you sure you want to delete the "${icon.name}" icon?`)) {
            try {
                const response = await fetch(route('admin.icons.destroy', icon.id), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    },
                    body: JSON.stringify({
                        _method: 'DELETE'
                    })
                });
                
                if (response.ok) {
                    window.location.reload();
                } else {
                    alert('Failed to delete icon');
                }
            } catch (error) {
                console.error('Error deleting icon:', error);
                alert('Error deleting icon');
            }
        }
    };

    const renderIconGrid = (category) => {
        const icons = availableIcons?.[category] || [];
        return (
            <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg">
                {icons.map((icon) => (
                    <div key={icon.id} className="group relative flex flex-col items-center p-3 bg-white rounded border hover:shadow-md transition-shadow">
                        <div 
                            className="w-8 h-8 mb-2 cursor-pointer"
                            onClick={() => openEditIconModal(icon)}
                            title="Click to edit icon"
                        >
                            {icon.svg_content ? (
                                <div 
                                    dangerouslySetInnerHTML={{ __html: icon.svg_content }}
                                    className="w-full h-full"
                                />
                            ) : icon.icon_url ? (
                                <img 
                                    src={icon.icon_url} 
                                    alt={icon.name}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                                    <span className="text-xs text-gray-400">?</span>
                                </div>
                            )}
                        </div>
                        <span className="text-xs text-center font-medium mb-2">{icon.name}</span>
                        
                        {/* Action buttons - shown on hover */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                            <button
                                onClick={() => openEditIconModal(icon)}
                                className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                                title="Edit icon"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDeleteIcon(icon)}
                                className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                title="Delete icon"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
                <button
                    onClick={() => {
                        setSelectedCategory(category);
                        setShowIconModal(true);
                    }}
                    className="flex flex-col items-center p-2 bg-blue-50 border-2 border-dashed border-blue-300 rounded hover:bg-blue-100"
                >
                    <div className="w-8 h-8 mb-2 flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </div>
                    <span className="text-xs text-center font-medium text-blue-600">Add Icon</span>
                </button>
            </div>
        );
    };

    return (
        <AdminLayout title={title}>
            <Head title={title} />

            <div className="space-y-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                    Edit Home Page: {website?.name || 'Loading...'}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Manage your home page content and sections
                                </p>
                            </div>
                            <Link
                                href={website?.id ? route('admin.websites.show', website.id) : '#'}
                                className="inline-flex items-center px-4 py-2 bg-gray-300 border border-transparent rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-400"
                            >
                                ← Back to Website
                            </Link>
                        </div>

                        {/* Error Messages */}
                        {Object.keys(errors).length > 0 && (
                            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex">
                                    <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <h3 className="text-sm font-medium text-red-800 mb-2">There were errors with your submission:</h3>
                                        <ul className="text-sm text-red-700 list-disc list-inside">
                                            {Object.entries(errors).map(([key, value]) => (
                                                <li key={key}>{value}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tabs */}
                        <div className="border-b border-gray-200 mb-6">
                            <nav className="-mb-px flex space-x-8">
                                {[
                                    { id: 'hero', name: 'Hero Section' },
                                    { id: 'about', name: 'About Section' },
                                    { id: 'carousel', name: 'Property Carousels' },
                                    { id: 'faq', name: 'FAQ Section' },
                                    { id: 'footer', name: 'Footer Section' },
                                    { id: 'icons', name: 'Icon Management' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === tab.id
                                                ? 'border-indigo-500 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        {tab.name}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <form onSubmit={handleSubmit}>
                            {/* Hero Section Tab */}
                            {activeTab === 'hero' && (
                                <div className="space-y-8">
                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hero Content</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Welcome Text</label>
                                                <input
                                                    type="text"
                                                    value={data.content.hero?.welcome_text || ''}
                                                    onChange={(e) => updateHeroField('welcome_text', e.target.value)}
                                                    className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="WELCOME TO NOBU RESIDENCES"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Main Heading</label>
                                                <input
                                                    type="text"
                                                    value={data.content.hero?.main_heading || ''}
                                                    onChange={(e) => updateHeroField('main_heading', e.target.value)}
                                                    className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Your Next Home Is Just a Click Away"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Subheading</label>
                                                <textarea
                                                    value={data.content.hero?.subheading || ''}
                                                    onChange={(e) => updateHeroField('subheading', e.target.value)}
                                                    rows={3}
                                                    className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Whether buying or renting, Nobu makes finding your home easy and reliable."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Background Image</label>
                                            <div className="space-y-3">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => setData('hero_background_image', e.target.files[0])}
                                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                />
                                                {data.content.hero?.background_image && (
                                                    <div className="flex items-center space-x-3">
                                                        <img 
                                                            src={data.content.hero.background_image} 
                                                            alt="Current background" 
                                                            className="w-20 h-20 object-cover rounded-lg border"
                                                        />
                                                        <div className="text-sm text-gray-600">
                                                            <p className="font-medium">Current Image:</p>
                                                            <p className="break-all">{data.content.hero.background_image}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                <p className="text-sm text-gray-500">
                                                    Upload a new image to replace the current background image. Recommended size: 1920x1080px
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Call-to-Action Buttons</h3>
                                        <label className="block text-sm font-semibold text-gray-700 mb-4">Configure the buttons that appear in the hero section</label>
                                        {data.content.hero?.buttons?.map((button, index) => (
                                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="text-sm font-semibold text-gray-800">Button #{index + 1}</h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeHeroButton(index)}
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                        title="Remove button"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 mb-1">Button Text</label>
                                                        <input
                                                            type="text"
                                                            value={button.text}
                                                            onChange={(e) => updateHeroButton(index, 'text', e.target.value)}
                                                            placeholder="Button text"
                                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 mb-1">Link URL</label>
                                                        <input
                                                            type="text"
                                                            value={button.url}
                                                            onChange={(e) => updateHeroButton(index, 'url', e.target.value)}
                                                            placeholder="/rent or /sale"
                                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 mb-1">Button Style</label>
                                                        <select
                                                            value={button.style}
                                                            onChange={(e) => updateHeroButton(index, 'style', e.target.value)}
                                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        >
                                                            <option value="primary">Primary (Blue)</option>
                                                            <option value="secondary">Secondary (Outlined)</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={addHeroButton}
                                            className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors duration-200"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Add New Button
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Icons Tab */}
                            {activeTab === 'icons' && (
                                <div className="space-y-8">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                        <div className="flex items-start space-x-3">
                                            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <div>
                                                <h4 className="text-sm font-medium text-blue-800">Icon Management</h4>
                                                <p className="text-sm text-blue-600 mt-1">
                                                    Manage icons that appear in the About section tabs (Key Facts, Amenities, etc.).
                                                    Both SVG and PNG/JPG formats are supported.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {categoryOptions.map(category => (
                                        <div key={category.value}>
                                            <h4 className="text-lg font-medium text-gray-900 mb-4">{category.label} Icons</h4>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Icons used in the {category.label.toLowerCase()} section
                                            </p>
                                            {renderIconGrid(category.value)}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Save Button */}
                            {activeTab !== 'icons' && (
                                <div className="flex justify-end pt-8 border-t border-gray-200">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-lg font-semibold text-sm text-white shadow-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        {processing ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Saving Changes...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>

            {/* Add Icon Modal */}
            {showIconModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Add New {categoryOptions.find(c => c.value === selectedCategory)?.label} Icon
                            </h3>
                            <form onSubmit={handleIconSubmit} encType="multipart/form-data">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Icon Name</label>
                                        <input
                                            type="text"
                                            value={iconData.name}
                                            onChange={(e) => setIconData('name', e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            placeholder="e.g., gym, pool, building"
                                            required
                                        />
                                        {iconErrors.name && <p className="text-red-500 text-xs mt-1">{iconErrors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Category</label>
                                        <select
                                            value={iconData.category}
                                            onChange={(e) => setIconData('category', e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        >
                                            {categoryOptions.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Icon File</label>
                                        <input
                                            type="file"
                                            accept=".svg,.png,.jpg,.jpeg"
                                            onChange={(e) => setIconData('icon_file', e.target.files[0])}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Supported formats: SVG, PNG, JPG (max 2MB)
                                        </p>
                                        {iconErrors.icon_file && <p className="text-red-500 text-xs mt-1">{iconErrors.icon_file}</p>}
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-2 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowIconModal(false);
                                            resetIcon();
                                        }}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={iconProcessing}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {iconProcessing ? 'Uploading...' : 'Add Icon'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Icon Modal */}
            {showEditIconModal && selectedIcon && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-10 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Edit Icon: {selectedIcon.name}
                            </h3>
                            <form onSubmit={handleEditIconSubmit} encType="multipart/form-data">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Icon Name</label>
                                        <input
                                            type="text"
                                            value={editIconData.name}
                                            onChange={(e) => setEditIconData('name', e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            required
                                        />
                                        {editIconErrors.name && <p className="text-red-500 text-xs mt-1">{editIconErrors.name}</p>}
                                    </div>

                                    {/* Current Icon Display */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Icon</label>
                                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                                            <div className="w-12 h-12 flex items-center justify-center bg-white rounded border">
                                                {selectedIcon.svg_content ? (
                                                    <div 
                                                        dangerouslySetInnerHTML={{ __html: selectedIcon.svg_content }}
                                                        className="w-8 h-8"
                                                    />
                                                ) : selectedIcon.icon_url ? (
                                                    <img 
                                                        src={selectedIcon.icon_url} 
                                                        alt={selectedIcon.name}
                                                        className="w-8 h-8 object-contain"
                                                    />
                                                ) : (
                                                    <span className="text-gray-400 text-xs">No Icon</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{selectedIcon.name}</p>
                                                <p className="text-xs text-gray-500 capitalize">{selectedIcon.category.replace('_', ' ')}</p>
                                                <p className="text-xs text-gray-400">
                                                    {selectedIcon.svg_content ? 'SVG Format' : 'Image Format'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Category</label>
                                        <select
                                            value={editIconData.category}
                                            onChange={(e) => setEditIconData('category', e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        >
                                            {categoryOptions.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Replace Icon (Optional)</label>
                                        <input
                                            type="file"
                                            accept=".svg,.png,.jpg,.jpeg"
                                            onChange={(e) => setEditIconData('icon_file', e.target.files[0])}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Upload a new file to replace the current icon. Leave empty to keep current icon.
                                        </p>
                                        {editIconErrors.icon_file && <p className="text-red-500 text-xs mt-1">{editIconErrors.icon_file}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                                        <input
                                            type="text"
                                            value={editIconData.description}
                                            onChange={(e) => setEditIconData('description', e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            placeholder="Brief description of the icon"
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={editIconData.is_active}
                                                onChange={(e) => setEditIconData('is_active', e.target.checked)}
                                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                            />
                                            <span className="ml-2 text-sm font-medium text-gray-700">Active</span>
                                        </label>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Inactive icons won't be available for use in website sections.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-2 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditIconModal(false);
                                            setSelectedIcon(null);
                                            resetEditIcon();
                                        }}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editIconProcessing}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {editIconProcessing ? 'Updating...' : 'Update Icon'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
