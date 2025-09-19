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
                // Refresh the list using Inertia
                router.reload({ only: ['tourRequests'] });
                alert('Status updated successfully!');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            contacted: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPropertyTypeBadge = (type) => {
        const colors = {
            property: 'bg-purple-100 text-purple-800',
            building: 'bg-indigo-100 text-indigo-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    const tourRequests = initialTourRequests?.data || [];
    const currentPage = initialTourRequests?.current_page || 1;
    const totalPages = initialTourRequests?.last_page || 1;

    return (
        <AdminLayout user={auth.user}>
            <Head title="Form Submissions" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Header */}
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Form Submissions</h2>
                                <p className="mt-1 text-sm text-gray-600">Manage property and building tour request submissions</p>
                            </div>

                            {/* Filters */}
                            <div className="mb-6 flex flex-wrap gap-4">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="contacted">Contacted</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>

                                <select
                                    value={typeFilter}
                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="all">All Types</option>
                                    <option value="property">Properties</option>
                                    <option value="building">Buildings</option>
                                </select>

                                <button
                                    onClick={() => router.reload()}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
                                >
                                    Refresh
                                </button>

                                <a
                                    href={route('admin.tour-requests.export', {
                                        status: statusFilter !== 'all' ? statusFilter : undefined,
                                        property_type: typeFilter !== 'all' ? typeFilter : undefined
                                    })}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition inline-flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Export CSV
                                </a>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                {loading ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                        <p className="mt-2 text-gray-600">Loading tour requests...</p>
                                    </div>
                                ) : tourRequests.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600">No tour requests found</p>
                                    </div>
                                ) : (
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Date/Time
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Contact Info
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Property
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Message
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
                                            {tourRequests.map((request) => (
                                                <tr key={request.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        <div>
                                                            <div className="font-medium">{request.selected_date || 'Not specified'}</div>
                                                            <div className="text-gray-500">{request.selected_time || 'Any time'}</div>
                                                            <div className="text-xs text-gray-400">
                                                                {new Date(request.created_at).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <div>
                                                            <div className="font-medium text-gray-900">{request.full_name}</div>
                                                            <div className="text-gray-500">
                                                                <a href={`mailto:${request.email}`} className="hover:underline">
                                                                    {request.email}
                                                                </a>
                                                            </div>
                                                            <div className="text-gray-500">
                                                                <a href={`tel:${request.phone}`} className="hover:underline">
                                                                    {request.phone}
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        <div className="max-w-xs truncate">
                                                            {request.property_address || 'Not specified'}
                                                        </div>
                                                        {request.property_id && (
                                                            <div className="text-xs text-gray-500">
                                                                ID: {request.property_id}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPropertyTypeBadge(request.property_type)}`}>
                                                            {request.property_type || 'Unknown'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        <div className="max-w-xs">
                                                            {request.message ? (
                                                                <div className="truncate" title={request.message}>
                                                                    {request.message}
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400">No message</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(request.status)}`}>
                                                            {request.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <select
                                                            value={request.status}
                                                            onChange={(e) => updateStatus(request.id, e.target.value)}
                                                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                                )}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-6 flex justify-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-4 py-2 text-sm text-gray-700">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}