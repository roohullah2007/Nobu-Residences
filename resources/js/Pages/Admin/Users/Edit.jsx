import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

const lightFormClass =
    '[&_input]:!bg-white [&_input]:!text-gray-900 ' +
    '[&_textarea]:!bg-white [&_textarea]:!text-gray-900 ' +
    '[&_select]:!bg-white [&_select]:!text-gray-900';

export default function UsersEdit({ user, roles = [] }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'user',
        is_active: !!user.is_active,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.users.update', user.id), { preserveScroll: true });
    };

    return (
        <AdminLayout title={`Edit User: ${user.name}`}>
            <Head title={`Edit User: ${user.name}`} />

            <div className={`max-w-3xl mx-auto ${lightFormClass}`}>
                <div className="bg-white shadow-sm sm:rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Edit User</h2>
                            <p className="text-sm text-gray-500 mt-1">Member since {user.created_at || '—'}</p>
                        </div>
                        <Link href={route('admin.users.index')} className="text-sm text-indigo-600 hover:text-indigo-800">
                            ← Back to users
                        </Link>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="name" value="Name" />
                                <TextInput
                                    id="name"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Full name"
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="email" value="Email" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="user@example.com"
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="phone" value="Phone" />
                                <TextInput
                                    id="phone"
                                    type="tel"
                                    className="mt-1 block w-full"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="+1 (555) 123-4567"
                                />
                                <InputError message={errors.phone} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="role" value="Role" />
                                <select
                                    id="role"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                >
                                    {roles.map((r) => (
                                        <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </select>
                                <InputError message={errors.role} className="mt-2" />
                            </div>

                            <div className="md:col-span-2">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Account is active</span>
                                </label>
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-sm font-medium text-gray-900 mb-1">Reset password (optional)</h3>
                            <p className="text-xs text-gray-500 mb-4">Leave blank to keep the current password.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="password" value="New password" />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        className="mt-1 block w-full"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        autoComplete="new-password"
                                    />
                                    <InputError message={errors.password} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="password_confirmation" value="Confirm new password" />
                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        className="mt-1 block w-full"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <Link
                                href={route('admin.users.index')}
                                className="inline-flex items-center px-4 py-2 bg-gray-200 border border-transparent rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-300"
                            >
                                Cancel
                            </Link>
                            <PrimaryButton disabled={processing}>
                                {processing ? 'Saving…' : 'Save changes'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
