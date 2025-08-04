<?php

namespace App\Http\Controllers;

use App\Services\AmpreApiService;
use Illuminate\Http\JsonResponse;
use Exception;

class AmpreTestController extends Controller
{
    private AmpreApiService $ampreApi;

    public function __construct(AmpreApiService $ampreApi)
    {
        $this->ampreApi = $ampreApi;
    }

    /**
     * Test basic API configuration
     */
    public function testConfig(): JsonResponse
    {
        return response()->json([
            'api_url' => config('ampre.api_url'),
            'has_vow_token' => !empty(config('ampre.vow_token')),
            'has_idx_token' => !empty(config('ampre.idx_token')),
            'cache_ttl' => config('ampre.cache_ttl'),
            'default_fields' => config('ampre.defaults.select'),
        ]);
    }

    /**
     * Test fetching properties (basic test)
     */
    public function testProperties(): JsonResponse
    {
        try {
            $properties = $this->ampreApi
                ->setTop(5)
                ->addFilter('StandardStatus', 'Active')
                ->fetchProperties();

            return response()->json([
                'success' => true,
                'count' => count($properties),
                'properties' => $properties,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'request_url' => $this->ampreApi->getRequestUrl(),
            ], 500);
        }
    }

    /**
     * Test fetching properties with count
     */
    public function testPropertiesWithCount(): JsonResponse
    {
        try {
            $result = $this->ampreApi
                ->setTop(3)
                ->addFilter('StandardStatus', 'Active')
                ->fetchPropertiesWithCount();

            return response()->json([
                'success' => true,
                'result' => $result,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Test price range filtering
     */
    public function testPriceRange(): JsonResponse
    {
        try {
            $properties = $this->ampreApi
                ->setTop(5)
                ->addFilter('StandardStatus', 'Active')
                ->setPriceRange(100000, 500000)
                ->fetchProperties();

            return response()->json([
                'success' => true,
                'count' => count($properties),
                'request_url' => $this->ampreApi->getRequestUrl(),
                'properties' => $properties,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Test OR filters
     */
    public function testOrFilters(): JsonResponse
    {
        try {
            $properties = $this->ampreApi
                ->setTop(5)
                ->addFilter('StandardStatus', 'Active')
                ->setFilterOr('City', ['Toronto', 'Vancouver', 'Montreal'])
                ->fetchProperties();

            return response()->json([
                'success' => true,
                'count' => count($properties),
                'request_url' => $this->ampreApi->getRequestUrl(),
                'properties' => $properties,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Test getting a specific property by key
     */
    public function testPropertyByKey(string $listingKey): JsonResponse
    {
        try {
            $property = $this->ampreApi->getPropertyByKey($listingKey);

            return response()->json([
                'success' => true,
                'found' => $property !== null,
                'property' => $property,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get request URL for debugging
     */
    public function getRequestUrl(): JsonResponse
    {
        $url = $this->ampreApi
            ->setTop(10)
            ->addFilter('StandardStatus', 'Active')
            ->setPriceRange(200000, 800000)
            ->setOrderBy('ListPrice desc')
            ->getRequestUrl();

        return response()->json([
            'request_url' => $url,
        ]);
    }
}