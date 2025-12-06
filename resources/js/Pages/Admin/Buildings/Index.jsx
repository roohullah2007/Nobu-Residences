import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

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
            status = 'pending';
        }
        const statusColors = {
            'active': 'bg-[#f0fdf4] text-[#16a34a]',
            'inactive': 'bg-[#f1f5f9] text-[#64748b]',
            'pending': 'bg-[#fefce8] text-[#ca8a04]'
        };
        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${statusColors[status] || statusColors['pending']}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    // Calculate stats
    const totalBuildings = buildings.total || buildings.data.length;
    const activeBuildings = buildings.data.filter(b => b.status === 'active').length;
    const featuredBuildings = buildings.data.filter(b => b.is_featured).length;

    return (
        <AdminLayout title="Buildings">
            <Head title="Buildings" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-[#0f172a]">Buildings</h1>
                        <p className="text-sm text-[#64748b] mt-1">
                            Manage real estate buildings and properties
                        </p>
                    </div>
                    <Link href={route('admin.buildings.create')}>
                        <button className="inline-flex items-center px-4 py-2.5 bg-[#0f172a] text-white text-sm font-medium rounded-lg hover:bg-[#1e293b] transition-colors">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Building
                        </button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#64748b]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-[#0f172a]">{totalBuildings}</p>
                                <p className="text-sm text-[#64748b]">Total Buildings</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#f0fdf4] flex items-center justify-center text-[#16a34a]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-[#0f172a]">{activeBuildings}</p>
                                <p className="text-sm text-[#64748b]">Active</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#fefce8] flex items-center justify-center text-[#ca8a04]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-[#0f172a]">{featuredBuildings}</p>
                                <p className="text-sm text-[#64748b]">Featured</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-lg border border-[#e2e8f0]">
                    {/* Search */}
                    <div className="p-4 border-b border-[#e2e8f0]">
                        <div className="relative max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-[#94a3b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search buildings..."
                                className="w-full pl-9 pr-4 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-[#e2e8f0]">
                            <thead className="bg-[#f8fafc]">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                        Building
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                        Location
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                        Featured
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-[#e2e8f0]">
                                {filteredBuildings.length > 0 ? (
                                    filteredBuildings.map((building) => (
                                        <tr key={building.id} className="hover:bg-[#f8fafc] transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        {building.main_image && building.main_image !== '/images/no-image-placeholder.jpg' ? (
                                                            <img
                                                                className="h-10 w-10 rounded-lg object-cover"
                                                                src={building.main_image}
                                                                alt={building.name}
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center">
                                                                <svg className="w-5 h-5 text-[#94a3b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-[#0f172a]">
                                                            {building.name}
                                                        </div>
                                                        <div className="text-xs text-[#94a3b8]">
                                                            {building.created_at}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-[#0f172a]">{building.address}</div>
                                                <div className="text-xs text-[#94a3b8]">
                                                    {building.city}, {building.province}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[#f1f5f9] text-[#475569]">
                                                    {getBuildingTypeLabel(building.building_type)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(building.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {building.is_featured ? (
                                                    <svg className="w-5 h-5 text-[#eab308] mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ) : (
                                                    <span className="text-[#cbd5e1]">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={route('admin.buildings.show', createBuildingSlug(building.name, building.id))}
                                                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-[#3b82f6] bg-[#eff6ff] rounded-md hover:bg-[#dbeafe] transition-colors"
                                                    >
                                                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        View
                                                    </Link>
                                                    <Link
                                                        href={route('admin.buildings.edit', createBuildingSlug(building.name, building.id))}
                                                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-[#64748b] bg-[#f1f5f9] rounded-md hover:bg-[#e2e8f0] transition-colors"
                                                    >
                                                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(building)}
                                                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-[#dc2626] bg-[#fef2f2] rounded-md hover:bg-[#fee2e2] transition-colors"
                                                    >
                                                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="w-12 h-12 rounded-lg bg-[#f1f5f9] flex items-center justify-center mb-3">
                                                    <svg className="w-6 h-6 text-[#94a3b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                </div>
                                                <p className="text-sm font-medium text-[#0f172a]">No buildings found</p>
                                                <p className="text-xs text-[#94a3b8] mt-1">Try adjusting your search</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {buildings.links && buildings.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-[#e2e8f0] flex items-center justify-between">
                            <p className="text-sm text-[#64748b]">
                                Showing {buildings.from || 0} to {buildings.to || 0} of {buildings.total || 0} results
                            </p>
                            <nav className="flex items-center gap-1">
                                {buildings.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                            link.active
                                                ? 'bg-[#0f172a] text-white'
                                                : link.url
                                                ? 'text-[#64748b] hover:bg-[#f1f5f9]'
                                                : 'text-[#cbd5e1] cursor-not-allowed'
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
        </AdminLayout>
    );
}
