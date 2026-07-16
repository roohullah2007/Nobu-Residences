import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// The CSRF cookie is renamed server-side (app/Http/Middleware/ValidateCsrfToken)
// so responses don't carry Laravel's default XSRF-TOKEN fingerprint. Point
// axios (Inertia shares this module instance) at the new name; the request
// header stays X-XSRF-TOKEN, which the backend still reads.
window.axios.defaults.xsrfCookieName = 'ct';
