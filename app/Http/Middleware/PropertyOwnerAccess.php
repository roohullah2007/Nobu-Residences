<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PropertyOwnerAccess
{
    /**
     * Handle an incoming request.
     *
     * This middleware allows property owners to access their own properties
     * without purchasing contact information.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        
        // If this is a property route and user is authenticated
        if ($request->route('property') && auth()->check()) {
            $property = $request->route('property');
            
            // If user is the property owner, they get full access
            if ($property && $property->agent_id === auth()->id()) {
                // Add a flag to indicate this is the owner viewing
                $request->merge(['is_property_owner' => true]);
            }
        }
        
        return $response;
    }
}
