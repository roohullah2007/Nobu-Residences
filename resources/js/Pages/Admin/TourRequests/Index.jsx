import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';

export default function TourRequestsIndex({ auth, tourRequests: initialTourRequests, filters }) {
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
    const [typeFilter, setTypeFilter] = useState(filters?.property_type || 'all');

    const handleFilterChange = (filterType, value) => {
        setLoading(true);
        const newFilters = {
            status: filterType === 'status' ? value : statusFilter,
            property_type: filterType === 'type' ? value : typeFilter,
            page: 1
        };

        if (filterType === 'status') setStatusFilter(value);
        if (filterType === 'type') setTypeFilter(value);

        router.get(route('admin.tour-requests.index'), newFilters, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoading(false)
        });
    };

    const handlePageChange = (page) => {
        setLoading(true);
        router.get(route('admin.tour-requests.index'), {
            status: statusFilter,
            property_type: typeFilter,
            page: page
        }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoading(false)
        });
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const response = await fetch(`/api/tour-requests/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) throw new Error('Failed to update status');

            const result = await response.json();
            if (result.success) {
                router.reload({ only: ['tourRequests'] });
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            pending: 'bg-[#fefce8] text-[#ca8a04]',
            contacted: 'bg-[#eff6ff] text-[#1e40af]',
            completed: 'bg-[#f0fdf4] text-[#16a34a]',
            cancelled: 'bg-[#fef2f2] text-[#dc2626]'
        };
        return colors[status] || 'bg-[#f1f5f9] text-[#64748b]';
    };

    const getPropertyTypeBadge = (type) => {
        const colors = {
            property: 'bg-[#f5f3ff] text-[#7c3aed]',
            building: 'bg-[#ecfeff] text-[#0891b2]'
        };
        return colors[type] || 'bg-[#f1f5f9] text-[#64748b]';
    };

    const tourRequests = initialTourRequests?.data || [];
    const currentPage = initialTourRequests?.current_page || 1;
    const totalPages = initialTourRequests?.last_page || 1;
    const totalRequests = initialTourRequests?.total || tourRequests.length;
    const pendingRequests = tourRequests.filter(r => r.status === 'pending').length;

    return (
        <AdminLayout title="Tour Requests">
            <Head title="Tour Requests" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-[#0f172a]">Tour Requests</h1>
                        <p className="text-sm text-[#64748b] mt-1">
                            Manage property and building tour submissions
                        </p>
                    </div>
                    <a
                        href={route('admin.tour-requests.export', {
                            status: statusFilter !== 'all' ? statusFilter : undefined,
                            property_type: typeFilter !== 'all' ? typeFilter : undefined
                        })}
                        className="inline-flex items-center px-4 py-2.5 bg-[#0f172a] text-white text-sm font-medium rounded-lg hover:bg-[#1e293b] transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export CSV
                    </a>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#64748b]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-[#0f172a]">{totalRequests}</p>
                                <p className="text-sm text-[#64748b]">Total Requests</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#fefce8] flex items-center justify-center text-[#ca8a04]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-[#0f172a]">{pendingRequests}</p>
                                <p className="text-sm text-[#64748b]">Pending</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                    <div className="flex flex-wrap gap-4">
                        <div>
                            <label className="block text-xs font-medium text-[#64748b] mb-1.5">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="contacted">Contacted</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-[#64748b] mb-1.5">Type</label>
                            <select
                                value={typeFilter}
                                onChange={(e) => handleFilterChange('type', e.target.value)}
                                className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all"
                            >
                                <option value="all">All Types</option>
                                <option value="property">Properties</option>
                                <option value="building">Buildings</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={() => router.reload()}
                                className="px-4 py-2 text-sm font-medium text-[#64748b] bg-[#f1f5f9] rounded-lg hover:bg-[#e2e8f0] transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-[#e2e8f0]">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f172a]"></div>
                            <p className="mt-2 text-sm text-[#64748b]">Loading...</p>
                        </div>
                    ) : tourRequests.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 rounded-lg bg-[#f1f5f9] flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-[#94a3b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-[#0f172a]">No tour requests</p>
                            <p className="text-xs text-[#94a3b8] mt-1">No submissions found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[#e2e8f0]">
                                <thead className="bg-[#f8fafc]">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                            Date/Time
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                            Property
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-[#e2e8f0]">
                                    {tourRequests.map((request) => (
                                        <tr key={request.id} className="hover:bg-[#f8fafc] transition-colors">
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-[#0f172a]">
                                                        {request.selected_date || 'Not specified'}
                                                    </div>
                                                    <div className="text-xs text-[#64748b]">
                                                        {request.selected_time || 'Any time'}
                                                    </div>
                                                    <div className="text-xs text-[#94a3b8]">
                                                        {new Date(request.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-[#0f172a]">
                                                        {request.full_name}
                                                    </div>
                                                    <a href={`mailto:${request.email}`} className="text-xs text-[#3b82f6] hover:underline">
                                                        {request.email}
                                                    </a>
                                                    <div className="text-xs text-[#64748b]">
                                                        <a href={`tel:${request.phone}`} className="hover:underline">
                                                            {request.phone}
                                                        </a>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="max-w-xs">
                                                    <div className="text-sm text-[#0f172a] truncate">
                                                        {request.property_address || 'Not specified'}
                                                    </div>
                                                    {request.property_id && (
                                                        <div className="text-xs text-[#94a3b8]">
                                                            ID: {request.property_id}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPropertyTypeBadge(request.property_type)}`}>
                                                    {request.property_type || 'Unknown'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(request.status)}`}>
                                                    {request.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <select
                                                    value={request.status}
                                                    onChange={(e) => updateStatus(request.id, e.target.value)}
                                                    className="px-2 py-1.5 text-xs border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="contacted">Contacted</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-4 py-4 border-t border-[#e2e8f0] flex items-center justify-center gap-2">
                            <button
                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 text-sm font-medium text-[#64748b] bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f1f5f9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="px-3 py-1.5 text-sm text-[#64748b]">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 text-sm font-medium text-[#64748b] bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f1f5f9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
