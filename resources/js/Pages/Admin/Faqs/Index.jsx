import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

const PAGE_TYPE_LABELS = {
    global: 'Global (all pages)',
    home: 'Home',
    search: 'Search Results',
    buildings: 'Buildings Listing',
    building_detail: 'Building Detail',
    developers: 'Developers Listing',
    developer_detail: 'Developer Detail',
    blog: 'Blog',
    contact: 'Contact',
    compare: 'Compare',
    schools: 'Schools',
};

export default function FaqsIndex({ faqs, pageTypes = [], filters = {} }) {
    const [showModal, setShowModal] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [pageTypeFilter, setPageTypeFilter] = useState(filters.page_type || '');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        question: '',
        answer: '',
        page_type: 'global',
        sort_order: 0,
        is_active: true,
    });

    const openCreateModal = () => {
        reset();
        setEditingFaq(null);
        setShowModal(true);
    };

    const openEditModal = (faq) => {
        setEditingFaq(faq);
        setData({
            question: faq.question,
            answer: faq.answer,
            page_type: faq.page_type,
            sort_order: faq.sort_order || 0,
            is_active: !!faq.is_active,
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                reset();
                setShowModal(false);
                setEditingFaq(null);
            },
        };
        if (editingFaq) {
            put(route('admin.faqs.update', editingFaq.id), options);
        } else {
            post(route('admin.faqs.store'), options);
        }
    };

    const handleDelete = (faq) => {
        if (confirm(`Delete this FAQ?\n\n"${faq.question}"`)) {
            router.delete(route('admin.faqs.destroy', faq.id));
        }
    };

    const applyFilters = (e) => {
        e?.preventDefault();
        router.get(route('admin.faqs.index'),
            { search: searchTerm, page_type: pageTypeFilter },
            { preserveState: true, preserveScroll: true }
        );
    };

    return (
        <AdminLayout title="FAQs">
            <Head title="FAQs" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-[#0f172a]">FAQs</h1>
                        <p className="text-sm text-[#64748b] mt-1">
                            Site-wide FAQs shown on public pages (with FAQ schema markup for SEO)
                        </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center px-4 py-2.5 bg-[#0f172a] text-white text-sm font-medium rounded-lg hover:bg-[#1e293b] transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add FAQ
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                    <form onSubmit={applyFilters} className="flex flex-wrap gap-3 items-center">
                        <input
                            type="text"
                            placeholder="Search questions..."
                            className="flex-1 min-w-[200px] max-w-md px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <select
                            className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg"
                            value={pageTypeFilter}
                            onChange={(e) => setPageTypeFilter(e.target.value)}
                        >
                            <option value="">All pages</option>
                            {pageTypes.map((type) => (
                                <option key={type} value={type}>{PAGE_TYPE_LABELS[type] || type}</option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-[#0f172a] rounded-lg hover:bg-[#1e293b]"
                        >
                            Filter
                        </button>
                    </form>
                </div>

                {/* FAQ Table */}
                <div className="bg-white rounded-lg border border-[#e2e8f0]">
                    {faqs.data.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[#e2e8f0]">
                                <thead className="bg-[#f8fafc]">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">Question</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">Page</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">Order</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-[#64748b] uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-[#e2e8f0]">
                                    {faqs.data.map((faq) => (
                                        <tr key={faq.id} className="hover:bg-[#f8fafc] transition-colors">
                                            <td className="px-4 py-4">
                                                <p className="text-sm font-medium text-[#0f172a]">{faq.question}</p>
                                                <p className="text-xs text-[#94a3b8] mt-1 line-clamp-2">{faq.answer}</p>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#f1f5f9] text-[#334155]">
                                                    {PAGE_TYPE_LABELS[faq.page_type] || faq.page_type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-[#64748b]">
                                                {faq.sort_order}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${faq.is_active ? 'bg-[#f0fdf4] text-[#16a34a]' : 'bg-[#fef2f2] text-[#dc2626]'}`}>
                                                    {faq.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(faq)}
                                                        className="px-3 py-1.5 text-xs font-medium text-[#64748b] bg-[#f1f5f9] rounded-md hover:bg-[#e2e8f0] transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(faq)}
                                                        className="px-3 py-1.5 text-xs font-medium text-[#dc2626] bg-[#fef2f2] rounded-md hover:bg-[#fee2e2] transition-colors"
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
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-sm font-medium text-[#0f172a]">No FAQs found</p>
                            <p className="text-xs text-[#94a3b8] mt-1">Add your first FAQ — it will appear on the selected public page</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {faqs.links && faqs.last_page > 1 && (
                        <div className="px-4 py-4 border-t border-[#e2e8f0] flex items-center justify-between">
                            <p className="text-sm text-[#64748b]">
                                Showing {faqs.from || 0} to {faqs.to || 0} of {faqs.total || 0}
                            </p>
                            <nav className="flex items-center gap-1">
                                {faqs.links.map((link, index) => (
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

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg font-semibold text-[#0f172a] mb-4">
                            {editingFaq ? 'Edit FAQ' : 'Add FAQ'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#0f172a] mb-1.5">
                                        Question <span className="text-[#dc2626]">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={500}
                                        className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
                                        value={data.question}
                                        onChange={(e) => setData('question', e.target.value)}
                                        required
                                    />
                                    {errors.question && <p className="text-xs text-[#dc2626] mt-1">{errors.question}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#0f172a] mb-1.5">
                                        Answer <span className="text-[#dc2626]">*</span>
                                    </label>
                                    <textarea
                                        rows={5}
                                        className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
                                        value={data.answer}
                                        onChange={(e) => setData('answer', e.target.value)}
                                        required
                                    />
                                    {errors.answer && <p className="text-xs text-[#dc2626] mt-1">{errors.answer}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[#0f172a] mb-1.5">
                                            Show on page <span className="text-[#dc2626]">*</span>
                                        </label>
                                        <select
                                            className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg"
                                            value={data.page_type}
                                            onChange={(e) => setData('page_type', e.target.value)}
                                            required
                                        >
                                            {pageTypes.map((type) => (
                                                <option key={type} value={type}>{PAGE_TYPE_LABELS[type] || type}</option>
                                            ))}
                                        </select>
                                        {errors.page_type && <p className="text-xs text-[#dc2626] mt-1">{errors.page_type}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#0f172a] mb-1.5">Sort Order</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg"
                                            value={data.sort_order}
                                            onChange={(e) => setData('sort_order', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm text-[#0f172a]">Active</span>
                                </label>
                            </div>

                            <div className="mt-6 flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); setEditingFaq(null); reset(); }}
                                    className="px-4 py-2 text-sm font-medium text-[#64748b] bg-[#f1f5f9] rounded-lg hover:bg-[#e2e8f0] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-medium text-white bg-[#0f172a] rounded-lg hover:bg-[#1e293b] transition-colors disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : editingFaq ? 'Save' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
