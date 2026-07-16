<?php

namespace App\Http\Middleware;

use App\Services\Tenancy\TenantResolver;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * 404 the route on the admin/main host (pcdadmin.com). Used for public auth
 * routes (register, forgot/reset password, Google OAuth) that only exist on
 * tenant sites — the main domain exposes nothing but the bare login screen.
 */
class NotOnMainDomain
{
    public function handle(Request $request, Closure $next): Response
    {
        if (app(TenantResolver::class)->isAdminHost($request->getHost())) {
            abort(404);
        }

        return $next($request);
    }
}
