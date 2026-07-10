import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PrimaryButton from '@/Components/PrimaryButton';

const FREQUENCY_LABELS = { 1: 'Daily', 7: 'Weekly', 30: 'Monthly' };

const StatCard = ({ label, value }) => (
    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl px-5 py-4">
        <div className="text-sm text-gray-500">{label}</div>
        <div className="mt-1 text-2xl font-bold text-gray-900">{value}</div>
    </div>
);

export default function SavedSearchesIndex({ auth, savedSearches, stats, filters = {} }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.saved-searches.index'),
            { search: searchTerm },
            { preserveState: true, preserveScroll: true }
        );
    };

    return (
        <AdminLayout title="Saved Searches">
            <Head title="Saved Searches" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <StatCard label="Total Saved Searches" value={stats.total_saved_searches} />
                        <StatCard label="Alerts Enabled" value={stats.alerts_enabled} />
                        <StatCard label="Daily / Weekly / Monthly" value={`${stats.frequency_breakdown.daily} / ${stats.frequency_breakdown.weekly} / ${stats.frequency_breakdown.monthly}`} />
                        <StatCard label="Alerts Sent (7 days)" value={stats.alerts_sent_last_7_days} />
                        <StatCard label="Alerts Disabled" value={stats.alerts_disabled} />
                    </div>

                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name, user, or email..."
                            className="flex-1 max-w-md rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        <PrimaryButton type="submit">Search</PrimaryButton>
                    </form>

                    {/* Table */}
                    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Search</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criteria</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alerts</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Alert</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {savedSearches.data.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                                                No saved searches yet.
                                            </td>
                                        </tr>
                                    )}
                                    {savedSearches.data.map((search) => (
                                        <tr key={search.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm">
                                                <div className="font-medium text-gray-900">{search.user?.name || '—'}</div>
                                                <div className="text-gray-500">{search.user?.email}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{search.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate" title={search.formatted_criteria}>
                                                {search.formatted_criteria}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${search.email_alerts ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                                    {search.email_alerts ? 'On' : 'Off'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{FREQUENCY_LABELS[search.frequency] || '—'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{search.last_alert_sent || 'Never'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{search.total_alerts_sent ?? 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {savedSearches.links && savedSearches.links.length > 3 && (
                            <div className="px-4 py-3 border-t border-gray-200 flex flex-wrap gap-1">
                                {savedSearches.links.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded text-sm ${link.active ? 'bg-gray-900 text-white' : link.url ? 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200' : 'text-gray-400'}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
