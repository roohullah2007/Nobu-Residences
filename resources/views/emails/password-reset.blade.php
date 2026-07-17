<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Reset your password</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f5f7; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7; padding:32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
                    <tr>
                        <td align="center" style="padding-bottom:24px;">
                            <span style="font-size:18px; font-weight:700; color:#293056; letter-spacing:0.5px;">{{ $siteName }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color:#ffffff; border-radius:12px; padding:32px;">
                            <h1 style="margin:0 0 12px; font-size:20px; font-weight:700; color:#111827;">Reset your password</h1>
                            <p style="margin:0 0 24px; font-size:15px; line-height:1.6; color:#4b5563;">
                                Hi {{ $firstName }}, tap the button below to choose a new password for your {{ $siteName }} account.
                            </p>
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="{{ $resetUrl }}" style="display:inline-block; background-color:#293056; color:#ffffff; text-decoration:none; font-size:15px; font-weight:600; padding:13px 32px; border-radius:9999px;">Reset password</a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin:24px 0 0; font-size:13px; line-height:1.6; color:#9ca3af;">
                                This link expires in {{ $expireMinutes }} minutes. If you didn't request a password reset, you can safely ignore this email.
                            </p>
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
