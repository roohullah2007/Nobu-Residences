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
    const [showInlineIconModal, setShowInlineIconModal] = useState(false);
    const [inlineIconCategory, setInlineIconCategory] = useState('');
    const [inlineIconIndex, setInlineIconIndex] = useState(null);

    // Helper function to build URL with website slug for preview display
    const buildUrlWithWebsite = (path) => {
        // Only add website parameter for non-default websites (id !== 1)
        if (website?.slug && website?.id !== 1) {
            // Remove any existing website parameter first
            let cleanPath = path;
            if (path.includes('?website=') || path.includes('&website=')) {
                cleanPath = path.replace(/[?&]website=[^&]*/g, '').replace(/\?&/, '?').replace(/\?$/, '');
            }
            const separator = cleanPath.includes('?') ? '&' : '?';
            return `${cleanPath}${separator}website=${website.slug}`;
        }
        return path;
    };

    // Generate default header links with clean URLs (no website slug)
    // The Navbar component dynamically adds the website slug when rendering
    const getDefaultHeaderLinks = () => {
        return [
            { id: 1, text: 'Home', url: '/', enabled: true },
            { id: 2, text: 'Rent', url: '/toronto/for-rent', enabled: true },
            { id: 3, text: 'Sale', url: '/toronto/for-sale', enabled: true },
            { id: 4, text: 'Search All', url: '/search', enabled: true },
            { id: 5, text: 'Blog', url: '/blogs', enabled: true },
            { id: 6, text: 'Contact Us', url: '/contact', enabled: true }
        ];
    };

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
            },
            mls_settings: {
                default_city: 'Toronto',
                default_building_address: '55 Mercer Street'
            },
            header_links: {
                enabled: true,
                links: getDefaultHeaderLinks()
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
            mls_settings: { ...defaults.mls_settings, ...existingContent.mls_settings },
            faq: { ...defaults.faq, ...existingContent.faq },
            footer: { ...defaults.footer, ...existingContent.footer },
            header_links: {
                enabled: existingContent.header_links?.enabled ?? defaults.header_links.enabled,
                links: (existingContent.header_links?.links && existingContent.header_links.links.length > 0)
                    ? existingContent.header_links.links
                    : defaults.header_links.links
            }
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

    const updateAboutTabItem = (tabName, index, field, value) => {
        const tabs = data.content.about?.tabs || {};
        const items = tabs[tabName]?.items || [];
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        
        setData('content', {
            ...data.content,
            about: {
                ...data.content.about,
                tabs: {
                    ...tabs,
                    [tabName]: {
                        ...tabs[tabName],
                        items: newItems
                    }
                }
            }
        });
    };

    const addAboutTabItem = (tabName, defaultItem) => {
        const tabs = data.content.about?.tabs || {};
        const items = tabs[tabName]?.items || [];
        const newItems = [...items, defaultItem];
        
        setData('content', {
            ...data.content,
            about: {
                ...data.content.about,
                tabs: {
                    ...tabs,
                    [tabName]: {
                        ...tabs[tabName],
                        items: newItems
                    }
                }
            }
        });
    };

    const removeAboutTabItem = (tabName, index) => {
        const tabs = data.content.about?.tabs || {};
        const items = tabs[tabName]?.items || [];
        const newItems = items.filter((_, i) => i !== index);
        
        setData('content', {
            ...data.content,
            about: {
                ...data.content.about,
                tabs: {
                    ...tabs,
                    [tabName]: {
                        ...tabs[tabName],
                        items: newItems
                    }
                }
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

    const updateMlsSettings = (field, value) => {
        setData('content', {
            ...data.content,
            mls_settings: {
                ...data.content.mls_settings,
                [field]: value
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
            },
            onError: (errors) => {
                // Handle validation errors without showing SVG content
                console.error('Icon upload failed:', errors);
            },
            preserveScroll: true,
            preserveState: false
        });
    };

    const handleInlineIconSubmit = (e) => {
        e.preventDefault();
        const currentTab = activeTab; // Preserve current tab
        
        // Update the icon data with the correct category before submission
        setIconData('category', inlineIconCategory);
        
        // Submit the form
        postIcon(route('admin.icons.api.store'), {
            forceFormData: true, // Force multipart/form-data for file upload
            onSuccess: (page) => {
                setShowInlineIconModal(false);
                resetIcon();
                // Restore the active tab
                setActiveTab(currentTab);
                // Update the selected icon for the current item  
                if (inlineIconIndex !== null && inlineIconCategory) {
                    const tabName = inlineIconCategory === 'key_facts' ? 'key_facts' : 
                                   inlineIconCategory === 'amenities' ? 'amenities' : 'highlights';
                    // Use the name from the icon data
                    updateAboutTabItem(tabName, inlineIconIndex, 'icon', iconData.name);
                }
            },
            onError: (errors) => {
                // Handle validation errors without showing SVG content
                console.error('Icon upload failed:', errors);
                // Restore the active tab even on error
                setActiveTab(currentTab);
            },
            preserveScroll: true,
            preserveState: true  // Keep the state to preserve tab
        });
    };

    const openInlineIconModal = (category, index) => {
        setInlineIconCategory(category);
        setInlineIconIndex(index);
        setIconData({
            name: '',
            category: category,
            icon_file: null,
        });
        setShowInlineIconModal(true);
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

    const renderIconPreview = (iconName, category) => {
        if (!iconName || !availableIcons?.[category]) {
            return (
                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-gray-400 text-xs">None</span>
                </div>
            );
        }
        
        const icon = availableIcons[category].find(i => i.name === iconName);
        if (!icon) {
            return (
                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-gray-400 text-xs">?</span>
                </div>
            );
        }
        
        if (icon.svg_content) {
            return (
                <div 
                    className="w-10 h-10 p-1"
                    dangerouslySetInnerHTML={{ __html: icon.svg_content }}
                />
            );
        }
        
        if (icon.icon_url) {
            return (
                <img 
                    src={icon.icon_url} 
                    alt={icon.name}
                    className="w-10 h-10 object-contain"
                />
            );
        }
        
        return (
            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-gray-400 text-xs">?</span>
            </div>
        );
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
                                    { id: 'header', name: 'Header Links' },
                                    { id: 'hero', name: 'Hero Section' },
                                    { id: 'about', name: 'About Section' },
                                    { id: 'carousel', name: 'Property Carousels' },
                                    { id: 'mls', name: 'MLS Settings' },
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
                            {/* Header Links Tab */}
                            {activeTab === 'header' && (
                                <div className="space-y-8">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                        <div className="flex items-start space-x-3">
                                            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <div>
                                                <h4 className="text-sm font-medium text-blue-800">Header Navigation Links</h4>
                                                <p className="text-sm text-blue-600 mt-1">
                                                    Customize the navigation links that appear in the website header. You can add, edit, reorder, or disable links.
                                                </p>
                                                {website?.id !== 1 && website?.slug && (
                                                    <p className="text-sm text-blue-700 mt-2 font-medium">
                                                        Website Slug: <code className="bg-blue-100 px-2 py-0.5 rounded">{website.slug}</code>
                                                        <span className="font-normal ml-2">- URLs should include <code className="bg-blue-100 px-1 py-0.5 rounded">?website={website.slug}</code></span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Navigation Links</h3>

                                        <div className="space-y-4">
                                            {(data.content.header_links?.links || []).map((link, index) => (
                                                <div key={link.id || index} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
                                                    <div className="flex-shrink-0">
                                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500 text-sm font-medium">
                                                            {index + 1}
                                                        </span>
                                                    </div>

                                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-500 mb-1">Link Text</label>
                                                            <input
                                                                type="text"
                                                                value={link.text}
                                                                onChange={(e) => {
                                                                    const newLinks = [...data.content.header_links.links];
                                                                    newLinks[index] = { ...newLinks[index], text: e.target.value };
                                                                    setData('content', {
                                                                        ...data.content,
                                                                        header_links: { ...data.content.header_links, links: newLinks }
                                                                    });
                                                                }}
                                                                className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                placeholder="Link text"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-500 mb-1">URL</label>
                                                            <input
                                                                type="text"
                                                                value={link.url}
                                                                onChange={(e) => {
                                                                    const newLinks = [...data.content.header_links.links];
                                                                    newLinks[index] = { ...newLinks[index], url: e.target.value };
                                                                    setData('content', {
                                                                        ...data.content,
                                                                        header_links: { ...data.content.header_links, links: newLinks }
                                                                    });
                                                                }}
                                                                className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                placeholder="/page-url"
                                                            />
                                                            {/* Show preview of final URL with website slug for non-default websites */}
                                                            {website?.id !== 1 && link.url && (
                                                                <p className="mt-1 text-xs text-green-600">
                                                                    Preview: {buildUrlWithWebsite(link.url)}
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="flex items-end gap-2">
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={link.enabled !== false}
                                                                    onChange={(e) => {
                                                                        const newLinks = [...data.content.header_links.links];
                                                                        newLinks[index] = { ...newLinks[index], enabled: e.target.checked };
                                                                        setData('content', {
                                                                            ...data.content,
                                                                            header_links: { ...data.content.header_links, links: newLinks }
                                                                        });
                                                                    }}
                                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                />
                                                                <span className="text-sm text-gray-600">Enabled</span>
                                                            </label>
                                                        </div>
                                                    </div>

                                                    <div className="flex-shrink-0 flex items-center gap-2">
                                                        {index > 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newLinks = [...data.content.header_links.links];
                                                                    [newLinks[index - 1], newLinks[index]] = [newLinks[index], newLinks[index - 1]];
                                                                    setData('content', {
                                                                        ...data.content,
                                                                        header_links: { ...data.content.header_links, links: newLinks }
                                                                    });
                                                                }}
                                                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                                                                title="Move up"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                        {index < (data.content.header_links?.links || []).length - 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newLinks = [...data.content.header_links.links];
                                                                    [newLinks[index], newLinks[index + 1]] = [newLinks[index + 1], newLinks[index]];
                                                                    setData('content', {
                                                                        ...data.content,
                                                                        header_links: { ...data.content.header_links, links: newLinks }
                                                                    });
                                                                }}
                                                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                                                                title="Move down"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newLinks = data.content.header_links.links.filter((_, i) => i !== index);
                                                                setData('content', {
                                                                    ...data.content,
                                                                    header_links: { ...data.content.header_links, links: newLinks }
                                                                });
                                                            }}
                                                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                            title="Remove link"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newLinks = [...(data.content.header_links?.links || [])];
                                                const newId = Math.max(...newLinks.map(l => l.id || 0), 0) + 1;
                                                // Use buildUrlWithWebsite to include website slug for new links
                                                newLinks.push({ id: newId, text: 'New Link', url: buildUrlWithWebsite('/'), enabled: true });
                                                setData('content', {
                                                    ...data.content,
                                                    header_links: { ...data.content.header_links, links: newLinks }
                                                });
                                            }}
                                            className="mt-4 inline-flex items-center px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Add New Link
                                        </button>
                                    </div>
                                </div>
                            )}

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

                            {/* About Section Tab */}
                            {activeTab === 'about' && (
                                <div className="space-y-8">
                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">About Section Content</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Section Title</label>
                                                <input
                                                    type="text"
                                                    value={data.content.about?.title || ''}
                                                    onChange={(e) => updateAboutField('title', e.target.value)}
                                                    className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Learn everything about Nobu Residence"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Overview Tab Content</label>
                                                <textarea
                                                    value={data.content.about?.content || ''}
                                                    onChange={(e) => updateAboutField('content', e.target.value)}
                                                    rows={5}
                                                    className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Found in Toronto's King West area and built in 2024..."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Image Alt Text</label>
                                                <input
                                                    type="text"
                                                    value={data.content.about?.image_alt || ''}
                                                    onChange={(e) => updateAboutField('image_alt', e.target.value)}
                                                    className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Nobu Residence Building"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Key Facts Tab Content */}
                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Facts Tab</h3>
                                        <div className="space-y-4">
                                            {(data.content.about?.tabs?.key_facts?.items || []).map((item, index) => (
                                                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <h4 className="text-sm font-semibold text-gray-800">Key Fact #{index + 1}</h4>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeAboutTabItem('key_facts', index)}
                                                            className="text-red-500 hover:text-red-700 p-1"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">Text</label>
                                                            <input
                                                                type="text"
                                                                value={item.text || ''}
                                                                onChange={(e) => updateAboutTabItem('key_facts', index, 'text', e.target.value)}
                                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                                                placeholder="e.g., 45 floors/ 657 units"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">Icon</label>
                                                            <div className="flex gap-2 items-center">
                                                                {/* Icon Preview */}
                                                                <div className="flex-shrink-0">
                                                                    {renderIconPreview(item.icon, 'key_facts')}
                                                                </div>
                                                                <select
                                                                    value={item.icon || ''}
                                                                    onChange={(e) => updateAboutTabItem('key_facts', index, 'icon', e.target.value)}
                                                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                                                >
                                                                    <option value="">Select icon...</option>
                                                                    {(availableIcons?.key_facts || []).map(icon => (
                                                                        <option key={icon.id} value={icon.name}>{icon.name}</option>
                                                                    ))}
                                                                </select>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openInlineIconModal('key_facts', index)}
                                                                    className="px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 text-sm"
                                                                    title="Upload new icon"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => addAboutTabItem('key_facts', { text: '', icon: '' })}
                                                className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Add Key Fact
                                            </button>
                                        </div>
                                    </div>

                                    {/* Amenities Tab Content */}
                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities Tab</h3>
                                        <div className="space-y-4">
                                            {(data.content.about?.tabs?.amenities?.items || []).map((item, index) => (
                                                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <h4 className="text-sm font-semibold text-gray-800">Amenity #{index + 1}</h4>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeAboutTabItem('amenities', index)}
                                                            className="text-red-500 hover:text-red-700 p-1"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">Text</label>
                                                            <input
                                                                type="text"
                                                                value={item.text || ''}
                                                                onChange={(e) => updateAboutTabItem('amenities', index, 'text', e.target.value)}
                                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                                                placeholder="e.g., Concierge"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">Icon</label>
                                                            <div className="flex gap-2 items-center">
                                                                {/* Icon Preview */}
                                                                <div className="flex-shrink-0">
                                                                    {renderIconPreview(item.icon, 'amenities')}
                                                                </div>
                                                                <select
                                                                    value={item.icon || ''}
                                                                    onChange={(e) => updateAboutTabItem('amenities', index, 'icon', e.target.value)}
                                                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                                                >
                                                                    <option value="">Select icon...</option>
                                                                    {(availableIcons?.amenities || []).map(icon => (
                                                                        <option key={icon.id} value={icon.name}>{icon.name}</option>
                                                                    ))}
                                                                </select>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openInlineIconModal('amenities', index)}
                                                                    className="px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 text-sm"
                                                                    title="Upload new icon"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => addAboutTabItem('amenities', { text: '', icon: '' })}
                                                className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Add Amenity
                                            </button>
                                        </div>
                                    </div>

                                    {/* Highlights Tab Content */}
                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Highlights Tab</h3>
                                        <div className="space-y-4">
                                            {(data.content.about?.tabs?.highlights?.items || []).map((item, index) => (
                                                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <h4 className="text-sm font-semibold text-gray-800">Highlight #{index + 1}</h4>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeAboutTabItem('highlights', index)}
                                                            className="text-red-500 hover:text-red-700 p-1"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">Text</label>
                                                            <textarea
                                                                value={item.text || ''}
                                                                onChange={(e) => updateAboutTabItem('highlights', index, 'text', e.target.value)}
                                                                rows={2}
                                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                                                placeholder="e.g., Located at 15 Mercer St in Toronto's Entertainment District..."
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">Icon</label>
                                                            <div className="flex gap-2 items-center">
                                                                {/* Icon Preview */}
                                                                <div className="flex-shrink-0">
                                                                    {renderIconPreview(item.icon, 'highlights')}
                                                                </div>
                                                                <select
                                                                    value={item.icon || ''}
                                                                    onChange={(e) => updateAboutTabItem('highlights', index, 'icon', e.target.value)}
                                                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                                                >
                                                                    <option value="">Select icon...</option>
                                                                    {(availableIcons?.highlights || []).map(icon => (
                                                                        <option key={icon.id} value={icon.name}>{icon.name}</option>
                                                                    ))}
                                                                </select>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openInlineIconModal('highlights', index)}
                                                                    className="px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 text-sm"
                                                                    title="Upload new icon"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => addAboutTabItem('highlights', { text: '', icon: '' })}
                                                className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Add Highlight
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">About Section Image</label>
                                            <div className="space-y-3">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => setData('about_image', e.target.files[0])}
                                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                />
                                                {data.content.about?.image && (
                                                    <div className="flex items-center space-x-3">
                                                        <img 
                                                            src={data.content.about.image} 
                                                            alt="Current image" 
                                                            className="w-20 h-20 object-cover rounded-lg border"
                                                        />
                                                        <div className="text-sm text-gray-600">
                                                            <p className="font-medium">Current Image:</p>
                                                            <p className="break-all">{data.content.about.image}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                <p className="text-sm text-gray-500">
                                                    Upload a new image for the about section. Recommended size: 800x600px
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Property Carousels Tab */}
                            {activeTab === 'carousel' && (
                                <div className="space-y-8">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-sm text-blue-700">
                                            Configure property carousels that display listings from your MLS feed.
                                        </p>
                                    </div>

                                    {/* For Rent Carousel Settings */}
                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">For Rent Carousel</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="for_rent_enabled"
                                                    checked={data.content.carousel_settings?.for_rent?.enabled || false}
                                                    onChange={(e) => updateCarouselSetting('for_rent', 'enabled', e.target.checked)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <label htmlFor="for_rent_enabled" className="ml-2 text-sm font-medium text-gray-700">
                                                    Enable For Rent Carousel
                                                </label>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Carousel Title</label>
                                                <input
                                                    type="text"
                                                    value={data.content.carousel_settings?.for_rent?.title || ''}
                                                    onChange={(e) => updateCarouselSetting('for_rent', 'title', e.target.value)}
                                                    className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Properties for Rent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Address Filter</label>
                                                <input
                                                    type="text"
                                                    value={data.content.carousel_settings?.for_rent?.address_filter || ''}
                                                    onChange={(e) => updateCarouselSetting('for_rent', 'address_filter', e.target.value)}
                                                    className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Toronto, ON"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Filter properties by address or location</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Property Type</label>
                                                <input
                                                    type="text"
                                                    value={data.content.carousel_settings?.for_rent?.property_subtype || ''}
                                                    onChange={(e) => updateCarouselSetting('for_rent', 'property_subtype', e.target.value)}
                                                    className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Condo"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">e.g., Condo, House, Townhouse</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Properties</label>
                                                <input
                                                    type="number"
                                                    value={data.content.carousel_settings?.for_rent?.limit || 6}
                                                    onChange={(e) => updateCarouselSetting('for_rent', 'limit', parseInt(e.target.value))}
                                                    min="1"
                                                    max="20"
                                                    className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* For Sale Carousel Settings */}
                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">For Sale Carousel</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="for_sale_enabled"
                                                    checked={data.content.carousel_settings?.for_sale?.enabled || false}
                                                    onChange={(e) => updateCarouselSetting('for_sale', 'enabled', e.target.checked)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <label htmlFor="for_sale_enabled" className="ml-2 text-sm font-medium text-gray-700">
                                                    Enable For Sale Carousel
                                                </label>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Carousel Title</label>
                                                <input
                                                    type="text"
                                                    value={data.content.carousel_settings?.for_sale?.title || ''}
                                                    onChange={(e) => updateCarouselSetting('for_sale', 'title', e.target.value)}
                                                    className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Properties for Sale"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Address Filter</label>
                                                <input
                                                    type="text"
                                                    value={data.content.carousel_settings?.for_sale?.address_filter || ''}
                                                    onChange={(e) => updateCarouselSetting('for_sale', 'address_filter', e.target.value)}
                                                    className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Toronto, ON"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Filter properties by address or location</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Property Type</label>
                                                <input
                                                    type="text"
                                                    value={data.content.carousel_settings?.for_sale?.property_subtype || ''}
                                                    onChange={(e) => updateCarouselSetting('for_sale', 'property_subtype', e.target.value)}
                                                    className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Condo"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">e.g., Condo, House, Townhouse</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Properties</label>
                                                <input
                                                    type="number"
                                                    value={data.content.carousel_settings?.for_sale?.limit || 6}
                                                    onChange={(e) => updateCarouselSetting('for_sale', 'limit', parseInt(e.target.value))}
                                                    min="1"
                                                    max="20"
                                                    className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* MLS Settings Tab */}
                            {activeTab === 'mls' && (
                                <div className="space-y-8">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-sm text-blue-700">
                                            Configure default settings for MLS property listings on your website.
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">MLS Default Settings</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Default City</label>
                                                <input
                                                    type="text"
                                                    value={data.content.mls_settings?.default_city || ''}
                                                    onChange={(e) => updateMlsSettings('default_city', e.target.value)}
                                                    className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Toronto"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Default city for MLS property searches</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Default Building Address</label>
                                                <input
                                                    type="text"
                                                    value={data.content.mls_settings?.default_building_address || ''}
                                                    onChange={(e) => updateMlsSettings('default_building_address', e.target.value)}
                                                    className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="55 Mercer Street"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Default building address for homepage property listings (e.g., "15 Mercer Street")</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-yellow-800">Note</h3>
                                                <div className="mt-2 text-sm text-yellow-700">
                                                    <p>These settings will be used as defaults for property searches throughout your website. The building address will be used to find properties in the same building on the homepage.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* FAQ Section Tab */}
                            {activeTab === 'faq' && (
                                <div className="space-y-8">
                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">FAQ Settings</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="faq_enabled"
                                                    checked={data.content.faq?.enabled || false}
                                                    onChange={(e) => updateFaqField('enabled', e.target.checked)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <label htmlFor="faq_enabled" className="ml-2 text-sm font-medium text-gray-700">
                                                    Enable FAQ Section
                                                </label>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Section Title</label>
                                                <input
                                                    type="text"
                                                    value={data.content.faq?.title || ''}
                                                    onChange={(e) => updateFaqField('title', e.target.value)}
                                                    className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Frequently Asked Questions"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900">FAQ Items</h3>
                                        {data.content.faq?.items?.map((item, index) => (
                                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                                <div className="flex items-start justify-between mb-3">
                                                    <h4 className="text-sm font-semibold text-gray-800">FAQ #{index + 1}</h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFaqItem(index)}
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 mb-1">Question</label>
                                                        <input
                                                            type="text"
                                                            value={item.question}
                                                            onChange={(e) => updateFaqItem(index, 'question', e.target.value)}
                                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="Enter question..."
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 mb-1">Answer</label>
                                                        <textarea
                                                            value={item.answer}
                                                            onChange={(e) => updateFaqItem(index, 'answer', e.target.value)}
                                                            rows={3}
                                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="Enter answer..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={addFaqItem}
                                            className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors duration-200"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Add FAQ Item
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Footer Section Tab */}
                            {activeTab === 'footer' && (
                                <div className="space-y-8">
                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Footer Settings</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="footer_enabled"
                                                    checked={data.content.footer?.enabled || false}
                                                    onChange={(e) => updateFooterField('enabled', e.target.checked)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <label htmlFor="footer_enabled" className="ml-2 text-sm font-medium text-gray-700">
                                                    Enable Footer Section
                                                </label>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Footer Heading</label>
                                                <input
                                                    type="text"
                                                    value={data.content.footer?.heading || ''}
                                                    onChange={(e) => updateFooterField('heading', e.target.value)}
                                                    className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Your new home is waiting"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Footer Subheading</label>
                                                <input
                                                    type="text"
                                                    value={data.content.footer?.subheading || ''}
                                                    onChange={(e) => updateFooterField('subheading', e.target.value)}
                                                    className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Apply online in minutes..."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Footer Description</label>
                                                <textarea
                                                    value={data.content.footer?.description || ''}
                                                    onChange={(e) => updateFooterField('description', e.target.value)}
                                                    rows={3}
                                                    className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Experience luxury living..."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Copyright Text</label>
                                                <input
                                                    type="text"
                                                    value={data.content.footer?.copyright_text || ''}
                                                    onChange={(e) => updateFooterField('copyright_text', e.target.value)}
                                                    className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="© 2024 Nobu Residences. All rights reserved."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Footer Logo</label>
                                            <div className="space-y-3">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => setData('footer_logo', e.target.files[0])}
                                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                />
                                                {data.content.footer?.logo_url && (
                                                    <div className="flex items-center space-x-3">
                                                        <img 
                                                            src={data.content.footer.logo_url} 
                                                            alt="Footer logo" 
                                                            className="h-12 object-contain"
                                                        />
                                                        <div className="text-sm text-gray-600">
                                                            <p className="font-medium">Current Logo</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Footer Background Image</label>
                                            <div className="space-y-3">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => setData('footer_background_image', e.target.files[0])}
                                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                />
                                                {data.content.footer?.background_image && (
                                                    <div className="flex items-center space-x-3">
                                                        <img 
                                                            src={data.content.footer.background_image} 
                                                            alt="Footer background" 
                                                            className="w-20 h-20 object-cover rounded-lg border"
                                                        />
                                                        <div className="text-sm text-gray-600">
                                                            <p className="font-medium">Current Background</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
                                        {data.content.footer?.quick_links?.map((link, index) => (
                                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
                                                <div className="flex items-start justify-between mb-3">
                                                    <h4 className="text-sm font-semibold text-gray-800">Link #{index + 1}</h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFooterQuickLink(index)}
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 mb-1">Link Text</label>
                                                        <input
                                                            type="text"
                                                            value={link.text}
                                                            onChange={(e) => updateFooterQuickLink(index, 'text', e.target.value)}
                                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                                            placeholder="Link text"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 mb-1">Link URL</label>
                                                        <input
                                                            type="text"
                                                            value={link.url}
                                                            onChange={(e) => updateFooterQuickLink(index, 'url', e.target.value)}
                                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                                            placeholder="/page-url"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={addFooterQuickLink}
                                            className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Add Quick Link
                                        </button>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Links</h3>
                                        {data.content.footer?.additional_links?.map((link, index) => (
                                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
                                                <div className="flex items-start justify-between mb-3">
                                                    <h4 className="text-sm font-semibold text-gray-800">Link #{index + 1}</h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFooterAdditionalLink(index)}
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 mb-1">Link Text</label>
                                                        <input
                                                            type="text"
                                                            value={link.text}
                                                            onChange={(e) => updateFooterAdditionalLink(index, 'text', e.target.value)}
                                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                                            placeholder="Link text"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 mb-1">Link URL</label>
                                                        <input
                                                            type="text"
                                                            value={link.url}
                                                            onChange={(e) => updateFooterAdditionalLink(index, 'url', e.target.value)}
                                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                                            placeholder="/page-url"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={addFooterAdditionalLink}
                                            className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Add Additional Link
                                        </button>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="use_global_contact"
                                                    checked={data.content.footer?.contact_info?.use_global_contact || false}
                                                    onChange={(e) => setData('content', {
                                                        ...data.content,
                                                        footer: {
                                                            ...data.content.footer,
                                                            contact_info: {
                                                                ...data.content.footer?.contact_info,
                                                                use_global_contact: e.target.checked
                                                            }
                                                        }
                                                    })}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <label htmlFor="use_global_contact" className="ml-2 text-sm font-medium text-gray-700">
                                                    Use global contact information
                                                </label>
                                            </div>
                                            <p className="text-xs text-gray-500">When enabled, uses contact information from website settings</p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="use_global_social"
                                                    checked={data.content.footer?.social_media?.use_global_social || false}
                                                    onChange={(e) => setData('content', {
                                                        ...data.content,
                                                        footer: {
                                                            ...data.content.footer,
                                                            social_media: {
                                                                ...data.content.footer?.social_media,
                                                                use_global_social: e.target.checked
                                                            }
                                                        }
                                                    })}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <label htmlFor="use_global_social" className="ml-2 text-sm font-medium text-gray-700">
                                                    Use global social media links
                                                </label>
                                            </div>
                                            <p className="text-xs text-gray-500">When enabled, uses social media links from website settings</p>
                                        </div>
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

            {/* Inline Icon Upload Modal for About Section */}
            {showInlineIconModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Upload New {categoryOptions.find(c => c.value === inlineIconCategory)?.label} Icon
                            </h3>
                            <form onSubmit={handleInlineIconSubmit} encType="multipart/form-data">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Icon Name</label>
                                        <input
                                            type="text"
                                            value={iconData.name}
                                            onChange={(e) => setIconData('name', e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            placeholder="e.g., building, calendar, location"
                                            required
                                        />
                                        {iconErrors.name && <p className="text-red-500 text-xs mt-1">{iconErrors.name}</p>}
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
                                            Supported formats: SVG (preferred), PNG, JPG (max 2MB)
                                        </p>
                                        {iconErrors.icon_file && <p className="text-red-500 text-xs mt-1">{iconErrors.icon_file}</p>}
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-2 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowInlineIconModal(false);
                                            setInlineIconCategory('');
                                            setInlineIconIndex(null);
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
                                        {iconProcessing ? 'Uploading...' : 'Upload Icon'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

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
