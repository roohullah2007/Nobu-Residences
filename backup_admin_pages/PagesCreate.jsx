import { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function PagesCreate({ auth, title }) {
    const [isGeneratingSlug, setIsGeneratingSlug] = useState(true);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        status: 'draft',
        meta_title: '',
        meta_description: '',
    });

    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        setData('title', title);
        
        if (isGeneratingSlug) {
            setData('slug', generateSlug(title));
        }
    };

    const handleSlugChange = (e) => {
        setData('slug', e.target.value);
        setIsGeneratingSlug(false);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.pages.manage.store'));
    };

    return (
        <AdminLayout title={title}>
            <Head title={title} />

            <div className="max-w-4xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Create New Page</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Create a new page for your website with custom content and SEO settings.
                        </p>
                    </div>
                    <Link href={route('admin.pages.manage.index')}>
                        <SecondaryButton>
                            Back to Pages
                        </SecondaryButton>
                    </Link>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Page Content</h3>
                        </div>
                        <div className="px-6 py-4 space-y-6">
                            {/* Title */}
                            <div>
                                <InputLabel htmlFor="title" value="Title" />
                                <TextInput
                                    id="title"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.title}
                                    onChange={handleTitleChange}
                                    required
                                    placeholder="Enter page title"
                                />
                                <InputError message={errors.title} className="mt-2" />
                            </div>

                            {/* Slug */}
                            <div>
                                <InputLabel htmlFor="slug" value="Slug" />
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                        /
                                    </span>
                                    <TextInput
                                        id="slug"
                                        type="text"
                                        className="flex-1 block w-full rounded-none rounded-r-md"
                                        value={data.slug}
                                        onChange={handleSlugChange}
                                        placeholder="page-url-slug"
                                    />
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                    Leave empty to auto-generate from title
                                </p>
                                <InputError message={errors.slug} className="mt-2" />
                            </div>

                            {/* Excerpt */}
                            <div>
                                <InputLabel htmlFor="excerpt" value="Excerpt" />
                                <textarea
                                    id="excerpt"
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    rows="3"
                                    value={data.excerpt}
                                    onChange={(e) => setData('excerpt', e.target.value)}
                                    placeholder="Brief description of the page content"
                                />
                                <InputError message={errors.excerpt} className="mt-2" />
                            </div>

                            {/* Content */}
                            <div>
                                <InputLabel htmlFor="content" value="Content" />
                                <textarea
                                    id="content"
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    rows="12"
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    required
                                    placeholder="Enter page content (HTML supported)"
                                />
                                <InputError message={errors.content} className="mt-2" />
                            </div>

                            {/* Status */}
                            <div>
                                <InputLabel htmlFor="status" value="Status" />
                                <select
                                    id="status"
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="private">Private</option>
                                </select>
                                <InputError message={errors.status} className="mt-2" />
                            </div>
                        </div>
                    </div>

                    {/* SEO Settings */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">SEO Settings</h3>
                            <p className="mt-1 text-sm text-gray-600">
                                Optimize your page for search engines
                            </p>
                        </div>
                        <div className="px-6 py-4 space-y-6">
                            {/* Meta Title */}
                            <div>
                                <InputLabel htmlFor="meta_title" value="Meta Title" />
                                <TextInput
                                    id="meta_title"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.meta_title}
                                    onChange={(e) => setData('meta_title', e.target.value)}
                                    placeholder="SEO title for search engines"
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    Leave empty to use page title
                                </p>
                                <InputError message={errors.meta_title} className="mt-2" />
                            </div>

                            {/* Meta Description */}
                            <div>
                                <InputLabel htmlFor="meta_description" value="Meta Description" />
                                <textarea
                                    id="meta_description"
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    rows="3"
                                    value={data.meta_description}
                                    onChange={(e) => setData('meta_description', e.target.value)}
                                    placeholder="SEO description for search engines"
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    Recommended length: 150-160 characters
                                </p>
                                <InputError message={errors.meta_description} className="mt-2" />
                            </div>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end space-x-3">
                        <Link href={route('admin.pages.manage.index')}>
                            <SecondaryButton type="button">
                                Cancel
                            </SecondaryButton>
                        </Link>
                        <PrimaryButton type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Page'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}