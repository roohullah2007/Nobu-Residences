<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PropertyQuestion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PropertyQuestionController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/PropertyQuestions/Index');
    }

    public function data(Request $request)
    {
        $query = PropertyQuestion::with('user')
            ->orderBy('created_at', 'desc');

        // Filter by status if provided
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        // Search functionality
        if ($request->has('search') && $request->search !== '') {
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

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:new,contacted,resolved',
            'admin_notes' => 'nullable|string'
        ]);

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

    public function export()
    {
        $questions = PropertyQuestion::with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        $csvFileName = 'property_questions_' . date('Y-m-d_H-i-s') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $csvFileName . '"',
        ];

        $callback = function() use ($questions) {
            $file = fopen('php://output', 'w');

            // Add CSV headers
            fputcsv($file, [
                'ID',
                'Date',
                'Name',
                'Email',
                'Phone',
                'Question',
                'Property Address',
                'Property Type',
                'MLS Number',
                'Status',
                'Admin Notes',
                'Contacted At'
            ]);

            foreach ($questions as $question) {
                fputcsv($file, [
                    $question->id,
                    $question->created_at->format('Y-m-d H:i:s'),
                    $question->name,
                    $question->email,
                    $question->phone,
                    $question->question,
                    $question->property_address,
                    $question->property_type,
                    $question->property_listing_key,
                    $question->status,
                    $question->admin_notes,
                    $question->contacted_at ? $question->contacted_at->format('Y-m-d H:i:s') : ''
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}