import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function BuildingsCreate({ auth, developers = [], amenities = [], maintenanceFeeAmenities = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        address: '',
        city: '',
        province: 'ON',
        postal_code: '',
        country: 'Canada',
        building_type: 'condominium',
        total_units: '',
        year_built: '',
        description: '',
        main_image: '',
        images: [],
        developer_id: '',
        is_featured: false,
        latitude: '',
        longitude: '',
        amenity_ids: [],
        floors: '',
        parking_spots: '',
        locker_spots: '',
        maintenance_fee_range: '',
        price_range: '',
        website_url: '',
        floor_plans: [],
        virtual_tour_url: '',
        features: [],
        nearby_transit: [],
        neighborhood_info: '',
        deposit_structure: '',
        estimated_completion: '',
        architect: '',
        interior_designer: '',
        landscape_architect: '',
        status: 'active',
        listing_type: 'For Sale',
        maintenance_fee_amenity_ids: []
    });

    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [selectedMaintenanceFeeAmenities, setSelectedMaintenanceFeeAmenities] = useState([]);
    const [imagePreview, setImagePreview] = useState('');
    const [showAmenitySelector, setShowAmenitySelector] = useState(false);
    const [amenitySearch, setAmenitySearch] = useState('');
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

    const amenityCategories = {
        'Building Features': ['Concierge', 'Security', 'Elevator', 'Party Room', 'Guest Suite', 'Rooftop Terrace'],
        'Health & Wellness': ['Gym', 'Yoga Studio', 'Spa', 'Sauna', 'Steam Room', 'Pool'],
        'Entertainment': ['Theatre', 'Games Room', 'Library', 'BBQ Area', 'Lounge'],
        'Business': ['Business Centre', 'Meeting Room', 'Co-working Space'],
        'Outdoor': ['Garden', 'Playground', 'Dog Park', 'Tennis Court', 'Basketball Court'],
        'Parking': ['Visitor Parking', 'EV Charging', 'Bike Storage', 'Car Wash']
    };

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
        const formData = {
            ...data,
            amenity_ids: selectedAmenities.map(a => a.id),
            maintenance_fee_amenity_ids: selectedMaintenanceFeeAmenities.map(a => a.id)
        };
        post(route('admin.buildings.store'), formData);
    };

    const toggleAmenity = (amenity) => {
        const exists = selectedAmenities.find(a => a.id === amenity.id);
        if (exists) {
            setSelectedAmenities(selectedAmenities.filter(a => a.id !== amenity.id));
        } else {
            setSelectedAmenities([...selectedAmenities, amenity]);
        }
    };

    const toggleMaintenanceFeeAmenity = (amenity) => {
        const exists = selectedMaintenanceFeeAmenities.find(a => a.id === amenity.id);
        if (exists) {
            setSelectedMaintenanceFeeAmenities(selectedMaintenanceFeeAmenities.filter(a => a.id !== amenity.id));
        } else {
            setSelectedMaintenanceFeeAmenities([...selectedMaintenanceFeeAmenities, amenity]);
        }
    };

    const filteredAmenities = amenities.filter(amenity =>
        amenity.name.toLowerCase().includes(amenitySearch.toLowerCase())
    );

    return (
        <AdminLayout title="Create Building">
            <Head title="Create Building" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <h1 className="text-base font-semibold leading-6 text-gray-900">Create New Building</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Add a new building to your real estate portfolio.
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

                                <div className="sm:col-span-3">
                                    <InputLabel htmlFor="listing_type" value="Listing Type *" />
                                    <select
                                        id="listing_type"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.listing_type}
                                        onChange={(e) => setData('listing_type', e.target.value)}
                                        required
                                    >
                                        <option value="For Sale">For Sale</option>
                                        <option value="For Rent">For Rent</option>
                                        <option value="Both">Both (Sale & Rent)</option>
                                    </select>
                                    <InputError message={errors.listing_type} className="mt-2" />
                                </div>

                                <div className="sm:col-span-3">
                                    <InputLabel htmlFor="status" value="Status *" />
                                    <select
                                        id="status"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        required
                                    >
                                        <option value="active">Active</option>
                                        <option value="pre_construction">Pre Construction</option>
                                        <option value="under_construction">Under Construction</option>
                                        <option value="completed">Completed</option>
                                        <option value="sold_out">Sold Out</option>
                                    </select>
                                    <InputError message={errors.status} className="mt-2" />
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

                                    {amenities.length > 0 ? (
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
                                    ) : (
                                        <div className="space-y-4">
                                            {Object.entries(amenityCategories).map(([category, items]) => (
                                                <div key={category}>
                                                    <h4 className="font-medium text-gray-700 mb-2">{category}</h4>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                                        {items.map(item => {
                                                            const amenity = { id: item, name: item, icon: amenityIcons[item] };
                                                            const isSelected = selectedAmenities.find(a => a.name === item);
                                                            return (
                                                                <button
                                                                    key={item}
                                                                    type="button"
                                                                    onClick={() => toggleAmenity(amenity)}
                                                                    className={`flex items-center gap-2 p-2 rounded-lg text-sm transition-colors ${
                                                                        isSelected
                                                                            ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                                                                            : 'bg-white hover:bg-gray-100 border border-gray-200'
                                                                    }`}
                                                                >
                                                                    <span className="text-lg">{amenityIcons[item]}</span>
                                                                    <span className="text-left">{item}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
                            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                <div className="sm:col-span-3">
                                    <InputLabel htmlFor="main_image" value="Main Image URL" />
                                    <TextInput
                                        id="main_image"
                                        type="url"
                                        className="mt-1 block w-full"
                                        value={data.main_image}
                                        onChange={(e) => {
                                            setData('main_image', e.target.value);
                                            setImagePreview(e.target.value);
                                        }}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    <InputError message={errors.main_image} className="mt-2" />
                                </div>

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

                                {imagePreview && (
                                    <div className="sm:col-span-6">
                                        <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
                                        <img
                                            src={imagePreview}
                                            alt="Building preview"
                                            className="max-w-xs rounded-lg shadow-md"
                                            onError={() => setImagePreview('')}
                                        />
                                    </div>
                                )}
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
                            {processing ? 'Creating...' : 'Create Building'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}