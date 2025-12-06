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
    const [totalQuestions, setTotalQuestions] = useState(0);

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
                setTotalQuestions(result.data.total);
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
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
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
            }
        } catch (error) {
            console.error('Error deleting question:', error);
            alert('Failed to delete question');
        }
    };

    const openModal = (question) => {
        setSelectedQuestion(question);
        setAdminNotes(question.admin_notes || '');
        setIsModalOpen(true);
    };

    const getStatusBadge = (status) => {
        const colors = {
            new: 'bg-[#eff6ff] text-[#1e40af]',
            contacted: 'bg-[#fefce8] text-[#ca8a04]',
            resolved: 'bg-[#f0fdf4] text-[#16a34a]'
        };
        return colors[status] || 'bg-[#f1f5f9] text-[#64748b]';
    };

    const newQuestions = questions.filter(q => q.status === 'new').length;

    return (
        <AdminLayout title="Property Questions">
            <Head title="Property Questions" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-xl font-semibold text-[#0f172a]">Property Questions</h1>
                    <p className="text-sm text-[#64748b] mt-1">
                        Manage questions from potential buyers
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#64748b]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-[#0f172a]">{totalQuestions}</p>
                                <p className="text-sm text-[#64748b]">Total Questions</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#eff6ff] flex items-center justify-center text-[#1e40af]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-[#0f172a]">{newQuestions}</p>
                                <p className="text-sm text-[#64748b]">New</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-[#64748b] mb-1.5">Search</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-[#94a3b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[#64748b] mb-1.5">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
                            >
                                <option value="">All Status</option>
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('');
                                    setCurrentPage(1);
                                }}
                                className="px-4 py-2 text-sm font-medium text-[#64748b] bg-[#f1f5f9] rounded-lg hover:bg-[#e2e8f0] transition-colors"
                            >
                                Clear Filters
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
                    ) : questions.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 rounded-lg bg-[#f1f5f9] flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-[#94a3b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-[#0f172a]">No questions</p>
                            <p className="text-xs text-[#94a3b8] mt-1">No property questions found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[#e2e8f0]">
                                <thead className="bg-[#f8fafc]">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                            Property
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                            Question
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-[#e2e8f0]">
                                    {questions.map((question) => (
                                        <tr key={question.id} className="hover:bg-[#f8fafc] transition-colors">
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-[#0f172a]">
                                                    {formatDate(question.created_at)}
                                                </div>
                                                <div className="text-xs text-[#64748b]">
                                                    {formatTime(question.created_at)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-[#0f172a]">{question.name}</div>
                                                <a href={`mailto:${question.email}`} className="text-xs text-[#3b82f6] hover:underline">
                                                    {question.email}
                                                </a>
                                                <div className="text-xs text-[#64748b]">{question.phone}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                {question.property_address && (
                                                    <div>
                                                        <div className="text-sm text-[#0f172a]">{question.property_address}</div>
                                                        {question.property_listing_key && (
                                                            <div className="text-xs text-[#64748b]">
                                                                MLS: {question.property_listing_key}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm text-[#64748b] max-w-xs truncate" title={question.question}>
                                                    {question.question}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(question.status)}`}>
                                                    {question.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openModal(question)}
                                                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-[#3b82f6] bg-[#eff6ff] rounded-md hover:bg-[#dbeafe] transition-colors"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(question.id)}
                                                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-[#dc2626] bg-[#fef2f2] rounded-md hover:bg-[#fee2e2] transition-colors"
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
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-4 py-4 border-t border-[#e2e8f0] flex items-center justify-center gap-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 text-sm font-medium text-[#64748b] bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f1f5f9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="px-3 py-1.5 text-sm text-[#64748b]">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 text-sm font-medium text-[#64748b] bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f1f5f9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {isModalOpen && selectedQuestion && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold text-[#0f172a] mb-4">
                            Question Details
                        </h3>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-medium text-[#64748b] mb-1">Name</label>
                                <p className="text-sm text-[#0f172a]">{selectedQuestion.name}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-[#64748b] mb-1">Email</label>
                                <p className="text-sm text-[#0f172a]">{selectedQuestion.email}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-[#64748b] mb-1">Phone</label>
                                <p className="text-sm text-[#0f172a]">{selectedQuestion.phone}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-[#64748b] mb-1">Status</label>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(selectedQuestion.status)}`}>
                                    {selectedQuestion.status}
                                </span>
                            </div>
                        </div>

                        {selectedQuestion.property_address && (
                            <div className="mb-4">
                                <label className="block text-xs font-medium text-[#64748b] mb-1">Property</label>
                                <p className="text-sm text-[#0f172a]">
                                    {selectedQuestion.property_address}
                                    {selectedQuestion.property_listing_key && ` (MLS: ${selectedQuestion.property_listing_key})`}
                                </p>
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-xs font-medium text-[#64748b] mb-1">Question</label>
                            <p className="text-sm text-[#0f172a] whitespace-pre-wrap bg-[#f8fafc] p-3 rounded-lg">
                                {selectedQuestion.question}
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs font-medium text-[#64748b] mb-1.5">Admin Notes</label>
                            <textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
                                placeholder="Add notes..."
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-medium text-[#64748b] mb-2">Update Status</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleStatusUpdate(selectedQuestion.id, 'new')}
                                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                                        selectedQuestion.status === 'new'
                                            ? 'bg-[#1e40af] text-white'
                                            : 'bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]'
                                    }`}
                                >
                                    New
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(selectedQuestion.id, 'contacted')}
                                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                                        selectedQuestion.status === 'contacted'
                                            ? 'bg-[#ca8a04] text-white'
                                            : 'bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]'
                                    }`}
                                >
                                    Contacted
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(selectedQuestion.id, 'resolved')}
                                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                                        selectedQuestion.status === 'resolved'
                                            ? 'bg-[#16a34a] text-white'
                                            : 'bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]'
                                    }`}
                                >
                                    Resolved
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSelectedQuestion(null);
                                    setAdminNotes('');
                                }}
                                className="px-4 py-2 text-sm font-medium text-[#64748b] bg-[#f1f5f9] rounded-lg hover:bg-[#e2e8f0] transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
