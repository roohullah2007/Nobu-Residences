import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function PagesShow({ auth, page, title }) {
    const getStatusBadge = (status) => {
        const badges = {
            published: 'bg-green-100 text-green-800',
            draft: 'bg-yellow-100 text-yellow-800',
            private: 'bg-gray-100 text-gray-800'
        };
        
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status] || badges.draft}`}>
                {status}
            </span>
        );
    };

    return (
        <AdminLayout title={title}>
            <Head title={title} />

            <div className="max-w-4xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{page.title}</h1>
                        <div className="mt-2 flex items-center space-x-4">
                            {getStatusBadge(page.status)}
                            <span className="text-sm text-gray-500">
                                Created {new Date(page.created_at).toLocaleDateString()}
                            </span>
                            {page.user && (
                                <span className="text-sm text-gray-500">
                                    by {page.user.name}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <Link href={route('admin.pages.manage.edit', page.id)}>
                            <PrimaryButton>
                                Edit Page
                            </PrimaryButton>
                        </Link>
                        <Link href={route('admin.pages.manage.index')}>
                            <SecondaryButton>
                                Back to Pages
                            </SecondaryButton>
                        </Link>
                    </div>
                </div>

                {/* Page Details */}
                <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Page Details</h3>
                        </div>
                        <div className="px-6 py-4">
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Title</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{page.title}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Slug</dt>
                                    <dd className="mt-1 text-sm text-gray-900">/{page.slug}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                                    <dd className="mt-1">{getStatusBadge(page.status)}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {new Date(page.updated_at).toLocaleString()}
                                    </dd>
                                </div>
                                {page.excerpt && (
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500">Excerpt</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{page.excerpt}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </div>

                    {/* Content Preview */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Content</h3>
                        </div>
                        <div className="px-6 py-4">
                            <div className="prose max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: page.content }} />
                            </div>
                        </div>
                    </div>

                    {/* SEO Information */}
                    {(page.meta_title || page.meta_description) && (
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">SEO Information</h3>
                            </div>
                            <div className="px-6 py-4">
                                <dl className="grid grid-cols-1 gap-x-4 gap-y-6">
                                    {page.meta_title && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Meta Title</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{page.meta_title}</dd>
                                        </div>
                                    )}
                                    {page.meta_description && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Meta Description</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{page.meta_description}</dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        </div>
                    )}

                    {/* Search Engine Preview */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Search Engine Preview</h3>
                            <p className="mt-1 text-sm text-gray-600">
                                How this page might appear in search results
                            </p>
                        </div>
                        <div className="px-6 py-4">
                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <h4 className="text-lg text-blue-600 hover:underline cursor-pointer">
                                    {page.meta_title || page.title}
                                </h4>
                                <p className="text-green-700 text-sm mt-1">
                                    yoursite.com/{page.slug}
                                </p>
                                <p className="text-gray-600 text-sm mt-2">
                                    {page.meta_description || page.excerpt || 'No description available.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                        <Link href={route('admin.pages.manage.index')}>
                            <SecondaryButton>
                                ← Back to All Pages
                            </SecondaryButton>
                        </Link>
                        <div className="flex space-x-3">
                            {page.status === 'published' && (
                                <a
                                    href={`/${page.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    View Live Page
                                    <svg className="ml-2 -mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            )}
                            <Link href={route('admin.pages.manage.edit', page.id)}>
                                <PrimaryButton>
                                    Edit Page
                                </PrimaryButton>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}