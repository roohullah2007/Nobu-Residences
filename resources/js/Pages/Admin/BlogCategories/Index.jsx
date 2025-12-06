import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function BlogCategoriesIndex({ categories, flash }) {
    const [selectedIds, setSelectedIds] = useState([]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(categories.data.map(cat => cat.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this category?')) {
            router.delete(route('admin.blog-categories.destroy', id));
        }
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) {
            alert('Please select categories to delete');
            return;
        }

        if (confirm(`Are you sure you want to delete ${selectedIds.length} categories?`)) {
            router.post(route('admin.blog-categories.bulk-delete'), {
                ids: selectedIds
            });
        }
    };

    const handleToggleStatus = (category) => {
        router.patch(route('admin.blog-categories.update', category.id), {
            ...category,
            is_active: !category.is_active
        });
    };

    const totalCategories = categories.data?.length || 0;
    const activeCategories = categories.data?.filter(c => c.is_active).length || 0;

    return (
        <AdminLayout title="Blog Categories">
            <Head title="Blog Categories" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-[#0f172a]">Blog Categories</h1>
                        <p className="text-sm text-[#64748b] mt-1">
                            Organize your blog posts with categories
                        </p>
                    </div>
                    <Link
                        href={route('admin.blog-categories.create')}
                        className="inline-flex items-center px-4 py-2.5 bg-[#0f172a] text-white text-sm font-medium rounded-lg hover:bg-[#1e293b] transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Category
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg border border-[#e2e8f0] p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#64748b]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-[#0f172a]">{totalCategories}</p>
                                <p className="text-sm text-[#64748b]">Total Categories</p>
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
                                <p className="text-2xl font-semibold text-[#0f172a]">{activeCategories}</p>
                                <p className="text-sm text-[#64748b]">Active</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedIds.length > 0 && (
                    <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-[#1e40af]">
                                {selectedIds.length} categories selected
                            </span>
                            <button
                                onClick={handleBulkDelete}
                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-[#dc2626] bg-[#fef2f2] rounded-md hover:bg-[#fee2e2] transition-colors"
                            >
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete Selected
                            </button>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="bg-white rounded-lg border border-[#e2e8f0]">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-[#e2e8f0]">
                            <thead className="bg-[#f8fafc]">
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 text-[#0f172a] focus:ring-[#3b82f6] border-[#d1d5db] rounded"
                                            checked={selectedIds.length === categories.data.length && categories.data.length > 0}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                        Image
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                        Slug
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                        Posts
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-[#e2e8f0]">
                                {categories.data.length > 0 ? (
                                    categories.data.map((category) => (
                                        <tr key={category.id} className="hover:bg-[#f8fafc] transition-colors">
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 text-[#0f172a] focus:ring-[#3b82f6] border-[#d1d5db] rounded"
                                                    checked={selectedIds.includes(category.id)}
                                                    onChange={() => handleSelectOne(category.id)}
                                                />
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                {category.featured_image ? (
                                                    <img
                                                        src={category.featured_image}
                                                        alt={category.name}
                                                        className="h-10 w-10 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center">
                                                        <svg className="w-5 h-5 text-[#94a3b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span className="text-sm font-medium text-[#0f172a]">{category.name}</span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span className="text-sm text-[#64748b]">{category.slug}</span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span className="text-sm text-[#64748b]">{category.blogs_count || 0}</span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleToggleStatus(category)}
                                                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                        category.is_active
                                                            ? 'bg-[#f0fdf4] text-[#16a34a]'
                                                            : 'bg-[#f1f5f9] text-[#64748b]'
                                                    }`}
                                                >
                                                    {category.is_active ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={route('admin.blog-categories.edit', category.id)}
                                                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-[#64748b] bg-[#f1f5f9] rounded-md hover:bg-[#e2e8f0] transition-colors"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(category.id)}
                                                        disabled={category.blogs_count > 0}
                                                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-[#dc2626] bg-[#fef2f2] rounded-md hover:bg-[#fee2e2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title={category.blogs_count > 0 ? 'Cannot delete category with posts' : ''}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="w-12 h-12 rounded-lg bg-[#f1f5f9] flex items-center justify-center mb-3">
                                                    <svg className="w-6 h-6 text-[#94a3b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                    </svg>
                                                </div>
                                                <p className="text-sm font-medium text-[#0f172a]">No categories found</p>
                                                <p className="text-xs text-[#94a3b8] mt-1">Create your first category</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {categories.last_page > 1 && (
                        <div className="px-4 py-4 border-t border-[#e2e8f0] flex items-center justify-between">
                            <p className="text-sm text-[#64748b]">
                                Showing {categories.from} to {categories.to} of {categories.total} results
                            </p>
                            <nav className="flex items-center gap-1">
                                {categories.links.map((link, index) => (
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
