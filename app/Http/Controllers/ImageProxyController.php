<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class ImageProxyController extends Controller
{
    /**
     * Proxy images from Repliers CDN or other sources
     */
    public function proxy(Request $request)
    {
        $imageUrl = $request->query('url');

        if (!$imageUrl) {
            return response('No image URL provided', 400);
        }

        $imageUrl = urldecode($imageUrl);

        // Allow Repliers CDN and other trusted image sources
        $allowedDomains = ['cdn.repliers.io', 'images.unsplash.com'];
        $isAllowed = false;
        foreach ($allowedDomains as $domain) {
            if (str_contains($imageUrl, $domain)) {
                $isAllowed = true;
                break;
            }
        }

        if (!$isAllowed) {
            \Log::warning('Image proxy: untrusted URL: ' . $imageUrl);
            return response('Invalid image source', 403);
        }

        $cacheKey = 'image_proxy_' . md5($imageUrl);

        $cachedImage = Cache::get($cacheKey);
        if ($cachedImage) {
            return response($cachedImage['content'])
                ->header('Content-Type', $cachedImage['content_type'])
                ->header('Cache-Control', 'public, max-age=86400');
        }

        try {
            $response = Http::timeout(30)->connectTimeout(10)->get($imageUrl);

            if ($response->successful()) {
                $contentType = $response->header('Content-Type') ?? 'image/jpeg';
                $imageContent = $response->body();

                Cache::put($cacheKey, [
                    'content' => $imageContent,
                    'content_type' => $contentType,
                ], 3600);

                return response($imageContent)
                    ->header('Content-Type', $contentType)
                    ->header('Cache-Control', 'public, max-age=86400');
            }

            return redirect('/images/no-image-placeholder.svg');

        } catch (\Exception $e) {
            \Log::error('Image proxy error: ' . $e->getMessage());
            return redirect('/images/no-image-placeholder.svg');
        }
    }
}
