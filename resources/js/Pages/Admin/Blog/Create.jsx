import React, { useState, useRef } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function BlogCreate() {
    const { categories } = usePage().props;
    const [imagePreview, setImagePreview] = useState(null);
    const imageInputRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        content: '',
        excerpt: '',
        category: '',
        category_id: null,
        status: 'draft',
        image: null,
        meta_title: '',
        meta_description: '',
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('image', file);
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setData('image', null);
        setImagePreview(null);
        if (imageInputRef.current) {
            imageInputRef.current.value = '';
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Generate meta title from title if not provided
        const metaTitle = data.meta_title || data.title;
        const metaDescription = data.meta_description || data.excerpt;

        post(route('admin.blog.store'), {
            ...data,
            meta_title: metaTitle,
            meta_description: metaDescription,
            onSuccess: () => {
                setIsSubmitting(false);
            },
            onError: () => {
                setIsSubmitting(false);
            }
        });
    };

    const handleSaveAsDraft = () => {
        setData('status', 'draft');
        setTimeout(() => {
            document.getElementById('blog-form').requestSubmit();
        }, 100);
    };

    const handlePublish = () => {
        setData('status', 'published');
        setTimeout(() => {
            document.getElementById('blog-form').requestSubmit();
        }, 100);
    };

    return (
        <AdminLayout title="Create Blog Post">
            <Head title="Create Blog Post" />

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Create New Blog Post</h1>
                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={handleSaveAsDraft}
                            disabled={processing || isSubmitting}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            Save as Draft
                        </button>
                        <button
                            type="button"
                            onClick={handlePublish}
                            disabled={processing || isSubmitting}
                            className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {processing || isSubmitting ? 'Publishing...' : 'Publish'}
                        </button>
                    </div>
                </div>

                <form id="blog-form" onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Title */}
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-lg"
                                    placeholder="Enter blog post title..."
                                    required
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                                )}
                            </div>

                            {/* Excerpt */}
                            <div>
                                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                                    Excerpt
                                </label>
                                <textarea
                                    id="excerpt"
                                    value={data.excerpt}
                                    onChange={(e) => setData('excerpt', e.target.value)}
                                    rows={3}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="Brief description of the blog post..."
                                />
                                {errors.excerpt && (
                                    <p className="mt-1 text-sm text-red-600">{errors.excerpt}</p>
                                )}
                                <p className="mt-1 text-sm text-gray-500">
                                    A short summary that will be displayed in blog listings and search results.
                                </p>
                            </div>

                            {/* Content */}
                            <div>
                                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                                    Content *
                                </label>
                                <textarea
                                    id="content"
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    rows={20}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="Write your blog post content here... You can use HTML tags for formatting."
                                    required
                                />
                                {errors.content && (
                                    <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                                )}
                                <p className="mt-1 text-sm text-gray-500">
                                    You can use HTML tags for formatting (p, h1-h6, strong, em, ul, ol, li, a, img, etc.)
                                </p>
                            </div>

                            {/* SEO Section */}
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700 mb-2">
                                            Meta Title
                                        </label>
                                        <input
                                            type="text"
                                            id="meta_title"
                                            value={data.meta_title}
                                            onChange={(e) => setData('meta_title', e.target.value)}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="SEO title (will use blog title if empty)"
                                        />
                                        {errors.meta_title && (
                                            <p className="mt-1 text-sm text-red-600">{errors.meta_title}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 mb-2">
                                            Meta Description
                                        </label>
                                        <textarea
                                            id="meta_description"
                                            value={data.meta_description}
                                            onChange={(e) => setData('meta_description', e.target.value)}
                                            rows={3}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="SEO description (will use excerpt if empty)"
                                        />
                                        {errors.meta_description && (
                                            <p className="mt-1 text-sm text-red-600">{errors.meta_description}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Status */}
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <h3 className="text-sm font-medium text-gray-900 mb-3">Publish Settings</h3>
                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                    </select>
                                    {errors.status && (
                                        <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                                    )}
                                </div>
                            </div>

                            {/* Category */}
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <h3 className="text-sm font-medium text-gray-900 mb-3">Category</h3>
                                <div>
                                    <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select
                                        id="category_id"
                                        value={data.category_id || ''}
                                        onChange={(e) => {
                                            const selectedId = e.target.value;
                                            const selectedCategory = categories.find(c => c.id == selectedId);
                                            setData({
                                                ...data,
                                                category_id: selectedId ? parseInt(selectedId) : null,
                                                category: selectedCategory ? selectedCategory.name : ''
                                            });
                                        }}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">Select a category...</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
                                    )}
                                    <p className="mt-1 text-sm text-gray-500">
                                        Choose a category to organize your blog post
                                    </p>
                                </div>
                            </div>

                            {/* Featured Image */}
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <h3 className="text-sm font-medium text-gray-900 mb-3">Featured Image</h3>

                                {imagePreview ? (
                                    <div className="space-y-3">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-40 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="w-full px-3 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                                        >
                                            Remove Image
                                        </button>
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
                                        {errors.image && (
                                            <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                                        )}
                                        <p className="mt-1 text-xs text-gray-500">
                                            PNG, JPG, GIF up to 2MB
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Hidden submit button */}
                    <button type="submit" style={{ display: 'none' }}>Submit</button>
                </form>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-6 border-t">
                    <button
                        type="button"
                        onClick={() => router.visit(route('admin.blog.index'))}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Cancel
                    </button>

                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={handleSaveAsDraft}
                            disabled={processing || isSubmitting}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            Save as Draft
                        </button>
                        <button
                            type="button"
                            onClick={handlePublish}
                            disabled={processing || isSubmitting}
                            className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {processing || isSubmitting ? 'Publishing...' : 'Publish'}
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}