<?php

namespace App\Http\Controllers;

use App\Models\PropertyEnquiry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;
use App\Mail\PropertyEnquiryMail;

class PropertyEnquiryController extends Controller
{
    /**
     * Handle property enquiry submission
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'message' => 'required|string|max:1000',
            'property_listing_key' => 'nullable|string',
            'property_address' => 'nullable|string',
            'property_price' => 'nullable|numeric',
            'property_type' => 'nullable|string',
            'property_mls' => 'nullable|string',
        ]);

        // Add user ID if authenticated
        if (Auth::check()) {
            $validated['user_id'] = Auth::id();
        }

        // Add IP address for tracking
        $validated['ip_address'] = $request->ip();
        $validated['user_agent'] = $request->userAgent();

        // Create the enquiry record
        $enquiry = PropertyEnquiry::create($validated);

        // Send email notification to admin
        try {
            // You can configure the admin email in env file
            $adminEmail = config('mail.admin_email', 'info@nobu-residences.com');
            
            // If you have a mail class, uncomment this:
            // Mail::to($adminEmail)->send(new PropertyEnquiryMail($enquiry));
            
            // For now, we'll just log it
            \Log::info('Property enquiry received', [
                'enquiry_id' => $enquiry->id,
                'property' => $enquiry->property_address,
                'from' => $enquiry->email
            ]);
        } catch (\Exception $e) {
            // Log error but don't fail the request
            \Log::error('Failed to send enquiry email', ['error' => $e->getMessage()]);
        }

        return back()->with('success', 'Your enquiry has been sent successfully. We will contact you soon.');
    }

    /**
     * Handle "Contact Agent about <Building>" modal submissions.
     * Posted from resources/js/Website/Components/ContactAgentModal.jsx.
     * Maps the modal's `question` field to the model's `message` column and
     * tolerates an optional message (the modal labels it "Message (Optional)").
     */
    public function agentEnquiry(Request $request)
    {
        $request->merge([
            'message' => $request->input('message', $request->input('question')),
        ]);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'message' => 'nullable|string|max:2000',
            'property_listing_key' => 'nullable|string',
            'property_address' => 'nullable|string',
            'building_name' => 'nullable|string',
            'agent_id' => 'nullable',
            'agent_name' => 'nullable|string',
        ]);

        if (empty($validated['property_address']) && !empty($validated['building_name'])) {
            $validated['property_address'] = $validated['building_name'];
        }

        $payload = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'message' => $validated['message'] ?? '',
            'property_listing_key' => $validated['property_listing_key'] ?? null,
            'property_address' => $validated['property_address'] ?? null,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ];

        if (Auth::check()) {
            $payload['user_id'] = Auth::id();
        }

        $enquiry = PropertyEnquiry::create($payload);

        try {
            \Log::info('Agent enquiry received', [
                'enquiry_id' => $enquiry->id,
                'building' => $validated['building_name'] ?? null,
                'agent_id' => $validated['agent_id'] ?? null,
                'from' => $enquiry->email,
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to log agent enquiry', ['error' => $e->getMessage()]);
        }

        return back()->with('success', 'Your message has been sent. The agent will be in touch shortly.');
    }

    /**
     * Display list of enquiries (admin only)
     */
    public function index(Request $request)
    {
        // This should be protected by admin middleware
        $enquiries = PropertyEnquiry::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('admin.enquiries.index', compact('enquiries'));
    }

    /**
     * Mark enquiry as read
     */
    public function markAsRead($id)
    {
        $enquiry = PropertyEnquiry::findOrFail($id);
        $enquiry->update(['is_read' => true]);

        return back()->with('success', 'Enquiry marked as read');
    }

    /**
     * Delete enquiry
     */
    public function destroy($id)
    {
        $enquiry = PropertyEnquiry::findOrFail($id);
        $enquiry->delete();

        return back()->with('success', 'Enquiry deleted successfully');
    }
}