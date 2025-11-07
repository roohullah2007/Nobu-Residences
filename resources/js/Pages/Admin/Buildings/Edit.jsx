import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function BuildingsEdit({ auth, building, developers = [], amenities = [], maintenanceFeeAmenities = [] }) {
    // Debug logging
    console.log('=== BuildingsEdit Component Loaded ===');
    console.log('Building prop:', building);
    console.log('Building amenity_ids:', building.amenity_ids);
    console.log('Available amenities:', amenities);
    console.log('Amenities count:', amenities.length);

    const { data, setData, put, processing, errors } = useForm({
        name: building.name || '',
        address: building.address || '',
        street_address_1: building.street_address_1 || '',
        street_address_2: building.street_address_2 || '',
        city: building.city || '',
        province: building.province || 'ON',
        postal_code: building.postal_code || '',
        country: building.country || 'Canada',
        building_type: building.building_type || 'condominium',
        total_units: building.total_units || '',
        year_built: building.year_built || '',
        description: building.description || '',
        main_image: building.main_image || '',
        images: building.images || [],
        developer_id: building.developer_id || '',
        status: building.status || 'active',
        listing_type: building.listing_type || 'For Sale',
        is_featured: building.is_featured || false,
        latitude: building.latitude || '',
        longitude: building.longitude || '',
        amenity_ids: building.amenity_ids || [],
        floors: building.floors || '',
        parking_spots: building.parking_spots || '',
        locker_spots: building.locker_spots || '',
        maintenance_fee_range: building.maintenance_fee_range || '',
        price_range: building.price_range || '',
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
        developer_name: building.developer_name || '',
        management_name: building.management_name || '',
        corp_number: building.corp_number || '',
        date_registered: building.date_registered || ''
    });

    // Initialize selected amenities immediately from props
    const initSelectedAmenities = () => {
        console.log('=== Initializing Selected Amenities ===');
        console.log('Building object:', building);
        console.log('Checking conditions:');
        console.log('- building.amenity_ids exists?', !!building.amenity_ids);
        console.log('- building.amenity_ids type:', typeof building.amenity_ids);
        console.log('- building.amenity_ids value:', building.amenity_ids);
        console.log('- building.amenity_ids length?', building.amenity_ids ? building.amenity_ids.length : 0);
        console.log('- amenities length?', amenities.length);
        console.log('- amenities sample:', amenities.slice(0, 2));

        // Ensure amenity_ids is an array
        const amenityIds = Array.isArray(building.amenity_ids) ? building.amenity_ids : [];
        
        if (amenityIds.length > 0 && amenities.length > 0) {
            const selected = amenities.filter(a => {
                const isIncluded = amenityIds.includes(a.id);
                console.log(`Checking amenity ${a.name} (${a.id}): ${isIncluded}`);
                return isIncluded;
            });
            console.log('Selected amenities found:', selected);
            return selected;
        }
        console.log('No amenities selected (conditions not met)');
        return [];
    };

    const [selectedAmenities, setSelectedAmenities] = useState(initSelectedAmenities());
    console.log('State initialized with selectedAmenities:', selectedAmenities);

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
    const [galleryImages, setGalleryImages] = useState(
        Array.isArray(building.images) ? building.images :
        (building.images ? JSON.parse(building.images) : [])
    );
    const [showAmenitySelector, setShowAmenitySelector] = useState(false);
    const [amenitySearch, setAmenitySearch] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingGalleryImage, setUploadingGalleryImage] = useState(false);
    const [showMaintenanceAmenitySelector, setShowMaintenanceAmenitySelector] = useState(false);
    const [generatingAiDescription, setGeneratingAiDescription] = useState(false);
    const [aiDescriptionError, setAiDescriptionError] = useState('');

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
            // Get CSRF token from meta tag
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch('/api/buildings/generate-ai-description', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
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
                        amenities: selectedAmenities.map(a => a.name),
                        maintenance_fee_amenities: selectedMaintenanceFeeAmenities.map(a => a.name),
                        price_range: data.price_range,
                        maintenance_fee_range: data.maintenance_fee_range,
                        developer_name: data.developer_name,
                        management_name: data.management_name,
                        existing_description: data.description
                    }
                })
            });

            const result = await response.json();

            if (result.success && result.description) {
                setData('description', result.description);
                console.log('✅ 🤖 Building AI description generated successfully');
            } else {
                setAiDescriptionError(result.error || 'Failed to generate AI description');
                console.error('❌ 🤖 Error generating building AI description:', result.error);
            }
        } catch (error) {
            console.error('❌ 🤖 Error generating building AI description:', error);
            setAiDescriptionError('Failed to generate AI description. Please try again.');
        } finally {
            setGeneratingAiDescription(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        console.log('=== Form Submission ===');
        console.log('Current selectedAmenities:', selectedAmenities);
        console.log('Current data.amenity_ids:', data.amenity_ids);
        
        const amenityIds = selectedAmenities.map(a => a.id);
        console.log('Mapped amenity IDs:', amenityIds);
        
        const formData = {
            ...data,
            amenity_ids: amenityIds,
            maintenance_fee_amenity_ids: selectedMaintenanceFeeAmenities.map(a => a.id)
        };
        
        console.log('Final form data being sent:', formData);
        console.log('Amenities in form data:', formData.amenity_ids);
        
        put(route('admin.buildings.update', building.id), formData);
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
        
        console.log('Amenity toggled:', {
            amenity: amenity.name,
            action: exists ? 'removed' : 'added',
            newSelectedCount: newSelectedAmenities.length,
            newSelectedIds: newSelectedAmenities.map(a => a.id)
        });
    };

    const toggleMaintenanceFeeAmenity = (amenity) => {
        const exists = selectedMaintenanceFeeAmenities.find(a => a.id === amenity.id);
        if (exists) {
            setSelectedMaintenanceFeeAmenities(selectedMaintenanceFeeAmenities.filter(a => a.id !== amenity.id));
        } else {
            setSelectedMaintenanceFeeAmenities([...selectedMaintenanceFeeAmenities, amenity]);
        }
    };

    const handleImageUpload = async (e, imageType = 'main') => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // For main image, only take the first file
        const filesToUpload = imageType === 'main' ? [files[0]] : files;

        // Validate file types and sizes
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        for (const file of filesToUpload) {
            if (!validTypes.includes(file.type)) {
                alert(`Invalid file type: ${file.name}. Please upload valid image files (JPEG, PNG, GIF, or WebP).`);
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert(`File too large: ${file.name}. Images must be less than 5MB.`);
                return;
            }
        }

        if (imageType === 'main') {
            setUploadingImage(true);
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
                } else {
                    console.error('Upload failed:', result.message);
                    return null;
                }
            } catch (error) {
                console.error(`Error uploading ${file.name}:`, error);
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
                } else {
                    const updatedImages = [...galleryImages, ...successfulUploads];
                    setGalleryImages(updatedImages);
                    setData('images', updatedImages);
                }

                if (successfulUploads.length < filesToUpload.length) {
                    alert(`${successfulUploads.length} of ${filesToUpload.length} images uploaded successfully.`);
                }
            } else {
                alert('Failed to upload images. Please try again.');
            }
        } catch (error) {
            console.error('Image upload error:', error);
            alert('Failed to upload images. Please try again.');
        } finally {
            if (imageType === 'main') {
                setUploadingImage(false);
            } else {
                setUploadingGalleryImage(false);
            }
            // Reset the input
            e.target.value = null;
        }
    };

    const handleDeleteImage = async (imageUrl, isMainImage = false) => {
        if (!confirm('Are you sure you want to delete this image?')) return;

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
                alert('Failed to delete image. Please try again.');
            }
        } catch (error) {
            console.error('Image delete error:', error);
            alert('Failed to delete image. Please try again.');
        }
    };

    const filteredAmenities = amenities.filter(amenity =>
        amenity.name.toLowerCase().includes(amenitySearch.toLowerCase())
    );

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
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-8">
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

                                <div className="sm:col-span-4">
                                    <InputLabel htmlFor="address" value="Address *" />
                                    <TextInput
                                        id="address"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.address} className="mt-2" />
                                </div>

                                <div className="sm:col-span-3">
                                    <InputLabel htmlFor="street_address_1" value="Street Address 1" />
                                    <TextInput
                                        id="street_address_1"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.street_address_1}
                                        onChange={(e) => setData('street_address_1', e.target.value)}
                                        placeholder="e.g., 15 Mercer St"
                                    />
                                    <InputError message={errors.street_address_1} className="mt-2" />
                                    <p className="text-xs text-gray-500 mt-1">For buildings with multiple addresses</p>
                                </div>

                                <div className="sm:col-span-3">
                                    <InputLabel htmlFor="street_address_2" value="Street Address 2" />
                                    <TextInput
                                        id="street_address_2"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.street_address_2}
                                        onChange={(e) => setData('street_address_2', e.target.value)}
                                        placeholder="e.g., 35 Mercer"
                                    />
                                    <InputError message={errors.street_address_2} className="mt-2" />
                                    <p className="text-xs text-gray-500 mt-1">Optional second address for the same building</p>
                                </div>

                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="city" value="City *" />
                                    <TextInput
                                        id="city"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.city} className="mt-2" />
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
                                    />
                                    <InputError message={errors.country} className="mt-2" />
                                </div>

                                <div className="sm:col-span-6">
                                    <div className="flex items-center justify-between">
                                        <InputLabel htmlFor="description" value="Description" />
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
                                    <textarea
                                        id="description"
                                        rows={4}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                                    <InputError message={errors.year_built} className="mt-2" />
                                </div>

                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="parking_spots" value="Parking Spots" />
                                    <TextInput
                                        id="parking_spots"
                                        type="number"
                                        className="mt-1 block w-full"
                                        value={data.parking_spots}
                                        onChange={(e) => setData('parking_spots', e.target.value)}
                                    />
                                    <InputError message={errors.parking_spots} className="mt-2" />
                                </div>

                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="locker_spots" value="Locker Spots" />
                                    <TextInput
                                        id="locker_spots"
                                        type="number"
                                        className="mt-1 block w-full"
                                        value={data.locker_spots}
                                        onChange={(e) => setData('locker_spots', e.target.value)}
                                    />
                                    <InputError message={errors.locker_spots} className="mt-2" />
                                </div>

                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="developer_id" value="Developer" />
                                    <select
                                        id="developer_id"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.developer_id}
                                        onChange={(e) => setData('developer_id', e.target.value)}
                                    >
                                        <option value="">Select a developer</option>
                                        {developers.map(developer => (
                                            <option key={developer.id} value={developer.id}>
                                                {developer.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.developer_id} className="mt-2" />
                                </div>

                                <div className="sm:col-span-2">
                                    <InputLabel htmlFor="developer_name" value="Developer Name (Text)" />
                                    <TextInput
                                        id="developer_name"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.developer_name}
                                        onChange={(e) => setData('developer_name', e.target.value)}
                                        placeholder="Developer name"
                                    />
                                    <InputError message={errors.developer_name} className="mt-2" />
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
                                    <InputLabel htmlFor="price_range" value="Price Range" />
                                    <TextInput
                                        id="price_range"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.price_range}
                                        onChange={(e) => setData('price_range', e.target.value)}
                                        placeholder="e.g., $400,000 - $1,200,000"
                                    />
                                    <InputError message={errors.price_range} className="mt-2" />
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
                                    <InputError message={errors.maintenance_fee_range} className="mt-2" />
                                </div>
                            </div>
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
                                    <div className="mb-4">
                                        <input
                                            type="text"
                                            placeholder="Search amenities..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            value={amenitySearch}
                                            onChange={(e) => setAmenitySearch(e.target.value)}
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
                                                            src={amenity.icon || '/storage/amenity-icons/amenity-default.svg'}
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
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                            {maintenanceFeeAmenities.map(amenity => {
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
                                                            src={amenity.icon || '/storage/amenity-icons/amenity-default.svg'}
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
                                                        onClick={() => handleDeleteImage(imagePreview, true)}
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
                                                        onClick={() => handleDeleteImage(image)}
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
                                    <InputLabel htmlFor="status" value="Status" />
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

                    {/* Form Actions */}
                    <div className="flex items-center justify-end gap-x-6">
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
        </AdminLayout>
    );
}