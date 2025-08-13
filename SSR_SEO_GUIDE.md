# SSR Setup for SEO

## Current Problem:
- Pages render as empty `<div id="app" data-page="...">` 
- Content loads via JavaScript on client-side
- **Poor SEO** - search engines see empty page initially

## Enable True SSR:

1. **Add SSR environment variable:**
   ```env
   # Add to .env file
   INERTIA_SSR_ENABLED=true
   ```

2. **Start SSR server:**
   ```bash
   # Terminal 1: Start Laravel
   php artisan serve
   
   # Terminal 2: Build and start SSR
   npm run build
   npm run ssr:serve
   ```

3. **Alternative: Use Laravel SSR command:**
   ```bash
   php artisan inertia:start-ssr
   ```

## Verify SSR is Working:

Visit pages and check view-source - you should see:
```html
<div id="app">
  <main>
    <h1>Privacy Policy - Nobu Residences</h1>
    <section>
      <h2>Introduction</h2>
      <p>This Privacy Policy describes how we collect...</p>
    </section>
    <!-- Full rendered HTML content -->
  </main>
</div>
```

Instead of:
```html
<div id="app" data-page="{...JSON...}"></div>
```

## Current Status:
❌ SSR disabled - poor SEO performance
✅ All components and pages created
✅ SSR infrastructure ready

**Next:** Enable INERTIA_SSR_ENABLED=true and restart servers for proper SEO.
