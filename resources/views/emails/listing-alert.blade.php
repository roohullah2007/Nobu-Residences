<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $sectionTitle }}</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f5f7; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7; padding:32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
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

                            {{-- Agent header --}}
                            @php
                                $agentPhotoSrc = $agent['photoUrl'] ?? null;
                                if (isset($message)) {
                                    $agentPhotoSrc = \App\Support\EmailBranding::embedImage($message, $agent['photoPath'] ?? null, $agent['photoUrl'] ?? null) ?? $agentPhotoSrc;
                                }
                            @endphp
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                                <tr>
                                    @if (!empty($agentPhotoSrc))
                                        <td width="170" style="vertical-align:top; padding-right:24px;">
                                            <img src="{{ $agentPhotoSrc }}" alt="{{ $agent['name'] }}" width="170" style="display:block; width:170px; border-radius:8px;">
                                            <div style="font-size:17px; font-weight:700; color:#111827; margin-top:12px;">{{ $agent['name'] }}</div>
                                            <div style="font-size:13px; color:#6b7280; margin-top:2px;">{{ $agent['title'] }}</div>
                                        </td>
                                    @endif
                                    <td style="vertical-align:top;">
                                        <div style="font-family:Georgia, 'Times New Roman', serif; font-style:italic; font-size:28px; line-height:1.25; color:#293056; margin-bottom:16px;">{{ $headline }}</div>
                                        @if (empty($agent['photoUrl']))
                                            <div style="font-size:17px; font-weight:700; color:#111827;">{{ $agent['name'] }}</div>
                                            <div style="font-size:13px; color:#6b7280; margin:2px 0 10px;">{{ $agent['title'] }}</div>
                                        @endif
                                        @if (!empty($agent['phone']))
                                            <div style="font-size:14px; color:#4b5563; margin-bottom:6px;">{{ $agent['phone'] }}</div>
                                        @endif
                                        @if (!empty($agent['email']))
                                            <div style="font-size:14px; margin-bottom:6px;">
                                                <a href="mailto:{{ $agent['email'] }}" style="color:#293056; text-decoration:underline; font-weight:600;">Email Me</a>
                                            </div>
                                        @endif
                                        @if (!empty($agent['brokerage']))
                                            <div style="font-size:13px; color:#6b7280;">{{ $agent['brokerage'] }}</div>
                                        @endif
                                    </td>
                                </tr>
                            </table>

                            {{-- Thank-you / context box --}}
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                                <tr>
                                    <td align="center" style="background-color:#f8f8f8; border-radius:8px; padding:18px 24px; font-size:14px; line-height:1.6; color:#4b5563;">{!! $introHtml !!}</td>
                                </tr>
                            </table>

                            <h1 style="margin:0 0 20px; font-size:22px; font-weight:700; color:#111827; text-align:center;">{{ $sectionTitle }}</h1>

                            {{-- Property cards, two per row --}}
                            @foreach (array_chunk($cards, 2) as $pair)
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                                    <tr>
                                        @foreach ($pair as $card)
                                            <td width="50%" style="vertical-align:top; padding:0 {{ $loop->first ? '8px 0 0' : '0 0 8px' }};">
                                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb; border-radius:8px;">
                                                    <tr>
                                                        <td style="background-color:#293056; border-radius:8px 8px 0 0; padding:10px 12px;">
                                                            <div style="font-size:12px; font-weight:700; letter-spacing:1px; color:#ffffff;">{{ $card['banner'] }}</div>
                                                            <div style="font-size:13px; margin-top:3px;">
                                                                <a href="{{ $card['url'] }}" style="color:#ffffff; text-decoration:underline;">{{ $card['address_label'] }}</a>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    @if (!empty($card['image_url']))
                                                        <tr>
                                                            <td>
                                                                <a href="{{ $card['url'] }}">
                                                                    <img src="{{ $card['image_url'] }}" alt="{{ $card['address_label'] }}" width="100%" height="160" style="display:block; width:100%; height:160px; object-fit:cover;">
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    @endif
                                                    <tr>
                                                        <td style="padding:12px;">
                                                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                                                <tr>
                                                                    <td style="font-size:13px; padding-bottom:6px;">
                                                                        <a href="{{ $card['schedule_url'] }}" style="color:#293056; text-decoration:underline;">Schedule an Appointment</a>
                                                                    </td>
                                                                    <td align="right" style="font-size:13px; color:#6b7280; padding-bottom:6px;">{{ $card['city'] }}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td style="font-size:13px; padding-bottom:6px;">
                                                                        <a href="{{ $card['email_href'] }}" style="color:#293056; text-decoration:underline;">Email the Listing</a>
                                                                    </td>
                                                                    <td align="right" style="font-size:13px; color:#6b7280; padding-bottom:6px;">{{ $card['beds_baths'] }}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td style="font-size:13px;">
                                                                        <a href="{{ $card['url'] }}" style="color:#293056; text-decoration:underline; font-weight:700;">View Details</a>
                                                                    </td>
                                                                    <td align="right" style="font-size:15px; font-weight:700; color:#293056;">{{ $card['price_label'] }}</td>
                                                                </tr>
                                                                @if (!empty($card['note']))
                                                                    <tr>
                                                                        <td colspan="2" style="font-size:13px; font-weight:600; color:{{ $card['note_color'] ?? '#293056' }}; padding-top:8px;">{{ $card['note'] }}</td>
                                                                    </tr>
                                                                @endif
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        @endforeach
                                        @if (count($pair) === 1)
                                            <td width="50%" style="padding:0 0 0 8px;"></td>
                                        @endif
                                    </tr>
                                </table>
                            @endforeach

                            @if (!empty($buttonText) && !empty($buttonUrl))
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
                                    <tr>
                                        <td align="center">
                                            <a href="{{ $buttonUrl }}" style="display:inline-block; background-color:#293056; color:#ffffff; text-decoration:none; font-size:15px; font-weight:600; padding:13px 32px; border-radius:9999px;">{{ $buttonText }}</a>
                                        </td>
                                    </tr>
                                </table>
                            @endif
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding-top:24px; font-size:12px; line-height:1.7; color:#9ca3af;">
                            To make changes to your property search, <a href="{{ $manageUrl }}" style="color:#293056; text-decoration:underline;">log in here</a> to easily add, edit or delete your email alerts and manage account details.<br>
                            @if (!empty($unsubscribeUrl))
                                If you no longer want to receive email alerts about listings you may be interested in, you may <a href="{{ $unsubscribeUrl }}" style="color:#293056; text-decoration:underline;">unsubscribe</a>.<br>
                            @endif
                            &copy; {{ date('Y') }} {{ $siteName }}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
