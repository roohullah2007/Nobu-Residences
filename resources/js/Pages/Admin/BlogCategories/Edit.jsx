import React, { useState, useRef } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function BlogCategoryEdit({ category }) {
    const [imagePreview, setImagePreview] = useState(category.featured_image);
    const imageInputRef = useRef(null);

    const { data, setData, post, processing, errors } = useForm({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        is_active: category.is_active ?? true,
        sort_order: category.sort_order || 0,
        featured_image: null,
        remove_image: false,
        _method: 'PATCH'
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('featured_image', file);
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setData(data => ({
            ...data,
            remove_image: true,
            featured_image: null
        }));
        setImagePreview(null);
        if (imageInputRef.current) {
            imageInputRef.current.value = '';
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Use post method with multipart/form-data for file uploads
        post(route('admin.blog-categories.update', category.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                console.log('Form submitted successfully');
            },
            onError: (errors) => {
                console.error('Form submission errors:', errors);
            }
        });
    };

    const handleCancel = () => {
        router.visit(route('admin.blog-categories.index'));
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this category?')) {
            router.delete(route('admin.blog-categories.destroy', category.id));
        }
    };

    return (
        <AdminLayout title="Edit Blog Category">
            <Head title="Edit Blog Category" />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Edit Blog Category</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Update the category details.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg">
                    <div className="p-6 space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Category Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                required
                                autoFocus
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                                Slug
                            </label>
                            <input
                                type="text"
                                id="slug"
                                value={data.slug}
                                onChange={(e) => setData('slug', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="Leave empty to auto-generate from name"
                            />
                            {errors.slug && (
                                <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                URL-friendly version of the name. Will be auto-generated if left empty.
                            </p>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="Optional description of this category"
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="sort_order" className="block text-sm font-medium text-gray-700">
                                Sort Order
                            </label>
                            <input
                                type="number"
                                id="sort_order"
                                value={data.sort_order}
                                onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                            {errors.sort_order && (
                                <p className="mt-1 text-sm text-red-600">{errors.sort_order}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                Lower numbers appear first. Use 0 for default ordering.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Featured Image
                            </label>
                            {imagePreview ? (
                                <div className="space-y-3">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-48 object-cover rounded-lg"
                                    />
                                    <div className="flex space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => imageInputRef.current?.click()}
                                            className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            Change
                                        </button>
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="flex-1 px-3 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <input
                                        ref={imageInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <input
                                        ref={imageInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                    />
                                    {errors.featured_image && (
                                        <p className="mt-1 text-sm text-red-600">{errors.featured_image}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        PNG, JPG, GIF, WEBP up to 20MB. This image will be displayed in category listings.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                                    Active
                                </label>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Only active categories will be shown in blog post forms.
                            </p>
                            {errors.is_active && (
                                <p className="mt-1 text-sm text-red-600">{errors.is_active}</p>
                            )}
                        </div>

                        {category.blogs_count > 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                                <p className="text-sm text-yellow-800">
                                    This category has {category.blogs_count} blog post{category.blogs_count !== 1 ? 's' : ''} associated with it.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 px-6 py-3 flex items-center justify-between rounded-b-lg">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={category.blogs_count > 0}
                            className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            title={category.blogs_count > 0 ? 'Cannot delete category with existing blogs' : ''}
                        >
                            Delete Category
                        </button>

                        <div className="flex items-center space-x-3">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}