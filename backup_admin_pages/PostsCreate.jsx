import { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function PostsCreate({ auth, categories, tags, title }) {
    const [isGeneratingSlug, setIsGeneratingSlug] = useState(true);
    const [selectedTags, setSelectedTags] = useState([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        status: 'draft',
        category_id: '',
        tags: [],
        meta_title: '',
        meta_description: '',
        featured_image: '',
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

    const handleTagToggle = (tagId) => {
        const newSelectedTags = selectedTags.includes(tagId)
            ? selectedTags.filter(id => id !== tagId)
            : [...selectedTags, tagId];
        
        setSelectedTags(newSelectedTags);
        setData('tags', newSelectedTags);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.posts.manage.store'));
    };

    return (
        <AdminLayout title={title}>
            <Head title={title} />

            <div className="max-w-4xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Create a new blog post with content, categories, and tags.
                        </p>
                    </div>
                    <Link href={route('admin.posts.manage.index')}>
                        <SecondaryButton>
                            Back to Posts
                        </SecondaryButton>
                    </Link>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Post Content</h3>
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
                                    placeholder="Enter post title"
                                />
                                <InputError message={errors.title} className="mt-2" />
                            </div>

                            {/* Slug */}
                            <div>
                                <InputLabel htmlFor="slug" value="Slug" />
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                        /blog/
                                    </span>
                                    <TextInput
                                        id="slug"
                                        type="text"
                                        className="flex-1 block w-full rounded-none rounded-r-md"
                                        value={data.slug}
                                        onChange={handleSlugChange}
                                        placeholder="post-url-slug"
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
                                    placeholder="Brief description of the post content"
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
                                    placeholder="Enter post content (HTML supported)"
                                />
                                <InputError message={errors.content} className="mt-2" />
                            </div>

                            {/* Featured Image */}
                            <div>
                                <InputLabel htmlFor="featured_image" value="Featured Image URL" />
                                <TextInput
                                    id="featured_image"
                                    type="url"
                                    className="mt-1 block w-full"
                                    value={data.featured_image}
                                    onChange={(e) => setData('featured_image', e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    Optional: URL to the featured image for this post
                                </p>
                                <InputError message={errors.featured_image} className="mt-2" />
                            </div>
                        </div>
                    </div>

                    {/* Categorization */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Categorization</h3>
                        </div>
                        <div className="px-6 py-4 space-y-6">
                            {/* Category */}
                            <div>
                                <InputLabel htmlFor="category_id" value="Category" />
                                <select
                                    id="category_id"
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', e.target.value)}
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.category_id} className="mt-2" />
                            </div>

                            {/* Tags */}
                            <div>
                                <InputLabel value="Tags" />
                                <div className="mt-2 space-y-2">
                                    {tags.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                            {tags.map((tag) => (
                                                <label
                                                    key={tag.id}
                                                    className="flex items-center space-x-2 cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedTags.includes(tag.id)}
                                                        onChange={() => handleTagToggle(tag.id)}
                                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                    />
                                                    <span className="text-sm text-gray-700">{tag.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">
                                            No tags available. Create tags first to assign them to posts.
                                        </p>
                                    )}
                                </div>
                                <InputError message={errors.tags} className="mt-2" />
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
                                Optimize your post for search engines
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
                                    Leave empty to use post title
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
                        <Link href={route('admin.posts.manage.index')}>
                            <SecondaryButton type="button">
                                Cancel
                            </SecondaryButton>
                        </Link>
                        <PrimaryButton type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Post'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}