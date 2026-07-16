<?php

namespace App\Http\Middleware;

use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken as Middleware;
use Symfony\Component\HttpFoundation\Cookie;

/**
 * Same CSRF validation as the framework default, but the token cookie is
 * named "ct" instead of Laravel's hardcoded "XSRF-TOKEN" — the default name
 * fingerprints the stack on every tenant landing page. The X-XSRF-TOKEN
 * request header is unchanged; axios is told the new cookie name in
 * resources/js/bootstrap.js and resources/js/utils/csrf.js reads it too.
 */
class ValidateCsrfToken extends Middleware
{
    public const COOKIE = 'ct';

    protected function newCookie($request, $config)
    {
        return new Cookie(
            static::COOKIE,
            $request->session()->token(),
            $this->availableAt(60 * $config['lifetime']),
            $config['path'],
            $config['domain'],
            $config['secure'],
            false,
            false,
            $config['same_site'] ?? null,
            $config['partitioned'] ?? false
        );
    }

    public static function serialized()
    {
        return EncryptCookies::serialized(static::COOKIE);
    }
}
