<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        @php
            // Per-website SEO, resolved by domain in HandleInertiaRequests and shared as `globalWebsite`.
            // Rendered here server-side so search engines / social crawlers (which don't run JS) get the
            // correct title, description and Open Graph tags for each domain.
            // A controller can override per page by passing an `seo` prop:
            //   ['title' => ..., 'description' => ..., 'image' => ..., 'jsonLd' => [...]]
            $seo = $page['props']['globalWebsite'] ?? null;
            $pageSeo = $page['props']['seo'] ?? [];
            $seoTitle = $pageSeo['title']
                ?? (!empty($seo['meta_title'])
                    ? $seo['meta_title']
                    : ($seo['name'] ?? config('app.name', 'Laravel')));
            $seoDescription = $pageSeo['description'] ?? $seo['meta_description'] ?? ($seo['description'] ?? null);
            $seoKeywords = $seo['meta_keywords'] ?? null;
            $seoImage = $pageSeo['image'] ?? $seo['logo_url'] ?? null;
            $seoFavicon = $seo['favicon_url'] ?? '/favicon.ico';
            $seoSiteName = $seo['name'] ?? config('app.name', 'Laravel');
            $seoUrl = url()->current();
            // jsonLd may be one schema object or a list of them.
            $seoJsonLd = $pageSeo['jsonLd'] ?? null;
            if ($seoJsonLd && !array_is_list($seoJsonLd)) {
                $seoJsonLd = [$seoJsonLd];
            }
        @endphp

        <title inertia>{{ $seoTitle }}</title>
        @if($seoDescription)
        <meta name="description" content="{{ $seoDescription }}">
        @endif
        @if($seoKeywords)
        <meta name="keywords" content="{{ $seoKeywords }}">
        @endif
        <link rel="canonical" href="{{ $seoUrl }}">
        <link rel="icon" href="{{ $seoFavicon }}">

        <!-- Open Graph -->
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="{{ $seoSiteName }}">
        <meta property="og:title" content="{{ $seoTitle }}">
        @if($seoDescription)
        <meta property="og:description" content="{{ $seoDescription }}">
        @endif
        <meta property="og:url" content="{{ $seoUrl }}">
        @if($seoImage)
        <meta property="og:image" content="{{ $seoImage }}">
        @endif

        <!-- Twitter -->
        <meta name="twitter:card" content="{{ $seoImage ? 'summary_large_image' : 'summary' }}">
        <meta name="twitter:title" content="{{ $seoTitle }}">
        @if($seoDescription)
        <meta name="twitter:description" content="{{ $seoDescription }}">
        @endif
        @if($seoImage)
        <meta name="twitter:image" content="{{ $seoImage }}">
        @endif

        {{-- Structured data (per-page, from the `seo.jsonLd` prop) --}}
        @if(!empty($seoJsonLd))
        @foreach($seoJsonLd as $schema)
        <script type="application/ld+json">{!! json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}</script>
        @endforeach
        @endif

        {{-- Third-party tracking (admin-managed, rendered raw intentionally; public pages only) --}}
        @if(!request()->is('admin*') && !empty($page['props']['globalWebsite']['tracking_scripts']))
        {!! $page['props']['globalWebsite']['tracking_scripts'] !!}
        @auth
        <script>
            // Identify the logged-in user to the Follow Up Boss widget tracker
            // when its snippet is present; inert otherwise.
            window.addEventListener('load', function () {
                if (typeof widgetTracker === 'function') {
                    widgetTracker('set', { email: @js(auth()->user()->email) });
                }
            });
        </script>
        @endauth
        @endif

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=work-sans:400,500,600,700&family=space-grotesk:700&family=playfair-display:400,500,600,700&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        <script>
            window.googleMapsApiKey = "{{ $googleMapsApiKey ?? '' }}";
        </script>
        @if($googleMapsApiKey ?? false)
        <script async defer src="https://maps.googleapis.com/maps/api/js?key={{ $googleMapsApiKey }}&libraries=places,drawing&loading=async"></script>
        @endif
        @routes
        @viteReactRefresh
        {{-- Component names starting with "Website/" live under resources/js
             (e.g. resources/js/Website/Pages/UserFavourites.jsx), matching the
             resolver in app.jsx/ssr.jsx. Blindly prepending resources/js/Pages/
             produced resources/js/Pages/Website/... — a path that isn't in the
             Vite manifest, which 500s in production (ViteException). --}}
        @vite(['resources/js/app.jsx', str_starts_with($page['component'], 'Website/') ? "resources/js/{$page['component']}.jsx" : "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-work-sans antialiased">
        @inertia
    </body>
</html>
