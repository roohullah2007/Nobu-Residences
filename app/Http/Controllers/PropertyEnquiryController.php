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