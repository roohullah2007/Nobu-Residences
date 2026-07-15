import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { useEffect, useMemo, useRef, useState } from 'react';
import extractLogoColors from '@/lib/extractLogoColors';

// Same brand-color palette + defaults the Edit page uses, so a new site
// starts from an editable full palette here instead of only inheriting one.
// A logo upload auto-fills these; each stays editable before Create.
const DEFAULT_BRAND_COLORS = {
    'brand_colors.primary': '#912018',
    'brand_colors.accent': '#F5F8FF',
    'brand_colors.text': '#000000',
    'brand_colors.background': '#FFFFFF',
    'brand_colors.button_primary_bg': '#293056',
    'brand_colors.button_primary_text': '#FFFFFF',
    'brand_colors.button_secondary_bg': '#912018',
    'brand_colors.button_secondary_text': '#FFFFFF',
    'brand_colors.button_tertiary_bg': '#000000',
    'brand_colors.button_tertiary_text': '#FFFFFF',
    'brand_colors.button_quaternary_bg': '#FFFFFF',
    'brand_colors.button_quaternary_text': '#293056',
    'brand_colors.footer_bg': '#1a1a2e',
    'brand_colors.footer_text': '#FFFFFF',
    'brand_colors.link_color': '#912018',
    'brand_colors.link_hover': '#6d1812',
};

// Force white backgrounds AND one consistent border + font size on all form
// controls. TextInput bakes in dark: classes, so without the border override
// text inputs get darker borders than inline-styled controls in a dark-mode
// browser; text-sm matches the Edit page.
const lightFormClass =
    '[&_input]:!bg-white [&_input]:!text-gray-900 [&_input]:!border-gray-300 [&_input]:!text-sm ' +
    '[&_textarea]:!bg-white [&_textarea]:!text-gray-900 [&_textarea]:!border-gray-300 [&_textarea]:!text-sm ' +
    '[&_select]:!bg-white [&_select]:!text-gray-900 [&_select]:!border-gray-300 [&_select]:!text-sm';

// Building thumbnail with a graceful fallback: if the image URL 404s or
// fails to load, swap to the same placeholder used when no image is set.
function BuildingThumb({ src, alt, className = '' }) {
    const [hasFailed, setHasFailed] = useState(false);

    if (!src || hasFailed) {
        return (
            <div className="h-16 w-16 rounded bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21h18M5 21V7l7-4 7 4v14M9 9h2m-2 4h2m4-4h2m-2 4h2" /></svg>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            onError={() => setHasFailed(true)}
            className={`h-16 w-16 rounded object-cover flex-shrink-0 ${className}`}
        />
    );
}

// Small clipboard button used in the DNS instruction block. Shows a brief
// "copied" check after clicking.
function CopyButton({ value, label = 'Copy' }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
        } catch {
            // Fallback for non-secure contexts
            const ta = document.createElement('textarea');
            ta.value = value;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };
    return (
        <button
            type="button"
            onClick={copy}
            title={`${label}: ${value}`}
            className="inline-flex items-center justify-center h-6 w-6 rounded-md border border-gray-200 bg-white text-gray-500 hover:text-gray-800 hover:border-gray-300 transition-colors flex-shrink-0"
        >
            {copied ? (
                <svg className="h-3.5 w-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
            ) : (
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            )}
        </button>
    );
}

// One-click creation: pick a building, optionally type a domain, hit Create.
// Branding, contact info, agent and fonts inherit server-side from the
// default website / the building; SEO + homepage copy are written by AI in
// a background job after creation. Everything stays editable on the Edit
// pages afterwards.
export default function Create({ auth, buildings = [], buildingIdsWithWebsite = [], cloudflareEnabled = false, cnameTarget = '', preselectedBuildingId = null }) {
    const [buildingSearch, setBuildingSearch] = useState('');
    const confirmPanelRef = useRef(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [detectingColors, setDetectingColors] = useState(false);
    const [colorsDetected, setColorsDetected] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [logoError, setLogoError] = useState('');
    const [faviconPreview, setFaviconPreview] = useState(null);
    // Only send branding (logo + brand_colors) when it was actually engaged —
    // i.e. the picked building has a logo we detected colors from, the admin
    // uploaded a logo, or a swatch was edited. Left untouched, we strip these
    // so the server keeps inheriting the default site's palette + logo.
    const [brandingTouched, setBrandingTouched] = useState(false);

    const { data, setData, post, processing, errors, setError, clearErrors, transform } = useForm({
        building_id: '',
        homepage_building_id: '',
        name: '',
        domain: '',
        is_default: false,
        is_active: true,
        // The building's logo drives the website theme. Both fields are set to
        // the same URL (the site renders whichever it reads).
        logo: '',
        logo_url: '',
        // Favicon: by default the site logo is auto-converted into the browser
        // tab icon server-side. Uploading a file here overrides that.
        favicon_from_logo: true,
        favicon_file: null,
        ...DEFAULT_BRAND_COLORS,
    });

    const setColor = (key, value) => {
        setBrandingTouched(true);
        setData(key, value);
    };

    // Run the in-browser palette detection on a logo (File or URL) and fill
    // the color pickers. Everything stays editable afterwards.
    const detectColorsFrom = async (source) => {
        setColorsDetected(false);
        setDetectingColors(true);
        try {
            const palette = await extractLogoColors(source);
            if (palette) {
                setData((prev) => ({ ...prev, ...palette }));
                setColorsDetected(true);
            }
        } finally {
            setDetectingColors(false);
        }
    };

    // Manual upload / replace of the building logo. Uploads to the building
    // (image_type=logo) so the logo is saved on the building itself, then
    // points the new website at that URL and re-detects the theme.
    const onLogoUpload = async (file) => {
        if (!file) return;
        setLogoError('');
        if (file.size > 2 * 1024 * 1024) {
            setLogoError('Logo must be under 2MB.');
            return;
        }
        setBrandingTouched(true);

        // Instant local preview + detection while the upload is in flight.
        const reader = new FileReader();
        reader.onload = (e) => setLogoPreview(e.target.result);
        reader.readAsDataURL(file);
        detectColorsFrom(file);

        setUploadingLogo(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('image_type', 'logo');
            if (data.building_id) formData.append('building_id', data.building_id);
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/api/buildings/upload-image', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken || '',
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
                body: formData,
            });
            const result = await res.json();
            if (result.success && result.url) {
                setData((prev) => ({ ...prev, logo: result.url, logo_url: result.url }));
            } else {
                setLogoError(result.message || 'Logo upload failed.');
            }
        } catch {
            setLogoError('Logo upload failed. Please try again.');
        } finally {
            setUploadingLogo(false);
        }
    };

    const hasWebsite = useMemo(
        () => new Set((buildingIdsWithWebsite || []).map(String)),
        [buildingIdsWithWebsite]
    );

    const filteredBuildings = useMemo(() => {
        const q = buildingSearch.trim().toLowerCase();
        if (!q) return buildings;
        return buildings.filter((b) =>
            (b.name || '').toLowerCase().includes(q) ||
            (b.address || '').toLowerCase().includes(q) ||
            (b.city || '').toLowerCase().includes(q)
        );
    }, [buildings, buildingSearch]);

    const selectedBuilding = useMemo(
        () => buildings.find((b) => b.id === data.building_id) || null,
        [buildings, data.building_id]
    );

    const chooseBuilding = (building) => {
        clearErrors();
        setLogoError('');
        const hasLogo = Boolean(building.logo);
        // Palette pre-detected server-side when the logo was scraped (dotted
        // brand_colors.* keys). Present → seed the pickers instantly; absent
        // (e.g. an SVG logo, or a manually-uploaded one) → detect in-browser.
        const storedColors =
            building.brand_colors && typeof building.brand_colors === 'object' && Object.keys(building.brand_colors).length
                ? building.brand_colors
                : null;
        setData((prev) => ({
            ...prev,
            building_id: building.id,
            homepage_building_id: building.id,
            // Editable in the confirm panel; a second site for the same
            // building just needs a different name (slug auto-suffixes).
            name: building.name || '',
            // Point the site at the building's own logo. When the building has
            // none, clear it and reset colors so the server-side inheritance
            // (default site logo + palette) takes over instead.
            logo: hasLogo ? building.logo : '',
            logo_url: hasLogo ? building.logo : '',
            ...(hasLogo ? (storedColors || {}) : DEFAULT_BRAND_COLORS),
        }));

        if (hasLogo) {
            // The building's logo IS the brand source.
            setLogoPreview(building.logo);
            setBrandingTouched(true);
            if (storedColors) {
                // Colors already detected server-side — no re-detection needed.
                setColorsDetected(true);
                setDetectingColors(false);
            } else {
                detectColorsFrom(building.logo);
            }
        } else {
            setLogoPreview(null);
            setColorsDetected(false);
            setBrandingTouched(false);
        }
    };

    // Scroll the confirm panel into view once a building is picked so the
    // Create button is never off-screen on long building lists.
    useEffect(() => {
        if (data.building_id && confirmPanelRef.current) {
            confirmPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [data.building_id]);

    // "Launch Website" shortcut (?building_id=... from the Building edit
    // page): preselect that building so only Create is left to click.
    useEffect(() => {
        if (!preselectedBuildingId) return;
        const building = buildings.find((b) => String(b.id) === String(preselectedBuildingId));
        if (building) {
            chooseBuilding(building);
        }
    }, []);

    const submit = (e) => {
        e.preventDefault();
        clearErrors();
        if (!data.name.trim()) {
            setError('name', 'Website name is required.');
            document.getElementById('name')?.focus();
            return;
        }
        // useForm's post() (not router.post) so server validation errors
        // populate `errors` and render under each field via InputError.
        // Strip the branding fields the admin never touched so the server
        // keeps inheriting the default site's logo + palette. When branding
        // WAS engaged (building logo, upload, or a swatch edit), send the
        // logo URL and the full brand_colors palette.
        transform((formData) => {
            if (brandingTouched) return formData;
            // No branding engaged → also drop favicon so the site inherits the
            // default favicon instead of auto-generating from a logo it lacks.
            const cleaned = { ...formData, logo: '', logo_url: '', favicon_from_logo: false, favicon_file: null };
            Object.keys(cleaned).forEach((k) => {
                if (k.startsWith('brand_colors.')) delete cleaned[k];
            });
            return cleaned;
        });

        post(route('admin.websites.store'), {
            preserveScroll: true,
        });
    };

    // DNS instruction block: with Cloudflare Custom Hostnames the customer
    // creates exactly ONE CNAME record pointing at the SaaS target.
    const typedDomain = String(data.domain || '').trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
    const apexDomain = typedDomain.replace(/^www\./i, '');

    return (
        <AdminLayout title="Create New Website">
            <Head title="Create New Website" />

            <div className={`max-w-5xl mx-auto space-y-6 ${lightFormClass}`}>
                {/* Page header */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Create New Website</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Pick a building and click Create — branding and contact details are inherited,
                                and AI writes the homepage copy and SEO from the building's data.
                            </p>
                        </div>
                        {cloudflareEnabled && (
                            <span className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                Auto domain + SSL via Cloudflare
                            </span>
                        )}
                    </div>
                </div>

                {/* Building picker */}
                <div className="bg-white overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
                    <div className="p-6">
                        <div className="flex items-start justify-between mb-4 gap-4">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Select a Building</h3>
                                <p className="text-sm text-gray-500 mt-1">The website is generated from this building's data — name, facts, amenities, agent and photos.</p>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[55vh] overflow-y-auto pr-1">
                                {filteredBuildings.map((b) => (
                                    <button
                                        type="button"
                                        key={b.id}
                                        onClick={() => chooseBuilding(b)}
                                        className={`relative text-left border rounded-lg p-4 hover:border-indigo-500 hover:shadow transition-all flex gap-3 items-start ${data.building_id === b.id ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-gray-200'}`}
                                    >
                                        {hasWebsite.has(String(b.id)) && (
                                            <span className="absolute top-2 right-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800" title="This building already has a website — you can still create another one.">
                                                Has a website
                                            </span>
                                        )}
                                        <BuildingThumb src={b.main_image} alt={b.name} />
                                        <div className="min-w-0">
                                            <div className="font-medium text-gray-900 truncate pr-16" title={b.name}>{b.name}</div>
                                            <div className="text-sm text-gray-500 truncate" title={b.address || b.city || ''}>{b.address || b.city || '—'}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                        <InputError message={errors.building_id || errors.homepage_building_id} className="mt-2" />
                    </div>
                </div>

                {/* Confirm panel — appears once a building is selected */}
                {selectedBuilding && (
                    <form onSubmit={submit} ref={confirmPanelRef}>
                        <div className="bg-white overflow-hidden rounded-2xl border border-indigo-200 shadow-sm">
                            <div className="p-6 space-y-5">
                                <div className="flex items-center gap-4 border border-indigo-200 bg-indigo-50/40 rounded-lg p-4">
                                    <BuildingThumb src={selectedBuilding.main_image} alt={selectedBuilding.name} className="opacity-90" />
                                    <div className="min-w-0 flex-1">
                                        <span className="text-xs uppercase font-semibold tracking-wide text-indigo-700">Selected Building</span>
                                        <div className="font-medium text-gray-900 truncate" title={selectedBuilding.name}>{selectedBuilding.name}</div>
                                        <div className="text-sm text-gray-500 truncate" title={selectedBuilding.address || selectedBuilding.city || ''}>{selectedBuilding.address || selectedBuilding.city || '—'}</div>
                                    </div>
                                    <span className="text-xs text-gray-400 whitespace-nowrap hidden sm:inline">Click another card to change</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="name" value="Website Name" />
                                        <TextInput
                                            id="name"
                                            type="text"
                                            name="name"
                                            value={data.name}
                                            className={`mt-1 block w-full ${errors.name ? '!ring-2 !ring-red-500 !border-red-500' : ''}`}
                                            required
                                            aria-invalid={Boolean(errors.name)}
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
                                            placeholder="e.g., luxurycondos.com — can be added later"
                                        />
                                        <InputError message={errors.domain} className="mt-2" />
                                        {cloudflareEnabled && !typedDomain && (
                                            <p className="mt-1 text-xs text-green-700">
                                                A domain typed here is registered on Cloudflare automatically — SSL activates as soon as the customer creates one CNAME record.
                                            </p>
                                        )}
                                        {!cloudflareEnabled && data.domain && (
                                            <div className="mt-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
                                                <p className="font-semibold">Automatic domain connection is currently OFF.</p>
                                                <p className="mt-1">
                                                    The site will be saved, but this domain will not be registered on Cloudflare automatically.
                                                    To enable it, set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID in the server's .env,
                                                    then use "Retry" on the website's status page.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* DNS setup instructions — appears once a domain is typed */}
                                {typedDomain && (
                                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 sm:p-5">
                                        <div className="flex items-start gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
                                                <svg className="h-4.5 w-4.5" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="text-sm font-semibold text-gray-900">
                                                    One CNAME record makes <code className="font-mono">{apexDomain}</code> live
                                                </h4>
                                                <p className="mt-0.5 text-xs text-gray-600">
                                                    The customer adds this single record at their DNS provider — Cloudflare then
                                                    validates the domain and issues SSL automatically.
                                                </p>

                                                <div className="mt-3 overflow-x-auto">
                                                    <table className="w-full text-xs border-separate border-spacing-0">
                                                        <thead>
                                                            <tr className="text-left text-gray-500">
                                                                <th className="font-medium pb-1.5 pr-4">Type</th>
                                                                <th className="font-medium pb-1.5 pr-4">Host / Name</th>
                                                                <th className="font-medium pb-1.5">Value</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="font-mono text-gray-800">
                                                            <tr>
                                                                <td className="py-1.5 pr-4 align-top"><span className="px-1.5 py-0.5 rounded bg-white border border-gray-200">CNAME</span></td>
                                                                <td className="py-1.5 pr-4 align-top">{typedDomain.startsWith('www.') ? 'www' : '@'} <span className="font-sans text-gray-400">({typedDomain})</span></td>
                                                                <td className="py-1.5">
                                                                    <span className="inline-flex items-center gap-1.5 break-all">
                                                                        {cnameTarget}
                                                                        <CopyButton value={cnameTarget} label="Copy target" />
                                                                    </span>
                                                                    <span className="block font-sans text-gray-400 mt-0.5">apex domains: use your provider's CNAME flattening / ALIAS record</span>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>

                                                <p className="mt-2 text-xs text-gray-500">
                                                    DNS changes can take a few minutes to propagate. The hostname is registered on
                                                    Cloudflare automatically after the website is created — the status page shows live progress.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>

                        {/* Website Branding — the building's logo drives the theme:
                            colors are auto-detected from it and applied to the new
                            site. The pickers below stay editable. No building logo?
                            upload one (it's saved on the building) or leave it and
                            colors inherit from the default site server-side. */}
                        <div className="mt-4 bg-white overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
                            <div className="p-6 space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Website Branding</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        The website's color theme is picked automatically from the building's logo.
                                        Every color stays editable below.
                                    </p>
                                </div>

                                {/* Building logo — auto-loaded from the selected building */}
                                <div>
                                    <InputLabel value="Building Logo" />
                                    <div className="mt-2 flex items-center gap-4">
                                        <div className="h-20 w-20 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {logoPreview ? (
                                                <img src={logoPreview} alt="Building logo" className="h-full w-full object-contain" />
                                            ) : (
                                                <svg className="h-8 w-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <label htmlFor="logo-upload" className={`inline-flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer ${uploadingLogo ? 'opacity-60 pointer-events-none' : ''}`}>
                                                {uploadingLogo ? 'Uploading…' : (logoPreview ? 'Change Logo' : 'Upload Logo')}
                                                <input
                                                    id="logo-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    className="sr-only"
                                                    disabled={uploadingLogo}
                                                    onChange={(e) => onLogoUpload(e.target.files[0])}
                                                />
                                            </label>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {logoPreview
                                                    ? 'Uploading a new logo saves it on the building and re-detects the theme.'
                                                    : 'This building has no logo yet — upload one (saved on the building). PNG, JPG, SVG or WebP up to 2MB.'}
                                            </p>
                                            {detectingColors && (
                                                <p className="text-xs text-indigo-600 mt-1 flex items-center gap-1.5">
                                                    <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                                                    Detecting colors…
                                                </p>
                                            )}
                                            {colorsDetected && !detectingColors && (
                                                <p className="text-xs text-green-700 mt-1">Theme colors detected from the logo — tweak any below.</p>
                                            )}
                                        </div>
                                    </div>
                                    {logoError && <p className="text-red-500 text-xs mt-2">{logoError}</p>}
                                </div>

                                {/* Favicon — the browser tab icon. Default: auto-
                                    convert the logo. Or upload a custom one. */}
                                <div className="border-t border-gray-100 pt-5">
                                    <InputLabel value="Favicon (browser tab icon)" />
                                    <div className="mt-2 flex items-start gap-4">
                                        <div className="h-14 w-14 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {faviconPreview ? (
                                                <img src={faviconPreview} alt="Favicon" className="h-full w-full object-contain" />
                                            ) : (data.favicon_from_logo && logoPreview) ? (
                                                <img src={logoPreview} alt="Favicon from logo" className="h-full w-full object-contain" />
                                            ) : (
                                                <svg className="h-6 w-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0a9 9 0 009-9m-9 9V3" /></svg>
                                            )}
                                        </div>
                                        <div className="min-w-0 space-y-2">
                                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                                <input
                                                    type="checkbox"
                                                    checked={data.favicon_from_logo}
                                                    onChange={(e) => {
                                                        setBrandingTouched(true);
                                                        setData((prev) => ({ ...prev, favicon_from_logo: e.target.checked, favicon_file: e.target.checked ? null : prev.favicon_file }));
                                                        if (e.target.checked) setFaviconPreview(null);
                                                    }}
                                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                Generate the favicon from the logo automatically
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <label htmlFor="favicon-upload" className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                                                    {data.favicon_file ? 'Change custom favicon' : 'Upload a custom favicon'}
                                                    <input
                                                        id="favicon-upload"
                                                        type="file"
                                                        accept="image/png,image/x-icon,image/svg+xml,image/jpeg,image/webp,.ico"
                                                        className="sr-only"
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (!file) return;
                                                            setBrandingTouched(true);
                                                            setData((prev) => ({ ...prev, favicon_file: file, favicon_from_logo: false }));
                                                            const reader = new FileReader();
                                                            reader.onload = (ev) => setFaviconPreview(ev.target.result);
                                                            reader.readAsDataURL(file);
                                                        }}
                                                    />
                                                </label>
                                                {data.favicon_file && (
                                                    <button
                                                        type="button"
                                                        onClick={() => { setData((prev) => ({ ...prev, favicon_file: null, favicon_from_logo: true })); setFaviconPreview(null); }}
                                                        className="text-xs text-gray-500 hover:text-red-600"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400">
                                                {data.favicon_file
                                                    ? 'Custom favicon will be used. PNG, ICO, SVG or WebP.'
                                                    : data.favicon_from_logo
                                                        ? 'The logo is converted to a square tab icon when the site is created.'
                                                        : 'No favicon set — the default site favicon is inherited.'}
                                            </p>
                                            <InputError message={errors.favicon_file} className="mt-1" />
                                        </div>
                                    </div>
                                </div>

                                {/* Color groups — mirrors Admin > Websites > Edit */}
                                {[
                                    { title: 'Core Brand Colors', fields: [
                                        { key: 'brand_colors.primary', label: 'Primary', desc: 'Main brand color' },
                                        { key: 'brand_colors.accent', label: 'Accent', desc: 'Highlight color' },
                                        { key: 'brand_colors.text', label: 'Text', desc: 'Text color' },
                                        { key: 'brand_colors.background', label: 'Background', desc: 'Page background' },
                                    ] },
                                    { title: 'Button Colors', fields: [
                                        { key: 'brand_colors.button_primary_bg', label: 'Primary BG', desc: 'Available Building, Sign Up' },
                                        { key: 'brand_colors.button_primary_text', label: 'Primary Text', desc: 'Primary text' },
                                        { key: 'brand_colors.button_secondary_bg', label: 'Secondary BG', desc: 'Contact Agent, Listings' },
                                        { key: 'brand_colors.button_secondary_text', label: 'Secondary Text', desc: 'Secondary text' },
                                        { key: 'brand_colors.button_tertiary_bg', label: 'Tertiary BG', desc: 'Request Tour buttons' },
                                        { key: 'brand_colors.button_tertiary_text', label: 'Tertiary Text', desc: 'Tertiary text' },
                                        { key: 'brand_colors.button_quaternary_bg', label: 'Quaternary BG', desc: 'Outline buttons' },
                                        { key: 'brand_colors.button_quaternary_text', label: 'Quaternary Text', desc: 'Quaternary text' },
                                    ] },
                                    { title: 'Footer Colors', fields: [
                                        { key: 'brand_colors.footer_bg', label: 'Footer Background', desc: 'Footer section background' },
                                        { key: 'brand_colors.footer_text', label: 'Footer Text', desc: 'Footer text color' },
                                    ] },
                                    { title: 'Link Colors', fields: [
                                        { key: 'brand_colors.link_color', label: 'Link Color', desc: 'Default link color' },
                                        { key: 'brand_colors.link_hover', label: 'Link Hover', desc: 'Link hover color' },
                                    ] },
                                ].map((group) => (
                                    <div key={group.title} className="border-t border-gray-100 pt-5">
                                        <label className="block text-sm font-medium text-gray-700 mb-3">{group.title}</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {group.fields.map((color) => (
                                                <div key={color.key} className="text-center">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">{color.label}</label>
                                                    <input
                                                        type="color"
                                                        value={data[color.key]}
                                                        onChange={(e) => setColor(color.key, e.target.value)}
                                                        className="h-12 w-full rounded-md border border-gray-300 cursor-pointer"
                                                    />
                                                    <div className="mt-1 text-xs text-gray-500">{data[color.key]}</div>
                                                    <p className="text-xs text-gray-400 mt-1">{color.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sticky action bar — Create is always reachable even
                            with a long building grid above. Lives outside the
                            overflow-hidden card, otherwise sticky can't work. */}
                        <div className="sticky bottom-0 z-10 mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-gray-200 bg-white/95 backdrop-blur px-4 py-3 sm:rounded-t-lg">
                            <p className="text-xs text-gray-500 max-w-xl">
                                Branding, colors, contact info, agent and fonts are inherited from your default site
                                (or this building's agent). AI writes the SEO metadata, hero copy, About text and FAQs
                                in the background — everything stays editable afterwards in Websites → Edit.
                            </p>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 whitespace-nowrap"
                            >
                                {processing ? (
                                    <>
                                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        Create Website
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </AdminLayout>
    );
}
