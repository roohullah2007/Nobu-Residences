<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title }}</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f5f7; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7; padding:32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
                    <tr>
                        <td align="center" style="padding-bottom:24px;">
                            @php
                                // Embed the logo inline (cid:) when actually sending — mail
                                // clients fetch remote images via proxies that Cloudflare can
                                // block on tenant domains; an inline attachment always shows.
                                // Local file first, else the server downloads and embeds the
                                // bytes; the plain URL is the last resort.
                                $logoSrc = $logoUrl ?? null;
                                if (isset($message)) {
                                    $logoSrc = \App\Support\EmailBranding::embedImage($message, $logoPath ?? null, $logoUrl ?? null) ?? $logoSrc;
                                }
                            @endphp
                            @if (!empty($logoSrc))
                                {{-- Site logos are typically white-on-transparent (made for the navy site header), so they sit on a navy chip to stay legible on the gray page. --}}
                                <span style="display:inline-block; background-color:#293056; border-radius:12px; padding:12px 24px;">
                                    <img src="{{ $logoSrc }}" alt="{{ $siteName }}" height="36" style="display:block; height:36px; max-width:180px;">
                                </span>
                            @else
                                <span style="font-size:18px; font-weight:700; color:#293056; letter-spacing:0.5px;">{{ $siteName }}</span>
                            @endif
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color:#ffffff; border-radius:12px; padding:32px;">
                            <h1 style="margin:0 0 12px; font-size:20px; font-weight:700; color:#111827;">{{ $title }}</h1>

                            @foreach ($paragraphs ?? [] as $paragraph)
                                <p style="margin:0 0 16px; font-size:15px; line-height:1.6; color:#4b5563;">{!! $paragraph !!}</p>
                            @endforeach

                            @if (!empty($rows))
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px; background-color:#f8f8f8; border-radius:8px;">
                                    @foreach ($rows as $label => $value)
                                        <tr>
                                            <td style="padding:8px 16px; font-size:13px; color:#6b7280; white-space:nowrap; vertical-align:top;">{{ $label }}</td>
                                            <td style="padding:8px 16px; font-size:14px; color:#111827; font-weight:600;">{{ $value }}</td>
                                        </tr>
                                    @endforeach
                                </table>
                            @endif

                            @foreach ($listings ?? [] as $listing)
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px; background-color:#f8f8f8; border-radius:8px;">
                                    <tr>
                                        @if (!empty($listing['image_url']))
                                            <td width="96" style="padding:12px 0 12px 12px; vertical-align:top;">
                                                <img src="{{ $listing['image_url'] }}" alt="{{ $listing['address'] ?? 'Listing' }}" width="96" height="72" style="display:block; width:96px; height:72px; object-fit:cover; border-radius:6px;">
                                            </td>
                                        @endif
                                        <td style="padding:12px 16px; vertical-align:top;">
                                            @if (!empty($listing['formatted_price']))
                                                <div style="font-size:16px; font-weight:700; color:#293056;">{{ $listing['formatted_price'] }}</div>
                                            @endif
                                            @if (!empty($listing['address']))
                                                <div style="font-size:14px; color:#4b5563; margin-top:2px;">
                                                    @if (!empty($listing['url']))
                                                        <a href="{{ $listing['url'] }}" style="color:#4b5563; text-decoration:underline;">{{ $listing['address'] }}@if(!empty($listing['city'])), {{ $listing['city'] }}@endif</a>
                                                    @else
                                                        {{ $listing['address'] }}@if(!empty($listing['city'])), {{ $listing['city'] }}@endif
                                                    @endif
                                                </div>
                                            @endif
                                            @php
                                                $meta = array_filter([
                                                    !empty($listing['bedrooms']) ? $listing['bedrooms'] . ' bed' : null,
                                                    !empty($listing['bathrooms']) ? $listing['bathrooms'] . ' bath' : null,
                                                    !empty($listing['square_footage']) ? $listing['square_footage'] . ' sqft' : null,
                                                    $listing['property_type'] ?? null,
                                                ]);
                                            @endphp
                                            @if (!empty($meta))
                                                <div style="font-size:13px; color:#6b7280; margin-top:2px;">{{ implode(' · ', $meta) }}</div>
                                            @endif
                                            @if (!empty($listing['note']))
                                                <div style="font-size:13px; font-weight:600; color:{{ $listing['note_color'] ?? '#293056' }}; margin-top:4px;">{{ $listing['note'] }}</div>
                                            @endif
                                        </td>
                                    </tr>
                                </table>
                            @endforeach

                            @if (!empty($buttonText) && !empty($buttonUrl))
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
                                    <tr>
                                        <td align="center">
                                            <a href="{{ $buttonUrl }}" style="display:inline-block; background-color:#293056; color:#ffffff; text-decoration:none; font-size:15px; font-weight:600; padding:13px 32px; border-radius:9999px;">{{ $buttonText }}</a>
                                        </td>
                                    </tr>
                                </table>
                            @endif

                            @if (!empty($footnote))
                                <p style="margin:24px 0 0; font-size:13px; line-height:1.6; color:#9ca3af;">{{ $footnote }}</p>
                            @endif
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding-top:24px;">
                            <span style="font-size:12px; color:#9ca3af;">&copy; {{ date('Y') }} {{ $siteName }}</span>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
