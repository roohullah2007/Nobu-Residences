import { useState } from 'react';
import { Link, Head, usePage } from '@inertiajs/react';

export default function AdminLayout({ children, title = 'Admin' }) {
    const { auth } = usePage().props;
    const { url } = usePage();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [realEstateOpen, setRealEstateOpen] = useState(url?.startsWith('/admin/real-estate') || false);

    const navigation = [
        {
            name: 'Dashboard',
            href: route('admin.dashboard'),
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2H10a2 2 0 01-2-2v0z" />
                </svg>
            ),
            current: url?.startsWith('/admin/dashboard') || false
        },

        {
            name: 'Websites',
            href: route('admin.websites.index'),
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                </svg>
            ),
            current: url?.startsWith('/admin/websites') || false
        },
        {
            name: 'Real Estate',
            href: '#',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
            current: url?.startsWith('/admin/real-estate') || false,
            hasSubmenu: true,
            submenu: [
                {
                    name: 'Buildings',
                    href: route('admin.buildings.index'),
                    current: url?.startsWith('/admin/buildings') || false
                },
                {
                    name: 'Developers',
                    href: route('admin.real-estate.developers'),
                    current: url?.startsWith('/admin/real-estate/developers') || false
                },
                {
                    name: 'Amenities',
                    href: route('admin.amenities.index'),
                    current: url?.startsWith('/admin/amenities') || false
                },
                {
                    name: 'Maintenance Fee Amenities',
                    href: route('admin.maintenance-fee-amenities.index'),
                    current: url?.startsWith('/admin/maintenance-fee-amenities') || false
                }
            ]
        },
        {
            name: 'Tour Requests',
            href: route('admin.tour-requests.index'),
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            current: url?.startsWith('/admin/tour-requests') || false
        },
        {
            name: 'Property Questions',
            href: route('admin.property-questions.index'),
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            current: url?.startsWith('/admin/property-questions') || false
        },
        {
            name: 'Contacts',
            href: route('admin.contacts.index'),
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1.586l-4 4z" />
                </svg>
            ),
            current: url?.startsWith('/admin/contacts') || false
        },
        {
            name: 'Blog',
            href: route('admin.blog.index'),
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
                </svg>
            ),
            current: url?.startsWith('/admin/blog') && !url?.startsWith('/admin/blog-categories') || false
        },
        {
            name: 'Blog Categories',
            href: route('admin.blog-categories.index'),
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10v10H7z M5 12h2m10 0h2M12 5v2m0 10v2" />
                </svg>
            ),
            current: url?.startsWith('/admin/blog-categories') || false
        },
        {
            name: 'API Keys',
            href: route('admin.api-keys'),
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2 2 2 0 01-2 2 2 2 0 01-2-2m2-2H9.5a2.5 2.5 0 100 5h1.75m4.5-7l-3 3m3-3l-3-3" />
                </svg>
            ),
            current: url?.startsWith('/admin/api-keys') || false
        }
    ];

    return (
        <div className="min-h-screen bg-gray-100 font-inter">
            <Head title={title} />
            
            {/* Sidebar for mobile */}
            <div className={`relative z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
                <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
                <div className="fixed inset-0 flex">
                    <div className="relative mr-16 flex w-full max-w-xs flex-1">
                        <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                            <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
                            <div className="flex h-16 shrink-0 items-center">
                                <span className="text-xl font-bold text-gray-900">Admin Panel</span>
                            </div>
                            <nav className="flex flex-1 flex-col">
                                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                    <li>
                                        <ul role="list" className="-mx-2 space-y-1">
                                            {navigation.map((item) => (
                                                <li key={item.name}>
                                                    {item.hasSubmenu ? (
                                                        <div>
                                                            <button
                                                            onClick={() => setRealEstateOpen(!realEstateOpen)}
                                                            className={`${
                                                            item.current
                                                            ? 'bg-indigo-50 text-indigo-600'
                                                            : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                                                            } group flex w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-medium items-center`}
                                                            >
                                                            <span className={`${item.current ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600'} h-5 w-5 shrink-0`}>
                                                            {item.icon}
                                                            </span>
                                                            {item.name}
                                                            <svg
                                                            className={`${realEstateOpen ? 'rotate-90' : ''} ml-auto h-4 w-4 shrink-0 transition-transform duration-200`}
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                            </svg>
                                                            </button>
                                                            {realEstateOpen && (
                                                                <ul className="mt-1 px-2">
                                                                    {item.submenu.map((subItem) => (
                                                                        <li key={subItem.name}>
                                                                            <Link
                                                                            href={subItem.href}
                                                                            className={`${
                                                                            subItem.current
                                                                            ? 'bg-indigo-50 text-indigo-600'
                                                                            : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                                                                            } group flex gap-x-3 rounded-md p-2 pl-8 text-sm leading-6 font-medium`}
                                                                            >
                                                                                {subItem.name}
                                                                            </Link>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <Link
                                                            href={item.href}
                                                            className={`${
                                                                item.current
                                                                    ? 'bg-gray-50 text-indigo-600'
                                                                    : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                                                            } group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold`}
                                                        >
                                                            <span className={`${item.current ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600'} h-6 w-6 shrink-0`}>
                                                                {item.icon}
                                                            </span>
                                                            {item.name}
                                                        </Link>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Static sidebar for desktop */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
                    <div className="flex h-16 shrink-0 items-center">
                        <span className="text-xl font-bold text-gray-900">Admin Panel</span>
                    </div>
                    <nav className="flex flex-1 flex-col">
                        <ul role="list" className="flex flex-1 flex-col gap-y-7">
                            <li>
                                <ul role="list" className="-mx-2 space-y-1">
                                    {navigation.map((item) => (
                                        <li key={item.name}>
                                            {item.hasSubmenu ? (
                                                <div>
                                                    <button
                                                        onClick={() => setRealEstateOpen(!realEstateOpen)}
                                                        className={`${
                                                            item.current
                                                                ? 'bg-indigo-50 text-indigo-600'
                                                                : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                                                        } group flex w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-medium items-center`}
                                                    >
                                                        <span className={`${item.current ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600'} h-5 w-5 shrink-0`}>
                                                            {item.icon}
                                                        </span>
                                                        {item.name}
                                                        <svg
                                                            className={`${realEstateOpen ? 'rotate-90' : ''} ml-auto h-4 w-4 shrink-0 transition-transform duration-200`}
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </button>
                                                    {realEstateOpen && (
                                                        <ul className="mt-1 px-2">
                                                            {item.submenu.map((subItem) => (
                                                                <li key={subItem.name}>
                                                                    <Link
                                                                        href={subItem.href}
                                                                        className={`${
                                                                            subItem.current
                                                                                ? 'bg-gray-50 text-indigo-600'
                                                                                : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                                                                        } group flex gap-x-3 rounded-md p-2 pl-8 text-sm leading-6 font-semibold`}
                                                                    >
                                                                        {subItem.name}
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            ) : (
                                                <Link
                                                    href={item.href}
                                                    className={`${
                                                        item.current
                                                            ? 'bg-indigo-50 text-indigo-600'
                                                            : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                                                    } group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium`}
                                                >
                                                    <span className={`${item.current ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600'} h-5 w-5 shrink-0`}>
                                                        {item.icon}
                                                    </span>
                                                    {item.name}
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-72">
                {/* Top bar */}
                <div className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
                    <button
                        type="button"
                        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>

                    <div className="h-6 w-px bg-gray-200 lg:hidden" />

                    <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                        <div className="flex flex-1">
                            <h1 className="text-lg font-semibold text-gray-900 self-center">{title}</h1>
                        </div>
                        <div className="flex items-center gap-x-4 lg:gap-x-6">
                            {/* Profile dropdown */}
                            <div className="relative">
                                <Link
                                    href={route('profile.edit')}
                                    className="flex items-center gap-x-2 text-sm font-medium leading-6 text-gray-700 hover:text-gray-900"
                                >
                                    <span className="sr-only">Your profile</span>
                                    <span>{auth?.user?.name || 'User'}</span>
                                    <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center">
                                        <span className="text-xs font-medium text-gray-600">
                                            {auth?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="py-6">
                    <div className="px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}