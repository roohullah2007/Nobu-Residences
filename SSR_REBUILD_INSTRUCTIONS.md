# SSR Rebuild Required

The Privacy and Terms pages have been created and all missing components have been restored.

## To Fix SSR Issues:

1. **Run the build command:**
   ```bash
   npm run build
   ```

   This command runs both:
   - `vite build` (for client-side assets)  
   - `vite build --ssr` (for server-side rendering)

2. **Alternatively, run them separately:**
   ```bash
   npm run dev
   # In a separate terminal:
   npm run ssr:serve
   ```

## What This Fixes:

- Privacy page: `/privacy` will render server-side
- Terms page: `/terms` will render server-side  
- Both pages will be included in `bootstrap/ssr/ssr-manifest.json`
- Missing Breeze components restored for auth pages

## Current Status:

✅ Privacy.jsx page created
✅ Terms.jsx page created  
✅ PolicyContent.jsx component created
✅ TermsContent.jsx component created
✅ Missing Breeze components restored
✅ Vite path alias configuration added
⚠️  SSR build needs to be regenerated

## Components Restored:

- InputError.jsx
- InputLabel.jsx  
- PrimaryButton.jsx
- TextInput.jsx
- Checkbox.jsx
- DangerButton.jsx
- SecondaryButton.jsx
- Modal.jsx
- Dropdown.jsx
- NavLink.jsx
- ResponsiveNavLink.jsx

After running `npm run build`, both new pages and all auth pages should work properly with SSR.
