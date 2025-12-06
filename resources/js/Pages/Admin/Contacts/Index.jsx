import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Index({ title, contacts, stats, filters, categories }) {
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [bulkAction, setBulkAction] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedContacts(contacts.data.map(contact => contact.id));
        } else {
            setSelectedContacts([]);
        }
    };

    const handleSelectContact = (contactId) => {
        setSelectedContacts(prev => {
            if (prev.includes(contactId)) {
                return prev.filter(id => id !== contactId);
            } else {
                return [...prev, contactId];
            }
        });
    };

    const handleBulkAction = async () => {
        if (!bulkAction || selectedContacts.length === 0) return;

        setProcessing(true);

        try {
            await router.post('/admin/contacts/bulk-actions', {
                action: bulkAction,
                contacts: selectedContacts
            }, {
                preserveState: true,
                onSuccess: () => {
                    setSelectedContacts([]);
                    setBulkAction('');
                }
            });
        } finally {
            setProcessing(false);
        }
    };

    const handleFilter = (key, value) => {
        router.get('/admin/contacts', {
            ...filters,
            [key]: value
        }, {
            preserveState: true,
            replace: true
        });
    };

    const getStatusBadge = (isRead) => {
        if (isRead) {
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#f0fdf4] text-[#16a34a]">
                    Read
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#fef2f2] text-[#dc2626]">
                    Unread
                </span>
            );
        }
    };

    const getCategoryBadges = (categoriesArray) => {
        return categoriesArray.map((category, index) => (
            <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#f1f5f9] text-[#475569] mr-1"
            >
                {category.charAt(0).toUpperCase() + category.slice(1)}
            </span>
        ));
    };

    return (
        <AdminLayout title="Contacts">
            <Head title={title} />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-xl font-semibold text-[#0f172a]">Contacts</h1>
                    <p className="text-sm text-[#64748b] mt-1">
                        Manage contact form submissions from visitors
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#64748b]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1.586l-4 4z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-[#0f172a]">{stats?.total || 0}</p>
                                <p className="text-sm text-[#64748b]">Total</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#fef2f2] flex items-center justify-center text-[#dc2626]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-[#0f172a]">{stats?.unread || 0}</p>
                                <p className="text-sm text-[#64748b]">Unread</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#f0fdf4] flex items-center justify-center text-[#16a34a]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-[#0f172a]">{stats?.today || 0}</p>
                                <p className="text-sm text-[#64748b]">Today</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#f5f3ff] flex items-center justify-center text-[#7c3aed]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-[#0f172a]">{stats?.this_week || 0}</p>
                                <p className="text-sm text-[#64748b]">This Week</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-[#64748b] mb-1.5">
                                Status
                            </label>
                            <select
                                value={filters?.status || 'all'}
                                onChange={(e) => handleFilter('status', e.target.value)}
                                className="block w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all"
                            >
                                <option value="all">All Status</option>
                                <option value="unread">Unread</option>
                                <option value="read">Read</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-[#64748b] mb-1.5">
                                Category
                            </label>
                            <select
                                value={filters?.category || 'all'}
                                onChange={(e) => handleFilter('category', e.target.value)}
                                className="block w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all"
                            >
                                {categories && Object.entries(categories).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-[#64748b] mb-1.5">
                                Search
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-[#94a3b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={filters?.search || ''}
                                    onChange={(e) => handleFilter('search', e.target.value)}
                                    placeholder="Search by name, email, or message..."
                                    className="block w-full pl-9 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedContacts.length > 0 && (
                    <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-lg p-4">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <span className="text-sm font-medium text-[#1e40af]">
                                {selectedContacts.length} contact(s) selected
                            </span>
                            <div className="flex items-center gap-3">
                                <select
                                    value={bulkAction}
                                    onChange={(e) => setBulkAction(e.target.value)}
                                    className="px-3 py-2 text-sm border border-[#bfdbfe] rounded-lg bg-white focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
                                >
                                    <option value="">Select action...</option>
                                    <option value="mark_read">Mark as Read</option>
                                    <option value="mark_unread">Mark as Unread</option>
                                    <option value="delete">Delete</option>
                                </select>
                                <button
                                    onClick={handleBulkAction}
                                    disabled={!bulkAction || processing}
                                    className="px-4 py-2 text-sm font-medium text-white bg-[#0f172a] rounded-lg hover:bg-[#1e293b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Processing...' : 'Apply'}
                                </button>
                                <button
                                    onClick={() => setSelectedContacts([])}
                                    className="px-4 py-2 text-sm font-medium text-[#64748b] bg-white rounded-lg hover:bg-[#f1f5f9] transition-colors border border-[#e2e8f0]"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contacts Table */}
                <div className="bg-white rounded-lg border border-[#e2e8f0]">
                    {contacts.data.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[#e2e8f0]">
                                <thead className="bg-[#f8fafc]">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-left">
                                            <input
                                                type="checkbox"
                                                onChange={handleSelectAll}
                                                checked={selectedContacts.length === contacts.data.length}
                                                className="h-4 w-4 text-[#0f172a] focus:ring-[#3b82f6] border-[#d1d5db] rounded"
                                            />
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                            Categories
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                            Submitted
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-[#e2e8f0]">
                                    {contacts.data.map((contact) => (
                                        <tr key={contact.id} className={`${!contact.is_read ? 'bg-[#fafbff]' : ''} hover:bg-[#f8fafc] transition-colors`}>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedContacts.includes(contact.id)}
                                                    onChange={() => handleSelectContact(contact.id)}
                                                    className="h-4 w-4 text-[#0f172a] focus:ring-[#3b82f6] border-[#d1d5db] rounded"
                                                />
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-lg bg-[#0f172a] flex items-center justify-center">
                                                            <span className="text-sm font-semibold text-white">
                                                                {contact.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-[#0f172a]">
                                                            {contact.name}
                                                        </div>
                                                        <div className="text-xs text-[#64748b]">
                                                            {contact.email}
                                                        </div>
                                                        {contact.phone && (
                                                            <div className="text-xs text-[#94a3b8]">
                                                                {contact.phone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="flex flex-wrap gap-1">
                                                    {getCategoryBadges(contact.categories_array || [])}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                {getStatusBadge(contact.is_read)}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="text-sm text-[#0f172a]">{contact.time_ago}</div>
                                                <div className="text-xs text-[#94a3b8]">
                                                    {new Date(contact.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={`/admin/contacts/${contact.id}`}
                                                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-[#3b82f6] bg-[#eff6ff] rounded-md hover:bg-[#dbeafe] transition-colors"
                                                    >
                                                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        View
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Delete this contact?')) {
                                                                router.delete(`/admin/contacts/${contact.id}`);
                                                            }
                                                        }}
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
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 rounded-lg bg-[#f1f5f9] flex items-center justify-center mx-auto mb-3">
                                <svg className="h-6 w-6 text-[#94a3b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1.586l-4 4z" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-[#0f172a]">No contacts</p>
                            <p className="text-xs text-[#94a3b8] mt-1">No contact form submissions found</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {contacts.links && contacts.last_page > 1 && (
                        <div className="px-4 py-4 border-t border-[#e2e8f0] flex items-center justify-between">
                            <p className="text-sm text-[#64748b]">
                                Showing {contacts.from || 0} to {contacts.to || 0} of {contacts.total || 0} results
                            </p>
                            <nav className="flex items-center gap-1">
                                {contacts.links.map((link, index) => (
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
