<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PropertyQuestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class PropertyQuestionController extends Controller
{
    /**
     * Store a new property question
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'question' => 'required|string|max:1000',
            'property_listing_key' => 'nullable|string|max:255',
            'property_address' => 'nullable|string|max:255',
            'property_type' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $questionData = $validator->validated();

            // Add user_id if user is authenticated
            if (Auth::check()) {
                $questionData['user_id'] = Auth::id();
            }

            $question = PropertyQuestion::create($questionData);

            return response()->json([
                'success' => true,
                'message' => 'Your question has been submitted successfully. Our agent will get back to you within 24 hours.',
                'data' => $question
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit question. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all questions for admin
     */
    public function index(Request $request)
    {
        $query = PropertyQuestion::with('user')
            ->orderBy('created_at', 'desc');

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('property_address', 'like', "%{$search}%")
                  ->orWhere('question', 'like', "%{$search}%");
            });
        }

        $questions = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $questions
        ]);
    }

    /**
     * Update question status
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:new,contacted,resolved',
            'admin_notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $question = PropertyQuestion::findOrFail($id);

            $updateData = ['status' => $request->status];

            if ($request->has('admin_notes')) {
                $updateData['admin_notes'] = $request->admin_notes;
            }

            if ($request->status === 'contacted' && !$question->contacted_at) {
                $updateData['contacted_at'] = now();
            }

            $question->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Question status updated successfully',
                'data' => $question
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update question status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a question
     */
    public function destroy($id)
    {
        try {
            $question = PropertyQuestion::findOrFail($id);
            $question->delete();

            return response()->json([
                'success' => true,
                'message' => 'Question deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete question',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}