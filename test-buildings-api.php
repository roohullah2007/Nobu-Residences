<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$request = Illuminate\Http\Request::create(
    '/api/buildings-search',
    'POST',
    [
        'search_params' => [
            'page' => 1,
            'page_size' => 10
        ]
    ]
);

$response = $kernel->handle($request);
echo $response->getContent();

$kernel->terminate($request, $response);