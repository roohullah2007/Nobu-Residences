<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=work-sans:400,500,600,700&family=space-grotesk:700&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        <script>
            window.googleMapsApiKey = "{{ env('GOOGLE_MAPS_API_KEY') }}";
        </script>
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx","resources/js/Website/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-work-sans antialiased">
        @inertia
    </body>
</html>
