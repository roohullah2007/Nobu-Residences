import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Schools({ auth, schools, title }) {
    return (
        <AdminLayout title={title}>
            <Head title={title} />

            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-base font-semibold leading-6 text-gray-900">Schools</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Manage schools and educational institutions in your real estate areas.
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <PrimaryButton>
                        Add New School
                    </PrimaryButton>
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
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                        </svg>
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">No schools</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Get started by adding a school or educational institution.
                        </p>
                        <div className="mt-6">
                            <PrimaryButton>
                                Add School
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            </div>

            {/* Future Features Preview */}
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="h-8 w-8 bg-indigo-100 rounded-md flex items-center justify-center">
                                <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    Total Schools
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
                            <div className="h-8 w-8 bg-blue-100 rounded-md flex items-center justify-center">
                                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    Elementary Schools
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    High Schools
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    Private Schools
                                </dt>
                                <dd className="text-lg font-medium text-gray-900">
                                    0
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            {/* School Types Overview */}
            <div className="mt-8 bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">School Categories</h3>
                </div>
                <div className="px-6 py-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900">Elementary Schools</h4>
                            <p className="text-sm text-gray-500 mt-1">Kindergarten through Grade 8</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900">High Schools</h4>
                            <p className="text-sm text-gray-500 mt-1">Grades 9-12 and Secondary Education</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900">Private Schools</h4>
                            <p className="text-sm text-gray-500 mt-1">Independent and Charter Schools</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900">Universities</h4>
                            <p className="text-sm text-gray-500 mt-1">Colleges and Higher Education</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900">Special Needs</h4>
                            <p className="text-sm text-gray-500 mt-1">Specialized Educational Programs</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900">Daycare Centers</h4>
                            <p className="text-sm text-gray-500 mt-1">Early Childhood Education</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Coming Soon Notice */}
            <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">
                            School Management Coming Soon
                        </h3>
                        <div className="mt-2 text-sm text-green-700">
                            <p>
                                Full school management functionality will be added here, including:
                            </p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>School profiles with ratings and reviews</li>
                                <li>Distance calculations from properties</li>
                                <li>School district mapping and boundaries</li>
                                <li>Performance metrics and test scores</li>
                                <li>Enrollment information and capacity</li>
                                <li>Integration with property search filters</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}