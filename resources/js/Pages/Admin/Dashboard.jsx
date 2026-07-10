import AdminLayout from '@/Layouts/AdminLayout';
import { Link } from '@inertiajs/react';

const ACTIVITY_DOT_COLORS = {
    building: 'bg-[#3b82f6]',
    contact: 'bg-[#f59e0b]',
};

export default function Dashboard({ title, stats, websites, activity = [] }) {
    const statCards = [
        {
            title: 'Total Properties',
            value: stats.total_properties,
            href: route('admin.buildings.index'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            )
        },
        {
            title: 'Active Listings',
            value: stats.active_listings,
            href: route('admin.buildings.index'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            title: 'Pending Review',
            value: stats.pending_listings,
            href: route('admin.buildings.index'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            title: 'Total Users',
            value: stats.total_users,
            href: route('admin.users.index'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        }
    ];

    const quickActions = [
        {
            name: 'Add Building',
            description: 'Create a new building listing',
            href: route('admin.buildings.create'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            )
        },
        {
            name: 'Blog Post',
            description: 'Write a new article',
            href: route('admin.blog.create'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            )
        },
        {
            name: 'Contacts',
            description: 'View inquiries',
            href: route('admin.contacts.index'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            )
        }
    ];

    const hasProperties = (stats.total_properties ?? 0) > 0;

    return (
        <AdminLayout title={title}>
            <div className="space-y-6">
                {/* Empty-state onboarding */}
                {!hasProperties && (
                    <div className="bg-white rounded-lg border border-[#e2e8f0] p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className="text-base font-semibold text-[#0f172a]">Get started</h2>
                            <p className="text-sm text-[#64748b] mt-1">
                                You have no properties yet. Add your first building to start populating the dashboard.
                            </p>
                        </div>
                        <Link
                            href={route('admin.buildings.create')}
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#0f172a] rounded-lg hover:bg-[#1e293b] transition-colors"
                        >
                            Add your first building
                        </Link>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((stat) => (
                        <Link
                            key={stat.title}
                            href={stat.href}
                            className="bg-white rounded-lg border border-[#e2e8f0] p-5 hover:border-[#cbd5e1] hover:shadow-sm transition-all"
                        >
                            <div className="flex items-center justify-between">
                                <div className="w-10 h-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#64748b]">
                                    {stat.icon}
                                </div>
                                <svg className="w-4 h-4 text-[#cbd5e1]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                            <div className="mt-4">
                                <p className="text-2xl font-semibold text-[#0f172a]">
                                    {(stat.value ?? 0).toLocaleString()}
                                </p>
                                <p className="text-sm text-[#64748b] mt-1">{stat.title}</p>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Websites List */}
                        <div className="bg-white rounded-lg border border-[#e2e8f0]">
                            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
                                <div>
                                    <h2 className="text-base font-semibold text-[#0f172a]">Websites</h2>
                                    <p className="text-sm text-[#64748b] mt-0.5">Manage your property websites</p>
                                </div>
                                <Link
                                    href={route('admin.websites.index')}
                                    className="text-sm font-medium text-[#0f172a] hover:text-[#3b82f6] transition-colors"
                                >
                                    View all
                                </Link>
                            </div>
                            <div className="divide-y divide-[#e2e8f0]">
                                {websites.length === 0 && (
                                    <p className="px-5 py-6 text-sm text-[#64748b]">
                                        No websites yet.{' '}
                                        <Link href={route('admin.websites.create')} className="font-medium text-[#0f172a] hover:text-[#3b82f6]">
                                            Create one
                                        </Link>
                                    </p>
                                )}
                                {websites.map((website) => (
                                    <Link
                                        key={website.id}
                                        href={route('admin.websites.show', website.id)}
                                        className="block px-5 py-4 hover:bg-[#f8fafc] transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-[#0f172a] flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-[#0f172a]">{website.name}</p>
                                                    <p className="text-xs text-[#64748b] mt-0.5">{website.domain}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-[#0f172a]">{website.pages}</p>
                                                    <p className="text-xs text-[#64748b]">pages</p>
                                                </div>
                                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                                                    website.status === 'active'
                                                        ? 'bg-[#f0fdf4] text-[#16a34a]'
                                                        : 'bg-[#fefce8] text-[#ca8a04]'
                                                }`}>
                                                    {website.status}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-lg border border-[#e2e8f0]">
                            <div className="px-5 py-4 border-b border-[#e2e8f0]">
                                <h2 className="text-base font-semibold text-[#0f172a]">Recent Activity</h2>
                            </div>
                            {activity.length === 0 ? (
                                <p className="px-5 py-6 text-sm text-[#64748b]">
                                    No activity yet. New buildings and contact inquiries will appear here.
                                </p>
                            ) : (
                                <div className="divide-y divide-[#f1f5f9]">
                                    {activity.map((item, index) => (
                                        <div key={`${item.type}-${index}`} className="flex items-start gap-3 px-5 py-3.5">
                                            <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${ACTIVITY_DOT_COLORS[item.type] ?? 'bg-[#94a3b8]'}`}></div>
                                            <div>
                                                <p className="text-sm text-[#0f172a]">{item.label}</p>
                                                <p className="text-xs text-[#64748b] mt-0.5">{item.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <div className="bg-white rounded-lg border border-[#e2e8f0]">
                            <div className="px-5 py-4 border-b border-[#e2e8f0]">
                                <h2 className="text-base font-semibold text-[#0f172a]">Quick Actions</h2>
                            </div>
                            <div className="p-3">
                                <div className="space-y-1">
                                    {quickActions.map((action) => (
                                        <Link
                                            key={action.name}
                                            href={action.href}
                                            className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#f8fafc] transition-colors group"
                                        >
                                            <div className="w-9 h-9 rounded-lg bg-[#f1f5f9] group-hover:bg-[#e2e8f0] flex items-center justify-center text-[#64748b] transition-colors">
                                                {action.icon}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-[#0f172a]">{action.name}</p>
                                                <p className="text-xs text-[#64748b]">{action.description}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
