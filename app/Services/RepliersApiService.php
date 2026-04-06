<?php

namespace App\Services;

use Exception;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Repliers API Service
 *
 * Laravel service for integrating with the Repliers MLS API.
 * API docs: https://repliers.io/docs
 */
class RepliersApiService
{
    private string $apiUrl;
    private string $apiKey;
    private string $cdnUrl;
    private int $cacheTtl;
    private int $timeout;
    private int $maxRetries;
    private int $retryDelay;

    public function __construct()
    {
        $this->apiUrl = rtrim(config('repliers.api_url', 'https://api.repliers.io'), '/');
        $this->apiKey = config('repliers.api_key', '');
        $this->cdnUrl = rtrim(config('repliers.cdn_url', 'https://cdn.repliers.io'), '/');
        $this->cacheTtl = config('repliers.cache_ttl', 300);
        $this->timeout = config('repliers.timeout', 30);
        $this->maxRetries = config('repliers.max_retries', 3);
        $this->retryDelay = config('repliers.retry_delay', 1);
    }

    /**
     * Search listings with filters
     *
     * @param array $params Query parameters matching Repliers API
     * @return array { listings: [], count: int, page: int, numPages: int }
     */
    public function searchListings(array $params = []): array
    {
        $cacheKey = $this->generateCacheKey('listings_search', $params);

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($params) {
            $response = $this->makeRequest('GET', '/listings', $params);
            $data = $response->json();

            return [
                'listings' => $data['listings'] ?? [],
                'count' => $data['count'] ?? 0,
                'page' => $data['page'] ?? 1,
                'numPages' => $data['numPages'] ?? 0,
                'pageSize' => $data['pageSize'] ?? count($data['listings'] ?? []),
            ];
        });
    }

    /**
     * Search listings without caching (for sync operations)
     */
    public function searchListingsNoCache(array $params = []): array
    {
        $response = $this->makeRequest('GET', '/listings', $params);
        $data = $response->json();

        return [
            'listings' => $data['listings'] ?? [],
            'count' => $data['count'] ?? 0,
            'page' => $data['page'] ?? 1,
            'numPages' => $data['numPages'] ?? 0,
            'pageSize' => $data['pageSize'] ?? count($data['listings'] ?? []),
        ];
    }

    /**
     * Get a single listing by MLS number
     *
     * @param string $mlsNumber The MLS listing number
     * @param int $boardId The MLS board ID (required by Repliers)
     * @return array|null
     */
    public function getListing(string $mlsNumber, int $boardId): ?array
    {
        $cacheKey = $this->generateCacheKey('listing', ['mls' => $mlsNumber, 'board' => $boardId]);

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($mlsNumber, $boardId) {
            try {
                $response = $this->makeRequest('GET', "/listings/{$mlsNumber}", [
                    'boardId' => $boardId,
                ]);

                $data = $response->json();

                // Single listing response contains the listing directly
                if (!empty($data['mlsNumber'])) {
                    return $data;
                }

                // Sometimes returned inside listings array
                if (!empty($data['listings'][0])) {
                    return $data['listings'][0];
                }

                return null;
            } catch (Exception $e) {
                if (str_contains($e->getMessage(), '404')) {
                    return null;
                }
                throw $e;
            }
        });
    }

    /**
     * Get a single listing by searching for its MLS number
     * Searches both active and sold/leased listings
     */
    public function getListingByMlsNumber(string $mlsNumber): ?array
    {
        // Try active listings first
        $result = $this->searchListings([
            'search' => $mlsNumber,
            'resultsPerPage' => 1,
        ]);

        if (!empty($result['listings'])) {
            $listing = $result['listings'][0];
            if (($listing['mlsNumber'] ?? '') === $mlsNumber) {
                return $listing;
            }
        }

        // Try sold/unavailable listings
        $result = $this->searchListings([
            'search' => $mlsNumber,
            'status' => 'U',
            'resultsPerPage' => 1,
        ]);

        if (!empty($result['listings'])) {
            $listing = $result['listings'][0];
            if (($listing['mlsNumber'] ?? '') === $mlsNumber) {
                return $listing;
            }
        }

        return null;
    }

    /**
     * Get similar listings for a property
     */
    public function getSimilarListings(string $mlsNumber, int $boardId, int $limit = 6): array
    {
        $cacheKey = $this->generateCacheKey('similar', ['mls' => $mlsNumber, 'board' => $boardId, 'limit' => $limit]);

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($mlsNumber, $boardId, $limit) {
            try {
                $response = $this->makeRequest('GET', "/listings/{$mlsNumber}/similar", [
                    'boardId' => $boardId,
                    'resultsPerPage' => $limit,
                ]);

                $data = $response->json();
                return $data['listings'] ?? [];
            } catch (Exception $e) {
                Log::warning('Failed to fetch similar listings', ['mls' => $mlsNumber, 'error' => $e->getMessage()]);
                return [];
            }
        });
    }

    /**
     * Location autocomplete
     */
    public function locationAutocomplete(string $query): array
    {
        $cacheKey = $this->generateCacheKey('location_autocomplete', ['q' => $query]);

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($query) {
            $response = $this->makeRequest('GET', '/locations/autocomplete', [
                'search' => $query,
            ]);

            return $response->json() ?? [];
        });
    }

    /**
     * Build the full CDN image URL from a filename
     */
    public function getImageUrl(string $filename): string
    {
        if (str_starts_with($filename, 'http://') || str_starts_with($filename, 'https://')) {
            return $filename;
        }

        return $this->cdnUrl . '/' . ltrim($filename, '/');
    }

    /**
     * Get all image URLs for a listing
     *
     * @param array $listing The listing data from API
     * @return array Array of full CDN image URLs
     */
    public function getListingImageUrls(array $listing): array
    {
        $images = $listing['images'] ?? [];
        return array_map(fn($img) => $this->getImageUrl($img), $images);
    }

    /**
     * Set cache TTL
     */
    public function setCacheTtl(int $ttl): self
    {
        $this->cacheTtl = $ttl;
        return $this;
    }

    /**
     * Make HTTP request to Repliers API
     */
    public function makeRequest(string $method, string $endpoint, array $params = []): Response
    {
        $url = $this->apiUrl . '/' . ltrim($endpoint, '/');

        $http = Http::timeout($this->timeout)
            ->retry($this->maxRetries, $this->retryDelay * 1000)
            ->withHeaders([
                'REPLIERS-API-KEY' => $this->apiKey,
                'Accept' => 'application/json',
            ]);

        Log::info('Repliers API Request', [
            'method' => $method,
            'url' => $url,
            'params' => $params,
        ]);

        if ($method === 'POST') {
            $response = $http->post($url, $params);
        } else {
            // Build query string manually to handle array params correctly
            // Repliers expects repeated params: city=Toronto&city=Vaughan (not city[]=...)
            $queryParts = [];
            foreach ($params as $key => $value) {
                if (is_array($value)) {
                    foreach ($value as $v) {
                        $queryParts[] = urlencode($key) . '=' . urlencode($v);
                    }
                } else {
                    $queryParts[] = urlencode($key) . '=' . urlencode($value);
                }
            }
            $queryString = implode('&', $queryParts);
            $fullUrl = $queryString ? $url . '?' . $queryString : $url;
            $response = $http->get($fullUrl);
        }

        if (!$response->successful()) {
            Log::error('Repliers API Error', [
                'status' => $response->status(),
                'body' => $response->body(),
                'url' => $url,
            ]);
            $response->throw();
        }

        return $response;
    }

    /**
     * Generate cache key
     */
    private function generateCacheKey(string $prefix, array $params): string
    {
        ksort($params);
        $keyPart = http_build_query($params);
        return config('repliers.cache_prefix', 'repliers_api_') . $prefix . '_' . md5($keyPart);
    }
}
