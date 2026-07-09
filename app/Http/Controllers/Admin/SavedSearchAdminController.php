<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SavedSearch;
use App\Services\SavedSearchAlertService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SavedSearchAdminController extends Controller
{
    /**
     * Admin overview of user saved searches and email-alert activity.
     */
    public function index(Request $request, SavedSearchAlertService $alertService)
    {
        $query = SavedSearch::with('user:id,name,email');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('email_alerts')) {
            $query->where('email_alerts', (bool) $request->email_alerts);
        }

        $savedSearches = $query->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString()
            ->through(function ($search) {
                return [
                    'id' => $search->id,
                    'name' => $search->name,
                    'user' => $search->user ? [
                        'name' => $search->user->name,
                        'email' => $search->user->email,
                    ] : null,
                    'formatted_criteria' => $search->formatted_criteria,
                    'email_alerts' => (bool) $search->email_alerts,
                    'frequency' => $search->frequency,
                    'last_alert_sent' => $search->last_alert_sent?->toDateTimeString(),
                    'total_alerts_sent' => $search->total_alerts_sent,
                    'created_at' => $search->created_at?->toDateTimeString(),
                ];
            });

        return Inertia::render('Admin/SavedSearches/Index', [
            'savedSearches' => $savedSearches,
            'stats' => $alertService->getAlertStats(),
            'filters' => $request->only(['search', 'email_alerts']),
        ]);
    }
}
