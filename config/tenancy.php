<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Admin host
    |--------------------------------------------------------------------------
    | The hostname(s) that are ALWAYS served as the main/admin website and are
    | never resolved against tenant domains. Requests on these hosts resolve to
    | the default website regardless of what any tenant row contains, so a
    | tenant can never capture the admin domain. Comparison is case-insensitive
    | and ignores a leading "www.".
    |
    | Accepts a comma-separated list for domain moves, e.g.
    |   ADMIN_HOST=building.wpbun.xyz,nobu.wpbun.xyz
    | keeps the panel reachable on both the new and old domain.
    */
    'admin_host' => env('ADMIN_HOST', 'nobu.wpbun.xyz'),

    /*
    |--------------------------------------------------------------------------
    | Unknown host behavior
    |--------------------------------------------------------------------------
    | What to do when a request arrives on a host that matches neither the
    | admin host nor any active tenant domain (e.g. a Cloudflare custom
    | hostname with no Website row, or a stranger pointing DNS at this server).
    |
    |   '404'     -> abort(404). Correct for production: prevents the default
    |                site being served (and indexed) under arbitrary domains.
    |   'default' -> legacy behavior: serve the default website. Use as a
    |                temporary rollback switch only.
    */
    'unknown_host' => env('TENANCY_UNKNOWN_HOST', '404'),

    /*
    |--------------------------------------------------------------------------
    | Hosts treated as local development
    |--------------------------------------------------------------------------
    | These (and *.test / *.local) always resolve to the default website and
    | never 404, so local tooling keeps working.
    */
    'local_hosts' => ['localhost', '127.0.0.1', 'local'],

    /*
    |--------------------------------------------------------------------------
    | Domain -> website cache
    |--------------------------------------------------------------------------
    | Seconds to cache the domain lookup per host. Keeps resolution O(1) with
    | thousands of tenant domains and several resolutions per request.
    */
    'cache_seconds' => env('TENANCY_CACHE_SECONDS', 60),
];
