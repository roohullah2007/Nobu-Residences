// CSRF headers for raw fetch() calls.
//
// The csrf-token <meta> tag is only rendered on the first full page load;
// after Inertia navigations (login regenerates the session token) it goes
// stale and every fetch() using it gets a 419. The XSRF-TOKEN cookie is
// re-issued by Laravel on every response, so prefer it and fall back to
// the meta tag only when the cookie is missing.
export function csrfHeaders() {
    const row = document.cookie
        .split('; ')
        .find((c) => c.startsWith('XSRF-TOKEN='));

    if (row) {
        return { 'X-XSRF-TOKEN': decodeURIComponent(row.slice('XSRF-TOKEN='.length)) };
    }

    const meta = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    return meta ? { 'X-CSRF-TOKEN': meta } : {};
}
