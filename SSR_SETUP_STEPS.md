# Complete SSR Setup Steps

## Step 1: Build Assets (REQUIRED)
```bash
npm run build
```
This will:
- ✅ Include Privacy.jsx and Terms.jsx in the build
- ✅ Update `/bootstrap/ssr/ssr.js` with new pages  
- ✅ Create client-side assets in `/public/build/`

## Step 2: Enable SSR in Environment
Add to `.env` file:
```env
INERTIA_SSR_ENABLED=true
```

## Step 3: Start Servers
**Option A - Two Terminals:**
```bash
# Terminal 1: Laravel server
php artisan serve

# Terminal 2: SSR server  
npm run ssr:serve
```

**Option B - Laravel Command (if available):**
```bash
php artisan inertia:start-ssr
```

## Verify SSR is Working:
Visit http://127.0.0.1:8000/privacy and check page source.

**With SSR:** You'll see full HTML content
**Without SSR:** You'll see `<div id="app" data-page="...JSON..."></div>`

## Current Status:
❌ **Must run `npm run build` first**
❌ **Must add INERTIA_SSR_ENABLED=true**  
❌ **Must start SSR server**

Without these steps, pages will have poor SEO performance.
