import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

const Status = ({ status }) => {
    if (status === true) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                Success
            </span>
        );
    }
    if (status === false) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                Failed
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" strokeWidth="2" /></svg>
            Skipped
        </span>
    );
};

const Row = ({ icon, title, status, message, hint = null }) => (
    <div className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-0">
        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3">
                <div className="font-medium text-gray-900">{title}</div>
                <Status status={status} />
            </div>
            <div className="text-sm text-gray-600 mt-1 break-words whitespace-pre-wrap font-mono">{message}</div>
            {hint && <div className="text-xs text-gray-500 mt-2">{hint}</div>}
        </div>
    </div>
);

export default function WebsiteCreated({ website, report, ploi }) {
    const allOk = report.db?.ok && report.ploi?.ok !== false && report.ssl?.ok !== false;

    const ipWhitelistMatch = (msg) =>
        typeof msg === 'string' && msg.match(/IP address.*not allowed.*\(Used:\s*([0-9a-f.:]+)\)/i);
    const ploiIpHint = ipWhitelistMatch(report.ploi?.message || '')?.[1];

    const ploiPermissionError = typeof report.ploi?.message === 'string'
        && /right permissions|permission denied|does not have/i.test(report.ploi.message);

    const isCloudflare525 = typeof report.ssl?.message === 'string'
        && /SSL.*525|cloudflare/i.test(report.ssl.message);

    const retryPloi = () => {
        router.post(route('admin.websites.retry-ploi', website.id), {}, { preserveScroll: true });
    };

    return (
        <AdminLayout title="Website Created">
            <Head title="Website Created" />

            <div className="max-w-3xl mx-auto space-y-6">
                <div className={`rounded-lg p-6 ${allOk ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                    <div className="flex items-start gap-4">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${allOk ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {allOk ? (
                                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            ) : (
                                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M4.93 19h14.14a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.19 16a2 2 0 001.74 3z" /></svg>
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                {allOk ? 'Website created successfully!' : 'Website created — but some steps need attention'}
                            </h2>
                            <p className="text-sm text-gray-700 mt-1">
                                {allOk
                                    ? 'Everything ran cleanly: database, Ploi alias, and SSL.'
                                    : 'The website was saved, but Ploi alias or SSL provisioning didn\'t fully succeed. See details below.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Website summary */}
                <div className="bg-white shadow-sm sm:rounded-lg p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Website details</h3>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <div>
                            <dt className="text-gray-500">Name</dt>
                            <dd className="text-gray-900 font-medium">{website.name}</dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Slug</dt>
                            <dd className="text-gray-900 font-mono">{website.slug}</dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Domain</dt>
                            <dd className="text-gray-900 font-mono">{website.domain || '— (no custom domain)'}</dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Active</dt>
                            <dd>{website.is_active ? 'Yes' : 'No'}</dd>
                        </div>
                        <div className="sm:col-span-2">
                            <dt className="text-gray-500">Created at</dt>
                            <dd className="text-gray-900">{website.created_at}</dd>
                        </div>
                    </dl>
                </div>

                {/* Status report */}
                <div className="bg-white shadow-sm sm:rounded-lg p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">Provisioning status</h3>
                    <p className="text-sm text-gray-500 mb-4">Result of each step we ran while creating this website.</p>

                    <Row
                        icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 7v10c0 2 2 4 8 4s8-2 8-4V7M4 7c0-2 2-4 8-4s8 2 8 4M4 7c0 2 2 4 8 4s8-2 8-4" /></svg>}
                        title="Database record"
                        status={report.db?.ok}
                        message={report.db?.message || '—'}
                    />

                    <Row
                        icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>}
                        title="Ploi domain alias"
                        status={report.ploi?.ok}
                        message={report.ploi?.message || '—'}
                        hint={
                            ploiIpHint ? (
                                <>
                                    <strong>How to fix:</strong> the Ploi token rejects requests from <code className="font-mono bg-gray-100 px-1 rounded">{ploiIpHint}</code>.
                                    Go to <a className="text-indigo-600 underline" target="_blank" rel="noopener" href="https://ploi.io/profile/api-keys">Ploi → Profile → API keys</a>,
                                    edit your token, and add <code className="font-mono bg-gray-100 px-1 rounded">{ploiIpHint}</code> to the "Whitelist IP addresses" field.
                                    Then click "Retry Ploi alias + SSL" below.
                                </>
                            ) : ploiPermissionError ? (
                                <div className="space-y-2">
                                    <div><strong>How to fix:</strong> your Ploi API token doesn't have the scopes needed to add a domain alias. Ploi keeps aliases under a permission group that isn't enabled on this token.</div>
                                    <ol className="list-decimal list-inside space-y-1 ml-1">
                                        <li>Go to <a className="text-indigo-600 underline" target="_blank" rel="noopener" href="https://ploi.io/profile/api-keys">Ploi → Profile → API keys</a>.</li>
                                        <li>Click <strong>Create new API key</strong>.</li>
                                        <li>Set the name (e.g. "Nobu Auto Provisioning") and add your server IP to the whitelist.</li>
                                        <li>Click <strong>Toggle all permissions</strong> at the top of the scopes section — easiest way to ensure aliases-create is included. (You can narrow later if needed.)</li>
                                        <li>Save and copy the token <em>once</em> (it's shown only on creation).</li>
                                        <li>On the production server, paste it into <code className="font-mono bg-gray-100 px-1 rounded">PLOI_API_TOKEN</code> in <code className="font-mono bg-gray-100 px-1 rounded">.env</code>, then run <code className="font-mono bg-gray-100 px-1 rounded">php artisan config:clear</code>.</li>
                                        <li>Come back and click "Retry Ploi alias + SSL".</li>
                                    </ol>
                                </div>
                            ) : null
                        }
                    />

                    <Row
                        icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11c0-1.105.895-2 2-2s2 .895 2 2v2H8v-2c0-1.105.895-2 2-2zM5 13h14v8H5v-8z" /></svg>}
                        title="SSL certificate (Let's Encrypt)"
                        status={report.ssl?.ok}
                        message={report.ssl?.message || '—'}
                        hint={null}
                    />

                    {website.domain && (
                        <div className="mt-4 flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={retryPloi}
                                className="inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
                            >
                                Retry Ploi alias + SSL
                            </button>
                        </div>
                    )}
                </div>

                {/* Cloudflare warning if domain is behind CF */}
                {website.domain && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
                        <div className="flex items-start gap-3">
                            <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <div>
                                <div className="font-semibold mb-1">Cloudflare 525 error? (SSL handshake failed)</div>
                                <p>
                                    If <code className="font-mono">{website.domain}</code> is behind Cloudflare and you see a 525 error,
                                    the Let's Encrypt cert above must finish issuing first (can take 1–2 minutes).
                                    Then on Cloudflare → SSL/TLS → set the encryption mode to <strong>Full</strong> (not "Full strict" until origin cert is verified, and not "Flexible" which would loop redirects).
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap gap-3 justify-between">
                    <Link
                        href={route('admin.websites.index')}
                        className="inline-flex items-center px-4 py-2 rounded-md bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300"
                    >
                        ← Back to websites
                    </Link>
                    <div className="flex gap-3">
                        <Link
                            href={route('admin.websites.edit', website.id)}
                            className="inline-flex items-center px-4 py-2 rounded-md bg-white border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
                        >
                            Edit website
                        </Link>
                        <Link
                            href={route('admin.websites.show', website.id)}
                            className="inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
                        >
                            View website details
                        </Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
