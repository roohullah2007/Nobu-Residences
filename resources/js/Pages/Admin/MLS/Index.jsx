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
        { title: 'Total Properties', value: stats.total_properties || 0 },
        { title: 'Active', value: stats.active_properties || 0 },
        { title: 'For Sale', value: stats.for_sale || 0 },
        { title: 'For Rent', value: stats.for_rent || 0 }
    ];

    return (
        <AdminLayout title="MLS Properties">
            <div className="space-y-6">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] px-4 py-3 rounded-lg text-sm">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] px-4 py-3 rounded-lg text-sm">
                        {flash.error}
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((stat, index) => (
                        <div key={index} className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                            <p className="text-sm text-[#64748b]">{stat.title}</p>
                            <p className="text-2xl font-semibold text-[#0f172a] mt-1">
                                {stat.value.toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Sync Controls */}
                <div className="bg-white rounded-lg border border-[#e2e8f0]">
                    <div className="px-5 py-4 border-b border-[#e2e8f0]">
                        <h2 className="text-base font-semibold text-[#0f172a]">Sync Controls</h2>
                    </div>
                    <div className="p-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <button
                                    onClick={() => setShowSyncModal(true)}
                                    disabled={syncingFull}
                                    className="w-full px-4 py-2.5 bg-[#0f172a] text-white rounded-lg hover:bg-[#1e293b] disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                                >
                                    {syncingFull ? 'Syncing...' : 'Full Sync'}
                                </button>
                                <p className="text-xs text-[#64748b] mt-2">
                                    Last: {stats.last_sync ? new Date(stats.last_sync).toLocaleString() : 'Never'}
                                </p>
                            </div>
                            <div>
                                <button
                                    onClick={handleIncrementalSync}
                                    disabled={syncingIncremental}
                                    className="w-full px-4 py-2.5 bg-[#16a34a] text-white rounded-lg hover:bg-[#15803d] disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                                >
                                    {syncingIncremental ? 'Syncing...' : 'Incremental Sync'}
                                </button>
                                <p className="text-xs text-[#64748b] mt-2">Only changed properties</p>
                            </div>
                            <div>
                                <form onSubmit={handleSyncProperty} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={data.mls_id}
                                        onChange={e => setData('mls_id', e.target.value)}
                                        placeholder="MLS ID"
                                        className="flex-1 px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:border-transparent"
                                    />
                                    <button
                                        type="submit"
                                        disabled={processing || !data.mls_id}
                                        className="px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                                    >
                                        Sync
                                    </button>
                                </form>
                                <p className="text-xs text-[#64748b] mt-2">Sync specific property</p>
                            </div>
                        </div>

                        {/* Schedule Info */}
                        <div className="mt-5 p-4 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
                            <p className="text-sm font-medium text-[#0f172a] mb-2">Auto-Sync Schedule</p>
                            <div className="text-xs text-[#64748b] space-y-1">
                                <p>Full Sync: Every 4 hours (2AM, 6AM, 10AM, 2PM, 6PM, 10PM)</p>
                                <p>Incremental: Every 2 hours</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg border border-[#e2e8f0]">
                    <div className="px-5 py-4 border-b border-[#e2e8f0]">
                        <h2 className="text-base font-semibold text-[#0f172a]">Filters</h2>
                    </div>
                    <div className="p-5">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search address, MLS ID..."
                                className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:border-transparent"
                            />
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:border-transparent bg-white"
                            >
                                <option value="">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="sold">Sold</option>
                                <option value="leased">Leased</option>
                            </select>
                            <select
                                value={cityFilter}
                                onChange={e => setCityFilter(e.target.value)}
                                className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:border-transparent bg-white"
                            >
                                <option value="">All Cities</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSearch}
                                    className="flex-1 px-4 py-2 bg-[#0f172a] text-white rounded-lg hover:bg-[#1e293b] text-sm font-medium transition-colors"
                                >
                                    Apply
                                </button>
                                <button
                                    onClick={handleClearFilters}
                                    className="px-4 py-2 border border-[#e2e8f0] text-[#64748b] rounded-lg hover:bg-[#f8fafc] text-sm font-medium transition-colors"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedProperties.length > 0 && (
                    <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-lg px-5 py-3 flex items-center justify-between">
                        <p className="text-sm text-[#1e40af]">
                            {selectedProperties.length} properties selected
                        </p>
                        <button
                            onClick={handleBulkDelete}
                            className="px-3 py-1.5 bg-[#dc2626] text-white rounded-lg hover:bg-[#b91c1c] text-sm font-medium transition-colors"
                        >
                            Delete Selected
                        </button>
                    </div>
                )}

                {/* Properties Table */}
                <div className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                                    <th className="px-4 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedProperties.length === properties.data.length && properties.data.length > 0}
                                            onChange={toggleSelectAll}
                                            className="rounded border-[#cbd5e1] text-[#0f172a] focus:ring-[#0f172a]"
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase">Image</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase">Property</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase">Details</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase">Price</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase">Images</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase">Synced</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e2e8f0]">
                                {properties.data.map((property) => (
                                    <tr key={property.id} className="hover:bg-[#f8fafc] transition-colors">
                                        <td className="px-4 py-3">
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
                                                className="rounded border-[#cbd5e1] text-[#0f172a] focus:ring-[#0f172a]"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            {property.image_urls && property.image_urls.length > 0 ? (
                                                <img
                                                    src={property.image_urls[0]}
                                                    alt={property.address}
                                                    className="w-12 h-12 object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-[#f1f5f9] rounded-lg flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-[#94a3b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium text-[#0f172a]">{property.address}</p>
                                            <p className="text-xs text-[#64748b]">{property.city}</p>
                                            <p className="text-xs text-[#94a3b8]">MLS: {property.mls_number}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm text-[#0f172a]">{property.bedrooms} bed / {property.bathrooms} bath</p>
                                            <p className="text-xs text-[#64748b]">{property.property_sub_type}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium text-[#0f172a]">
                                                ${property.price ? property.price.toLocaleString() : 'N/A'}
                                            </p>
                                            <p className="text-xs text-[#64748b]">{property.property_type}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                property.status === 'active' ? 'bg-[#f0fdf4] text-[#16a34a]' :
                                                property.status === 'sold' ? 'bg-[#eff6ff] text-[#2563eb]' :
                                                property.status === 'leased' ? 'bg-[#faf5ff] text-[#9333ea]' :
                                                'bg-[#f1f5f9] text-[#64748b]'
                                            }`}>
                                                {property.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-[#64748b]">
                                            {property.image_urls ? property.image_urls.length : 0}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-[#64748b]">
                                            {property.last_synced_at ? new Date(property.last_synced_at).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={route('admin.mls.show', property.id)}
                                                    className="text-sm text-[#0f172a] hover:text-[#3b82f6] font-medium"
                                                >
                                                    View
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Delete this property?')) {
                                                            router.delete(route('admin.mls.destroy', property.id));
                                                        }
                                                    }}
                                                    className="text-sm text-[#dc2626] hover:text-[#b91c1c] font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {properties.links && properties.links.length > 3 && (
                        <div className="px-5 py-4 border-t border-[#e2e8f0] flex items-center justify-between">
                            <p className="text-sm text-[#64748b]">
                                Showing {properties.from} to {properties.to} of {properties.total}
                            </p>
                            <div className="flex gap-1">
                                {properties.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        preserveState
                                        preserveScroll
                                        className={`px-3 py-1.5 text-sm rounded-lg ${
                                            link.active
                                                ? 'bg-[#0f172a] text-white'
                                                : 'text-[#64748b] hover:bg-[#f8fafc]'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sync Modal */}
            {showSyncModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-[#0f172a] mb-4">Full Sync Configuration</h3>
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-[#0f172a] mb-2">
                                Number of properties to sync
                            </label>
                            <input
                                type="number"
                                value={syncLimit}
                                onChange={(e) => setSyncLimit(parseInt(e.target.value))}
                                min="100"
                                max="10000"
                                step="100"
                                className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:border-transparent"
                            />
                            <p className="text-xs text-[#64748b] mt-2">Recommended: 2500 properties</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleFullSync}
                                disabled={syncingFull}
                                className="flex-1 px-4 py-2 bg-[#0f172a] text-white rounded-lg hover:bg-[#1e293b] disabled:opacity-50 text-sm font-medium transition-colors"
                            >
                                {syncingFull ? 'Starting...' : 'Start Sync'}
                            </button>
                            <button
                                onClick={() => setShowSyncModal(false)}
                                className="flex-1 px-4 py-2 border border-[#e2e8f0] text-[#64748b] rounded-lg hover:bg-[#f8fafc] text-sm font-medium transition-colors"
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
