import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to your Dashboard!</h3>
                                <p className="text-gray-600">You're successfully logged in to the Laravel React starter kit.</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Link
                                    href={route('admin.dashboard')}
                                    className="block p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                                >
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div className="ml-4">
                                            <h4 className="text-lg font-semibold">Admin Dashboard</h4>
                                            <p className="text-blue-100">Manage your real estate websites and properties</p>
                                        </div>
                                    </div>
                                </Link>

                                <div className="block p-6 bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg text-white">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <div className="ml-4">
                                            <h4 className="text-lg font-semibold">AMPRE API</h4>
                                            <p className="text-green-100">Real estate data integration ready</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Info:</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• Laravel React starter kit with SSR enabled</li>
                                    <li>• AMPRE API service configured and ready</li>
                                    <li>• Admin panel with Dashboard and Websites sections</li>
                                    <li>• Tailwind CSS for styling</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
