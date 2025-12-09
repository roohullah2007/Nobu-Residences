<?php

namespace App\Http\Controllers;

use App\Models\ContactForm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ContactController extends Controller
{
    /**
     * Handle contact form submission
     */
    public function store(Request $request)
    {
        try {
            Log::info('Contact form submission received', ['data' => $request->all()]);

            // Check which format is being used (legacy with inquiry_categories array or new with inquiry_type)
            $hasInquiryCategories = $request->has('inquiry_categories') && is_array($request->inquiry_categories);

            if ($hasInquiryCategories) {
                // Legacy format: inquiry_categories as array
                $validated = $request->validate([
                    'name' => 'required|string|max:255',
                    'email' => 'required|email|max:255',
                    'phone' => 'nullable|string|max:20',
                    'message' => 'nullable|string|max:5000',
                    'inquiry_categories' => 'required|array|min:1|max:2',
                    'inquiry_categories.*' => 'in:buyer,seller,renter,other'
                ], [
                    'name.required' => 'Please enter your name.',
                    'email.required' => 'Please enter your email address.',
                    'email.email' => 'Please enter a valid email address.',
                    'inquiry_categories.required' => 'Please select at least one category.',
                    'inquiry_categories.max' => 'Please select a maximum of 2 categories.'
                ]);

                // Convert categories array to comma-separated string for storage
                $validated['inquiry_categories'] = implode(',', $validated['inquiry_categories']);
            } else {
                // New format: inquiry_type as string
                $validated = $request->validate([
                    'name' => 'required|string|max:255',
                    'email' => 'required|email|max:255',
                    'phone' => 'nullable|string|max:20',
                    'subject' => 'nullable|string|max:255',
                    'message' => 'nullable|string|max:5000',
                    'inquiry_type' => 'nullable|string|max:50',
                ], [
                    'name.required' => 'Please enter your name.',
                    'email.required' => 'Please enter your email address.',
                    'email.email' => 'Please enter a valid email address.',
                ]);

                // Map inquiry_type to inquiry_categories format
                $inquiryType = $validated['inquiry_type'] ?? 'general';
                unset($validated['inquiry_type']);
                unset($validated['subject']); // Subject is not stored in DB, include in message if present

                // Map frontend inquiry types to backend categories
                $typeMap = [
                    'general' => 'other',
                    'viewing' => 'buyer',
                    'rental' => 'renter',
                    'purchase' => 'buyer',
                    'support' => 'other',
                ];
                $validated['inquiry_categories'] = $typeMap[$inquiryType] ?? 'other';

                // Prepend subject to message if provided
                if ($request->subject) {
                    $validated['message'] = "[Subject: {$request->subject}]\n\n" . ($validated['message'] ?? '');
                }
            }

            // Add user ID if authenticated
            if (Auth::check()) {
                $validated['user_id'] = Auth::id();
            }

            // Add tracking information
            $validated['ip_address'] = $request->ip();
            $validated['user_agent'] = $request->userAgent();
            $validated['submitted_at'] = now();

            // Create the contact record
            $contact = ContactForm::create($validated);

            Log::info('Contact form saved successfully', [
                'contact_id' => $contact->id,
                'name' => $contact->name,
                'email' => $contact->email
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Thank you for your inquiry! We will contact you within 24 hours.',
                'contact_id' => $contact->id
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Contact form validation failed', ['errors' => $e->errors()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Please check your input and try again.',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Contact form submission failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Sorry, there was an error submitting your inquiry. Please try again or contact us directly.'
            ], 500);
        }
    }
}
