// CSRF headers for raw fetch() calls.
//
// The csrf-token <meta> tag is only rendered on the first full page load;
// after Inertia navigations (login regenerates the session token) it goes
// stale and every fetch() using it gets a 419. The CSRF cookie ("ct" — the
// default XSRF-TOKEN name fingerprints the stack, see
// app/Http/Middleware/ValidateCsrfToken) is re-issued on every response,
// so prefer it and fall back to the meta tag only when it's missing.
export function csrfHeaders() {
    const row = document.cookie
        .split('; ')
        .find((c) => c.startsWith('ct='));

    if (row) {
        return { 'X-XSRF-TOKEN': decodeURIComponent(row.slice('ct='.length)) };
    }

    const meta = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    return meta ? { 'X-CSRF-TOKEN': meta } : {};
}
