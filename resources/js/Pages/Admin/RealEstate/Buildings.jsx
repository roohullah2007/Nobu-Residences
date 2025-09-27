import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Buildings({ auth, buildings, title }) {
    return (
        <AdminLayout title={title}>
            <Head title={title} />

            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-base font-semibold leading-6 text-gray-900">Buildings</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Manage real estate buildings, properties, and related information.
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <Link href={route('admin.buildings.create')}>
                        <PrimaryButton>
                            Add New Building
                        </PrimaryButton>
                    </Link>
                </div>
            </div>

            {/* Placeholder Content */}
            <div className="mt-8">
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-8 text-center">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                        </svg>
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">No buildings</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Get started by creating a new building listing.
                        </p>
                        <div className="mt-6">
                            <Link href={route('admin.buildings.create')}>
                                <PrimaryButton>
                                    Add Building
                                </PrimaryButton>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Future Features Preview */}
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="h-8 w-8 bg-indigo-100 rounded-md flex items-center justify-center">
                                <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    Total Buildings
                                </dt>
                                <dd className="text-lg font-medium text-gray-900">
                                    0
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="h-8 w-8 bg-green-100 rounded-md flex items-center justify-center">
                                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    Active Listings
                                </dt>
                                <dd className="text-lg font-medium text-gray-900">
                                    0
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="h-8 w-8 bg-yellow-100 rounded-md flex items-center justify-center">
                                <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    Locations
                                </dt>
                                <dd className="text-lg font-medium text-gray-900">
                                    0
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            {/* Building Management Notice */}
            <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">
                            Building Management Available
                        </h3>
                        <div className="mt-2 text-sm text-green-700">
                            <p>
                                Full building management functionality is now available:
                            </p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Building listings with photos and details</li>
                                <li>Location mapping with coordinates</li>
                                <li>Amenities and features management</li>
                                <li>Unit management and availability</li>
                                <li>Developer and management company information</li>
                            </ul>
                            <div className="mt-4">
                                <Link href={route('admin.buildings.index')} className="font-medium text-green-800 hover:text-green-900 underline">
                                    Go to Building Management →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}