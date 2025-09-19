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
