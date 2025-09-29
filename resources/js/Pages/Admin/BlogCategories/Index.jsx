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

    return (
        <AdminLayout title="Blog Categories">
            <Head title="Blog Categories" />

            <div className="px-4 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <h1 className="text-2xl font-semibold text-gray-900">Blog Categories</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Manage blog categories for organizing your blog posts.
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                        <Link
                            href={route('admin.blog-categories.create')}
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                        >
                            Add Category
                        </Link>
                    </div>
                </div>

                {selectedIds.length > 0 && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-yellow-800">
                                {selectedIds.length} categories selected
                            </span>
                            <button
                                onClick={handleBulkDelete}
                                className="text-sm text-red-600 hover:text-red-900 font-medium"
                            >
                                Delete Selected
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-8 flex flex-col">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="relative px-7 sm:w-12 sm:px-6">
                                                <input
                                                    type="checkbox"
                                                    className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                    checked={selectedIds.length === categories.data.length && categories.data.length > 0}
                                                    onChange={handleSelectAll}
                                                />
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                Image
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                Name
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                Slug
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                Description
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                Posts
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                Status
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                Sort Order
                                            </th>
                                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                <span className="sr-only">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {categories.data.map((category) => (
                                            <tr key={category.id}>
                                                <td className="relative px-7 sm:w-12 sm:px-6">
                                                    <input
                                                        type="checkbox"
                                                        className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                        checked={selectedIds.includes(category.id)}
                                                        onChange={() => handleSelectOne(category.id)}
                                                    />
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4">
                                                    {category.featured_image ? (
                                                        <img
                                                            src={category.featured_image}
                                                            alt={category.name}
                                                            className="h-10 w-10 rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                                            <span className="text-gray-500 text-xs">No img</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                                                    {category.name}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {category.slug}
                                                </td>
                                                <td className="px-3 py-4 text-sm text-gray-500">
                                                    {category.description || '-'}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {category.blogs_count || 0}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                    <button
                                                        onClick={() => handleToggleStatus(category)}
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                                                            category.is_active
                                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        {category.is_active ? 'Active' : 'Inactive'}
                                                    </button>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {category.sort_order}
                                                </td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <Link
                                                        href={route('admin.blog-categories.edit', category.id)}
                                                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(category.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                        disabled={category.blogs_count > 0}
                                                        title={category.blogs_count > 0 ? 'Cannot delete category with existing blogs' : ''}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {categories.data.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        No categories found. Create your first category!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {categories.last_page > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing {categories.from} to {categories.to} of {categories.total} results
                        </div>
                        <div className="flex space-x-2">
                            {categories.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`px-3 py-2 text-sm ${
                                        link.active
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                    } border rounded`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    preserveScroll
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}