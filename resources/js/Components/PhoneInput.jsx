import { forwardRef } from 'react';

/**
 * Format an arbitrary phone string into "(XXX) XXX-XXXX". Strips every
 * non-digit, keeps an optional leading "1" or "+1", and only formats what
 * the user has typed so far (so it doesn't insert characters before they
 * actually type them).
 *
 * Examples:
 *   "4379981795"     -> "(437) 998-1795"
 *   "14379981795"    -> "+1 (437) 998-1795"
 *   "+1 437 998 17"  -> "+1 (437) 998-17"
 *   "437998"         -> "(437) 998"
 *   "4"              -> "(4"
 */
export function formatPhone(value) {
    if (value == null) return '';
    const digits = String(value).replace(/\D/g, '');
    if (digits.length === 0) return '';

    // North-American "1" country code only — if a longer or different country
    // code is typed we still let it through but don't try to re-format it.
    let countryCode = '';
    let local = digits;
    if (digits.length === 11 && digits.startsWith('1')) {
        countryCode = '+1 ';
        local = digits.slice(1);
    } else if (digits.length > 11) {
        // Out of NANP scope. Best-effort: keep raw with a leading +.
        return '+' + digits;
    }

    if (local.length <= 3) return `${countryCode}(${local}`;
    if (local.length <= 6) return `${countryCode}(${local.slice(0, 3)}) ${local.slice(3)}`;
    return `${countryCode}(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6, 10)}`;
}

/**
 * Controlled input that auto-formats a phone number as the user types and
 * passes the formatted value back via onChange. Drop-in replacement for a
 * plain <input type="tel">.
 */
const PhoneInput = forwardRef(function PhoneInput(
    { value = '', onChange, className = '', placeholder = '(437) 998-1795', ...rest },
    ref,
) {
    const handleChange = (e) => {
        const formatted = formatPhone(e.target.value);
        // Emit a synthetic event with the formatted value so parent state
        // owners can keep treating us like a normal input.
        const synthetic = {
            ...e,
            target: { ...e.target, value: formatted, name: e.target.name },
        };
        onChange?.(synthetic);
    };

    return (
        <input
            type="tel"
            ref={ref}
            value={formatPhone(value)}
            onChange={handleChange}
            placeholder={placeholder}
            className={className}
            inputMode="tel"
            autoComplete="tel"
            {...rest}
        />
    );
});

export default PhoneInput;
