import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import Modal from '@/Components/Modal';

export default function Pages({ auth, pages, title }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [pageToDelete, setPageToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleDelete = (page) => {
        setPageToDelete(page);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (pageToDelete) {
            router.delete(route('admin.pages.manage.destroy', pageToDelete.id), {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setPageToDelete(null);
                }
            });
        }
    };

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

    const filteredPages = pages.data.filter(page =>
        page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout title={title}>
            <Head title={title} />

            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-base font-semibold leading-6 text-gray-900">Pages</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Manage your website pages including creating, editing, and organizing content.
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <Link href={route('admin.pages.manage.create')}>
                        <PrimaryButton>
                            Add New Page
                        </PrimaryButton>
                    </Link>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <TextInput
                        type="text"
                        placeholder="Search pages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                    />
                </div>
            </div>

            {/* Pages Table */}
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Title
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Slug
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Author
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Created
                                        </th>
                                        <th scope="col" className="relative px-6 py-3">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {filteredPages.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">
                                                {searchTerm ? 'No pages match your search.' : 'No pages found. Create your first page!'}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPages.map((page) => (
                                            <tr key={page.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {page.title}
                                                        </div>
                                                        {page.excerpt && (
                                                            <div className="text-sm text-gray-500 truncate max-w-xs">
                                                                {page.excerpt}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    /{page.slug}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(page.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {page.user?.name || 'Unknown'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(page.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <Link
                                                            href={route('admin.pages.manage.show', page.id)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            View
                                                        </Link>
                                                        <Link
                                                            href={route('admin.pages.manage.edit', page.id)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(page)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pagination */}
            {pages.links && pages.links.length > 3 && (
                <div className="mt-6 flex items-center justify-between">
                    <div className="flex flex-1 justify-between sm:hidden">
                        {pages.prev_page_url && (
                            <Link
                                href={pages.prev_page_url}
                                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Previous
                            </Link>
                        )}
                        {pages.next_page_url && (
                            <Link
                                href={pages.next_page_url}
                                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Next
                            </Link>
                        )}
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing {pages.from} to {pages.to} of {pages.total} pages
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                                {pages.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                            link.active
                                                ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                                : link.url
                                                ? 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                                                : 'text-gray-400 cursor-not-allowed'
                                        } ${
                                            index === 0 ? 'rounded-l-md' : ''
                                        } ${
                                            index === pages.links.length - 1 ? 'rounded-r-md' : ''
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Delete Page
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                        Are you sure you want to delete "{pageToDelete?.title}"? This action cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-3">
                        <SecondaryButton onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton onClick={confirmDelete}>
                            Delete Page
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}