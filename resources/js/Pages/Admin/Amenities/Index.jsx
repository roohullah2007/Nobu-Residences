import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function AmenitiesIndex({ auth, amenities }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingAmenity, setEditingAmenity] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        icon: '',
        category: 'Building Features',
        description: ''
    });

    const categories = [
        'Building Features',
        'Health & Wellness',
        'Entertainment',
        'Business',
        'Outdoor',
        'Parking'
    ];

    const defaultIcons = {
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
        'Indoor Pool': '🏊',
        'Outdoor Pool': '🏖️',
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
        'Car Wash': '🚗',
        'Wine Cellar': '🍷',
        'Billiards': '🎱',
        'Golf Simulator': '⛳',
        'Bowling': '🎳',
        'Kids Room': '🧸',
        'Pet Wash': '🐾',
        'Storage': '📦',
        'Mail Room': '📬',
        'Recycling': '♻️'
    };

    const handleCreate = (e) => {
        e.preventDefault();
        post(route('admin.amenities.store'), {
            onSuccess: () => {
                reset();
                setShowCreateModal(false);
            }
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        put(route('admin.amenities.update', editingAmenity.id), {
            onSuccess: () => {
                reset();
                setShowEditModal(false);
                setEditingAmenity(null);
            }
        });
    };

    const handleDelete = (id, name) => {
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
            router.delete(route('admin.amenities.destroy', id));
        }
    };

    const openEditModal = (amenity) => {
        setEditingAmenity(amenity);
        setData({
            name: amenity.name,
            icon: amenity.icon || '',
            category: amenity.category || 'Building Features',
            description: amenity.description || ''
        });
        setShowEditModal(true);
    };

    const openCreateModal = () => {
        reset();
        setShowCreateModal(true);
    };

    const filteredAmenities = (amenities.data || amenities).filter(amenity => {
        const matchesSearch = amenity.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || amenity.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const suggestIcon = () => {
        const icon = defaultIcons[data.name] || '✨';
        setData('icon', icon);
    };

    return (
        <AdminLayout title="Amenities Management">
            <Head title="Amenities Management" />

            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-base font-semibold leading-6 text-gray-900">Amenities Management</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Manage building amenities and their icons.
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <PrimaryButton onClick={openCreateModal}>
                        Add Amenity
                    </PrimaryButton>
                </div>
            </div>

            <div className="mt-8">
                {/* Filters */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search Amenities
                            </label>
                            <input
                                type="text"
                                placeholder="Search by name..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Filter by Category
                            </label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="all">All Categories</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Amenities Grid */}
                <div className="bg-white shadow rounded-lg">
                    <div className="p-6">
                        {filteredAmenities.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredAmenities.map((amenity) => (
                                    <div
                                        key={amenity.id}
                                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl">
                                                    {amenity.icon || defaultIcons[amenity.name] || '✨'}
                                                </span>
                                                <div>
                                                    <h3 className="font-medium text-gray-900">
                                                        {amenity.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {amenity.category || 'Building Features'}
                                                    </p>
                                                    {amenity.description && (
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {amenity.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex gap-2">
                                            <button
                                                onClick={() => openEditModal(amenity)}
                                                className="flex-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(amenity.id, amenity.name)}
                                                className="flex-1 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <span className="text-4xl mb-4 block">🏢</span>
                                <p className="text-gray-500">No amenities found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-lg font-semibold mb-4">Create New Amenity</h2>
                        <form onSubmit={handleCreate}>
                            <div className="space-y-4">
                                <div>
                                    <InputLabel htmlFor="name" value="Amenity Name *" />
                                    <div className="flex gap-2">
                                        <TextInput
                                            id="name"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={suggestIcon}
                                            className="mt-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                                            title="Suggest icon based on name"
                                        >
                                            🎯
                                        </button>
                                    </div>
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="icon" value="Icon (Emoji)" />
                                    <div className="flex gap-2 items-center">
                                        <TextInput
                                            id="icon"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={data.icon}
                                            onChange={(e) => setData('icon', e.target.value)}
                                            placeholder="Enter an emoji or leave empty"
                                        />
                                        <span className="text-2xl">{data.icon || '✨'}</span>
                                    </div>
                                    <InputError message={errors.icon} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="category" value="Category" />
                                    <select
                                        id="category"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                    >
                                        {categories.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.category} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="description" value="Description" />
                                    <textarea
                                        id="description"
                                        rows={2}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                    />
                                    <InputError message={errors.description} className="mt-2" />
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3 justify-end">
                                <SecondaryButton type="button" onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </SecondaryButton>
                                <PrimaryButton type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-lg font-semibold mb-4">Edit Amenity</h2>
                        <form onSubmit={handleEdit}>
                            <div className="space-y-4">
                                <div>
                                    <InputLabel htmlFor="edit-name" value="Amenity Name *" />
                                    <div className="flex gap-2">
                                        <TextInput
                                            id="edit-name"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={suggestIcon}
                                            className="mt-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                                            title="Suggest icon based on name"
                                        >
                                            🎯
                                        </button>
                                    </div>
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="edit-icon" value="Icon (Emoji)" />
                                    <div className="flex gap-2 items-center">
                                        <TextInput
                                            id="edit-icon"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={data.icon}
                                            onChange={(e) => setData('icon', e.target.value)}
                                            placeholder="Enter an emoji or leave empty"
                                        />
                                        <span className="text-2xl">{data.icon || '✨'}</span>
                                    </div>
                                    <InputError message={errors.icon} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="edit-category" value="Category" />
                                    <select
                                        id="edit-category"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                    >
                                        {categories.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.category} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="edit-description" value="Description" />
                                    <textarea
                                        id="edit-description"
                                        rows={2}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                    />
                                    <InputError message={errors.description} className="mt-2" />
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3 justify-end">
                                <SecondaryButton type="button" onClick={() => {
                                    setShowEditModal(false);
                                    setEditingAmenity(null);
                                    reset();
                                }}>
                                    Cancel
                                </SecondaryButton>
                                <PrimaryButton type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}