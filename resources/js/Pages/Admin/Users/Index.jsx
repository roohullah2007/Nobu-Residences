import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import TextInput from '@/Components/TextInput';
import { useState } from 'react';

const lightFormClass =
    '[&_input]:!bg-white [&_input]:!text-gray-900 ' +
    '[&_textarea]:!bg-white [&_textarea]:!text-gray-900 ' +
    '[&_select]:!bg-white [&_select]:!text-gray-900';

export default function UsersIndex({ users, filters = {} }) {
    const [q, setQ] = useState(filters.q || '');

    const submitSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.users.index'), { q }, { preserveState: true, replace: true });
    };

    const handleDelete = (user) => {
        if (!confirm(`Delete user "${user.name}"? This will soft-delete the account.`)) return;
        router.delete(route('admin.users.destroy', user.id), { preserveScroll: true });
    };

    const roleBadge = (role) => {
        const base = 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium';
        if (role === 'admin') return <span className={`${base} bg-purple-100 text-purple-800`}>Admin</span>;
        return <span className={`${base} bg-gray-100 text-gray-700`}>User</span>;
    };

    const statusBadge = (active) => {
        const base = 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium';
        return active
            ? <span className={`${base} bg-green-100 text-green-800`}>Active</span>
            : <span className={`${base} bg-red-100 text-red-800`}>Inactive</span>;
    };

    return (
        <AdminLayout title="Users">
            <Head title="Users" />

            <div className={`space-y-6 ${lightFormClass}`}>
                <div className="bg-white shadow-sm sm:rounded-lg p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Users</h2>
                        <p className="text-sm text-gray-500 mt-1">Search, edit and delete registered users.</p>
                    </div>
                    <form onSubmit={submitSearch} className="flex gap-2">
                        <TextInput
                            type="search"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search by name, email or phone…"
                            className="w-72"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
                        >
                            Search
                        </button>
                    </form>
                </div>

                <div className="bg-white shadow-sm sm:rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                                {users.data.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{u.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{u.phone || '—'}</td>
                                        <td className="px-6 py-4 text-sm">{roleBadge(u.role)}</td>
                                        <td className="px-6 py-4 text-sm">{statusBadge(u.is_active)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{u.created_at || '—'}</td>
                                        <td className="px-6 py-4 text-sm text-right space-x-3">
                                            <Link
                                                href={route('admin.users.edit', u.id)}
                                                className="text-indigo-600 hover:text-indigo-800 font-medium"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(u)}
                                                className="text-red-600 hover:text-red-800 font-medium"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {users.links && users.links.length > 3 && (
                        <div className="px-6 py-3 border-t border-gray-200 flex flex-wrap gap-2 items-center justify-end">
                            {users.links.map((link, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    className={`px-3 py-1 text-sm rounded ${
                                        link.active
                                            ? 'bg-indigo-600 text-white'
                                            : link.url
                                                ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                : 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
