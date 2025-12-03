import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router, useForm, usePage } from '@inertiajs/react';

export default function MLSIndex({ properties, stats, recentSyncs, cities, filters }) {
    const { flash } = usePage().props;
    const [syncingFull, setSyncingFull] = useState(false);
    const [syncingIncremental, setSyncingIncremental] = useState(false);
    const [selectedProperties, setSelectedProperties] = useState([]);
    const [showSyncModal, setShowSyncModal] = useState(false);
    const [syncLimit, setSyncLimit] = useState(2500);

    const { data, setData, post, processing } = useForm({
        mls_id: ''
    });

    // Filter form
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [cityFilter, setCityFilter] = useState(filters.city || '');

    const handleFullSync = () => {
        setSyncingFull(true);
        router.post(route('admin.mls.sync-full'), { limit: syncLimit }, {
            onFinish: () => {
                setSyncingFull(false);
                setShowSyncModal(false);
            }
        });
    };

    const handleIncrementalSync = () => {
        setSyncingIncremental(true);
        router.post(route('admin.mls.sync-incremental'), {}, {
            onFinish: () => setSyncingIncremental(false)
        });
    };

    const handleSyncProperty = (e) => {
        e.preventDefault();
        post(route('admin.mls.sync-property'), {
            preserveScroll: true,
            onSuccess: () => setData('mls_id', '')
        });
    };

    const handleSearch = () => {
        router.get(route('admin.mls.index'), {
            search: searchTerm,
            status: statusFilter,
            city: cityFilter,
            per_page: filters.per_page
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setCityFilter('');
        router.get(route('admin.mls.index'));
    };

    const handleBulkDelete = () => {
        if (selectedProperties.length === 0) return;

        if (confirm(`Are you sure you want to delete ${selectedProperties.length} properties?`)) {
            router.post(route('admin.mls.bulk-delete'), {
                ids: selectedProperties
            }, {
                onSuccess: () => setSelectedProperties([])
            });
        }
    };

    const toggleSelectAll = () => {
        if (selectedProperties.length === properties.data.length) {
            setSelectedProperties([]);
        } else {
            setSelectedProperties(properties.data.map(p => p.id));
        }
    };

    const statCards = [
        {
            title: 'Total Properties',
            value: stats.total_properties || 0,
            icon: '🏢',
            color: 'blue'
        },
        {
            title: 'Active Properties',
            value: stats.active_properties || 0,
            icon: '✅',
            color: 'green'
        },
        {
            title: 'For Sale',
            value: stats.for_sale || 0,
            icon: '💰',
            color: 'yellow'
        },
        {
            title: 'For Rent',
            value: stats.for_rent || 0,
            icon: '🏠',
            color: 'purple'
        }
    ];

    return (
        <AdminLayout title="MLS Properties">
            {/* Flash Messages */}
            {flash?.success && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                    {flash.error}
                </div>
            )}

            <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((stat, index) => (
                        <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">
                                        {stat.value.toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-4xl">{stat.icon}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sync Controls */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Sync Controls</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-3">
                            <button
                                onClick={() => setShowSyncModal(true)}
                                disabled={syncingFull}
                                className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                            >
                                {syncingFull ? '⏳ Syncing...' : '🔄 Full Sync'}
                            </button>
                            <p className="text-xs text-gray-500">
                                Sync all properties with images. Last sync: {stats.last_sync ? new Date(stats.last_sync).toLocaleString() : 'Never'}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleIncrementalSync}
                                disabled={syncingIncremental}
                                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                            >
                                {syncingIncremental ? '⏳ Syncing...' : '⚡ Incremental Sync'}
                            </button>
                            <p className="text-xs text-gray-500">
                                Only sync changed properties and updated images (faster)
                            </p>
                        </div>

                        <div className="space-y-3">
                            <form onSubmit={handleSyncProperty} className="space-y-2">
                                <input
                                    type="text"
                                    value={data.mls_id}
                                    onChange={e => setData('mls_id', e.target.value)}
                                    placeholder="MLS ID"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                                <button
                                    type="submit"
                                    disabled={processing || !data.mls_id}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                                >
                                    {processing ? '⏳ Syncing...' : '🎯 Sync Property'}
                                </button>
                            </form>
                            <p className="text-xs text-gray-500">Sync a specific property by MLS ID</p>
                        </div>
                    </div>

                    {/* Auto-sync Status */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="text-sm font-semibold text-blue-900 mb-3">🤖 Automatic High-Volume Sync Schedule (15,000+ Properties/Day)</h4>
                        <div className="text-sm text-blue-800 space-y-2">
                            <div>
                                <p className="font-semibold mb-1">📊 Full Syncs (2500 properties each):</p>
                                <div className="grid grid-cols-2 gap-1 text-xs ml-3">
                                    <p>• 2:00 AM - 2500 properties</p>
                                    <p>• 6:00 AM - 2500 properties</p>
                                    <p>• 10:00 AM - 2500 properties</p>
                                    <p>• 2:00 PM - 2500 properties</p>
                                    <p>• 6:00 PM - 2500 properties</p>
                                    <p>• 10:00 PM - 2500 properties</p>
                                </div>
                            </div>
                            <p className="font-semibold">⚡ Incremental Sync: Every 2 hours (new & updated properties)</p>
                            <div className="pt-2 border-t border-blue-300">
                                <p className="font-bold text-blue-900">Total: 15,000+ GTA Condo Apartments synced per day!</p>
                                <p className="text-xs text-blue-600 mt-1">All properties and images auto-update continuously. New MLS listings appear automatically!</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search address, MLS ID..."
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="sold">Sold</option>
                            <option value="leased">Leased</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <select
                            value={cityFilter}
                            onChange={e => setCityFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="">All Cities</option>
                            {cities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                        <div className="flex gap-2">
                            <button
                                onClick={handleSearch}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                            >
                                Apply
                            </button>
                            <button
                                onClick={handleClearFilters}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedProperties.length > 0 && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-indigo-900">
                                {selectedProperties.length} properties selected
                            </p>
                            <button
                                onClick={handleBulkDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors text-sm"
                            >
                                Delete Selected
                            </button>
                        </div>
                    </div>
                )}

                {/* Properties Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedProperties.length === properties.data.length}
                                            onChange={toggleSelectAll}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Image
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Property
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Details
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Images
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Last Synced
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {properties.data.map((property) => (
                                    <tr key={property.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedProperties.includes(property.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedProperties([...selectedProperties, property.id]);
                                                    } else {
                                                        setSelectedProperties(selectedProperties.filter(id => id !== property.id));
                                                    }
                                                }}
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            {property.image_urls && property.image_urls.length > 0 ? (
                                                <img
                                                    src={property.image_urls[0]}
                                                    alt={property.address}
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{property.address}</div>
                                            <div className="text-sm text-gray-500">{property.city}</div>
                                            <div className="text-xs text-gray-400">MLS: {property.mls_number}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {property.bedrooms} BR • {property.bathrooms} BA
                                            </div>
                                            <div className="text-xs text-gray-500">{property.property_sub_type}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-gray-900">
                                                ${property.price ? property.price.toLocaleString() : 'N/A'}
                                            </div>
                                            <div className="text-xs text-gray-500">{property.property_type}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                property.status === 'active' ? 'bg-green-100 text-green-800' :
                                                property.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                                                property.status === 'leased' ? 'bg-purple-100 text-purple-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {property.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {property.image_urls ? property.image_urls.length : 0} images
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {property.last_synced_at ? new Date(property.last_synced_at).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium space-x-2">
                                            <Link
                                                href={route('admin.mls.show', property.id)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                View
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Delete this property?')) {
                                                        router.delete(route('admin.mls.destroy', property.id));
                                                    }
                                                }}
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
                    {properties.links && properties.links.length > 3 && (
                        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{properties.from}</span> to{' '}
                                    <span className="font-medium">{properties.to}</span> of{' '}
                                    <span className="font-medium">{properties.total}</span> properties
                                </div>
                                <div className="flex gap-1">
                                    {properties.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            preserveState
                                            preserveScroll
                                            className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                                link.active
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Full Sync Modal */}
            {showSyncModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Full Sync Configuration</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Number of properties to sync
                            </label>
                            <input
                                type="number"
                                value={syncLimit}
                                onChange={(e) => setSyncLimit(parseInt(e.target.value))}
                                min="100"
                                max="10000"
                                step="100"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">Recommended: 2500 properties (default high-volume setting)</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleFullSync}
                                disabled={syncingFull}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                            >
                                {syncingFull ? 'Starting Sync...' : 'Start Sync'}
                            </button>
                            <button
                                onClick={() => setShowSyncModal(false)}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
