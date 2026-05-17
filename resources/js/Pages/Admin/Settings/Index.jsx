import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useMemo, useState } from 'react';

const lightFormClass =
    '[&_input]:!bg-white [&_input]:!text-gray-900 ' +
    '[&_textarea]:!bg-white [&_textarea]:!text-gray-900 ' +
    '[&_select]:!bg-white [&_select]:!text-gray-900';

// Pretty label for a setting key (e.g. "site_name" → "Site Name")
const labelFor = (key) =>
    key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const TABS = [
    { id: 'general', label: 'General' },
    { id: 'api', label: 'API Keys' },
    { id: 'email', label: 'Email & Notifications' },
];

export default function SettingsIndex({ schema, values, timezones = [], mail_drivers = [] }) {
    const [tab, setTab] = useState('general');
    const { flash } = usePage().props;

    return (
        <AdminLayout title="Settings">
            <Head title="Settings" />

            <div className={`space-y-6 ${lightFormClass}`}>
                <div className="bg-white shadow-sm sm:rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
                    <p className="text-sm text-gray-500 mt-1">Configure general site info, API integrations, and email notifications.</p>
                </div>

                {/* Tabs */}
                <div className="bg-white shadow-sm sm:rounded-lg overflow-hidden">
                    <div className="border-b border-gray-200 flex">
                        {TABS.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => setTab(t.id)}
                                className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                                    tab === t.id
                                        ? 'border-indigo-600 text-indigo-700'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {flash?.success && (
                        <div className="px-6 py-3 bg-green-50 border-b border-green-200 text-sm text-green-800">
                            {flash.success}
                        </div>
                    )}

                    <div className="p-6">
                        {tab === 'general' && (
                            <GeneralTab schema={schema.general} values={values.general} timezones={timezones} />
                        )}
                        {tab === 'api' && (
                            <ApiKeysTab schema={schema.api} values={values.api} />
                        )}
                        {tab === 'email' && (
                            <EmailTab schema={schema.email} values={values.email} mailDrivers={mail_drivers} />
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

/* -------- General -------- */
function GeneralTab({ schema, values, timezones }) {
    const initial = useMemo(() => {
        const o = { group: 'general' };
        for (const f of schema) o[f.key] = values[f.key] ?? '';
        return o;
    }, [schema, values]);

    const { data, setData, put, processing, errors } = useForm(initial);

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.settings.update'), { preserveScroll: true });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {schema.map((f) => {
                    if (f.key === 'default_timezone') {
                        return (
                            <div key={f.key}>
                                <InputLabel htmlFor={f.key} value={labelFor(f.key)} />
                                <select
                                    id={f.key}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data[f.key] || ''}
                                    onChange={(e) => setData(f.key, e.target.value)}
                                >
                                    <option value="">— Select —</option>
                                    {timezones.map((tz) => (
                                        <option key={tz} value={tz}>{tz}</option>
                                    ))}
                                </select>
                                <InputError message={errors[f.key]} className="mt-2" />
                            </div>
                        );
                    }
                    if (f.key === 'contact_address') {
                        return (
                            <div key={f.key} className="md:col-span-2">
                                <InputLabel htmlFor={f.key} value={labelFor(f.key)} />
                                <textarea
                                    id={f.key}
                                    rows={2}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data[f.key] || ''}
                                    onChange={(e) => setData(f.key, e.target.value)}
                                />
                                <InputError message={errors[f.key]} className="mt-2" />
                            </div>
                        );
                    }
                    return (
                        <div key={f.key}>
                            <InputLabel htmlFor={f.key} value={labelFor(f.key)} />
                            <TextInput
                                id={f.key}
                                type="text"
                                className="mt-1 block w-full"
                                value={data[f.key] || ''}
                                onChange={(e) => setData(f.key, e.target.value)}
                                placeholder={placeholderFor(f.key)}
                            />
                            <InputError message={errors[f.key]} className="mt-2" />
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-end">
                <PrimaryButton disabled={processing}>{processing ? 'Saving…' : 'Save general settings'}</PrimaryButton>
            </div>
        </form>
    );
}

/* -------- API Keys -------- */
function ApiKeysTab({ schema, values }) {
    const initial = useMemo(() => {
        const o = { group: 'api' };
        for (const f of schema) {
            // Sensitive keys start empty (we never round-trip the real value)
            const isSensitive = !!f.is_encrypted || !!f.sensitive;
            const v = values[f.key];
            o[f.key] = isSensitive ? '' : (v ?? '');
        }
        return o;
    }, [schema, values]);

    const { data, setData, put, processing, errors } = useForm(initial);

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.settings.update'), { preserveScroll: true });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="space-y-6">
                {schema.map((f) => {
                    const isSensitive = !!f.is_encrypted;
                    const v = values[f.key];
                    const hasValue = isSensitive ? !!v?.has_value : !!v;
                    const masked = isSensitive ? (v?.masked || '') : '';
                    return (
                        <div key={f.key}>
                            <div className="flex items-center justify-between">
                                <InputLabel htmlFor={f.key} value={labelFor(f.key)} />
                                {isSensitive && hasValue && (
                                    <span className="text-xs text-gray-500 font-mono">Current: {masked}</span>
                                )}
                            </div>
                            <TextInput
                                id={f.key}
                                type={isSensitive ? 'password' : 'text'}
                                className="mt-1 block w-full"
                                value={data[f.key] || ''}
                                onChange={(e) => setData(f.key, e.target.value)}
                                placeholder={isSensitive ? (hasValue ? 'Enter a new value to replace…' : 'Paste the API key/token') : placeholderFor(f.key)}
                                autoComplete="new-password"
                            />
                            <InputError message={errors[f.key]} className="mt-2" />
                            {isSensitive && (
                                <p className="mt-1 text-xs text-gray-500">
                                    Leave blank to keep the current value. New values are encrypted at rest.
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-end">
                <PrimaryButton disabled={processing}>{processing ? 'Saving…' : 'Save API settings'}</PrimaryButton>
            </div>
        </form>
    );
}

/* -------- Email -------- */
function EmailTab({ schema, values, mailDrivers }) {
    const initial = useMemo(() => {
        const o = { group: 'email' };
        for (const f of schema) o[f.key] = values[f.key] ?? (f.type === 'boolean' ? false : '');
        return o;
    }, [schema, values]);

    const { data, setData, put, processing, errors } = useForm(initial);

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.settings.update'), { preserveScroll: true });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {schema.map((f) => {
                    if (f.type === 'boolean') {
                        return (
                            <div key={f.key} className="md:col-span-2">
                                <label className="flex items-start gap-2">
                                    <input
                                        type="checkbox"
                                        checked={!!data[f.key]}
                                        onChange={(e) => setData(f.key, e.target.checked)}
                                        className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-gray-700">{labelFor(f.key)}</span>
                                </label>
                            </div>
                        );
                    }
                    if (f.key === 'mail_driver') {
                        return (
                            <div key={f.key}>
                                <InputLabel htmlFor={f.key} value={labelFor(f.key)} />
                                <select
                                    id={f.key}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data[f.key] || ''}
                                    onChange={(e) => setData(f.key, e.target.value)}
                                >
                                    <option value="">— Select —</option>
                                    {mailDrivers.map((m) => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                                <InputError message={errors[f.key]} className="mt-2" />
                            </div>
                        );
                    }
                    return (
                        <div key={f.key}>
                            <InputLabel htmlFor={f.key} value={labelFor(f.key)} />
                            <TextInput
                                id={f.key}
                                type="text"
                                className="mt-1 block w-full"
                                value={data[f.key] || ''}
                                onChange={(e) => setData(f.key, e.target.value)}
                                placeholder={placeholderFor(f.key)}
                            />
                            <InputError message={errors[f.key]} className="mt-2" />
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-end">
                <PrimaryButton disabled={processing}>{processing ? 'Saving…' : 'Save email settings'}</PrimaryButton>
            </div>
        </form>
    );
}

function placeholderFor(key) {
    const map = {
        site_name: 'Nobu Residences',
        site_tagline: 'Luxury condos in downtown Toronto',
        contact_email: 'contact@example.com',
        contact_phone: '+1 (555) 123-4567',
        contact_address: '15 Mercer St, Toronto',
        facebook_url: 'https://facebook.com/yourpage',
        instagram_url: 'https://instagram.com/yourpage',
        twitter_url: 'https://twitter.com/yourpage',
        linkedin_url: 'https://linkedin.com/company/yourpage',
        mail_from_address: 'no-reply@example.com',
        mail_from_name: 'Nobu Residences',
        ploi_server_id: '87657',
        ploi_site_id: '307242',
    };
    return map[key] || '';
}
