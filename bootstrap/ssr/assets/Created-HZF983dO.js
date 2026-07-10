import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Head, Link, router } from "@inertiajs/react";
import { A as AdminLayout } from "./AdminLayout-CaxbTFCB.js";
import { useState, useEffect } from "react";
const AUTO_REFRESH_MS = 15e3;
function CopyButton({ value, label = "Copy" }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      onClick: copy,
      title: `${label}: ${value}`,
      className: "inline-flex items-center justify-center h-6 w-6 rounded-md border border-gray-200 bg-white text-gray-500 hover:text-gray-800 hover:border-gray-300 transition-colors flex-shrink-0",
      children: copied ? /* @__PURE__ */ jsx("svg", { className: "h-3.5 w-3.5 text-green-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2.5", d: "M5 13l4 4L19 7" }) }) : /* @__PURE__ */ jsx("svg", { className: "h-3.5 w-3.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" }) })
    }
  );
}
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
    "Pending"
  ] });
};
const Row = ({ icon, title, status, message }) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4 py-4 border-b border-gray-100 last:border-0", children: [
  /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500", children: icon }),
  /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-900", children: title }),
      /* @__PURE__ */ jsx(Status, { status })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-600 mt-1 break-words whitespace-pre-wrap font-mono", children: message })
  ] })
] });
function WebsiteCreated({ website, report, liveStatus, persisted = {}, cloudflare = {} }) {
  const [autoPoll, setAutoPoll] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isPending = Boolean(website.domain) && persisted?.status !== "active";
  const refreshNow = () => {
    if (refreshing) return;
    setRefreshing(true);
    router.reload({
      preserveScroll: true,
      onFinish: () => setRefreshing(false)
    });
  };
  useEffect(() => {
    if (!autoPoll || !isPending) return;
    const t = setInterval(refreshNow, AUTO_REFRESH_MS);
    return () => clearInterval(t);
  }, [autoPoll, isPending]);
  const [retrying, setRetrying] = useState(false);
  const retryHostname = () => {
    if (retrying) return;
    setRetrying(true);
    router.post(route("admin.websites.retry-hostname", website.id), {}, {
      preserveScroll: true,
      onFinish: () => setRetrying(false)
    });
  };
  const isLive = persisted?.status === "active";
  const allOk = report?.db?.ok && report?.cloudflare?.ok !== false && report?.ssl?.ok !== false;
  const domainStepsSkipped = !website.domain;
  const cnameTarget = cloudflare?.cnameTarget || "";
  return /* @__PURE__ */ jsxs(AdminLayout, { title: "Website Created", children: [
    /* @__PURE__ */ jsx(Head, { title: "Website Created" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto space-y-6", children: [
      /* @__PURE__ */ jsx("div", { className: `rounded-lg p-6 ${allOk ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"}`, children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: `h-12 w-12 rounded-full flex items-center justify-center ${allOk ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`, children: allOk ? /* @__PURE__ */ jsx("svg", { className: "h-7 w-7", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M5 13l4 4L19 7" }) }) : /* @__PURE__ */ jsx("svg", { className: "h-7 w-7", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 9v2m0 4h.01M4.93 19h14.14a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.19 16a2 2 0 001.74 3z" }) }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-gray-900", children: allOk ? "Website created successfully!" : "Website created — but some steps need attention" }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-700 mt-1", children: [
            !allOk && "The website was saved, but the Cloudflare hostname registration did not fully succeed. See details below.",
            allOk && domainStepsSkipped && "Website created — domain steps skipped (no custom domain).",
            allOk && !domainStepsSkipped && (isLive ? `https://${website.domain} is LIVE via Cloudflare.` : "Domain registered on Cloudflare — it goes live automatically once the CNAME record below exists.")
          ] })
        ] })
      ] }) }),
      website.domain && !isLive && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-indigo-100 bg-indigo-50/50 p-5", children: [
        /* @__PURE__ */ jsxs("h3", { className: "text-sm font-semibold text-gray-900", children: [
          "One CNAME record makes ",
          /* @__PURE__ */ jsx("code", { className: "font-mono", children: website.domain }),
          " live"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-xs text-gray-600", children: "Create this record at the domain's DNS provider. Cloudflare validates and activates SSL automatically — no further action needed here." }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-xs border-separate border-spacing-0", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "text-left text-gray-500", children: [
            /* @__PURE__ */ jsx("th", { className: "font-medium pb-1.5 pr-4", children: "Type" }),
            /* @__PURE__ */ jsx("th", { className: "font-medium pb-1.5 pr-4", children: "Host / Name" }),
            /* @__PURE__ */ jsx("th", { className: "font-medium pb-1.5", children: "Value" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "font-mono text-gray-800", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("td", { className: "py-1.5 pr-4 align-top", children: /* @__PURE__ */ jsx("span", { className: "px-1.5 py-0.5 rounded bg-white border border-gray-200", children: "CNAME" }) }),
            /* @__PURE__ */ jsxs("td", { className: "py-1.5 pr-4 align-top", children: [
              website.domain.startsWith("www.") ? "www" : "@",
              " ",
              /* @__PURE__ */ jsxs("span", { className: "font-sans text-gray-400", children: [
                "(",
                website.domain,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("td", { className: "py-1.5", children: [
              /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 break-all", children: [
                cnameTarget,
                /* @__PURE__ */ jsx(CopyButton, { value: cnameTarget, label: "Copy target" })
              ] }),
              /* @__PURE__ */ jsx("span", { className: "block font-sans text-gray-400 mt-0.5", children: "apex domains: use the provider's CNAME flattening / ALIAS record" })
            ] })
          ] }) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white shadow-sm sm:rounded-lg p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-gray-900 mb-1", children: "Provisioning status" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mb-2", children: "Result of each step we ran for this website." }),
        /* @__PURE__ */ jsx(
          Row,
          {
            icon: /* @__PURE__ */ jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", d: "M4 7v10c0 2 1.5 3 4 3h8c2.5 0 4-1 4-3V7M4 7c0-2 1.5-3 4-3h8c2.5 0 4 1 4 3M4 7c0 2 1.5 3 4 3h8c2.5 0 4-1 4-3" }) }),
            title: "Database record",
            status: report?.db?.ok ?? null,
            message: report?.db?.message
          }
        ),
        /* @__PURE__ */ jsx(
          Row,
          {
            icon: /* @__PURE__ */ jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", d: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" }) }),
            title: "Cloudflare custom hostname",
            status: report?.cloudflare?.ok ?? null,
            message: report?.cloudflare?.message
          }
        ),
        /* @__PURE__ */ jsx(
          Row,
          {
            icon: /* @__PURE__ */ jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }) }),
            title: "SSL certificate (Cloudflare edge)",
            status: report?.ssl?.ok ?? null,
            message: report?.ssl?.message
          }
        ),
        website.domain && /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-wrap items-center gap-3", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: retryHostname,
              disabled: retrying,
              className: "inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60",
              children: retrying ? "Re-registering..." : "Retry hostname registration"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: refreshNow,
              disabled: refreshing,
              className: "inline-flex items-center px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60",
              children: refreshing ? "Refreshing..." : "Refresh status"
            }
          ),
          isPending && /* @__PURE__ */ jsxs("label", { className: "inline-flex items-center gap-2 text-xs text-gray-500", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: autoPoll,
                onChange: (e) => setAutoPoll(e.target.checked),
                className: "h-3.5 w-3.5 rounded border-gray-300"
              }
            ),
            "Auto-refresh every 15s until live"
          ] })
        ] })
      ] }),
      website.domain && /* @__PURE__ */ jsxs("div", { className: "bg-white shadow-sm sm:rounded-lg p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-gray-900 mb-1", children: "Live Cloudflare state" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mb-2", children: "Queried from Cloudflare on every load of this page." }),
        /* @__PURE__ */ jsx(
          Row,
          {
            icon: /* @__PURE__ */ jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", d: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" }) }),
            title: "Custom hostname",
            status: liveStatus?.cloudflare?.ok ?? null,
            message: liveStatus?.cloudflare?.message
          }
        ),
        /* @__PURE__ */ jsx(
          Row,
          {
            icon: /* @__PURE__ */ jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" }) }),
            title: "SSL",
            status: liveStatus?.ssl?.ok ?? null,
            message: liveStatus?.ssl?.message
          }
        ),
        persisted?.last_error && /* @__PURE__ */ jsxs("div", { className: "mt-3 text-xs font-mono p-3 bg-red-50 border border-red-200 rounded text-red-800 break-all", children: [
          /* @__PURE__ */ jsx("strong", { children: "Last error:" }),
          " ",
          persisted.last_error
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-3 text-xs text-gray-500", children: [
          "Hostname ID: ",
          /* @__PURE__ */ jsx("span", { className: "font-mono", children: persisted?.hostname_id || "-" }),
          " | ",
          "Status: ",
          /* @__PURE__ */ jsx("span", { className: "font-mono", children: persisted?.status || "-" }),
          " | ",
          "SSL: ",
          /* @__PURE__ */ jsx("span", { className: "font-mono", children: persisted?.ssl_status || "-" }),
          persisted?.active_at && /* @__PURE__ */ jsxs(Fragment, { children: [
            " | ",
            "Live since: ",
            /* @__PURE__ */ jsx("span", { className: "font-mono", children: persisted.active_at })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white shadow-sm sm:rounded-lg p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-gray-900 mb-3", children: "Website" }),
        /* @__PURE__ */ jsxs("dl", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-gray-500", children: "Name" }),
            /* @__PURE__ */ jsx("dd", { className: "text-gray-900", children: website.name })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-gray-500", children: "Slug" }),
            /* @__PURE__ */ jsx("dd", { className: "font-mono text-gray-900", children: website.slug })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-gray-500", children: "Custom domain" }),
            /* @__PURE__ */ jsx("dd", { className: "font-mono text-gray-900", children: website.domain || "-" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-gray-500", children: "Active" }),
            /* @__PURE__ */ jsx("dd", { children: website.is_active ? "Yes" : "No" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
            /* @__PURE__ */ jsx("dt", { className: "text-gray-500", children: "Created at" }),
            /* @__PURE__ */ jsx("dd", { className: "text-gray-900", children: website.created_at })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-5 flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsx(
            Link,
            {
              href: route("admin.websites.edit", website.id),
              className: "inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700",
              children: "Edit website"
            }
          ),
          /* @__PURE__ */ jsx(
            Link,
            {
              href: route("admin.websites.index"),
              className: "inline-flex items-center px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50",
              children: "All websites"
            }
          ),
          /* @__PURE__ */ jsx(
            "a",
            {
              href: `/?website=${website.slug}`,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "inline-flex items-center px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50",
              children: "Preview website"
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
