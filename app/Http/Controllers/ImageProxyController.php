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
        
        \Log::info('Image proxy request for URL: ' . $imageUrl);
        
        if (!$imageUrl) {
            return response('No image URL provided', 400);
        }
        
        // Decode URL if it's encoded
        $imageUrl = urldecode($imageUrl);
        
        // Validate it's an AMPRE image URL
        if (!str_contains($imageUrl, 'ampre.ca')) {
            \Log::warning('Not an AMPRE URL: ' . $imageUrl);
            return response('Invalid image source', 403);
        }
        
        // Cache key for the image
        $cacheKey = 'image_proxy_' . md5($imageUrl);
        
        // Try to get from cache first
        $cachedImage = Cache::get($cacheKey);
        if ($cachedImage) {
            \Log::info('Returning cached image for: ' . $imageUrl);
            return response($cachedImage['content'])
                ->header('Content-Type', $cachedImage['content_type'])
                ->header('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
        }
        
        try {
            // Convert HTTPS to HTTP for AMPRE URLs to avoid SSL issues
            if (str_contains($imageUrl, 'https://') && str_contains($imageUrl, 'ampre.ca')) {
                $imageUrl = str_replace('https://', 'http://', $imageUrl);
                \Log::info('Converted to HTTP: ' . $imageUrl);
            }
            
            // Fetch the image with SSL verification disabled for AMPRE
            $response = Http::withOptions([
                'verify' => false, // Disable SSL verification for AMPRE CDN
                'timeout' => 30,
                'connect_timeout' => 10,
            ])->get($imageUrl);
            
            if ($response->successful()) {
                $contentType = $response->header('Content-Type') ?? 'image/jpeg';
                $imageContent = $response->body();
                
                \Log::info('Successfully fetched image, content type: ' . $contentType);
                
                // Cache for 1 hour
                Cache::put($cacheKey, [
                    'content' => $imageContent,
                    'content_type' => $contentType
                ], 3600);
                
                return response($imageContent)
                    ->header('Content-Type', $contentType)
                    ->header('Cache-Control', 'public, max-age=86400');
            }
            
            // If failed, log the error
            \Log::error('Failed to fetch image. Status: ' . $response->status() . ', URL: ' . $imageUrl);
            return redirect('/images/no-image-placeholder.svg');
            
        } catch (\Exception $e) {
            // Log the error
            \Log::error('Exception in image proxy: ' . $e->getMessage() . ', URL: ' . $imageUrl);
            return redirect('/images/no-image-placeholder.svg');
        }
    }
}