<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SavedSearchAlertHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AlertHistoryController extends Controller
{
    /**
     * Get user's alert history
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $limit = $request->input('limit', 20);

        $alerts = SavedSearchAlertHistory::where('user_id', $user->id)
            ->with(['savedSearch:id,name,search_params,frequency'])
            ->orderBy('sent_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($alert) {
                return [
                    'id' => $alert->id,
                    'search_name' => $alert->savedSearch->name ?? 'Deleted Search',
                    'search_id' => $alert->saved_search_id,
                    'listings_count' => $alert->listings_count,
                    'listing_keys' => $alert->listing_keys,
                    'status' => $alert->status,
                    'sent_at' => $alert->sent_at->format('Y-m-d H:i:s'),
                    'sent_at_human' => $alert->sent_at->diffForHumans(),
                    'frequency' => $this->getFrequencyText($alert->savedSearch->frequency ?? 1),
                ];
            });

        // Get summary stats
        $stats = [
            'total_alerts' => SavedSearchAlertHistory::where('user_id', $user->id)->count(),
            'alerts_this_week' => SavedSearchAlertHistory::where('user_id', $user->id)
                ->where('sent_at', '>=', now()->subWeek())
                ->count(),
            'total_listings_found' => SavedSearchAlertHistory::where('user_id', $user->id)
                ->sum('listings_count'),
        ];

        return response()->json([
            'success' => true,
            'data' => $alerts,
            'stats' => $stats,
        ]);
    }

    /**
     * Get alert details with listing information
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $alert = SavedSearchAlertHistory::where('user_id', $user->id)
            ->with(['savedSearch'])
            ->find($id);

        if (!$alert) {
            return response()->json([
                'success' => false,
                'message' => 'Alert not found'
            ], 404);
        }

        // Get property details for the listing keys from the Repliers API
        $properties = [];
        if (!empty($alert->listing_keys)) {
            try {
                $repliersApi = app(\App\Services\RepliersApiService::class);
                $listingKeys = array_slice(array_values($alert->listing_keys), 0, 20);

                $result = $repliersApi->searchListings([
                    'mlsNumber' => $listingKeys,
                    'status' => ['A', 'U'],
                    'resultsPerPage' => count($listingKeys),
                    'fields' => 'mlsNumber,listPrice,address,details,images[1]',
                ]);

                foreach ($result['listings'] ?? [] as $listing) {
                    $mlsNumber = $listing['mlsNumber'] ?? null;
                    if (!$mlsNumber) {
                        continue;
                    }
                    $address = $listing['address'] ?? [];
                    $details = $listing['details'] ?? [];
                    $fullAddress = trim(($address['streetNumber'] ?? '') . ' ' . ($address['streetName'] ?? '') . ' ' . ($address['streetSuffix'] ?? ''));
                    if (!empty($address['unitNumber'])) {
                        $fullAddress = $address['unitNumber'] . ' - ' . $fullAddress;
                    }
                    $images = $listing['images'] ?? [];
                    $price = (float) ($listing['listPrice'] ?? 0);

                    $properties[] = [
                        'mls_id' => $mlsNumber,
                        'address' => $fullAddress,
                        'city' => $address['city'] ?? '',
                        'price' => $price,
                        'formatted_price' => '$' . number_format($price),
                        'bedrooms' => $details['numBedrooms'] ?? 0,
                        'bathrooms' => $details['numBathrooms'] ?? 0,
                        'image_url' => !empty($images) ? $repliersApi->getImageUrl($images[0], 'small') : null,
                        'url' => '/property/' . $mlsNumber,
                    ];
                }
            } catch (\Exception $e) {
                \Log::warning('Failed to hydrate alert listings from Repliers: ' . $e->getMessage());
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $alert->id,
                'search_name' => $alert->savedSearch->name ?? 'Deleted Search',
                'search_criteria' => $alert->savedSearch->formatted_criteria ?? null,
                'listings_count' => $alert->listings_count,
                'status' => $alert->status,
                'sent_at' => $alert->sent_at->format('Y-m-d H:i:s'),
                'sent_at_human' => $alert->sent_at->diffForHumans(),
                'properties' => $properties,
            ],
        ]);
    }

    /**
     * Get frequency text
     *
     * @param int $frequency
     * @return string
     */
    private function getFrequencyText(int $frequency): string
    {
        return match ($frequency) {
            1 => 'Daily',
            7 => 'Weekly',
            30 => 'Monthly',
            default => 'Daily'
        };
    }
}
