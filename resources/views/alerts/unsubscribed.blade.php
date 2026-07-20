<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Alerts turned off</title>
</head>
<body style="margin:0; padding:48px 16px; background-color:#f4f5f7; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <div style="max-width:480px; margin:0 auto; background-color:#ffffff; border-radius:12px; padding:32px; text-align:center;">
        <h1 style="margin:0 0 12px; font-size:20px; font-weight:700; color:#111827;">You're unsubscribed</h1>
        <p style="margin:0 0 24px; font-size:15px; line-height:1.6; color:#4b5563;">
            Email alerts for "{{ $searchName }}" have been turned off. You can re-enable them any time from your dashboard.
        </p>
        <a href="{{ $homeUrl }}/dashboard" style="display:inline-block; background-color:#293056; color:#ffffff; text-decoration:none; font-size:15px; font-weight:600; padding:13px 32px; border-radius:9999px;">Go to your dashboard</a>
        <p style="margin:24px 0 0; font-size:12px; color:#9ca3af;">&copy; {{ date('Y') }} {{ $siteName }}</p>
    </div>
</body>
</html>
