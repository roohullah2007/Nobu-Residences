import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useEffect, useState } from 'react';

const PersistedRow = ({ title, status, timestamp, timestampLabel, pendingMessage }) => {
    const map = {
        added:        { label: 'Added',     cls: 'bg-green-100 text-green-800',     icon: '✓' },
        issued:       { label: 'Issued',    cls: 'bg-green-100 text-green-800',     icon: '✓' },
        queued:       { label: 'Queued',    cls: 'bg-indigo-100 text-indigo-800',   icon: '⌛' },
        pending:      { label: 'Pending',   cls: 'bg-yellow-100 text-yellow-800',   icon: '◐' },
        failed:       { label: 'Failed',    cls: 'bg-red-100 text-red-800',         icon: '✕' },
        not_required: { label: 'Not needed',cls: 'bg-gray-100 text-gray-700',       icon: '—' },
    };
    const v = map[status] || { label: status || 'Unknown', cls: 'bg-gray-100 text-gray-700', icon: '?' };
    return (
        <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-gray-900">{title}</div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${v.cls}`}>
                    <span>{v.icon}</span> {v.label}
                </span>
            </div>
            {timestamp && (
                <div className="text-xs text-gray-500 mt-1">{timestampLabel}: {timestamp}</div>
            )}
            {(status === 'queued' || status === 'pending') && (
                <div className="text-xs text-gray-500 mt-1">{pendingMessage}</div>
            )}
        </div>
    );
};

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

export default function WebsiteCreated({ website, report, ploi, liveStatus = null, liveAliases = [], liveCertificates = [], persisted = {} }) {
    // Auto-refresh while SSL is still pending so the user sees the queued
    // job's progress without manually reloading.
    const [autoPoll, setAutoPoll] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastRefreshedAt, setLastRefreshedAt] = useState(null);
    const sslPending = persisted?.ssl_status === 'queued' || persisted?.ssl_status === 'pending';

    // Full reload so every prop (incl. report/persisted) is recomputed on the
    // server. Partial reload via `only:` worked at the API level but produced
    // no visible feedback when Ploi state hadn't changed, so users thought the
    // button was broken. Full reload + spinner makes the action obvious.
    const refreshNow = () => {
        if (refreshing) return;
        setRefreshing(true);
        router.reload({
            preserveScroll: true,
            onFinish: () => {
                setRefreshing(false);
                setLastRefreshedAt(new Date());
            },
        });
    };

    useEffect(() => {
        if (!autoPoll || !sslPending) return;
        const t = setInterval(refreshNow, 15000);
        return () => clearInterval(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoPoll, sslPending]);
    const allOk = report.db?.ok && report.ploi?.ok !== false && report.ssl?.ok !== false;

    const ipWhitelistMatch = (msg) =>
        typeof msg === 'string' && msg.match(/IP address.*not allowed.*\(Used:\s*([0-9a-f.:]+)\)/i);
    const ploiIpHint = ipWhitelistMatch(report.ploi?.message || '')?.[1];

    const ploiPermissionError = typeof report.ploi?.message === 'string'
        && /right permissions|permission denied|does not have/i.test(report.ploi.message);

    const isCloudflare525 = typeof report.ssl?.message === 'string'
        && /SSL.*525|cloudflare/i.test(report.ssl.message);

    // Treat the alias as "live on Ploi" if either the DB says so or the live
    // alias list returned by Ploi already contains the website's domain. When
    // it's already there we disable the Retry button to stop the user (and
    // double-clicks) from POSTing a duplicate create.
    const aliasAlreadyAdded = Boolean(
        website.domain && (
            persisted?.alias_status === 'added'
            || (liveAliases || []).some((a) => typeof a === 'string' && a.toLowerCase() === website.domain.toLowerCase())
        )
    );

    // DNS-mismatch detection on the most recent error — covers both the
    // raw Ploi 422 body and our own cleaned message in persisted.last_error.
    const errorText = String(
        (typeof report.ssl?.message === 'string' ? report.ssl.message : '')
        + ' '
        + (persisted?.last_error || '')
    );
    const dnsMismatch = /unable to match one of these domains|should resolve to|point your domain DNS to your server/i.test(errorText);

    const retryAlias = () => {
        router.post(route('admin.websites.retry-alias', website.id), {}, { preserveScroll: true });
    };
    const retrySsl = () => {
        router.post(route('admin.websites.retry-ssl', website.id), {}, { preserveScroll: true });
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

                {/* Persistent provisioning state (from the DB — survives reloads) */}
                {website.domain && (
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-base font-semibold text-gray-900">Provisioning state</h3>
                                <p className="text-sm text-gray-500">Saved per step on this website — independent of last action.</p>
                            </div>
                            {sslPending && (
                                <div className="flex items-center gap-2 text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full">
                                    <svg className="h-3.5 w-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" strokeWidth="3" opacity="0.25" />
                                        <path d="M22 12a10 10 0 00-10-10" strokeWidth="3" strokeLinecap="round" />
                                    </svg>
                                    Auto-refresh every 15s
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <PersistedRow
                                title="Domain alias on Ploi"
                                status={persisted.alias_status}
                                timestamp={persisted.alias_added_at}
                                timestampLabel="Added at"
                                pendingMessage="Waiting for alias add to run…"
                            />
                            <PersistedRow
                                title="SSL certificate"
                                status={persisted.ssl_status}
                                timestamp={persisted.ssl_issued_at}
                                timestampLabel="Issued at"
                                pendingMessage="Queued — will run in ~30s, then retries on failure (30s, 1m, 2m, 5m, 10m)."
                            />
                        </div>
                        {persisted.last_error && (
                            <div className="mt-3 text-xs font-mono p-3 bg-red-50 border border-red-200 rounded text-red-800 break-all">
                                <strong>Last error:</strong> {persisted.last_error}
                            </div>
                        )}
                        <div className="mt-4 flex items-center gap-3">
                            <button
                                type="button"
                                onClick={refreshNow}
                                disabled={refreshing}
                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <svg className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                {refreshing ? 'Refreshing…' : 'Refresh now'}
                            </button>
                            {lastRefreshedAt && (
                                <span className="text-xs text-gray-500">
                                    Last refreshed at {lastRefreshedAt.toLocaleTimeString()}
                                </span>
                            )}
                        </div>
                    </div>
                )}

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
                                    Then click "Retry domain alias" below.
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
                                        <li>Come back and click "Retry domain alias".</li>
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
                        hint={
                            dnsMismatch ? (
                                <div className="space-y-2">
                                    <div>
                                        <strong>How to fix:</strong> Let's Encrypt couldn't reach the origin server because <code className="font-mono bg-gray-100 px-1 rounded">{website.domain}</code> currently points to Cloudflare's proxy IPs, not the server. The certificate can't be issued until DNS resolves directly to the server (or you complete a DNS-01 challenge).
                                    </div>
                                    <ol className="list-decimal list-inside space-y-1 ml-1">
                                        <li>In Cloudflare → DNS, set the A record for <code className="font-mono bg-gray-100 px-1 rounded">{website.domain}</code> (and any <code className="font-mono bg-gray-100 px-1 rounded">www</code> record) to <strong>DNS only</strong> (gray cloud, not the orange proxied cloud).</li>
                                        <li>Wait 1–2 minutes for DNS to propagate.</li>
                                        <li>Click <strong>Retry SSL certificate</strong> below.</li>
                                        <li>Once the cert is issued, you can flip Cloudflare back to <strong>Proxied</strong> (orange cloud) and set SSL/TLS mode to <strong>Full</strong>.</li>
                                    </ol>
                                    <div className="text-xs text-gray-500">
                                        Retries have been stopped for this error — there's no point retrying every minute while DNS still points to Cloudflare. Use the Retry button above after fixing DNS.
                                    </div>
                                </div>
                            ) : null
                        }
                    />

                    {website.domain && (
                        <div className="mt-4 flex flex-wrap gap-3">
                            {aliasAlreadyAdded ? (
                                <span
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-100 text-green-800 text-sm font-medium border border-green-200 cursor-not-allowed"
                                    title="The domain alias is already on Ploi — no need to add it again."
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Domain alias already added
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={retryAlias}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                    Retry domain alias
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={retrySsl}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0-1.105.895-2 2-2s2 .895 2 2v2H8v-2c0-1.105.895-2 2-2zM5 13h14v8H5v-8z" />
                                </svg>
                                Retry SSL certificate
                            </button>
                        </div>
                    )}
                </div>

                {/* Live Ploi state — what's actually configured on the site right now */}
                {ploi.configured && (
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-base font-semibold text-gray-900 mb-2">Current Ploi state</h3>
                        <p className="text-sm text-gray-500 mb-4">Fetched live from Ploi — reflects what is on the site this moment.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border border-gray-200 rounded-lg p-4">
                                <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">Domain aliases on site</div>
                                {liveAliases.length === 0 ? (
                                    <div className="text-sm text-gray-500 italic">No aliases configured.</div>
                                ) : (
                                    <ul className="text-sm space-y-1">
                                        {liveAliases.map((a) => (
                                            <li key={a} className={`font-mono ${website.domain && a === website.domain ? 'text-green-700 font-semibold' : 'text-gray-700'}`}>
                                                {website.domain && a === website.domain ? '✓ ' : '• '}
                                                {a}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="border border-gray-200 rounded-lg p-4">
                                <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">SSL certificates on site</div>
                                {liveCertificates.length === 0 ? (
                                    <div className="text-sm text-gray-500 italic">No certificates issued.</div>
                                ) : (
                                    <ul className="text-sm space-y-2">
                                        {liveCertificates.map((c) => {
                                            const covers = website.domain && (c.domains || []).some((d) => d?.toLowerCase() === website.domain.toLowerCase());
                                            return (
                                                <li key={c.id} className={`${covers ? 'text-green-700' : 'text-gray-700'}`}>
                                                    <div className="font-mono text-xs break-words">
                                                        {covers ? '✓ ' : '• '}
                                                        {(c.domains || []).join(', ')}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {c.type || 'cert'}{c.status ? ` · ${c.status}` : ''}{c.expires_at ? ` · expires ${c.expires_at}` : ''}
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                )}

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
