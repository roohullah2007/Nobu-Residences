<!DOCTYPE html>
{{-- Neutral error page: no framework look, no stack/owner hints. --}}
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex">
    <title>@yield('code') | @yield('message')</title>
    <style>
        body { margin: 0; font-family: Arial, Helvetica, sans-serif; background: #fff; color: #1f2937; }
        .wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 24px; }
        h1 { font-size: 48px; margin: 0 0 8px; font-weight: 600; }
        p { font-size: 16px; margin: 0 0 24px; color: #6b7280; }
        a { color: #1f2937; text-decoration: underline; }
    </style>
</head>
<body>
    <div class="wrap">
        <div>
            <h1>@yield('code')</h1>
            <p>@yield('message')</p>
            <a href="/">Back to home</a>
        </div>
    </div>
</body>
</html>
