<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TourRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TourRequestController extends Controller
{
    /**
     * Display a listing of tour requests.
     */
    public function index(Request $request)
    {
        $query = TourRequest::query();

        // Apply filters
        if ($request->has('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('property_type') && $request->input('property_type') !== 'all') {
            $query->where('property_type', $request->input('property_type'));
        }

        // Get paginated results
        $tourRequests = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 20));

        return Inertia::render('Admin/TourRequests/Index', [
            'tourRequests' => $tourRequests,
            'filters' => [
                'status' => $request->input('status', 'all'),
                'property_type' => $request->input('property_type', 'all')
            ]
        ]);
    }

    /**
     * Export tour requests to CSV.
     */
    public function export(Request $request)
    {
        $query = TourRequest::query();

        // Apply filters if needed
        if ($request->has('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('property_type') && $request->input('property_type') !== 'all') {
            $query->where('property_type', $request->input('property_type'));
        }

        $tourRequests = $query->orderBy('created_at', 'desc')->get();

        $csvContent = "ID,Date Created,Full Name,Email,Phone,Property Type,Property Address,Selected Date,Selected Time,Status,Message\n";

        foreach ($tourRequests as $request) {
            $csvContent .= sprintf(
                "%d,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
                $request->id,
                $request->created_at->format('Y-m-d H:i:s'),
                $request->full_name,
                $request->email,
                $request->phone,
                $request->property_type ?: 'N/A',
                $request->property_address ?: 'N/A',
                $request->selected_date ?: 'N/A',
                $request->selected_time ?: 'N/A',
                $request->status,
                str_replace(['"', "\n", "\r"], ['""', ' ', ' '], $request->message ?: 'N/A')
            );
        }

        return response($csvContent, 200)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="tour_requests_' . date('Y-m-d_His') . '.csv"');
    }
}
