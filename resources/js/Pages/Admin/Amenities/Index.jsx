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
    const [iconPreview, setIconPreview] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        icon_file: null
    });

    const handleIconChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('icon_file', file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setIconPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreate = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', data.name);
        if (data.icon_file) {
            formData.append('icon_file', data.icon_file);
        }

        router.post(route('admin.amenities.store'), formData, {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setShowCreateModal(false);
                setIconPreview(null);
            },
            onError: (errors) => {
                console.error('Error creating amenity:', errors);
                setFormErrors(errors);
            }
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('_method', 'PUT');
        if (data.icon_file) {
            formData.append('icon_file', data.icon_file);
        }

        router.post(route('admin.amenities.update', editingAmenity.id), formData, {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setShowEditModal(false);
                setEditingAmenity(null);
                setIconPreview(null);
            },
            onError: (errors) => {
                console.error('Error updating amenity:', errors);
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
            icon_file: null
        });
        setIconPreview(amenity.icon);
        setShowEditModal(true);
    };

    const openCreateModal = () => {
        reset();
        setIconPreview(null);
        setFormErrors({});
        setShowCreateModal(true);
    };

    const filteredAmenities = (amenities.data || amenities).filter(amenity => {
        return amenity.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

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
                {/* Search */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <div className="max-w-md">
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
                </div>

                {/* Amenities Grid */}
                <div className="bg-white shadow rounded-lg">
                    <div className="p-6">
                        {filteredAmenities.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredAmenities.map((amenity) => (
                                    <div
                                        key={amenity.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            {amenity.icon ? (
                                                <img
                                                    src={amenity.icon}
                                                    alt={amenity.name}
                                                    className="w-8 h-8 object-contain"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                                                    <span className="text-gray-400 text-xs">🏢</span>
                                                </div>
                                            )}
                                            <h3 className="font-medium text-gray-900">
                                                {amenity.name}
                                            </h3>
                                        </div>
                                        <div className="flex gap-2">
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
                                    <TextInput
                                        id="name"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.name || formErrors.name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="icon_file" value="Icon Image (SVG, PNG, JPG)" />
                                    <input
                                        id="icon_file"
                                        type="file"
                                        className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                                        accept="image/svg+xml,image/png,image/jpeg,image/jpg,image/webp,.svg"
                                        onChange={handleIconChange}
                                    />
                                    <InputError message={errors.icon_file || formErrors.icon_file} className="mt-2" />

                                    {iconPreview && (
                                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-600 mb-2">Preview:</p>
                                            <img
                                                src={iconPreview}
                                                alt="Icon preview"
                                                className="w-12 h-12 object-contain"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3 justify-end">
                                <SecondaryButton type="button" onClick={() => {
                                    setShowCreateModal(false);
                                    setIconPreview(null);
                                    reset();
                                }}>
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
                                    <TextInput
                                        id="edit-name"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.name || formErrors.name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="edit-icon_file" value="Icon Image (SVG, PNG, JPG)" />
                                    <input
                                        id="edit-icon_file"
                                        type="file"
                                        className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                                        accept="image/svg+xml,image/png,image/jpeg,image/jpg,image/webp,.svg"
                                        onChange={handleIconChange}
                                    />
                                    <InputError message={errors.icon_file || formErrors.icon_file} className="mt-2" />

                                    {iconPreview && (
                                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-600 mb-2">Current/Preview:</p>
                                            <img
                                                src={iconPreview}
                                                alt="Icon preview"
                                                className="w-12 h-12 object-contain"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3 justify-end">
                                <SecondaryButton type="button" onClick={() => {
                                    setShowEditModal(false);
                                    setEditingAmenity(null);
                                    setIconPreview(null);
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