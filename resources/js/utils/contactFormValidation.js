/**
 * Shared inline-validation helpers for the tour / question / contact modals.
 *
 * These forms used to surface both client and server validation through
 * window.alert(). The modals now render a small red message under each
 * invalid field instead; these helpers keep the rules and the Laravel
 * error-bag mapping consistent across every modal.
 */

export const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());

/**
 * Validate the common contact fields. Returns an object keyed by field
 * name ('name' | 'email' | 'phone' | plus any of the optional extras) —
 * empty object means valid.
 */
export function validateContactFields(data, { requireQuestion = false, requireMessage = false } = {}) {
    const errors = {};
    if (!String(data.name || '').trim()) {
        errors.name = 'Full name is required';
    }
    if (!String(data.email || '').trim()) {
        errors.email = 'Email address is required';
    } else if (!isValidEmail(data.email)) {
        errors.email = 'Enter a valid email address';
    }
    if (!String(data.phone || '').trim()) {
        errors.phone = 'Phone number is required';
    }
    if (requireQuestion && !String(data.question || '').trim()) {
        errors.question = 'Please enter your question';
    }
    if (requireMessage && !String(data.message || '').trim()) {
        errors.message = 'Please enter a message';
    }
    return errors;
}

/**
 * Map a Laravel validation error bag ({ field: [messages] }) onto our form
 * field names using keyMap (e.g. { full_name: 'name', email: 'email' }).
 * Returns { fieldErrors, unmapped } — unmapped is a single string of
 * messages that don't belong to a rendered field (shown as a summary line
 * inside the modal, never an alert).
 */
export function mapServerErrors(serverErrors, keyMap) {
    const fieldErrors = {};
    const unmapped = [];
    Object.entries(serverErrors || {}).forEach(([key, messages]) => {
        const message = Array.isArray(messages) ? messages[0] : String(messages);
        const field = keyMap[key];
        if (field) {
            fieldErrors[field] = fieldErrors[field] || message;
        } else {
            unmapped.push(message);
        }
    });
    return { fieldErrors, unmapped: unmapped.join(' ') };
}

/**
 * Focus the first invalid field. idMap translates a field name to the DOM
 * id when they differ (e.g. { name: 'questionName' }).
 */
export function focusFirstError(errors, idMap = {}, order = ['name', 'email', 'phone', 'question', 'message']) {
    const first = order.find((field) => errors[field]);
    if (!first) return;
    const el = document.getElementById(idMap[first] || first);
    if (el && typeof el.focus === 'function') {
        el.focus();
    }
}
