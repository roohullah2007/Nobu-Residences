import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useEffect, useState } from 'react';

const AUTO_REFRESH_MS = 15000;

// Small clipboard button for the CNAME instructions.
function CopyButton({ value, label = 'Copy' }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
        } catch {
            const ta = document.createElement('textarea');
            ta.value = value;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };
    return (
        <button
            type="button"
            onClick={copy}
            title={`${label}: ${value}`}
            className="inline-flex items-center justify-center h-6 w-6 rounded-md border border-gray-200 bg-white text-gray-500 hover:text-gray-800 hover:border-gray-300 transition-colors flex-shrink-0"
        >
            {copied ? (
                <svg className="h-3.5 w-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
            ) : (
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            )}
        </button>
    );
}

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
            Pending
        </span>
    );
};

const Row = ({ icon, title, status, message }) => (
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
        </div>
    </div>
);

export default function WebsiteCreated({ website, report, liveStatus, persisted = {}, cloudflare = {} }) {
    // Auto-refresh while the hostname/SSL or the background AI content
    // generation is still pending so the user sees completion without
    // manually reloading.
    const [autoPoll, setAutoPoll] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [pollCount, setPollCount] = useState(0);
    const aiPending = website.ai_content_status === 'pending';
    const isPending = (Boolean(website.domain) && persisted?.status !== 'active') || aiPending;

    const refreshNow = () => {
        if (refreshing) return;
        setRefreshing(true);
        setPollCount((n) => n + 1);
        router.reload({
            preserveScroll: true,
            onFinish: () => setRefreshing(false),
        });
    };

    useEffect(() => {
        if (!autoPoll || !isPending) return;
        const t = setInterval(refreshNow, AUTO_REFRESH_MS);
        return () => clearInterval(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoPoll, isPending]);

    const [retrying, setRetrying] = useState(false);
    const retryHostname = () => {
        if (retrying) return;
        setRetrying(true);
        router.post(route('admin.websites.retry-hostname', website.id), {}, {
            preserveScroll: true,
            onFinish: () => setRetrying(false),
        });
    };

    const [retryingAi, setRetryingAi] = useState(false);
    const retryAiContent = () => {
        if (retryingAi) return;
        setRetryingAi(true);
        router.post(route('admin.websites.retry-ai-content', website.id), {}, {
            preserveScroll: true,
            onFinish: () => setRetryingAi(false),
        });
    };

    const isLive = persisted?.status === 'active';
    const allOk = report?.db?.ok && report?.cloudflare?.ok !== false && report?.ssl?.ok !== false;
    const domainStepsSkipped = !website.domain;
    const cnameTarget = cloudflare?.cnameTarget || '';

    return (
        <AdminLayout title="Website Created">
            <Head title="Website Created" />

            <div className="max-w-3xl mx-auto space-y-6">
                {/* Headline banner */}
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
                                {!allOk && 'The website was saved, but the Cloudflare hostname registration did not fully succeed. See details below.'}
                                {allOk && domainStepsSkipped && 'Website created — domain steps skipped (no custom domain).'}
                                {allOk && !domainStepsSkipped && (isLive
                                    ? `https://${website.domain} is LIVE via Cloudflare.`
                                    : 'Domain registered on Cloudflare — it goes live automatically once the CNAME record below exists.')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* CNAME instructions — the ONE record the customer must create */}
                {website.domain && !isLive && (
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-5">
                        <h3 className="text-sm font-semibold text-gray-900">
                            One CNAME record makes <code className="font-mono">{website.domain}</code> live
                        </h3>
                        <p className="mt-0.5 text-xs text-gray-600">
                            Create this record at the domain's DNS provider. Cloudflare validates and activates
                            SSL automatically — no further action needed here.
                        </p>
                        <div className="mt-3 overflow-x-auto">
                            <table className="w-full text-xs border-separate border-spacing-0">
                                <thead>
                                    <tr className="text-left text-gray-500">
                                        <th className="font-medium pb-1.5 pr-4">Type</th>
                                        <th className="font-medium pb-1.5 pr-4">Host / Name</th>
                                        <th className="font-medium pb-1.5">Value</th>
                                    </tr>
                                </thead>
                                <tbody className="font-mono text-gray-800">
                                    <tr>
                                        <td className="py-1.5 pr-4 align-top"><span className="px-1.5 py-0.5 rounded bg-white border border-gray-200">CNAME</span></td>
                                        <td className="py-1.5 pr-4 align-top">{website.domain.startsWith('www.') ? 'www' : '@'} <span className="font-sans text-gray-400">({website.domain})</span></td>
                                        <td className="py-1.5">
                                            <span className="inline-flex items-center gap-1.5 break-all">
                                                {cnameTarget}
                                                <CopyButton value={cnameTarget} label="Copy target" />
                                            </span>
                                            <span className="block font-sans text-gray-400 mt-0.5">apex domains: use the provider's CNAME flattening / ALIAS record</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Last action report */}
                <div className="bg-white shadow-sm sm:rounded-lg p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-1">Provisioning status</h3>
                    <p className="text-sm text-gray-500 mb-2">Result of each step we ran for this website.</p>

                    <Row
                        icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 7v10c0 2 1.5 3 4 3h8c2.5 0 4-1 4-3V7M4 7c0-2 1.5-3 4-3h8c2.5 0 4 1 4 3M4 7c0 2 1.5 3 4 3h8c2.5 0 4-1 4-3" /></svg>}
                        title="Database record"
                        status={report?.db?.ok ?? null}
                        message={report?.db?.message}
                    />
                    <Row
                        icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>}
                        title="Cloudflare custom hostname"
                        status={report?.cloudflare?.ok ?? null}
                        message={report?.cloudflare?.message}
                    />
                    <Row
                        icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                        title="SSL certificate (Cloudflare edge)"
                        status={report?.ssl?.ok ?? null}
                        message={report?.ssl?.message}
                    />
                    {liveStatus?.ai && (
                        <Row
                            icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>}
                            title="AI content (SEO + homepage copy)"
                            status={liveStatus.ai.ok}
                            message={liveStatus.ai.message}
                        />
                    )}

                    {aiPending && pollCount >= 4 && (
                        <div className="mt-3 text-xs p-3 bg-amber-50 border border-amber-200 rounded text-amber-800">
                            AI content is still pending — make sure the queue worker is running:
                            {' '}<code className="font-mono">php artisan queue:work</code>.
                            The site is already live with the template content meanwhile.
                        </div>
                    )}

                    {(website.domain || website.ai_content_status === 'failed' || aiPending) && (
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={retryHostname}
                                disabled={retrying}
                                className="inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
                            >
                                {retrying ? 'Re-registering...' : 'Retry hostname registration'}
                            </button>
                            <button
                                type="button"
                                onClick={refreshNow}
                                disabled={refreshing}
                                className="inline-flex items-center px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                            >
                                {refreshing ? 'Refreshing...' : 'Refresh status'}
                            </button>
                            {isPending && (
                                <label className="inline-flex items-center gap-2 text-xs text-gray-500">
                                    <input
                                        type="checkbox"
                                        checked={autoPoll}
                                        onChange={(e) => setAutoPoll(e.target.checked)}
                                        className="h-3.5 w-3.5 rounded border-gray-300"
                                    />
                                    Auto-refresh every 15s until live
                                </label>
                            )}
                        </div>
                    )}
                </div>

                {/* Live Cloudflare state */}
                {website.domain && (
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-base font-semibold text-gray-900 mb-1">Live Cloudflare state</h3>
                        <p className="text-sm text-gray-500 mb-2">Queried from Cloudflare on every load of this page.</p>

                        <Row
                            icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" /></svg>}
                            title="Custom hostname"
                            status={liveStatus?.cloudflare?.ok ?? null}
                            message={liveStatus?.cloudflare?.message}
                        />
                        <Row
                            icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                            title="SSL"
                            status={liveStatus?.ssl?.ok ?? null}
                            message={liveStatus?.ssl?.message}
                        />

                        {persisted?.last_error && (
                            <div className="mt-3 text-xs font-mono p-3 bg-red-50 border border-red-200 rounded text-red-800 break-all">
                                <strong>Last error:</strong> {persisted.last_error}
                            </div>
                        )}

                        <div className="mt-3 text-xs text-gray-500">
                            Hostname ID: <span className="font-mono">{persisted?.hostname_id || '-'}</span>
                            {' | '}Status: <span className="font-mono">{persisted?.status || '-'}</span>
                            {' | '}SSL: <span className="font-mono">{persisted?.ssl_status || '-'}</span>
                            {persisted?.active_at && <>{' | '}Live since: <span className="font-mono">{persisted.active_at}</span></>}
                        </div>
                    </div>
                )}

                {/* Website summary + navigation */}
                <div className="bg-white shadow-sm sm:rounded-lg p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-3">Website</h3>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                            <dt className="text-gray-500">Name</dt>
                            <dd className="text-gray-900">{website.name}</dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Slug</dt>
                            <dd className="font-mono text-gray-900">{website.slug}</dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Custom domain</dt>
                            <dd className="font-mono text-gray-900">{website.domain || '-'}</dd>
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

                    <div className="mt-5 flex flex-wrap gap-3">
                        <Link
                            href={route('admin.websites.edit', website.id)}
                            className="inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
                        >
                            Edit website
                        </Link>
                        <Link
                            href={route('admin.websites.index')}
                            className="inline-flex items-center px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            All websites
                        </Link>
                        <a
                            href={`/?website=${website.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Preview website
                        </a>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
