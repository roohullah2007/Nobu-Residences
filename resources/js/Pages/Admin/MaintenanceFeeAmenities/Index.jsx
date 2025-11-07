import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function MaintenanceFeeAmenitiesIndex({ auth, amenities, categories, filters = {} }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingAmenity, setEditingAmenity] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        icon: null,
        category: '',
        sort_order: 0,
        is_active: true
    });

    const handleCreate = (e) => {
        e.preventDefault();

        post(route('admin.maintenance-fee-amenities.store'), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setShowCreateModal(false);
            }
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();

        post(route('admin.maintenance-fee-amenities.update', editingAmenity.id), {
            forceFormData: true,
            _method: 'put',
            onSuccess: () => {
                reset();
                setShowEditModal(false);
                setEditingAmenity(null);
            }
        });
    };

    const handleDelete = (id, name) => {
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
            router.delete(route('admin.maintenance-fee-amenities.destroy', id));
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.maintenance-fee-amenities.index'),
            { search: searchTerm },
            { preserveState: true, preserveScroll: true }
        );
    };

    const openEditModal = (amenity) => {
        setEditingAmenity(amenity);
        setData({
            name: amenity.name,
            icon: null,
            category: amenity.category || '',
            sort_order: amenity.sort_order || 0,
            is_active: amenity.is_active
        });
        setShowEditModal(true);
    };

    const openCreateModal = () => {
        reset();
        setShowCreateModal(true);
    };

    return (
        <AdminLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Maintenance Fee Amenities
                    </h2>
                    <PrimaryButton onClick={() => setShowCreateModal(true)}>
                        Add New Amenity
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="Maintenance Fee Amenities" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {/* Search Bar */}
                            <form onSubmit={handleSearch} className="mb-6">
                                <div className="flex gap-4">
                                    <TextInput
                                        type="text"
                                        className="flex-1"
                                        placeholder="Search amenities..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <PrimaryButton type="submit">Search</PrimaryButton>
                                </div>
                            </form>

                            {/* Amenities Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Category
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Icon
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Sort Order
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {amenities.data && amenities.data.map((amenity) => (
                                            <tr key={amenity.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {amenity.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {amenity.category || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {amenity.icon ? (
                                                        <img src={amenity.icon} alt={amenity.name} className="h-6 w-6" />
                                                    ) : (
                                                        '-'
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {amenity.sort_order}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        amenity.is_active
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {amenity.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => openEditModal(amenity)}
                                                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(amenity.id, amenity.name)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {amenities.links && amenities.links.length > 3 && (
                                <div className="mt-4 flex justify-center">
                                    {amenities.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-1 mx-1 rounded ${
                                                link.active
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Maintenance Fee Amenity</h3>
                        <form onSubmit={handleCreate}>
                            <div className="mb-4">
                                <InputLabel htmlFor="name" value="Name" />
                                <TextInput
                                    id="name"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div className="mb-4">
                                <InputLabel htmlFor="category" value="Category" />
                                <select
                                    id="category"
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    value={data.category}
                                    onChange={e => setData('category', e.target.value)}
                                >
                                    <option value="">Select Category</option>
                                    <option value="Utilities">Utilities</option>
                                    <option value="Services">Services</option>
                                    <option value="Facilities">Facilities</option>
                                    {categories && categories.filter(cat => !['Utilities', 'Services', 'Facilities'].includes(cat)).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <InputError message={errors.category} className="mt-2" />
                            </div>

                            <div className="mb-4">
                                <InputLabel htmlFor="icon" value="Icon (SVG file)" />
                                <input
                                    id="icon"
                                    type="file"
                                    accept=".svg"
                                    className="mt-1 block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-md file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-indigo-50 file:text-indigo-700
                                        hover:file:bg-indigo-100"
                                    onChange={e => setData('icon', e.target.files[0])}
                                />
                                <InputError message={errors.icon} className="mt-2" />
                            </div>

                            <div className="mb-4">
                                <InputLabel htmlFor="sort_order" value="Sort Order" />
                                <TextInput
                                    id="sort_order"
                                    type="number"
                                    className="mt-1 block w-full"
                                    value={data.sort_order}
                                    onChange={e => setData('sort_order', parseInt(e.target.value) || 0)}
                                />
                                <InputError message={errors.sort_order} className="mt-2" />
                            </div>

                            <div className="mb-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                        checked={data.is_active}
                                        onChange={e => setData('is_active', e.target.checked)}
                                    />
                                    <span className="ml-2 text-sm text-gray-600">Active</span>
                                </label>
                            </div>

                            <div className="flex gap-3">
                                <PrimaryButton type="submit" disabled={processing}>
                                    Create
                                </PrimaryButton>
                                <SecondaryButton type="button" onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </SecondaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Maintenance Fee Amenity</h3>
                        <form onSubmit={handleEdit}>
                            <div className="mb-4">
                                <InputLabel htmlFor="edit-name" value="Name" />
                                <TextInput
                                    id="edit-name"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div className="mb-4">
                                <InputLabel htmlFor="edit-category" value="Category" />
                                <select
                                    id="edit-category"
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    value={data.category}
                                    onChange={e => setData('category', e.target.value)}
                                >
                                    <option value="">Select Category</option>
                                    <option value="Utilities">Utilities</option>
                                    <option value="Services">Services</option>
                                    <option value="Facilities">Facilities</option>
                                    {categories && categories.filter(cat => !['Utilities', 'Services', 'Facilities'].includes(cat)).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <InputError message={errors.category} className="mt-2" />
                            </div>

                            <div className="mb-4">
                                <InputLabel htmlFor="edit-icon" value="Icon (SVG file)" />
                                {editingAmenity?.icon && (
                                    <div className="mb-2 flex items-center gap-2">
                                        <img src={editingAmenity.icon} alt="Current icon" className="h-8 w-8" />
                                        <span className="text-sm text-gray-600">Current icon</span>
                                    </div>
                                )}
                                <input
                                    id="edit-icon"
                                    type="file"
                                    accept=".svg"
                                    className="mt-1 block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-md file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-indigo-50 file:text-indigo-700
                                        hover:file:bg-indigo-100"
                                    onChange={e => setData('icon', e.target.files[0])}
                                />
                                <p className="mt-1 text-xs text-gray-500">Leave empty to keep current icon</p>
                                <InputError message={errors.icon} className="mt-2" />
                            </div>

                            <div className="mb-4">
                                <InputLabel htmlFor="edit-sort_order" value="Sort Order" />
                                <TextInput
                                    id="edit-sort_order"
                                    type="number"
                                    className="mt-1 block w-full"
                                    value={data.sort_order}
                                    onChange={e => setData('sort_order', parseInt(e.target.value) || 0)}
                                />
                                <InputError message={errors.sort_order} className="mt-2" />
                            </div>

                            <div className="mb-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                        checked={data.is_active}
                                        onChange={e => setData('is_active', e.target.checked)}
                                    />
                                    <span className="ml-2 text-sm text-gray-600">Active</span>
                                </label>
                            </div>

                            <div className="flex gap-3">
                                <PrimaryButton type="submit" disabled={processing}>
                                    Update
                                </PrimaryButton>
                                <SecondaryButton type="button" onClick={() => setShowEditModal(false)}>
                                    Cancel
                                </SecondaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}