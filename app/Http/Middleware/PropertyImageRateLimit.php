<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class PropertyImageRateLimit
{
    /**
     * Handle an incoming request for property images with rate limiting
     */
    public function handle(Request $request, Closure $next): Response
    {
        $clientIp = $request->ip();
        $cacheKey = "property_image_requests_{$clientIp}";
        
        // Allow 60 requests per minute per IP
        $maxRequests = 60;
        $timeWindow = 60; // seconds
        
        $currentRequests = Cache::get($cacheKey, 0);
        
        if ($currentRequests >= $maxRequests) {
            return response()->json([
                'success' => false,
                'message' => 'Rate limit exceeded. Please wait before making more requests.',
                'retry_after' => $timeWindow
            ], 429);
        }
        
        // Increment request count
        Cache::put($cacheKey, $currentRequests + 1, $timeWindow);
        
        $response = $next($request);
        
        // Add rate limit headers
        $response->headers->set('X-RateLimit-Limit', $maxRequests);
        $response->headers->set('X-RateLimit-Remaining', max(0, $maxRequests - $currentRequests - 1));
        
        return $response;
    }
}