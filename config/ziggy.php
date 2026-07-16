<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Route groups exposed to the browser
    |--------------------------------------------------------------------------
    |
    | Ziggy's @routes directive embeds the app's named routes (names + URIs)
    | into every page's HTML. Public tenant landing pages must NOT reveal the
    | admin panel's structure or framework-specific endpoints, so they get
    | the "public" group: everything except admin.*, sanctum.* and storage.
    |
    | Admin pages pass no group (null) and receive the full route list, which
    | the admin frontend needs for route('admin.*') calls.
    |
    */

    'groups' => [
        'public' => [
            '!admin.*',
            '!sanctum.*',
            '!storage*',
        ],
    ],

];
