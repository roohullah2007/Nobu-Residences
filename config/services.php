<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY', env('RESEND_KEY')),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI', '/auth/google/callback'),
        'maps_api_key' => env('GOOGLE_MAPS_API_KEY'),
    ],

    'gemini' => [
        'api_key' => env('GEMINI_API_KEY'),
        'model' => env('GEMINI_MODEL', 'gemini-flash-latest'),
    ],

    'ploi' => [
        'token' => env('PLOI_API_TOKEN'),
        'server_id' => env('PLOI_SERVER_ID'),
        'site_id' => env('PLOI_SITE_ID'),
        // Public IPv4 of the Ploi server. If unset, PloiService::getServerIp()
        // falls back to GET /servers/{id} on the Ploi API. Setting it here is
        // cheaper (no API call) and works even if Ploi rate-limits.
        'server_ip' => env('PLOI_SERVER_IP'),
        'auto_provision' => env('PLOI_AUTO_PROVISION', true),
        'request_ssl' => env('PLOI_REQUEST_SSL', true),
        'base_url' => env('PLOI_BASE_URL', 'https://ploi.io/api'),
    ],

];
