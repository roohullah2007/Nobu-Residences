// Client-side dominant-color extraction for the Website Create flow.
//
// Given an uploaded logo (a File or a data URL), this draws it to an
// offscreen canvas, buckets the pixels by color, and returns a full
// brand_colors palette using the SAME dotted keys the Edit page + the
// backend expect (e.g. 'brand_colors.primary'). Purely in-browser — no
// dependency, no server round-trip. The result is only a starting point;
// every value stays editable in the color pickers before Create.

// Relative luminance (WCAG) → pick black/white text that stays readable
// on top of a given background color.
function readableTextOn(hex) {
    const { r, g, b } = hexToRgb(hex);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum > 0.6 ? '#000000' : '#FFFFFF';
}

function hexToRgb(hex) {
    const h = hex.replace('#', '');
    return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16),
    };
}

function rgbToHex(r, g, b) {
    const to2 = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
    return `#${to2(r)}${to2(g)}${to2(b)}`.toUpperCase();
}

// Mix a color toward white (amount 0..1) — used for the light accent tint.
function tint(hex, amount) {
    const { r, g, b } = hexToRgb(hex);
    return rgbToHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount);
}

// Mix a color toward black (amount 0..1) — used for hover / footer shades.
function shade(hex, amount) {
    const { r, g, b } = hexToRgb(hex);
    return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}

// Saturation of an RGB triple (0..1). Grays have ~0 saturation; we prefer
// vivid colors as the brand primary over muddy near-grays.
function saturation(r, g, b) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    return max === 0 ? 0 : (max - min) / max;
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        // For remote URLs (building logos), request CORS so the canvas isn't
        // tainted and getImageData() can read pixels. Same-origin URLs are
        // unaffected; data: URLs never need it.
        if (typeof src === 'string' && !src.startsWith('data:')) {
            img.crossOrigin = 'anonymous';
        }
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Returns an object of dotted brand_colors.* keys, or null if extraction
// fails (e.g. an SVG a browser can't rasterize, or a fully transparent img).
export default async function extractLogoColors(fileOrDataUrl) {
    try {
        const src = typeof fileOrDataUrl === 'string'
            ? fileOrDataUrl
            : await fileToDataUrl(fileOrDataUrl);
        const img = await loadImage(src);

        // Downscale — 64px max side is plenty for a dominant-color read and
        // keeps the pixel loop cheap.
        const scale = Math.min(1, 64 / Math.max(img.width || 1, img.height || 1));
        const w = Math.max(1, Math.round((img.width || 64) * scale));
        const h = Math.max(1, Math.round((img.height || 64) * scale));

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return null;
        ctx.drawImage(img, 0, 0, w, h);

        let pixels;
        try {
            pixels = ctx.getImageData(0, 0, w, h).data;
        } catch {
            // Tainted canvas (cross-origin) — can't read pixels.
            return null;
        }

        // Bucket colors, quantizing to 4 bits/channel so near-identical
        // shades merge. Track both a frequency count and the summed raw RGB
        // so we can return the bucket's average (crisper than the quantized
        // center).
        const buckets = new Map();
        for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const a = pixels[i + 3];

            if (a < 125) continue;                       // transparent
            if (r > 244 && g > 244 && b > 244) continue; // white-ish bg
            if (r < 12 && g < 12 && b < 12) continue;    // pure black outlines

            const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
            const bucket = buckets.get(key);
            if (bucket) {
                bucket.count++;
                bucket.r += r; bucket.g += g; bucket.b += b;
            } else {
                buckets.set(key, { count: 1, r, g, b });
            }
        }

        if (buckets.size === 0) return null;

        const colors = Array.from(buckets.values())
            .map((x) => ({
                hex: rgbToHex(x.r / x.count, x.g / x.count, x.b / x.count),
                count: x.count,
                sat: saturation(x.r / x.count, x.g / x.count, x.b / x.count),
            }))
            // Weight vivid colors higher so a logo's accent beats a large
            // muddy-gray field for the "primary" slot.
            .sort((a, b) => (b.count * (0.4 + b.sat)) - (a.count * (0.4 + a.sat)));

        const primary = colors[0].hex;
        // Second color that's visibly different from the primary, else reuse.
        const secondary = colors.find((c) => c.hex !== primary && colorDistance(c.hex, primary) > 60)?.hex
            || shade(primary, 0.25);

        return {
            'brand_colors.primary': primary,
            'brand_colors.accent': tint(primary, 0.9),
            'brand_colors.text': '#000000',
            'brand_colors.background': '#FFFFFF',

            'brand_colors.button_primary_bg': secondary,
            'brand_colors.button_primary_text': readableTextOn(secondary),
            'brand_colors.button_secondary_bg': primary,
            'brand_colors.button_secondary_text': readableTextOn(primary),
            'brand_colors.button_tertiary_bg': shade(primary, 0.75),
            'brand_colors.button_tertiary_text': '#FFFFFF',
            'brand_colors.button_quaternary_bg': '#FFFFFF',
            'brand_colors.button_quaternary_text': primary,

            'brand_colors.footer_bg': shade(primary, 0.78),
            'brand_colors.footer_text': '#FFFFFF',

            'brand_colors.link_color': primary,
            'brand_colors.link_hover': shade(primary, 0.25),
        };
    } catch {
        return null;
    }
}

function colorDistance(a, b) {
    const c1 = hexToRgb(a);
    const c2 = hexToRgb(b);
    return Math.sqrt((c1.r - c2.r) ** 2 + (c1.g - c2.g) ** 2 + (c1.b - c2.b) ** 2);
}
