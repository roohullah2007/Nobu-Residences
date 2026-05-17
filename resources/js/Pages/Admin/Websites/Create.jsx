import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useMemo, useState } from 'react';

// Force white backgrounds on all form controls (override TextInput's dark: classes)
const lightFormClass =
    '[&_input]:!bg-white [&_input]:!text-gray-900 ' +
    '[&_textarea]:!bg-white [&_textarea]:!text-gray-900 ' +
    '[&_select]:!bg-white [&_select]:!text-gray-900';

export default function Create({ auth, buildings = [], defaultAgent = null, defaultBranding = null, ploiEnabled = false }) {
    // Step 1 = pick building, Step 2 = fill out website form
    const [step, setStep] = useState(1);
    const [buildingSearch, setBuildingSearch] = useState('');
    const [selectedBuildingId, setSelectedBuildingId] = useState('');
    const [aiSeoLoading, setAiSeoLoading] = useState(false);
    const [aiSeoError, setAiSeoError] = useState('');

    const { data, setData, processing, errors } = useForm({
        building_id: '',
        name: '',
        slug: '',
        domain: '',
        is_default: false,
        is_active: true,
        // Homepage settings
        use_building_as_homepage: true,
        homepage_building_id: '',
        // File uploads
        logo_file: null,
        favicon_file: null,
        agent_profile_image: null,
        // Text URLs (fallback if no file uploaded)
        logo_url: defaultBranding?.logo_url || '',
        favicon_url: defaultBranding?.favicon_url || '',
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        description: '',
        timezone: 'America/Toronto',
        // Core brand colors
        'brand_colors.primary': '#912018',
        'brand_colors.secondary': '#293056',
        'brand_colors.accent': '#F5F8FF',
        'brand_colors.text': '#000000',
        'brand_colors.background': '#FFFFFF',
        // Button colors - Primary (Blue buttons - Available Building, Sign Up/Log In)
        'brand_colors.button_primary_bg': '#293056',
        'brand_colors.button_primary_text': '#FFFFFF',
        // Button colors - Secondary (Red/Brown buttons - Contact Agent, Show All Listings)
        'brand_colors.button_secondary_bg': '#912018',
        'brand_colors.button_secondary_text': '#FFFFFF',
        // Button colors - Tertiary (Black buttons - Request Building Tour)
        'brand_colors.button_tertiary_bg': '#000000',
        'brand_colors.button_tertiary_text': '#FFFFFF',
        // Button colors - Quaternary (White/Light buttons - outline)
        'brand_colors.button_quaternary_bg': '#FFFFFF',
        'brand_colors.button_quaternary_text': '#293056',
        // Footer colors
        'brand_colors.footer_bg': '#1a1a2e',
        'brand_colors.footer_text': '#FFFFFF',
        // Link colors
        'brand_colors.link_color': '#912018',
        'brand_colors.link_hover': '#6d1812',
        // Contact info
        'contact_info.phone': '',
        'contact_info.email': '',
        'contact_info.address': '',
        // Agent info (separate table) — pre-filled with default property manager
        agent_name: defaultAgent?.agent_name || 'Jatin Gill',
        agent_title: defaultAgent?.agent_title || 'Property Manager',
        agent_phone: defaultAgent?.agent_phone || '647-490-1532',
        brokerage: defaultAgent?.brokerage || 'Property.ca Inc, Brokerage',
        // Social media
        'social_media.facebook': '',
        'social_media.instagram': '',
        'social_media.twitter': '',
        'social_media.linkedin': '',
    });

    const [logoPreview, setLogoPreview] = useState(defaultBranding?.logo_url || '');
    const [faviconPreview, setFaviconPreview] = useState(defaultBranding?.favicon_url || '');
    const [agentPhotoPreview, setAgentPhotoPreview] = useState(defaultAgent?.profile_image || '');

    const filteredBuildings = useMemo(() => {
        const q = buildingSearch.trim().toLowerCase();
        if (!q) return buildings;
        return buildings.filter((b) =>
            (b.name || '').toLowerCase().includes(q) ||
            (b.address || '').toLowerCase().includes(q) ||
            (b.city || '').toLowerCase().includes(q)
        );
    }, [buildings, buildingSearch]);

    const applyBuildingDefaults = (building) => {
        if (!building) return;

        // Building agent if any, otherwise keep the Jatin Gill default already in state
        const fallbackAgent = {
            name: defaultAgent?.agent_name || 'Jatin Gill',
            title: defaultAgent?.agent_title || 'Property Manager',
            phone: defaultAgent?.agent_phone || '647-490-1532',
            brokerage: defaultAgent?.brokerage || 'Property.ca Inc, Brokerage',
            image: defaultAgent?.profile_image || '',
        };

        setData((prev) => ({
            ...prev,
            building_id: building.id,
            homepage_building_id: building.id,
            use_building_as_homepage: true,
            name: building.name || prev.name,
            meta_title: building.name ? `${building.name} - Official Site` : prev.meta_title,
            meta_description: building.description || prev.meta_description,
            'contact_info.address': building.address || prev['contact_info.address'],
            'contact_info.phone': building.agent_phone || prev['contact_info.phone'] || fallbackAgent.phone,
            'contact_info.email': building.agent_email || prev['contact_info.email'],
            agent_name: building.agent_name || fallbackAgent.name,
            agent_title: building.agent_title || fallbackAgent.title,
            agent_phone: building.agent_phone || fallbackAgent.phone,
            brokerage: building.agent_brokerage || fallbackAgent.brokerage,
            // Keep the Nobu logo as the default — building.main_image is an exterior photo, not a logo
        }));

        setAgentPhotoPreview(building.agent_image || fallbackAgent.image || '');
    };

    const generateSeoWithAi = async () => {
        setAiSeoLoading(true);
        setAiSeoError('');
        try {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const res = await fetch(route('admin.websites.ai-generate-seo'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf,
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    name: data.name,
                    building_id: data.building_id || null,
                }),
            });
            if (!res.ok) throw new Error(`Server returned ${res.status}`);
            const json = await res.json();
            setData((prev) => ({
                ...prev,
                meta_title: json.title || prev.meta_title,
                meta_description: json.description || prev.meta_description,
                meta_keywords: json.keywords || prev.meta_keywords,
            }));
        } catch (err) {
            setAiSeoError(err.message || 'AI generation failed');
        } finally {
            setAiSeoLoading(false);
        }
    };

    const chooseBuilding = (building) => {
        setSelectedBuildingId(building.id);
        applyBuildingDefaults(building);
        setStep(2);
    };

    const submit = (e) => {
        e.preventDefault();
        router.post(route('admin.websites.store'), data, {
            forceFormData: true,
            preserveScroll: true,
            onError: (errs) => console.error('Form errors:', errs),
        });
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setData('logo_file', file);
        const reader = new FileReader();
        reader.onload = (ev) => setLogoPreview(ev.target.result);
        reader.readAsDataURL(file);
    };

    const handleFaviconUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setData('favicon_file', file);
        const reader = new FileReader();
        reader.onload = (ev) => setFaviconPreview(ev.target.result);
        reader.readAsDataURL(file);
    };

    const handleAgentPhotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setData('agent_profile_image', file);
        const reader = new FileReader();
        reader.onload = (ev) => setAgentPhotoPreview(ev.target.result);
        reader.readAsDataURL(file);
    };

    return (
        <AdminLayout title="Create New Website">
            <Head title="Create New Website" />

            <div className={`space-y-8 ${lightFormClass}`}>
                {/* Stepper */}
                <div className="bg-white shadow-sm sm:rounded-lg p-4 flex items-center gap-4">
                    <div className={`flex items-center gap-2 ${step === 1 ? 'text-indigo-700 font-semibold' : 'text-gray-500'}`}>
                        <span className={`h-7 w-7 rounded-full flex items-center justify-center text-sm ${step === 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>1</span>
                        Select Building
                    </div>
                    <span className="text-gray-300">/</span>
                    <div className={`flex items-center gap-2 ${step === 2 ? 'text-indigo-700 font-semibold' : 'text-gray-500'}`}>
                        <span className={`h-7 w-7 rounded-full flex items-center justify-center text-sm ${step === 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>2</span>
                        Website Details {ploiEnabled ? <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Ploi auto-alias</span> : null}
                    </div>
                </div>

                {step === 1 && (
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4 gap-4">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Select a Building</h3>
                                    <p className="text-sm text-gray-500 mt-1">Pick the building this website will represent — we'll auto-fill the basics from its data.</p>
                                </div>
                                <Link
                                    href={route('admin.buildings.create')}
                                    className="inline-flex items-center px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md shadow-sm"
                                >
                                    + Create New Building
                                </Link>
                            </div>

                            <div className="mb-4">
                                <TextInput
                                    type="text"
                                    value={buildingSearch}
                                    onChange={(e) => setBuildingSearch(e.target.value)}
                                    placeholder="Search by name, address, or city..."
                                    className="block w-full"
                                />
                            </div>

                            {filteredBuildings.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                                    <p className="text-gray-500">No buildings found.</p>
                                    <Link
                                        href={route('admin.buildings.create')}
                                        className="mt-3 inline-flex items-center px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md"
                                    >
                                        Create your first building
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-1">
                                    {filteredBuildings.map((b) => (
                                        <button
                                            type="button"
                                            key={b.id}
                                            onClick={() => chooseBuilding(b)}
                                            className={`text-left border rounded-lg p-4 hover:border-indigo-500 hover:shadow transition-all flex gap-3 items-start ${selectedBuildingId === b.id ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-gray-200'}`}
                                        >
                                            {b.main_image ? (
                                                <img src={b.main_image} alt={b.name} className="h-16 w-16 rounded object-cover flex-shrink-0" />
                                            ) : (
                                                <div className="h-16 w-16 rounded bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                                                    <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21h18M5 21V7l7-4 7 4v14M9 9h2m-2 4h2m4-4h2m-2 4h2" /></svg>
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <div className="font-medium text-gray-900 truncate">{b.name}</div>
                                                <div className="text-sm text-gray-500 truncate">{b.address || b.city || '—'}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {step === 2 && (() => {
                    const chosenBuilding = buildings.find((b) => b.id === selectedBuildingId);
                    return (
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {/* Selected Building (locked) */}
                            {chosenBuilding && (
                                <div className="mb-6 border border-indigo-200 bg-indigo-50/40 rounded-lg p-4 flex items-center gap-4">
                                    {chosenBuilding.main_image ? (
                                        <img
                                            src={chosenBuilding.main_image}
                                            alt={chosenBuilding.name}
                                            className="h-16 w-16 rounded object-cover flex-shrink-0 opacity-90"
                                        />
                                    ) : (
                                        <div className="h-16 w-16 rounded bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                                            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21h18M5 21V7l7-4 7 4v14M9 9h2m-2 4h2m4-4h2m-2 4h2" /></svg>
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs uppercase font-semibold tracking-wide text-indigo-700">Selected Building</span>
                                            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0-1.105.895-2 2-2s2 .895 2 2v2H8v-2c0-1.105.895-2 2-2zM5 13h14v8H5v-8z" /></svg>
                                                Locked
                                            </span>
                                        </div>
                                        <div className="font-medium text-gray-900 truncate">{chosenBuilding.name}</div>
                                        <div className="text-sm text-gray-500 truncate">{chosenBuilding.address || chosenBuilding.city || '—'}</div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium whitespace-nowrap"
                                    >
                                        Change building
                                    </button>
                                </div>
                            )}

                            <div className="mb-4">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-sm text-indigo-600 hover:text-indigo-800"
                                >
                                    ← Back to building selection
                                </button>
                            </div>

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
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="e.g., Luxury Downtown Condos"
                                            />
                                            <InputError message={errors.name} className="mt-2" />
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
                                            {ploiEnabled && (
                                                <p className="mt-1 text-xs text-green-700">
                                                    This domain will be added to Ploi as a site alias automatically.
                                                </p>
                                            )}
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

                                </div>

                                {/* Logo & Branding */}
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Logo & Branding</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                                {/* Brand Colors — Core / Button / Footer / Link with live previews (mirrors Edit page) */}
                                <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                                    <h3 className="text-lg font-medium text-gray-900">Brand Colors</h3>

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
                                                        <div className="mt-1 text-xs text-gray-500 text-center">{data[color.key]}</div>
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
                                                        <div className="mt-1 text-xs text-gray-500 text-center">{data[color.key]}</div>
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-1">{color.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                        {/* Button preview */}
                                        <div className="mt-4 flex flex-wrap gap-3">
                                            <button type="button" className="px-5 py-2 rounded-lg font-medium transition-opacity hover:opacity-80 text-sm" style={{ backgroundColor: data['brand_colors.button_primary_bg'], color: data['brand_colors.button_primary_text'] }}>Available Building</button>
                                            <button type="button" className="px-5 py-2 rounded-lg font-medium transition-opacity hover:opacity-80 text-sm" style={{ backgroundColor: data['brand_colors.button_secondary_bg'], color: data['brand_colors.button_secondary_text'] }}>Contact Agent</button>
                                            <button type="button" className="px-5 py-2 rounded-lg font-medium transition-opacity hover:opacity-80 text-sm" style={{ backgroundColor: data['brand_colors.button_tertiary_bg'], color: data['brand_colors.button_tertiary_text'] }}>Request Tour</button>
                                            <button type="button" className="px-5 py-2 rounded-lg font-medium transition-opacity hover:opacity-80 text-sm border" style={{ backgroundColor: data['brand_colors.button_quaternary_bg'], color: data['brand_colors.button_quaternary_text'], borderColor: data['brand_colors.button_quaternary_text'] }}>View Details</button>
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
                                                        <div className="mt-1 text-xs text-gray-500 text-center">{data[color.key]}</div>
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-1">{color.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                        {/* Footer preview */}
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
                                                        <div className="mt-1 text-xs text-gray-500 text-center">{data[color.key]}</div>
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-1">{color.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                        {/* Link preview */}
                                        <div className="mt-4">
                                            <span className="mr-2">Preview:</span>
                                            <a
                                                href="#"
                                                onClick={(e) => e.preventDefault()}
                                                className="underline transition-colors"
                                                style={{ color: data['brand_colors.link_color'] }}
                                                onMouseEnter={(e) => (e.target.style.color = data['brand_colors.link_hover'])}
                                                onMouseLeave={(e) => (e.target.style.color = data['brand_colors.link_color'])}
                                            >
                                                Sample Link (hover me)
                                            </a>
                                        </div>
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
                                    <div className="flex items-center justify-between mb-4 gap-4">
                                        <h3 className="text-lg font-medium text-gray-900">SEO Settings</h3>
                                        <button
                                            type="button"
                                            onClick={generateSeoWithAi}
                                            disabled={aiSeoLoading}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60"
                                        >
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                            {aiSeoLoading ? 'Generating…' : 'Generate with AI'}
                                        </button>
                                    </div>
                                    {aiSeoError && (
                                        <p className="text-sm text-red-600 mb-2">{aiSeoError}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mb-4">
                                        Click "Generate with AI" to auto-fill these fields based on the selected building.
                                    </p>
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
                                            <p className="mt-1 text-xs text-gray-500">Recommended: 50-60 characters</p>
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
                                            <p className="mt-1 text-xs text-gray-500">Recommended: 150-160 characters</p>
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
                                            <p className="mt-1 text-xs text-gray-500">Separate keywords with commas</p>
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
                    );
                })()}
            </div>
        </AdminLayout>
    );
}
