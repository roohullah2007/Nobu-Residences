<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TourRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class TourRequestController extends Controller
{
    /**
     * Store a new tour request.
     */
    public function store(Request $request)
    {
        try {
            // Validate the request
            $validator = Validator::make($request->all(), [
                'full_name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'phone' => 'required|string|max:20',
                'message' => 'nullable|string',
                'property_id' => 'nullable|string',
                'property_type' => 'nullable|string',
                'property_address' => 'nullable|string',
                'selected_date' => 'nullable|string',
                'selected_time' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                    'message' => 'Validation failed'
                ], 422);
            }

            // Create the tour request
            $tourRequest = TourRequest::create([
                'full_name' => $request->input('full_name'),
                'email' => $request->input('email'),
                'phone' => $request->input('phone'),
                'message' => $request->input('message'),
                'property_id' => $request->input('property_id'),
                'property_type' => $request->input('property_type', 'property'),
                'property_address' => $request->input('property_address'),
                'selected_date' => $request->input('selected_date'),
                'selected_time' => $request->input('selected_time'),
                'status' => 'pending',
            ]);

            // Log the tour request for monitoring
            Log::info('New tour request created', [
                'id' => $tourRequest->id,
                'email' => $tourRequest->email,
                'property_id' => $tourRequest->property_id
            ]);

            // Push the lead into Follow Up Boss (with live property details
            // + a For Sale / For Lease tag), then book the showing on the
            // person's Appointments panel. Guarded — never break the tour
            // request itself.
            try {
                $fub = app(\App\Services\FollowUpBossService::class);
                $context = $fub->propertyContext($tourRequest->property_id, $tourRequest->property_address);

                $fubPerson = $fub->sendEvent('Property Inquiry', array_filter([
                    'name' => $tourRequest->full_name,
                    'email' => $tourRequest->email,
                    'phone' => $tourRequest->phone,
                    'tags' => $context['tag'] ? [$context['tag']] : null,
                ]), [
                    'message' => trim('Tour request'
                        . ($tourRequest->selected_date ? ' for ' . $tourRequest->selected_date : '')
                        . ($tourRequest->selected_time ? ' at ' . $tourRequest->selected_time : '')
                        . ($tourRequest->message ? ' — ' . $tourRequest->message : '')),
                    'property' => $context['property'],
                    'pageUrl' => $request->headers->get('referer'),
                ]);

                $this->createFubAppointment($fub, $tourRequest, $fubPerson['id'] ?? null);
            } catch (\Throwable $e) {
                Log::warning('Follow Up Boss tour reporting failed', ['error' => $e->getMessage()]);
            }

            // TODO: Send email notifications to admin and user
            // $this->sendAdminNotification($tourRequest);
            // $this->sendUserConfirmation($tourRequest);

            return response()->json([
                'success' => true,
                'message' => 'Tour request submitted successfully. We will contact you shortly!',
                'data' => [
                    'id' => $tourRequest->id,
                    'status' => $tourRequest->status
                ]
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error creating tour request', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while submitting your tour request. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Book the requested showing as a FUB appointment so it appears on the
     * lead's Appointments panel and the account calendar. Skipped when the
     * lead push failed (no personId) or the requested slot can't be parsed.
     */
    private function createFubAppointment(\App\Services\FollowUpBossService $fub, TourRequest $tourRequest, ?int $personId): void
    {
        if (!$personId) {
            return;
        }

        $slot = $this->parseTourSlot($tourRequest->selected_date, $tourRequest->selected_time);
        if (!$slot) {
            Log::warning('Tour request slot unparseable for FUB appointment', [
                'tour_request_id' => $tourRequest->id,
                'date' => $tourRequest->selected_date,
                'time' => $tourRequest->selected_time,
            ]);

            return;
        }

        $fub->createAppointment(
            'Property showing — ' . ($tourRequest->property_address ?: 'requested listing'),
            $slot['start'],
            $slot['end'],
            [array_filter([
                'personId' => $personId,
                'name' => $tourRequest->full_name,
                'email' => $tourRequest->email,
            ])],
            trim('Requested from the website.' . ($tourRequest->message ? ' Note: ' . $tourRequest->message : '')),
            $tourRequest->property_address
        );
    }

    /**
     * Parse the tour widget's display strings into concrete Toronto-local
     * times: selected_date "TUE, JUL 21" (weekday prefix, no year) and
     * selected_time "12PM to 4PM" (a slot range; the appointment spans it).
     * A date with no year that already passed rolls into next year. Returns
     * null when no usable date exists.
     *
     * @return array{start: \Carbon\Carbon, end: \Carbon\Carbon}|null
     */
    private function parseTourSlot(?string $date, ?string $time): ?array
    {
        if (empty($date)) {
            return null;
        }

        $timezone = 'America/Toronto';

        try {
            $day = \Carbon\Carbon::parse(trim(preg_replace('/^[A-Za-z]{3,9},\s*/', '', $date)), $timezone);
        } catch (\Throwable $e) {
            return null;
        }

        if ($day->lt(now($timezone)->subDay())) {
            $day->addYear();
        }

        $range = preg_split('/\s+to\s+/i', trim((string) $time)) ?: [];

        try {
            $start = \Carbon\Carbon::parse($day->format('Y-m-d') . ' ' . trim($range[0] ?? '9AM'), $timezone);
            $end = isset($range[1])
                ? \Carbon\Carbon::parse($day->format('Y-m-d') . ' ' . trim($range[1]), $timezone)
                : $start->copy()->addHour();
        } catch (\Throwable $e) {
            return null;
        }

        return $start->lt($end) ? ['start' => $start, 'end' => $end] : null;
    }

    /**
     * Get all tour requests (for admin panel)
     */
    public function index(Request $request)
    {
        try {
            $query = TourRequest::query();

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->input('status'));
            }

            // Filter by property
            if ($request->has('property_id')) {
                $query->where('property_id', $request->input('property_id'));
            }

            // Sort by newest first
            $query->orderBy('created_at', 'desc');

            // Paginate results
            $tourRequests = $query->paginate($request->input('per_page', 20));

            return response()->json([
                'success' => true,
                'data' => $tourRequests
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching tour requests', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error fetching tour requests'
            ], 500);
        }
    }

    /**
     * Update tour request status (for admin)
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $tourRequest = TourRequest::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'status' => 'required|in:pending,contacted,completed,cancelled',
                'admin_notes' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $tourRequest->update([
                'status' => $request->input('status'),
                'admin_notes' => $request->input('admin_notes', $tourRequest->admin_notes)
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Tour request status updated successfully',
                'data' => $tourRequest
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating tour request status', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error updating tour request status'
            ], 500);
        }
    }
}
