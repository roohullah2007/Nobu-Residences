// Friendly display names for website brand_colors keys.
// Single source of truth shared by the Create wizard and the website
// detail page so admins never see raw snake_case DB field names.
export const BRAND_COLOR_LABELS = {
    primary: { label: 'Primary', desc: 'Main brand color' },
    secondary: { label: 'Secondary', desc: 'Secondary brand color' },
    accent: { label: 'Accent', desc: 'Highlight color' },
    text: { label: 'Text', desc: 'Text color' },
    background: { label: 'Background', desc: 'Page background' },
    button_primary_bg: { label: 'Primary Button', desc: 'Available Building, Sign Up buttons' },
    button_primary_text: { label: 'Primary Button Text', desc: 'Primary button text' },
    button_secondary_bg: { label: 'Secondary Button', desc: 'Contact Agent, Show All Listings' },
    button_secondary_text: { label: 'Secondary Button Text', desc: 'Secondary button text' },
    button_tertiary_bg: { label: 'Tertiary Button', desc: 'Request Tour buttons' },
    button_tertiary_text: { label: 'Tertiary Button Text', desc: 'Tertiary button text' },
    button_quaternary_bg: { label: 'Outline Button', desc: 'White/outline buttons' },
    button_quaternary_text: { label: 'Outline Button Text', desc: 'Outline button text' },
    footer_bg: { label: 'Footer Background', desc: 'Footer section background' },
    footer_text: { label: 'Footer Text', desc: 'Footer text color' },
    link_color: { label: 'Link', desc: 'Link color' },
    link_hover: { label: 'Link Hover', desc: 'Link hover color' },
};

export function brandColorLabel(key) {
    if (BRAND_COLOR_LABELS[key]) return BRAND_COLOR_LABELS[key].label;
    return key
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Checkerboard backing so white/near-white swatches and light logos stay
// visible on white cards.
export const CHECKERBOARD_STYLE = {
    backgroundImage:
        'linear-gradient(45deg, #d1d5db 25%, transparent 25%), ' +
        'linear-gradient(-45deg, #d1d5db 25%, transparent 25%), ' +
        'linear-gradient(45deg, transparent 75%, #d1d5db 75%), ' +
        'linear-gradient(-45deg, transparent 75%, #d1d5db 75%)',
    backgroundSize: '12px 12px',
    backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0',
};
