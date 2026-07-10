import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Head, Link, router } from "@inertiajs/react";
import { A as AdminLayout } from "./AdminLayout-l5p_UGn9.js";
import { useState, useEffect } from "react";
const PersistedRow = ({ title, status, timestamp, timestampLabel, pendingMessage }) => {
  const map = {
    added: { label: "Added", cls: "bg-green-100 text-green-800", icon: "✓" },
    issued: { label: "Issued", cls: "bg-green-100 text-green-800", icon: "✓" },
    queued: { label: "Queued", cls: "bg-indigo-100 text-indigo-800", icon: "⌛" },
    pending: { label: "Pending", cls: "bg-yellow-100 text-yellow-800", icon: "◐" },
    failed: { label: "Failed", cls: "bg-red-100 text-red-800", icon: "✕" },
    not_required: { label: "Not needed", cls: "bg-gray-100 text-gray-700", icon: "—" }
  };
  const v = map[status] || { label: status || "Unknown", cls: "bg-gray-100 text-gray-700", icon: "?" };
  return /* @__PURE__ */ jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-gray-900", children: title }),
      /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${v.cls}`, children: [
        /* @__PURE__ */ jsx("span", { children: v.icon }),
        " ",
        v.label
      ] })
    ] }),
    timestamp && /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 mt-1", children: [
      timestampLabel,
      ": ",
      timestamp
    ] }),
    (status === "queued" || status === "pending") && /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 mt-1", children: pendingMessage })
  ] });
};
const Status = ({ status }) => {
  if (status === true) {
    return /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800", children: [
      /* @__PURE__ */ jsx("svg", { className: "h-3.5 w-3.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2.5", d: "M5 13l4 4L19 7" }) }),
      "Success"
    ] });
  }
  if (status === false) {
    return /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800", children: [
      /* @__PURE__ */ jsx("svg", { className: "h-3.5 w-3.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2.5", d: "M6 18L18 6M6 6l12 12" }) }),
      "Failed"
    ] });
  }
  return /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700", children: [
    /* @__PURE__ */ jsxs("svg", { className: "h-3.5 w-3.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [
      /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 8v4l3 3" }),
      /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10", strokeWidth: "2" })
    ] }),
    "Skipped"
  ] });
};
const Row = ({ icon, title, status, message, hint = null }) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4 py-4 border-b border-gray-100 last:border-0", children: [
  /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500", children: icon }),
  /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-900", children: title }),
      /* @__PURE__ */ jsx(Status, { status })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600 mt-1 break-words whitespace-pre-wrap font-mono", children: message }),
    hint && /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 mt-2", children: hint })
  ] })
] });
function WebsiteCreated({ website, report, ploi, liveStatus = null, liveAliases = [], liveAliasesVerified = true, liveCertificates = [], persisted = {}, dnsCheck = null }) {
  const [autoPoll, setAutoPoll] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);
  const sslPending = persisted?.ssl_status === "queued" || persisted?.ssl_status === "pending";
  const refreshNow = () => {
    if (refreshing) return;
    setRefreshing(true);
    router.reload({
      preserveScroll: true,
      onFinish: () => {
        setRefreshing(false);
        setLastRefreshedAt(/* @__PURE__ */ new Date());
      }
    });
  };
  useEffect(() => {
    if (!autoPoll || !sslPending) return;
    const t = setInterval(refreshNow, 15e3);
    return () => clearInterval(t);
  }, [autoPoll, sslPending]);
  const allOk = report.db?.ok && report.ploi?.ok !== false && report.ssl?.ok !== false;
  const ipWhitelistMatch = (msg) => typeof msg === "string" && msg.match(/IP address.*not allowed.*\(Used:\s*([0-9a-f.:]+)\)/i);
  const ploiIpHint = ipWhitelistMatch(report.ploi?.message || "")?.[1];
  const ploiPermissionError = typeof report.ploi?.message === "string" && /right permissions|permission denied|does not have/i.test(report.ploi.message);
  typeof report.ssl?.message === "string" && /SSL.*525|cloudflare/i.test(report.ssl.message);
  const aliasAlreadyAdded = Boolean(
    website.domain && ((liveAliases || []).some((a) => typeof a === "string" && a.toLowerCase() === website.domain.toLowerCase()) || persisted?.alias_status === "added")
  );
  const duplicateAliases = Object.entries(
    (liveAliases || []).reduce((m, a) => {
      const k = typeof a === "string" ? a.toLowerCase() : "";
      if (k) m[k] = (m[k] || 0) + 1;
      return m;
    }, {})
  ).filter(([, n]) => n > 1);
  const coveredDomains = (liveCertificates || []).flatMap(
    (c) => (c?.domains || []).map((d) => typeof d === "string" ? d.toLowerCase() : "")
  ).filter(Boolean);
  const isCovered = (d) => typeof d === "string" && coveredDomains.includes(d.toLowerCase());
  const certCoversDomain = Boolean(website.domain) && isCovered(website.domain);
  const certWarningVisible = Boolean(website.domain) && aliasAlreadyAdded && !certCoversDomain;
  const uncoveredAliases = (liveAliases || []).filter((a) => !isCovered(a));
  const errorText = String(
    (typeof report.ssl?.message === "string" ? report.ssl.message : "") + " " + (persisted?.last_error || "")
  );
  const dnsMismatch = /unable to match one of these domains|should resolve to|point your domain DNS to your server/i.test(errorText);
  const resolvesToMatch = errorText.match(/resolves to\s*(?:<strong>)?([^<]+?)(?:<\/strong>)?\s+and should resolve to/i);
  const shouldResolveMatch = errorText.match(/should resolve to one of\s*(?:<strong>)?([^<]+?)(?:<\/strong>)/i);
  const dnsResolvesTo = resolvesToMatch ? resolvesToMatch[1].trim() : null;
  const dnsShouldResolveTo = shouldResolveMatch ? shouldResolveMatch[1].trim() : null;
  const expectedIps = (dnsShouldResolveTo || "").split(/[,\s]+/).map((s) => s.trim()).filter(Boolean);
  const badIps = (dnsResolvesTo || "").split(/[,\s]+/).map((s) => s.trim()).filter(Boolean);
  const currentIps = Array.isArray(dnsCheck?.ips) ? dnsCheck.ips : [];
  const stillSeesBadIps = badIps.length > 0 && currentIps.some((ip) => badIps.includes(ip));
  const seesExpectedIp = expectedIps.length > 0 && expectedIps.some((ip) => currentIps.includes(ip));
  const dnsLooksGood = seesExpectedIp && !stillSeesBadIps;
  const [retryingAlias, setRetryingAlias] = useState(false);
  const [retryingSsl, setRetryingSsl] = useState(false);
  const retryAlias = () => {
    if (retryingAlias) return;
    setRetryingAlias(true);
    router.post(route("admin.websites.retry-alias", website.id), {}, {
      preserveScroll: true,
      onFinish: () => setRetryingAlias(false)
    });
  };
  const retrySsl = () => {
    if (retryingSsl) return;
    setRetryingSsl(true);
    router.post(route("admin.websites.retry-ssl", website.id), {}, {
      preserveScroll: true,
      onFinish: () => setRetryingSsl(false)
    });
  };
  return /* @__PURE__ */ jsxs(AdminLayout, { title: "Website Created", children: [
    /* @__PURE__ */ jsx(Head, { title: "Website Created" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto space-y-6", children: [
      /* @__PURE__ */ jsx("div", { className: `rounded-lg p-6 ${allOk ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"}`, children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: `h-12 w-12 rounded-full flex items-center justify-center ${allOk ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`, children: allOk ? /* @__PURE__ */ jsx("svg", { className: "h-7 w-7", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M5 13l4 4L19 7" }) }) : /* @__PURE__ */ jsx("svg", { className: "h-7 w-7", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 9v2m0 4h.01M4.93 19h14.14a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.19 16a2 2 0 001.74 3z" }) }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-gray-900", children: allOk ? "Website created successfully!" : "Website created — but some steps need attention" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-700 mt-1", children: allOk ? "Everything ran cleanly: database, Ploi alias, and SSL." : "The website was saved, but Ploi alias or SSL provisioning didn't fully succeed. See details below." })
        ] })
      ] }) }),
      certWarningVisible && /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-red-200 bg-red-50 p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx("svg", { className: "h-6 w-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 9v2m0 4h.01M4.93 19h14.14a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.19 16a2 2 0 001.74 3z" }) }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-red-900", children: uncoveredAliases.length > 1 ? `${uncoveredAliases.length} domains on this site have no SSL certificate` : /* @__PURE__ */ jsxs(Fragment, { children: [
            "No SSL certificate covers ",
            /* @__PURE__ */ jsx("code", { className: "font-mono", children: website.domain }),
            " yet"
          ] }) }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-red-800 mt-1", children: [
            "These aliases are live on the Ploi site, but no Let's Encrypt cert lists them as a subject. Visitors hitting them will see",
            " ",
            /* @__PURE__ */ jsx("strong", { children: "ERR_CERT_COMMON_NAME_INVALID" }),
            " in their browser:"
          ] }),
          /* @__PURE__ */ jsx("ul", { className: "mt-2 text-sm font-mono text-red-900 list-disc list-inside", children: uncoveredAliases.map((a) => /* @__PURE__ */ jsx("li", { children: a }, a)) }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-red-800 mt-3", children: [
            "Other aliases on this site that ",
            /* @__PURE__ */ jsx("em", { children: "do" }),
            " have a cert (e.g.",
            " ",
            /* @__PURE__ */ jsx("code", { className: "font-mono", children: "nobu.wpbun.xyz" }),
            ") still work fine — only the domains listed above are affected."
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-red-800 mt-2", children: [
            "Fix: scroll to ",
            /* @__PURE__ */ jsx("strong", { children: "Provisioning status" }),
            " → click ",
            /* @__PURE__ */ jsx("strong", { children: "Retry SSL certificate" }),
            ". Once the cert is issued, this banner disappears and the browser warning goes away on a hard reload."
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white shadow-sm sm:rounded-lg p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-gray-900 mb-4", children: "Website details" }),
        /* @__PURE__ */ jsxs("dl", { className: "grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-gray-500", children: "Name" }),
            /* @__PURE__ */ jsx("dd", { className: "text-gray-900 font-medium", children: website.name })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-gray-500", children: "Slug" }),
            /* @__PURE__ */ jsx("dd", { className: "text-gray-900 font-mono", children: website.slug })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-gray-500", children: "Domain" }),
            /* @__PURE__ */ jsx("dd", { className: "text-gray-900 font-mono", children: website.domain || "— (no custom domain)" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-gray-500", children: "Active" }),
            /* @__PURE__ */ jsx("dd", { children: website.is_active ? "Yes" : "No" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
            /* @__PURE__ */ jsx("dt", { className: "text-gray-500", children: "Created at" }),
            /* @__PURE__ */ jsx("dd", { className: "text-gray-900", children: website.created_at })
          ] })
        ] })
      ] }),
      website.domain && /* @__PURE__ */ jsxs("div", { className: "bg-white shadow-sm sm:rounded-lg p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-gray-900", children: "Provisioning state" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Saved per step on this website — independent of last action." })
          ] }),
          sslPending && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full", children: [
            /* @__PURE__ */ jsxs("svg", { className: "h-3.5 w-3.5 animate-spin", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [
              /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10", strokeWidth: "3", opacity: "0.25" }),
              /* @__PURE__ */ jsx("path", { d: "M22 12a10 10 0 00-10-10", strokeWidth: "3", strokeLinecap: "round" })
            ] }),
            "Auto-refresh every 15s"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsx(
            PersistedRow,
            {
              title: "Domain alias on Ploi",
              status: persisted.alias_status,
              timestamp: persisted.alias_added_at,
              timestampLabel: "Added at",
              pendingMessage: 'Not on the Ploi site yet — the alias add runs immediately (no background queue). Click "Retry domain alias" below.'
            }
          ),
          /* @__PURE__ */ jsx(
            PersistedRow,
            {
              title: "SSL certificate",
              status: persisted.ssl_status,
              timestamp: persisted.ssl_issued_at,
              timestampLabel: "Issued at",
              pendingMessage: 'Queued — will run in ~30s, then retries on failure (30s, 1m, 2m, 5m, 10m). Stuck on Queued? The queue worker may not be running on the server — "Retry SSL certificate" below runs immediately without the queue.'
            }
          )
        ] }),
        persisted.last_error && /* @__PURE__ */ jsxs("div", { className: "mt-3 text-xs font-mono p-3 bg-red-50 border border-red-200 rounded text-red-800 break-all", children: [
          /* @__PURE__ */ jsx("strong", { children: "Last error:" }),
          " ",
          persisted.last_error,
          dnsMismatch && dnsLooksGood && /* @__PURE__ */ jsxs("div", { className: "mt-2 text-xs font-sans text-green-800 bg-green-50 border border-green-200 rounded p-2", children: [
            /* @__PURE__ */ jsx("strong", { children: "This error is stale." }),
            " Your DNS now resolves to the correct IP. Click ",
            /* @__PURE__ */ jsx("strong", { children: "Retry SSL certificate" }),
            " below to re-issue."
          ] })
        ] }),
        dnsCheck && /* @__PURE__ */ jsx("div", { className: `mt-3 text-xs p-3 rounded border ${dnsCheck.error ? "bg-amber-50 border-amber-200 text-amber-900" : dnsMismatch ? dnsLooksGood ? "bg-green-50 border-green-200 text-green-900" : "bg-red-50 border-red-200 text-red-900" : "bg-gray-50 border-gray-200 text-gray-700"}`, children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ jsx("svg", { className: "h-4 w-4 flex-shrink-0 mt-0.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("div", { className: "font-semibold", children: "Live DNS check (from this server)" }),
            dnsCheck.error ? /* @__PURE__ */ jsx("div", { className: "mt-1 font-mono break-all", children: dnsCheck.error }) : /* @__PURE__ */ jsxs("div", { className: "mt-1", children: [
              /* @__PURE__ */ jsx("code", { className: "font-mono", children: dnsCheck.domain }),
              " currently resolves to:",
              " ",
              (dnsCheck.ips || []).map((ip, i) => /* @__PURE__ */ jsx("code", { className: `font-mono px-1 rounded bg-white border ${expectedIps.includes(ip) ? "border-green-300 text-green-800" : badIps.includes(ip) ? "border-red-300 text-red-800" : "border-gray-300 text-gray-800"} ${i > 0 ? "ml-1" : ""}`, children: ip }, ip)),
              dnsMismatch && expectedIps.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-1 text-gray-600", children: [
                "Expected: ",
                /* @__PURE__ */ jsx("code", { className: "font-mono px-1 rounded bg-white border border-green-300 text-green-800", children: expectedIps.join(", ") }),
                dnsLooksGood ? " — match ✓" : " — does not match yet"
              ] }),
              dnsCheck.cloudflare && /* @__PURE__ */ jsxs("div", { className: "mt-2 p-2 rounded border border-orange-300 bg-orange-50 text-orange-900", children: [
                /* @__PURE__ */ jsx("strong", { children: "This domain is behind Cloudflare's proxy (orange cloud)." }),
                " ",
                "Let's Encrypt can't validate it. In Cloudflare DNS, set the A record for the apex and",
                " ",
                /* @__PURE__ */ jsx("code", { className: "font-mono", children: "www" }),
                " to",
                " ",
                /* @__PURE__ */ jsx("code", { className: "font-mono px-1 rounded bg-white border border-orange-300", children: dnsCheck.server_ip || dnsShouldResolveTo || "157.180.26.95" }),
                " ",
                "and switch Proxy status to ",
                /* @__PURE__ */ jsx("strong", { children: "DNS only" }),
                " (gray cloud), wait 1–2 min, then click",
                " ",
                /* @__PURE__ */ jsx("strong", { children: "Retry SSL certificate" }),
                ". After the cert issues you can re-enable the proxy with SSL/TLS mode ",
                /* @__PURE__ */ jsx("strong", { children: "Full (strict)" }),
                "."
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mt-1 text-gray-500", children: [
                "Checked at ",
                dnsCheck.checked_at,
                ". Click ",
                /* @__PURE__ */ jsx("strong", { children: "Refresh now" }),
                " to re-query."
              ] })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: refreshNow,
              disabled: refreshing,
              className: "inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed",
              children: [
                /* @__PURE__ */ jsx("svg", { className: `h-3.5 w-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" }) }),
                refreshing ? "Refreshing…" : "Refresh now"
              ]
            }
          ),
          lastRefreshedAt && /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-500", children: [
            "Last refreshed at ",
            lastRefreshedAt.toLocaleTimeString()
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white shadow-sm sm:rounded-lg p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-gray-900 mb-2", children: "Provisioning status" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mb-4", children: "Result of each step we ran while creating this website." }),
        /* @__PURE__ */ jsx(
          Row,
          {
            icon: /* @__PURE__ */ jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", d: "M4 7v10c0 2 2 4 8 4s8-2 8-4V7M4 7c0-2 2-4 8-4s8 2 8 4M4 7c0 2 2 4 8 4s8-2 8-4" }) }),
            title: "Database record",
            status: report.db?.ok,
            message: report.db?.message || "—"
          }
        ),
        /* @__PURE__ */ jsx(
          Row,
          {
            icon: /* @__PURE__ */ jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", d: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" }) }),
            title: "Ploi domain alias",
            status: report.ploi?.ok,
            message: report.ploi?.message || "—",
            hint: ploiIpHint ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("strong", { children: "How to fix:" }),
              " the Ploi token rejects requests from ",
              /* @__PURE__ */ jsx("code", { className: "font-mono bg-gray-100 px-1 rounded", children: ploiIpHint }),
              ". Go to ",
              /* @__PURE__ */ jsx("a", { className: "text-indigo-600 underline", target: "_blank", rel: "noopener", href: "https://ploi.io/profile/api-keys", children: "Ploi → Profile → API keys" }),
              ", edit your token, and add ",
              /* @__PURE__ */ jsx("code", { className: "font-mono bg-gray-100 px-1 rounded", children: ploiIpHint }),
              ' to the "Whitelist IP addresses" field. Then click "Retry domain alias" below.'
            ] }) : ploiPermissionError ? /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("strong", { children: "How to fix:" }),
                " your Ploi API token doesn't have the scopes needed to add a domain alias. Ploi keeps aliases under a permission group that isn't enabled on this token."
              ] }),
              /* @__PURE__ */ jsxs("ol", { className: "list-decimal list-inside space-y-1 ml-1", children: [
                /* @__PURE__ */ jsxs("li", { children: [
                  "Go to ",
                  /* @__PURE__ */ jsx("a", { className: "text-indigo-600 underline", target: "_blank", rel: "noopener", href: "https://ploi.io/profile/api-keys", children: "Ploi → Profile → API keys" }),
                  "."
                ] }),
                /* @__PURE__ */ jsxs("li", { children: [
                  "Click ",
                  /* @__PURE__ */ jsx("strong", { children: "Create new API key" }),
                  "."
                ] }),
                /* @__PURE__ */ jsx("li", { children: 'Set the name (e.g. "Nobu Auto Provisioning") and add your server IP to the whitelist.' }),
                /* @__PURE__ */ jsxs("li", { children: [
                  "Click ",
                  /* @__PURE__ */ jsx("strong", { children: "Toggle all permissions" }),
                  " at the top of the scopes section — easiest way to ensure aliases-create is included. (You can narrow later if needed.)"
                ] }),
                /* @__PURE__ */ jsxs("li", { children: [
                  "Save and copy the token ",
                  /* @__PURE__ */ jsx("em", { children: "once" }),
                  " (it's shown only on creation)."
                ] }),
                /* @__PURE__ */ jsxs("li", { children: [
                  "On the production server, paste it into ",
                  /* @__PURE__ */ jsx("code", { className: "font-mono bg-gray-100 px-1 rounded", children: "PLOI_API_TOKEN" }),
                  " in ",
                  /* @__PURE__ */ jsx("code", { className: "font-mono bg-gray-100 px-1 rounded", children: ".env" }),
                  ", then run ",
                  /* @__PURE__ */ jsx("code", { className: "font-mono bg-gray-100 px-1 rounded", children: "php artisan config:clear" }),
                  "."
                ] }),
                /* @__PURE__ */ jsx("li", { children: 'Come back and click "Retry domain alias".' })
              ] })
            ] }) : null
          }
        ),
        /* @__PURE__ */ jsx(
          Row,
          {
            icon: /* @__PURE__ */ jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", d: "M12 11c0-1.105.895-2 2-2s2 .895 2 2v2H8v-2c0-1.105.895-2 2-2zM5 13h14v8H5v-8z" }) }),
            title: "SSL certificate (Let's Encrypt)",
            status: report.ssl?.ok,
            message: report.ssl?.message || "—",
            hint: dnsMismatch ? /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("strong", { children: "How to fix:" }),
                " Let's Encrypt couldn't reach the origin server because ",
                /* @__PURE__ */ jsx("code", { className: "font-mono bg-gray-100 px-1 rounded", children: website.domain }),
                " resolves to the wrong IP."
              ] }),
              (dnsResolvesTo || dnsShouldResolveTo) && /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-md bg-amber-50 border border-amber-200 text-xs", children: [
                dnsResolvesTo && /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Currently resolves to:" }),
                  " ",
                  /* @__PURE__ */ jsx("code", { className: "font-mono text-red-700 bg-white px-1 rounded border border-red-200", children: dnsResolvesTo })
                ] }),
                dnsShouldResolveTo && /* @__PURE__ */ jsxs("div", { className: "mt-1", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Must resolve to:" }),
                  " ",
                  /* @__PURE__ */ jsx("code", { className: "font-mono text-green-700 bg-white px-1 rounded border border-green-200", children: dnsShouldResolveTo })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("ol", { className: "list-decimal list-inside space-y-1 ml-1", children: [
                /* @__PURE__ */ jsxs("li", { children: [
                  "Open your DNS provider (Cloudflare, etc.) and find the A record for ",
                  /* @__PURE__ */ jsx("code", { className: "font-mono bg-gray-100 px-1 rounded", children: website.domain }),
                  "."
                ] }),
                /* @__PURE__ */ jsxs("li", { children: [
                  "Change its ",
                  /* @__PURE__ */ jsx("strong", { children: "Content / IP address" }),
                  " to",
                  " ",
                  /* @__PURE__ */ jsx("code", { className: "font-mono bg-gray-100 px-1 rounded", children: dnsShouldResolveTo || "157.180.26.95" }),
                  ". If there are multiple A records for the same name, delete the extras — you only need one."
                ] }),
                /* @__PURE__ */ jsxs("li", { children: [
                  "Do the same for any ",
                  /* @__PURE__ */ jsx("code", { className: "font-mono bg-gray-100 px-1 rounded", children: "www" }),
                  " record (point it at the same IP, or use a CNAME to the apex)."
                ] }),
                /* @__PURE__ */ jsxs("li", { children: [
                  "If you're using Cloudflare, set the proxy status to ",
                  /* @__PURE__ */ jsx("strong", { children: "DNS only" }),
                  " (gray cloud) until the cert is issued."
                ] }),
                /* @__PURE__ */ jsxs("li", { children: [
                  "Wait 1–2 minutes for DNS to propagate, then click ",
                  /* @__PURE__ */ jsx("strong", { children: "Retry SSL certificate" }),
                  " above."
                ] }),
                /* @__PURE__ */ jsxs("li", { children: [
                  "Once the cert is issued, you can flip Cloudflare back to ",
                  /* @__PURE__ */ jsx("strong", { children: "Proxied" }),
                  " (orange cloud) and set SSL/TLS mode to ",
                  /* @__PURE__ */ jsx("strong", { children: "Full" }),
                  "."
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500", children: `Tip: "DNS only" alone doesn't fix this — the A record's IP value must actually point to the server. Cloudflare's proxy flag only controls whether traffic is routed through Cloudflare; it doesn't change where the record points.` })
            ] }) : null
          }
        ),
        website.domain && /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-wrap gap-3", children: [
          aliasAlreadyAdded ? /* @__PURE__ */ jsxs(
            "span",
            {
              className: "inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-100 text-green-800 text-sm font-medium border border-green-200 cursor-not-allowed",
              title: "The domain alias is already on Ploi — no need to add it again.",
              children: [
                /* @__PURE__ */ jsx("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2.5", d: "M5 13l4 4L19 7" }) }),
                "Domain alias already added"
              ]
            }
          ) : /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: retryAlias,
              disabled: retryingAlias,
              className: "inline-flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed",
              children: [
                /* @__PURE__ */ jsx("svg", { className: `h-4 w-4 ${retryingAlias ? "animate-spin" : ""}`, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" }) }),
                retryingAlias ? "Retrying…" : "Retry domain alias"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: retrySsl,
              disabled: retryingSsl,
              className: "inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed",
              children: [
                /* @__PURE__ */ jsx("svg", { className: `h-4 w-4 ${retryingSsl ? "animate-spin" : ""}`, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 11c0-1.105.895-2 2-2s2 .895 2 2v2H8v-2c0-1.105.895-2 2-2zM5 13h14v8H5v-8z" }) }),
                retryingSsl ? "Requesting SSL…" : "Retry SSL certificate"
              ]
            }
          )
        ] })
      ] }),
      ploi.configured && /* @__PURE__ */ jsxs("div", { className: "bg-white shadow-sm sm:rounded-lg p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-gray-900 mb-2", children: "Current Ploi state" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mb-4", children: "Fetched live from Ploi — reflects what is on the site this moment." }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2", children: "Aliases & SSL coverage" }),
            liveAliases.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500 italic", children: liveAliasesVerified ? "No aliases configured." : "Couldn't fetch the alias list from Ploi right now — this does not mean the aliases are missing." }) : /* @__PURE__ */ jsx("ul", { className: "text-sm space-y-1.5", children: liveAliases.map((a, i) => {
              const covered = isCovered(a);
              const isPrimary = website.domain && a.toLowerCase() === website.domain.toLowerCase();
              return /* @__PURE__ */ jsxs("li", { className: "flex items-center justify-between gap-3", children: [
                /* @__PURE__ */ jsx("span", { className: `font-mono break-all ${isPrimary ? "font-semibold text-gray-900" : "text-gray-700"}`, children: a }),
                covered ? /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 whitespace-nowrap", children: [
                  /* @__PURE__ */ jsx("svg", { className: "h-3 w-3", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "3", d: "M5 13l4 4L19 7" }) }),
                  "Cert"
                ] }) : /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 whitespace-nowrap", children: [
                  /* @__PURE__ */ jsx("svg", { className: "h-3 w-3", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "3", d: "M6 18L18 6M6 6l12 12" }) }),
                  "No cert"
                ] })
              ] }, `${a}-${i}`);
            }) }),
            duplicateAliases.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-3 text-xs p-2 rounded border border-amber-200 bg-amber-50 text-amber-900", children: [
              /* @__PURE__ */ jsx("strong", { children: "Duplicate alias rows on Ploi:" }),
              " ",
              duplicateAliases.map(([d, n]) => `${d} (×${n})`).join(", "),
              ".",
              " ",
              "Harmless for serving traffic, but you can delete the extra row in Ploi → Site → Aliases. Nothing is deleted automatically from here."
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2", children: "SSL certificates on site" }),
            liveCertificates.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500 italic", children: "No certificates issued." }) : /* @__PURE__ */ jsx("ul", { className: "text-sm space-y-2", children: liveCertificates.map((c) => {
              const covers = website.domain && (c.domains || []).some((d) => d?.toLowerCase() === website.domain.toLowerCase());
              return /* @__PURE__ */ jsxs("li", { className: `${covers ? "text-green-700" : "text-gray-700"}`, children: [
                /* @__PURE__ */ jsxs("div", { className: "font-mono text-xs break-words", children: [
                  covers ? "✓ " : "• ",
                  (c.domains || []).join(", ")
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500", children: [
                  c.type || "cert",
                  c.status ? ` · ${c.status}` : "",
                  c.expires_at ? ` · expires ${c.expires_at}` : ""
                ] })
              ] }, c.id);
            }) })
          ] })
        ] })
      ] }),
      website.domain && /* @__PURE__ */ jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsx("svg", { className: "h-5 w-5 flex-shrink-0 mt-0.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "font-semibold mb-1", children: "Cloudflare 525 error? (SSL handshake failed)" }),
          /* @__PURE__ */ jsxs("p", { children: [
            "If ",
            /* @__PURE__ */ jsx("code", { className: "font-mono", children: website.domain }),
            " is behind Cloudflare and you see a 525 error, the Let's Encrypt cert above must finish issuing first (can take 1–2 minutes). Then on Cloudflare → SSL/TLS → set the encryption mode to ",
            /* @__PURE__ */ jsx("strong", { children: "Full" }),
            ' (not "Full strict" until origin cert is verified, and not "Flexible" which would loop redirects).'
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3 justify-between", children: [
        /* @__PURE__ */ jsx(
          Link,
          {
            href: route("admin.websites.index"),
            className: "inline-flex items-center px-4 py-2 rounded-md bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300",
            children: "← Back to websites"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsx(
            Link,
            {
              href: route("admin.websites.edit", website.id),
              className: "inline-flex items-center px-4 py-2 rounded-md bg-white border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50",
              children: "Edit website"
            }
          ),
          /* @__PURE__ */ jsx(
            Link,
            {
              href: route("admin.websites.show", website.id),
              className: "inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700",
              children: "View website details"
            }
          )
        ] })
      ] })
    ] })
  ] });
}
export {
  WebsiteCreated as default
};
