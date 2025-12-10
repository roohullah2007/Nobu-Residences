import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function SubNeighbourhoodsIndex({ subNeighbourhoods, neighbourhoods, filters }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingSubNeighbourhood, setEditingSubNeighbourhood] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        neighbourhood_id: '',
        description: '',
        is_active: true,
        sort_order: 0
    });

    const handleSearch = (value) => {
        setSearchTerm(value);
        router.get(route('admin.sub-neighbourhoods.index'), { search: value }, {
            preserveState: true,
            replace: true
        });
    };

    const handleCreate = (e) => {
        e.preventDefault();
        post(route('admin.sub-neighbourhoods.store'), {
            onSuccess: () => {
                reset();
                setShowCreateModal(false);
            }
        });
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        put(route('admin.sub-neighbourhoods.update', editingSubNeighbourhood.id), {
            onSuccess: () => {
                reset();
                setShowEditModal(false);
                setEditingSubNeighbourhood(null);
            }
        });
    };

    const handleDelete = (id, name) => {
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
            router.delete(route('admin.sub-neighbourhoods.destroy', id));
        }
    };

    const openEditModal = (subNeighbourhood) => {
        setEditingSubNeighbourhood(subNeighbourhood);
        setData({
            name: subNeighbourhood.name,
            neighbourhood_id: subNeighbourhood.neighbourhood_id || '',
            description: subNeighbourhood.description || '',
            is_active: subNeighbourhood.is_active,
            sort_order: subNeighbourhood.sort_order
        });
        setShowEditModal(true);
    };

    const openCreateModal = () => {
        reset();
        setShowCreateModal(true);
    };

    return (
        <AdminLayout title="Sub-Neighbourhoods">
            <Head title="Sub-Neighbourhoods" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-[#0f172a]">Sub-Neighbourhoods</h1>
                        <p className="text-sm text-[#64748b] mt-1">
                            Manage sub-neighbourhood taxonomies for buildings
                        </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center px-4 py-2.5 bg-[#0f172a] text-white text-sm font-medium rounded-lg hover:bg-[#1e293b] transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Sub-Neighbourhood
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#64748b]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-[#0f172a]">{subNeighbourhoods.total || subNeighbourhoods.data?.length || 0}</p>
                                <p className="text-sm text-[#64748b]">Total Sub-Neighbourhoods</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                    <div className="relative max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-[#94a3b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search sub-neighbourhoods..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all"
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-[#e2e8f0]">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">Parent Neighbourhood</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">Buildings</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-[#64748b] uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e2e8f0]">
                                {(subNeighbourhoods.data || []).map((subNeighbourhood) => (
                                    <tr key={subNeighbourhood.id} className="hover:bg-[#f8fafc]">
                                        <td className="px-4 py-3 text-sm font-medium text-[#0f172a]">{subNeighbourhood.name}</td>
                                        <td className="px-4 py-3 text-sm text-[#64748b]">
                                            {subNeighbourhood.neighbourhood?.name || '-'}
                                            {subNeighbourhood.neighbourhood?.city && (
                                                <span className="text-xs text-[#94a3b8] ml-1">({subNeighbourhood.neighbourhood.city})</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-[#64748b]">{subNeighbourhood.buildings_count || 0}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                subNeighbourhood.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {subNeighbourhood.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => openEditModal(subNeighbourhood)}
                                                className="text-[#3b82f6] hover:text-[#2563eb] text-sm font-medium mr-3"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(subNeighbourhood.id, subNeighbourhood.name)}
                                                className="text-[#dc2626] hover:text-[#b91c1c] text-sm font-medium"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {(!subNeighbourhoods.data || subNeighbourhoods.data.length === 0) && (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center text-sm text-[#64748b]">
                                            No sub-neighbourhoods found. Create your first one!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {subNeighbourhoods.links && subNeighbourhoods.links.length > 3 && (
                        <div className="px-4 py-3 border-t border-[#e2e8f0] flex items-center justify-between">
                            <p className="text-sm text-[#64748b]">
                                Showing {subNeighbourhoods.from} to {subNeighbourhoods.to} of {subNeighbourhoods.total} results
                            </p>
                            <div className="flex gap-1">
                                {subNeighbourhoods.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 text-sm rounded ${
                                            link.active
                                                ? 'bg-[#0f172a] text-white'
                                                : 'bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                        <h2 className="text-lg font-semibold text-[#0f172a] mb-4">Create Sub-Neighbourhood</h2>
                        <form onSubmit={handleCreate}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#0f172a] mb-1.5">
                                        Name <span className="text-[#dc2626]">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., King West"
                                        required
                                    />
                                    {errors.name && <p className="text-xs text-[#dc2626] mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#0f172a] mb-1.5">Parent Neighbourhood</label>
                                    <select
                                        className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
                                        value={data.neighbourhood_id}
                                        onChange={(e) => setData('neighbourhood_id', e.target.value)}
                                    >
                                        <option value="">Select a neighbourhood...</option>
                                        {neighbourhoods.map((neighbourhood) => (
                                            <option key={neighbourhood.id} value={neighbourhood.id}>
                                                {neighbourhood.name} {neighbourhood.city && `(${neighbourhood.city})`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#0f172a] mb-1.5">Description</label>
                                    <textarea
                                        className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="w-4 h-4 text-[#3b82f6] border-[#e2e8f0] rounded focus:ring-[#3b82f6]"
                                    />
                                    <label htmlFor="is_active" className="text-sm text-[#0f172a]">Active</label>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => { setShowCreateModal(false); reset(); }}
                                    className="px-4 py-2 text-sm font-medium text-[#64748b] bg-[#f1f5f9] rounded-lg hover:bg-[#e2e8f0] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-medium text-white bg-[#0f172a] rounded-lg hover:bg-[#1e293b] transition-colors disabled:opacity-50"
                                >
                                    {processing ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                        <h2 className="text-lg font-semibold text-[#0f172a] mb-4">Edit Sub-Neighbourhood</h2>
                        <form onSubmit={handleUpdate}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#0f172a] mb-1.5">
                                        Name <span className="text-[#dc2626]">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#0f172a] mb-1.5">Parent Neighbourhood</label>
                                    <select
                                        className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
                                        value={data.neighbourhood_id}
                                        onChange={(e) => setData('neighbourhood_id', e.target.value)}
                                    >
                                        <option value="">Select a neighbourhood...</option>
                                        {neighbourhoods.map((neighbourhood) => (
                                            <option key={neighbourhood.id} value={neighbourhood.id}>
                                                {neighbourhood.name} {neighbourhood.city && `(${neighbourhood.city})`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#0f172a] mb-1.5">Description</label>
                                    <textarea
                                        className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_active_edit"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="w-4 h-4 text-[#3b82f6] border-[#e2e8f0] rounded focus:ring-[#3b82f6]"
                                    />
                                    <label htmlFor="is_active_edit" className="text-sm text-[#0f172a]">Active</label>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => { setShowEditModal(false); setEditingSubNeighbourhood(null); reset(); }}
                                    className="px-4 py-2 text-sm font-medium text-[#64748b] bg-[#f1f5f9] rounded-lg hover:bg-[#e2e8f0] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-medium text-white bg-[#0f172a] rounded-lg hover:bg-[#1e293b] transition-colors disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
