import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import ConfirmDialog from '@/Components/Admin/ConfirmDialog';
import QuickCreateSelect from '@/Components/Admin/QuickCreateSelect';
import QuickCreateInline from '@/Components/Admin/QuickCreateInline';
import DeveloperModal from '@/Components/Admin/DeveloperModal';
import DeveloperApiSearch from '@/Components/Admin/DeveloperApiSearch';
import useGooglePlacesAutocomplete from '@/hooks/useGooglePlacesAutocomplete';
import { csrfHeaders } from '@/utils/csrf';
import { importDeveloperFromApi, matchDeveloperByBuildingName } from '@/utils/developersApi';

// Helper function to create building slug
const createBuildingSlug = (name, id) => {
    if (!name) return id;
    const slug = name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    return `${slug}-${id}`;
};

export default function BuildingsEdit({ auth, building, developers = [], amenities = [], maintenanceFeeAmenities = [], neighbourhoods = [], subNeighbourhoods = [], linkedWebsite = null }) {
    // Old data model had street_address_1 + street_address_2 as separate
    // fields. The admin form now only shows a single "Additional Street
    // Addresses" repeater, so merge those two values in at the top of
    // the list when loading the form. On save the server re-derives
    // street_address_1/2 from this combined list (or from an address
    // hyphen-range, whichever the admin typed).
    const initialAddresses = [
        building.street_address_1,
        building.street_address_2,
        ...(Array.isArray(building.additional_addresses) ? building.additional_addresses : []),
    ].filter((a) => typeof a === 'string' && a.trim() !== '');

    const { data, setData, put, processing, errors } = useForm({
        name: building.name || '',
        address: building.address || '',
        street_address_1: '',
        street_address_2: '',
        additional_addresses: initialAddresses,
        city: building.city || '',
        neighbourhood: building.neighbourhood || '',
        neighbourhood_id: building.neighbourhood_id || '',
        sub_neighbourhood: building.sub_neighbourhood || '',
        sub_neighbourhood_id: building.sub_neighbourhood_id || '',
        province: building.province || 'ON',
        postal_code: building.postal_code || '',
        country: building.country || 'Canada',
        building_type: building.building_type || 'condominium',
        total_units: building.total_units || '',
        year_built: building.year_built || '',
        description: building.description || '',
        main_image: building.main_image || '',
        logo: building.logo || '',
        images: building.images || [],
        developer_id: building.developer_id || '',
        status: building.status || 'active',
        development_status: building.development_status || '',
        listing_type: building.listing_type || 'For Sale',
        is_featured: building.is_featured || false,
        latitude: building.latitude || '',
        longitude: building.longitude || '',
        amenity_ids: building.amenity_ids || [],
        floors: building.floors || '',
        parking_spots: building.parking_spots || '',
        locker_spots: building.locker_spots || '',
        maintenance_fee_range: building.maintenance_fee_range || '',
        parking_maintenance_fee: building.parking_maintenance_fee || '',
        locker_maintenance_fee: building.locker_maintenance_fee || '',
        sqft_range: building.sqft_range || '',
        avg_price_per_sqft: building.avg_price_per_sqft || '',
        website_url: building.website_url || '',
        floor_plans: building.floor_plans || [],
        virtual_tour_url: building.virtual_tour_url || '',
        features: building.features || [],
        nearby_transit: building.nearby_transit || [],
        neighborhood_info: building.neighborhood_info || '',
        deposit_structure: building.deposit_structure || '',
        estimated_completion: building.estimated_completion || '',
        architect: building.architect || '',
        interior_designer: building.interior_designer || '',
        landscape_architect: building.landscape_architect || '',
        maintenance_fee_amenity_ids: building.maintenance_fee_amenity_ids || [],
        management_name: building.management_name || '',
        corp_number: building.corp_number || '',
        date_registered: building.date_registered || ''
    });

    // Local copies of the dropdown options so inline quick-creates can append
    // without a page reload.
    const [developerOptions, setDeveloperOptions] = useState(developers);
    const [neighbourhoodOptions, setNeighbourhoodOptions] = useState(neighbourhoods);
    const [subNeighbourhoodOptions, setSubNeighbourhoodOptions] = useState(subNeighbourhoods);
    const [amenityOptions, setAmenityOptions] = useState(amenities);
    const [maintenanceAmenityOptions, setMaintenanceAmenityOptions] = useState(maintenanceFeeAmenities);

    // Initialize selected amenities immediately from props
    const initSelectedAmenities = () => {
        // Ensure amenity_ids is an array
        const amenityIds = Array.isArray(building.amenity_ids) ? building.amenity_ids : [];

        if (amenityIds.length > 0 && amenities.length > 0) {
            return amenities.filter((a) => amenityIds.includes(a.id));
        }
        return [];
    };

    const [selectedAmenities, setSelectedAmenities] = useState(initSelectedAmenities());

    // Initialize selected maintenance fee amenities
    const initMaintenanceFeeAmenities = () => {
        if (maintenanceFeeAmenities && building.maintenance_fee_amenity_ids) {
            return maintenanceFeeAmenities.filter(a =>
                building.maintenance_fee_amenity_ids.includes(a.id)
            );
        }
        return [];
    };

    const [selectedMaintenanceFeeAmenities, setSelectedMaintenanceFeeAmenities] = useState(initMaintenanceFeeAmenities());
    const [imagePreview, setImagePreview] = useState(building.main_image || '');
    const [logoPreview, setLogoPreview] = useState(building.logo || '');
    const [galleryImages, setGalleryImages] = useState(
        Array.isArray(building.images) ? building.images :
        (building.images ? JSON.parse(building.images) : [])
    );
    const [showAmenitySelector, setShowAmenitySelector] = useState(false);
    const [amenitySearch, setAmenitySearch] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingGalleryImage, setUploadingGalleryImage] = useState(false);
    const [imageUploadError, setImageUploadError] = useState('');
    const [pendingImageDelete, setPendingImageDelete] = useState(null);
    const [showMaintenanceAmenitySelector, setShowMaintenanceAmenitySelector] = useState(false);
    const [generatingAiDescription, setGeneratingAiDescription] = useState(false);
    const [aiDescriptionError, setAiDescriptionError] = useState('');
    const [showDeveloperModal, setShowDeveloperModal] = useState(false);
    const [developerApiMessage, setDeveloperApiMessage] = useState('');
    const [developerApiError, setDeveloperApiError] = useState('');

    // Full Add Developer modal (logo upload etc.) instead of the old
    // name-only inline quick-add. Appends and selects the new developer.
    const handleDeveloperCreated = (item) => {
        setDeveloperOptions((prev) =>
            prev.some((d) => d.id === item.id) ? prev : [...prev, item].sort((a, b) => a.name.localeCompare(b.name))
        );
        setData('developer_id', String(item.id));
    };

    // Auto-select the developer from the condos.ca developer directory when
    // the building name matches one of its records. Best effort, and never
    // overrides a developer the admin already picked.
    const handleBuildingNameBlur = async () => {
        const name = data.name.trim();
        if (name.length < 2 || data.developer_id) return;
        try {
            const developer = await matchDeveloperByBuildingName(name);
            if (developer) {
                handleDeveloperCreated(developer);
                setDeveloperApiError('');
                setDeveloperApiMessage(`Developer "${developer.name}" auto-selected from the developer directory.`);
            }
        } catch {
            // Silent — the manual directory search below still works.
        }
    };

    // A directory pick is imported server-side (existing developers are
    // reused, only missing fields fill) and then selected in the dropdown.
    const handleApiDeveloperSelect = async (apiDeveloper) => {
        try {
            const developer = await importDeveloperFromApi(apiDeveloper.slug);
            handleDeveloperCreated(developer);
            setDeveloperApiError('');
            setDeveloperApiMessage(`Developer "${developer.name}" loaded from the developer directory.`);
        } catch (err) {
            setDeveloperApiMessage('');
            setDeveloperApiError(err.message ?? 'Failed to load developer from the directory.');
        }
    };

    // Google Places autofill: picking an address suggestion fills postal
    // code, city, province, country and coordinates in one go.
    // Live MLS auto-fill on address change — fills only fields that are
    // still empty; the after-save MLS refresh remains the safety net.
    const [mlsFactsNotice, setMlsFactsNotice] = useState('');
    const lastMlsAddressRef = useRef(String(building.address || '').trim());
    const fetchMlsFactsForAddress = async (address, city) => {
        const trimmed = String(address || '').trim();
        if (trimmed.length < 5 || trimmed === lastMlsAddressRef.current) return;
        lastMlsAddressRef.current = trimmed;
        try {
            const response = await fetch('/api/buildings/mls-facts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...csrfHeaders(),
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ address: trimmed, city: city || '' }),
            });
            const result = await response.json();
            const facts = result?.facts;
            if (!facts) {
                setMlsFactsNotice('');
                return;
            }
            setData((prev) => {
                const next = { ...prev };
                const fill = (key, value) => {
                    if (value !== null && value !== undefined && value !== '' && !String(next[key] ?? '').trim()) {
                        next[key] = String(value);
                    }
                };
                fill('corp_number', facts.corp_number);
                fill('management_name', facts.management_name);
                fill('year_built', facts.year_built);
                fill('parking_maintenance_fee', facts.parking_maintenance_fee);
                fill('maintenance_fee_range', facts.maintenance_fee_range);
                return next;
            });
            setMlsFactsNotice(
                `MLS match: ${facts.active_listing_count} active listing${facts.active_listing_count === 1 ? '' : 's'} at this address — empty fields (corp, management, year built, fees) were auto-filled.`
            );
        } catch {
            // Silent — the after-save MLS refresh still fills these.
        }
    };

    useGooglePlacesAutocomplete('address', (parsed) => {
        setData((prev) => ({
            ...prev,
            address: parsed.streetAddress || prev.address,
            city: parsed.city || prev.city,
            province: parsed.province || prev.province,
            postal_code: parsed.postalCode || prev.postal_code,
            country: parsed.country || prev.country,
            latitude: parsed.latitude !== '' ? String(parsed.latitude) : prev.latitude,
            longitude: parsed.longitude !== '' ? String(parsed.longitude) : prev.longitude,
        }));
        fetchMlsFactsForAddress(parsed.streetAddress || '', parsed.city || '');
    });

    const buildingTypes = [
        { value: 'condominium', label: 'Condominium' },
        { value: 'apartment', label: 'Apartment' },
        { value: 'townhouse', label: 'Townhouse' },
        { value: 'commercial', label: 'Commercial' },
        { value: 'mixed_use', label: 'Mixed Use' }
    ];

    const provinces = [
        { value: 'ON', label: 'Ontario' },
        { value: 'BC', label: 'British Columbia' },
        { value: 'AB', label: 'Alberta' },
        { value: 'QC', label: 'Quebec' },
        { value: 'MB', label: 'Manitoba' },
        { value: 'SK', label: 'Saskatchewan' },
        { value: 'NS', label: 'Nova Scotia' },
        { value: 'NB', label: 'New Brunswick' },
        { value: 'NL', label: 'Newfoundland and Labrador' },
        { value: 'PE', label: 'Prince Edward Island' },
        { value: 'NT', label: 'Northwest Territories' },
        { value: 'YT', label: 'Yukon' },
        { value: 'NU', label: 'Nunavut' }
    ];

    const amenityIcons = {
        'Concierge': '🎩',
        'Security': '🔒',
        'Elevator': '🛗',
        'Party Room': '🎉',
        'Guest Suite': '🛏️',
        'Rooftop Terrace': '🏙️',
        'Gym': '💪',
        'Yoga Studio': '🧘',
        'Spa': '💆',
        'Sauna': '🧖',
        'Steam Room': '♨️',
        'Pool': '🏊',
        'Theatre': '🎬',
        'Games Room': '🎮',
        'Library': '📚',
        'BBQ Area': '🍖',
        'Lounge': '🛋️',
        'Business Centre': '💼',
        'Meeting Room': '👥',
        'Co-working Space': '💻',
        'Garden': '🌳',
        'Playground': '🎠',
        'Dog Park': '🐕',
        'Tennis Court': '🎾',
        'Basketball Court': '🏀',
        'Visitor Parking': '🅿️',
        'EV Charging': '🔌',
        'Bike Storage': '🚲',
        'Car Wash': '🚗'
    };

    // Generate AI description for building
    const handleGenerateAiDescription = async () => {
        if (!building.id) {
            setAiDescriptionError('Building ID is required to generate AI description');
            return;
        }

        setGeneratingAiDescription(true);
        setAiDescriptionError('');

        try {
            const response = await fetch('/api/buildings/generate-ai-description', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...csrfHeaders(),
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    building_id: building.id,
                    building_data: {
                        name: data.name,
                        address: data.address,
                        city: data.city,
                        province: data.province,
                        building_type: data.building_type,
                        total_units: data.total_units,
                        year_built: data.year_built,
                        floors: data.floors,
                        parking_spots: data.parking_spots,
                        locker_spots: data.locker_spots,
                        development_status: data.development_status,
                        neighbourhood: neighbourhoodOptions.find(n => String(n.id) === String(data.neighbourhood_id))?.name || data.neighbourhood || '',
                        sub_neighbourhood: subNeighbourhoodOptions.find(s => String(s.id) === String(data.sub_neighbourhood_id))?.name || data.sub_neighbourhood || '',
                        amenities: selectedAmenities.map(a => a.name),
                        maintenance_fee_amenities: selectedMaintenanceFeeAmenities.map(a => a.name),
                        price_range: building.price_range,
                        sqft_range: data.sqft_range,
                        avg_price_per_sqft: data.avg_price_per_sqft,
                        maintenance_fee_range: data.maintenance_fee_range,
                        corp_number: data.corp_number,
                        nearby_transit: data.nearby_transit,
                        developer_name: developerOptions.find(d => String(d.id) === String(data.developer_id))?.name || '',
                        management_name: data.management_name,
                        existing_description: data.description
                    }
                })
            });

            const result = await response.json();

            if (result.success && result.description) {
                setData('description', result.description);
            } else if (result.fallback_description) {
                // AI failed but the server built a professional description
                // from the building facts — use it, and tell the admin why.
                setData('description', result.fallback_description);
                setAiDescriptionError(`${result.error || 'AI generation failed'} — a fallback description was generated from the building facts instead.`);
            } else {
                setAiDescriptionError(result.error || 'Failed to generate AI description');
            }
        } catch (error) {
            setAiDescriptionError('Failed to generate AI description. Please try again.');
        } finally {
            setGeneratingAiDescription(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = {
            ...data,
            amenity_ids: selectedAmenities.map(a => a.id),
            maintenance_fee_amenity_ids: selectedMaintenanceFeeAmenities.map(a => a.id)
        };

        put(route('admin.buildings.update', createBuildingSlug(building.name, building.id)), formData);
    };

    const toggleAmenity = (amenity) => {
        const exists = selectedAmenities.find(a => a.id === amenity.id);
        let newSelectedAmenities;
        
        if (exists) {
            newSelectedAmenities = selectedAmenities.filter(a => a.id !== amenity.id);
        } else {
            newSelectedAmenities = [...selectedAmenities, amenity];
        }
        
        setSelectedAmenities(newSelectedAmenities);
        
        // Also update the form data to keep it in sync
        setData('amenity_ids', newSelectedAmenities.map(a => a.id));
    };

    const toggleMaintenanceFeeAmenity = (amenity) => {
        const exists = selectedMaintenanceFeeAmenities.find(a => a.id === amenity.id);
        let newSelectedMaintenanceFeeAmenities;

        if (exists) {
            newSelectedMaintenanceFeeAmenities = selectedMaintenanceFeeAmenities.filter(a => a.id !== amenity.id);
        } else {
            newSelectedMaintenanceFeeAmenities = [...selectedMaintenanceFeeAmenities, amenity];
        }

        setSelectedMaintenanceFeeAmenities(newSelectedMaintenanceFeeAmenities);

        // Also update the form data to keep it in sync
        setData('maintenance_fee_amenity_ids', newSelectedMaintenanceFeeAmenities.map(a => a.id));
    };

    const handleImageUpload = async (e, imageType = 'main') => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setImageUploadError('');

        // For main image / logo, only take the first file
        const filesToUpload = imageType === 'gallery' ? files : [files[0]];

        // Validate file types and sizes
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        for (const file of filesToUpload) {
            if (!validTypes.includes(file.type)) {
                setImageUploadError(`Invalid file type: ${file.name}. Please upload valid image files (JPEG, PNG, GIF, or WebP).`);
                e.target.value = null;
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setImageUploadError(`File too large: ${file.name}. Images must be less than 5MB.`);
                e.target.value = null;
                return;
            }
        }

        if (imageType === 'main') {
            setUploadingImage(true);
        } else if (imageType === 'logo') {
            setUploadingLogo(true);
        } else {
            setUploadingGalleryImage(true);
        }

        const uploadPromises = filesToUpload.map(async (file) => {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('building_id', building.id);
            formData.append('image_type', imageType);

            try {
                // Get CSRF token from meta tag
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

                const response = await fetch('/api/buildings/upload-image', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken || '',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json'
                    },
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                if (result.success && result.url) {
                    return result.url;
                }
                return null;
            } catch (error) {
                return null;
            }
        });

        try {
            const uploadedUrls = await Promise.all(uploadPromises);
            const successfulUploads = uploadedUrls.filter(url => url !== null);

            if (successfulUploads.length > 0) {
                if (imageType === 'main') {
                    setData('main_image', successfulUploads[0]);
                    setImagePreview(successfulUploads[0]);
                } else if (imageType === 'logo') {
                    setData('logo', successfulUploads[0]);
                    setLogoPreview(successfulUploads[0]);
                } else {
                    const updatedImages = [...galleryImages, ...successfulUploads];
                    setGalleryImages(updatedImages);
                    setData('images', updatedImages);
                }

                if (successfulUploads.length < filesToUpload.length) {
                    setImageUploadError(`Only ${successfulUploads.length} of ${filesToUpload.length} images uploaded successfully. Try re-uploading the rest.`);
                }
            } else {
                setImageUploadError('Failed to upload images. Please try again.');
            }
        } catch (error) {
            setImageUploadError('Failed to upload images. Please try again.');
        } finally {
            if (imageType === 'main') {
                setUploadingImage(false);
            } else if (imageType === 'logo') {
                setUploadingLogo(false);
            } else {
                setUploadingGalleryImage(false);
            }
            // Reset the input
            e.target.value = null;
        }
    };

    const handleDeleteImage = async (imageUrl, isMainImage = false) => {
        setImageUploadError('');
        try {
            // Get CSRF token from meta tag
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch('/api/buildings/delete-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    building_id: building.id,
                    image_url: imageUrl
                })
            });

            const result = await response.json();

            if (result.success) {
                if (isMainImage) {
                    setData('main_image', '');
                    setImagePreview('');
                } else {
                    const updatedImages = galleryImages.filter(img => img !== imageUrl);
                    setGalleryImages(updatedImages);
                    setData('images', updatedImages);
                }
            } else {
                setImageUploadError('Failed to delete image. Please try again.');
            }
        } catch (error) {
            setImageUploadError('Failed to delete image. Please try again.');
        }
    };

    const filteredAmenities = amenityOptions.filter(amenity =>
        amenity.name.toLowerCase().includes(amenitySearch.toLowerCase())
    );

    const sortByName = (list) => [...list].sort((a, b) => a.name.localeCompare(b.name));

    // Inline quick-create handlers: append to the option list (if new) and
    // auto-select the amenity so it lands on the building being edited.
    const handleAmenityCreated = (item) => {
        setAmenityOptions(prev =>
            prev.some(a => a.id === item.id) ? prev : sortByName([...prev, item])
        );
        setSelectedAmenities(prev =>
            prev.some(a => a.id === item.id) ? prev : [...prev, item]
        );
    };

    const handleMaintenanceAmenityCreated = (item) => {
        setMaintenanceAmenityOptions(prev =>
            prev.some(a => a.id === item.id) ? prev : sortByName([...prev, item])
        );
        setSelectedMaintenanceFeeAmenities(prev =>
            prev.some(a => a.id === item.id) ? prev : [...prev, item]
        );
    };

    // Parse the primary Address field into a list of street addresses
    // ready to drop into the Additional Street Addresses repeater.
    // Two shapes are supported:
    //   1. Hyphen-range: "8-38 Widmer St, Toronto" -> 31 entries.
    //   2. Comma / & list of distinct addresses:
    //      "98 Lillian St, 89 Dunfield Ave & 101 Eglinton Ave E, Toronto"
    //      -> 3 entries (city suffix dropped).
    // Returns null when only a single address is detected — no need to
    // offer "Expand" for a plain "10 Capreol Crt".
    const detectAddressRange = (value) => {
        if (!value) return null;
        // Shape 1: hyphen-range
        const rangeMatch = value.match(/^(\d+)\s*[-–—]\s*(\d+)\s+(.+)$/);
        if (rangeMatch) {
            const start = parseInt(rangeMatch[1], 10);
            const end = parseInt(rangeMatch[2], 10);
            // Trailing ", Toronto" / ", ON ..." dropped so each generated
            // entry stays clean ("9 Widmer St" not "9 Widmer St, Toronto").
            const rest = rangeMatch[3].split(/\s*,/)[0].trim();
            if (!isNaN(start) && !isNaN(end) && end > start && rest) {
                const numbers = [];
                for (let n = start; n <= end; n += 1) {
                    numbers.push(n);
                    if (numbers.length > 50) break;
                }
                return {
                    count: numbers.length,
                    addresses: numbers.map((n) => `${n} ${rest}`),
                };
            }
        }
        // Shape 2: comma / & list of distinct addresses
        const parts = value
            .split(/\s*[,&]\s*/)
            .map((p) => p.trim())
            .filter((p) => /^\d/.test(p));
        if (parts.length >= 2) {
            return { count: parts.length, addresses: parts };
        }
        return null;
    };

    const handleExpandRange = () => {
        const range = detectAddressRange(data.address);
        if (!range) return;
        // Single Additional Street Addresses repeater now -- dump every
        // expanded number into it. The server still receives the full
        // list under additional_addresses and re-derives the structured
        // street_address_1/2 columns on save.
        setData((prev) => ({
            ...prev,
            street_address_1: '',
            street_address_2: '',
            additional_addresses: range.addresses,
        }));
    };

    const addressRange = detectAddressRange(data.address);

    return (
        <AdminLayout title="Edit Building">
            <Head title="Edit Building" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <h1 className="text-base font-semibold leading-6 text-gray-900">Edit Building</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Update building information and details.
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                        {linkedWebsite ? (
                            <Link
                                href={route('admin.websites.edit', linkedWebsite.id)}
                                className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2.5 text-sm font-medium text-green-800 ring-1 ring-inset ring-green-200 hover:bg-green-100 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0c2.5 0 4.5-4 4.5-9S14.5 3 12 3 7.5 7 7.5 12s2 9 4.5 9zM3.6 9h16.8M3.6 15h16.8" />
                                </svg>
                                Website: {linkedWebsite.domain || linkedWebsite.name}
                            </Link>
                        ) : (
                            <Link
                                href={route('admin.websites.create', { building_id: building.id })}
                                className="inline-flex items-center gap-2 rounded-lg bg-[#0f172a] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1e293b] transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0c2.5 0 4.5-4 4.5-9S14.5 3 12 3 7.5 7 7.5 12s2 9 4.5 9zM3.6 9h16.8M3.6 15h16.8" />
                                </svg>
                                Launch Website
                            </Link>
                        )}
                    </div>
                </div>

                {/* !border-gray-300 on all fields: TextInput bakes in dark:border-gray-700,
                    so in a dark-mode browser text inputs got darker borders than the
                    inline-styled selects/textareas. Force one border for everything. */}
                <form onSubmit={handleSubmit} className="mt-6 space-y-6 [&_input]:!bg-white [&_input]:!text-gray-900 [&_input]:!border-gray-300 [&_textarea]:!bg-white [&_textarea]:!text-gray-900 [&_textarea]:!border-gray-300 [&_select]:!bg-white [&_select]:!text-gray-900 [&_select]:!border-gray-300 [&_input]:!py-2 [&_input]:!text-sm [&_select]:!py-2 [&_select]:!text-sm [&_textarea]:!text-sm">
                    {/* Basic Information */}
                    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                        <div className="px-4 py-6 sm:p-8">
                            <h2 className="text-base font-semibold leading-7 text-gray-900 mb-6">Basic Information</h2>
                            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                <div className="sm:col-span-3">
                                    <InputLabel htmlFor="name" value="Building Name *" />
                                    <TextInput
                                        id="name"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        onBlur={handleBuildingNameBlur}
                                        placeholder="e.g., The Well"
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div className="sm:col-span-3">
                                    <InputLabel htmlFor="building_type" value="Building Type *" />
                                    <select
                                        id="building_type"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.building_type}
                                        onChange={(e) => setData('building_type', e.target.value)}
                                        required
                                    >
                                        {buildingTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.building_type} className="mt-2" />
                                </div>

                                {/* Listing Type intentionally not shown — updates omit the
                                    field so the existing DB value is preserved; public
                                    pages/API still read it. */}
                                <div className="sm:col-span-3">
                                    <InputLabel htmlFor="development_status" value="Construction Stage" />
                                    <select
                                        id="development_status"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.development_status}
                                        onChange={(e) => setData('development_status', e.target.value)}
                                    >
                                        <option value="">Not specified</option>
                                        <option value="pre_construction">Pre Construction</option>
                                        <option value="under_construction">Under Construction</option>
                                        <option value="completed">Completed</option>
                                        <option value="sold_out">Sold Out</option>
                                    </select>
                                    <p className="mt-1 text-xs text-gray-500">Construction phase only — whether the building is published is controlled by Visibility Status under Status &amp; Settings.</p>
                                    <InputError message={errors.development_status} className="mt-2" />
                                </div>

                                <div className="sm:col-span-4">
                                    <InputLabel htmlFor="address" value="Address *" />
                                    <TextInput
                                        id="address"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        onBlur={() => fetchMlsFactsForAddress(data.address, data.city)}
                                        placeholder="e.g., 10 Capreol Crt — or a range like '8-30 Widmer St, Toronto'"
                                        required
                                    />
                                    {mlsFactsNotice && (
                                        <p className="mt-1 text-xs text-green-700">{mlsFactsNotice}</p>
                                    )}
                                    <InputError message={errors.address} className="mt-2" />
                                    {addressRange && (
                                        <div className="mt-2 flex items-center gap-2 text-sm text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md px-3 py-2">
                                            <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            <span>Detected range — expand to {addressRange.count} addresses?</span>
                                            <button
                                                type="button"
                                                onClick={handleExpandRange}
                                                className="ml-auto inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700"
                                            >
                                                Expand
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Street Address 1 / 2 inputs removed -- the server
                                    auto-expands a hyphen-range Address into the
                                    structured fields on save, and any extra towers
                                    go into the Additional Street Addresses repeater
                                    below. */}
                                <div className="sm:col-span-6">
                                    <div className="flex items-center justify-between">
                                        <InputLabel value="Additional Street Addresses" />
                                        <button
                                            type="button"
                                            onClick={() => setData('additional_addresses', [...(data.additional_addresses || []), ''])}
                                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                                        >
                                            + Add address
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        For buildings spanning multiple street numbers (e.g., "8-30 Widmer St").
                                    </p>
                                    <div className="mt-2 space-y-2">
                                        {(data.additional_addresses || []).map((addr, idx) => (
                                            <div key={idx} className="flex gap-2 items-center">
                                                <TextInput
                                                    type="text"
                                                    className="block w-full"
                                                    value={addr}
                                                    onChange={(e) => {
                                                        const next = [...data.additional_addresses];
                                                        next[idx] = e.target.value;
                                                        setData('additional_addresses', next);
                                                    }}
                                                    placeholder="e.g., 12 Widmer St"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const next = data.additional_addresses.filter((_, i) => i !== idx);
                                                        setData('additional_addresses', next);
                                                    }}
                                                    className="px-2 py-1 text-red-600 hover:text-red-800 text-sm"
                                                    title="Remove this address"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <InputError message={errors.additional_addresses} className="mt-2" />
                                </div>

                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="city" value="City *" />
                                    <TextInput
                                        id="city"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        placeholder="e.g., Toronto"
                                        required
                                    />
                                    <InputError message={errors.city} className="mt-2" />
                                </div>

                                <div className="sm:col-span-2">
                                    <QuickCreateSelect
                                        id="neighbourhood_id"
                                        label="Neighbourhood"
                                        value={data.neighbourhood_id || ''}
                                        onChange={(value) => {
                                            const selectedNeighbourhood = neighbourhoodOptions.find(n => String(n.id) === String(value));
                                            setData({
                                                ...data,
                                                neighbourhood_id: value ? parseInt(value) : '',
                                                neighbourhood: selectedNeighbourhood?.name || '',
                                                // Reset sub-neighbourhood when neighbourhood changes
                                                sub_neighbourhood_id: '',
                                                sub_neighbourhood: ''
                                            });
                                        }}
                                        options={neighbourhoodOptions}
                                        getOptionLabel={(n) => n.city ? `${n.name} (${n.city})` : n.name}
                                        createUrl={route('admin.api.neighbourhoods.store')}
                                        createPayload={{ city: data.city }}
                                        createTitle="New neighbourhood name"
                                        placeholder="Select a neighbourhood..."
                                        error={errors.neighbourhood_id}
                                        onCreated={(item) => setNeighbourhoodOptions((prev) =>
                                            prev.some((n) => n.id === item.id) ? prev : [...prev, item].sort((a, b) => a.name.localeCompare(b.name))
                                        )}
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <QuickCreateSelect
                                        id="sub_neighbourhood_id"
                                        label="Sub-Neighbourhood"
                                        value={data.sub_neighbourhood_id || ''}
                                        onChange={(value) => {
                                            const selectedSubNeighbourhood = subNeighbourhoodOptions.find(sn => String(sn.id) === String(value));
                                            setData({
                                                ...data,
                                                sub_neighbourhood_id: value ? parseInt(value) : '',
                                                sub_neighbourhood: selectedSubNeighbourhood?.name || ''
                                            });
                                        }}
                                        options={subNeighbourhoodOptions.filter(sn => !data.neighbourhood_id || String(sn.neighbourhood_id) === String(data.neighbourhood_id))}
                                        getOptionLabel={(sn) => sn.neighbourhood_name ? `${sn.name} (${sn.neighbourhood_name})` : sn.name}
                                        createUrl={route('admin.api.sub-neighbourhoods.store')}
                                        createPayload={{ neighbourhood_id: data.neighbourhood_id || null }}
                                        createTitle="New sub-neighbourhood name"
                                        placeholder="Select a sub-neighbourhood..."
                                        error={errors.sub_neighbourhood_id}
                                        onCreated={(item) => setSubNeighbourhoodOptions((prev) =>
                                            prev.some((s) => s.id === item.id) ? prev : [...prev, item].sort((a, b) => a.name.localeCompare(b.name))
                                        )}
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="province" value="Province *" />
                                    <select
                                        id="province"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.province}
                                        onChange={(e) => setData('province', e.target.value)}
                                        required
                                    >
                                        {provinces.map(province => (
                                            <option key={province.value} value={province.value}>
                                                {province.label}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.province} className="mt-2" />
                                </div>

                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="postal_code" value="Postal Code" />
                                    <TextInput
                                        id="postal_code"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.postal_code}
                                        onChange={(e) => setData('postal_code', e.target.value)}
                                        placeholder="e.g., M5V 0K6"
                                    />
                                    <InputError message={errors.postal_code} className="mt-2" />
                                </div>

                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="country" value="Country" />
                                    <TextInput
                                        id="country"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.country}
                                        onChange={(e) => setData('country', e.target.value)}
                                        placeholder="e.g., Canada"
                                    />
                                    <InputError message={errors.country} className="mt-2" />
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Building Details */}
                    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                        <div className="px-4 py-6 sm:p-8">
                            <h2 className="text-base font-semibold leading-7 text-gray-900 mb-6">Building Details</h2>
                            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="total_units" value="Total Units" />
                                    <TextInput
                                        id="total_units"
                                        type="number"
                                        className="mt-1 block w-full"
                                        value={data.total_units}
                                        onChange={(e) => setData('total_units', e.target.value)}
                                    />
                                    <InputError message={errors.total_units} className="mt-2" />
                                </div>

                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="floors" value="Number of Floors" />
                                    <TextInput
                                        id="floors"
                                        type="number"
                                        className="mt-1 block w-full"
                                        value={data.floors}
                                        onChange={(e) => setData('floors', e.target.value)}
                                    />
                                    <InputError message={errors.floors} className="mt-2" />
                                </div>

                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="year_built" value="Year Built" />
                                    <TextInput
                                        id="year_built"
                                        type="number"
                                        className="mt-1 block w-full"
                                        value={data.year_built}
                                        onChange={(e) => setData('year_built', e.target.value)}
                                        min="1900"
                                        max={new Date().getFullYear() + 10}
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Leave blank to auto-fill from live MLS listings for this address after saving.
                                    </p>
                                    <InputError message={errors.year_built} className="mt-2" />
                                </div>

                                <div className="sm:col-span-2">
                                    <QuickCreateSelect
                                        id="developer_id"
                                        label="Developer"
                                        value={data.developer_id}
                                        onChange={(value) => setData('developer_id', value)}
                                        options={developerOptions}
                                        placeholder="Select a developer"
                                        error={errors.developer_id}
                                        onRequestCreate={() => setShowDeveloperModal(true)}
                                    />
                                    <div className="mt-2">
                                        <DeveloperApiSearch onSelect={handleApiDeveloperSelect} />
                                    </div>
                                    {developerApiMessage && (
                                        <p className="mt-1 text-xs text-green-600">{developerApiMessage}</p>
                                    )}
                                    {developerApiError && (
                                        <p className="mt-1 text-xs text-red-600">{developerApiError}</p>
                                    )}
                                </div>

                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="management_name" value="Management Company" />
                                    <TextInput
                                        id="management_name"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.management_name}
                                        onChange={(e) => setData('management_name', e.target.value)}
                                        placeholder="Management company name"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Leave blank to auto-fill from live MLS listings for this address after saving.
                                    </p>
                                    <InputError message={errors.management_name} className="mt-2" />
                                </div>

                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="corp_number" value="Corp Number" />
                                    <TextInput
                                        id="corp_number"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.corp_number}
                                        onChange={(e) => setData('corp_number', e.target.value)}
                                        placeholder="e.g., TSCC 2500"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Leave blank to auto-fill from live MLS listings for this address after saving.
                                    </p>
                                    <InputError message={errors.corp_number} className="mt-2" />
                                </div>

                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="date_registered" value="Date Registered" />
                                    <TextInput
                                        id="date_registered"
                                        type="date"
                                        className="mt-1 block w-full"
                                        value={data.date_registered}
                                        onChange={(e) => setData('date_registered', e.target.value)}
                                    />
                                    <InputError message={errors.date_registered} className="mt-2" />
                                </div>

                                <div className="sm:col-span-3">
                                    <InputLabel value="Price Range" />
                                    <p className="mt-2 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                                        {building.price_range
                                            ? `Current: ${building.price_range} — auto-refreshed from live MLS listings on every save.`
                                            : 'Auto-filled from live MLS listings after saving — no manual entry needed.'}
                                    </p>
                                </div>

                                <div className="sm:col-span-3">
                                    <InputLabel htmlFor="maintenance_fee_range" value="Maintenance Fee Range" />
                                    <TextInput
                                        id="maintenance_fee_range"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.maintenance_fee_range}
                                        onChange={(e) => setData('maintenance_fee_range', e.target.value)}
                                        placeholder="e.g., $0.65 - $0.85 per sq ft"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Leave blank to auto-fill from live MLS listings for this address after saving.</p>
                                    <InputError message={errors.maintenance_fee_range} className="mt-2" />
                                </div>

                                <div className="sm:col-span-3">
                                    <InputLabel htmlFor="parking_maintenance_fee" value="Parking Maintenance ($/month)" />
                                    <TextInput
                                        id="parking_maintenance_fee"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="mt-1 block w-full"
                                        value={data.parking_maintenance_fee}
                                        onChange={(e) => setData('parking_maintenance_fee', e.target.value)}
                                        placeholder="e.g., 65.00"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Leave blank to auto-fill from MLS when listings publish a monthly parking cost.
                                    </p>
                                    <InputError message={errors.parking_maintenance_fee} className="mt-2" />
                                </div>

                                <div className="sm:col-span-3">
                                    <InputLabel htmlFor="sqft_range" value="Unit Size Range (sqft)" />
                                    <TextInput
                                        id="sqft_range"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.sqft_range}
                                        onChange={(e) => setData('sqft_range', e.target.value)}
                                        placeholder="e.g., 700 - 1411 sqft"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Imported from CSV / refreshed from live MLS listings when left blank.
                                    </p>
                                    <InputError message={errors.sqft_range} className="mt-2" />
                                </div>

                                <div className="sm:col-span-3">
                                    <InputLabel htmlFor="avg_price_per_sqft" value="Avg Price Per Sqft" />
                                    <TextInput
                                        id="avg_price_per_sqft"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.avg_price_per_sqft}
                                        onChange={(e) => setData('avg_price_per_sqft', e.target.value)}
                                        placeholder="e.g., $850"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Imported from CSV / refreshed from live MLS listings when left blank.
                                    </p>
                                    <InputError message={errors.avg_price_per_sqft} className="mt-2" />
                                </div>

                                <div className="sm:col-span-3">
                                    <InputLabel htmlFor="locker_maintenance_fee" value="Locker Maintenance ($/month)" />
                                    <TextInput
                                        id="locker_maintenance_fee"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="mt-1 block w-full"
                                        value={data.locker_maintenance_fee}
                                        onChange={(e) => setData('locker_maintenance_fee', e.target.value)}
                                        placeholder="e.g., 25.00"
                                    />
                                    <InputError message={errors.locker_maintenance_fee} className="mt-2" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description — placed after Building Details so "Generate
                        with AI" can draw on everything entered above. */}
                    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                        <div className="px-4 py-6 sm:p-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-semibold leading-7 text-gray-900">Description</h2>
                                <button
                                    type="button"
                                    onClick={handleGenerateAiDescription}
                                    disabled={generatingAiDescription}
                                    className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    {generatingAiDescription ? 'Generating...' : 'Generate with AI'}
                                </button>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Fill in the building details above first — the AI uses them to write an SEO-optimized description.
                            </p>
                            <textarea
                                id="description"
                                rows={6}
                                className="mt-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Enter building description or use AI to generate one automatically..."
                            />
                            <InputError message={errors.description} className="mt-2" />
                            {aiDescriptionError && (
                                <div className="mt-2 text-sm text-red-600">
                                    {aiDescriptionError}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Amenities */}
                    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                        <div className="px-4 py-6 sm:p-8">
                            <h2 className="text-base font-semibold leading-7 text-gray-900 mb-6">Building Amenities</h2>
                            
                            {/* Selected Amenities Display */}
                            <div className="mb-4">
                                <div className="flex flex-wrap gap-2">
                                    {selectedAmenities.length > 0 ? (
                                        selectedAmenities.map(amenity => (
                                            <span
                                                key={amenity.id}
                                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                                            >
                                                {amenity.icon ? (
                                                    <img
                                                        src={amenity.icon}
                                                        alt={amenity.name}
                                                        className="w-4 h-4 object-contain"
                                                    />
                                                ) : (
                                                    <span>{amenityIcons[amenity.name] || '✨'}</span>
                                                )}
                                                {amenity.name}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleAmenity(amenity)}
                                                    className="ml-1 text-blue-600 hover:text-blue-800"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-sm">No amenities selected</p>
                                    )}
                                </div>
                            </div>

                            {/* Add Amenities Button */}
                            <button
                                type="button"
                                onClick={() => setShowAmenitySelector(!showAmenitySelector)}
                                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                            >
                                {showAmenitySelector ? 'Hide' : 'Select'} Amenities
                            </button>

                            {/* Amenity Selector */}
                            {showAmenitySelector && (
                                <div className="mt-4 border rounded-lg p-4 bg-gray-50">
                                    <div className="mb-4 space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Search amenities..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            value={amenitySearch}
                                            onChange={(e) => setAmenitySearch(e.target.value)}
                                        />
                                        <QuickCreateInline
                                            createUrl={route('admin.api.amenities.store')}
                                            buttonLabel="+ New amenity"
                                            placeholder="New amenity name..."
                                            onCreated={handleAmenityCreated}
                                            withImage
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                        {filteredAmenities.map(amenity => {
                                            const isSelected = selectedAmenities.find(a => a.id === amenity.id);
                                            return (
                                                <button
                                                    key={amenity.id}
                                                    type="button"
                                                    onClick={() => toggleAmenity(amenity)}
                                                    className={`flex items-center gap-2 p-2 rounded-lg text-sm transition-colors ${
                                                        isSelected
                                                            ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                                                            : 'bg-white hover:bg-gray-100 border border-gray-200'
                                                    }`}
                                                >
                                                    {amenity.icon ? (
                                                        <img
                                                            src={amenity.icon}
                                                            alt={amenity.name}
                                                            className="w-5 h-5 object-contain"
                                                        />
                                                    ) : (
                                                        <span className="text-lg">
                                                            {amenityIcons[amenity.name] || '✨'}
                                                        </span>
                                                    )}
                                                    <span className="text-left">{amenity.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Maintenance Fee Amenities Section */}
                            <div className="mt-8 border-t pt-6">
                                <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">
                                    Amenities Included in Maintenance Fees
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Select amenities that are covered by the maintenance fees
                                </p>

                                {/* Selected Maintenance Fee Amenities Display */}
                                <div className="mb-4">
                                    <div className="flex flex-wrap gap-2">
                                        {selectedMaintenanceFeeAmenities.length > 0 ? (
                                            selectedMaintenanceFeeAmenities.map(amenity => {
                                                return (
                                                    <span
                                                        key={amenity.id}
                                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                                                    >
                                                        <img
                                                            src={amenity.icon || '/assets/svgs/amenity-default.svg'}
                                                            alt={amenity.name}
                                                            className="w-4 h-4 object-contain"
                                                        />
                                                        {amenity.name}
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleMaintenanceFeeAmenity(amenity)}
                                                            className="ml-1 text-green-600 hover:text-green-800"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                );
                                            })
                                        ) : (
                                            <p className="text-gray-500 text-sm">No maintenance fee amenities selected</p>
                                        )}
                                    </div>
                                </div>

                                {/* Toggle Button */}
                                <button
                                    type="button"
                                    onClick={() => setShowMaintenanceAmenitySelector(!showMaintenanceAmenitySelector)}
                                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    {showMaintenanceAmenitySelector ? 'Hide' : 'Select'} Maintenance Amenities
                                </button>

                                {/* Maintenance Amenity Selector */}
                                {showMaintenanceAmenitySelector && (
                                    <div className="mt-4 border rounded-lg p-4 bg-gray-50">
                                        <div className="mb-4">
                                            <QuickCreateInline
                                                createUrl={route('admin.api.maintenance-fee-amenities.store')}
                                                buttonLabel="+ New maintenance amenity"
                                                placeholder="New maintenance amenity name..."
                                                onCreated={handleMaintenanceAmenityCreated}
                                                withImage
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                            {maintenanceAmenityOptions.map(amenity => {
                                                const isIncluded = selectedMaintenanceFeeAmenities.some(a => a.id === amenity.id);
                                                return (
                                                    <button
                                                        key={amenity.id}
                                                        type="button"
                                                        onClick={() => toggleMaintenanceFeeAmenity(amenity)}
                                                        className={`flex items-center gap-2 p-2 rounded-lg text-sm transition-colors ${
                                                            isIncluded
                                                                ? 'bg-green-100 text-green-800 border-2 border-green-300'
                                                                : 'bg-white hover:bg-gray-100 border border-gray-200'
                                                        }`}
                                                    >
                                                        <img
                                                            src={amenity.icon || '/assets/svgs/amenity-default.svg'}
                                                            alt={amenity.name}
                                                            className="w-5 h-5 object-contain"
                                                        />
                                                        <span className="text-left">{amenity.name}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Media & Links */}
                    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                        <div className="px-4 py-6 sm:p-8">
                            <h2 className="text-base font-semibold leading-7 text-gray-900 mb-6">Media & Links</h2>

                            {imageUploadError && (
                                <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                                    {imageUploadError}
                                </div>
                            )}

                            {/* Main Image Section */}
                            <div className="mb-8">
                                <h3 className="text-sm font-semibold text-gray-700 mb-4">Main Building Image</h3>
                                <div className="grid grid-cols-1 gap-x-6 gap-y-4">
                                    <div>
                                        <div className="mt-1 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <label className="relative cursor-pointer bg-indigo-600 rounded-md font-medium text-white hover:bg-indigo-700 px-4 py-2 inline-flex items-center">
                                                    <input
                                                        type="file"
                                                        className="sr-only"
                                                        accept="image/*"
                                                        onChange={(e) => handleImageUpload(e, 'main')}
                                                        disabled={uploadingImage}
                                                    />
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                    </svg>
                                                    {uploadingImage ? 'Uploading...' : 'Select Main Image'}
                                                </label>
                                                {imagePreview && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setPendingImageDelete({ imageUrl: imagePreview, isMainImage: true })}
                                                        className="bg-red-600 hover:bg-red-700 text-white rounded-md px-4 py-2 text-sm"
                                                    >
                                                        Remove Main Image
                                                    </button>
                                                )}
                                            </div>
                                            {!imagePreview && (
                                                <p className="text-sm text-gray-500">Select the main image for the building (JPG, PNG, GIF, max 5MB)</p>
                                            )}
                                        </div>
                                        <InputError message={errors.main_image} className="mt-2" />

                                        {/* Main Image Preview */}
                                        {imagePreview && (
                                            <div className="mt-3">
                                                <img
                                                    src={imagePreview}
                                                    alt="Main building image"
                                                    className="w-full h-64 object-cover rounded-lg border border-gray-200"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/400x300?text=Invalid+Image';
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Building Logo Section — drives the website color theme */}
                            <div className="mb-8 border-t pt-6">
                                <h3 className="text-sm font-semibold text-gray-700 mb-1">Building Logo</h3>
                                <p className="text-xs text-gray-500 mb-4">Used as the website logo and to auto-detect the site's color theme when a website is created for this building.</p>
                                <div>
                                    <div className="mt-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <label className="relative cursor-pointer bg-indigo-600 rounded-md font-medium text-white hover:bg-indigo-700 px-4 py-2 inline-flex items-center">
                                                <input
                                                    type="file"
                                                    className="sr-only"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, 'logo')}
                                                    disabled={uploadingLogo}
                                                />
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                {uploadingLogo ? 'Uploading...' : 'Select Logo'}
                                            </label>
                                            {logoPreview && (
                                                <button
                                                    type="button"
                                                    onClick={() => { setData('logo', ''); setLogoPreview(''); }}
                                                    className="bg-red-600 hover:bg-red-700 text-white rounded-md px-4 py-2 text-sm"
                                                >
                                                    Remove Logo
                                                </button>
                                            )}
                                        </div>
                                        {!logoPreview && (
                                            <p className="text-sm text-gray-500">Select the building logo (PNG, JPG, SVG, WebP, max 5MB)</p>
                                        )}
                                    </div>
                                    <InputError message={errors.logo} className="mt-2" />

                                    {logoPreview && (
                                        <div className="mt-3">
                                            <img
                                                src={logoPreview}
                                                alt="Building logo"
                                                className="h-32 w-auto max-w-xs object-contain rounded-lg border border-gray-200 bg-gray-50 p-2"
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/200x120?text=Invalid+Image'; }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Gallery Images Section */}
                            <div className="mb-8 border-t pt-6">
                                <h3 className="text-sm font-semibold text-gray-700 mb-4">Gallery Images</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <label className="relative cursor-pointer bg-green-600 rounded-md font-medium text-white hover:bg-green-700 px-4 py-2 inline-flex items-center">
                                            <input
                                                type="file"
                                                className="sr-only"
                                                accept="image/*"
                                                multiple
                                                onChange={(e) => handleImageUpload(e, 'gallery')}
                                                disabled={uploadingGalleryImage}
                                            />
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            {uploadingGalleryImage ? 'Uploading...' : 'Add Gallery Images (Multiple)'}
                                        </label>
                                        <span className="text-sm text-gray-500">
                                            {galleryImages.length} image{galleryImages.length !== 1 ? 's' : ''} in gallery
                                        </span>
                                    </div>

                                    {/* Gallery Images Grid */}
                                    {galleryImages.length > 0 && (
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                                            {galleryImages.map((image, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={image}
                                                        alt={`Gallery image ${index + 1}`}
                                                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/200x150?text=Invalid+Image';
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setPendingImageDelete({ imageUrl: image, isMainImage: false })}
                                                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Delete image"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {galleryImages.length === 0 && (
                                        <p className="text-sm text-gray-500 italic">No gallery images uploaded yet</p>
                                    )}
                                </div>
                            </div>

                            {/* Website Links */}
                            <div className="border-t pt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                <div className="sm:col-span-3">
                                    <InputLabel htmlFor="website_url" value="Website URL" />
                                    <TextInput
                                        id="website_url"
                                        type="url"
                                        className="mt-1 block w-full"
                                        value={data.website_url}
                                        onChange={(e) => setData('website_url', e.target.value)}
                                        placeholder="https://example.com"
                                    />
                                    <InputError message={errors.website_url} className="mt-2" />
                                </div>


                                <div className="sm:col-span-3">
                                    <InputLabel htmlFor="virtual_tour_url" value="Virtual Tour URL" />
                                    <TextInput
                                        id="virtual_tour_url"
                                        type="url"
                                        className="mt-1 block w-full"
                                        value={data.virtual_tour_url}
                                        onChange={(e) => setData('virtual_tour_url', e.target.value)}
                                        placeholder="https://example.com/tour"
                                    />
                                    <InputError message={errors.virtual_tour_url} className="mt-2" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status & Settings */}
                    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                        <div className="px-4 py-6 sm:p-8">
                            <h2 className="text-base font-semibold leading-7 text-gray-900 mb-6">Status & Settings</h2>
                            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                <div className="sm:col-span-3">
                                    <InputLabel htmlFor="status" value="Visibility Status" />
                                    <select
                                        id="status"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                    <InputError message={errors.status} className="mt-2" />
                                </div>

                                <div className="sm:col-span-3">
                                    <div className="flex items-center mt-6">
                                        <input
                                            id="is_featured"
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                            checked={data.is_featured}
                                            onChange={(e) => setData('is_featured', e.target.checked)}
                                        />
                                        <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-900">
                                            Featured Building
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions — sticky so Save is always reachable on the long form */}
                    <div className="sticky bottom-0 z-10 -mx-4 sm:mx-0 flex items-center justify-end gap-x-4 border-t border-gray-200 bg-white/95 backdrop-blur px-4 py-3 sm:rounded-t-lg">
                        <Link href={route('admin.buildings.index')}>
                            <SecondaryButton type="button">
                                Cancel
                            </SecondaryButton>
                        </Link>
                        <PrimaryButton type="submit" disabled={processing}>
                            {processing ? 'Updating...' : 'Update Building'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>

            <ConfirmDialog
                open={Boolean(pendingImageDelete)}
                title="Delete image?"
                message="This image will be permanently deleted from the building. This can't be undone."
                confirmLabel="Delete"
                onConfirm={() => {
                    const target = pendingImageDelete;
                    setPendingImageDelete(null);
                    if (target) handleDeleteImage(target.imageUrl, target.isMainImage);
                }}
                onCancel={() => setPendingImageDelete(null)}
            />

            <DeveloperModal
                open={showDeveloperModal}
                onClose={() => setShowDeveloperModal(false)}
                onCreated={handleDeveloperCreated}
            />
        </AdminLayout>
    );
}