<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactForm;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    /**
     * Display a listing of contact form submissions
     */
    public function index(Request $request): Response
    {
        $query = ContactForm::with('user')->latest();

        // Apply filters
        if ($request->has('status')) {
            if ($request->status === 'unread') {
                $query->unread();
            } elseif ($request->status === 'read') {
                $query->where('is_read', true);
            }
        }

        if ($request->has('category') && $request->category !== 'all') {
            $query->where('inquiry_categories', 'like', '%' . $request->category . '%');
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('email', 'like', '%' . $search . '%')
                  ->orWhere('phone', 'like', '%' . $search . '%')
                  ->orWhere('message', 'like', '%' . $search . '%');
            });
        }

        $contacts = $query->paginate(20)->withQueryString();

        // Add formatted data for each contact
        $contacts->getCollection()->transform(function ($contact) {
            return [
                'id' => $contact->id,
                'name' => $contact->name,
                'email' => $contact->email,
                'phone' => $contact->phone,
                'message' => $contact->message,
                'inquiry_categories' => $contact->inquiry_categories,
                'formatted_categories' => $contact->formatted_categories,
                'categories_array' => $contact->inquiry_categories_array,
                'is_read' => $contact->is_read,
                'submitted_at' => $contact->submitted_at,
                'time_ago' => $contact->time_ago,
                'created_at' => $contact->created_at,
                'user' => $contact->user ? [
                    'id' => $contact->user->id,
                    'name' => $contact->user->name,
                    'email' => $contact->user->email,
                ] : null,
            ];
        });

        $stats = [
            'total' => ContactForm::count(),
            'unread' => ContactForm::unread()->count(),
            'today' => ContactForm::whereDate('created_at', today())->count(),
            'this_week' => ContactForm::recent(7)->count(),
        ];

        return Inertia::render('Admin/Contacts/Index', [
            'title' => 'Contact Form Submissions',
            'contacts' => $contacts,
            'stats' => $stats,
            'filters' => [
                'status' => $request->status ?? 'all',
                'category' => $request->category ?? 'all',
                'search' => $request->search ?? '',
            ],
            'categories' => [
                'all' => 'All Categories',
                'buyer' => 'Buyer',
                'seller' => 'Seller',
                'renter' => 'Renter',
                'other' => 'Other',
            ],
        ]);
    }

    /**
     * Display the specified contact form submission
     */
    public function show(ContactForm $contact): Response
    {
        $contact->load('user');

        // Mark as read when viewed
        if (!$contact->is_read) {
            $contact->markAsRead();
        }

        return Inertia::render('Admin/Contacts/Show', [
            'title' => 'Contact Details - ' . $contact->name,
            'contact' => [
                'id' => $contact->id,
                'name' => $contact->name,
                'email' => $contact->email,
                'phone' => $contact->phone,
                'message' => $contact->message,
                'inquiry_categories' => $contact->inquiry_categories,
                'formatted_categories' => $contact->formatted_categories,
                'categories_array' => $contact->inquiry_categories_array,
                'is_read' => $contact->is_read,
                'ip_address' => $contact->ip_address,
                'user_agent' => $contact->user_agent,
                'submitted_at' => $contact->submitted_at,
                'time_ago' => $contact->time_ago,
                'created_at' => $contact->created_at,
                'updated_at' => $contact->updated_at,
                'user' => $contact->user ? [
                    'id' => $contact->user->id,
                    'name' => $contact->user->name,
                    'email' => $contact->user->email,
                ] : null,
            ],
        ]);
    }

    /**
     * Mark a contact as read
     */
    public function markAsRead(ContactForm $contact)
    {
        $contact->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'Contact marked as read.'
        ]);
    }

    /**
     * Remove the specified contact form submission
     */
    public function destroy(ContactForm $contact)
    {
        $contact->delete();

        return redirect()->route('admin.contacts.index')
            ->with('success', 'Contact form submission deleted successfully.');
    }

    /**
     * Handle bulk actions on contact form submissions
     */
    public function bulkActions(Request $request)
    {
        $request->validate([
            'action' => 'required|in:mark_read,mark_unread,delete',
            'contacts' => 'required|array',
            'contacts.*' => 'exists:contact_forms,id'
        ]);

        $contactIds = $request->contacts;
        $action = $request->action;

        switch ($action) {
            case 'mark_read':
                ContactForm::whereIn('id', $contactIds)->update(['is_read' => true]);
                $message = 'Selected contacts marked as read.';
                break;

            case 'mark_unread':
                ContactForm::whereIn('id', $contactIds)->update(['is_read' => false]);
                $message = 'Selected contacts marked as unread.';
                break;

            case 'delete':
                ContactForm::whereIn('id', $contactIds)->delete();
                $message = 'Selected contacts deleted successfully.';
                break;
        }

        return response()->json([
            'success' => true,
            'message' => $message
        ]);
    }
}
