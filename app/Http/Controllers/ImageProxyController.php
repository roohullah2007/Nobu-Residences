<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class ImageProxyController extends Controller
{
    /**
     * Proxy images from AMPRE CDN to avoid SSL issues
     */
    public function proxy(Request $request)
    {
        $imageUrl = $request->query('url');
        
        if (!$imageUrl) {
            return response('No image URL provided', 400);
        }
        
        // Validate it's an AMPRE image URL
        if (!str_contains($imageUrl, 'ampre.ca')) {
            return response('Invalid image source', 403);
        }
        
        // Cache key for the image
        $cacheKey = 'image_proxy_' . md5($imageUrl);
        
        // Try to get from cache first
        $cachedImage = Cache::get($cacheKey);
        if ($cachedImage) {
            return response($cachedImage['content'])
                ->header('Content-Type', $cachedImage['content_type'])
                ->header('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
        }
        
        try {
            // Fetch the image with SSL verification disabled for AMPRE
            $response = Http::withOptions([
                'verify' => false, // Disable SSL verification for AMPRE CDN
                'timeout' => 10,
            ])->get($imageUrl);
            
            if ($response->successful()) {
                $contentType = $response->header('Content-Type') ?? 'image/jpeg';
                $imageContent = $response->body();
                
                // Cache for 1 hour
                Cache::put($cacheKey, [
                    'content' => $imageContent,
                    'content_type' => $contentType
                ], 3600);
                
                return response($imageContent)
                    ->header('Content-Type', $contentType)
                    ->header('Cache-Control', 'public, max-age=86400');
            }
            
            // If failed, return a placeholder
            return redirect('/images/no-image-placeholder.svg');
            
        } catch (\Exception $e) {
            // Return placeholder on error
            return redirect('/images/no-image-placeholder.svg');
        }
    }
}