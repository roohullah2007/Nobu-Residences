import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function BuildingsShow({ auth, building }) {
    const getStatusBadge = (status) => {
        if (!status) {
            status = 'pending';
        }
        const statusColors = {
            'active': 'bg-green-100 text-green-800',
            'inactive': 'bg-gray-100 text-gray-800',
            'pending': 'bg-yellow-100 text-yellow-800'
        };
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || statusColors['pending']}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

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

    return (
        <AdminLayout title={`Building: ${building.name}`}>
            <Head title={`Building: ${building.name}`} />

            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-bold text-gray-900">{building.name}</h1>
                    <div className="mt-2 flex items-center space-x-4">
                        {getStatusBadge(building.status)}
                        {building.is_featured && (
                            <span className="inline-flex items-center text-yellow-500">
                                <span className="mr-1">⭐</span>
                                Featured Building
                            </span>
                        )}
                        <span className="text-sm text-gray-500">
                            Views: {building.view_count || 0}
                        </span>
                    </div>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none space-x-2">
                    <Link href={route('admin.buildings.index')} className="inline-block">
                        <SecondaryButton>
                            Back to List
                        </SecondaryButton>
                    </Link>
                    <Link href={route('admin.buildings.edit', building.id)} className="inline-block">
                        <PrimaryButton>
                            Edit Building
                        </PrimaryButton>
                    </Link>
                </div>
            </div>

            {/* Main Image Gallery */}
            {building.images && building.images.length > 0 && (
                <div className="mt-8">
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Building Images</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {building.images.map((image, index) => (
                                <img
                                    key={index}
                                    src={image}
                                    alt={`${building.name} - Image ${index + 1}`}
                                    className="w-full h-48 object-cover rounded-lg shadow-sm"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Information */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                        </div>
                        <div className="p-6">
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Building Type</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{getBuildingTypeLabel(building.building_type)}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Total Units</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{building.total_units || 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Total Floors</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{building.floors || 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Available Units</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{building.available_units_count || 0}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Year Built</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{building.year_built || 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Year Renovated</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{building.year_renovated || 'N/A'}</dd>
                                </div>
                            </dl>
                            {building.description && (
                                <div className="mt-6">
                                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{building.description}</dd>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Location Information */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Location Details</h3>
                        </div>
                        <div className="p-6">
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                <div className="sm:col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">Full Address</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{building.full_address}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Street Address</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{building.address}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">City</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{building.city}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Province</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{building.province}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Postal Code</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{building.postal_code || 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Country</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{building.country || 'Canada'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Coordinates</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {building.latitude && building.longitude 
                                            ? `${building.latitude}, ${building.longitude}` 
                                            : 'Not set'}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* Developer & Management */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Developer & Management</h3>
                        </div>
                        <div className="p-6">
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Developer</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{building.developer?.name || 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Management Company</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{building.management_company || 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Architect</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{building.architect || 'N/A'}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>

                {/* Right Column - Amenities, Features, Financial */}
                <div className="space-y-6">
                    {/* Financial Information */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Financial Details</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Maintenance Fee Range</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {building.maintenance_fee_range_min && building.maintenance_fee_range_max
                                        ? `$${Number(building.maintenance_fee_range_min).toLocaleString()} - $${Number(building.maintenance_fee_range_max).toLocaleString()}`
                                        : 'N/A'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Property Tax Range</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {building.property_tax_range_min && building.property_tax_range_max
                                        ? `$${Number(building.property_tax_range_min).toLocaleString()} - $${Number(building.property_tax_range_max).toLocaleString()}`
                                        : 'N/A'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Price Range (Available Units)</dt>
                                <dd className="mt-1 text-sm text-gray-900">{building.price_range || 'N/A'}</dd>
                            </div>
                        </div>
                    </div>

                    {/* Amenities */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Amenities</h3>
                        </div>
                        <div className="p-6">
                            {building.amenities && building.amenities.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {building.amenities.map((amenity) => (
                                        <span key={amenity.id} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                            <span>{amenity.icon || '✨'}</span>
                                            {amenity.name}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No amenities listed</p>
                            )}
                        </div>
                    </div>

                    {/* Features */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Features</h3>
                        </div>
                        <div className="p-6">
                            {building.features && building.features.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {building.features.map((feature, index) => (
                                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                            {feature}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No features listed</p>
                            )}
                        </div>
                    </div>

                    {/* Virtual Tour */}
                    {building.virtual_tour_url && (
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Virtual Tour</h3>
                            </div>
                            <div className="p-6">
                                <a 
                                    href={building.virtual_tour_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                                >
                                    <span className="mr-2">🎥</span>
                                    View Virtual Tour
                                </a>
                            </div>
                        </div>
                    )}

                    {/* MLS Information */}
                    {building.mls_building_id && (
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">MLS Information</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">MLS Building ID</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{building.mls_building_id}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Last MLS Sync</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {building.mls_last_sync 
                                            ? new Date(building.mls_last_sync).toLocaleString()
                                            : 'Never synced'}
                                    </dd>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}