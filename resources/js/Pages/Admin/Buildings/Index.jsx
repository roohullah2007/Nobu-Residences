import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PrimaryButton from '@/Components/PrimaryButton';

export default function BuildingsIndex({ auth, buildings }) {
    const [searchTerm, setSearchTerm] = useState('');
    
    // Create slug for building URL
    const createBuildingSlug = (name, id) => {
        if (!name) return id;
        const slug = name.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
        return `${slug}-${id}`;
    };

    const handleDelete = (building) => {
        if (confirm(`Are you sure you want to delete "${building.name}"?`)) {
            const slug = createBuildingSlug(building.name, building.id);
            router.delete(route('admin.buildings.destroy', slug));
        }
    };

    const filteredBuildings = buildings.data.filter(building =>
        building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        building.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        building.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getBuildingTypeLabel = (type) => {
        const types = {
            'condominium': 'Condominium',
            'apartment': 'Apartment',
            'townhouse': 'Townhouse',
            'commercial': 'Commercial',
            'mixed_use': 'Mixed Use'
        };
        return types[type] || type;
    };

    const getStatusBadge = (status) => {
        if (!status) {
            status = 'pending'; // Default status if undefined
        }
        const statusColors = {
            'active': 'bg-green-100 text-green-800',
            'inactive': 'bg-gray-100 text-gray-800',
            'pending': 'bg-yellow-100 text-yellow-800'
        };
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || statusColors['pending']}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <AdminLayout title="Buildings Management">
            <Head title="Buildings Management" />

            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-base font-semibold leading-6 text-gray-900">Buildings Management</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Manage real estate buildings, properties, and related information.
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <Link href={route('admin.buildings.create')}>
                        <PrimaryButton>
                            Add Building
                        </PrimaryButton>
                    </Link>
                </div>
            </div>

            <div className="mt-8">
                <div className="bg-white shadow rounded-lg">
                    <div className="p-6">
                            {/* Search Bar */}
                            <div className="mb-6">
                                <input
                                    type="text"
                                    placeholder="Search buildings by name, address, or city..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Buildings Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Building
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Location
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Featured
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredBuildings.length > 0 ? (
                                            filteredBuildings.map((building) => (
                                                <tr key={building.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10">
                                                                {building.main_image && building.main_image !== '/images/no-image-placeholder.jpg' ? (
                                                                    <img
                                                                        className="h-10 w-10 rounded-full object-cover"
                                                                        src={building.main_image}
                                                                        alt={building.name}
                                                                    />
                                                                ) : (
                                                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                                        <span className="text-gray-500 text-xl">🏢</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {building.name}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    Created: {building.created_at}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{building.address}</div>
                                                        <div className="text-sm text-gray-500">
                                                            {building.city}, {building.province}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm text-gray-900">
                                                            {getBuildingTypeLabel(building.building_type)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(building.status)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        {building.is_featured ? (
                                                            <span className="text-yellow-400 inline">⭐</span>
                                                        ) : (
                                                            <span className="text-gray-300">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end space-x-3">
                                                            <Link
                                                                href={route('admin.buildings.show', createBuildingSlug(building.name, building.id))}
                                                                className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm font-medium"
                                                            >
                                                                <span className="mr-1">👁</span>
                                                                View
                                                            </Link>
                                                            <Link
                                                                href={route('admin.buildings.edit', createBuildingSlug(building.name, building.id))}
                                                                className="inline-flex items-center px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors text-sm font-medium"
                                                            >
                                                                <span className="mr-1">✏</span>
                                                                Edit
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(building)}
                                                                className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm font-medium"
                                                            >
                                                                <span className="mr-1">🗑</span>
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                                    No buildings found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {buildings.links && buildings.links.length > 3 && (
                                <div className="mt-6 flex justify-center">
                                    <nav className="flex items-center space-x-2">
                                        {buildings.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-3 py-1 rounded ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white'
                                                        : link.url
                                                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                preserveScroll
                                            />
                                        ))}
                                    </nav>
                                </div>
                            )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}