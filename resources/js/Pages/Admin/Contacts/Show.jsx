import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Show({ title, contact }) {
    const handleMarkAsRead = () => {
        router.patch(`/admin/contacts/${contact.id}/mark-read`, {}, {
            preserveState: true
        });
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this contact? This action cannot be undone.')) {
            router.delete(`/admin/contacts/${contact.id}`);
        }
    };

    const getCategoryBadges = (categoriesArray) => {
        return categoriesArray.map((category, index) => (
            <span 
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mr-2 mb-2"
            >
                {category.charAt(0).toUpperCase() + category.slice(1)}
            </span>
        ));
    };

    const getStatusBadge = (isRead) => {
        if (isRead) {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Read
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Unread
                </span>
            );
        }
    };

    return (
        <AdminLayout>
            <Head title={title} />
            
            <div className="py-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <Link 
                                    href="/admin/contacts"
                                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Back to Contacts
                                </Link>
                                <h1 className="text-3xl font-bold text-gray-900">Contact Details</h1>
                                <p className="mt-2 text-gray-600">
                                    Viewing contact form submission from {contact.name}
                                </p>
                            </div>
                            <div className="flex items-center space-x-3">
                                {!contact.is_read && (
                                    <button
                                        onClick={handleMarkAsRead}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Mark as Read
                                    </button>
                                )}
                                <button
                                    onClick={handleDelete}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            {/* Contact Information */}
                            <div className="bg-white shadow rounded-lg mb-6">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
                                        {getStatusBadge(contact.is_read)}
                                    </div>
                                </div>
                                <div className="px-6 py-4">
                                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{contact.name}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                <a 
                                                    href={`mailto:${contact.email}`}
                                                    className="text-indigo-600 hover:text-indigo-500"
                                                >
                                                    {contact.email}
                                                </a>
                                            </dd>
                                        </div>
                                        {contact.phone && (
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                                                <dd className="mt-1 text-sm text-gray-900">
                                                    <a 
                                                        href={`tel:${contact.phone}`}
                                                        className="text-indigo-600 hover:text-indigo-500"
                                                    >
                                                        {contact.phone}
                                                    </a>
                                                </dd>
                                            </div>
                                        )}
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Inquiry Categories</dt>
                                            <dd className="mt-1">
                                                <div className="flex flex-wrap">
                                                    {getCategoryBadges(contact.categories_array)}
                                                </div>
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            {/* Message */}
                            {contact.message && (
                                <div className="bg-white shadow rounded-lg mb-6">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900">Message</h3>
                                    </div>
                                    <div className="px-6 py-4">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{contact.message}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Quick Actions */}
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                                </div>
                                <div className="px-6 py-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <a
                                            href={`mailto:${contact.email}?subject=Re: Your inquiry on Nobu Residences&body=Hi ${contact.name},%0D%0A%0D%0AThank you for your interest in Nobu Residences. I received your inquiry about ${contact.formatted_categories.toLowerCase()} and wanted to follow up with you.%0D%0A%0D%0ABest regards,%0D%0ANobu Residences Team`}
                                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            Send Email
                                        </a>
                                        {contact.phone && (
                                            <a
                                                href={`tel:${contact.phone}`}
                                                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                Call Phone
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            {/* Submission Details */}
                            <div className="bg-white shadow rounded-lg mb-6">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">Submission Details</h3>
                                </div>
                                <div className="px-6 py-4">
                                    <dl className="space-y-4">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Submitted</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {contact.time_ago}
                                                <div className="text-xs text-gray-500">
                                                    {new Date(contact.created_at).toLocaleString()}
                                                </div>
                                            </dd>
                                        </div>
                                        {contact.submitted_at && contact.submitted_at !== contact.created_at && (
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Original Submit Time</dt>
                                                <dd className="mt-1 text-sm text-gray-900">
                                                    {new Date(contact.submitted_at).toLocaleString()}
                                                </dd>
                                            </div>
                                        )}
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {new Date(contact.updated_at).toLocaleString()}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Contact ID</dt>
                                            <dd className="mt-1 text-sm text-gray-900 font-mono">#{contact.id}</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            {/* User Account Info */}
                            {contact.user && (
                                <div className="bg-white shadow rounded-lg mb-6">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900">User Account</h3>
                                    </div>
                                    <div className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {contact.user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {contact.user.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {contact.user.email}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    Registered User
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Technical Details */}
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">Technical Details</h3>
                                </div>
                                <div className="px-6 py-4">
                                    <dl className="space-y-4">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">IP Address</dt>
                                            <dd className="mt-1 text-sm text-gray-900 font-mono">
                                                {contact.ip_address || 'Not recorded'}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">User Agent</dt>
                                            <dd className="mt-1 text-xs text-gray-700 break-all">
                                                {contact.user_agent || 'Not recorded'}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
