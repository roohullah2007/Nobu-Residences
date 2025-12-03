<?php

namespace App\Services;

use Exception;
use Illuminate\Http\Client\Response;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use App\Models\Setting;

/**
 * AMPRE API Service
 * 
 * Laravel service for integrating with the AMPRE real estate API.
 * Based on the WordPress idx-ampre plugin ApiClient implementation.
 */
class AmpreApiService
{
    private string $apiUrl;
    private string $vowToken;
    private string $idxToken;
    private array $filters = [];
    private array $customFilters = [];
    private array $orFilters = [];
    private int $top = 10;
    private int $skip = 0;
    private array $select = [];
    private bool $count = false;
    private array $orderBy = [];
    private int $cacheTtl;
    private int $timeout;
    private int $maxRetries;
    private int $retryDelay;

    public function __construct()
    {
        // Try to get settings from database first, fallback to config
        $this->apiUrl = rtrim(Setting::get('ampre_api_url') ?: config('ampre.api_url'), '/') . '/';
        $this->vowToken = Setting::get('ampre_vow_token') ?: config('ampre.vow_token');
        $this->idxToken = Setting::get('ampre_idx_token') ?: config('ampre.idx_token');
        $this->cacheTtl = Setting::get('cache_ttl') ?: config('ampre.cache_ttl', 300);
        $this->timeout = config('ampre.timeout', 30);
        $this->maxRetries = config('ampre.max_retries', 3);
        $this->retryDelay = config('ampre.retry_delay', 1);
        
        // Set default select fields
        $this->setSelect(config('ampre.defaults.select', []));
        $this->setTop(config('ampre.defaults.top', 10));
    }

    /**
     * Add a filter condition for API requests.
     */
    public function addFilter(string $key, string $value, string $operator = 'eq'): self
    {
        $filterKey = $key . '_' . $operator . '_' . $value;
        
        if (in_array($operator, ['gt', 'ge', 'lt', 'le'])) {
            $value = intval($value);
            $this->filters[$filterKey] = "{$key} {$operator} {$value}";
        } else {
            $escapedValue = str_replace("'", "''", $value);
            $this->filters[$filterKey] = "{$key} {$operator} '{$escapedValue}'";
        }

        return $this;
    }

    /**
     * Add OR filter condition for API requests.
     */
    public function setFilterOr(string $key, array $values, string $operator = 'eq'): self
    {
        if (empty($values)) {
            return $this;
        }

        $filterParts = [];
        foreach ($values as $value) {
            if (in_array($operator, ['gt', 'ge', 'lt', 'le'])) {
                $value = intval($value);
                $filterParts[] = "{$key} {$operator} {$value}";
            } else {
                $escapedValue = str_replace("'", "''", $value);
                $filterParts[] = "{$key} {$operator} '{$escapedValue}'";
            }
        }

        if (count($filterParts) > 1) {
            $this->orFilters[$key] = '(' . implode(' or ', $filterParts) . ')';
        } else {
            $this->orFilters[$key] = $filterParts[0];
        }

        return $this;
    }

    /**
     * Set price range filter.
     */
    public function setPriceRange(?int $minPrice = null, ?int $maxPrice = null): self
    {
        // Clear existing ListPrice filters
        $this->filters = array_filter($this->filters, function ($filterKey) {
            return strpos($filterKey, 'ListPrice_') !== 0;
        }, ARRAY_FILTER_USE_KEY);
        
        if ($minPrice !== null && $minPrice > 0) {
            $this->addFilter('ListPrice', (string)$minPrice, 'ge');
        }
        
        if ($maxPrice !== null && $maxPrice > 0) {
            $this->addFilter('ListPrice', (string)$maxPrice, 'le');
        }
        
        return $this;
    }

    /**
     * Set the maximum number of records to return.
     */
    public function setTop(int $top = 10): self
    {
        $this->top = max(1, $top);
        return $this;
    }

    /**
     * Set the number of records to skip.
     */
    public function setSkip(int $skip = 0): self
    {
        $this->skip = max(0, $skip);
        return $this;
    }

    /**
     * Set the fields to select.
     * Pass empty array [] to fetch ALL fields (no $select parameter in query)
     */
    public function setSelect(?array $select = null): self
    {
        // If null, use config defaults. If empty array [], fetch all fields.
        $this->select = $select === null ? config('ampre.defaults.select', []) : $select;
        return $this;
    }

    /**
     * Set OrderBy clause.
     */
    public function setOrderBy($fields): self
    {
        if (is_string($fields)) {
            $this->orderBy = [$fields];
        } elseif (is_array($fields)) {
            $this->orderBy = $fields;
        } else {
            $this->orderBy = [];
        }

        return $this;
    }

    /**
     * Add OrderBy field.
     */
    public function addOrderBy(string $field): self
    {
        $this->orderBy[] = $field;
        return $this;
    }

    /**
     * Set count parameter.
     */
    public function setCount(bool $count = true): self
    {
        $this->count = $count;
        return $this;
    }

    /**
     * Set cache TTL (Time To Live) in seconds.
     * Set to 0 to disable caching.
     */
    public function setCacheTtl(int $ttl = 300): self
    {
        $this->cacheTtl = $ttl;
        return $this;
    }

    /**
     * Add custom filter expression.
     */
    public function addCustomFilter(string $filterExpression): self
    {
        $this->customFilters[] = $filterExpression;
        return $this;
    }

    /**
     * Reset all filters.
     */
    public function resetFilters(): self
    {
        $this->filters = [];
        $this->customFilters = [];
        $this->orFilters = [];
        $this->orderBy = [];
        $this->skip = 0;
        return $this;
    }

    /**
     * Get the prepared API request URL with all parameters.
     */
    public function getRequestUrl(string $endpoint = 'Property'): string
    {
        $queryParams = $this->buildQueryParams();
        $url = $this->apiUrl . $endpoint . '?' . http_build_query($queryParams);
        return urldecode($url);
    }

    /**
     * Fetch multiple properties based on current filters.
     * If select is empty, fetches ALL available fields.
     */
    public function fetchProperties(): array
    {
        $queryParams = $this->buildQueryParams();
        $cacheKey = $this->generateCacheKey('properties', $queryParams);

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($queryParams) {
            $response = $this->makeRequest('GET', 'Property', $queryParams);
            return $this->processResponse($response, 'fetchProperties', true);
        });
    }

    /**
     * Fetch properties with count information.
     * If select is empty, fetches ALL available fields.
     * Note: Caching disabled for large result sets to avoid database timeout issues.
     */
    public function fetchPropertiesWithCount(): array
    {
        $queryParams = $this->buildQueryParams();
        $queryParams['$count'] = 'true';

        // For large result sets (top > 50), skip caching to avoid MySQL timeout
        $top = $queryParams['$top'] ?? 10;
        if ($top > 50) {
            // Fetch directly without caching for large requests
            $response = $this->makeRequest('GET', 'Property', $queryParams);
            $data = $this->processResponse($response, 'fetchPropertiesWithCount');

            return [
                'properties' => $data['value'] ?? [],
                'count' => $data['@odata.count'] ?? count($data['value'] ?? [])
            ];
        }

        // For smaller requests, use caching
        $cacheKey = $this->generateCacheKey('properties_count', $queryParams);

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($queryParams) {
            $response = $this->makeRequest('GET', 'Property', $queryParams);
            $data = $this->processResponse($response, 'fetchPropertiesWithCount');

            return [
                'properties' => $data['value'] ?? [],
                'count' => $data['@odata.count'] ?? count($data['value'] ?? [])
            ];
        });
    }

    /**
     * Get property by listing key.
     */
    public function getPropertyByKey(string $listingKey): ?array
    {
        if (empty($listingKey)) {
            throw new Exception('Listing Key cannot be empty.');
        }

        $cacheKey = $this->generateCacheKey('property', ['listingKey' => $listingKey]);
        $endpoint = "Property('" . rawurlencode($listingKey) . "')";

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($endpoint, $listingKey) {
            try {
                // Don't specify $select to get ALL fields from the API
                // This ensures we get fields like LivingAreaRange, Exposure, etc.
                $response = $this->makeRequest('GET', $endpoint);
                return $this->processResponse($response, 'getPropertyByKey');
            } catch (RequestException $e) {
                if ($e->response->status() === 404) {
                    return null;
                }
                throw $e;
            }
        });
    }

    /**
     * Get properties images.
     */
    public function getPropertiesImages(array $listingKeys, string $sizeDescription = 'Largest', int $limit = 250): array
    {
        if (empty($listingKeys)) {
            return [];
        }

        $listingKeysStr = $this->prepareODataInFilterKeys($listingKeys);
        if ($listingKeysStr === null) {
            return [];
        }

        $cacheKey = $this->generateCacheKey('images', [
            'keys' => $listingKeys,
            'size' => $sizeDescription,
            'limit' => $limit
        ]);

        $safeSizeDescription = str_replace("'", "''", $sizeDescription);

        $queryParams = [
            '$filter' => "ResourceRecordKey in ({$listingKeysStr}) and ImageSizeDescription eq '{$safeSizeDescription}'",
            '$select' => "MediaKey,MediaURL,ResourceRecordKey,ImageSizeDescription,Order",
            '$orderby' => "ResourceRecordKey,Order",
            '$top' => max(1, $limit),
        ];

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($queryParams) {
            $response = $this->makeRequest('GET', 'Media', $queryParams);
            $mediaItems = $this->processResponse($response, 'getPropertiesImages', true);
            return $this->groupResultsByKey($mediaItems, 'ResourceRecordKey');
        });
    }

    /**
     * Get property rooms by keys.
     */
    public function getPropertyRoomsByKeys(array $listingKeys, int $limit = 1000): array
    {
        if (empty($listingKeys)) {
            return [];
        }

        $listingKeysStr = $this->prepareODataInFilterKeys($listingKeys);
        if ($listingKeysStr === null) {
            return [];
        }

        $cacheKey = $this->generateCacheKey('rooms', [
            'keys' => $listingKeys,
            'limit' => $limit
        ]);

        $selectFields = [
            'RoomKey', 'ListingKey', 'RoomType', 'RoomDimensions',
            'RoomDescription', 'RoomLevel', 'RoomFeatures', 'RoomLength',
            'RoomWidth', 'RoomFeature1', 'RoomFeature2', 'RoomFeature3'
        ];

        $queryParams = [
            '$filter' => "ListingKey in ({$listingKeysStr})",
            '$select' => implode(',', $selectFields),
            '$top' => max(1, $limit),
        ];

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($queryParams) {
            $response = $this->makeRequest('GET', 'PropertyRooms', $queryParams);
            $roomItems = $this->processResponse($response, 'getPropertyRoomsByKeys', true);
            return $this->groupResultsByKey($roomItems, 'ListingKey');
        });
    }

    /**
     * Build query parameters for API request.
     */
    private function buildQueryParams(): array
    {
        $filtersArray = array_merge(
            array_values($this->filters),
            array_values($this->orFilters),
            $this->customFilters
        );

        $queryParams = [
            '$top' => $this->top,
        ];

        // Only add $select if fields are specified (empty = fetch all fields)
        if (!empty($this->select)) {
            $queryParams['$select'] = implode(',', $this->select);
        }

        if ($this->skip > 0) {
            $queryParams['$skip'] = $this->skip;
        }

        if (!empty($filtersArray)) {
            $queryParams['$filter'] = implode(' and ', $filtersArray);
        }

        if (!empty($this->orderBy)) {
            $queryParams['$orderby'] = implode(',', $this->orderBy);
        }

        if ($this->count) {
            $queryParams['$count'] = 'true';
        }

        return $queryParams;
    }

    /**
     * Make HTTP request to AMPRE API.
     */
    public function makeRequest(string $method, string $endpoint, array $queryParams = []): Response
    {
        $url = $this->apiUrl . ltrim($endpoint, '/');
        
        $http = Http::timeout($this->timeout)
            ->retry($this->maxRetries, $this->retryDelay * 1000)
            ->withHeaders([
                'Accept' => 'application/json',
                'Authorization' => 'Bearer ' . $this->vowToken,
            ]);

        Log::info('AMPRE API Request', [
            'method' => $method,
            'url' => $url,
            'params' => $queryParams
        ]);

        $response = $http->$method($url, $queryParams);

        if (!$response->successful()) {
            Log::error('AMPRE API Error', [
                'status' => $response->status(),
                'body' => $response->body(),
                'url' => $url
            ]);
        }

        return $response;
    }

    /**
     * Process API response.
     */
    private function processResponse(Response $response, string $context, bool $expectValueArray = false): array
    {
        $response->throw();
        
        $data = $response->json();

        if ($expectValueArray) {
            if (!isset($data['value']) || !is_array($data['value'])) {
                throw new Exception("API returned unexpected data structure for {$context}.");
            }
            return $data['value'];
        }

        return $data;
    }

    /**
     * Generate cache key.
     */
    private function generateCacheKey(string $prefix, array $params): string
    {
        ksort($params);
        $keyPart = http_build_query($params);
        return config('ampre.cache_prefix') . $prefix . '_' . md5($keyPart);
    }

    /**
     * Prepare OData in filter keys.
     */
    private function prepareODataInFilterKeys(array $keys): ?string
    {
        if (empty($keys)) {
            return null;
        }

        $sanitizedKeys = array_filter(array_map('trim', $keys));
        
        if (empty($sanitizedKeys)) {
            return null;
        }

        $formattedKeys = array_map(function ($key) {
            return "'" . str_replace("'", "''", $key) . "'";
        }, $sanitizedKeys);

        return implode(',', $formattedKeys);
    }

    /**
     * Group results by key field.
     */
    private function groupResultsByKey(array $results, string $keyField): array
    {
        $grouped = [];
        foreach ($results as $item) {
            if (isset($item[$keyField])) {
                $grouped[$item[$keyField]][] = $item;
            }
        }
        return $grouped;
    }
}