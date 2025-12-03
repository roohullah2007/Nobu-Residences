import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link } from '@inertiajs/react';

export default function MLSShow({ property }) {
    const [selectedImage, setSelectedImage] = useState(0);

    return (
        <AdminLayout title={`Property Details - ${property.mls_number}`}>
            <div className="space-y-6">
                {/* Back Button */}
                <Link
                    href={route('admin.mls.index')}
                    className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Properties
                </Link>

                {/* Property Header */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{property.address}</h1>
                            <p className="text-lg text-gray-600 mt-1">{property.city}, {property.province} {property.postal_code}</p>
                            <p className="text-sm text-gray-500 mt-2">MLS #: {property.mls_number}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold text-indigo-600">
                                ${property.price ? property.price.toLocaleString() : 'N/A'}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">{property.property_type}</p>
                            <span className={`mt-2 inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                                property.status === 'active' ? 'bg-green-100 text-green-800' :
                                property.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                                property.status === 'leased' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                                {property.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Images Gallery */}
                {property.image_urls && property.image_urls.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Property Images ({property.image_urls.length})
                        </h2>

                        {/* Main Image */}
                        <div className="mb-4">
                            <img
                                src={property.image_urls[selectedImage]}
                                alt={`${property.address} - Image ${selectedImage + 1}`}
                                className="w-full h-96 object-cover rounded-lg"
                            />
                        </div>

                        {/* Thumbnail Gallery */}
                        <div className="grid grid-cols-6 gap-2">
                            {property.image_urls.map((url, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`relative aspect-square rounded-lg overflow-hidden ${
                                        selectedImage === index ? 'ring-2 ring-indigo-600' : ''
                                    }`}
                                >
                                    <img
                                        src={url}
                                        alt={`Thumbnail ${index + 1}`}
                                        className="w-full h-full object-cover hover:opacity-75 transition-opacity"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Property Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Key Details */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Details</h2>
                        <dl className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <dt className="text-sm font-medium text-gray-600">Property Type</dt>
                                <dd className="text-sm text-gray-900">{property.property_sub_type || 'N/A'}</dd>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <dt className="text-sm font-medium text-gray-600">Bedrooms</dt>
                                <dd className="text-sm text-gray-900">{property.bedrooms || 0}</dd>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <dt className="text-sm font-medium text-gray-600">Bathrooms</dt>
                                <dd className="text-sm text-gray-900">{property.bathrooms || 0}</dd>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <dt className="text-sm font-medium text-gray-600">Parking Spaces</dt>
                                <dd className="text-sm text-gray-900">{property.parking_spaces || 0}</dd>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <dt className="text-sm font-medium text-gray-600">Square Footage</dt>
                                <dd className="text-sm text-gray-900">
                                    {property.square_footage ? property.square_footage.toLocaleString() + ' sq ft' : 'N/A'}
                                </dd>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <dt className="text-sm font-medium text-gray-600">Lot Size</dt>
                                <dd className="text-sm text-gray-900">
                                    {property.lot_size ? property.lot_size.toLocaleString() + ' sq ft' : 'N/A'}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Sync Information */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Sync Information</h2>
                        <dl className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <dt className="text-sm font-medium text-gray-600">MLS ID</dt>
                                <dd className="text-sm text-gray-900 font-mono">{property.mls_id}</dd>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <dt className="text-sm font-medium text-gray-600">Last Synced</dt>
                                <dd className="text-sm text-gray-900">
                                    {property.last_synced_at ? new Date(property.last_synced_at).toLocaleString() : 'Never'}
                                </dd>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <dt className="text-sm font-medium text-gray-600">Listed Date</dt>
                                <dd className="text-sm text-gray-900">
                                    {property.listed_date ? new Date(property.listed_date).toLocaleDateString() : 'N/A'}
                                </dd>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <dt className="text-sm font-medium text-gray-600">Updated Date</dt>
                                <dd className="text-sm text-gray-900">
                                    {property.updated_date ? new Date(property.updated_date).toLocaleDateString() : 'N/A'}
                                </dd>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <dt className="text-sm font-medium text-gray-600">Active Status</dt>
                                <dd className="text-sm">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        property.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {property.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </dd>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <dt className="text-sm font-medium text-gray-600">Sync Status</dt>
                                <dd className="text-sm">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        property.sync_failed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                    }`}>
                                        {property.sync_failed ? 'Failed' : 'Success'}
                                    </span>
                                </dd>
                            </div>
                            {property.sync_error && (
                                <div className="py-2">
                                    <dt className="text-sm font-medium text-gray-600 mb-1">Sync Error</dt>
                                    <dd className="text-sm text-red-600 bg-red-50 p-2 rounded">{property.sync_error}</dd>
                                </div>
                            )}
                        </dl>
                    </div>
                </div>

                {/* Location */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <dt className="text-sm font-medium text-gray-600">Full Address</dt>
                            <dd className="text-sm text-gray-900 mt-1">{property.address}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-600">City</dt>
                            <dd className="text-sm text-gray-900 mt-1">{property.city}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-600">Province</dt>
                            <dd className="text-sm text-gray-900 mt-1">{property.province}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-600">Postal Code</dt>
                            <dd className="text-sm text-gray-900 mt-1">{property.postal_code}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-600">Latitude</dt>
                            <dd className="text-sm text-gray-900 mt-1 font-mono">{property.latitude || 'N/A'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-600">Longitude</dt>
                            <dd className="text-sm text-gray-900 mt-1 font-mono">{property.longitude || 'N/A'}</dd>
                        </div>
                    </dl>
                </div>

                {/* Raw MLS Data */}
                {property.mls_data && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Raw MLS Data</h2>
                        <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                            <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                                {JSON.stringify(property.mls_data, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
