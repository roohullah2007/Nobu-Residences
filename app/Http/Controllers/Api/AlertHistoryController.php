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

        // Get property details for the listing keys
        $properties = [];
        if (!empty($alert->listing_keys)) {
            $properties = \App\Models\MLSProperty::whereIn('mls_id', $alert->listing_keys)
                ->get()
                ->map(function ($prop) {
                    return [
                        'mls_id' => $prop->mls_id,
                        'address' => $prop->address,
                        'city' => $prop->city,
                        'price' => $prop->price,
                        'formatted_price' => '$' . number_format($prop->price),
                        'bedrooms' => $prop->bedrooms,
                        'bathrooms' => $prop->bathrooms,
                        'image_url' => is_array($prop->image_urls) && !empty($prop->image_urls) ? $prop->image_urls[0] : null,
                        'url' => '/property/' . $prop->mls_id,
                    ];
                });
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
