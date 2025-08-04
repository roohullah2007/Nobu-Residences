<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AgentMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        if (!Auth::check() || !Auth::user()->isAgent()) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Access denied. Agent privileges required.'], 403);
            }
            
            return redirect('/')->with('error', 'Access denied. Agent privileges required.');
        }

        return $next($request);
    }
}
