import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function PropertyQuestions({ auth }) {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Date formatting helper functions
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')}, ${date.getFullYear()}`;
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };

    const formatShortDate = (dateString) => {
        const date = new Date(dateString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        fetchQuestions();
    }, [currentPage, statusFilter, searchTerm]);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', currentPage);
            if (statusFilter) params.append('status', statusFilter);
            if (searchTerm) params.append('search', searchTerm);

            const response = await fetch(`/admin/property-questions/data?${params.toString()}`, {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            });

            const result = await response.json();
            if (result.success) {
                setQuestions(result.data.data);
                setTotalPages(result.data.last_page);
            }
        } catch (error) {
            console.error('Error fetching property questions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const response = await fetch(`/admin/property-questions/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    status: newStatus,
                    admin_notes: adminNotes
                })
            });

            const result = await response.json();
            if (result.success) {
                fetchQuestions();
                setIsModalOpen(false);
                setSelectedQuestion(null);
                setAdminNotes('');
                alert('Status updated successfully!');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status. Please try again.');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this question?')) return;

        try {
            const response = await fetch(`/admin/property-questions/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            });

            const result = await response.json();
            if (result.success) {
                fetchQuestions();
                alert('Question deleted successfully!');
            }
        } catch (error) {
            console.error('Error deleting question:', error);
            alert('Failed to delete question. Please try again.');
        }
    };

    const openModal = (question) => {
        setSelectedQuestion(question);
        setAdminNotes(question.admin_notes || '');
        setIsModalOpen(true);
    };

    const getStatusBadge = (status) => {
        const colors = {
            new: 'bg-blue-100 text-blue-800',
            contacted: 'bg-yellow-100 text-yellow-800',
            resolved: 'bg-green-100 text-green-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title="Property Questions" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h2 className="text-2xl font-bold mb-6">Property Questions</h2>

                            {/* Filters */}
                            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, phone..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">All Status</option>
                                        <option value="new">New</option>
                                        <option value="contacted">Contacted</option>
                                        <option value="resolved">Resolved</option>
                                    </select>
                                </div>
                                <div>
                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setStatusFilter('');
                                            setCurrentPage(1);
                                        }}
                                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            </div>

                            {/* Questions Table */}
                            {loading ? (
                                <div className="text-center py-8">Loading...</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Date
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Contact Info
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Property
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Question
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
                                            {questions.map((question) => (
                                                <tr key={question.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatDate(question.created_at)}
                                                        <br />
                                                        <span className="text-xs text-gray-500">
                                                            {formatTime(question.created_at)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm">
                                                            <div className="font-medium text-gray-900">{question.name}</div>
                                                            <div className="text-gray-500">{question.email}</div>
                                                            <div className="text-gray-500">{question.phone}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        {question.property_address && (
                                                            <>
                                                                <div className="font-medium">{question.property_address}</div>
                                                                {question.property_listing_key && (
                                                                    <div className="text-gray-500">
                                                                        MLS: {question.property_listing_key}
                                                                    </div>
                                                                )}
                                                                {question.property_type && (
                                                                    <div className="text-gray-500 capitalize">
                                                                        Type: {question.property_type}
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900 max-w-xs truncate" title={question.question}>
                                                            {question.question}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(question.status)}`}>
                                                            {question.status}
                                                        </span>
                                                        {question.contacted_at && (
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {formatShortDate(question.contacted_at)}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <button
                                                            onClick={() => openModal(question)}
                                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                                        >
                                                            View
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(question.id)}
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
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-6 flex justify-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-4 py-2">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {isModalOpen && selectedQuestion && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                Property Question Details
                            </h3>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedQuestion.name}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedQuestion.email}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedQuestion.phone}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(selectedQuestion.status)}`}>
                                        {selectedQuestion.status}
                                    </span>
                                </div>
                            </div>

                            {selectedQuestion.property_address && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Property</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {selectedQuestion.property_address}
                                        {selectedQuestion.property_listing_key && ` (MLS: ${selectedQuestion.property_listing_key})`}
                                    </p>
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Question</label>
                                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                                    {selectedQuestion.question}
                                </p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Add notes about this question..."
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleStatusUpdate(selectedQuestion.id, 'new')}
                                        className={`px-4 py-2 rounded-lg ${selectedQuestion.status === 'new' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                    >
                                        New
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(selectedQuestion.id, 'contacted')}
                                        className={`px-4 py-2 rounded-lg ${selectedQuestion.status === 'contacted' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                    >
                                        Contacted
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(selectedQuestion.id, 'resolved')}
                                        className={`px-4 py-2 rounded-lg ${selectedQuestion.status === 'resolved' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                    >
                                        Resolved
                                    </button>
                                </div>
                            </div>

                            <div className="mt-5 flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setSelectedQuestion(null);
                                        setAdminNotes('');
                                    }}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}