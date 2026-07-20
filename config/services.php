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

    // Follow Up Boss CRM — leads (registrations, enquiries, tour requests,
    // saved searches) are pushed server-side via the FUB Events API.
    // Create the key in FUB: Admin > API > Create API Key.
    'followupboss' => [
        'key' => env('FUB_API_KEY'),
        // Optional registered-system name shown on FUB events
        'system' => env('FUB_SYSTEM'),
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

    // Condos.ca Developers API — powers the developer auto-match, search
    // and import on the building/developer admin forms
    // (see DEVELOPERS-API-DOCS.md).
    'developers_api' => [
        'base_url' => env('DEVELOPERS_API_URL', 'https://developers-api.royal-scene-c64e.workers.dev'),
        'key' => env('DEVELOPERS_API_KEY'),
    ],

    // Cloudflare for SaaS (Custom Hostnames): customer domains CNAME to
    // cname_target and Cloudflare terminates SSL — no server-side certbot.
    'cloudflare' => [
        'token' => env('CLOUDFLARE_API_TOKEN'),
        'zone_id' => env('CLOUDFLARE_ZONE_ID'),
        // The hostname customers point their CNAME at (the SaaS zone's
        // fallback origin entry).
        'cname_target' => env('CLOUDFLARE_CNAME_TARGET', 'building.wpbun.xyz'),
        'base_url' => env('CLOUDFLARE_BASE_URL', 'https://api.cloudflare.com/client/v4'),
    ],

];
